import React, { useState } from 'react';
import FilterableTableHead from '../components/FilterableTableHead';
import { 
    CreditCard, 
    Plus, 
    ArrowUpRight, 
    ArrowDownRight, 
    Search, 
    Filter, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    X, 
    DollarSign, 
    Activity, 
    ShieldCheck, 
    Zap,
    Building2,
    History,
    TrendingUp,
    TrendingDown,
    Building
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { paymentsStore } from '../lib/paymentsStore';
import '../App.css';

const BusinessBankAccounts = () => {
    const [activeTab, setActiveTab] = useState('accounts');
    const [colFilters, setColFilters] = React.useState({}); // 'accounts' or 'transactions'
    const [searchTerm, setSearchTerm] = useState('');
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    
    // Fast-action modal detection from navigation parameter
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsAccountModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);
    
    // State managed via paymentsStore
    const [accounts, setAccounts] = useState(() => paymentsStore.getBankAccounts());
    const [transactions, setTransactions] = useState(() => paymentsStore.getTransactions());

    // Account Form State
    const [accountForm, setAccountForm] = useState({
        bank_name: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
        opening_balance: ''
    });

    // Transaction Form State
    const [txForm, setTxForm] = useState({
        type: 'income',
        reference_type: 'sales',
        reference_id: '',
        bank_account_id: '',
        amount: '',
        payment_method: 'bank',
        notes: ''
    });

    const handleCreateAccount = (e) => {
        e.preventDefault();
        paymentsStore.addBankAccount(accountForm);
        setAccounts(paymentsStore.getBankAccounts());
        setIsAccountModalOpen(false);
        setAccountForm({ bank_name: '', account_name: '', account_number: '', ifsc_code: '', opening_balance: '' });
    };

    const handleCreateTx = (e) => {
        e.preventDefault();
        paymentsStore.addTransaction(txForm);
        setTransactions(paymentsStore.getTransactions());
        setAccounts(paymentsStore.getBankAccounts()); // Refresh balances
        setIsTxModalOpen(false);
        setTxForm({ type: 'income', reference_type: 'sales', reference_id: '', bank_account_id: '', amount: '', payment_method: 'bank', notes: '' });
    };

    const getBankNameById = (id) => {
        const acc = accounts.find(a => a.id === parseInt(id));
        return acc ? acc.bank_name : 'Cash / UPI';
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const totalTransactions = transactions.length;

    const filteredAccounts = accounts.filter(acc => 
        acc.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.account_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTransactions = transactions.filter(tx => 
        tx.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.notes.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Building2 size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Bank Accounts & Ledger</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage corporate bank accounts, track deposits, withdrawals, and general ledger transactions.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setIsAccountModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.6rem', 
                            padding: '0.85rem 1.5rem', borderRadius: '14px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                            fontWeight: '700', cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)'
                        }}
                    >
                        <Plus size={20} />
                        Add Bank Account
                    </button>
                    <button 
                        onClick={() => setIsTxModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.6rem', 
                            padding: '0.85rem 1.5rem', borderRadius: '14px', 
                            background: 'white', color: '#1B6B3A', border: '1px solid #1B6B3A', 
                            fontWeight: '700', cursor: 'pointer'
                        }}
                    >
                        <Plus size={20} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Quick Stats - Gold Standard Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Combined Bank Balance', value: `₹${totalBalance.toLocaleString()}`, icon: CreditCard, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Active Accounts', value: accounts.length, icon: Building, color: '#0D9488', bg: '#CCFBF1' },
                    { label: 'Total Ledger Entries', value: totalTransactions, icon: History, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Pending Clearances', value: '0', icon: ShieldCheck, color: '#8B5CF6', bg: '#EDE9FE' }
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

            {/* Tabs Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <button 
                    onClick={() => { setActiveTab('accounts'); setSearchTerm(''); }}
                    style={{
                        padding: '0.5rem 1.5rem', border: 'none', background: 'transparent',
                        fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
                        color: activeTab === 'accounts' ? '#1B6B3A' : '#64748B',
                        borderBottom: activeTab === 'accounts' ? '3px solid #1B6B3A' : '3px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    Bank Accounts
                </button>
                <button 
                    onClick={() => { setActiveTab('transactions'); setSearchTerm(''); }}
                    style={{
                        padding: '0.5rem 1.5rem', border: 'none', background: 'transparent',
                        fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
                        color: activeTab === 'transactions' ? '#1B6B3A' : '#64748B',
                        borderBottom: activeTab === 'transactions' ? '3px solid #1B6B3A' : '3px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    Transaction Ledger
                </button>
            </div>

            {/* Filter/Search Bar */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'accounts' ? "Search bank name or account..." : "Search reference ID or notes..."} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                        />
                    </div>
                </div>

                {/* Table Views */}
                <div style={{ overflowX: 'auto' }}>
                    {activeTab === 'accounts' ? (
                        filteredAccounts.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748B' }}>No bank accounts found.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
        { key: 'bank', label: 'Bank / Institution', placeholder: 'e.g. HDFC' },
        { key: 'account_name', label: 'Account Name', placeholder: 'Name' },
        { key: 'account_no', label: 'Account Details', placeholder: 'Acc No' },
        { key: 'opening_balance', label: 'Opening Balance', placeholder: 'e.g. 10000' },
        { key: 'current_balance', label: 'Current Balance', placeholder: 'e.g. 50000' }
    ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {filteredAccounts.map((acc) => (
                                        <tr key={acc.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                        <Building size={20} />
                                                    </div>
                                                    <span style={{ fontWeight: '750', color: '#1E293B' }}>{acc.bank_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '700' }}>{acc.account_name}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem', marginBottom: '0.15rem' }}>No: {acc.account_number}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>IFSC: {acc.ifsc_code}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#64748B', fontSize: '1rem', fontWeight: '600' }}>₹{acc.opening_balance.toLocaleString()}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1B6B3A' }}>₹{acc.current_balance.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        filteredTransactions.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748B' }}>No ledger entries found.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
        { key: 'bank', label: 'Bank / Institution', placeholder: 'e.g. HDFC' },
        { key: 'account_name', label: 'Account Name', placeholder: 'Name' },
        { key: 'account_no', label: 'Account Details', placeholder: 'Acc No' },
        { key: 'opening_balance', label: 'Opening Balance', placeholder: 'e.g. 10000' },
        { key: 'current_balance', label: 'Current Balance', placeholder: 'e.g. 50000' }
    ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    <Calendar size={14} />
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                                                    background: tx.type === 'income' ? '#F0FDF4' : '#FEF2F2',
                                                    color: tx.type === 'income' ? '#15803D' : '#B91C1C'
                                                }}>
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ fontWeight: '800', color: '#1E293B' }}>{tx.reference_id}</span>
                                                <p style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', marginTop: '0.15rem' }}>{tx.reference_type}</p>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '700' }}>{getBankNameById(tx.bank_account_id)}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#475569', textTransform: 'uppercase' }}>{tx.payment_method}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>{tx.notes || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ 
                                                    fontSize: '1.1rem', fontWeight: '900', 
                                                    color: tx.type === 'income' ? '#15803D' : '#B91C1C'
                                                }}>
                                                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
            </div>

            {/* Account Modal */}
            {isAccountModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Add Bank Account</h2>
                            <button onClick={() => setIsAccountModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Bank Name</label>
                                <input required placeholder="e.g. HDFC Bank" value={accountForm.bank_name} onChange={e => setAccountForm({...accountForm, bank_name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Holder Name</label>
                                <input required placeholder="e.g. CLIKS Enterprises" value={accountForm.account_name} onChange={e => setAccountForm({...accountForm, account_name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Number</label>
                                <input required placeholder="14-digit Account Number" value={accountForm.account_number} onChange={e => setAccountForm({...accountForm, account_number: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>IFSC Code</label>
                                    <input required placeholder="HDFC0000123" value={accountForm.ifsc_code} onChange={e => setAccountForm({...accountForm, ifsc_code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Opening Balance (₹)</label>
                                    <input required type="number" placeholder="50000" value={accountForm.opening_balance} onChange={e => setAccountForm({...accountForm, opening_balance: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.05rem', marginTop: '1rem', cursor: 'pointer' }}>
                                Add Bank Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {isTxModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Add Transaction Ledger Entry</h2>
                            <button onClick={() => setIsTxModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleCreateTx} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Type</label>
                                    <select value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option value="income">Income (+)</option>
                                        <option value="expense">Expense (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ref Type</label>
                                    <select value={txForm.reference_type} onChange={e => setTxForm({...txForm, reference_type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option value="sales">Sales</option>
                                        <option value="purchase">Purchase</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Reference ID</label>
                                    <input required placeholder="e.g. INV-102" value={txForm.reference_id} onChange={e => setTxForm({...txForm, reference_id: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amount (₹)</label>
                                    <input required type="number" placeholder="1000" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Bank Account</label>
                                <select required value={txForm.bank_account_id} onChange={e => setTxForm({...txForm, bank_account_id: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white' }}>
                                    <option value="">-- Select Bank Account --</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.bank_name} - ₹{a.current_balance.toLocaleString()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment Method</label>
                                <select value={txForm.payment_method} onChange={e => setTxForm({...txForm, payment_method: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white' }}>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Notes / Description</label>
                                <textarea placeholder="Notes..." value={txForm.notes} onChange={e => setTxForm({...txForm, notes: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', minHeight: '60px' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.05rem', marginTop: '1rem', cursor: 'pointer' }}>
                                Submit Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBankAccounts;
