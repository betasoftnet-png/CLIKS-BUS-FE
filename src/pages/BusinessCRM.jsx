import React, { useState } from 'react';
import { 
    UserPlus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Building2,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Briefcase,
    Globe,
    IndianRupee,
    User,
    Plus,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    Share2,
    Download,
    BarChart3,
    Calendar,
    Send,
    Tag,
    AlertTriangle,
    Percent
} from 'lucide-react';
import '../App.css';

const BusinessCRM = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'ledger', 'reports'

    const [paymentData, setPaymentData] = useState({
        amount: 0,
        mode: 'Cash',
        type: 'Payment In', // Payment In (from Customer), Payment Out (to Supplier)
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [formData, setFormData] = useState(() => ({ 
        customer_code: `CUST-${Date.now().toString().slice(-4)}`,
        name: '', 
        business_name: '', 
        contact_person: '',
        email: '', 
        phone_number: '', 
        alternate_phone: '',
        website: '',
        customer_type: 'wholesale', // wholesale / retail
        gstin: '',
        pan_number: '',
        tax_type: 'registered', // registered / unregistered
        place_of_supply: 'Delhi',
        status: 'active', 
        credit_limit: 50000,
        opening_balance: 0,
        current_balance: 0,
        due_days: 30, // payment terms
        billing_address: '',
        shipping_address: '',
        city: '',
        state: 'Delhi',
        pincode: '',
        notes: '',
        reminder_enabled: true,
        preferred_contact: 'WhatsApp'
    }));

    // Realistic Pre-populated Customer Master
    const [customers, setCustomers] = useState([
        {
            id: 'C-001',
            customer_code: 'CUST-9011',
            name: 'Rajesh Gupta',
            business_name: 'Gupta Groceries & Wholesale',
            contact_person: 'Rajesh Gupta',
            phone_number: '9876543210',
            alternate_phone: '9876543211',
            email: 'rajesh@guptagroceries.com',
            website: 'www.guptagroceries.com',
            customer_type: 'wholesale',
            gstin: '07AAAAA1111A1Z1',
            pan_number: 'ABCDE1234F',
            tax_type: 'registered',
            place_of_supply: 'Delhi',
            status: 'active',
            opening_balance: 10000,
            current_balance: 45000,
            credit_limit: 50000,
            due_days: 15,
            billing_address: 'G-24 Main Road, Chandni Chowk',
            shipping_address: 'Warehouse Area 4, Narela Industrial Area',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110006',
            notes: 'High volume wholesale buyer. Prefers UPI payment.',
            reminder_enabled: true,
            preferred_contact: 'WhatsApp',
            total_sales: 125000,
            total_paid: 80000,
            ledger: [
                { id: 'L-101', date: '2026-04-10', type: 'Opening Balance', reference: 'Opening Set', debit: 10000, credit: 0, balance: 10000 },
                { id: 'L-102', date: '2026-04-15', type: 'Invoice #INV-201', reference: 'Sales Bill #201', debit: 75000, credit: 0, balance: 85000 },
                { id: 'L-103', date: '2026-04-20', type: 'Payment In', reference: 'UPI - HDFC Bank', debit: 0, credit: 50000, balance: 35000 },
                { id: 'L-104', date: '2026-05-02', type: 'Invoice #INV-244', reference: 'Sales Bill #244', debit: 40000, credit: 0, balance: 75000 },
                { id: 'L-105', date: '2026-05-05', type: 'Payment In', reference: 'Cash Received', debit: 0, credit: 30000, balance: 45000 }
            ]
        },
        {
            id: 'C-002',
            customer_code: 'CUST-4022',
            name: 'Anil Mehta',
            business_name: 'Mehta Electronics & Mobiles',
            contact_person: 'Anil Mehta',
            phone_number: '8765432109',
            alternate_phone: '',
            email: 'info@mehtaelectronics.com',
            website: '',
            customer_type: 'retail',
            gstin: '27BBBBB2222B2Z2',
            pan_number: 'FGHIJ5678K',
            tax_type: 'registered',
            place_of_supply: 'Maharashtra',
            status: 'active',
            opening_balance: 0,
            current_balance: 16500,
            credit_limit: 15000, // Exceeded! (current 16500 > limit 15000)
            due_days: 10,
            billing_address: 'Shop No 14, Sector 17, Vashi',
            shipping_address: 'Shop No 14, Sector 17, Vashi',
            city: 'Navi Mumbai',
            state: 'Maharashtra',
            pincode: '400703',
            notes: 'Requires frequent reminders for outstanding payments.',
            reminder_enabled: true,
            preferred_contact: 'SMS',
            total_sales: 45000,
            total_paid: 28500,
            ledger: [
                { id: 'L-201', date: '2026-04-25', type: 'Invoice #INV-208', reference: 'Sales Bill #208', debit: 25000, credit: 0, balance: 25000 },
                { id: 'L-202', date: '2026-04-28', type: 'Payment In', reference: 'UPI Payment', debit: 0, credit: 25000, balance: 0 },
                { id: 'L-203', date: '2026-05-04', type: 'Invoice #INV-290', reference: 'Sales Bill #290', debit: 20000, credit: 0, balance: 20000 },
                { id: 'L-204', date: '2026-05-05', type: 'Payment In', reference: 'Cash Received', debit: 0, credit: 3500, balance: 16500 }
            ]
        },
        {
            id: 'C-003',
            customer_code: 'CUST-8033',
            name: 'Vikram Sunder',
            business_name: 'Sunder Agency Distributors',
            contact_person: 'Vikram Sunder',
            phone_number: '7654321098',
            alternate_phone: '',
            email: 'contact@sunderagency.com',
            website: 'www.sunderagency.com',
            customer_type: 'wholesale',
            gstin: '',
            pan_number: '',
            tax_type: 'unregistered',
            place_of_supply: 'Punjab',
            status: 'active',
            opening_balance: 0,
            current_balance: -8000, // Negative outstanding means Advance Paid!
            credit_limit: 100000,
            due_days: 45,
            billing_address: 'Railway Road, Jalandhar',
            shipping_address: 'Railway Road, Jalandhar',
            city: 'Jalandhar',
            state: 'Punjab',
            pincode: '144001',
            notes: 'Very prompt payment history. Loyal wholesale client.',
            reminder_enabled: false,
            preferred_contact: 'WhatsApp',
            total_sales: 62000,
            total_paid: 70000,
            ledger: [
                { id: 'L-301', date: '2026-05-01', type: 'Invoice #INV-221', reference: 'Sales Bill #221', debit: 62000, credit: 0, balance: 62000 },
                { id: 'L-302', date: '2026-05-02', type: 'Payment In', reference: 'Bank Transfer - Advance', debit: 0, credit: 70000, balance: -8000 }
            ]
        }
    ]);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ 
            customer_code: `CUST-${Date.now().toString().slice(-4)}`,
            name: '', 
            business_name: '', 
            contact_person: '',
            email: '', 
            phone_number: '', 
            alternate_phone: '',
            website: '',
            customer_type: 'wholesale',
            gstin: '',
            pan_number: '',
            tax_type: 'registered',
            place_of_supply: 'Delhi',
            status: 'active', 
            credit_limit: 50000,
            opening_balance: 0,
            current_balance: 0,
            due_days: 30,
            billing_address: '',
            shipping_address: '',
            city: '',
            state: 'Delhi',
            pincode: '',
            notes: '',
            reminder_enabled: true,
            preferred_contact: 'WhatsApp'
        });
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData(customer);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer? All historical ledgers will be permanently removed.')) {
            setCustomers(customers.filter(c => c.id !== id));
            if (selectedParty && selectedParty.id === id) {
                setSelectedParty(null);
            }
            alert('Customer record deleted successfully.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            setCustomers(customers.map(c => c.id === editingCustomer.id ? { 
                ...formData, 
                current_balance: parseFloat(formData.current_balance) || 0 
            } : c));
            alert('Customer Profile updated successfully!');
        } else {
            const newCust = {
                ...formData,
                id: `C-${Date.now().toString().slice(-3)}`,
                current_balance: parseFloat(formData.opening_balance) || 0,
                total_sales: parseFloat(formData.opening_balance) || 0,
                total_paid: 0,
                ledger: [
                    { 
                        id: `L-${Date.now().toString().slice(-3)}`, 
                        date: new Date().toISOString().split('T')[0], 
                        type: 'Opening Balance', 
                        reference: 'Initial Balance Set', 
                        debit: parseFloat(formData.opening_balance) || 0, 
                        credit: 0, 
                        balance: parseFloat(formData.opening_balance) || 0 
                    }
                ]
            };
            setCustomers([...customers, newCust]);
            alert('New Customer Registered successfully!');
        }
        closeModal();
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        const amt = parseFloat(paymentData.amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }


        const updatedLedger = [...(selectedParty.ledger || [])];
        const lastBalance = updatedLedger.length > 0 ? updatedLedger[updatedLedger.length - 1].balance : 0;
        const newBalance = lastBalance - amt;

        const newEntry = {
            id: `L-${Date.now().toString().slice(-3)}`,
            date: paymentData.date,
            type: paymentData.type,
            reference: `${paymentData.mode} - ${paymentData.notes || 'No remarks'}`,
            debit: 0,
            credit: amt,
            balance: newBalance
        };

        updatedLedger.push(newEntry);

        const updatedCustomers = customers.map(c => {
            if (c.id === selectedParty.id) {
                return {
                    ...c,
                    current_balance: newBalance,
                    total_paid: (c.total_paid || 0) + amt,
                    ledger: updatedLedger
                };
            }
            return c;
        });

        setCustomers(updatedCustomers);
        setSelectedParty({
            ...selectedParty,
            current_balance: newBalance,
            total_paid: (selectedParty.total_paid || 0) + amt,
            ledger: updatedLedger
        });

        setIsPaymentModalOpen(false);
        setPaymentData({ amount: 0, mode: 'Cash', type: 'Payment In', date: new Date().toISOString().split('T')[0], notes: '' });
        alert('Payment recorded and Customer balance auto-updated successfully!');
    };

    const handleShareLedger = (party) => {
        const message = `Hello ${party.name},\n\nPlease find your statement summary from ${party.business_name || 'Gupta Groceries'}:\n\n*Opening Balance:* ₹${party.opening_balance || 0}\n*Total Outstanding:* ₹${party.current_balance || 0}\n*Payment Terms:* ${party.due_days} Days\n\nPlease settle your outstanding dues. Thank you,\nCLIKS BUSINESS.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const filteredCustomers = customers.filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reports Computations
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.current_balance > 0 ? c.current_balance : 0), 0);
    const totalAdvance = Math.abs(customers.reduce((sum, c) => sum + (c.current_balance < 0 ? c.current_balance : 0), 0));
    const collectionEfficiency = customers.reduce((sum, c) => sum + (c.total_sales || 0), 0) > 0 
        ? Math.round((customers.reduce((sum, c) => sum + (c.total_paid || 0), 0) / customers.reduce((sum, c) => sum + (c.total_sales || 0), 0)) * 100)
        : 100;

    // Aging Report buckets
    const agingBuckets = {
        bucket30: customers.filter(c => c.current_balance > 0 && c.due_days <= 15).reduce((sum, c) => sum + c.current_balance, 0),
        bucket60: customers.filter(c => c.current_balance > 0 && c.due_days > 15 && c.due_days <= 30).reduce((sum, c) => sum + c.current_balance, 0),
        bucket90: customers.filter(c => c.current_balance > 0 && c.due_days > 30).reduce((sum, c) => sum + c.current_balance, 0),
    };

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} onClick={() => setActiveMenu(null)}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <UserPlus size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Customers & Udhaar Ledger</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage customer profiles, credit limits, record payments, and export transaction statements.</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); closeModal(); setIsModalOpen(true); }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            {/* Stats Summary Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Active Customers', value: customers.length, icon: User, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Total Outstanding (Receivables)', value: `₹${totalOutstanding.toLocaleString()}`, icon: AlertCircle, color: '#B91C1C', bg: '#FEF2F2' },
                    { label: 'Advance Received', value: `₹${totalAdvance.toLocaleString()}`, icon: Clock, color: '#0369A1', bg: '#F0F9FF' },
                    { label: 'Collection Efficiency', value: `${collectionEfficiency}%`, icon: Percent, color: '#15803D', bg: '#F0FDF4' }
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

            {/* Tab Switcher */}
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
                    <User size={18} /> Customers List
                </button>
                <button 
                    onClick={() => {
                        if (!selectedParty) {
                            alert('Please view ledger for a specific customer from the Actions list first.');
                            return;
                        }
                        setActiveTab('ledger');
                    }}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'ledger' ? '#064E3B' : 'white', 
                        color: activeTab === 'ledger' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'ledger' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <FileText size={18} /> Running Ledger
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
                    <BarChart3 size={18} /> Aging & Collection Reports 📊
                </button>
            </div>

            {/* Tab 1: Customers Master List */}
            {activeTab === 'list' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search by name, business or phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                            />
                        </div>
                        <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={20} />
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Customer Name</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Business / Contact</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GSTIN / Tax Type</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit Limit</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Outstanding Balance</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((row) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                                    {row.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.95rem' }}>{row.name}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Code: {row.customer_code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{row.business_name || 'Personal'}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{row.phone_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{row.gstin || 'Unregistered'}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{row.customer_type.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#475569' }}>₹{row.credit_limit.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: row.current_balance > 0 ? '#B91C1C' : (row.current_balance < 0 ? '#15803D' : '#475569') }}>
                                                {row.current_balance > 0 ? `₹${row.current_balance.toLocaleString()}` : (row.current_balance < 0 ? `- ₹${Math.abs(row.current_balance).toLocaleString()} (Adv)` : '₹0.00')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {row.current_balance > row.credit_limit ? (
                                                <span style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '8px', background: '#FEF2F2', color: '#B91C1C', fontSize: '0.75rem', fontWeight: '800' }}>LIMIT EXCEEDED</span>
                                            ) : (row.current_balance < 0 ? (
                                                <span style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '8px', background: '#F0FDF4', color: '#15803D', fontSize: '0.75rem', fontWeight: '800' }}>ADVANCE IN</span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '8px', background: '#FFFBEB', color: '#B45309', fontSize: '0.75rem', fontWeight: '800' }}>SAFE CREDIT</span>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right', position: 'relative' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === row.id ? null : row.id); }}
                                                style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                            {activeMenu === row.id && (
                                                <div style={{ position: 'absolute', right: '2rem', top: '3.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, width: '170px', overflow: 'hidden' }}>
                                                    <button 
                                                        onClick={() => { setSelectedParty(row); setActiveTab('ledger'); setActiveMenu(null); }}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#1B6B3A', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                    >
                                                        <FileText size={14} /> View Ledger
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedParty(row); setIsPaymentModalOpen(true); setActiveMenu(null); }}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#0D9488', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderTop: '1px solid #F1F5F9' }}
                                                    >
                                                        <IndianRupee size={14} /> Record Payment
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(row)}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderTop: '1px solid #F1F5F9' }}
                                                    >
                                                        <Edit2 size={14} /> Edit Profile
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(row.id)}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderTop: '1px solid #F1F5F9' }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Running Ledger */}
            {activeTab === 'ledger' && selectedParty && (
                <div style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>{selectedParty.name}</h2>
                            <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '600' }}>Statement of Account — {selectedParty.business_name || 'Personal'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer' }}><Download size={18} /> Export PDF</button>
                            <button onClick={() => handleShareLedger(selectedParty)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', border: '1px solid #DCF2E4', background: '#F0FDF4', color: '#1B6B3A', fontWeight: '700', cursor: 'pointer' }}><Share2 size={18} /> Share WhatsApp</button>
                        </div>
                    </div>

                    {/* Ledger summary boxes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem' }}>OPENING BALANCE</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E293B' }}>₹{selectedParty.opening_balance.toLocaleString()}</h3>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#B91C1C', marginBottom: '0.5rem' }}>TOTAL CREDIT GIVEN (DEBIT)</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#B91C1C' }}>₹{selectedParty.total_sales?.toLocaleString() || 0}</h3>
                        </div>
                        <div style={{ padding: '1.5rem', background: selectedParty.current_balance > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '800', color: selectedParty.current_balance > 0 ? '#B91C1C' : '#15803D', marginBottom: '0.5rem' }}>NET OUTSTANDING BALANCE</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: selectedParty.current_balance > 0 ? '#B91C1C' : '#15803D' }}>
                                {selectedParty.current_balance > 0 ? `₹${selectedParty.current_balance.toLocaleString()}` : (selectedParty.current_balance < 0 ? `- ₹${Math.abs(selectedParty.current_balance).toLocaleString()} (Adv)` : '₹0.00')}
                            </h3>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Transaction Type</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Details / Reference</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Debit (Invoice/Out)</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Credit (Payment/In)</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Running Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedParty.ledger || []).map((tx, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '1.25rem', fontSize: '0.9rem', fontWeight: '600' }}>{tx.date}</td>
                                        <td style={{ padding: '1.25rem', fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{tx.type}</td>
                                        <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>{tx.reference}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>{tx.debit > 0 ? `₹${tx.debit.toLocaleString()}` : '-'}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '800', color: '#15803D' }}>{tx.credit > 0 ? `₹${tx.credit.toLocaleString()}` : '-'}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '900', color: tx.balance > 0 ? '#B91C1C' : '#15803D' }}>₹{tx.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Outstanding Aging & Collection Reports */}
            {activeTab === 'reports' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Column - Outstanding & Aging Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Outstanding Receivables list */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <AlertTriangle size={20} color="#B91C1C" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Outstanding Receivables Ledger</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {customers.filter(c => c.current_balance > 0).map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF2F2', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #FEE2E2' }}>
                                        <div>
                                            <p style={{ fontWeight: '750', color: '#991B1B', fontSize: '0.95rem' }}>{c.name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.business_name} | Term: {c.due_days} Days</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '850', color: '#B91C1C', fontSize: '1.05rem' }}>₹{c.current_balance.toLocaleString()}</p>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: c.current_balance > c.credit_limit ? '#EF4444' : '#B45309' }}>
                                                {c.current_balance > c.credit_limit ? 'OVER CREDIT LIMIT' : 'CREDIT ACTIVE'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Aging Analysis Report */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <Clock size={20} color="#0D9488" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Outstanding Aging Reports</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                {[
                                    { bucket: '0 – 30 Days Outstanding', val: agingBuckets.bucket30, color: '#15803D', bg: '#F0FDF4' },
                                    { bucket: '31 – 60 Days Overdue', val: agingBuckets.bucket60, color: '#B45309', bg: '#FFFBEB' },
                                    { bucket: '61 – 90+ Days Critical', val: agingBuckets.bucket90, color: '#B91C1C', bg: '#FEF2F2' }
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '1.25rem', background: item.bg, borderRadius: '16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>{item.bucket}</p>
                                        <h4 style={{ fontSize: '1.35rem', fontWeight: '900', color: item.color }}>₹{item.val.toLocaleString()}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Top Customers & Collection Efficiency */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Collection Efficiency */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', width: '100%', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>Collection Efficiency Rate</h3>
                            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
                                <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E2E8F0" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1B6B3A" strokeWidth="10" 
                                            strokeDasharray={314}
                                            strokeDashoffset={314 - (314 * collectionEfficiency) / 100}
                                            strokeLinecap="round" />
                                </svg>
                                <span style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: '900', color: '#064E3B' }}>{collectionEfficiency}%</span>
                            </div>
                            <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Collection efficiency indicates recovered payments out of overall credit sales.</p>
                        </div>

                        {/* Top customer sales trends */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <TrendingUp size={18} color="#1B6B3A" />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>Top Customer Sales Contribution</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {customers.map((cust, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                                            <span style={{ color: '#1E293B' }}>{cust.name}</span>
                                            <span style={{ color: '#064E3B' }}>₹{(cust.total_sales || 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #1B6B3A 0%, #0D9488 100%)', width: `${Math.min(100, ((cust.total_sales || 0) / Math.max(...customers.map(c => c.total_sales || 1))) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {/* Create/Edit Customer Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>{editingCustomer ? 'Edit Customer Profile' : 'New Customer Registration'}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Code: {formData.customer_code}</p>
                            </div>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Basic Customer Profile */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer Name</label>
                                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Rajesh Gupta" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Shop / Business Name</label>
                                    <input type="text" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Gupta Groceries Wholesale" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer Type</label>
                                    <select value={formData.customer_type} onChange={(e) => setFormData({...formData, customer_type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="wholesale">Wholesale</option>
                                        <option value="retail">Retail</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input required type="text" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="9876543210" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Alternate Phone</label>
                                    <input type="text" value={formData.alternate_phone} onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="name@domain.com" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Website</label>
                                    <input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="www.website.com" />
                                </div>
                            </div>

                            {/* Tax details */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GSTIN</label>
                                    <input type="text" value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="07AAAAA1111A1Z1" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PAN Number</label>
                                    <input type="text" value={formData.pan_number} onChange={(e) => setFormData({...formData, pan_number: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="ABCDE1234F" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tax Type</label>
                                    <select value={formData.tax_type} onChange={(e) => setFormData({...formData, tax_type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="registered">Registered Business</option>
                                        <option value="unregistered">Unregistered Consumer</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Place of Supply</label>
                                    <input type="text" value={formData.place_of_supply} onChange={(e) => setFormData({...formData, place_of_supply: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="State" />
                                </div>
                            </div>

                            {/* Addresses */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Billing Address</label>
                                    <textarea value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                    <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} />
                                </div>
                            </div>

                            {/* Financial Credit Controls */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Opening Balance (₹)</label>
                                    <input type="number" value={formData.opening_balance} onChange={(e) => setFormData({...formData, opening_balance: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Credit Limit (₹)</label>
                                    <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Due Days (Terms)</label>
                                    <input type="number" value={formData.due_days} onChange={(e) => setFormData({...formData, due_days: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Preferred Reminder</label>
                                    <select value={formData.preferred_contact} onChange={(e) => setFormData({...formData, preferred_contact: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }}>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                        <option value="Email">Email</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                {editingCustomer ? 'Update Customer' : 'Register Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Transaction Modal */}
            {isPaymentModalOpen && selectedParty && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Customer Payment</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Party: {selectedParty.name}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment Type</label>
                                    <select value={paymentData.type} onChange={e => setPaymentData({...paymentData, type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Payment In">Payment In (You Got)</option>
                                        <option value="Payment Out">Payment Out (You Gave)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date</label>
                                    <input required type="date" value={paymentData.date} onChange={e => setPaymentData({...paymentData, date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amount Received (₹)</label>
                                <input required type="number" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '1.75rem', fontWeight: '900', color: '#064E3B', textAlign: 'center' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment Mode</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Cash', 'UPI', 'Bank'].map(m => (
                                        <button 
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentData({...paymentData, mode: m})}
                                            style={{ 
                                                flex: 1, padding: '0.75rem', borderRadius: '12px', 
                                                border: paymentData.mode === m ? '2px solid #1B6B3A' : '1px solid #E2E8F0',
                                                background: paymentData.mode === m ? '#1B6B3A' : 'white',
                                                color: paymentData.mode === m ? 'white' : '#1B6B3A',
                                                fontWeight: '800', cursor: 'pointer'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Remarks</label>
                                <textarea value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} placeholder="UPI reference or bank txn id..." />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Record Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCRM;
