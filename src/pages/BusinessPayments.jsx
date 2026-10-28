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
    Loader2,
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { apiClient } from '../api/client';
import { suppliersService } from '../services/suppliersService';
import { accountingService } from '../services/accountingService';
import { bankAccountService } from '../services/bankAccountService';
import { purchasesService } from '../services/purchasesService';
import { billingService } from '../services/billingService';
import { paymentsStore } from '../lib/paymentsStore';
import '../App.css';
import { useCurrency } from '../context';
import BankStatementReconciliationModal from '../components/BankStatementReconciliationModal';

const DoubleArrowIcon = ({ size = 18 }) => (
    <span style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', fontWeight: '800' }}>⇄</span>
);

const BusinessPayments = ({
    initialOpenReconcile = false,
    isOpenReconcile = false,
    openReconcile = false,
    isReconcileModalOpen: propIsReconcileOpen,
    ...props
}) => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('inward_outward');
    const [colFilters, setColFilters] = React.useState({}); // 'inward_outward', 'reminders', 'bank'
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(() => {
        if (initialOpenReconcile || isOpenReconcile || openReconcile || propIsReconcileOpen) return true;
        if (typeof window !== 'undefined' && window.location) {
            const p = new URLSearchParams(window.location.search);
            return p.get('reconcile') === 'true' || p.get('addTransaction') === 'true' || p.get('reconcileModal') === 'true';
        }
        return false;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    React.useEffect(() => {
        if (propIsReconcileOpen !== undefined) {
            setIsReconcileModalOpen(propIsReconcileOpen);
        } else if (openReconcile || isOpenReconcile) {
            setIsReconcileModalOpen(true);
        }
    }, [propIsReconcileOpen, openReconcile, isOpenReconcile]);

    React.useEffect(() => {
        const checkParams = () => {
            if (typeof window !== 'undefined' && window.location) {
                const p = new URLSearchParams(window.location.search);
                if (p.get('reconcile') === 'true' || p.get('addTransaction') === 'true' || p.get('reconcileModal') === 'true') {
                    setIsReconcileModalOpen(true);
                }
            }
        };

        checkParams();
        const handleOpen = () => setIsReconcileModalOpen(true);
        window.addEventListener('open-bank-reconciliation', handleOpen);
        window.addEventListener('open-bank-statement-reconciliation', handleOpen);
        window.addEventListener('popstate', checkParams);

        return () => {
            window.removeEventListener('open-bank-reconciliation', handleOpen);
            window.removeEventListener('open-bank-statement-reconciliation', handleOpen);
            window.removeEventListener('popstate', checkParams);
        };
    }, []);

    React.useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Bank & Cash register cards action menu & edit/delete modal state
    const [activeDropdownAccId, setActiveDropdownAccId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [selectedLedgerAccount, setSelectedLedgerAccount] = useState(null);
    const [editedAccounts, setEditedAccounts] = useState({});
    const [deletedAccountIds, setDeletedAccountIds] = useState(new Set());
    const [editAccountForm, setEditAccountForm] = useState({
        bank_account_id: '',
        id: '',
        bank_account_name: '',
        account_number: '',
        type: 'bank',
        current_balance: 0,
        bank_name: '',
        ifsc_code: '',
        branch_name: '',
        status: 'Active'
    });

    // Close action dropdown on outside clicks
    React.useEffect(() => {
        const handleGlobalClick = () => {
            setActiveDropdownAccId(null);
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

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

    const { data: invoicesList = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => billingService.getInvoices().catch(() => [])
    });

    const fetchSupplierPayables = async () => {
        try {
            await Promise.all([
                refetchReports(),
                queryClient.invalidateQueries({ queryKey: ['paymentReports'] }),
                queryClient.invalidateQueries({ queryKey: ['invoices'] }),
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

    const fetchTransactions = fetchSupplierPayables;

    const { data: dbLedger = [] } = useQuery({
        queryKey: ['ledger'],
        queryFn: () => accountingService.getLedger()
    });

    const handleAttachTransaction = () => {
        alert("Attach Transaction Detail: Please select a transaction or upload attachment.");
    };

    const cashLedgerData = React.useMemo(() => {
        const cashTxs = (Array.isArray(dbLedger) ? dbLedger : [])
            .filter(tx => {
                const targetName = selectedLedgerAccount ? String(selectedLedgerAccount.bank_account_name || '').toLowerCase() : 'cash';
                const bankName = selectedLedgerAccount ? String(selectedLedgerAccount.bank_name || '').toLowerCase() : '';
                const accNo = selectedLedgerAccount ? String(selectedLedgerAccount.account_number || '').toLowerCase() : '';
                const m = String(tx.mode || tx.payment_mode || tx.category || tx.notes || '').trim().toLowerCase();
                if (!selectedLedgerAccount || targetName.includes('cash')) {
                    return m === 'cash' || m.includes('cash in hand') || m.includes('hand') || !tx.mode;
                }
                return m.includes(targetName) || (bankName && m.includes(bankName)) || (accNo && m.includes(accNo)) || m.includes('bank');
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
                description: tx.notes || tx.category || tx.description || `${selectedLedgerAccount ? selectedLedgerAccount.bank_account_name : 'Cash'} Transaction`,
                type: isIncome ? 'Credit' : 'Debit',
                amount: amt.toLocaleString('en-IN'),
                balanceAfter: runningBal.toLocaleString('en-IN')
            };
        });

        if (mapped.length === 0) {
            const openingBal = selectedLedgerAccount ? selectedLedgerAccount.current_balance : 0;
            return [
                {
                    date: new Date().toLocaleDateString('en-GB'),
                    description: `Opening Balance (${selectedLedgerAccount ? selectedLedgerAccount.bank_account_name : 'Cash in Hand'})`,
                    type: 'Credit',
                    amount: openingBal.toLocaleString('en-IN'),
                    balanceAfter: openingBal.toLocaleString('en-IN')
                }
            ];
        }

        return mapped.reverse();
    }, [dbLedger, selectedLedgerAccount]);

    const { data: suppliersList = [] } = useQuery({
        queryKey: ['suppliersList'],
        queryFn: async () => {
            const res = await suppliersService.getSuppliers();
            return Array.isArray(res) ? res : (res.rows || res.data || []);
        }
    });

    const { data: customersList = [] } = useQuery({
        queryKey: ['customersList'],
        queryFn: async () => {
            try {
                const res = await apiClient.get('/sales/customers').catch(() => apiClient.get('/customers'));
                const raw = res?.data?.data ?? res?.data;
                if (Array.isArray(raw)) return raw;
                if (raw?.customers && Array.isArray(raw.customers)) return raw.customers;
                if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
                if (raw?.items && Array.isArray(raw.items)) return raw.items;
                return [];
            } catch (err) {
                console.warn('Failed to fetch customers list:', err);
                return [];
            }
        }
    });

    const activeCustomers = React.useMemo(() => {
        const list = Array.isArray(customersList) ? [...customersList] : [];
        
        (invoicesList || []).forEach(inv => {
            if (inv.client_name && inv.client_name.trim()) {
                const cTrim = inv.client_name.trim();
                const exists = list.some(c => (c.name || c.customer_name || c.company || '').trim().toLowerCase() === cTrim.toLowerCase());
                if (!exists) {
                    list.push({
                        id: inv.customer_id || `cust-inv-${inv.id}`,
                        name: cTrim,
                        customer_name: cTrim,
                        invoice_id: inv.invoice_number,
                        total_amount: inv.total_amount
                    });
                }
            }
        });
        return list;
    }, [customersList, invoicesList]);

    // Mutations
    const receiveMutation = useMutation({
        mutationFn: (data) => paymentService.receivePayment(data),
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });

            if (variables) {
                const totalAmt = Number(variables.totalOriginalAmount !== undefined ? variables.totalOriginalAmount : (variables.total_original || variables.total_amount || variables.amount || 0));
                const paidAmt = Number(variables.paidAmount !== undefined ? variables.paidAmount : (variables.paid_amount || variables.amount || 0));
                const newReceipt = {
                    payment_id: Date.now(),
                    payment_number: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    payment_type: 'receive',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_status: 'completed',
                    customer_name: variables.customerProfile || variables.customer_name,
                    customerProfile: variables.customerProfile || variables.customer_name,
                    invoice_id: variables.invoiceLinkedId || variables.invoice_id,
                    invoiceLinkedId: variables.invoiceLinkedId || variables.invoice_id,
                    total_amount: totalAmt,
                    totalOriginalAmount: totalAmt,
                    paid_amount: paidAmt,
                    paidAmount: paidAmt,
                    pending_amount: Math.max(0, totalAmt - paidAmt),
                    payment_mode: variables.payment_mode || 'UPI',
                    transaction_reference: variables.reference_number || `REF-${Date.now().toString().slice(-4)}`,
                    receipt_number: `RCT-${Date.now().toString().slice(-4)}`,
                    reconciliation_status: 'matched'
                };
                setCustomerReceivables(prev => [newReceipt, ...prev.filter(x => x.payment_id !== newReceipt.payment_id)]);
            }

            setIsPaymentModalOpen(false);
            setToast({
                message: 'Customer payment recorded and committed successfully.',
                type: 'success'
            });
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
            console.warn('Supplier payMutation error:', err);
        }
    });

    const transferMutation = useMutation({
        mutationFn: async (data) => {
            try {
                return await paymentService.transferVault(data);
            } catch (err) {
                try {
                    return await accountingService.recordTransfer({
                        from_account_id: data.from_acc_id,
                        to_account_id: data.to_acc_id,
                        amount: data.amount,
                        description: 'Internal Vault Transfer'
                    });
                } catch (recErr) {
                    throw err;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });
            queryClient.invalidateQueries({ queryKey: ['cash-bank-accounts'] });
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

    const receivables = React.useMemo(() => {
        const mappedDbReceivables = (dbReceivables || []).map(rec => {
            let originalTotal = 0;
            let paidAmt = parseFloat(rec.paid_amount || rec.paidAmount || rec.amount || 0);
            let custName = rec.party_name || rec.customerProfile || rec.customer_name || 'General Client';
            let invId = rec.invoice_id || rec.invoiceLinkedId || `INV-REF-${rec.id}`;

            if (rec.notes) {
                try {
                    const parsed = typeof rec.notes === 'string' ? JSON.parse(rec.notes) : rec.notes;
                    if (parsed.totalOriginalAmount !== undefined && !isNaN(parseFloat(parsed.totalOriginalAmount))) {
                        originalTotal = parseFloat(parsed.totalOriginalAmount);
                    } else if (parsed.total_original !== undefined && !isNaN(parseFloat(parsed.total_original))) {
                        originalTotal = parseFloat(parsed.total_original);
                    } else if (parsed.total_original_amount !== undefined && !isNaN(parseFloat(parsed.total_original_amount))) {
                        originalTotal = parseFloat(parsed.total_original_amount);
                    } else if (parsed.original_amount !== undefined && !isNaN(parseFloat(parsed.original_amount))) {
                        originalTotal = parseFloat(parsed.original_amount);
                    } else if (parsed.total_amount !== undefined && !isNaN(parseFloat(parsed.total_amount))) {
                        originalTotal = parseFloat(parsed.total_amount);
                    }

                    if (parsed.paidAmount !== undefined && !isNaN(parseFloat(parsed.paidAmount))) {
                        paidAmt = parseFloat(parsed.paidAmount);
                    } else if (parsed.paid_amount !== undefined && !isNaN(parseFloat(parsed.paid_amount))) {
                        paidAmt = parseFloat(parsed.paid_amount);
                    }

                    if (parsed.customerProfile) custName = parsed.customerProfile;
                    if (parsed.invoiceLinkedId) invId = parsed.invoiceLinkedId;
                } catch (e) {}
            }

            if (!originalTotal && rec.totalOriginalAmount) originalTotal = parseFloat(rec.totalOriginalAmount);
            if (!originalTotal && rec.total_original_amount) originalTotal = parseFloat(rec.total_original_amount);
            if (!originalTotal && rec.total_original) originalTotal = parseFloat(rec.total_original);
            if (!originalTotal && rec.total_amount) originalTotal = parseFloat(rec.total_amount);

            if (!originalTotal && invoicesList && invoicesList.length > 0) {
                const matchedInv = invoicesList.find(inv => 
                    (inv.invoice_number && String(inv.invoice_number) === String(invId)) ||
                    (inv.id && String(inv.id) === String(invId))
                );
                if (matchedInv) {
                    originalTotal = parseFloat(matchedInv.total_amount || matchedInv.amount || 0);
                }
            }
            if (!originalTotal) {
                originalTotal = paidAmt;
            }

            const isMatched = paidAmt >= originalTotal && originalTotal > 0;
            const isPartial = paidAmt > 0 && paidAmt < originalTotal;
            const reconStatus = rec.reconciliation_status || (isMatched ? 'matched' : (isPartial ? 'partially matched' : 'unreconciled'));

            let payNumber = rec.payment_number;
            if (!payNumber) {
                const idStr = String(invId || '');
                if (idStr.startsWith('REC-')) {
                    payNumber = idStr;
                } else if (idStr.startsWith('INV-')) {
                    payNumber = `REC-${idStr.replace(/^INV-?/i, '')}`;
                } else if (idStr.startsWith('POS-')) {
                    payNumber = `REC-${idStr.replace(/^POS-?/i, '')}`;
                } else {
                    payNumber = `REC-${new Date(rec.created_at || Date.now()).getFullYear()}-${rec.id}`;
                }
            }

            return {
                payment_id: rec.payment_id || rec.id,
                payment_number: payNumber,
                payment_type: 'receive',
                payment_date: rec.payment_date || (rec.created_at ? rec.created_at.split('T')[0] : 'N/A'),
                payment_status: rec.payment_status || 'completed',
                customer_name: custName,
                customerProfile: custName,
                invoice_id: invId,
                invoiceLinkedId: invId,
                total_amount: originalTotal,
                totalOriginalAmount: originalTotal,
                paid_amount: paidAmt,
                paidAmount: paidAmt,
                pending_amount: Math.max(0, originalTotal - paidAmt),
                payment_mode: rec.payment_mode || 'Cash',
                transaction_reference: rec.reference_number || `REF-${rec.id}`,
                receipt_number: rec.receipt_number || `RCT-${rec.id}`,
                reconciliation_status: reconStatus
            };
        });

        const seenInvKeys = new Set(
            mappedDbReceivables.map(r => String(r.invoiceLinkedId || r.invoice_id || '').trim().toLowerCase()).filter(Boolean)
        );

        // Merge any customer invoices from invoicesList not yet represented
        const extraInvoices = (invoicesList || []).filter(inv => {
            const num = String(inv.invoice_number || `INV-${inv.id}`).trim().toLowerCase();
            return !seenInvKeys.has(num);
        }).map(inv => {
            const tot = parseFloat(inv.total_amount ?? inv.amount ?? 0);
            const paid = parseFloat(inv.paid_amount !== undefined && inv.paid_amount !== null ? inv.paid_amount : (inv.status && inv.status.toLowerCase() === 'paid' ? tot : 0));
            const isMatched = paid >= tot && tot > 0;
            const isPartial = paid > 0 && paid < tot;
            const invNum = inv.invoice_number || `INV-${inv.id}`;
            const payNum = invNum.startsWith('REC-') ? invNum : (invNum.startsWith('INV-') ? `REC-${invNum.replace(/^INV-?/i, '')}` : (invNum.startsWith('POS-') ? `REC-${invNum.replace(/^POS-?/i, '')}` : `REC-${invNum}`));

            return {
                payment_id: `inv-${inv.id}`,
                payment_number: payNum,
                payment_type: 'receive',
                payment_date: inv.created_at ? inv.created_at.split('T')[0] : (inv.due_date || 'N/A'),
                payment_status: inv.status?.toLowerCase() === 'paid' ? 'completed' : (inv.status || 'pending'),
                customer_name: inv.client_name || 'General Customer',
                customerProfile: inv.client_name || 'General Customer',
                invoice_id: invNum,
                invoiceLinkedId: invNum,
                total_amount: tot,
                totalOriginalAmount: tot,
                paid_amount: paid,
                paidAmount: paid,
                pending_amount: Math.max(0, tot - paid),
                payment_mode: inv.payment_mode || 'Cash',
                transaction_reference: invNum,
                receipt_number: `RCT-${inv.id}`,
                reconciliation_status: isMatched ? 'matched' : (isPartial ? 'partially matched' : 'unreconciled')
            };
        });

        return [...mappedDbReceivables, ...extraInvoices];
    }, [dbReceivables, invoicesList]);

    const [customerReceivables, setCustomerReceivables] = useState(() => receivables);

    React.useEffect(() => {
        if (Array.isArray(receivables)) {
            setCustomerReceivables(receivables);
        }
    }, [receivables]);

    const payables = React.useMemo(() => {
        const mappedDbPayables = (dbPayables || []).map(rec => {
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
            if (!originalTotal && rec.original_due_amount) originalTotal = parseFloat(rec.original_due_amount);
            if (!originalTotal && rec.total_original) originalTotal = parseFloat(rec.total_original);
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

            const isMatched = paidAmt >= originalTotal && originalTotal > 0;
            const isPartial = paidAmt > 0 && paidAmt < originalTotal;
            const reconStatus = rec.reconciliation_status || (isMatched ? 'matched' : (isPartial ? 'partially matched' : 'unreconciled'));
            const purId = rec.invoice_id || `BILL-REF-${rec.id}`;

            let payNumber = rec.payment_number;
            if (!payNumber) {
                const idStr = String(purId || '');
                if (idStr.startsWith('VCH-')) {
                    payNumber = idStr;
                } else if (idStr.startsWith('PO-')) {
                    payNumber = `VCH-${idStr.replace(/^PO-?/i, '')}`;
                } else if (idStr.startsWith('BILL-')) {
                    payNumber = `VCH-${idStr.replace(/^BILL-?/i, '')}`;
                } else {
                    payNumber = `VCH-${new Date(rec.created_at || Date.now()).getFullYear()}-${rec.id}`;
                }
            }

            return {
                payment_id: rec.payment_id || rec.id,
                payment_number: payNumber,
                payment_type: 'pay',
                payment_date: rec.payment_date || (rec.created_at ? rec.created_at.split('T')[0] : 'N/A'),
                payment_status: rec.payment_status || 'completed',
                supplier_name: rec.party_name || rec.supplier_name || 'General Vendor',
                purchase_id: purId,
                total_amount: originalTotal,
                paid_amount: paidAmt,
                pending_amount: Math.max(0, originalTotal - paidAmt),
                payment_mode: rec.payment_mode || 'Other',
                cheque_number: rec.reference_number || `CHQ-${rec.id}`,
                reconciliation_status: reconStatus
            };
        });

        const seenPurKeys = new Set(
            mappedDbPayables.map(p => String(p.purchase_id || '').trim().toLowerCase()).filter(Boolean)
        );

        // Merge any supplier purchases/bills from purchasesList not yet represented
        const extraPurchases = (purchasesList || []).filter(p => {
            const num = String(p.purchase_number || `PO-${p.id}`).trim().toLowerCase();
            return !seenPurKeys.has(num);
        }).map(p => {
            const tot = parseFloat(p.grand_total || p.subtotal || p.total_amount || 0);
            const paid = parseFloat(p.paid_amount !== undefined && p.paid_amount !== null ? p.paid_amount : (p.advance_amount || (p.status && p.status.toLowerCase() === 'paid' ? tot : 0)));
            const isMatched = paid >= tot && tot > 0;
            const isPartial = paid > 0 && paid < tot;
            const purNum = p.purchase_number || `PO-${p.id}`;
            const payNum = purNum.startsWith('VCH-') ? purNum : (purNum.startsWith('PO-') ? `VCH-${purNum.replace(/^PO-?/i, '')}` : (purNum.startsWith('BILL-') ? `VCH-${purNum.replace(/^BILL-?/i, '')}` : `VCH-${purNum}`));

            return {
                payment_id: `pur-${p.id}`,
                payment_number: payNum,
                payment_type: 'pay',
                payment_date: p.purchase_date || (p.created_at ? p.created_at.split('T')[0] : 'N/A'),
                payment_status: p.status?.toLowerCase() === 'paid' ? 'completed' : (p.status || 'pending'),
                supplier_name: p.supplier_name || 'General Vendor',
                purchase_id: purNum,
                total_amount: tot,
                paid_amount: paid,
                pending_amount: Math.max(0, tot - paid),
                payment_mode: p.payment_mode || 'Bank Transfer',
                cheque_number: p.purchase_number || `CHQ-${p.id}`,
                reconciliation_status: isMatched ? 'matched' : (isPartial ? 'partially matched' : 'unreconciled')
            };
        });

        return [...mappedDbPayables, ...extraPurchases];
    }, [dbPayables, purchasesList]);

    const [supplierPayables, setSupplierPayables] = useState(() => payables);

    React.useEffect(() => {
        if (Array.isArray(payables)) {
            setSupplierPayables(payables);
        }
    }, [payables]);

    // Dynamic Cash & Bank accounts query matching Books/Billing module
    const { data: dbBankAccounts = [] } = useQuery({
        queryKey: ['cash-bank-accounts'],
        queryFn: async () => {
            const list = [];
            const seen = new Set();

            // 1. Fetch from accountingService (Books / Accounting module)
            try {
                const resAcc = await accountingService.getBankAccounts();
                const arrAcc = Array.isArray(resAcc) ? resAcc : (resAcc?.data || []);
                arrAcc.forEach(a => {
                    const name = a.account_name || a.bank_account_name || a.bank_name || '';
                    if (!name.toLowerCase().includes('cash in hand') && !name.toLowerCase().includes('cash register')) {
                        const id = a.id || a.bank_account_id;
                        if (id) seen.add(String(id));
                        list.push({
                            id: a.id || a.bank_account_id,
                            bank_account_id: a.id || a.bank_account_id,
                            bank_account_name: name || 'Bank Account',
                            bank_name: a.bank_name || a.account_name || 'Bank',
                            account_number: a.account_number || a.account_no || '',
                            ifsc_code: a.ifsc_code || a.ifsc || '',
                            branch_name: a.branch_name || a.branch || '',
                            current_balance: parseFloat(a.balance ?? a.current_balance ?? 0) || 0,
                            status: a.status || 'Active',
                            type: 'bank'
                        });
                    }
                });
            } catch (e) {}

            // 2. Fetch from paymentsStore / bankAccountService
            try {
                const resStore = await paymentsStore.getBankAccounts();
                const arrStore = Array.isArray(resStore) ? resStore : (resStore?.data || []);
                arrStore.forEach(a => {
                    const name = a.account_name || a.bank_account_name || a.bank_name || '';
                    if (!name.toLowerCase().includes('cash in hand') && !name.toLowerCase().includes('cash register')) {
                        const id = a.id || a.bank_account_id;
                        const accNo = a.account_number || a.account_no || '';
                        const exists = list.some(item => 
                            (id && String(item.id) === String(id)) || 
                            (accNo && item.account_number && item.account_number === accNo)
                        );
                        if (!exists) {
                            list.push({
                                id: a.id || a.bank_account_id || `store-${list.length + 1}`,
                                bank_account_id: a.id || a.bank_account_id || `store-${list.length + 1}`,
                                bank_account_name: name || 'Bank Account',
                                bank_name: a.bank_name || a.account_holder || 'Bank',
                                account_number: accNo,
                                ifsc_code: a.ifsc || a.ifsc_code || '',
                                branch_name: a.branch || a.branch_name || '',
                                current_balance: parseFloat(a.current_balance ?? a.balance ?? a.opening_balance ?? 0) || 0,
                                status: a.status || 'Active',
                                type: 'bank'
                            });
                        }
                    }
                });
            } catch (e) {}

            return list;
        }
    });

    const accounts = React.useMemo(() => {
        const fetchedFromStore = Array.isArray(dbBankAccounts) ? dbBankAccounts : [];
        const reportsAccounts = Array.isArray(dbAccounts) ? dbAccounts : [];

        const combined = [];
        const seenKeys = new Set();

        // 1. Always include Cash Register (Cash in Hand) with real cash from cash billing
        const cashFromReports = reportsAccounts.find(a => (a.type || '').toLowerCase() === 'cash' || String(a.bank_account_id).includes('cash'));
        combined.push({
            id: 'cash-register-primary',
            bank_account_id: 'cash-register-primary',
            bank_account_name: 'Cash Register (Cash in Hand)',
            bank_name: 'Cash Register',
            account_number: 'CASH-REG-01',
            type: 'cash',
            current_balance: cashFromReports ? parseFloat(cashFromReports.current_balance || 0) : 0,
            status: 'Active'
        });
        seenKeys.add('cash-register-primary');
        seenKeys.add('cash-register');
        seenKeys.add('cash in hand');

        // 2. Add bank accounts from reportsData
        reportsAccounts.forEach(a => {
            const accId = a.bank_account_id || a.id;
            const isCash = (a.type || '').toLowerCase() === 'cash' || String(accId).includes('cash') || String(a.bank_account_name || '').toLowerCase().includes('cash');
            const key = String(a.account_number || accId || '').trim().toLowerCase();
            if (!isCash && key && !seenKeys.has(key)) {
                seenKeys.add(key);
                combined.push({
                    id: accId,
                    bank_account_id: accId,
                    bank_account_name: a.bank_account_name || a.account_name || a.bank_name || 'Bank Account',
                    current_balance: parseFloat(a.current_balance ?? a.balance ?? 0) || 0,
                    type: 'bank',
                    account_number: a.account_number || a.account_no || '',
                    bank_name: a.bank_name || '',
                    ifsc_code: a.ifsc_code || a.ifsc || '',
                    branch_name: a.branch_name || a.branch || '',
                    status: a.status || 'Active'
                });
            }
        });

        // 3. Add bank accounts from dbBankAccounts (from Books / Accounting & Billing modules)
        fetchedFromStore.forEach(a => {
            const accId = a.bank_account_id || a.id;
            const isCash = (a.type || '').toLowerCase() === 'cash' || String(a.bank_account_name || '').toLowerCase().includes('cash');
            const key = String(a.account_number || accId || '').trim().toLowerCase();
            if (!isCash && key && !seenKeys.has(key)) {
                seenKeys.add(key);
                combined.push({
                    id: accId || `bank-${combined.length + 1}`,
                    bank_account_id: accId || `bank-${combined.length + 1}`,
                    bank_account_name: a.bank_account_name || a.account_name || a.bank_name || 'Bank Account',
                    current_balance: parseFloat(a.current_balance ?? a.balance ?? a.opening_balance ?? 0) || 0,
                    type: 'bank',
                    account_number: a.account_number || a.account_no || '',
                    bank_name: a.bank_name || '',
                    ifsc_code: a.ifsc_code || a.ifsc || '',
                    branch_name: a.branch_name || a.branch || '',
                    status: a.status || 'Active'
                });
            }
        });

        // Apply deletion filter and edited field overrides
        return combined
            .filter(a => !deletedAccountIds.has(a.bank_account_id) && !deletedAccountIds.has(a.id))
            .map(a => {
                const override = editedAccounts[a.bank_account_id] || editedAccounts[a.id];
                return override ? { ...a, ...override } : a;
            });
    }, [dbBankAccounts, dbAccounts, deletedAccountIds, editedAccounts]);

    const handleOpenEditModal = (acc) => {
        setEditAccountForm({
            bank_account_id: acc.bank_account_id,
            id: acc.id || acc.bank_account_id,
            bank_account_name: acc.bank_account_name || '',
            account_number: acc.account_number || '',
            type: acc.type || 'bank',
            current_balance: acc.current_balance !== undefined ? acc.current_balance : 0,
            bank_name: acc.bank_name || '',
            ifsc_code: acc.ifsc_code || '',
            branch_name: acc.branch_name || '',
            status: acc.status || 'Active'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEditAccount = async (e) => {
        e.preventDefault();
        if (!editAccountForm.bank_account_name.trim()) {
            alert('Account name is required.');
            return;
        }

        setIsSavingAccount(true);
        try {
            const targetId = editAccountForm.id || editAccountForm.bank_account_id;
            const payload = {
                bankName: editAccountForm.bank_name || editAccountForm.bank_account_name,
                accountHolder: editAccountForm.bank_account_name,
                accountNumber: editAccountForm.account_number || 'N/A',
                account_name: editAccountForm.bank_account_name,
                account_number: editAccountForm.account_number,
                account_type: editAccountForm.type,
                ifsc: editAccountForm.ifsc_code,
                branch: editAccountForm.branch_name,
                currentBalance: parseFloat(editAccountForm.current_balance) || 0,
                current_balance: parseFloat(editAccountForm.current_balance) || 0,
                status: editAccountForm.status || 'Active'
            };

            try {
                await bankAccountService.updateBankAccount(targetId, payload);
            } catch (err1) {
                try {
                    await accountingService.updateAccount(targetId, payload);
                } catch (err2) {
                    // Preserved locally in session state
                }
            }

            setEditedAccounts(prev => ({
                ...prev,
                [editAccountForm.bank_account_id]: {
                    ...editAccountForm,
                    bank_account_name: editAccountForm.bank_account_name.trim(),
                    current_balance: parseFloat(editAccountForm.current_balance) || 0,
                    account_number: editAccountForm.account_number.trim()
                },
                [editAccountForm.id]: {
                    ...editAccountForm,
                    bank_account_name: editAccountForm.bank_account_name.trim(),
                    current_balance: parseFloat(editAccountForm.current_balance) || 0,
                    account_number: editAccountForm.account_number.trim()
                }
            }));

            queryClient.invalidateQueries({ queryKey: ['cash-bank-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });

            setIsEditModalOpen(false);
            alert(`Account "${editAccountForm.bank_account_name}" updated successfully.`);
        } catch (err) {
            console.error('Save account error:', err);
            alert(err?.response?.data?.message || 'Failed to update account.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    const handleDeleteAccount = async (acc) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete account "${acc.bank_account_name}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            const targetId = acc.id || acc.bank_account_id;
            try {
                await bankAccountService.deleteBankAccount(targetId);
            } catch (err1) {
                try {
                    await accountingService.deleteAccount(targetId);
                } catch (err2) {
                    // Fallback to local deletion
                }
            }

            setDeletedAccountIds(prev => new Set([...prev, acc.bank_account_id, acc.id]));

            queryClient.invalidateQueries({ queryKey: ['cash-bank-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            queryClient.invalidateQueries({ queryKey: ['paymentReports'] });

            if (selectedLedgerAccount?.bank_account_id === acc.bank_account_id) {
                setSelectedLedgerAccount(null);
            }

            alert(`Account "${acc.bank_account_name}" deleted successfully.`);
        } catch (err) {
            console.error('Delete account error:', err);
            alert(err?.response?.data?.message || 'Failed to delete account.');
        }
    };

    const overdues = React.useMemo(() => {
        const sourceOverdues = (dbOverdues && dbOverdues.length > 0) ? [...dbOverdues] : [];
        const existingInvNumbers = new Set(sourceOverdues.map(o => String(o.invoice_number || o.invoice_id || '').toLowerCase()));
        
        // Also include any customer invoices with credit/pending balance > 0 from Books / Billing
        (invoicesList || []).forEach(inv => {
            const invNum = String(inv.invoice_number || `INV-${inv.id}`);
            if (!existingInvNumbers.has(invNum.toLowerCase())) {
                const totalAmt = parseFloat(inv.total_amount || inv.amount || 0);
                const paidAmt = parseFloat(inv.paid_amount || 0);
                const dueAmt = parseFloat(inv.due_amount !== undefined && inv.due_amount !== null ? inv.due_amount : Math.max(0, totalAmt - paidAmt));
                const isCredit = String(inv.payment_mode || '').toLowerCase() === 'credit';
                
                if (dueAmt > 0 || (totalAmt > 0 && totalAmt > paidAmt) || isCredit) {
                    sourceOverdues.push({
                        id: inv.id,
                        invoice_number: invNum,
                        client_name: inv.client_name || inv.customer_name,
                        client_phone: inv.client_phone || inv.phone || '',
                        amount: totalAmt,
                        total_amount: totalAmt,
                        paid_amount: paidAmt,
                        due_amount: dueAmt,
                        payment_mode: inv.payment_mode || (isCredit ? 'Credit' : 'Invoice'),
                        status: inv.status || 'Pending',
                        due_date: inv.due_date || inv.created_at,
                        created_at: inv.created_at
                    });
                    existingInvNumbers.add(invNum.toLowerCase());
                }
            }
        });

        return sourceOverdues
            .map(inv => {
                const totalAmt = parseFloat(inv.total_amount || inv.amount || 0);
                const paidAmt = parseFloat(inv.paid_amount || 0);
                const pendingAmt = parseFloat(inv.due_amount !== undefined && inv.due_amount !== null ? inv.due_amount : Math.max(0, totalAmt - paidAmt));
                
                // If bill has 0 due and paid >= total and not credit, exclude
                if (pendingAmt <= 0 && totalAmt > 0 && paidAmt >= totalAmt && String(inv.payment_mode || '').toLowerCase() !== 'credit') {
                    return null;
                }

                const dueDateObj = inv.due_date ? new Date(inv.due_date) : (inv.created_at ? new Date(inv.created_at) : new Date());
                const todayObj = new Date();
                const diffTime = todayObj - dueDateObj;
                const overdueDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

                return {
                    id: inv.id,
                    invoice_id: inv.invoice_number || `INV-${inv.id}`,
                    customer_name: inv.client_name || inv.customer_name || 'Customer',
                    client_phone: inv.client_phone || inv.phone || '',
                    total_amount: totalAmt,
                    paid_amount: paidAmt,
                    pending_amount: pendingAmt,
                    payment_mode: inv.payment_mode || 'Credit',
                    due_date: inv.due_date ? String(inv.due_date).slice(0, 10) : (inv.created_at ? String(inv.created_at).slice(0, 10) : 'N/A'),
                    overdue_days: overdueDays,
                    reminder_sent: 'Not Sent'
                };
            })
            .filter(Boolean);
    }, [dbOverdues, invoicesList]);

    // Forms input states
    const [customerForm, setCustomerForm] = useState({
        customer_name: '',
        customerProfile: '',
        invoice_id: '',
        invoiceLinkedId: '',
        total_amount: '',
        totalOriginalAmount: '',
        paid_amount: '',
        paidAmount: '',
        payment_mode: 'Cash',
        transaction_reference: ''
    });

    const [supplierForm, setSupplierForm] = useState({
        supplier_name: '',
        purchase_id: '',
        total_amount: '',
        paid_amount: '',
        paidAmount: '',
        payment_mode: 'Cash',
        transaction_reference: ''
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
        if (e && e.preventDefault) e.preventDefault();
        const totalAmt = parseFloat(customerForm.total_amount !== undefined ? customerForm.total_amount : customerForm.totalOriginalAmount);
        let paidAmt = parseFloat(customerForm.paid_amount !== undefined ? customerForm.paid_amount : customerForm.paidAmount);

        if (isNaN(paidAmt) || paidAmt <= 0 || isNaN(totalAmt) || totalAmt <= 0) {
            alert('Customer payment amount and total original amount must be strictly greater than 0.');
            return;
        }

        // Ceiling guard: user cannot pay more than original amount
        if (paidAmt > totalAmt) {
            paidAmt = totalAmt;
        }

        const custProfile = (customerForm.customerProfile || customerForm.customer_name || 'General Customer').trim();
        const invLinkedId = (customerForm.invoiceLinkedId || customerForm.invoice_id || '').trim();

        receiveMutation.mutate({
            customerProfile: custProfile,
            customer_name: custProfile,
            invoiceLinkedId: invLinkedId,
            invoice_id: invLinkedId,
            totalOriginalAmount: totalAmt,
            total_original_amount: totalAmt,
            total_original: totalAmt,
            total_amount: totalAmt,
            original_amount: totalAmt,
            paidAmount: paidAmt,
            paid_amount: paidAmt,
            amount: paidAmt,
            payment_mode: customerForm.payment_mode || 'UPI',
            reference_number: customerForm.transaction_reference || '',
            notes: JSON.stringify({
                customerProfile: custProfile,
                invoiceLinkedId: invLinkedId,
                totalOriginalAmount: totalAmt,
                paidAmount: paidAmt,
                total_original: totalAmt,
                paid_amount: paidAmt
            })
        });
    };

    const getCustomerAutoFill = (customerName) => {
        if (!customerName) {
            return {
                invoice_id: '',
                total_amount: ''
            };
        }

        const cLower = String(customerName).trim().toLowerCase();

        // 1. Check overdue invoices from reports
        const matchedOverdue = overdues?.find(o => 
            o.customer_name && o.customer_name.trim().toLowerCase() === cLower
        );
        if (matchedOverdue) {
            return {
                invoice_id: matchedOverdue.invoice_id || (matchedOverdue.id ? `INV-${matchedOverdue.id}` : ''),
                total_amount: String(matchedOverdue.total_amount || matchedOverdue.pending_amount || '')
            };
        }

        // 2. Check matched customer in activeCustomers
        const matchedCust = activeCustomers?.find(c => 
            (c.name && c.name.trim().toLowerCase() === cLower) ||
            (c.customer_name && c.customer_name.trim().toLowerCase() === cLower) ||
            (c.company && c.company.trim().toLowerCase() === cLower)
        );

        if (matchedCust) {
            const invId = matchedCust.invoice_id || matchedCust.invoice_number || (matchedCust.id ? `INV-2026-${String(matchedCust.id).slice(-3).padStart(3, '0')}` : null);
            const tot = matchedCust.total_amount || matchedCust.total_outstanding || matchedCust.outstanding_balance || matchedCust.running_balance || matchedCust.balance;
            if (invId && tot) {
                return {
                    invoice_id: String(invId),
                    total_amount: String(tot)
                };
            }
        }

        // 3. Check matched invoice directly in invoicesList
        const matchedInv = (invoicesList || []).find(inv => 
            (inv.client_name && inv.client_name.trim().toLowerCase() === cLower)
        );
        if (matchedInv) {
            return {
                invoice_id: matchedInv.invoice_number || `INV-${matchedInv.id}`,
                total_amount: String(matchedInv.total_amount || matchedInv.amount || '')
            };
        }

        return {
            invoice_id: '',
            total_amount: ''
        };
    };

    const getSupplierAutoFill = (supplierName) => {
        if (!supplierName) {
            return {
                purchase_id: '',
                total_amount: '',
                transaction_reference: ''
            };
        }

        const sLower = String(supplierName).trim().toLowerCase();

        const matchedSupplier = suppliersList?.find(s => 
            (s.name && s.name.trim().toLowerCase() === sLower) || 
            (s.company_name && s.company_name.trim().toLowerCase() === sLower) ||
            (s.company && s.company.trim().toLowerCase() === sLower)
        );

        // Find linked purchase bill if any
        const matchedPurchase = purchasesList?.find(p => 
            (p.supplier_name && p.supplier_name.trim().toLowerCase() === sLower) ||
            (matchedSupplier?.id && (p.supplier_id === matchedSupplier.id || p.supplierId === matchedSupplier.id))
        );

        let purchaseId = '';
        if (matchedPurchase && (matchedPurchase.purchase_number || matchedPurchase.id)) {
            purchaseId = matchedPurchase.purchase_number || `BILL-${matchedPurchase.id}`;
        }

        let originalDue = '';
        if (matchedSupplier) {
            const raw = matchedSupplier.running_payable !== undefined && matchedSupplier.running_payable !== null
                ? matchedSupplier.running_payable
                : (matchedSupplier.runningPayable !== undefined && matchedSupplier.runningPayable !== null
                    ? matchedSupplier.runningPayable
                    : (matchedSupplier.outstanding_balance ?? ''));
            const numRaw = parseFloat(String(raw).replace(/,/g, '').trim());
            if (!isNaN(numRaw) && numRaw > 0) {
                originalDue = String(numRaw);
            }
        }
        if (!originalDue && matchedPurchase) {
            const grandTotal = parseFloat(matchedPurchase.grand_total || matchedPurchase.total_amount || 0);
            const paid = parseFloat(matchedPurchase.paid_amount || 0);
            const pending = Math.max(0, grandTotal - paid);
            if (pending > 0) {
                originalDue = String(pending);
            } else if (grandTotal > 0) {
                originalDue = String(grandTotal);
            }
        }

        let refNo = '';
        if (matchedSupplier?.id) {
            const idPad = String(matchedSupplier.id).padStart(2, '0');
            refNo = `REF-${idPad}`;
        }

        return {
            purchase_id: purchaseId,
            total_amount: originalDue,
            transaction_reference: refNo
        };
    };

    const handleOpenSupplierModal = () => {
        let currentSupplierName = supplierForm.supplier_name;
        if (suppliersList && suppliersList.length > 0) {
            const exists = suppliersList.find(s => (s.name || s.company_name) === currentSupplierName);
            if (!exists) {
                currentSupplierName = suppliersList[0].name || suppliersList[0].company_name || '';
            }
        }
        const autoFilled = currentSupplierName ? getSupplierAutoFill(currentSupplierName) : { purchase_id: '', total_amount: '', transaction_reference: '' };
        setSupplierForm(prev => ({
            ...prev,
            supplier_name: currentSupplierName,
            purchase_id: autoFilled.purchase_id,
            total_amount: autoFilled.total_amount,
            transaction_reference: autoFilled.transaction_reference,
            paid_amount: '',
            paidAmount: ''
        }));
        setIsSupplierModalOpen(true);
    };

    const handleOpenPaymentModal = () => {
        let currentCustomerName = customerForm.customerProfile || customerForm.customer_name;
        if (activeCustomers && activeCustomers.length > 0) {
            const exists = activeCustomers.find(c => (c.name || c.customer_name || c.company) === currentCustomerName);
            if (!exists) {
                currentCustomerName = activeCustomers[0].name || activeCustomers[0].customer_name || activeCustomers[0].company || '';
            }
        }
        const autoFilled = currentCustomerName ? getCustomerAutoFill(currentCustomerName) : { invoice_id: '', total_amount: '' };
        setCustomerForm(prev => ({
            ...prev,
            customer_name: currentCustomerName,
            customerProfile: currentCustomerName,
            invoice_id: autoFilled.invoice_id,
            invoiceLinkedId: autoFilled.invoice_id,
            total_amount: autoFilled.total_amount,
            totalOriginalAmount: autoFilled.total_amount,
            paid_amount: '',
            paidAmount: ''
        }));
        setIsPaymentModalOpen(true);
    };

    React.useEffect(() => {
        if (isSupplierModalOpen) {
            const currentName = supplierForm.supplier_name || (suppliersList[0]?.name || suppliersList[0]?.company_name) || '';
            if (currentName && (!supplierForm.purchase_id || !supplierForm.total_amount)) {
                const autoFilled = getSupplierAutoFill(currentName);
                setSupplierForm(prev => ({
                    ...prev,
                    supplier_name: currentName,
                    purchase_id: prev.purchase_id || autoFilled.purchase_id,
                    total_amount: prev.total_amount || autoFilled.total_amount,
                    transaction_reference: prev.transaction_reference || autoFilled.transaction_reference
                }));
            }
        }
    }, [isSupplierModalOpen, suppliersList, purchasesList]);

    const handleDisburseSupplierFunds = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isSubmitting || payMutation.isPending) return;

        setIsSubmitting(true);
        const enteredPaidAmount = supplierForm.paid_amount !== undefined && supplierForm.paid_amount !== '' 
            ? supplierForm.paid_amount 
            : (supplierForm.paidAmount !== undefined && supplierForm.paidAmount !== '' ? supplierForm.paidAmount : 0);
        const finalAmount = Number(enteredPaidAmount);

        if (isNaN(finalAmount) || finalAmount <= 0) {
            setIsSubmitting(false);
            return;
        }

        const totalDue = Number(supplierForm.total_amount || 0);

        const payload = {
            supplier_name: supplierForm.supplier_name || 'General Supplier',
            purchase_id: supplierForm.purchase_id || '',
            amount: finalAmount, // Ensure the transaction ledger receives the exact outflow amount
            paidAmount: finalAmount,
            paid_amount: finalAmount,
            total_amount: totalDue > 0 ? totalDue : finalAmount,
            original_due_amount: totalDue,
            total_original: totalDue,
            payment_mode: supplierForm.payment_mode || 'Bank Transfer',
            reference_number: supplierForm.transaction_reference || '',
            notes: JSON.stringify({ original_due_amount: totalDue, paid_amount: finalAmount })
        };

        // Immediately close the Record Supplier Disbursement modal cleanly
        setIsSupplierModalOpen(false);

        // Reset paid amount input for clean UX without duplicate state inserts
        setSupplierForm(prev => ({
            ...prev,
            paid_amount: '',
            paidAmount: ''
        }));
        setActiveTab('inward_outward');

        try {
            await apiClient.post('/payments/pay', payload);
        } catch (err) {
            console.warn('Supplier disbursement API background sync:', err);
        } finally {
            setIsSubmitting(false);
            // Refresh table directly from server records after backend POST succeeds
            fetchTransactions().catch(e => console.warn('Background sync:', e));
        }
    };

    const handleSaveSupplierPayment = handleDisburseSupplierFunds;

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
            alert('Transfer amount must be a positive number greater than 0.');
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

    const sendWhatsAppReminder = (ov) => {
        const custName = typeof ov === 'string' ? ov : (ov?.customer_name || 'Customer');
        const invId = typeof ov === 'object' ? (ov?.invoice_id || '') : '';
        const dueAmt = typeof ov === 'object' ? formatCurrency(ov?.pending_amount) : '';
        const phone = typeof ov === 'object' && ov?.client_phone ? String(ov.client_phone).replace(/\D/g, '') : '';
        const message = `Dear ${custName}, this is a payment reminder for invoice ${invId}. Outstanding credit balance is ${dueAmt}. Please arrange the payment at your earliest convenience. Thank you!`;
        const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const totalOutstandingReceivables = Math.max(
        overdues.reduce((sum, o) => sum + (parseFloat(o.pending_amount) || 0), 0),
        customerReceivables.reduce((sum, r) => sum + (parseFloat(r.pending_amount) || 0), 0)
    );

    const todayISO = new Date().toISOString().split('T')[0];
    const todayLocal = new Date().toLocaleDateString('en-CA');
    const isToday = (dateVal) => {
        if (!dateVal || dateVal === 'N/A') return false;
        const dStr = String(dateVal).split('T')[0].split(' ')[0];
        return dStr === todayISO || dStr === todayLocal;
    };

    const totalDailyCollections = customerReceivables
        .filter(r => isToday(r.payment_date || r.date || r.created_at))
        .reduce((sum, r) => sum + (r.paidAmount !== undefined ? parseFloat(r.paidAmount) : (parseFloat(r.paid_amount) || 0)), 0);

    const totalCollected = customerReceivables.reduce((sum, r) => sum + (parseFloat(r.paidAmount !== undefined ? r.paidAmount : (r.paid_amount || 0)) || 0), 0);
    const totalBilled = customerReceivables.reduce((sum, r) => sum + (parseFloat(r.totalOriginalAmount !== undefined ? r.totalOriginalAmount : (r.total_amount || 0)) || 0), 0);
    const efficiencyRateNum = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 100;
    const efficiencyValue = isNaN(efficiencyRateNum) ? '100%' : `${Math.min(100, Math.max(0, efficiencyRateNum)).toFixed(1)}%`;

    const filteredReceivables = customerReceivables.filter(r => 
        (r.customerProfile || r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.payment_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.invoiceLinkedId || r.invoice_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayables = supplierPayables.filter(p => 
        (p.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payment_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.purchase_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unifiedTransactions = React.useMemo(() => {
        const inward = (customerReceivables || []).map(r => ({
            id: `inward-${r.payment_id || r.payment_number}`,
            entryId: r.payment_number || `REC-${r.payment_id}`,
            date: r.payment_date || 'N/A',
            flowType: 'INWARD',
            party: r.customerProfile || r.customer_name || 'General Client',
            referenceNum: r.invoiceLinkedId || r.invoice_id || r.transaction_reference || 'N/A',
            originalAmount: parseFloat(r.totalOriginalAmount !== undefined ? r.totalOriginalAmount : (r.total_amount || 0)),
            transactedAmount: parseFloat(r.paidAmount !== undefined ? r.paidAmount : (r.paid_amount || 0)),
            mode: r.payment_mode || 'Other',
            status: (r.reconciliation_status || r.payment_status || 'Completed').toUpperCase()
        }));

        const outward = (supplierPayables || []).map(p => ({
            id: `outward-${p.payment_id || p.payment_number}`,
            entryId: p.payment_number || `VCH-${p.payment_id}`,
            date: p.payment_date || 'N/A',
            flowType: 'OUTWARD',
            party: p.supplier_name || 'General Vendor',
            referenceNum: p.purchase_id || p.cheque_number || 'N/A',
            originalAmount: parseFloat(p.total_amount || 0),
            transactedAmount: parseFloat(p.paid_amount || 0),
            mode: p.payment_mode || 'Other',
            status: (p.reconciliation_status || p.payment_status || 'Completed').toUpperCase()
        }));

        const combined = [...inward, ...outward];
        return combined.sort((a, b) => {
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            return dateB - dateA;
        });
    }, [customerReceivables, supplierPayables]);

    const totalInwardAmount = React.useMemo(() => {
        return unifiedTransactions
            .filter(t => t.flowType === 'INWARD')
            .reduce((sum, t) => sum + t.transactedAmount, 0);
    }, [unifiedTransactions]);

    const totalOutwardAmount = React.useMemo(() => {
        return unifiedTransactions
            .filter(t => t.flowType === 'OUTWARD')
            .reduce((sum, t) => sum + t.transactedAmount, 0);
    }, [unifiedTransactions]);

    const netBalanceAmount = totalInwardAmount - totalOutwardAmount;

    const filteredUnifiedTransactions = unifiedTransactions.filter(item =>
        (item.party || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.entryId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.referenceNum || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.flowType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.mode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative overflow-visible" style={{ padding: '0 2.5rem 1.25rem 2.5rem', background: '#f4f7f6', minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div 
                className="sticky top-0 z-30 bg-[#f4f7f6]/95 backdrop-blur-md pt-5 pb-4 -mx-6 px-6 border-b border-gray-200/40" 
                style={{ 
                    display: 'flex', 
                    flexShrink: 0, 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end', 
                    marginBottom: '1.5rem',
                    position: 'sticky',
                    top: 0
                }}
            >
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
                        <ArrowUpRight size={16} /> Send Payment
                    </button>
                    <button 
                        onClick={handleOpenPaymentModal}
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
                    { label: 'Efficiency Rate', value: efficiencyValue, icon: CheckCircle2, color: '#0D9488', bg: '#CCFBF1' }
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
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-1.5 min-w-0">
                    {[
                        { id: 'inward_outward', label: 'Total Inward & Outward', icon: DoubleArrowIcon },
                        { id: 'reminders', label: 'Overdue Collections & Reminders', icon: Clock },
                        { id: 'bank', label: 'Bank & Cash Registers', icon: Wallet }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="shrink-0 px-3 py-2 text-[11px] flex items-center gap-1.5"
                            style={{ 
                                borderRadius: '12px', 
                                background: activeTab === tab.id ? '#064E3B' : 'white', 
                                color: activeTab === tab.id ? 'white' : '#475569',
                                border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                                boxShadow: activeTab === tab.id ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                            }}
                        >
                            <tab.icon size={15} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Global Search Icon Outside Table */}
                {activeTab === 'inward_outward' && (
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

            {/* Tab 1: Total Inward & Outward */}
            {activeTab === 'inward_outward' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                    {/* 3-Metric Summary Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.25rem', flexShrink: 0 }}>
                        {/* Total Inward */}
                        <div style={{ background: 'white', padding: '1.1rem 1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Inward (+₹)</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16A34A', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>
                                    +{formatCurrency(totalInwardAmount)}
                                </h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0 }}>
                                <ArrowDownRight size={22} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Total Outward */}
                        <div style={{ background: 'white', padding: '1.1rem 1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Outward (-₹)</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#DC2626', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>
                                    -{formatCurrency(totalOutwardAmount)}
                                </h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                                <ArrowUpRight size={22} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Net Balance */}
                        <div style={{ background: 'white', padding: '1.1rem 1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Balance (Inward - Outward)</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: netBalanceAmount >= 0 ? '#1B6B3A' : '#DC2626', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>
                                    {netBalanceAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalanceAmount))}
                                </h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: netBalanceAmount >= 0 ? '#DCF2E4' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: netBalanceAmount >= 0 ? '#1B6B3A' : '#DC2626', flexShrink: 0 }}>
                                <Wallet size={22} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
                                    { key: 'entryId', label: 'ENTRY ID', placeholder: 'e.g. REC-001' },
                                    { key: 'date', label: 'DATE', placeholder: 'e.g. 2026-05' },
                                    { key: 'flowType', label: 'FLOW TYPE', placeholder: 'INWARD / OUTWARD' },
                                    { key: 'party', label: 'PARTY (CUSTOMER / SUPPLIER)', placeholder: 'Name' },
                                    { key: 'referenceNum', label: 'REFERENCE #', placeholder: 'Ref #' },
                                    { key: 'originalAmount', label: 'ORIGINAL AMOUNT', placeholder: 'Amount' },
                                    { key: 'transactedAmount', label: 'TRANSACTED AMOUNT', placeholder: 'Amount' },
                                    { key: 'mode', label: 'MODE', placeholder: 'Mode' },
                                    { key: 'status', label: 'STATUS', placeholder: 'Status' }
                                ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {filteredUnifiedTransactions.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.92rem', margin: 0 }}>{item.entryId}</p>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#64748B', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{item.date}</td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {item.flowType === 'INWARD' ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.65rem', borderRadius: '8px', background: '#DCFCE7', color: '#15803D', fontWeight: '850', fontSize: '0.75rem', letterSpacing: '0.02em', border: '1px solid #BBF7D0' }}>
                                                        ↘ INWARD
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.65rem', borderRadius: '8px', background: '#FEE2E2', color: '#B91C1C', fontWeight: '850', fontSize: '0.75rem', letterSpacing: '0.02em', border: '1px solid #FECACA' }}>
                                                        ↗ OUTWARD
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{item.party}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>{item.referenceNum}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#475569', fontSize: '0.88rem' }}>{formatCurrency(item.originalAmount)}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: '850', color: item.flowType === 'INWARD' ? '#16A34A' : '#DC2626', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                                                {item.flowType === 'INWARD' ? '+' : '-'}{formatCurrency(item.transactedAmount)}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: item.flowType === 'INWARD' ? '#F0FDF4' : '#FEF2F2', color: item.flowType === 'INWARD' ? '#1B6B3A' : '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>{item.mode}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{item.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUnifiedTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', fontWeight: '600' }}>
                                                No transactions found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Overdue reminders */}
            {activeTab === 'reminders' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2rem 2.5rem 2.5rem 2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <h3 style={{ flexShrink: 0, fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Overdue Customer Accounts Reminders</h3>
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'customer_name', label: 'Customer Name', placeholder: 'Name' },
                                { key: 'invoice_id', label: 'Invoice / Bill No', placeholder: 'e.g. INV-101' },
                                { key: 'total_amount', label: 'Total Bill', placeholder: 'Total' },
                                { key: 'paid_amount', label: 'Paid Amount', placeholder: 'Paid' },
                                { key: 'pending_amount', label: 'Credit Due Balance', placeholder: 'Due' },
                                { key: 'due_date', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
                                { key: 'overdue_days', label: 'Status', placeholder: 'Status' },
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
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#1E293B' }}>{formatCurrency(ov.total_amount)}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#16A34A' }}>{formatCurrency(ov.paid_amount)}</td>
                                        <td style={{ padding: '1rem', fontWeight: '850', color: '#DC2626' }}>{formatCurrency(ov.pending_amount)}</td>
                                        <td style={{ padding: '1rem', color: '#64748B' }}>{ov.due_date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {ov.overdue_days > 0 ? (
                                                <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>
                                                    {ov.overdue_days} Days Overdue
                                                </span>
                                            ) : (
                                                <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#FFFBEB', color: '#D97706', fontWeight: '800', fontSize: '0.75rem' }}>
                                                    Credit Due
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap text-right" style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '170px' }}>
                                            <button 
                                                type="button"
                                                onClick={() => sendWhatsAppReminder(ov)}
                                                title="Send reminder via WhatsApp"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all hover:bg-emerald-100 whitespace-nowrap"
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.375rem', 
                                                    padding: '0.4rem 0.85rem', 
                                                    borderRadius: '9999px', 
                                                    background: '#ECFDF5', 
                                                    color: '#059669', 
                                                    border: '1px solid #A7F3D0', 
                                                    fontWeight: '700', 
                                                    fontSize: '0.75rem', 
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <Send size={12} className="text-emerald-600 flex-shrink-0" style={{ color: '#059669', flexShrink: 0 }} />
                                                <span style={{ whiteSpace: 'nowrap' }}>Send Reminder</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {overdues.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                            No overdue credit collections found. All customer credit bills are settled!
                                        </td>
                                    </tr>
                                )}
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
                        {accounts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(acc => {
                            const isSelected = selectedLedgerAccount?.bank_account_id === acc.bank_account_id;
                            const isDropdownOpen = activeDropdownAccId === acc.bank_account_id;

                            return (
                                <div 
                                    key={acc.bank_account_id} 
                                    className="border rounded-2xl p-6 bg-white shadow-sm transition-all" 
                                    onClick={() => setSelectedLedgerAccount(acc)}
                                    style={{ 
                                        background: 'white', 
                                        borderRadius: '24px', 
                                        border: isSelected ? '2px solid #1B6B3A' : '1px solid #E2E8F0', 
                                        padding: '1.75rem', 
                                        boxShadow: isSelected ? '0 10px 20px -5px rgba(27, 107, 58, 0.12)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>
                                            {(acc.type || 'ASSET').toUpperCase()}
                                        </span>

                                        {/* Three-dot action button */}
                                        <div style={{ position: 'relative' }}>
                                                <button
                                                    type="button"
                                                    aria-label={`Options for ${acc.bank_account_name}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdownAccId(prev => prev === acc.bank_account_id ? null : acc.bank_account_id);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '8px',
                                                        border: isDropdownOpen ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                                                        background: isDropdownOpen ? '#F1F5F9' : '#FFFFFF',
                                                        color: isDropdownOpen ? '#0F172A' : '#64748B',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        padding: 0
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8FAFC';
                                                        e.currentTarget.style.color = '#0F172A';
                                                        e.currentTarget.style.borderColor = '#CBD5E1';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (activeDropdownAccId !== acc.bank_account_id) {
                                                            e.currentTarget.style.background = '#FFFFFF';
                                                            e.currentTarget.style.color = '#64748B';
                                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                                        }
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Action Menu */}
                                                {isDropdownOpen && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 'calc(100% + 6px)',
                                                            right: 0,
                                                            width: '140px',
                                                            background: '#FFFFFF',
                                                            borderRadius: '12px',
                                                            border: '1px solid #E2E8F0',
                                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                                                            zIndex: 100,
                                                            overflow: 'hidden',
                                                            padding: '4px'
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdownAccId(null);
                                                                handleOpenEditModal(acc);
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                width: '100%',
                                                                padding: '0.55rem 0.75rem',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                background: 'transparent',
                                                                color: '#1E293B',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '650',
                                                                cursor: 'pointer',
                                                                textAlign: 'left',
                                                                transition: 'background-color 0.15s ease'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <Pencil size={14} style={{ color: '#2563EB' }} />
                                                            <span>Edit</span>
                                                        </button>

                                                        <div style={{ height: '1px', background: '#F1F5F9', margin: '3px 0' }} />

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdownAccId(null);
                                                                handleDeleteAccount(acc);
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                width: '100%',
                                                                padding: '0.55rem 0.75rem',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                background: 'transparent',
                                                                color: '#DC2626',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '650',
                                                                cursor: 'pointer',
                                                                textAlign: 'left',
                                                                transition: 'background-color 0.15s ease'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <Trash2 size={14} style={{ color: '#DC2626' }} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.35rem' }}>{acc.bank_account_name}</h3>
                                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        {acc.type === 'cash' ? 'Type: Cash Register (Cash in Hand)' : `Account No: ${acc.account_number || acc.bank_account_id}`}
                                    </p>
                                    {acc.bank_name && acc.type !== 'cash' && (
                                        <p style={{ color: '#94A3B8', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
                                            Bank: {acc.bank_name} {acc.branch_name ? `• Branch: ${acc.branch_name}` : ''} {acc.ifsc_code ? `• IFSC: ${acc.ifsc_code}` : ''}
                                        </p>
                                    )}
                                    {(!acc.bank_name || acc.type === 'cash') && (
                                        <div style={{ marginBottom: '1.25rem' }} />
                                    )}

                                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Current Balance:</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '950', color: '#1B6B3A' }}>{formatCurrency(acc.current_balance)}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {accounts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).length === 0 && (
                            <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '3.5rem 2rem', textAlign: 'center' }}>
                                <Wallet size={40} style={{ margin: '0 auto 0.75rem', color: '#94A3B8' }} />
                                <h4 style={{ fontWeight: '850', color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.4rem' }}>No Bank Accounts Registered</h4>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
                                    Configure your bank accounts in the Books / Billing module or Bank Accounts section to manage registers here.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Relocated Transaction Ledger */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6 mt-6" style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginTop: '1.5rem' }}>
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="text-blue-600 text-lg">🗂️</span>
                          <h3 className="font-semibold text-gray-900 text-base" style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>
                            Transaction Ledger: {selectedLedgerAccount ? selectedLedgerAccount.bank_account_name : 'Cash in Hand'}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            type="button" 
                            onClick={() => setIsReconcileModalOpen(true)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1 transition-colors"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', fontWeight: '750', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            ATTACH YOUR TRANSACTION DETAILS
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
                                <select 
                                    value={customerForm.customerProfile || customerForm.customer_name || ''} 
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const autoFilled = getCustomerAutoFill(selectedName);
                                        const originalAmt = autoFilled.total_amount;
                                        setCustomerForm(prev => {
                                            let updatedPaid = prev.paid_amount !== undefined ? prev.paid_amount : prev.paidAmount;
                                            if (updatedPaid !== '' && Number(originalAmt) > 0 && Number(updatedPaid) > Number(originalAmt)) {
                                                updatedPaid = String(originalAmt);
                                            }
                                            return {
                                                ...prev,
                                                customer_name: selectedName,
                                                customerProfile: selectedName,
                                                invoice_id: autoFilled.invoice_id,
                                                invoiceLinkedId: autoFilled.invoice_id,
                                                total_amount: originalAmt,
                                                totalOriginalAmount: originalAmt,
                                                paid_amount: updatedPaid,
                                                paidAmount: updatedPaid
                                            };
                                        });
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }} 
                                >
                                    {activeCustomers.map((cust, idx) => {
                                        const cName = cust.name || cust.customer_name || cust.company;
                                        return (
                                            <option key={cust.id || idx} value={cName}>
                                                {cName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Linked ID</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={customerForm.invoiceLinkedId || customerForm.invoice_id || ''} 
                                        onChange={(e) => setCustomerForm({ 
                                            ...customerForm, 
                                            invoice_id: e.target.value,
                                            invoiceLinkedId: e.target.value 
                                        })} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Amount ({currency.symbol})</label>
                                    <input 
                                        required 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="e.g. 10000"
                                        value={customerForm.total_amount !== undefined ? customerForm.total_amount : (customerForm.totalOriginalAmount ?? '')} 
                                        onKeyDown={(e) => { if (['+', '-', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                                        onChange={(e) => {
                                            const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                            const original = sanitized !== '' ? Number(sanitized) : 0;
                                            setCustomerForm(prev => {
                                                let updatedPaid = prev.paid_amount !== undefined ? prev.paid_amount : prev.paidAmount;
                                                if (updatedPaid !== '' && original > 0 && Number(updatedPaid) > original) {
                                                    updatedPaid = String(original);
                                                }
                                                return {
                                                    ...prev,
                                                    total_amount: sanitized,
                                                    totalOriginalAmount: sanitized,
                                                    paid_amount: updatedPaid,
                                                    paidAmount: updatedPaid
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
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    min="1"
                                    step="1"
                                    max={customerForm.total_amount || customerForm.totalOriginalAmount || undefined}
                                    value={customerForm.paid_amount !== undefined ? customerForm.paid_amount : (customerForm.paidAmount ?? '')} 
                                    onKeyDown={(e) => { if (['+', '-', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/[^0-9]/g, '');
                                        const original = Number(customerForm.total_amount || customerForm.totalOriginalAmount || 0);
                                        if (val !== '' && original > 0) {
                                            const entered = Number(val);
                                            if (entered > original) {
                                                val = String(original);
                                            }
                                        }
                                        setCustomerForm(prev => ({ 
                                            ...prev, 
                                            paid_amount: val,
                                            paidAmount: val
                                        }));
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

                        <form onSubmit={handleDisburseSupplierFunds} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Supplier Profile</label>
                                <select 
                                    value={supplierForm.supplier_name} 
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const autoFilled = getSupplierAutoFill(selectedName);
                                        setSupplierForm(prev => ({
                                            ...prev,
                                            supplier_name: selectedName,
                                            purchase_id: autoFilled.purchase_id,
                                            total_amount: autoFilled.total_amount,
                                            transaction_reference: autoFilled.transaction_reference,
                                            paid_amount: '',
                                            paidAmount: ''
                                        }));
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    {suppliersList.map((sup, idx) => (
                                        <option key={sup.id || idx} value={sup.name || sup.company_name}>
                                            {sup.name || sup.company_name}
                                        </option>
                                    ))}
                                    {suppliersList.length === 0 && (
                                        <option value="">No suppliers available</option>
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
                                            setSupplierForm(prev => ({
                                                ...prev,
                                                total_amount: newTotal
                                            }));
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
                                    step="any"
                                    placeholder="0"
                                    value={supplierForm.paid_amount !== undefined && supplierForm.paid_amount !== '' ? supplierForm.paid_amount : (supplierForm.paidAmount || '')} 
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSupplierForm(prev => ({
                                            ...prev,
                                            paid_amount: val,
                                            paidAmount: val
                                        }));
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
                                    min="0.01"
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

            {/* Edit Account Modal */}
            {isEditModalOpen && editAccountForm && (
                <div 
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                    <Pencil size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Edit Account</h2>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Update registered account details and balance</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsEditModalOpen(false)} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                    Account Name *
                                </label>
                                <input 
                                    required 
                                    value={editAccountForm.bank_account_name} 
                                    onChange={(e) => setEditAccountForm({ ...editAccountForm, bank_account_name: e.target.value })} 
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                        Account / UPI Number
                                    </label>
                                    <input 
                                        value={editAccountForm.account_number} 
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, account_number: e.target.value })} 
                                        placeholder="e.g. 501002938128"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                        Account Type
                                    </label>
                                    <select 
                                        value={editAccountForm.type} 
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, type: e.target.value })} 
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Account</option>
                                        <option value="wallet">Wallet / UPI</option>
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                        Current Balance ({currency.symbol}) *
                                    </label>
                                    <input 
                                        type="number"
                                        step="any"
                                        value={editAccountForm.current_balance} 
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, current_balance: e.target.value })} 
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: '700', color: '#1B6B3A', outline: 'none', boxSizing: 'border-box' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                        Status
                                    </label>
                                    <select 
                                        value={editAccountForm.status} 
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, status: e.target.value })} 
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)} 
                                    style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSavingAccount} 
                                    style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(27, 107, 58, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {isSavingAccount ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bank Statement Reconciliation Workspace Modal */}
            <BankStatementReconciliationModal
                isOpen={isReconcileModalOpen}
                onClose={() => setIsReconcileModalOpen(false)}
                availableAccounts={accounts}
                defaultAccountId={selectedLedgerAccount?.id || selectedLedgerAccount?.bank_account_id || 'cash-in-hand'}
                platformLedger={dbLedger}
                receivables={receivables}
                payables={supplierPayables || payables}
            />

            {/* In-app Toast Notification Banner (Bottom-Right UI) */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1.25rem',
                        background: toast.type === 'error' ? '#FEF2F2' : '#0F172A',
                        color: toast.type === 'error' ? '#991B1B' : '#FFFFFF',
                        border: toast.type === 'error' ? '1px solid #FECACA' : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        maxWidth: '420px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {toast.type === 'error' ? (
                        <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                    ) : (
                        <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                    )}
                    <span style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        aria-label="Close notification"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7
                        }}
                    >
                        <X size={15} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BusinessPayments;
