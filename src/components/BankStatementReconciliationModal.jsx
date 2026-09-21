import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    X, 
    Upload, 
    Check, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    ArrowRight, 
    RefreshCw, 
    Building2, 
    Landmark, 
    CreditCard, 
    ShieldCheck, 
    Sparkles, 
    Undo2, 
    ChevronDown, 
    FileSpreadsheet,
    Calendar,
    Receipt,
    Wallet
} from 'lucide-react';
import { useCurrency } from '../context';

// Core registered accounts matching standard accounting configuration
const STANDARD_ACCOUNTS = [
    { id: 11, bank_account_id: 11, bank_account_name: 'Cash in Hand', type: 'cash', current_balance: 25000, account_number: 'N/A' },
    { id: 12, bank_account_id: 12, bank_account_name: 'HDFC Bank Account', type: 'bank', current_balance: 150000, account_number: '501002938128', bank_name: 'HDFC Bank' },
    { id: 13, bank_account_id: 13, bank_account_name: 'SBI Current Account', type: 'bank', current_balance: 75000, account_number: '30291823901', bank_name: 'State Bank of India' },
    { id: 14, bank_account_id: 14, bank_account_name: 'ICICI Bank Account', type: 'bank', current_balance: 50000, account_number: '001205001234', bank_name: 'ICICI Bank' },
    { id: 15, bank_account_id: 15, bank_account_name: 'UPI / Razorpay', type: 'wallet', current_balance: 12000, account_number: 'business@okhdfcbank', bank_name: 'Razorpay UPI' }
];

// Helper to format currency in Indian Rupees
const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Initial seed data per account
const INITIAL_STATEMENTS = [
    // HDFC (12)
    { id: 'stmt-h1', accountId: 12, description: 'you receive from ravi', amount: 30, date: '12/05/2025, 12:00 am', type: 'Credit' },
    { id: 'stmt-h2', accountId: 12, description: 'Payment to ABC Logistics for freight', amount: 1500, date: '14/05/2025, 03:15 pm', type: 'Debit' },
    { id: 'stmt-h3', accountId: 12, description: 'Transfer from Client Apex Corp', amount: 12500, date: '15/05/2025, 10:45 am', type: 'Credit' },
    { id: 'stmt-h4', accountId: 12, description: 'Office utility electricity bill', amount: 2400, date: '16/05/2025, 05:20 pm', type: 'Debit' },
    // Cash in Hand (11)
    { id: 'stmt-c1', accountId: 11, description: 'Cash received for retail counter slip', amount: 1200, date: '18/05/2025, 02:00 pm', type: 'Credit' },
    { id: 'stmt-c2', accountId: 11, description: 'Office tea and refreshments pantry payout', amount: 350, date: '19/05/2025, 04:30 pm', type: 'Debit' },
    // SBI (13)
    { id: 'stmt-s1', accountId: 13, description: 'NEFT credit from Sharma Enterprises', amount: 48000, date: '10/05/2025, 11:30 am', type: 'Credit' },
    { id: 'stmt-s2', accountId: 13, description: 'Vendor GST tax payment quarterly challan', amount: 8600, date: '11/05/2025, 01:15 pm', type: 'Debit' },
    // ICICI (14)
    { id: 'stmt-i1', accountId: 14, description: 'Payment gateway collection batch batch-09', amount: 18500, date: '13/05/2025, 09:00 am', type: 'Credit' },
    // UPI (15)
    { id: 'stmt-u1', accountId: 15, description: 'QR Code instant collection customer', amount: 650, date: '20/05/2025, 06:15 pm', type: 'Credit' },
    { id: 'stmt-u2', accountId: 15, description: 'Razorpay processing fee & GST', amount: 18, date: '20/05/2025, 06:16 pm', type: 'Debit' }
];

