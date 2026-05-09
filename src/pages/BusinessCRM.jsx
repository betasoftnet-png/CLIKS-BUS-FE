import React, { useState, useEffect } from 'react';
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
import { crmService } from '../services/crmService';

const AVATAR_COLORS = [
    { bg: '#E0F2FE', text: '#0369A1' }, // Sky / Blue
    { bg: '#FCE8E6', text: '#C5221F' }, // Rose / Red
    { bg: '#FEF3C7', text: '#B45309' }, // Amber / Yellow
    { bg: '#F3E8FF', text: '#6B21A8' }, // Purple
    { bg: '#E6F4EA', text: '#137333' }, // Emerald / Green
    { bg: '#ECE9FC', text: '#4F46E5' }, // Indigo
    { bg: '#E0F2F1', text: '#00695C' }, // Teal
];

const getAvatarColors = (name) => {
    const charCode = (name || 'C').charCodeAt(0);
    const index = charCode % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

const BusinessCRM = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedProfileCustomer, setSelectedProfileCustomer] = useState(null);
    const [selectedParty, setSelectedParty] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'reports'
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const res = await crmService.getCustomers();
            if (res && res.success) {
                const mapped = (res.data || []).map(c => ({
                    ...c,
                    current_balance: c.outstanding_balance !== undefined ? c.outstanding_balance : (c.current_balance || 0)
                }));
                setCustomers(mapped);
            }
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? All historical ledgers will be permanently removed.')) {
            try {
                await crmService.deleteCustomer(id);
                if (selectedParty && selectedParty.id === id) {
                    setSelectedParty(null);
                }
                alert('Customer record deleted successfully.');
                loadCustomers();
            } catch (err) {
                console.error(err);
                alert('Failed to delete customer.');
            }
        }
    };

    const viewLedger = async (party) => {
        try {
            const ledgerRes = await crmService.getLedger(party.id);
            const ledgerData = (ledgerRes && ledgerRes.success) ? ledgerRes.data : [];
            
            // Process ledger data to compute running balance and map fields
            const sorted = [...ledgerData].reverse(); // Oldest first
            let running = parseFloat(party.opening_balance) || 0;
            const processed = sorted.map(tx => {
                const type = tx.type || 'credit';
                const amt = parseFloat(tx.amount) || 0;
                const debit = type.toLowerCase() === 'debit' ? amt : 0;
                const credit = type.toLowerCase() === 'credit' ? amt : 0;
                running = running + debit - credit;
                
                let dStr = tx.date || '';
                if (!dStr && tx.created_at) {
                    dStr = tx.created_at.includes('T') ? tx.created_at.split('T')[0] : tx.created_at;
                }
                
                return {
                    ...tx,
                    date: dStr,
                    type: type.toUpperCase(),
                    reference: tx.description || tx.reference || 'N/A',
                    debit: debit,
                    credit: credit,
                    balance: running
                };
            });
            const finalLedger = processed.reverse(); // Newest first

            const totalCreditGiven = finalLedger.reduce((sum, tx) => sum + (tx.debit || 0), 0);
            const netOutstanding = finalLedger.length > 0 ? finalLedger[0].balance : (parseFloat(party.opening_balance) || 0);

            setSelectedParty({
                ...party,
                total_sales: totalCreditGiven,
                current_balance: netOutstanding,
                ledger: finalLedger
            });
            setIsLedgerModalOpen(true);
            setActiveMenu(null);
        } catch (err) {
            console.error('Failed to fetch ledger:', err);
            setSelectedParty({
                ...party,
                current_balance: party.current_balance !== undefined ? party.current_balance : (party.outstanding_balance || 0),
                ledger: []
            });
            setIsLedgerModalOpen(true);
            setActiveMenu(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await crmService.updateCustomer(editingCustomer.id, formData);
                alert('Customer Profile updated successfully!');
            } else {
                await crmService.createCustomer(formData);
                alert('New Customer Registered successfully!');
            }
            closeModal();
            loadCustomers();
        } catch (err) {
            console.error('Failed to save customer:', err);
            alert('Failed to save customer details.');
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const amt = parseFloat(paymentData.amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        try {
            await crmService.createPayment(selectedParty.id, {
                amount: amt,
                payment_method: paymentData.mode,
                reference_number: paymentData.notes,
                type: paymentData.type
            });
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: 0, mode: 'Cash', type: 'Payment In', date: new Date().toISOString().split('T')[0], notes: '' });
            alert('Payment recorded and Customer balance auto-updated successfully!');
            loadCustomers();
            // Reload selected party ledger
            const ledgerRes = await crmService.getLedger(selectedParty.id);
            if (ledgerRes && ledgerRes.success) {
                const ledgerData = ledgerRes.data || [];
                const sorted = [...ledgerData].reverse();
                let running = parseFloat(selectedParty.opening_balance) || 0;
                const processed = sorted.map(tx => {
                    const type = tx.type || 'credit';
                    const amtVal = parseFloat(tx.amount) || 0;
                    const debit = type.toLowerCase() === 'debit' ? amtVal : 0;
                    const credit = type.toLowerCase() === 'credit' ? amtVal : 0;
                    running = running + debit - credit;
                    
                    let dStr = tx.date || '';
                    if (!dStr && tx.created_at) {
                        dStr = tx.created_at.includes('T') ? tx.created_at.split('T')[0] : tx.created_at;
                    }
                    
                    return {
                        ...tx,
                        date: dStr,
                        type: type.toUpperCase(),
                        reference: tx.description || tx.reference || 'N/A',
                        debit: debit,
                        credit: credit,
                        balance: running
                    };
                });
                const finalLedger = processed.reverse();

                const totalCreditGiven = finalLedger.reduce((sum, tx) => sum + (tx.debit || 0), 0);
                const netOutstanding = finalLedger.length > 0 ? finalLedger[0].balance : (parseFloat(selectedParty.opening_balance) || 0);

                setSelectedParty({
                    ...selectedParty,
                    total_sales: totalCreditGiven,
                    current_balance: netOutstanding,
                    ledger: finalLedger
                });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to record payment.');
        }
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
        <div style={{ padding: '1.25rem 2rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} onClick={() => setActiveMenu(null)}>
            <style>{`
                .crm-table-row:hover {
                    background-color: #F8FAFC !important;
                }
                .crm-btn {
                    transition: all 0.2s ease-in-out !important;
                }
                .crm-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 24px rgba(27, 107, 58, 0.3) !important;
                    opacity: 0.95;
                }
                .crm-btn-secondary {
                    transition: all 0.2s ease-in-out !important;
                }
                .crm-btn-secondary:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05) !important;
                    opacity: 0.95;
                }
                .stat-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01) !important;
                    border-color: #CBD5E1 !important;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-track {
                    background: #F1F5F9;
                    border-radius: 10px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 10px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.15)' }}>
                            <UserPlus size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Customers & Udhaar Ledger</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.88rem', fontWeight: '500', margin: 0 }}>Manage customer profiles, credit limits, record payments, and export transaction statements.</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); closeModal(); setIsModalOpen(true); }}
                    className="crm-btn"
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        padding: '0.5rem 1.1rem', borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                        boxShadow: '0 6px 12px rgba(27, 107, 58, 0.15)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={16} />
                    Add Customer
                </button>
            </div>

            {/* Stats Summary Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Customers', value: customers.length, icon: User, color: '#7C3AED', bg: '#F3E8FF' },
                    { label: 'Total Outstanding (Receivables)', value: `₹${(totalOutstanding || 0).toLocaleString()}`, icon: AlertCircle, color: '#B91C1C', bg: '#FEF2F2' },
                    { label: 'Advance Received', value: `₹${(totalAdvance || 0).toLocaleString()}`, icon: Clock, color: '#0369A1', bg: '#F0F9FF' },
                    { label: 'Collection Efficiency', value: `${collectionEfficiency}%`, icon: Percent, color: '#0891B2', bg: '#CFFAFE' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E293B', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button 
                    onClick={() => setActiveTab('list')}
                    className="crm-btn-secondary"
                    style={{ 
                        padding: '0.45rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'list' ? '#D97706' : 'white', 
                        color: activeTab === 'list' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'list' ? '0 4px 8px rgba(217, 119, 6, 0.1)' : 'none'
                    }}
                >
                    <User size={16} /> Customers List
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className="crm-btn-secondary"
                    style={{ 
                        padding: '0.45rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'reports' ? '#0891B2' : 'white', 
                        color: activeTab === 'reports' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'reports' ? '0 4px 8px rgba(8, 145, 178, 0.1)' : 'none'
                    }}
                >
                    <BarChart3 size={16} /> Aging & Collection Reports 📊
                </button>
            </div>

            {/* Tab 1: Customers Master List */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <p style={{ color: '#7C3AED', fontSize: '1rem', fontWeight: '800' }}>Loading Live Customers Ledger...</p>
                </div>
            ) : activeTab === 'list' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', overflow: 'visible' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search by name, business or phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={16} />
                        </button>
                    </div>

                    <div style={{ overflowX: 'visible', overflowY: 'visible', padding: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Customer Name</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Business / Contact</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GSTIN / Tax Type</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit Limit</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Outstanding Balance</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((row) => (
                                    <tr key={row.id} className="crm-table-row" style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => { setSelectedProfileCustomer(row); setIsProfileModalOpen(true); }} title="View Customer Profile">
                                                {(() => {
                                                    const col = getAvatarColors(row.name);
                                                    return (
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col.text, fontWeight: '800', fontSize: '0.9rem', border: `1px solid ${col.text}1F` }}>
                                                            {row.name.charAt(0)}
                                                        </div>
                                                    );
                                                })()}
                                                <div>
                                                    <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.88rem', margin: 0 }}>{row.name}</p>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Code: {row.customer_code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.82rem', margin: 0 }}>{row.business_name || 'Personal'}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{row.phone_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.8rem', margin: 0 }}>{row.gstin || 'Unregistered'}</p>
                                                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{(row.customer_type || 'individual').toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>₹{(row.credit_limit || 0).toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '850', color: (row.current_balance || 0) > 0 ? '#B91C1C' : ((row.current_balance || 0) < 0 ? '#0891B2' : '#475569') }}>
                                                {(row.current_balance || 0) > 0 ? `₹${(row.current_balance || 0).toLocaleString()}` : ((row.current_balance || 0) < 0 ? `- ₹${Math.abs(row.current_balance || 0).toLocaleString()} (Adv)` : '₹0.00')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            {(row.current_balance || 0) > (row.credit_limit || 0) ? (
                                                <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#FEF2F2', color: '#B91C1C', fontSize: '0.7rem', fontWeight: '800' }}>LIMIT EXCEEDED</span>
                                            ) : ((row.current_balance || 0) < 0 ? (
                                                <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#CFFAFE', color: '#0891B2', fontSize: '0.7rem', fontWeight: '800' }}>ADVANCE IN</span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#FFFBEB', color: '#B45309', fontSize: '0.7rem', fontWeight: '800' }}>SAFE CREDIT</span>
                                            ))}
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right', position: 'relative' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); viewLedger(row); }}
                                                    className="crm-btn-secondary"
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                        padding: '0.35rem 0.75rem', borderRadius: '8px', 
                                                        border: '1px solid #E9D5FF', background: '#F3E8FF', color: '#7C3AED', 
                                                        fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    <FileText size={12} /> View Ledger
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === row.id ? null : row.id); }}
                                                    style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>
                                            {activeMenu === row.id && (
                                                <div style={{ position: 'absolute', right: '1rem', top: '2.25rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, width: '170px', overflow: 'hidden' }}>
                                                    <button 
                                                        onClick={() => { viewLedger(row); }}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
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



            {/* Tab 3: Outstanding Aging & Collection Reports */}
            {activeTab === 'reports' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                    
                    {/* Left Column - Outstanding & Aging Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Outstanding Receivables list */}
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <AlertTriangle size={16} color="#B91C1C" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Outstanding Receivables Ledger</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {customers.filter(c => (c.current_balance || 0) > 0).map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF2F2', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
                                        <div>
                                            <p style={{ fontWeight: '750', color: '#991B1B', fontSize: '0.85rem', margin: 0 }}>{c.name}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.business_name || ''} | Term: {c.due_days || 30} Days</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '850', color: '#B91C1C', fontSize: '0.9rem', margin: 0 }}>₹{(c.current_balance || 0).toLocaleString()}</p>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: (c.current_balance || 0) > (c.credit_limit || 0) ? '#EF4444' : '#B45309' }}>
                                                {(c.current_balance || 0) > (c.credit_limit || 0) ? 'OVER CREDIT LIMIT' : 'CREDIT ACTIVE'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Aging Analysis Report */}
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <Clock size={16} color="#0D9488" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Outstanding Aging Reports</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {[
                                    { bucket: '0 – 15 Days', val: agingBuckets.bucket30, color: '#0891B2', bg: '#CFFAFE' },
                                    { bucket: '16 – 30 Days Overdue', val: agingBuckets.bucket60, color: '#B45309', bg: '#FFFBEB' },
                                    { bucket: '31+ Days Critical', val: agingBuckets.bucket90, color: '#B91C1C', bg: '#FEF2F2' }
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '0.75rem', background: item.bg, borderRadius: '10px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem', margin: 0 }}>{item.bucket}</p>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: item.color, margin: 0 }}>₹{(item.val || 0).toLocaleString()}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Top Customers & Collection Efficiency */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Collection Efficiency */}
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.75rem', width: '100%', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem', margin: 0 }}>Collection Efficiency Rate</h3>
                            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
                                <svg style={{ transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
                                    <circle cx="45" cy="45" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                                    <circle cx="45" cy="45" r="38" fill="transparent" stroke="#7C3AED" strokeWidth="8" 
                                            strokeDasharray={238}
                                            strokeDashoffset={238 - (238 * collectionEfficiency) / 100}
                                            strokeLinecap="round" />
                                </svg>
                                <span style={{ position: 'absolute', fontSize: '1.2rem', fontWeight: '900', color: '#7C3AED' }}>{collectionEfficiency}%</span>
                            </div>
                            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.25rem', margin: 0 }}>Collection efficiency indicates recovered payments out of overall credit sales.</p>
                        </div>

                        {/* Top customer sales trends */}
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <TrendingUp size={16} color="#7C3AED" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Top Customer Sales Contribution</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {customers.map((cust, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: '700' }}>
                                            <span style={{ color: '#1E293B' }}>{cust.name}</span>
                                            <span style={{ color: '#7C3AED' }}>₹{(cust.total_sales || 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: '5px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #7C3AED 0%, #0891B2 100%)', width: `${Math.min(100, ((cust.total_sales || 0) / Math.max(...customers.map(c => c.total_sales || 1))) * 100)}%` }}></div>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '32px', padding: '2rem 2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7C3AED', margin: 0 }}>{editingCustomer ? 'Edit Customer Profile' : 'New Customer Registration'}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Code: {formData.customer_code}</p>
                            </div>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div className="ledger-modal-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '0.5rem' }}>
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.5rem' }}>Opening Balance (₹)</label>
                                    <input type="number" value={formData.opening_balance === 0 ? '' : formData.opening_balance} placeholder="0" onChange={(e) => setFormData({...formData, opening_balance: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.5rem' }}>Credit Limit (₹)</label>
                                    <input type="number" value={formData.credit_limit === 0 ? '' : formData.credit_limit} placeholder="50000" onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.5rem' }}>Due Days (Terms)</label>
                                    <input type="number" value={formData.due_days === 0 ? '' : formData.due_days} placeholder="30" onChange={(e) => setFormData({...formData, due_days: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.5rem' }}>Preferred Reminder</label>
                                    <select value={formData.preferred_contact} onChange={(e) => setFormData({...formData, preferred_contact: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }}>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                        <option value="Email">Email</option>
                                    </select>
                                </div>
                            </div>
                            </div>

                            <button type="submit" style={{ flexShrink: 0, width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }}>
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
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#7C3AED' }}>
                                    {paymentData.type === 'Payment In' ? 'Record Customer Payment (Credit / Money In)' : 'Record Customer Payment (Debit / Money Out)'}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Party: {selectedParty.name}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment Type</label>
                                    <select value={paymentData.type} onChange={e => setPaymentData({...paymentData, type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Payment In">Payment In (Credit / Money In)</option>
                                        <option value="Payment Out">Payment Out (Debit / Money Out)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date</label>
                                    <input required type="date" value={paymentData.date} onChange={e => setPaymentData({...paymentData, date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {paymentData.type === 'Payment In' ? 'Amount Received (Credit) (₹)' : 'Amount Paid (Debit) (₹)'}
                                </label>
                                <input required type="number" value={paymentData.amount === 0 ? '' : paymentData.amount} placeholder="0" onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '1.75rem', fontWeight: '900', color: '#7C3AED', textAlign: 'center' }} />
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
                                                border: paymentData.mode === m ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                                                background: paymentData.mode === m ? '#7C3AED' : 'white',
                                                color: paymentData.mode === m ? 'white' : '#7C3AED',
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
                                <textarea value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} placeholder={paymentData.type === 'Payment In' ? "UPI reference or bank txn id..." : "Reference number or reason..."} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }}>
                                Record Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Ledger Modal */}
            {isLedgerModalOpen && selectedParty && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)', padding: '2rem' }} onClick={() => setIsLedgerModalOpen(false)}>
                    <div id="invoice-print-area" style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', animation: 'fadeIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {(() => {
                                    const col = getAvatarColors(selectedParty.name);
                                    return (
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col.text, fontWeight: '800', fontSize: '1.25rem', border: `1px solid ${col.text}1F`, boxShadow: `0 4px 10px ${col.text}15` }}>
                                            {selectedParty.name.charAt(0)}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7C3AED', margin: 0, lineHeight: 1.2 }}>{selectedParty.name}</h2>
                                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '600', margin: '4px 0 0 0' }}>Statement of Account — {selectedParty.business_name || 'Personal'}</p>
                                </div>
                            </div>
                            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button onClick={() => window.print()} className="crm-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}><Download size={16} /> Export PDF</button>
                                <button onClick={() => handleShareLedger(selectedParty)} className="crm-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '12px', border: '1px solid #E9D5FF', background: '#F3E8FF', color: '#7C3AED', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}><Share2 size={16} /> Share</button>
                                <button onClick={() => setIsLedgerModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={18} /></button>
                            </div>
                        </div>

                        {/* Ledger Summary Bento Box */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>OPENING BALANCE</p>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>₹{(selectedParty.opening_balance || 0).toLocaleString()}</h3>
                            </div>
                            <div style={{ padding: '1.25rem', background: '#FEF2F2', borderRadius: '18px', border: '1px solid #FEE2E2' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B91C1C', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>TOTAL CREDIT GIVEN</p>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#B91C1C', margin: 0 }}>₹{selectedParty.total_sales?.toLocaleString() || 0}</h3>
                            </div>
                            <div style={{ padding: '1.25rem', background: (selectedParty.current_balance || 0) > 0 ? '#FEF2F2' : '#CFFAFE', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: (selectedParty.current_balance || 0) > 0 ? '#B91C1C' : '#0891B2', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>NET OUTSTANDING</p>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: (selectedParty.current_balance || 0) > 0 ? '#B91C1C' : '#0891B2', margin: 0 }}>
                                    {(selectedParty.current_balance || 0) > 0 ? `₹${(selectedParty.current_balance || 0).toLocaleString()}` : ((selectedParty.current_balance || 0) < 0 ? `- ₹${Math.abs(selectedParty.current_balance || 0).toLocaleString()} (Adv)` : '₹0.00')}
                                </h3>
                            </div>
                        </div>

                        {/* Ledger Transactions Table Container */}
                        <div className="ledger-modal-scrollbar" style={{ border: '1px solid #E2E8F0', borderRadius: '20px', overflowY: 'auto', maxHeight: '380px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Transaction Type</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Details / Reference</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Debit (Invoice)</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Credit (Payment)</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Running Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedParty.ledger || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>No transactions recorded for this customer yet.</td>
                                        </tr>
                                    ) : (
                                        (selectedParty.ledger || []).map((tx, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{tx.date}</td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex', padding: '0.25rem 0.6rem', borderRadius: '6px', 
                                                        background: tx.type.toLowerCase() === 'credit' ? '#E6F4EA' : '#FCE8E6', 
                                                        color: tx.type.toLowerCase() === 'credit' ? '#137333' : '#C5221F', 
                                                        fontSize: '0.75rem', fontWeight: '800'
                                                    }}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#64748B' }}>{tx.reference}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#EF4444', fontSize: '0.85rem' }}>{(tx.debit || 0) > 0 ? `₹${(tx.debit || 0).toLocaleString()}` : '-'}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#0891B2', fontSize: '0.85rem' }}>{(tx.credit || 0) > 0 ? `₹${(tx.credit || 0).toLocaleString()}` : '-'}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '900', color: (tx.balance || 0) > 0 ? '#B91C1C' : '#0891B2', fontSize: '0.9rem' }}>₹{(tx.balance || 0).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Profile Details Modal */}
            {isProfileModalOpen && selectedProfileCustomer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(12px)', padding: '2rem' }} onClick={() => setIsProfileModalOpen(false)}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '750px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', animation: 'fadeIn 0.2s ease-out', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {(() => {
                                    const col = getAvatarColors(selectedProfileCustomer.name);
                                    return (
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col.text, fontWeight: '800', fontSize: '1.5rem', border: `1px solid ${col.text}1F`, boxShadow: `0 4px 10px ${col.text}15` }}>
                                            {selectedProfileCustomer.name.charAt(0)}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: '850', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>{selectedProfileCustomer.name}</h2>
                                    <span style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '6px', background: selectedProfileCustomer.status === 'inactive' ? '#F1F5F9' : '#E6F4EA', color: selectedProfileCustomer.status === 'inactive' ? '#64748B' : '#137333', fontSize: '0.75rem', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase' }}>
                                        {selectedProfileCustomer.status || 'ACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.2s' }}><X size={18} /></button>
                        </div>

                        {/* Profile Details Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            
                            {/* Left Side: General & Business Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>BUSINESS NAME</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.business_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>CUSTOMER CODE</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.customer_code || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>CUSTOMER TYPE</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800', textTransform: 'capitalize' }}>{selectedProfileCustomer.customer_type || 'Retail'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>PHONE NUMBER</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.phone_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>EMAIL ADDRESS</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>PREFERRED CONTACT</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.preferred_contact || 'WhatsApp'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Financial & Tax Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Details</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>CREDIT LIMIT</p>
                                            <p style={{ fontSize: '0.95rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>₹{(selectedProfileCustomer.credit_limit || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>OUTSTANDING BALANCE</p>
                                            <p style={{ fontSize: '1rem', color: (selectedProfileCustomer.current_balance || 0) > 0 ? '#B91C1C' : ((selectedProfileCustomer.current_balance || 0) < 0 ? '#0891B2' : '#475569'), margin: '2px 0 0 0', fontWeight: '900' }}>
                                                {(selectedProfileCustomer.current_balance || 0) > 0 ? `₹${(selectedProfileCustomer.current_balance || 0).toLocaleString()}` : ((selectedProfileCustomer.current_balance || 0) < 0 ? `- ₹${Math.abs(selectedProfileCustomer.current_balance || 0).toLocaleString()} (Adv)` : '₹0.00')}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>DUE DAYS</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.due_days || 30} Days</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax Details</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>GSTIN / TAX ID</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.gstin || 'Unregistered'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>PAN NUMBER</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.pan_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '700' }}>PLACE OF SUPPLY</p>
                                            <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: '2px 0 0 0', fontWeight: '800' }}>{selectedProfileCustomer.place_of_supply || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Addresses & Notes full width section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                            {selectedProfileCustomer.billing_address && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>BILLING ADDRESS</p>
                                    <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0 0 0', fontWeight: '600', lineHeight: 1.4 }}>{selectedProfileCustomer.billing_address}</p>
                                </div>
                            )}
                            {selectedProfileCustomer.shipping_address && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>SHIPPING ADDRESS</p>
                                    <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0 0 0', fontWeight: '600', lineHeight: 1.4 }}>{selectedProfileCustomer.shipping_address}</p>
                                </div>
                            )}
                            {selectedProfileCustomer.notes && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>REMARKS / NOTES</p>
                                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: '4px 0 0 0', fontWeight: '500', fontStyle: 'italic', lineHeight: 1.4, background: '#FFFBEB', padding: '0.75rem 1rem', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>{selectedProfileCustomer.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCRM;
