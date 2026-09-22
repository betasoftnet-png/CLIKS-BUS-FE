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
import * as XLSX from 'xlsx';

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
    const [currentStep, setCurrentStep] = useState(0); // 0: Bank Statement | 1: Platform History | 2: Action Controls

    // Date Period Filter States
    const [statementFilter, setStatementFilter] = useState('all');
    const [statementFromDate, setStatementFromDate] = useState('');
    const [statementToDate, setStatementToDate] = useState('');

    const [platformFilter, setPlatformFilter] = useState('all');
    const [platformFromDate, setPlatformFromDate] = useState('');
    const [platformToDate, setPlatformToDate] = useState('');

    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Date parsing helper
    const parseRecordDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
        const str = String(dateStr).trim();

        // Match DD/MM/YYYY or DD-MM-YYYY
        const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (ddmmyyyy) {
            let [, day, month, year] = ddmmyyyy;
            if (year.length === 2) year = '20' + year;
            const parsed = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            if (!isNaN(parsed.getTime())) return parsed;
        }

        const parsed = new Date(str);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const isDateInFilter = (dateStr, filterType, customFrom, customTo) => {
        if (!filterType || filterType === 'all') return true;
        const dateObj = parseRecordDate(dateStr);
        if (!dateObj) return true;

        const now = new Date();

        if (filterType === '1m') {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 1);
            return dateObj >= past && dateObj <= now;
        }
        if (filterType === '2m') {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 2);
            return dateObj >= past && dateObj <= now;
        }
        if (filterType === '3m') {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 3);
            return dateObj >= past && dateObj <= now;
        }
        if (filterType === 'custom') {
            let match = true;
            if (customFrom) {
                const fromD = new Date(customFrom);
                fromD.setHours(0, 0, 0, 0);
                if (dateObj < fromD) match = false;
            }
            if (customTo) {
                const toD = new Date(customTo);
                toD.setHours(23, 59, 59, 999);
                if (dateObj > toD) match = false;
            }
            return match;
        }
        return true;
    };

    const renderFilterToolbar = (label, filterVal, setFilter, fromVal, setFrom, toVal, setTo) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            padding: '0.4rem 0.75rem',
            borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: '#0d3829' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {label}:
                </span>
            </div>
            <select
                value={filterVal}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                    fontSize: '0.75rem',
                    fontWeight: '750',
                    color: '#0F172A',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.2rem 0.5rem',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                <option value="all">All Dates</option>
                <option value="1m">Last 1 Month</option>
                <option value="2m">Last 2 Months</option>
                <option value="3m">Last 3 Months</option>
                <option value="custom">Custom Period</option>
            </select>

            {filterVal === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>From</span>
                    <input
                        type="date"
                        value={fromVal}
                        onChange={(e) => setFrom(e.target.value)}
                        style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.4rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            outline: 'none',
                            color: '#0F172A'
                        }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>To</span>
                    <input
                        type="date"
                        value={toVal}
                        onChange={(e) => setTo(e.target.value)}
                        style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.4rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            outline: 'none',
                            color: '#0F172A'
                        }}
                    />
                </div>
            )}
        </div>
    );

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

    // Filtered data by selected target bank account and date filters
    const currentStatements = useMemo(() => {
        return statementRecords
            .filter(s => isAccountMatch(s.accountId, currentAccount))
            .filter(s => isDateInFilter(s.statementDate || s.date, statementFilter, statementFromDate, statementToDate));
    }, [statementRecords, currentAccount, statementFilter, statementFromDate, statementToDate]);

    const currentPlatformRecords = useMemo(() => {
        return platformRecords
            .filter(p => isAccountMatch(p.accountId, currentAccount))
            .filter(p => isDateInFilter(p.date, platformFilter, platformFromDate, platformToDate));
    }, [platformRecords, currentAccount, platformFilter, platformFromDate, platformToDate]);

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
            const accountId = currentAccount.id || currentAccount.bank_account_id;

            // ── Parse rows from file ──────────────────────────────────────────
            let rawRows = []; // array of plain objects {[colName]: value}

            if (ext === 'xlsx' || ext === 'xls') {
                // Read via SheetJS
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                // Convert to 2D array (raw, no header inference yet)
                const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                // ── Dynamic header detection: find row with 'date' AND 'narration' ──
                let headerRowIdx = -1;
                for (let r = 0; r < Math.min(aoa.length, 20); r++) {
                    const row = aoa[r].map(c => String(c).toLowerCase().trim());
                    const hasDate = row.some(c => c === 'date');
                    const hasNarration = row.some(c => c === 'narration' || c === 'description' || c === 'particulars');
                    if (hasDate && hasNarration) { headerRowIdx = r; break; }
                }
                if (headerRowIdx === -1) {
                    setUploadNotification(`⚠️ Could not detect header row in "${fileName}". Ensure columns include Date & Narration/Description.`);
                    return;
                }

                const headers = aoa[headerRowIdx].map(c => String(c).trim());
                for (let r = headerRowIdx + 1; r < aoa.length; r++) {
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = aoa[r][i] ?? ''; });
                    rawRows.push(obj);
                }

            } else if (ext === 'csv') {
                const text = await file.text();
                const csvLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

                // Dynamic header detection for CSV
                const delimiter = csvLines[0]?.includes('\t') ? '\t' : (csvLines[0]?.includes(';') ? ';' : ',');
                let headerRowIdx = -1;
                for (let r = 0; r < Math.min(csvLines.length, 20); r++) {
                    const cols = csvLines[r].toLowerCase();
                    if ((cols.includes('date') || cols.includes('txn date')) &&
                        (cols.includes('narration') || cols.includes('description') || cols.includes('particulars'))) {
                        headerRowIdx = r;
                        break;
                    }
                }
                if (headerRowIdx === -1) headerRowIdx = 0; // fallback to first row

                const headers = csvLines[headerRowIdx].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
                for (let r = headerRowIdx + 1; r < csvLines.length; r++) {
                    const vals = csvLines[r].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
                    rawRows.push(obj);
                }
            } else {
                setUploadNotification(`⚠️ Unsupported format ".${ext}". Please upload .xlsx, .xls, or .csv files.`);
                return;
            }

            // ── Column mapping: HDFC & standard bank formats ──────────────────
            const findCol = (row, candidates) => {
                for (const key of Object.keys(row)) {
                    const k = key.toLowerCase().trim();
                    if (candidates.some(c => k === c || k.includes(c))) return key;
                }
                return null;
            };

            // Detect columns from first data row
            const sampleRow = rawRows[0] || {};
            const narrationKey  = findCol(sampleRow, ['narration', 'description', 'particulars', 'details', 'remarks']);
            const dateKey        = findCol(sampleRow, ['date', 'txn date', 'value date', 'transaction date']);
            const refKey         = findCol(sampleRow, ['chq/ref no', 'ref no', 'reference number', 'cheque no', 'transaction reference', 'ref']);
            const withdrawalKey  = findCol(sampleRow, ['withdrawal amt', 'withdrawal amount', 'debit', 'debit amount', 'debit amt', 'dr']);
            const depositKey     = findCol(sampleRow, ['deposit amt', 'deposit amount', 'credit', 'credit amount', 'credit amt', 'cr']);
            const balanceKey     = findCol(sampleRow, ['closing balance', 'balance', 'closing bal']);
            const amountKey      = findCol(sampleRow, ['amount', 'amt']); // generic fallback
            const typeKey        = findCol(sampleRow, ['type', 'cr/dr', 'txn type', 'transaction type']);

            // ── Build statement records ───────────────────────────────────────
            const newRows = [];
            for (let i = 0; i < rawRows.length; i++) {
                const row = rawRows[i];

                const rawNarration = String(row[narrationKey] ?? '').trim();
                // Skip blank rows, opening balance rows, zero-value carry-forwards
                if (!rawNarration) continue;
                if (/opening balance|ob |closing balance/i.test(rawNarration)) continue;

                // Parse withdrawal (debit) and deposit (credit)
                const cleanNum = v => parseFloat(String(v).replace(/[^0-9.-]+/g, '')) || 0;
                const withdrawalAmt = withdrawalKey ? cleanNum(row[withdrawalKey]) : 0;
                const depositAmt    = depositKey    ? cleanNum(row[depositKey])    : 0;
                const closingBalance = balanceKey   ? cleanNum(row[balanceKey])    : 0;

                // If both columns exist, use the non-zero one; if neither, fall back to generic amount
                let amount = 0;
                let type = 'Credit';
                if (withdrawalKey || depositKey) {
                    if (depositAmt > 0 && withdrawalAmt === 0) { amount = depositAmt; type = 'Credit'; }
                    else if (withdrawalAmt > 0 && depositAmt === 0) { amount = withdrawalAmt; type = 'Debit'; }
                    else if (depositAmt > 0 && withdrawalAmt > 0) { amount = depositAmt; type = 'Credit'; } // unusual; prefer deposit
                    else if (depositAmt === 0 && withdrawalAmt === 0) continue; // both zero — skip
                    else { amount = depositAmt || withdrawalAmt; type = depositAmt > 0 ? 'Credit' : 'Debit'; }
                } else if (amountKey) {
                    const raw = cleanNum(row[amountKey]);
                    if (raw === 0) continue;
                    // Use type column or sign to determine cr/dr
                    const rawType = String(row[typeKey] ?? '').toLowerCase();
                    type = rawType.includes('cr') || rawType.includes('credit') || rawType.includes('deposit') ? 'Credit' : 'Debit';
                    amount = Math.abs(raw);
                } else {
                    continue; // no amount info
                }

                // Format date
                let dateStr = '';
                const rawDate = row[dateKey];
                if (rawDate instanceof Date) {
                    dateStr = rawDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
                } else if (rawDate) {
                    // Try to parse HDFC format: DD/MM/YY or DD-MM-YYYY etc.
                    const parsed = new Date(String(rawDate).replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, '$2/$1/$3'));
                    dateStr = isNaN(parsed) ? String(rawDate) : parsed.toLocaleDateString('en-GB');
                } else {
                    dateStr = new Date().toLocaleDateString('en-GB');
                }

                newRows.push({
                    id: `stmt-up-${accountId}-${Date.now()}-${i}`,
                    accountId,
                    statementTitle: rawNarration,
                    description: rawNarration, // keep for compat
                    statementRef: String(row[refKey] ?? '').trim(),
                    statementDate: dateStr,
                    date: dateStr, // keep for compat
                    Debit: withdrawalAmt,
                    Credit: depositAmt,
                    amount,
                    type,
                    closingBalance
                });
            }

            if (newRows.length === 0) {
                setUploadNotification(`⚠️ No valid transactions found in "${fileName}". Check that Narration/Date/Amount columns exist and are not all zero.`);
                return;
            }

            // Overwrite existing statement state completely
            setStatementRecords(newRows);
            setUploadNotification(`✅ Loaded ${newRows.length} transactions from "${fileName}" for ${currentAccount.bank_account_name}! Mock data has been removed.`);

        } catch (err) {
            console.error('Error reading statement file:', err);
            setUploadNotification(`⚠️ Error parsing "${fileName}": ${err.message}. Please check file format.`);
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
                        background: 'linear-gradient(135deg, #0d3829 0%, #0d3829 100%)', 
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
                            <p style={{ color: 'rgba(167, 243, 208, 0.7)', fontSize: '0.78rem', margin: '2px 0 0 0', fontWeight: '500' }}>
                                Account-isolated statement parsing, platform transaction matching & reconciliation ledger
                            </p>
                        </div>
                    </div>

                    {/* Center & Right: Target Bank Selector, Matched List Toggle, Close */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                        
                        {/* Target Bank Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.07)', padding: '0.35rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
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
                                    background: '#0d3829',
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

                            {/* ── Step Panel Navigator ── */}
                            {(() => {
                                const STEPS = [
                                    'BANK STATEMENT (UPLOADED DATA)',
                                    'PLATFORM SALES & TRANSACTION HISTORY',
                                    'ACTION CONTROLS',
                                    'OVERALL VISIT'
                                ];
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                        {/* Step indicator bar */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
                                            {STEPS.map((label, i) => (
                                                <React.Fragment key={i}>
                                                    <div
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                            padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                                            background: currentStep === i ? '#0d3829' : '#E2E8F0',
                                                            color: currentStep === i ? '#fff' : '#64748B',
                                                            fontSize: '0.7rem', fontWeight: '850',
                                                            textTransform: 'uppercase', letterSpacing: '0.04em',
                                                            cursor: 'pointer', transition: 'all 0.15s',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        onClick={() => setCurrentStep(i)}
                                                    >
                                                        <span style={{
                                                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                                            background: currentStep === i ? 'rgba(255,255,255,0.25)' : '#CBD5E1',
                                                            color: currentStep === i ? '#fff' : '#475569',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.65rem', fontWeight: '900'
                                                        }}>{i + 1}</span>
                                                        {label}
                                                        {i === 0 && <span style={{ background: 'rgba(255,255,255,0.2)', color: currentStep === 0 ? '#fff' : '#475569', padding: '0px 5px', borderRadius: '9999px', fontSize: '0.65rem' }}>{currentStatements.length}</span>}
                                                        {i === 1 && <span style={{ background: 'rgba(255,255,255,0.2)', color: currentStep === 1 ? '#fff' : '#475569', padding: '0px 5px', borderRadius: '9999px', fontSize: '0.65rem' }}>{currentPlatformRecords.length}</span>}
                                                    </div>
                                                    {i < 3 && <div style={{ flex: 1, minWidth: '10px', height: '2px', background: currentStep > i ? '#0d3829' : '#E2E8F0', borderRadius: '9999px', transition: 'background 0.3s' }} />}
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {/* Date Period Filter Toolbars */}
                                        {currentStep === 0 && (
                                            <div>
                                                {renderFilterToolbar("Statement Period", statementFilter, setStatementFilter, statementFromDate, setStatementFromDate, statementToDate, setStatementToDate)}
                                            </div>
                                        )}
                                        {currentStep === 1 && (
                                            <div>
                                                {renderFilterToolbar("Platform Period", platformFilter, setPlatformFilter, platformFromDate, setPlatformFromDate, platformToDate, setPlatformToDate)}
                                            </div>
                                        )}
                                        {currentStep === 3 && (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.1fr 1fr 180px',
                                                gap: '1.5rem',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    {renderFilterToolbar("Statement Period", statementFilter, setStatementFilter, statementFromDate, setStatementFromDate, statementToDate, setStatementToDate)}
                                                </div>
                                                <div>
                                                    {renderFilterToolbar("Platform Period", platformFilter, setPlatformFilter, platformFromDate, setPlatformFromDate, platformToDate, setPlatformToDate)}
                                                </div>
                                                <div />
                                            </div>
                                        )}

                                        {/* Cards area with nav arrows */}
                                        <div style={{ position: 'relative' }}>

                                            {/* Left Arrow */}
                                            {currentStep > 0 && currentStep < 3 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '-25px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        zIndex: 50,
                                                        width: '44px', height: '44px', borderRadius: '50%',
                                                        background: '#0d3829', color: 'white',
                                                        border: '2px solid white', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '1.25rem', fontWeight: '900',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#155c41'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#0d3829'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                                                    title="Previous step"
                                                >⇦</button>
                                            )}

                                            {/* Right Arrow */}
                                            {currentStep < 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(s => Math.min(2, s + 1))}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '-25px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        zIndex: 50,
                                                        width: '44px', height: '44px', borderRadius: '50%',
                                                        background: '#0d3829', color: 'white',
                                                        border: '2px solid white', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '1.25rem', fontWeight: '900',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#155c41'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#0d3829'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                                                    title="Next step"
                                                >⇨</button>
                                            )}

                                            {comparisonPairs.length === 0 ? (
                                                <div style={{
                                                    border: '2px dashed #E2E8F0', borderRadius: '20px',
                                                    background: '#FFFFFF', padding: '3rem 2rem', textAlign: 'center',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                                        <CheckCircle2 size={28} />
                                                    </div>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.25rem 0' }}>All Accounts Completely Reconciled!</h4>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '340px', margin: '0 auto' }}>
                                                        There are no pending statement rows or unlinked transactions for {currentAccount.bank_account_name}.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {comparisonPairs.map((pair, idx) => {
                                                        const { statement, platform } = pair;
                                                        const isExactAmount = statement && platform && (parseFloat(statement.amount) === parseFloat(platform.amount));

                                                        // side-by-side visit mode
                                                        if (currentStep === 3) {
                                                            return (
                                                                <div key={idx} style={{
                                                                    background: '#FFFFFF', padding: '1rem',
                                                                    borderRadius: '18px',
                                                                    border: isExactAmount ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                                    display: 'grid',
                                                                    gridTemplateColumns: '1.1fr 1fr 180px',
                                                                    gap: '1.5rem',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {/* Column 1: Bank Statement */}
                                                                    <div style={{ borderRight: '1px solid #F1F5F9', paddingRight: '1rem' }}>
                                                                        {statement ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                                                                        {statement.statementTitle || statement.description}
                                                                                    </span>
                                                                                    {statement.statementRef && (
                                                                                        <span style={{ fontSize: '0.62rem', fontWeight: '900', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                                                                            REF: {statement.statementRef}
                                                                                        </span>
                                                                                    )}
                                                                                    <span style={{
                                                                                        padding: '2px 8px', borderRadius: '9999px',
                                                                                        fontSize: '0.62rem', fontWeight: '800',
                                                                                        background: statement.type === 'Credit' ? '#DCFCE7' : '#FEE2E2',
                                                                                        color: statement.type === 'Credit' ? '#15803D' : '#B91C1C',
                                                                                        marginLeft: 'auto'
                                                                                    }}>{statement.type}</span>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                        <span style={{ fontSize: '1.15rem', fontWeight: '950', color: statement.type === 'Credit' ? '#059669' : '#DC2626' }}>
                                                                                            {formatINR(statement.amount)}
                                                                                        </span>
                                                                                        {statement.closingBalance !== undefined && statement.closingBalance !== 0 && (
                                                                                            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>Balance: {formatINR(statement.closingBalance)}</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '700' }}>{statement.statementDate || statement.date}</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ color: '#94A3B8', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>No statement line</div>
                                                                        )}
                                                                    </div>

                                                                    {/* Column 2: Platform History */}
                                                                    <div style={{ borderRight: '1px solid #F1F5F9', paddingRight: '1rem' }}>
                                                                        {platform ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{platform.description}</span>
                                                                                    <span style={{
                                                                                        padding: '2px 6px', borderRadius: '4px',
                                                                                        fontSize: '0.65rem', fontWeight: '800',
                                                                                        background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                                                                                        flexShrink: 0
                                                                                    }}>{platform.voucherNumber}</span>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                                    <span style={{ fontSize: '1.1rem', fontWeight: '950', color: '#0F172A' }}>{formatINR(platform.amount)}</span>
                                                                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>{platform.date}</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ color: '#94A3B8', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>No platform record</div>
                                                                        )}
                                                                    </div>

                                                                    {/* Column 3: Action Controls */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMatchAccept(pair)}
                                                                            style={{
                                                                                padding: '0.45rem', borderRadius: '10px',
                                                                                background: '#00875a', color: 'white',
                                                                                border: 'none', fontWeight: '900',
                                                                                fontSize: '0.78rem', cursor: 'pointer',
                                                                                transition: 'all 0.15s',
                                                                                boxShadow: '0 2px 8px rgba(0,135,90,0.2)'
                                                                            }}
                                                                            onMouseOver={(e) => e.currentTarget.style.background = '#006644'}
                                                                            onMouseOut={(e) => e.currentTarget.style.background = '#00875a'}
                                                                        >
                                                                            <Check size={12} strokeWidth={3} style={{ display: 'inline', marginRight: '4px' }} /> Match
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRejectUnmatch(pair)}
                                                                            style={{
                                                                                padding: '0.45rem', borderRadius: '10px',
                                                                                background: 'white', color: '#DC2626',
                                                                                border: '1.5px solid #FCA5A5', fontWeight: '900',
                                                                                fontSize: '0.78rem', cursor: 'pointer',
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                            onMouseOver={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#EF4444'; }}
                                                                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                                                                        >
                                                                            <X size={12} strokeWidth={2.5} style={{ display: 'inline', marginRight: '4px' }} /> Reject
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={idx} style={{
                                                                background: '#FFFFFF', padding: '1.25rem 1.5rem',
                                                                borderRadius: '18px',
                                                                border: isExactAmount ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                {/* Step 0: Bank Statement */}
                                                                {currentStep === 0 && (
                                                                    statement ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                                    <span style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A' }}>{statement.statementTitle || statement.description}</span>
                                                                                    {statement.statementRef && (
                                                                                        <span style={{ fontSize: '0.68rem', fontWeight: '900', background: '#F8FAFC', color: '#475569', padding: '2px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                                                                            REF: {statement.statementRef}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <span style={{
                                                                                    padding: '4px 12px', borderRadius: '9999px',
                                                                                    fontSize: '0.75rem', fontWeight: '800',
                                                                                    background: statement.type === 'Credit' ? '#DCFCE7' : '#FEE2E2',
                                                                                    color: statement.type === 'Credit' ? '#15803D' : '#B91C1C',
                                                                                    border: statement.type === 'Credit' ? '1px solid #86EFAC' : '1px solid #FCA5A5'
                                                                                }}>{statement.type}</span>
                                                                            </div>
                                                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                                    <span style={{ fontSize: '1.6rem', fontWeight: '950', color: statement.type === 'Credit' ? '#059669' : '#DC2626', letterSpacing: '-0.02em' }}>
                                                                                        {formatINR(statement.amount)}
                                                                                    </span>
                                                                                    {statement.closingBalance !== undefined && statement.closingBalance !== 0 && (
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                                                                                            <span>Closing Balance:</span>
                                                                                            <span style={{ color: '#0F172A', fontWeight: '800' }}>{formatINR(statement.closingBalance)}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#94A3B8', fontWeight: '700' }}>
                                                                                    <Calendar size={14} />
                                                                                    {statement.statementDate || statement.date}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic', padding: '1rem' }}>No corresponding statement line</div>
                                                                    )
                                                                )}

                                                                {/* Step 1: Platform History */}
                                                                {currentStep === 1 && (
                                                                    platform ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{platform.description}</span>
                                                                                <span style={{
                                                                                    padding: '3px 10px', borderRadius: '6px',
                                                                                    fontSize: '0.72rem', fontWeight: '800',
                                                                                    background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE'
                                                                                }}>{platform.voucherNumber}</span>
                                                                            </div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                    <span style={{ fontSize: '1.3rem', fontWeight: '950', color: '#0F172A' }}>{formatINR(platform.amount)}</span>
                                                                                    {isExactAmount && (
                                                                                        <span style={{
                                                                                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                                                            background: '#ECFDF5', color: '#059669',
                                                                                            fontSize: '0.68rem', fontWeight: '800',
                                                                                            padding: '2px 8px', borderRadius: '6px', border: '1px solid #A7F3D0'
                                                                                        }}>
                                                                                            <Sparkles size={10} /> Exact Match
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>{platform.date}</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic', padding: '0.5rem' }}>No matching platform record</div>
                                                                    )
                                                                )}

                                                                {/* Step 2: Action Controls */}
                                                                {currentStep === 2 && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMatchAccept(pair)}
                                                                            style={{
                                                                                padding: '0.6rem 2.5rem', borderRadius: '9999px',
                                                                                background: '#00875a', color: 'white',
                                                                                border: 'none', fontWeight: '900',
                                                                                fontSize: '0.88rem', cursor: 'pointer',
                                                                                boxShadow: '0 3px 10px rgba(0,135,90,0.3)',
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                            onMouseOver={(e) => e.currentTarget.style.background = '#006644'}
                                                                            onMouseOut={(e) => e.currentTarget.style.background = '#00875a'}
                                                                        >
                                                                            <Check size={14} strokeWidth={3} style={{ display: 'inline', marginRight: '6px' }} /> Match
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRejectUnmatch(pair)}
                                                                            style={{
                                                                                padding: '0.6rem 2.5rem', borderRadius: '9999px',
                                                                                background: 'white', color: '#DC2626',
                                                                                border: '2px solid #FCA5A5', fontWeight: '900',
                                                                                fontSize: '0.88rem', cursor: 'pointer',
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                            onMouseOver={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#EF4444'; }}
                                                                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                                                                        >
                                                                            <X size={14} strokeWidth={2.5} style={{ display: 'inline', marginRight: '6px' }} /> Reject
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
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