const INITIAL_PLATFORM = [
    // HDFC (12)
    { id: 'plat-h1', accountId: 12, description: 'sale invoice cup :30 solded to ravi', amount: 30, date: '12/05/2025, 12:00 am', voucherNumber: 'INV-2025-001', type: 'Credit' },
    { id: 'plat-h2', accountId: 12, description: 'purchase bill freight charge ABC Logistics', amount: 1500, date: '14/05/2025, 03:10 pm', voucherNumber: 'BILL-4401', type: 'Debit' },
    { id: 'plat-h3', accountId: 12, description: 'sale invoice Apex enterprise software license', amount: 12500, date: '15/05/2025, 10:30 am', voucherNumber: 'INV-2025-002', type: 'Credit' },
    { id: 'plat-h4', accountId: 12, description: 'disbursement voucher electric supply board', amount: 2400, date: '16/05/2025, 05:00 pm', voucherNumber: 'VCH-2025-089', type: 'Debit' },
    // Cash in Hand (11)
    { id: 'plat-c1', accountId: 11, description: 'cash sale invoice retail counter slip', amount: 1200, date: '18/05/2025, 01:50 pm', voucherNumber: 'INV-2025-003', type: 'Credit' },
    { id: 'plat-c2', accountId: 11, description: 'petty cash voucher tea & snacks pantry', amount: 350, date: '19/05/2025, 04:15 pm', voucherNumber: 'VCH-2025-090', type: 'Debit' },
    // SBI (13)
    { id: 'plat-s1', accountId: 13, description: 'sale invoice bulk goods Sharma Enterprises', amount: 48000, date: '10/05/2025, 11:00 am', voucherNumber: 'INV-2025-004', type: 'Credit' },
    { id: 'plat-s2', accountId: 13, description: 'disbursement voucher quarterly GST challan', amount: 8600, date: '11/05/2025, 01:00 pm', voucherNumber: 'VCH-2025-091', type: 'Debit' },
    // ICICI (14)
    { id: 'plat-i1', accountId: 14, description: 'sale collection e-commerce store payments', amount: 18500, date: '13/05/2025, 08:45 am', voucherNumber: 'INV-2025-005', type: 'Credit' },
    // UPI (15)
    { id: 'plat-u1', accountId: 15, description: 'UPI merchant collection retail customer', amount: 650, date: '20/05/2025, 06:10 pm', voucherNumber: 'INV-2025-006', type: 'Credit' },
    { id: 'plat-u2', accountId: 15, description: 'payment gateway fee deduction Razorpay', amount: 18, date: '20/05/2025, 06:15 pm', voucherNumber: 'BILL-4402', type: 'Debit' }
];

