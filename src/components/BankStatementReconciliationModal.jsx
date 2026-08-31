import React, { useState, useEffect, useId } from 'react';
import { 
    X, 
    Upload, 
    Check, 
    XCircle, 
    FileText, 
    Layers, 
    Lock, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight,
    RefreshCw,
    Building2,
    SlidersHorizontal,
    Eye
} from 'lucide-react';
import { parseBankStatementFile, getSampleHdfcStatementData } from '../utils/bankStatementParser';
import { matchBankTransactions } from '../utils/transactionMatcher';
import { accountingService } from '../services/accountingService';
import { useCurrency } from '../context';

export const BankStatementReconciliationModal = ({
    isOpen,
    onClose,
    bankAccount,
    bankAccounts = [],
    systemContext = {},
    onSyncComplete
}) => {
    const { formatCurrency } = useCurrency();
    const fileInputId = useId();

    const [selectedBankPreset, setSelectedBankPreset] = useState('HDFC');
    const [selectedTargetAccount, setSelectedTargetAccount] = useState(bankAccount?.id || '');
    const [statementPassword, setStatementPassword] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected' | 'personal'
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

    useEffect(() => {
        if (bankAccount) {
            setSelectedTargetAccount(bankAccount.id);
            const bName = (bankAccount.bank_name || bankAccount.account_name || '').toUpperCase();
            if (bName.includes('HDFC')) setSelectedBankPreset('HDFC');
            else if (bName.includes('STATE') || bName.includes('SBI')) setSelectedBankPreset('SBI');
            else if (bName.includes('ICICI')) setSelectedBankPreset('ICICI');
            else if (bName.includes('AXIS')) setSelectedBankPreset('AXIS');
            else setSelectedBankPreset('Generic');
        }
    }, [bankAccount]);

    if (!isOpen) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setParseError('');
        setSyncSuccessMsg('');

        try {
            const rawParsed = await parseBankStatementFile(file, selectedBankPreset, statementPassword);
            if (!rawParsed || rawParsed.length === 0) {
                setParseError('No transaction rows found in the uploaded statement. Please check file format.');
                setIsParsing(false);
                return;
            }

            const matched = matchBankTransactions(rawParsed, systemContext);
            setTransactions(matched);
        } catch (err) {
            console.error('File parse error:', err);
            setParseError(err.message || 'Error reading bank statement file.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleLoadSampleStatement = () => {
        setIsParsing(true);
        setParseError('');
        setSyncSuccessMsg('');
        setTimeout(() => {
            const sampleData = getSampleHdfcStatementData(bankAccount?.account_name || 'HDFC BANK');
            const matched = matchBankTransactions(sampleData, systemContext);
            setTransactions(matched);
            setIsParsing(false);
        }, 400);
    };

    const handleUpdateCategory = (id, newCategory) => {
        setTransactions(prev => prev.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    matchCategory: newCategory,
                    matchReason: `Manually classified as ${newCategory}`
                };
            }
            return t;
        }));
    };

    const handleSetStatus = (id, newStatus) => {
        setTransactions(prev => prev.map(t => {
            if (t.id === id) {
                return { ...t, status: newStatus };
            }
            return t;
        }));
    };

    const handleApproveAll = () => {
        setTransactions(prev => prev.map(t => ({
            ...t,
            status: t.status === 'Rejected' ? 'Rejected' : 'Approved'
        })));
    };

    const handleSynchronize = async () => {
        const approvedList = transactions.filter(t => t.status === 'Approved');
        if (approvedList.length === 0) {
            alert('No approved transactions to synchronize. Please approve at least one transaction.');
            return;
        }

        setIsSyncing(true);
        setSyncSuccessMsg('');

        try {
            const targetAccId = selectedTargetAccount || bankAccount?.id;

            for (const txn of approvedList) {
                // If personal transaction, log cleanly or skip P&L entry
                if (txn.matchCategory === 'Personal Transaction') {
                    continue;
                }

                if (txn.type === 'Credit' || txn.credit > 0) {
                    await accountingService.recordDeposit(targetAccId, {
                        amount: txn.amount,
                        date: txn.date,
                        description: `[Statement Import] ${txn.narration}`,
                        reference_number: txn.refNo,
                        category: txn.matchCategory
                    }).catch(() => {
                        return accountingService.recordEntry({
                            account_id: targetAccId,
                            type: 'Credit',
                            amount: txn.amount,
                            date: txn.date,
                            description: `[Statement Import] ${txn.narration}`,
                            reference: txn.refNo
                        });
                    });
                } else {
                    await accountingService.recordWithdrawal(targetAccId, {
                        amount: txn.amount,
                        date: txn.date,
                        description: `[Statement Import] ${txn.narration}`,
                        reference_number: txn.refNo,
                        category: txn.matchCategory
                    }).catch(() => {
                        return accountingService.recordEntry({
                            account_id: targetAccId,
                            type: 'Debit',
                            amount: txn.amount,
                            date: txn.date,
                            description: `[Statement Import] ${txn.narration}`,
                            reference: txn.refNo
                        });
                    });
                }
            }

            // Mark transactions as Synced
            setTransactions(prev => prev.map(t => t.status === 'Approved' ? { ...t, status: 'Synced' } : t));
            setSyncSuccessMsg(`Successfully synchronized ${approvedList.length} bank transactions to accounting ledger!`);

            if (onSyncComplete) {
                onSyncComplete();
            }
        } catch (err) {
            console.error('Sync failed:', err);
            alert('Synchronization failed. Please check network/account details and try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    // Derived Statistics
    const totalImported = transactions.length;
    const pendingCount = transactions.filter(t => t.status === 'Pending Review').length;
    const approvedCount = transactions.filter(t => t.status === 'Approved' || t.status === 'Synced').length;
    const rejectedCount = transactions.filter(t => t.status === 'Rejected').length;
    const personalCount = transactions.filter(t => t.matchCategory === 'Personal Transaction').length;

    const totalCreditAmt = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const totalDebitAmt = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);

    const filteredTransactions = transactions.filter(t => {
        if (activeFilterTab === 'pending') return t.status === 'Pending Review';
        if (activeFilterTab === 'approved') return t.status === 'Approved' || t.status === 'Synced';
        if (activeFilterTab === 'rejected') return t.status === 'Rejected';
        if (activeFilterTab === 'personal') return t.matchCategory === 'Personal Transaction';
        return true;
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <div style={{ background: 'white', width: '1100px', maxWidth: '96vw', height: '90vh', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Modal Header */}
                <div style={{ padding: '1.25rem 1.75rem', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0, letterSpacing: '-0.01em' }}>Bank Statement Import & Reconciliation</h2>
                            <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>Multi-Bank Statement Parser, Smart Transaction Matching & Ledger Synchronization</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94A3B8', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <X size={20} color="white" />
                    </button>
                </div>

                {/* Configuration Bar */}
                <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '1rem 1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Target Bank:</label>
                        <select
                            value={selectedTargetAccount}
                            onChange={(e) => setSelectedTargetAccount(e.target.value)}
                            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: 'white' }}
                        >
                            {bankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.bank_name || 'Bank'})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Format Preset:</label>
                        <select
                            value={selectedBankPreset}
                            onChange={(e) => setSelectedBankPreset(e.target.value)}
                            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: 'white' }}
                        >
                            <option value="HDFC">HDFC Bank Format</option>
                            <option value="SBI">State Bank of India (SBI)</option>
                            <option value="ICICI">ICICI Bank Format</option>
                            <option value="AXIS">Axis Bank Format</option>
                            <option value="Generic">Generic CSV / Excel Format</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={14} color="#64748B" />
                        <input
                            type="password"
                            placeholder="Password (if encrypted)"
                            value={statementPassword}
                            onChange={(e) => setStatementPassword(e.target.value)}
                            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', width: '180px', outline: 'none', background: 'white' }}
                        />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                        <label
                            htmlFor={fileInputId}
                            style={{ padding: '0.5rem 1rem', background: '#2563EB', color: 'white', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                        >
                            <Upload size={14} /> Upload Bank Statement
                        </label>
                        <input
                            id={fileInputId}
                            type="file"
                            accept=".xlsx, .xls, .csv, .pdf, .txt"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />

                        <button
                            onClick={handleLoadSampleStatement}
                            style={{ padding: '0.5rem 1rem', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <FileText size={14} color="#2563EB" /> Load HDFC Sample Statement
                        </button>
                    </div>
                </div>

                {/* Parsing Status or Error Alert */}
                {parseError && (
                    <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '0.75rem 1.75rem', color: '#DC2626', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> {parseError}
                    </div>
                )}

                {syncSuccessMsg && (
                    <div style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', padding: '0.75rem 1.75rem', color: '#16A34A', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> {syncSuccessMsg}
                    </div>
                )}

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: '1.25rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {isParsing ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#2563EB', fontWeight: '800' }}>
                            <RefreshCw size={32} className="spin" />
                            Parsing bank statement & running smart transaction matching...
                        </div>
                    ) : transactions.length === 0 ? (
                        <div style={{ height: '350px', border: '2px dashed #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: '#FAF5FF' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '1rem' }}>
                                <Upload size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.4rem 0' }}>Upload Bank Statement or Load Reference Template</h3>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '520px', margin: '0 0 1.25rem 0' }}>
                                Upload your official HDFC Bank, SBI, ICICI, or generic Excel/CSV bank statement. The intelligent matching engine will automatically pair deposits and withdrawals with your invoices, vendors, and expenses.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <label htmlFor={fileInputId} style={{ padding: '0.6rem 1.25rem', background: '#2563EB', color: 'white', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload size={16} /> Choose Statement File
                                </label>
                                <button onClick={handleLoadSampleStatement} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Eye size={16} color="#2563EB" /> Load HDFC Sample Statement
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Metrics Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Total Imported</p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{totalImported}</h3>
                                </div>
                                <div style={{ background: '#FEF3C7', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#92400E', margin: 0, textTransform: 'uppercase' }}>Pending Review</p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#B45309', margin: 0 }}>{pendingCount}</h3>
                                </div>
                                <div style={{ background: '#DCFCE7', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#166534', margin: 0, textTransform: 'uppercase' }}>Approved / Synced</p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803D', margin: 0 }}>{approvedCount}</h3>
                                </div>
                                <div style={{ background: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Total Credit (+)</p>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1D4ED8', margin: 0 }}>{formatCurrency(totalCreditAmt)}</h3>
                                </div>
                                <div style={{ background: '#FEF2F2', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #FECACA' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#991B1B', margin: 0, textTransform: 'uppercase' }}>Total Debit (-)</p>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#DC2626', margin: 0 }}>{formatCurrency(totalDebitAmt)}</h3>
                                </div>
                            </div>

                            {/* Filter Tabs & Action Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px' }}>
                                    {[
                                        { id: 'all', label: `All (${totalImported})` },
                                        { id: 'pending', label: `Pending (${pendingCount})` },
                                        { id: 'approved', label: `Approved (${approvedCount})` },
                                        { id: 'rejected', label: `Rejected (${rejectedCount})` },
                                        { id: 'personal', label: `Personal (${personalCount})` }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveFilterTab(tab.id)}
                                            style={{
                                                padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none',
                                                background: activeFilterTab === tab.id ? 'white' : 'transparent',
                                                color: activeFilterTab === tab.id ? '#2563EB' : '#64748B',
                                                fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                                                boxShadow: activeFilterTab === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={handleApproveAll}
                                        style={{ padding: '0.5rem 1rem', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#16A34A', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        <CheckCircle2 size={14} /> Approve All Suggested
                                    </button>
                                    <button
                                        onClick={handleSynchronize}
                                        disabled={isSyncing || approvedCount === 0}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            background: approvedCount > 0 ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' : '#94A3B8',
                                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: approvedCount > 0 ? 'pointer' : 'not-allowed',
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: approvedCount > 0 ? '0 4px 10px rgba(22, 163, 74, 0.25)' : 'none'
                                        }}
                                    >
                                        {isSyncing ? <RefreshCw size={14} className="spin" /> : <ArrowRight size={14} />} Synchronize Approved Transactions
                                    </button>
                                </div>
                            </div>

                            {/* Structured Statement Table */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                                <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 10, borderBottom: '1px solid #E2E8F0' }}>
                                            <tr style={{ color: '#475569', textAlign: 'left' }}>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800' }}>Date</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800' }}>Narration / Description</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800' }}>Ref / Chq No.</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800', textAlign: 'right' }}>Withdrawal (Dr)</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800', textAlign: 'right' }}>Deposit (Cr)</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800', textAlign: 'right' }}>Closing Bal</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800' }}>Smart Match & Category</th>
                                                <th style={{ padding: '0.75rem 0.75rem', fontWeight: '800', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                                                        No transactions found for the selected tab filter.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredTransactions.map((txn, idx) => (
                                                    <tr key={txn.id || idx} style={{ borderBottom: '1px solid #F1F5F9', background: txn.status === 'Approved' ? '#F0FDF4' : (txn.status === 'Rejected' ? '#FEF2F2' : 'white') }}>
                                                        <td style={{ padding: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '600' }}>{txn.date}</td>
                                                        <td style={{ padding: '0.75rem', fontWeight: '700', color: '#0F172A', maxWidth: '280px' }}>
                                                            <div>{txn.narration}</div>
                                                            {txn.matchReason && (
                                                                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '500', marginTop: '0.15rem' }}>
                                                                    💡 {txn.matchReason}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.75rem', fontFamily: 'monospace' }}>{txn.refNo || '-'}</td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '800', color: txn.debit > 0 ? '#DC2626' : '#94A3B8' }}>
                                                            {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '800', color: txn.credit > 0 ? '#16A34A' : '#94A3B8' }}>
                                                            {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                                                            {txn.balance ? formatCurrency(txn.balance) : '-'}
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <select
                                                                value={txn.matchCategory}
                                                                onChange={(e) => handleUpdateCategory(txn.id, e.target.value)}
                                                                style={{
                                                                    padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1',
                                                                    fontSize: '0.75rem', fontWeight: '800', outline: 'none', background: 'white',
                                                                    color: txn.matchCategory === 'Customer Payment' ? '#16A34A' : (txn.matchCategory === 'Vendor Payment' ? '#2563EB' : (txn.matchCategory === 'Personal Transaction' ? '#D97706' : '#475569'))
                                                                }}
                                                            >
                                                                <option value="Customer Payment">Customer Payment (Deposit)</option>
                                                                <option value="Vendor Payment">Vendor Payment (Debit)</option>
                                                                <option value="Business Expense">Business Expense</option>
                                                                <option value="Business Income">Business Income</option>
                                                                <option value="Personal Transaction">Personal Transaction (Non-P&L)</option>
                                                                <option value="Unmatched">Unmatched Entry</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            {txn.status === 'Synced' ? (
                                                                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16A34A', padding: '0.2rem 0.5rem', background: '#DCFCE7', borderRadius: '6px' }}>Synced</span>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleSetStatus(txn.id, 'Approved')}
                                                                        style={{ padding: '0.3rem 0.55rem', border: 'none', background: txn.status === 'Approved' ? '#16A34A' : '#E2E8F0', color: txn.status === 'Approved' ? 'white' : '#475569', borderRadius: '6px', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}
                                                                    >
                                                                        <Check size={12} /> Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSetStatus(txn.id, 'Rejected')}
                                                                        style={{ padding: '0.3rem 0.55rem', border: 'none', background: txn.status === 'Rejected' ? '#DC2626' : '#E2E8F0', color: txn.status === 'Rejected' ? 'white' : '#475569', borderRadius: '6px', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}
                                                                    >
                                                                        <X size={12} /> Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1rem 1.75rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                        Bank Account: <strong style={{ color: '#0F172A' }}>{bankAccount?.account_name || 'HDFC BANK'}</strong> | Mode: <strong style={{ color: '#2563EB' }}>{selectedBankPreset} Engine</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            style={{ padding: '0.5rem 1.25rem', background: 'white', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Close Modal
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BankStatementReconciliationModal;
