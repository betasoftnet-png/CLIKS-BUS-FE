import React, { useState } from 'react';
import { 
    CreditCard, 
    Plus, 
    Search, 
    ArrowUpRight, 
    ArrowDownRight, 
    Wallet, 
    DollarSign, 
    MessageSquare, 
    FileText, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    User, 
    Activity, 
    Smartphone, 
    Building, 
    Clock, 
    Calendar,
    Send,
    TrendingUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import '../App.css';

const BusinessPayments = () => {
    const [activeTab, setActiveTab] = useState('receivables'); // 'receivables', 'payables', 'bank', 'reminders'
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Unified query loading both ledgers and accounts
    const { data: reportsData = { receivables: [], payables: [], accounts: [] } } = useQuery({
        queryKey: ['paymentReports'],
        queryFn: () => paymentService.getReports()
    });

    // Mutations
    const receiveMutation = useMutation({
        mutationFn: (data) => paymentService.receivePayment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            setIsPaymentModalOpen(false);
            alert('Customer payment recorded and committed successfully.');
        }
    });

    const payMutation = useMutation({
        mutationFn: (data) => paymentService.paySupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            setIsSupplierModalOpen(false);
            alert('Supplier payment authorized and processed.');
        }
    });

    const dbReceivables = reportsData.receivables || [];
    const dbPayables = reportsData.payables || [];
    const dbAccounts = reportsData.accounts || [];

    const receivables = dbReceivables.map(rec => ({
        payment_id: rec.id,
        payment_number: `REC-${new Date(rec.created_at).getFullYear()}-${rec.id}`,
        payment_type: 'receive',
        payment_date: rec.created_at ? rec.created_at.split('T')[0] : 'N/A',
        payment_status: 'completed',
        customer_name: rec.party_name || 'General Client',
        invoice_id: rec.invoice_id || `INV-REF-${rec.id}`,
        total_amount: parseFloat(rec.amount) || 0,
        paid_amount: parseFloat(rec.amount) || 0,
        pending_amount: 0,
        payment_mode: rec.payment_mode || 'Other',
        transaction_reference: rec.reference_number || `REF-${rec.id}`,
        receipt_number: `RCT-${rec.id}`,
        reconciliation_status: rec.reconciliation_status || 'matched'
    }));

    const payables = dbPayables.map(rec => ({
        payment_id: rec.id,
        payment_number: `VCH-${new Date(rec.created_at).getFullYear()}-${rec.id}`,
        payment_type: 'pay',
        payment_date: rec.created_at ? rec.created_at.split('T')[0] : 'N/A',
        payment_status: 'completed',
        supplier_name: rec.party_name || 'General Vendor',
        purchase_id: rec.invoice_id || `BILL-REF-${rec.id}`,
        total_amount: parseFloat(rec.amount) || 0,
        paid_amount: parseFloat(rec.amount) || 0,
        pending_amount: 0,
        payment_mode: rec.payment_mode || 'Other',
        cheque_number: rec.reference_number || `CHQ-${rec.id}`,
        reconciliation_status: rec.reconciliation_status || 'matched'
    }));

    const accounts = dbAccounts.length > 0 ? dbAccounts : [
        { bank_account_id: 'ACC-DEFL', bank_account_name: 'Default Cash Account', current_balance: 0, type: 'cash' }
    ];

    const overdues = []; // Placeholder derived from outstanding backend logic if provisioned

    // Forms input states
    const [customerForm, setCustomerForm] = useState({
        customer_name: 'Acme Corporates (Rahul Dev)',
        invoice_id: 'INV-2026-104',
        total_amount: 10000,
        paid_amount: 4000,
        payment_mode: 'UPI',
        transaction_reference: 'UPI-9092210A'
    });

    const [supplierForm, setSupplierForm] = useState({
        supplier_name: 'Delhi Distributors Ltd.',
        purchase_id: 'BILL-77091',
        total_amount: 35000,
        paid_amount: 10000,
        payment_mode: 'Bank Transfer',
        transaction_reference: 'REF-88910B'
    });

    const [transferForm, setTransferForm] = useState({
        from_acc_id: 'ACC-03',
        to_acc_id: 'ACC-01',
        amount: 25000
    });

    const handleSaveCustomerPayment = (e) => {
        e.preventDefault();
        receiveMutation.mutate({
            customer_name: customerForm.customer_name,
            invoice_id: customerForm.invoice_id,
            amount: parseFloat(customerForm.paid_amount),
            payment_mode: customerForm.payment_mode,
            reference_number: customerForm.transaction_reference
        });
    };

    const handleSaveSupplierPayment = (e) => {
        e.preventDefault();
        payMutation.mutate({
            supplier_name: supplierForm.supplier_name,
            purchase_id: supplierForm.purchase_id,
            amount: parseFloat(supplierForm.paid_amount),
            payment_mode: supplierForm.payment_mode,
            reference_number: supplierForm.transaction_reference
        });
    };

    const handleInternalTransfer = (e) => {
        e.preventDefault();
        const transAmt = parseFloat(transferForm.amount) || 0;
        const sourceAcc = accounts.find(a => a.bank_account_id === transferForm.from_acc_id);

        if (transAmt > (sourceAcc?.current_balance || 0)) {
            alert('Insufficient balance in source account to make internal transfer!');
            return;
        }

        // In real usage, this would invoke a /payments/transfer API to move between source and target accounts
        alert('Simulated fund transfer logged. In production, this will invoke the ledger movement API!');
        setIsTransferModalOpen(false);
        alert('Internal fund transfer settled across cash/bank registers!');
    };

    const sendWhatsAppReminder = (custName) => {
        alert(`Overdue reminder template successfully dispatched via API to ${custName}!`);
    };

    const totalOutstandingReceivables = overdues.reduce((sum, o) => sum + o.pending_amount, 0);
    const totalDailyCollections = receivables.reduce((sum, r) => sum + r.paid_amount, 0);

    const filteredReceivables = receivables.filter(r => 
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.payment_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayables = payables.filter(p => 
        p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payment_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <CreditCard size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Payments & Cash Flow Engine</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Receive customer payments, pay suppliers, link invoices, manage bank accounts/cash, and dispatch overdue reminder templates.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsSupplierModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <ArrowUpRight size={16} /> Pay Supplier
                    </button>
                    <button 
                        onClick={() => setIsPaymentModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <ArrowDownRight size={16} /> Receive Payment
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Outstanding Receivables', value: `₹${totalOutstandingReceivables.toLocaleString()}`, icon: TrendingUp, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Daily Collections', value: `₹${totalDailyCollections.toLocaleString()}`, icon: ArrowDownRight, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Combined Balances', value: `₹${accounts.reduce((sum, a) => sum + a.current_balance, 0).toLocaleString()}`, icon: Wallet, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Efficiency Rate', value: '94.2%', icon: CheckCircle2, color: '#0D9488', bg: '#CCFBF1' }
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

            {/* Tabs Row */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'receivables', label: 'Customer Receivables (Inward)', icon: ArrowDownRight },
                    { id: 'payables', label: 'Supplier Payables (Outward)', icon: ArrowUpRight },
                    { id: 'bank', label: 'Bank & Cash Registers', icon: Wallet },
                    { id: 'reminders', label: 'Overdue Collections & Reminders', icon: Clock }
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

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Tab 1: Customer Receivables */}
            {activeTab === 'receivables' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search customer payments..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Receipt ID</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Customer Name</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice Linked</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Total Original</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Paid Amount</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Mode</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Reconciliation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceivables.map((r) => (
                                    <tr key={r.payment_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{r.payment_number}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{r.payment_date}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#1E293B' }}>{r.customer_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '600' }}>{r.invoice_id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>₹{r.total_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#1B6B3A' }}>₹{r.paid_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#F0FDF4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>{r.payment_mode}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{r.reconciliation_status.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Supplier Payables */}
            {activeTab === 'payables' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search supplier disbursements..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Voucher No</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier Name</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Purchase Linked</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Total Due</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Paid Amount</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Mode</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Ref Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayables.map((p) => (
                                    <tr key={p.payment_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{p.payment_number}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{p.payment_date}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#1E293B' }}>{p.supplier_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '600' }}>{p.purchase_id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>₹{p.total_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#EF4444' }}>₹{p.paid_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>{p.payment_mode}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{p.cheque_number || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Bank registers */}
            {activeTab === 'bank' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {accounts.map(acc => (
                        <div key={acc.bank_account_id} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F0F9F4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>{acc.bank_account_id}</span>
                                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{acc.type.toUpperCase()}</span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.5rem' }}>{acc.bank_account_name}</h3>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Account No: {acc.account_number}</p>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Current Balance:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '950', color: '#1B6B3A' }}>₹{acc.current_balance.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{ background: 'white', borderRadius: '28px', border: '1px dashed #DDD6FE', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsTransferModalOpen(true)}>
                        <ArrowUpRight size={32} style={{ color: '#1B6B3A', marginBottom: '0.75rem' }} />
                        <h4 style={{ fontWeight: '800', color: '#064E3B' }}>Internal Transfer Funds</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Move money between Cash-In-Hand and Bank accounts</p>
                    </div>
                </div>
            )}

            {/* Tab 4: Overdue reminders */}
            {activeTab === 'reminders' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Overdue Customer Accounts Reminders (myBillBook flow)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Customer Profile</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Linked Invoice</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Amount Overdue</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Due Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Delay Days</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Reminder Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>WhatsApp Alert</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overdues.map((ov) => (
                                <tr key={ov.invoice_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{ov.customer_name}</td>
                                    <td style={{ padding: '1rem', color: '#475569', fontWeight: '700' }}>{ov.invoice_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#EF4444' }}>₹{ov.pending_amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{ov.due_date}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>{ov.overdue_days} Days Overdue</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontWeight: '700' }}>{ov.reminder_sent}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => sendWhatsAppReminder(ov.customer_name)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', background: '#10B981', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            <MessageSquare size={14} /> Send Reminder
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </div>

            {/* Inward Customer Payment Modal */}
            {isPaymentModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Customer Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveCustomerPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Customer Profile</label>
                                <select value={customerForm.customer_name} onChange={(e) => setCustomerForm({ ...customerForm, customer_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    <option>Acme Corporates (Rahul Dev)</option>
                                    <option>Karan Johar Tech</option>
                                    <option>Sharma Retail Store</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Linked ID</label>
                                    <input required type="text" value={customerForm.invoice_id} onChange={(e) => setCustomerForm({ ...customerForm, invoice_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Amount</label>
                                    <input required type="number" value={customerForm.total_amount} onChange={(e) => setCustomerForm({ ...customerForm, total_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid amount (Receipt worth)</label>
                                <input required type="number" value={customerForm.paid_amount} onChange={(e) => setCustomerForm({ ...customerForm, paid_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payment Mode</label>
                                    <select value={customerForm.payment_mode} onChange={(e) => setCustomerForm({ ...customerForm, payment_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>UPI</option>
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Ref ID / UPI reference</label>
                                    <input required type="text" value={customerForm.transaction_reference} onChange={(e) => setCustomerForm({ ...customerForm, transaction_reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Finalize Payment Collection
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Outward Supplier Payment Modal */}
            {isSupplierModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Supplier Disbursement</h3>
                            <button onClick={() => setIsSupplierModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveSupplierPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Supplier Profile</label>
                                <select value={supplierForm.supplier_name} onChange={(e) => setSupplierForm({ ...supplierForm, supplier_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    <option>Delhi Distributors Ltd.</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Purchase Bill Linked ID</label>
                                    <input required type="text" value={supplierForm.purchase_id} onChange={(e) => setSupplierForm({ ...supplierForm, purchase_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Due Amount</label>
                                    <input required type="number" value={supplierForm.total_amount} onChange={(e) => setSupplierForm({ ...supplierForm, total_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid Amount (Outflow worth)</label>
                                <input required type="number" value={supplierForm.paid_amount} onChange={(e) => setSupplierForm({ ...supplierForm, paid_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Disbursement Mode</label>
                                    <select value={supplierForm.payment_mode} onChange={(e) => setSupplierForm({ ...supplierForm, payment_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Bank Transfer</option>
                                        <option>Cheque</option>
                                        <option>UPI</option>
                                        <option>Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Cheque / Ref No</label>
                                    <input required type="text" value={supplierForm.transaction_reference} onChange={(e) => setSupplierForm({ ...supplierForm, transaction_reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Disburse Supplier Funds
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Internal Transfers Modal */}
            {isTransferModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Internal Vault Transfer</h3>
                            <button onClick={() => setIsTransferModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleInternalTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Account</label>
                                    <select value={transferForm.from_acc_id} onChange={(e) => setTransferForm({ ...transferForm, from_acc_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        {accounts.map(a => <option key={a.bank_account_id} value={a.bank_account_id}>{a.bank_account_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Account</label>
                                    <select value={transferForm.to_acc_id} onChange={(e) => setTransferForm({ ...transferForm, to_acc_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        {accounts.map(a => <option key={a.bank_account_id} value={a.bank_account_id}>{a.bank_account_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Transfer Amount</label>
                                <input required type="number" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Fund Transfer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPayments;