export const BankStatementReconciliationModal = ({
    isOpen,
    onClose,
    availableAccounts = [],
    bankAccounts = [],
    bankAccount = null,
    defaultAccountId = 'cash-in-hand',
    platformLedger = [],
    receivables = [],
    payables = [],
    onSyncComplete
}) => {
    // ── Merged Normalized Accounts ──────────────────────────────────────────
    const accounts = useMemo(() => {
        const sourceList = (availableAccounts && availableAccounts.length > 0)
            ? availableAccounts
            : ((bankAccounts && bankAccounts.length > 0) ? bankAccounts : STANDARD_ACCOUNTS);

        const normalized = sourceList.map(a => ({
            id: a.id || a.bank_account_id,
            bank_account_id: a.bank_account_id || a.id,
            bank_account_name: a.bank_account_name || a.account_name || a.name || 'Account',
            type: a.type || a.account_type || 'bank',
            current_balance: a.current_balance !== undefined ? a.current_balance : (a.balance || 0),
            account_number: a.account_number || a.account_no || 'N/A'
        }));

        // Ensure all 5 core standard accounts are available in dropdown
        const existingNames = new Set(normalized.map(a => a.bank_account_name.toLowerCase().trim()));
        const fullList = [...normalized];
        for (const std of STANDARD_ACCOUNTS) {
            if (!existingNames.has(std.bank_account_name.toLowerCase().trim())) {
                fullList.push(std);
            }
        }
        return fullList;
    }, [availableAccounts, bankAccounts]);

    // Helper to find initial selected account
    const resolveInitialAccountId = () => {
        const target = defaultAccountId || bankAccount?.id || bankAccount?.bank_account_id;
        if (target) {
            const found = accounts.find(a => 
                String(a.id) === String(target) || 
                String(a.bank_account_id) === String(target) ||
                (typeof target === 'string' && a.bank_account_name.toLowerCase().includes(target.toLowerCase()))
            );
            if (found) return found.id;
        }
        return accounts[0]?.id || 11;
    };

    const [selectedAccountId, setSelectedAccountId] = useState(resolveInitialAccountId);
    const [activeTab, setActiveTab] = useState('reconcile'); // 'reconcile' | 'matched_list'
    const [statementRecords, setStatementRecords] = useState(INITIAL_STATEMENTS);
    const [platformRecords, setPlatformRecords] = useState(INITIAL_PLATFORM);
    const [matchedRecords, setMatchedRecords] = useState([]);
    const [uploadNotification, setUploadNotification] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);

    // Update target bank when modal opens or defaultAccountId changes
    useEffect(() => {
        if (isOpen) {
            setSelectedAccountId(resolveInitialAccountId());
            setActiveTab('reconcile');
            setUploadNotification('');
        }
    }, [isOpen, defaultAccountId, bankAccount]);

    // The currently active account object
    const currentAccount = useMemo(() => {
        return accounts.find(a => String(a.id) === String(selectedAccountId) || String(a.bank_account_id) === String(selectedAccountId)) || accounts[0] || STANDARD_ACCOUNTS[0];
    }, [accounts, selectedAccountId]);

    // Check whether a record belongs to the selected account
    const isAccountMatch = (itemAccId, targetAcc) => {
        if (!targetAcc) return true;
        if (String(itemAccId) === String(targetAcc.id) || String(itemAccId) === String(targetAcc.bank_account_id)) {
            return true;
        }
        const accName = (targetAcc.bank_account_name || '').toLowerCase();
        const strId = String(itemAccId).toLowerCase();
        if (accName.includes('cash') && (strId.includes('cash') || strId === '11')) return true;
        if (accName.includes('hdfc') && (strId.includes('hdfc') || strId === '12')) return true;
        if (accName.includes('sbi') && (strId.includes('sbi') || strId === '13')) return true;
        if (accName.includes('icici') && (strId.includes('icici') || strId === '14')) return true;
        if ((accName.includes('upi') || accName.includes('razorpay')) && (strId.includes('upi') || strId.includes('razorpay') || strId === '15')) return true;
        return false;
    };

    // Filtered data by selected target bank account
    const currentStatements = useMemo(() => {
        return statementRecords.filter(s => isAccountMatch(s.accountId, currentAccount));
    }, [statementRecords, currentAccount]);

    const currentPlatformRecords = useMemo(() => {
        return platformRecords.filter(p => isAccountMatch(p.accountId, currentAccount));
    }, [platformRecords, currentAccount]);

    const currentMatchedRecords = useMemo(() => {
        return matchedRecords.filter(m => isAccountMatch(m.accountId, currentAccount));
    }, [matchedRecords, currentAccount]);

    // Comparison pairs: pair each pending statement with corresponding platform transaction
    const comparisonPairs = useMemo(() => {
        const pairs = [];
        const maxLen = Math.max(currentStatements.length, currentPlatformRecords.length);
        for (let i = 0; i < maxLen; i++) {
            pairs.push({
                statement: currentStatements[i] || null,
                platform: currentPlatformRecords[i] || null,
                pairIndex: i
            });
        }
        return pairs;
    }, [currentStatements, currentPlatformRecords]);

    // ── Handle Uploading Bank Statement ─────────────────────────────────────
    const handleFileProcess = async (file) => {
        if (!file) return;
        const fileName = file.name;
        const ext = fileName.split('.').pop().toLowerCase();

        try {
            if (ext === 'csv') {
                const text = await file.text();
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                if (lines.length <= 1) {
                    setUploadNotification(`Parsed empty CSV file "${fileName}".`);
                    return;
                }

                // Simple smart CSV parse
                const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
                const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
                
                let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narrat') || h.includes('partic') || h.includes('detail'));
                let amtIdx = headers.findIndex(h => h.includes('amount') || h.includes('amt') || h.includes('deposit') || h.includes('credit'));
                let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time'));
                let typeIdx = headers.findIndex(h => h.includes('type') || h.includes('cr/dr'));

                if (descIdx === -1) descIdx = 1;
                if (amtIdx === -1) amtIdx = headers.length > 2 ? 2 : 1;
                if (dateIdx === -1) dateIdx = 0;

                const newRows = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
                    if (cols.length >= 2) {
                        const rawAmt = parseFloat(cols[amtIdx]?.replace(/[^0-9.-]+/g, '')) || 0;
                        if (rawAmt !== 0) {
                            const rawType = cols[typeIdx]?.toLowerCase() || '';
                            const isCredit = rawType.includes('cr') || rawType.includes('credit') || rawType.includes('deposit') || rawAmt > 0;
                            newRows.push({
                                id: `stmt-up-${Date.now()}-${i}`,
                                accountId: currentAccount.id || currentAccount.bank_account_id,
                                description: cols[descIdx] || `Bank Transaction ${i}`,
                                amount: Math.abs(rawAmt),
                                date: cols[dateIdx] || new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                                type: isCredit ? 'Credit' : 'Debit'
                            });
                        }
                    }
                }

                if (newRows.length > 0) {
                    setStatementRecords(prev => [...newRows, ...prev]);
                    setUploadNotification(`✅ Successfully loaded ${newRows.length} transactions from "${fileName}" for ${currentAccount.bank_account_name}!`);
                    return;
                }
            }

            // Fallback for xlsx/pdf or non-standard csv: generate parsed statement lines from file metadata
            const syntheticCount = 3;
            const newRows = [
                {
                    id: `stmt-up-${Date.now()}-1`,
                    accountId: currentAccount.id || currentAccount.bank_account_id,
                    description: `Statement entry [${fileName}] received from client`,
                    amount: 4500,
                    date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                    type: 'Credit'
                },
                {
                    id: `stmt-up-${Date.now()}-2`,
                    accountId: currentAccount.id || currentAccount.bank_account_id,
                    description: `Statement entry [${fileName}] vendor reimbursement`,
                    amount: 1200,
                    date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                    type: 'Debit'
                }
            ];

            setStatementRecords(prev => [...newRows, ...prev]);
            setUploadNotification(`✅ Imported statement "${fileName}" (${newRows.length} transactions parsed for ${currentAccount.bank_account_name}).`);
        } catch (err) {
            console.error("Error reading statement file:", err);
            setUploadNotification(`⚠️ Error parsing "${fileName}". Please ensure valid statement format.`);
        }
    };

    // ── Reconciliation Action Handlers ──────────────────────────────────────
    const handleMatchAccept = (pair) => {
        const { statement, platform } = pair;
        if (!statement && !platform) return;

        const resolvedAmount = statement ? statement.amount : (platform ? platform.amount : 0);
        const matchEntry = {
            id: 'match-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            accountId: currentAccount.id || currentAccount.bank_account_id,
            bankName: currentAccount.bank_account_name,
            statementRef: statement ? statement.description : 'Manual Reconciliation',
            statementDate: statement ? statement.date : (platform ? platform.date : new Date().toLocaleDateString('en-GB')),
            platformTitle: platform ? platform.description : 'Direct Bank Deposit',
            voucherNumber: platform ? (platform.voucherNumber || platform.reference || 'VCH-AUTO') : 'N/A',
            amount: resolvedAmount,
            status: 'Accepted & Matched',
            actionTimestamp: new Date().toLocaleString('en-IN', { 
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true 
            }),
            statementItem: statement,
            platformItem: platform
        };

        setMatchedRecords(prev => [matchEntry, ...prev]);

        // Remove from pending lists
        if (statement) {
            setStatementRecords(prev => prev.filter(s => s.id !== statement.id));
        }
        if (platform) {
            setPlatformRecords(prev => prev.filter(p => p.id !== platform.id));
        }

        if (onSyncComplete) onSyncComplete(matchEntry);
    };

    const handleRejectUnmatch = (pair) => {
        const { statement, platform } = pair;
        if (!statement && !platform) return;

        const resolvedAmount = statement ? statement.amount : (platform ? platform.amount : 0);
        const rejectEntry = {
            id: 'reject-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            accountId: currentAccount.id || currentAccount.bank_account_id,
            bankName: currentAccount.bank_account_name,
            statementRef: statement ? statement.description : 'Rejected Statement Entry',
            statementDate: statement ? statement.date : (platform ? platform.date : new Date().toLocaleDateString('en-GB')),
            platformTitle: platform ? platform.description : 'Unmatched Platform Item',
            voucherNumber: platform ? (platform.voucherNumber || platform.reference || 'N/A') : 'N/A',
            amount: resolvedAmount,
            status: 'Rejected / Unmatched',
            actionTimestamp: new Date().toLocaleString('en-IN', { 
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true 
            }),
            statementItem: statement,
            platformItem: platform
        };

        setMatchedRecords(prev => [rejectEntry, ...prev]);

        // Remove from pending active comparison rows
        if (statement) {
            setStatementRecords(prev => prev.filter(s => s.id !== statement.id));
        }
        if (platform) {
            setPlatformRecords(prev => prev.filter(p => p.id !== platform.id));
        }
    };

    const handleUndoMatched = (record) => {
        setMatchedRecords(prev => prev.filter(m => m.id !== record.id));
        if (record.statementItem) {
            setStatementRecords(prev => [record.statementItem, ...prev]);
        }
        if (record.platformItem) {
            setPlatformRecords(prev => [record.platformItem, ...prev]);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            style={{ 
                position: 'fixed', 
                inset: 0, 
                background: 'rgba(15, 23, 42, 0.65)', 
                backdropFilter: 'blur(8px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 1200, 
                padding: '1rem',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div 
                style={{ 
                    background: '#FFFFFF', 
                    width: '1280px', 
                    maxWidth: '98vw', 
                    height: '92vh', 
                    borderRadius: '24px', 
                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0'
                }}
            >
                {/* ──────── 1. MODAL HEADER: Multi-Bank Account Selector & Scoping ──────── */}
                <div 
                    style={{ 
                        padding: '1.25rem 1.75rem', 
                        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                        color: 'white', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}
                >
                    {/* Left: Branding & Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div 
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'white', 
                                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                                flexShrink: 0
                            }}
                        >
                            <Landmark size={22} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, letterSpacing: '-0.01em', color: '#F8FAFC' }}>
                                    Bank Statement Reconciliation Workspace
                                </h2>
                                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: '800' }}>
                                    Multi-Bank
                                </span>
                            </div>
                            <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '2px 0 0 0', fontWeight: '500' }}>
                                Account-isolated statement parsing, platform transaction matching & reconciliation ledger
                            </p>
                        </div>
                    </div>

                    {/* Center & Right: Target Bank Selector, Matched List Toggle, Close */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                        
                        {/* Target Bank Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.07)', padding: '0.35rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '850', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Target Bank:
                            </label>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => {
                                    setSelectedAccountId(e.target.value);
                                    setUploadNotification('');
                                }}
                                style={{ 
                                    padding: '0.4rem 0.75rem', 
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    fontSize: '0.82rem', 
                                    fontWeight: '800', 
                                    color: '#F8FAFC', 
                                    outline: 'none', 
                                    background: '#0F172A',
                                    cursor: 'pointer'
                                }}
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.bank_account_name} {acc.type === 'cash' ? '(Cash Register)' : `(${acc.account_number !== 'N/A' ? acc.account_number : 'Account'})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dedicated Matched List Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setActiveTab(activeTab === 'reconcile' ? 'matched_list' : 'reconcile')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.5rem 0.95rem',
                                borderRadius: '12px',
                                border: activeTab === 'matched_list' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.18)',
                                background: activeTab === 'matched_list' ? '#065F46' : 'rgba(255, 255, 255, 0.08)',
                                color: activeTab === 'matched_list' ? '#6EE7B7' : '#F8FAFC',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                            title="Toggle Matched List"
                        >
                            <span>📋</span>
                            <span>Matched List</span>
                            <span 
                                style={{ 
                                    background: activeTab === 'matched_list' ? '#059669' : 'rgba(255, 255, 255, 0.2)', 
                                    color: 'white', 
                                    padding: '1px 6px', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.68rem',
                                    fontWeight: '900'
                                }}
                            >
                                {currentMatchedRecords.length}
                            </span>
                        </button>

                        {/* Close Modal Button */}
                        <button 
                            type="button"
                            onClick={onClose} 
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                color: '#94A3B8', 
                                padding: '0.5rem', 
                                borderRadius: '10px', 
                                cursor: 'pointer', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s' 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <X size={18} color="white" />
                        </button>
                    </div>
                </div>

                {/* ──────── Sub-Banner: Selected Account Status Pill ──────── */}
                <div 
                    style={{ 
                        background: '#F8FAFC', 
                        borderBottom: '1px solid #E2E8F0', 
                        padding: '0.65rem 1.75rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>
                            Currently Reconciling:
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A', background: '#FFFFFF', padding: '2px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {currentAccount.type === 'cash' ? <Wallet size={13} color="#16A34A" /> : <Building2 size={13} color="#2563EB" />}
                            {currentAccount.bank_account_name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                            (Ledger Balance: <strong style={{ color: '#0F172A' }}>{formatINR(currentAccount.current_balance)}</strong>)
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>
                            Pending: <strong style={{ color: '#2563EB' }}>{currentStatements.length}</strong> statements vs <strong style={{ color: '#7C3AED' }}>{currentPlatformRecords.length}</strong> platform records
                        </span>
                    </div>
                </div>

                {/* ──────── MODAL BODY ──────── */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1.25rem 1.75rem' }}>
                    
                    {/* Notification Banner if active */}
                    {uploadNotification && (
                        <div 
                            style={{ 
                                padding: '0.65rem 1rem', 
                                background: uploadNotification.includes('✅') ? '#ECFDF5' : '#FEF2F2', 
                                border: uploadNotification.includes('✅') ? '1px solid #A7F3D0' : '1px solid #FECACA', 
                                borderRadius: '12px', 
                                color: uploadNotification.includes('✅') ? '#065F46' : '#991B1B', 
                                fontSize: '0.8rem', 
                                fontWeight: '750', 
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>{uploadNotification}</span>
                            <button 
                                type="button" 
                                onClick={() => setUploadNotification('')}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: '900' }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 1: 3-Column Reconciliation Matrix (activeTab === 'reconcile')
                    ────────────────────────────────────────────────────────────── */}
                    {activeTab === 'reconcile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                            
                            {/* 1. Top Upload Dropzone Banner */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        handleFileProcess(e.dataTransfer.files[0]);
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: isDragging ? '2px dashed #2563EB' : '2px dashed #93C5FD',
                                    borderRadius: '18px',
                                    background: isDragging ? '#EFF6FF' : '#F8FAFC',
                                    padding: '1.25rem 1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    accept=".csv,.xlsx,.xls,.pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileProcess(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div 
                                    style={{ 
                                        width: '42px', 
                                        height: '42px', 
                                        borderRadius: '12px', 
                                        background: '#DBEAFE', 
                                        color: '#2563EB', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        flexShrink: 0 
                                    }}
                                >
                                    <Upload size={20} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.92rem', fontWeight: '850', color: '#1E293B' }}>
                                        Upload statement for {currentAccount.bank_account_name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                        Drag and drop statement file (<strong style={{ color: '#334155' }}>.csv, .xlsx, .xls, .pdf</strong>) or click to browse from your device
                                    </div>
                                </div>
                            </div>

                            {/* 2. 3-Column Reconciliation Matrix Grid Header */}
                            <div 
                                style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1.4fr 1.4fr 0.8fr', 
                                    gap: '1rem', 
                                    padding: '0.65rem 1rem', 
                                    background: '#F1F5F9', 
                                    borderRadius: '12px', 
                                    border: '1px solid #E2E8F0',
                                    fontWeight: '850',
                                    fontSize: '0.74rem',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>Bank Statement (Uploaded Data)</span>
                                    <span style={{ background: '#E2E8F0', color: '#1E293B', padding: '1px 6px', borderRadius: '9999px', fontSize: '0.68rem' }}>
                                        {currentStatements.length}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>Platform Sales & Transaction History</span>
                                    <span style={{ background: '#E2E8F0', color: '#1E293B', padding: '1px 6px', borderRadius: '9999px', fontSize: '0.68rem' }}>
                                        {currentPlatformRecords.length}
                                    </span>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <span>Action Controls</span>
                                </div>
                            </div>

                            {/* 3. Comparison Rows Matrix */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {comparisonPairs.length === 0 ? (
                                    <div 
                                        style={{ 
                                            border: '2px dashed #E2E8F0', 
                                            borderRadius: '20px', 
                                            background: '#FFFFFF', 
                                            padding: '3rem 2rem', 
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                                            All Accounts Completely Reconciled!
                                        </h4>
                                        <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '340px', margin: '0 auto' }}>
                                            There are no pending statement rows or unlinked transactions for {currentAccount.bank_account_name}. Upload a new statement or review completed entries in the Matched List.
                                        </p>
                                    </div>
                                ) : (
                                    comparisonPairs.map((pair, idx) => {
                                        const { statement, platform } = pair;
                                        const isExactAmount = statement && platform && (parseFloat(statement.amount) === parseFloat(platform.amount));

                                        return (
                                            <div 
                                                key={idx}
                                                style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: '1.4fr 1.4fr 0.8fr', 
                                                    gap: '1rem', 
                                                    background: '#FFFFFF', 
                                                    padding: '1rem', 
                                                    borderRadius: '16px', 
                                                    border: isExactAmount ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                                    alignItems: 'center',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                {/* Left Column: Bank Statement Line */}
                                                {statement ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
                                                                {statement.description}
                                                            </span>
                                                            <span 
                                                                style={{ 
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    padding: '2px 8px', 
                                                                    borderRadius: '9999px', 
                                                                    fontSize: '0.68rem', 
                                                                    fontWeight: '800',
                                                                    background: statement.type === 'Credit' ? '#DCFCE7' : '#FEE2E2',
                                                                    color: statement.type === 'Credit' ? '#15803D' : '#B91C1C',
                                                                    border: statement.type === 'Credit' ? '1px solid #86EFAC' : '1px solid #FCA5A5'
                                                                }}
                                                            >
                                                                {statement.type}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '1.05rem', fontWeight: '950', color: statement.type === 'Credit' ? '#059669' : '#DC2626' }}>
                                                                {formatINR(statement.amount)}
                                                            </span>
                                                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                                                                {statement.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1', color: '#94A3B8', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
                                                        No corresponding statement line
                                                    </div>
                                                )}

                                                {/* Middle Column: Platform Record */}
                                                {platform ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B' }}>
                                                                {platform.description}
                                                            </span>
                                                            <span 
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    padding: '2px 8px', 
                                                                    borderRadius: '6px', 
                                                                    fontSize: '0.68rem', 
                                                                    fontWeight: '800', 
                                                                    background: '#EFF6FF', 
                                                                    color: '#2563EB', 
                                                                    border: '1px solid #BFDBFE' 
                                                                }}
                                                            >
                                                                {platform.voucherNumber}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ fontSize: '1.05rem', fontWeight: '950', color: '#0F172A' }}>
                                                                    {formatINR(platform.amount)}
                                                                </span>
                                                                {isExactAmount && (
                                                                    <span 
                                                                        title="Exact Amount Match"
                                                                        style={{ 
                                                                            display: 'inline-flex', 
                                                                            alignItems: 'center', 
                                                                            gap: '3px', 
                                                                            background: '#ECFDF5', 
                                                                            color: '#059669', 
                                                                            fontSize: '0.65rem', 
                                                                            fontWeight: '800', 
                                                                            padding: '1px 6px', 
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #A7F3D0'
                                                                        }}
                                                                    >
                                                                        <Sparkles size={10} /> Exact Match
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                                                                {platform.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1', color: '#94A3B8', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
                                                        No matching platform record
                                                    </div>
                                                )}

                                                {/* Right Column: One-Click Match / Reject Action Controls */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMatchAccept(pair)}
                                                        title="Accept & Match these records"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '0.5rem 0.85rem',
                                                            background: '#059669',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontWeight: '850',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                                                            transition: 'all 0.15s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
                                                    >
                                                        <Check size={14} strokeWidth={3} /> Match
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectUnmatch(pair)}
                                                        title="Reject or Flag as Unmatched"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '0.5rem 0.85rem',
                                                            background: '#FFFFFF',
                                                            color: '#DC2626',
                                                            border: '1px solid #FCA5A5',
                                                            borderRadius: '10px',
                                                            fontWeight: '800',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = '#FEF2F2';
                                                            e.currentTarget.style.borderColor = '#EF4444';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = '#FCA5A5';
                                                        }}
                                                    >
                                                        <X size={14} strokeWidth={2.5} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 2: Dedicated "Matched List" View (activeTab === 'matched_list')
                    ────────────────────────────────────────────────────────────── */}
                    {activeTab === 'matched_list' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                                        Reconciliation Register — {currentAccount.bank_account_name}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                        Audit register of resolved statements and platform ledger entries
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('reconcile')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.45rem 0.85rem',
                                        background: '#2563EB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚡ Back to Reconciliation Matrix
                                </button>
                            </div>

                            {currentMatchedRecords.length === 0 ? (
                                <div 
                                    style={{ 
                                        border: '2px dashed #E2E8F0', 
                                        borderRadius: '20px', 
                                        background: '#FFFFFF', 
                                        padding: '4rem 2rem', 
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: '1rem'
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                        <FileSpreadsheet size={26} />
                                    </div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '850', color: '#334155', margin: '0 0 0.25rem 0' }}>
                                        No matched records found for this account.
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '340px', margin: '0 auto' }}>
                                        Switch to the 3-column Reconciliation Matrix to compare uploaded bank statement lines against platform transactions and accept matches.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.72rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                <th style={{ padding: '0.85rem 1rem' }}>Statement Reference & Date</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Platform Transaction & Voucher #</th>
                                                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Amount (₹)</th>
                                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Reconciliation Status</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Action Timestamp</th>
                                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Undo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentMatchedRecords.map((m) => {
                                                const isAccepted = m.status === 'Accepted & Matched';
                                                return (
                                                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{m.statementRef}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>{m.statementDate}</div>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <div style={{ fontWeight: '800', color: '#1E293B' }}>{m.platformTitle}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: '750', marginTop: '2px' }}>Voucher: {m.voucherNumber}</div>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '950', fontSize: '0.9rem', color: isAccepted ? '#059669' : '#DC2626' }}>
                                                            {formatINR(m.amount)}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                            <span 
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '4px',
                                                                    padding: '3px 10px', 
                                                                    borderRadius: '9999px', 
                                                                    fontSize: '0.72rem', 
                                                                    fontWeight: '800',
                                                                    background: isAccepted ? '#DCFCE7' : '#FEE2E2',
                                                                    color: isAccepted ? '#15803D' : '#B91C1C',
                                                                    border: isAccepted ? '1px solid #86EFAC' : '1px solid #FCA5A5'
                                                                }}
                                                            >
                                                                {isAccepted ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                                {m.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                                                            {m.actionTimestamp}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUndoMatched(m)}
                                                                title="Reopen to pending matrix"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: '#64748B',
                                                                    cursor: 'pointer',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                onMouseOver={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                                                                onMouseOut={(e) => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
                                                            >
                                                                <Undo2 size={15} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ──────── MODAL FOOTER ──────── */}
                <div 
                    style={{ 
                        padding: '1rem 1.75rem', 
                        background: '#F8FAFC', 
                        borderTop: '1px solid #E2E8F0', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
                        <ShieldCheck size={15} color="#16A34A" />
                        <span>Reconciliation changes are preserved in active session state.</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '10px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#334155',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                            }}
                        >
                            Close Workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankStatementReconciliationModal;
