import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import FilterableTableHead from '../components/FilterableTableHead';
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
    TrendingUp,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { apiClient } from '../api/client';
import { suppliersService } from '../services/suppliersService';
import { accountingService } from '../services/accountingService';
import { purchasesService } from '../services/purchasesService';
import '../App.css';
import { useCurrency } from '../context';

const BusinessPayments = () => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('receivables');
    const [colFilters, setColFilters] = React.useState({}); // 'receivables', 'payables', 'bank', 'reminders'
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();

    // Unified query loading both ledgers, accounts, and overdue invoices
    const { data: reportsData = { receivables: [], payables: [], accounts: [], overdueInvoices: [] }, refetch: refetchReports } = useQuery({
        queryKey: ['paymentReports'],
        queryFn: () => paymentService.getReports()
    });

    const { data: purchasesList = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: () => purchasesService.getPurchases().catch(() => [])
    });

    const fetchSupplierPayables = async () => {
        try {
            await Promise.all([
                refetchReports(),
                queryClient.invalidateQueries({ queryKey: ['paymentReports'] }),
                queryClient.invalidateQueries({ queryKey: ['purchases'] }),
                queryClient.invalidateQueries({ queryKey: ['ledger'] }),
                queryClient.invalidateQueries({ queryKey: ['suppliersList'] }),
                queryClient.invalidateQueries({ queryKey: ['bankAccounts'] }),
                queryClient.invalidateQueries({ queryKey: ['accounts'] }),
                queryClient.invalidateQueries({ queryKey: ['profitLoss'] }),
                queryClient.invalidateQueries({ queryKey: ['balanceSheet'] }),
                queryClient.invalidateQueries({ queryKey: ['expenses'] })
            ]);
        } catch (err) {
            console.error('Error in fetchSupplierPayables:', err);
        }
    };

    const { data: dbLedger = [] } = useQuery({
        queryKey: ['ledger'],
        queryFn: () => accountingService.getLedger()
    });

    const handleTemplateVisibility = () => {
        alert("Cash in Hand Template Visibility: Displaying default standard ledger format.");
    };

    const handleAttachTransaction = () => {
        alert("Attach Transaction Detail: Please select a transaction or upload attachment.");
    };

    const cashLedgerData = React.useMemo(() => {
        const cashTxs = (Array.isArray(dbLedger) ? dbLedger : [])
            .filter(tx => {
                const m = String(tx.mode || tx.payment_mode || '').trim().toLowerCase();
                return m === 'cash' || m.includes('cash in hand') || m.includes('hand') || !tx.mode;
            })
            .sort((a, b) => (new Date(a.date || a.created_at) - new Date(b.date || b.created_at)) || (a.id - b.id));

        let runningBal = 0;
        const mapped = cashTxs.map(tx => {
            const isIncome = tx.entry_type === 'income' || tx.type === 'income' || tx.type === 'credit';
            const amt = parseFloat(tx.amount) || 0;
            if (isIncome) {
                runningBal += amt;
            } else {
                runningBal -= amt;
            }
            return {
                date: tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                description: tx.notes || tx.category || tx.description || 'Cash Transaction',
                type: isIncome ? 'Credit' : 'Debit',
                amount: amt.toLocaleString('en-IN'),
                balanceAfter: runningBal.toLocaleString('en-IN')
            };
        });

        if (mapped.length === 0) {
            return [
                {
                    date: new Date().toLocaleDateString('en-GB'),
                    description: 'Default Opening Cash Balance',
                    type: 'Credit',
                    amount: '0',
                    balanceAfter: '0'
                }
            ];
        }

        return mapped.reverse();
    }, [dbLedger]);

    const { data: suppliersList = [] } = useQuery({
        queryKey: ['suppliersList'],
        queryFn: async () => {
            const res = await suppliersService.getSuppliers();
            return Array.isArray(res) ? res : (res.rows || res.data || []);
        }
    });

    // Mutations
    const receiveMutation = useMutation({
        mutationFn: (data) => paymentService.receivePayment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setIsPaymentModalOpen(false);
            alert('Customer payment recorded and committed successfully.');
        },
        onError: (err) => {
            alert(err?.response?.data?.message || 'Failed to record customer payment. Please try again.');
        }
    });

    const payMutation = useMutation({
        mutationFn: (data) => paymentService.paySupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['suppliersList'] });
            setSupplierForm(prev => ({ ...prev, total_amount: '', paid_amount: '' }));
            setIsSupplierModalOpen(false);
            alert('Supplier payment authorized and processed.');
        },
        onError: (err) => {
            const errStatus = err?.status || err?.response?.status;
            if (errStatus === 200 || errStatus === 201 || (typeof errStatus === 'number' && errStatus >= 200 && errStatus <= 299)) {
                return;
            }
            alert(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to process supplier payment. Please try again.');
        }
    });

    const transferMutation = useMutation({
        mutationFn: (data) => paymentService.transferVault(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
            setTransferForm(prev => ({ ...prev, amount: '' }));
            setIsTransferModalOpen(false);
            alert('Internal fund transfer settled across cash/bank registers!');
        },
        onError: (err) => {
            alert(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to process internal vault transfer.');
        }
    });

    const dbReceivables = reportsData.receivables || [];
    const dbPayables = reportsData.payables || [];
    const dbAccounts = reportsData.accounts || [];
    const dbOverdues = reportsData.overdueInvoices || [];

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

    const payables = dbPayables.map(rec => {
        let originalTotal = 0;
        if (rec.notes) {
            try {
                const parsed = JSON.parse(rec.notes);
                if (parsed.original_due_amount !== undefined && !isNaN(parseFloat(parsed.original_due_amount))) {
                    originalTotal = parseFloat(parsed.original_due_amount);
                } else if (parsed.total_original !== undefined && !isNaN(parseFloat(parsed.total_original))) {
                    originalTotal = parseFloat(parsed.total_original);
                }
            } catch (e) {}
        }
        if (!originalTotal && rec.original_due_amount) {
            originalTotal = parseFloat(rec.original_due_amount);
        }
        if (!originalTotal && rec.total_original) {
            originalTotal = parseFloat(rec.total_original);
        }
        if (!originalTotal && rec.total_amount && parseFloat(rec.total_amount) !== parseFloat(rec.amount)) {
            originalTotal = parseFloat(rec.total_amount);
        }
        if (!originalTotal && purchasesList && purchasesList.length > 0) {
            const matched = purchasesList.find(p => 
                (p.purchase_number && String(p.purchase_number) === String(rec.invoice_id)) ||
                (p.id && String(p.id) === String(rec.invoice_id))
            );
            if (matched) {
                originalTotal = parseFloat(matched.grand_total || matched.total_amount || 0);
            }
        }
        const paidAmt = parseFloat(rec.amount || rec.paid_amount || 0);
        if (!originalTotal) {
            originalTotal = paidAmt;
        }

        return {
            payment_id: rec.id,
            payment_number: `VCH-${new Date(rec.created_at).getFullYear()}-${rec.id}`,
            payment_type: 'pay',
            payment_date: rec.created_at ? rec.created_at.split('T')[0] : 'N/A',
            payment_status: 'completed',
            supplier_name: rec.party_name || 'General Vendor',
            purchase_id: rec.invoice_id || `BILL-REF-${rec.id}`,
            total_amount: originalTotal,
            paid_amount: paidAmt,
            pending_amount: Math.max(0, originalTotal - paidAmt),
            payment_mode: rec.payment_mode || 'Other',
            cheque_number: rec.reference_number || `CHQ-${rec.id}`,
            reconciliation_status: rec.reconciliation_status || 'matched'
        };
    });

    const [supplierPayables, setSupplierPayables] = useState(() => payables);

    React.useEffect(() => {
        setSupplierPayables(prev => {
            if (!Array.isArray(payables)) return prev || [];
            const prevArr = Array.isArray(prev) ? prev : [];
            const serverIds = new Set(payables.map(p => p.payment_id));
            const pendingLocal = prevArr.filter(p => p && !serverIds.has(p.payment_id));
            return [...pendingLocal, ...payables];
        });
    }, [reportsData, purchasesList]);

    const accounts = dbAccounts.length > 0 ? dbAccounts : [
        { bank_account_id: 'ACC-DEFL', bank_account_name: 'Default Cash Account', current_balance: 0, type: 'cash' }
    ];

    const overdues = dbOverdues.map(inv => {
        const totalAmt = parseFloat(inv.total_amount || inv.amount || 0);
        const paidAmt = parseFloat(inv.paid_amount || 0);
        const pendingAmt = Math.max(0, totalAmt - paidAmt);
        const dueDateObj = inv.due_date ? new Date(inv.due_date) : new Date();
        const todayObj = new Date();
        const diffTime = Math.max(0, todayObj - dueDateObj);
        const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        return {
            invoice_id: inv.invoice_number || `INV-${inv.id}`,
            customer_name: inv.client_name || 'General Customer',
            total_amount: totalAmt,
            paid_amount: paidAmt,
            pending_amount: pendingAmt > 0 ? pendingAmt : totalAmt,
            due_date: inv.due_date || 'N/A',
            overdue_days: overdueDays,
            reminder_sent: 'Not Sent'
        };
    });

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
        total_amount: '',
        paid_amount: '',
        payment_mode: 'Bank Transfer',
        transaction_reference: 'REF-88910B'
    });

    const [transferForm, setTransferForm] = useState({
        from_acc_id: accounts[0]?.bank_account_id || '',
        to_acc_id: accounts[1]?.bank_account_id || accounts[0]?.bank_account_id || '',
        amount: ''
    });

    React.useEffect(() => {
        if (accounts && accounts.length > 0) {
            setTransferForm(prev => {
                const currentFromValid = accounts.some(a => String(a.bank_account_id) === String(prev.from_acc_id));
                const fromId = currentFromValid ? prev.from_acc_id : accounts[0].bank_account_id;

                const distinctAcc = accounts.find(a => String(a.bank_account_id) !== String(fromId));
                const currentToValid = accounts.some(a => String(a.bank_account_id) === String(prev.to_acc_id)) && String(prev.to_acc_id) !== String(fromId);
                const toId = currentToValid ? prev.to_acc_id : (distinctAcc ? distinctAcc.bank_account_id : accounts[0].bank_account_id);

                return {
                    ...prev,
                    from_acc_id: fromId,
                    to_acc_id: toId
                };
            });
        }
    }, [accounts]);

    const handleSaveCustomerPayment = (e) => {
        e.preventDefault();
        const totalAmt = parseFloat(customerForm.total_amount);
        let paidAmt = parseFloat(customerForm.paid_amount);

        if (isNaN(paidAmt) || paidAmt <= 0 || isNaN(totalAmt) || totalAmt <= 0) {
            alert('Customer payment amount and total original amount must be strictly greater than 0.');
            return;
        }

        if (paidAmt > totalAmt) {
            paidAmt = totalAmt;
        }

        receiveMutation.mutate({
            customer_name: customerForm.customer_name,
            invoice_id: customerForm.invoice_id,
            amount: paidAmt,
            payment_mode: customerForm.payment_mode,
            reference_number: customerForm.transaction_reference
        });
    };

    const handleOpenSupplierModal = () => {
        let currentSupplierName = supplierForm.supplier_name;
        if (suppliersList && suppliersList.length > 0) {
            const exists = suppliersList.find(s => (s.name || s.company_name) === currentSupplierName);
            if (!exists) {
                currentSupplierName = suppliersList[0].name || suppliersList[0].company_name || currentSupplierName;
            }
        }
        const matched = suppliersList?.find(s => 
            (s.name && s.name === currentSupplierName) || 
            (s.company_name && s.company_name === currentSupplierName)
        );
        let due = '';
        if (matched) {
            const raw = matched.running_payable !== undefined && matched.running_payable !== null
                ? matched.running_payable
                : (matched.runningPayable !== undefined && matched.runningPayable !== null
                    ? matched.runningPayable
                    : (matched.outstanding_balance ?? ''));
            due = String(raw).replace(/,/g, '').trim();
        }
        setSupplierForm(prev => ({
            ...prev,
            supplier_name: currentSupplierName,
            total_amount: due,
            paid_amount: ''
        }));
        setIsSupplierModalOpen(true);
    };

    React.useEffect(() => {
        if (isSupplierModalOpen && suppliersList && suppliersList.length > 0 && !supplierForm.total_amount) {
            const matched = suppliersList.find(s => 
                (s.name && s.name === supplierForm.supplier_name) || 
                (s.company_name && s.company_name === supplierForm.supplier_name)
            ) || suppliersList[0];
            if (matched) {
                const raw = matched.running_payable !== undefined && matched.running_payable !== null
                    ? matched.running_payable
                    : (matched.runningPayable !== undefined && matched.runningPayable !== null
                        ? matched.runningPayable
                        : (matched.outstanding_balance ?? ''));
                const due = String(raw).replace(/,/g, '').trim();
                setSupplierForm(prev => ({
                    ...prev,
                    supplier_name: matched.name || matched.company_name || prev.supplier_name,
                    total_amount: due
                }));
            }
        }
    }, [isSupplierModalOpen, suppliersList]);

    const handleSaveSupplierPayment = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isSubmitting || payMutation.isPending) return;

        const totalAmt = supplierForm.total_amount !== '' && supplierForm.total_amount !== null && supplierForm.total_amount !== undefined
            ? parseFloat(supplierForm.total_amount)
            : 0;
        let paidAmt = parseFloat(supplierForm.paid_amount);

        if (isNaN(paidAmt) || paidAmt <= 0) {
            alert('Supplier payment amount must be strictly greater than 0.');
            return;
        }

        if (isNaN(totalAmt) || totalAmt < 0) {
            alert('Original due amount must be 0 or greater.');
            return;
        }

        if (!isNaN(totalAmt) && totalAmt >= 0 && paidAmt > totalAmt) {
            paidAmt = totalAmt;
        }

        setIsSubmitting(true);
        const payload = {
            supplier_name: supplierForm.supplier_name,
            purchase_id: supplierForm.purchase_id,
            amount: paidAmt,
            paid_amount: paidAmt,
            original_due_amount: totalAmt,
            total_original: totalAmt,
            total_amount: totalAmt,
            payment_mode: supplierForm.payment_mode,
            reference_number: supplierForm.transaction_reference,
            notes: JSON.stringify({ original_due_amount: totalAmt, paid_amount: paidAmt })
        };

        let isSuccess = false;
        let returnedTx = {};

        try {
            const rawRes = await apiClient.post('/payments/pay', payload);

            // Treat any HTTP status between 200 and 299 as a complete success.
            // Do NOT display the failure popup if res.status is 200 or 201.
            const statusCode = rawRes?.status ?? rawRes?.statusCode ?? (rawRes?.ok ? 200 : 201);
            const resData = rawRes?.data ?? rawRes;
            returnedTx = (resData && typeof resData === 'object' && resData.data) ? resData.data : (resData || {});

            const isStatusSuccess = (typeof statusCode === 'number' && statusCode >= 200 && statusCode <= 299) ||
                statusCode === 200 ||
                statusCode === 201 ||
                rawRes?.status === 'ok' ||
                rawRes?.success === true ||
                rawRes?.ok === true ||
                returnedTx?.id !== undefined ||
                returnedTx?.payment_id !== undefined;

            if (isStatusSuccess) {
                isSuccess = true;
            } else {
                alert(rawRes?.data?.message || rawRes?.message || 'Failed to process supplier payment. Please try again.');
            }
        } catch (err) {
            const errStatus = err?.status ?? err?.response?.status;
            // Never treat 200, 201, or 200-299 as an error
            if (
                (typeof errStatus === 'number' && errStatus >= 200 && errStatus <= 299) ||
                errStatus === 200 ||
                errStatus === 201
            ) {
                isSuccess = true;
                returnedTx = err?.response?.data?.data || err?.response?.data || {};
            } else {
                const msg = err?.response?.data?.message || err?.response?.data?.error?.message || err?.message || 'Failed to process supplier payment. Please try again.';
                alert(msg);
            }
        }

        if (isSuccess) {
            try {
                const newId = returnedTx?.id || returnedTx?.payment_id || Date.now();
                const year = new Date().getFullYear();
                const paymentNumber = returnedTx?.payment_number || `VCH-${year}-${newId}`;
                const todayStr = new Date().toISOString().split('T')[0];
                const paymentDate = returnedTx?.payment_date || (returnedTx?.created_at ? String(returnedTx.created_at).split('T')[0] : todayStr);

                const newTransaction = {
                    payment_id: newId,
                    payment_number: paymentNumber,
                    payment_type: 'pay',
                    payment_date: paymentDate,
                    payment_status: 'completed',
                    supplier_name: supplierForm.supplier_name || 'General Vendor',
                    purchase_id: supplierForm.purchase_id || `BILL-REF-${newId}`,
                    total_amount: totalAmt,
                    paid_amount: paidAmt,
                    pending_amount: Math.max(0, totalAmt - paidAmt),
                    payment_mode: supplierForm.payment_mode || 'Bank Transfer',
                    cheque_number: supplierForm.transaction_reference || `CHQ-${newId}`,
                    reconciliation_status: 'matched',
                    ...returnedTx
                };

                // Instant UI Update:
                // 1. Immediately close the modal
                setIsSupplierModalOpen(false);

                // 2. Prepend created item into supplierPayables state so VCH-... instantly appears at the top
                setSupplierPayables(prev => {
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [newTransaction, ...prevArray.filter(item => item && item.payment_id !== newId)];
                });

                // 3. Reset form and ensure payables tab is active
                setSupplierForm(prev => ({ ...prev, total_amount: '', paid_amount: '' }));
                setActiveTab('payables');

                // 4. Alert success
                alert("Successfully paid");

                // 5. Invalidate/refetch queries in background without throwing or showing error
                fetchSupplierPayables().catch(e => console.warn('Background sync:', e));
            } catch (uiErr) {
                console.error('Error updating UI state after payment:', uiErr);
                setIsSupplierModalOpen(false);
            }
        }

        setIsSubmitting(false);
    };

    const handleInternalTransfer = (e) => {
        e.preventDefault();

        if (!transferForm.from_acc_id || !transferForm.to_acc_id) {
            alert('Please select both a source account and a destination account.');
            return;
        }

        if (String(transferForm.from_acc_id) === String(transferForm.to_acc_id)) {
            alert('From Account and To Account cannot be identical! Please select different accounts.');
            return;
        }

        const transAmt = parseFloat(transferForm.amount);
        if (isNaN(transAmt) || transAmt <= 0) {
            alert('Transfer amount must be strictly greater than 0.');
            return;
        }

        const sourceAcc = accounts.find(a => String(a.bank_account_id) === String(transferForm.from_acc_id));
        if (sourceAcc && transAmt > (parseFloat(sourceAcc?.current_balance) || 0)) {
            alert(`Insufficient balance in source account (${sourceAcc.bank_account_name || 'Source Account'}) to make internal transfer! Available balance: ${formatCurrency(sourceAcc.current_balance)}`);
            return;
        }

        transferMutation.mutate({
            from_acc_id: transferForm.from_acc_id,
            to_acc_id: transferForm.to_acc_id,
            amount: transAmt
        });
    };

    const sendWhatsAppReminder = (custName) => {
        alert(`Automated WhatsApp & SMS payment reminders for ${custName} is coming soon!`);
    };

    const totalOutstandingReceivables = overdues.reduce((sum, o) => sum + o.pending_amount, 0);
    const totalDailyCollections = receivables.reduce((sum, r) => sum + r.paid_amount, 0);

    const filteredReceivables = receivables.filter(r => 
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.payment_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayables = supplierPayables.filter(p => 
        (p.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payment_number || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                        onClick={handleOpenSupplierModal}
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
                    { label: 'Outstanding Receivables', value: formatCurrency(totalOutstandingReceivables), icon: TrendingUp, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Daily Collections', value: formatCurrency(totalDailyCollections), icon: ArrowDownRight, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Combined Balances', value: formatCurrency(accounts.reduce((sum, a) => sum + (parseFloat(a.current_balance) || 0), 0)), icon: Wallet, color: '#3B82F6', bg: '#DBEAFE' },
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

            {/* Tabs Row & Global Search */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
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

                {/* Global Search Icon Outside Table */}
                {(activeTab === 'receivables' || activeTab === 'payables') && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: '#FFF', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '12px', 
                        padding: showSearch ? '0.5rem 1rem' : '0.5rem', 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        width: showSearch ? '280px' : '40px', 
                        height: '40px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                        <Search 
                            size={18} 
                            style={{ color: '#64748B', cursor: 'pointer', flexShrink: 0 }} 
                            onClick={() => setShowSearch(!showSearch)} 
                        />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                border: 'none', 
                                outline: 'none', 
                                background: 'transparent', 
                                marginLeft: '0.75rem', 
                                width: '100%', 
                                fontSize: '0.9rem', 
                                color: '#1E293B',
                                display: showSearch ? 'block' : 'none'
                            }}
                            autoFocus={showSearch}
                        />
                    </div>
                )}
            </div>

            {/* Tab 1: Customer Receivables */}
            {activeTab === 'receivables' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>

                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'receipt_id', label: 'Receipt ID', placeholder: 'e.g. RCP-001' },
                                { key: 'date', label: 'Date', placeholder: 'e.g. 2026-05' },
                                { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
                                { key: 'invoice_linked', label: 'Invoice Linked', placeholder: 'INV-' },
                                { key: 'total', label: 'Total Original', placeholder: 'e.g. 5000' },
                                { key: 'paid_amount', label: 'Paid Amount', placeholder: 'e.g. 5000' },
                                { key: 'payment_mode', label: 'Mode', placeholder: 'e.g. UPI' },
                                { key: 'status', label: 'Reconciliation', placeholder: 'Status' }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredReceivables.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((r) => (
                                    <tr key={r.payment_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{r.payment_number}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{r.payment_date}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#1E293B' }}>{r.customer_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '600' }}>{r.invoice_id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>{formatCurrency(r.total_amount)}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#1B6B3A' }}>{formatCurrency(r.paid_amount)}</td>
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>

                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'receipt_id', label: 'Receipt ID', placeholder: 'e.g. RCP-001' },
                                { key: 'date', label: 'Date', placeholder: 'e.g. 2026-05' },
                                { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
                                { key: 'invoice_linked', label: 'Invoice Linked', placeholder: 'INV-' },
                                { key: 'total', label: 'Total Original', placeholder: 'e.g. 5000' },
                                { key: 'paid_amount', label: 'Paid Amount', placeholder: 'e.g. 5000' },
                                { key: 'payment_mode', label: 'Mode', placeholder: 'e.g. UPI' },
                                { key: 'status', label: 'Reconciliation', placeholder: 'Status' }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredPayables.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((p) => (
                                    <tr key={p.payment_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{p.payment_number}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{p.payment_date}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#1E293B' }}>{p.supplier_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '600' }}>{p.purchase_id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>{formatCurrency(p.total_amount)}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#EF4444' }}>{formatCurrency(p.paid_amount)}</td>
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
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '1.5rem' }}>
                    {/* Existing Bank & Cash Registers top grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {accounts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(acc => (
                            <div key={acc.bank_account_id} className="border rounded-2xl p-6 bg-white shadow-sm" style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F0F9F4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>{acc.bank_account_id}</span>
                                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{(acc.type || 'ACCOUNT').toUpperCase()}</span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.5rem' }}>{acc.bank_account_name}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Account No: {acc.account_number || acc.bank_account_id}</p>

                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Current Balance:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '950', color: '#1B6B3A' }}>{formatCurrency(acc.current_balance)}</span>
                                </div>
                            </div>
                        ))}
                        <div className="border border-dashed rounded-2xl p-6 bg-white flex flex-col items-center justify-center" style={{ background: 'white', borderRadius: '24px', border: '1px dashed #DDD6FE', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsTransferModalOpen(true)}>
                            <ArrowUpRight size={32} style={{ color: '#1B6B3A', marginBottom: '0.75rem' }} />
                            <h4 style={{ fontWeight: '800', color: '#064E3B' }}>Internal Transfer Funds</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Move money between Cash-In-Hand and Bank accounts</p>
                        </div>
                    </div>

                    {/* Relocated Transaction Ledger: Cash in Hand */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6 mt-6" style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginTop: '1.5rem' }}>
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="text-blue-600 text-lg">🗂️</span>
                          <h3 className="font-semibold text-gray-900 text-base" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                            Transaction Ledger: Cash in Hand
                          </h3>
                        </div>

                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            type="button" 
                            onClick={handleTemplateVisibility}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', fontWeight: '750', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                          >
                            CASH IN HAND TEMPLATE VISIBILITY
                          </button>

                          <button 
                            type="button" 
                            onClick={handleAttachTransaction}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1 transition-colors"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', fontWeight: '750', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <span>👁️</span> attach your transaction detail
                          </button>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto mt-4" style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table className="w-full text-left text-sm" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                          <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100" style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.75rem', fontWeight: '750' }}>
                              <th className="py-3 px-4" style={{ padding: '0.75rem 1rem' }}>Date</th>
                              <th className="py-3 px-4" style={{ padding: '0.75rem 1rem' }}>Description</th>
                              <th className="py-3 px-4" style={{ padding: '0.75rem 1rem' }}>Type</th>
                              <th className="py-3 px-4 text-right" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                              <th className="py-3 px-4 text-right" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Balance After</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {cashLedgerData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td className="py-3 px-4 text-xs text-gray-600" style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748B' }}>{row.date}</td>
                                <td className="py-3 px-4 font-medium text-gray-900" style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1E293B' }}>{row.description}</td>
                                <td className="py-3 px-4" style={{ padding: '0.75rem 1rem' }}>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    row.type?.toLowerCase() === 'credit' 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                      : 'bg-red-50 text-red-600 border border-red-200'
                                  }`} style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    background: row.type?.toLowerCase() === 'credit' ? '#ECFDF5' : '#FEF2F2',
                                    color: row.type?.toLowerCase() === 'credit' ? '#059669' : '#DC2626',
                                    border: `1px solid ${row.type?.toLowerCase() === 'credit' ? '#A7F3D0' : '#FECACA'}`
                                  }}>
                                    {row.type}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 text-right font-semibold ${
                                  row.type?.toLowerCase() === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                }`} style={{
                                  padding: '0.75rem 1rem',
                                  textAlign: 'right',
                                  fontWeight: '750',
                                  color: row.type?.toLowerCase() === 'credit' ? '#059669' : '#DC2626'
                                }}>
                                  {row.type?.toLowerCase() === 'credit' ? `+₹${row.amount}` : `-₹${row.amount}`}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-gray-800" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: '#1E293B' }}>
                                  ₹{row.balanceAfter}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Overdue reminders */}
            {activeTab === 'reminders' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2rem 2.5rem 2.5rem 2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <h3 style={{ flexShrink: 0, fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Overdue Customer Accounts Reminders (myBillBook flow)</h3>
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'customer_name', label: 'Customer Name', placeholder: 'Name' },
                                { key: 'invoice_id', label: 'Invoice Linked ID', placeholder: 'e.g. INV-101' },
                                { key: 'pending_amount', label: 'Overdue Balance', placeholder: 'Amount' },
                                { key: 'due_date', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
                                { key: 'overdue_days', label: 'Overdue Period', placeholder: 'Days' },
                                { key: 'reminder_sent', label: 'Reminder Status', placeholder: 'Status' },
                                { 
                                    key: 'actions', 
                                    label: 'Actions', 
                                    placeholder: 'Action',
                                    align: 'right',
                                    className: 'min-w-[170px] text-right',
                                    style: { minWidth: '170px', textAlign: 'right' }
                                }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {overdues.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((ov) => (
                                    <tr key={ov.invoice_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#1E293B' }}>{ov.customer_name}</td>
                                        <td style={{ padding: '1rem', color: '#475569', fontWeight: '700' }}>{ov.invoice_id}</td>
                                        <td style={{ padding: '1rem', fontWeight: '850', color: '#EF4444' }}>{formatCurrency(ov.pending_amount)}</td>
                                        <td style={{ padding: '1rem', color: '#64748B' }}>{ov.due_date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>{ov.overdue_days} Days Overdue</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#64748B', fontWeight: '700' }}>{ov.reminder_sent}</td>
                                        <td className="whitespace-nowrap text-right" style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '170px' }}>
                                            <button 
                                                type="button"
                                                onClick={() => sendWhatsAppReminder(ov.customer_name)}
                                                title="Automated WhatsApp & SMS Reminders - Coming Soon"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 transition-all hover:bg-gray-200 whitespace-nowrap"
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.375rem', 
                                                    padding: '0.35rem 0.75rem', 
                                                    borderRadius: '9999px', 
                                                    background: '#F1F5F9', 
                                                    color: '#64748B', 
                                                    border: '1px solid #E2E8F0', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.75rem', 
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <Send size={12} className="text-gray-400 flex-shrink-0" style={{ color: '#94A3B8', flexShrink: 0 }} />
                                                <span style={{ whiteSpace: 'nowrap' }}>Send Reminder</span>
                                                <span 
                                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                                    style={{ 
                                                        fontSize: '0.62rem', 
                                                        background: '#E2E8F0', 
                                                        padding: '1px 5px', 
                                                        borderRadius: '4px', 
                                                        color: '#475569',
                                                        fontWeight: '750',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Soon
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {overdues.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                            No overdue collections found at this time. All customer invoices are current!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                <input 
                                    required 
                                    type="text"
                                    placeholder="Customer Name..."
                                    value={customerForm.customer_name} 
                                    onChange={(e) => setCustomerForm({ ...customerForm, customer_name: e.target.value })} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Linked ID</label>
                                    <input required type="text" value={customerForm.invoice_id} onChange={(e) => setCustomerForm({ ...customerForm, invoice_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Amount ({currency.symbol})</label>
                                    <input 
                                        required 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="e.g. 10000"
                                        value={customerForm.total_amount} 
                                        onKeyDown={(e) => { if (['+', '-', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                                        onChange={(e) => {
                                            const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                            setCustomerForm(prev => {
                                                let updatedPaid = prev.paid_amount;
                                                if (sanitized !== '' && updatedPaid !== '') {
                                                    const maxVal = Number(sanitized);
                                                    if (Number(updatedPaid) > maxVal) {
                                                        updatedPaid = String(maxVal);
                                                    }
                                                }
                                                return {
                                                    ...prev,
                                                    total_amount: sanitized,
                                                    paid_amount: updatedPaid
                                                };
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid amount (Receipt worth, {currency.symbol})</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0.01"
                                    step="any"
                                    max={customerForm.total_amount || undefined}
                                    value={customerForm.paid_amount} 
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val !== '' && customerForm.total_amount !== '') {
                                            const maxVal = Number(customerForm.total_amount);
                                            if (!isNaN(maxVal) && Number(val) > maxVal) {
                                                val = String(maxVal);
                                            }
                                        }
                                        setCustomerForm(prev => ({ ...prev, paid_amount: val }));
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                />
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

                            <button type="submit" disabled={receiveMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {receiveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Payment Collection'}
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
                                <select 
                                    value={supplierForm.supplier_name} 
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const matchedSupplier = suppliersList.find(s => 
                                            (s.name && s.name === selectedName) || 
                                            (s.company_name && s.company_name === selectedName) ||
                                            (s.company && s.company === selectedName)
                                        );
                                        let originalDue = '';
                                        if (matchedSupplier) {
                                            const raw = matchedSupplier.running_payable !== undefined && matchedSupplier.running_payable !== null
                                                ? matchedSupplier.running_payable
                                                : (matchedSupplier.runningPayable !== undefined && matchedSupplier.runningPayable !== null
                                                    ? matchedSupplier.runningPayable
                                                    : (matchedSupplier.outstanding_balance ?? ''));
                                            originalDue = String(raw).replace(/,/g, '').trim();
                                        }
                                        setSupplierForm(prev => {
                                            let updatedPaid = prev.paid_amount;
                                            const numDue = parseFloat(originalDue);
                                            if (!isNaN(numDue) && updatedPaid !== '') {
                                                const numPaid = parseFloat(updatedPaid);
                                                if (!isNaN(numPaid) && numPaid > numDue) {
                                                    updatedPaid = String(numDue);
                                                }
                                            }
                                            return {
                                                ...prev,
                                                supplier_name: selectedName,
                                                total_amount: originalDue,
                                                paid_amount: updatedPaid
                                            };
                                        });
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    {suppliersList.map((sup, idx) => (
                                        <option key={sup.id || idx} value={sup.name || sup.company_name}>
                                            {sup.name || sup.company_name}
                                        </option>
                                    ))}
                                    {suppliersList.length === 0 && (
                                        <>
                                            <option value="Delhi Distributors Ltd.">Delhi Distributors Ltd.</option>
                                            <option value="Global Trading Corp">Global Trading Corp</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Purchase Bill Linked ID</label>
                                    <input required type="text" value={supplierForm.purchase_id} onChange={(e) => setSupplierForm({ ...supplierForm, purchase_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Due Amount ({currency.symbol})</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        placeholder="0"
                                        value={supplierForm.total_amount} 
                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                        onChange={(e) => {
                                            const newTotal = e.target.value;
                                            setSupplierForm(prev => {
                                                let updatedPaid = prev.paid_amount;
                                                const numTotal = parseFloat(newTotal);
                                                if (!isNaN(numTotal) && updatedPaid !== '') {
                                                    const numPaid = parseFloat(updatedPaid);
                                                    if (!isNaN(numPaid) && numPaid > numTotal) {
                                                        updatedPaid = String(numTotal);
                                                    }
                                                }
                                                return {
                                                    ...prev,
                                                    total_amount: newTotal,
                                                    paid_amount: updatedPaid
                                                };
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid Amount (Outflow worth, {currency.symbol})</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    max={supplierForm.total_amount || undefined}
                                    step="any"
                                    placeholder="0"
                                    value={supplierForm.paid_amount} 
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        const originalDue = parseFloat(supplierForm.total_amount);
                                        if (!isNaN(originalDue) && originalDue >= 0 && val !== '') {
                                            const numVal = parseFloat(val);
                                            if (!isNaN(numVal) && numVal > originalDue) {
                                                val = String(originalDue);
                                            }
                                        }
                                        setSupplierForm(prev => ({ ...prev, paid_amount: val }));
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                />
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

                            <button 
                                type="submit" 
                                disabled={isSubmitting || payMutation.isPending} 
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    background: (isSubmitting || payMutation.isPending) ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '1.1rem', 
                                    cursor: (isSubmitting || payMutation.isPending) ? 'not-allowed' : 'pointer', 
                                    boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem',
                                    opacity: (isSubmitting || payMutation.isPending) ? 0.8 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {(isSubmitting || payMutation.isPending) ? <Loader2 className="animate-spin" size={20} /> : 'Disburse Supplier Funds'}
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
                                    <select 
                                        value={transferForm.from_acc_id} 
                                        onChange={(e) => {
                                            const selectedFrom = e.target.value;
                                            setTransferForm(prev => {
                                                let nextTo = prev.to_acc_id;
                                                if (String(selectedFrom) === String(nextTo)) {
                                                    const alternate = accounts.find(a => String(a.bank_account_id) !== String(selectedFrom));
                                                    if (alternate) nextTo = alternate.bank_account_id;
                                                }
                                                return { ...prev, from_acc_id: selectedFrom, to_acc_id: nextTo };
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                    >
                                        {accounts.map(a => (
                                            <option key={a.bank_account_id} value={a.bank_account_id}>
                                                {a.bank_account_name} ({formatCurrency(a.current_balance)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Account</label>
                                    <select 
                                        value={transferForm.to_acc_id} 
                                        onChange={(e) => setTransferForm({ ...transferForm, to_acc_id: e.target.value })} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                    >
                                        {accounts.map(a => {
                                            const isSelectedFrom = String(a.bank_account_id) === String(transferForm.from_acc_id);
                                            return (
                                                <option 
                                                    key={a.bank_account_id} 
                                                    value={a.bank_account_id}
                                                    disabled={isSelectedFrom}
                                                >
                                                    {a.bank_account_name} ({formatCurrency(a.current_balance)}){isSelectedFrom ? ' (Source)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Transfer Amount ({currency.symbol})</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    step="any"
                                    placeholder="0"
                                    value={transferForm.amount} 
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                />
                            </div>

                            <button type="submit" disabled={transferMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {transferMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Settle Fund Transfer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPayments;
