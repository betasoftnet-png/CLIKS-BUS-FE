import React, { useState } from 'react';
import { 
    TrendingUp, 
    Plus, 
    Search, 
    DollarSign, 
    Calendar, 
    AlertTriangle, 
    User, 
    FileText, 
    X, 
    CheckCircle2, 
    ArrowUpRight, 
    Percent, 
    Activity, 
    BarChart3, 
    Clock, 
    Settings, 
    Smartphone,
    Layers,
    Tag,
    Trash,
    ChevronDown,
    Filter
} from 'lucide-react';
import '../App.css';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { expensesService, staffingService } from '../services';
import { useCurrency } from '../context';
import { config } from '../lib/config';

const BusinessExpenses = ({ defaultTab }) => {
    const { currency, formatCurrency } = useCurrency();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(defaultTab || searchParams.get('tab') || 'registry'); // 'registry', 'recurring', 'budget', 'claims'

    React.useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [modeFilter, setModeFilter] = useState('All');
    const [columnFilters, setColumnFilters] = useState({ voucher: '', date: '', category: '', payee: '', subtotal: '', itc: '', total: '', mode: '' });
    const updateColumnFilter = (col, val) => setColumnFilters(prev => ({ ...prev, [col]: val }));
    const [openFilterCols, setOpenFilterCols] = useState({});
    const toggleColFilter = (key) => {
        setOpenFilterCols(prev => {
            const isOpen = !!prev[key];
            if (isOpen) updateColumnFilter(key, ''); // clear on close
            return { ...prev, [key]: !isOpen };
        });
    };
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [claimAmountError, setClaimAmountError] = useState('');
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    const [budgetError, setBudgetError] = useState('');

    // Block negative sign (-), decimal point (.), and exponential (e) keys
    const handleBudgetKeyDown = (e) => {
        if (['-', '+', '.', 'e', 'E', 'Decimal'].includes(e.key)) {
            e.preventDefault();
        }
    };

    // Validate input to allow only whole positive integers (>= 1)
    const handleBudgetChange = (e) => {
        const val = e.target.value;

        if (val === '') {
            setNewBudget(prev => ({ ...prev, budget_limit: '' }));
            setBudgetError('');
            return;
        }

        if (val.includes('.') || val.includes('-')) {
            setBudgetError('Decimal fractions and negative budgets are not allowed.');
            return;
        }

        const intVal = parseInt(val, 10);
        if (isNaN(intVal) || intVal < 1) {
            setNewBudget(prev => ({ ...prev, budget_limit: val }));
            setBudgetError('Budget must be a whole positive number of at least ₹1.');
        } else {
            setNewBudget(prev => ({ ...prev, budget_limit: String(intVal) }));
            setBudgetError('');
        }
    };
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [payingClaimId, setPayingClaimId] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        paymentMode: 'Cash in Hand',
        paymentDate: new Date().toISOString().split('T')[0]
    });
    const [isRecordSpendingModalOpen, setIsRecordSpendingModalOpen] = useState(false);
    const [spendingAmountError, setSpendingAmountError] = useState('');

    React.useEffect(() => {
        if (!isRecordSpendingModalOpen) {
            setSpendingAmountError('');
        }
    }, [isRecordSpendingModalOpen]);

    // Block decimal point (.), minus (-), plus (+), and exponent (e) keys
    const handleSpendingKeyDown = (e) => {
        if (['.', 'Decimal', '-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    // Validate input to allow only whole positive integers (>= 1)
    const handleSpendingAmountChange = (e) => {
        const val = e.target.value;

        if (val === '') {
            setRecordSpendingForm(prev => ({ ...prev, amount: '' }));
            setSpendingAmountError('');
            return;
        }

        if (val.includes('.')) {
            setRecordSpendingForm(prev => ({ ...prev, amount: val }));
            setSpendingAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
            return;
        }

        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) {
            setRecordSpendingForm(prev => ({ ...prev, amount: val }));
            setSpendingAmountError('Amount spent must be a positive whole integer of at least ₹1.');
        } else {
            setRecordSpendingForm(prev => ({ ...prev, amount: String(num) }));
            setSpendingAmountError('');
        }
    };

    const [recordSpendingForm, setRecordSpendingForm] = useState({
        category_name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'UPI',
        employee_id: '',
        employee_name: '',
        file_name: '',
        file_type: '',
        file_data: '',
        file_preview_url: ''
    });

    const handleSpendingBillChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Maximum file size is 10 MB.");
            e.target.value = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF are accepted.");
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result;
            const previewUrl = URL.createObjectURL(file);
            setRecordSpendingForm(prev => {
                if (prev.file_preview_url) {
                    URL.revokeObjectURL(prev.file_preview_url);
                }
                return {
                    ...prev,
                    file_name: file.name,
                    file_type: file.type,
                    file_data: base64Data,
                    file_preview_url: previewUrl
                };
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSpendingBill = () => {
        setRecordSpendingForm(prev => {
            if (prev.file_preview_url) {
                URL.revokeObjectURL(prev.file_preview_url);
            }
            return {
                ...prev,
                file_name: '',
                file_type: '',
                file_data: '',
                file_preview_url: ''
            };
        });
    };
    
    // Auto-trigger expense modal via search instructions
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsExpenseModalOpen(true);
            setSearchParams({}, { replace: true });
        } else if (searchParams.get('claim') === 'true') {
            setActiveTab('claims');
            setIsClaimModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbExpenses = [] } = useQuery({
        queryKey: ['expensesList'],
        queryFn: () => expensesService.getExpenses()
    });

    const { data: dbBudgets = [] } = useQuery({
        queryKey: ['budgetsList'],
        queryFn: () => expensesService.getBudgets()
    });

    const { data: dbClaims = [] } = useQuery({
        queryKey: ['claimsList'],
        queryFn: () => expensesService.getClaims()
    });

    const { data: dbRecurrings = [] } = useQuery({
        queryKey: ['recurringsList'],
        queryFn: () => expensesService.getRecurrings()
    });

    const { data: dbEmployees = [] } = useQuery({
        queryKey: ['employeesList'],
        queryFn: () => staffingService.getEmployees()
    });

    // Mutations
    const createExpenseMutation = useMutation({
        mutationFn: (data) => expensesService.createExpense(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            setIsExpenseModalOpen(false);
            alert('Operational Business Expense successfully tracked and allocated!');
        }
    });

    const createBudgetMutation = useMutation({
        mutationFn: (data) => expensesService.createBudget(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            setIsBudgetModalOpen(false);
            alert('New Departmental Budget target successfully allocated!');
        }
    });

    const updateBudgetMutation = useMutation({
        mutationFn: ({ id, data }) => expensesService.updateBudget(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            setIsBudgetModalOpen(false);
            setEditingBudget(null);
            alert('Budget limit updated successfully!');
        }
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: (id) => expensesService.deleteBudget(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            alert('Budget target deleted successfully!');
        }
    });

    const recordDepartmentSpendingMutation = useMutation({
        mutationFn: async ({ budgetUpdate, expenseData }) => {
            if (budgetUpdate) {
                try {
                    await expensesService.updateBudget(budgetUpdate.id, budgetUpdate.data);
                } catch (bErr) {
                    console.warn('[Department Spend] Budget member sync warning:', bErr);
                }
            }
            return await expensesService.createExpense(expenseData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            if (recordSpendingForm.file_preview_url) {
                URL.revokeObjectURL(recordSpendingForm.file_preview_url);
            }
            setIsRecordSpendingModalOpen(false);
            setSelectedBudgetForSpend(null);
            setSpendingAmountError('');
            setRecordSpendingForm({
                category_name: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                payment_mode: 'UPI',
                employee_id: '',
                employee_name: '',
                file_name: '',
                file_type: '',
                file_data: '',
                file_preview_url: ''
            });
            alert('Department spending successfully recorded and allocated!');
        },
        onError: (err) => {
            console.error('[Department Spend Error]:', err);
            alert(err?.response?.data?.message || err?.message || 'Failed to record department spending. Please check the entered details.');
        }
    });

    const lodgeClaimMutation = useMutation({
        mutationFn: (data) => expensesService.lodgeClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            if (newClaim.file_preview_url) {
                URL.revokeObjectURL(newClaim.file_preview_url);
            }
            setClaimAmountError('');
            setNewClaim({
                employee_name: '',
                travel_expense: '',
                claim_amount: '',
                receipt: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                file_name: '',
                file_type: '',
                file_data: '',
                file_preview_url: ''
            });
            setIsClaimModalOpen(false);
            alert('Reimbursement claim submitted successfully.');
        },
        onError: (err) => {
            console.error('Lodge claim error:', err);
            alert(`Failed to submit reimbursement claim: ${err.message || JSON.stringify(err)}`);
        }
    });

    const approveClaimMutation = useMutation({
        mutationFn: (id) => expensesService.approveClaim(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            alert('Claim approved successfully!');
        }
    });

    const rejectClaimMutation = useMutation({
        mutationFn: ({ id, reason }) => expensesService.rejectClaim(id, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            alert('Claim rejected successfully!');
        }
    });

    const payClaimMutation = useMutation({
        mutationFn: ({ id, data }) => expensesService.payClaim(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            setIsPaymentModalOpen(false);
            alert('Claim marked as Paid and reimbursed successfully!');
        }
    });

    const deleteClaimMutation = useMutation({
        mutationFn: (id) => expensesService.deleteClaim(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            alert('Claim deleted successfully!');
        },
        onError: (err) => {
            console.error('Delete claim error:', err);
            alert(`Failed to delete claim: ${err.message || 'Error occurred'}`);
        }
    });

    const createRecurringMutation = useMutation({
        mutationFn: (data) => expensesService.createRecurring(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurringsList'] });
            setIsRecurringModalOpen(false);
            alert('Recurring subscription automation successfully created!');
        }
    });

    const updateRecurringMutation = useMutation({
        mutationFn: ({ id, data }) => expensesService.updateRecurring(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurringsList'] });
            setIsRecurringModalOpen(false);
            setEditingRecurring(null);
            alert('Recurring subscription automation successfully updated!');
        }
    });

    const deleteRecurringMutation = useMutation({
        mutationFn: (id) => expensesService.deleteRecurring(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurringsList'] });
            alert('Recurring subscription automation successfully deleted!');
        }
    });

    // fallbacks mapping with data sanitization
    const expenses = dbExpenses.map(item => {
        const rawAmt = parseFloat(item.expense_amount !== undefined && item.expense_amount !== null && item.expense_amount !== '' ? item.expense_amount : item.amount) || 0;
        const safeAmt = (rawAmt > 0 && rawAmt < 1e11) ? rawAmt : (rawAmt >= 1e11 ? 0 : rawAmt);
        
        const rawSub = parseFloat(item.subtotal);
        const rawTax = parseFloat(item.tax_amount);
        const safeSub = (!isNaN(rawSub) && rawSub < 1e11) ? rawSub : safeAmt;
        const safeTax = (!isNaN(rawTax) && rawTax < 1e11) ? rawTax : 0;
        
        let itc = item.input_tax_credit || 'Not Applicable';
        const catLower = (item.category_name || '').trim().toLowerCase();
        // Historic fix: Rent without explicit business GSTIN should not claim ITC
        if (catLower === 'rent' && itc.includes('Eligible')) {
            itc = 'Ineligible (Blocked Sec 17(5))';
        }

        return {
            expense_id: item.id,
            expense_number: item.expense_number || `EXP-2026-${item.id}`,
            expense_date: item.expense_date || (item.created_at || '').split('T')[0] || '2026-05-08',
            expense_status: item.expense_status || 'paid',
            category_name: item.category_name || 'General',
            subcategory: item.subcategory || 'Miscellaneous',
            payee_name: item.payee_name || '-',
            payee_phone: item.payee_phone || '',
            payee_gstin: item.payee_gstin || '',
            expense_amount: safeAmt,
            gst_percentage: parseFloat(item.gst_percentage) || 0,
            subtotal: safeSub,
            tax_amount: safeTax,
            payment_mode: item.payment_mode || 'N/A',
            transaction_reference: item.transaction_reference || '-',
            input_tax_credit: itc,
            proof_file_path: item.proof_file_path || '',
            proof_file_name: item.proof_file_name || '',
            receipt: item.receipt || ''
        };
    });

    // Month options for Department Budgets
    const monthOptions = [
        'January 2026', 'February 2026', 'March 2026', 'April 2026',
        'May 2026', 'June 2026', 'July 2026', 'August 2026',
        'September 2026', 'October 2026', 'November 2026', 'December 2026',
        'January 2027', 'February 2027', 'March 2027', 'April 2027'
    ];

    const formatMonthKey = (dateStr) => {
        if (!dateStr) return '';
        const trimmed = String(dateStr).trim();
        if (/^[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
            return trimmed;
        }
        const d = new Date(trimmed);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    const getPreviousMonthKey = (monthStr) => {
        if (!monthStr) return null;
        const parts = monthStr.trim().split(' ');
        if (parts.length !== 2) return null;
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const idx = monthNames.indexOf(parts[0]);
        if (idx === -1) return null;
        const year = parseInt(parts[1], 10);
        if (idx === 0) {
            return `December ${year - 1}`;
        }
        return `${monthNames[idx - 1]} ${year}`;
    };

    const currentMonthStr = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const budgets = dbBudgets.map(item => {
        const budgetMonth = item.budget_month || currentMonthStr;
        const baseLimit = parseFloat(item.budget_limit) || 0;
        const carryForwardEnabled = item.carry_forward !== undefined ? (item.carry_forward === true || item.carry_forward === 'true') : true;

        // Calculate actual spent strictly in this budget's month for this category
        const spent = expenses
            .filter(e => {
                const matchesCat = (e.category_name || '').trim().toLowerCase() === (item.category_name || '').trim().toLowerCase();
                const expMonth = formatMonthKey(e.expense_date);
                return matchesCat && expMonth === budgetMonth;
            })
            .reduce((sum, e) => sum + e.expense_amount, 0);

        // Calculate surplus carried forward from the previous month if enabled
        let carriedForward = 0;
        if (carryForwardEnabled) {
            const prevMonth = getPreviousMonthKey(budgetMonth);
            if (prevMonth) {
                const prevBudget = dbBudgets.find(b => 
                    (b.category_name || '').trim().toLowerCase() === (item.category_name || '').trim().toLowerCase() &&
                    (b.budget_month || currentMonthStr) === prevMonth
                );
                if (prevBudget) {
                    const prevLimit = parseFloat(prevBudget.budget_limit) || 0;
                    const prevSpent = expenses
                        .filter(e => {
                            const matchesCat = (e.category_name || '').trim().toLowerCase() === (prevBudget.category_name || '').trim().toLowerCase();
                            const expMonth = formatMonthKey(e.expense_date);
                            return matchesCat && expMonth === prevMonth;
                        })
                        .reduce((sum, e) => sum + e.expense_amount, 0);
                    
                    // If previous month spent was less than limit, carry forward the unused surplus
                    if (prevSpent < prevLimit) {
                        carriedForward = prevLimit - prevSpent;
                    }
                }
            }
        }

        const effectiveLimit = baseLimit + carriedForward;
        const remaining = effectiveLimit - spent;
        const isExceeded = spent > effectiveLimit;
        const isOverWarning = spent >= effectiveLimit * 0.8 && spent <= effectiveLimit;

        let alertStatus = 'Optimal';
        if (isExceeded) alertStatus = 'Exceeded';
        else if (isOverWarning) alertStatus = 'Warning';

        return {
            id: item.id,
            category_name: item.category_name || 'Uncategorized',
            budget_limit: baseLimit,
            budget_month: budgetMonth,
            carry_forward: carryForwardEnabled,
            carried_forward: carriedForward,
            effective_limit: effectiveLimit,
            spent_amount: spent,
            remaining_amount: remaining,
            is_exceeded: isExceeded,
            is_over_warning: isOverWarning,
            team_members: item.team_members || '[]',
            alert_status: alertStatus
        };
    });

    // Merge default categories with custom categories created under budgets & existing expenses
    const defaultCategories = ['Rent', 'Electricity', 'Internet', 'Salary', 'Fuel', 'General', 'Staff Welfare & Reimbursement', 'Inventory Purchases'];
    const budgetCategories = budgets.map(b => b.category_name).filter(name => name !== 'Uncategorized');
    const expenseCategories = expenses.map(e => e.category_name).filter(Boolean);
    const categoryOptions = Array.from(new Set([...defaultCategories, ...budgetCategories, ...expenseCategories]));

    const claims = dbClaims.map(item => {
        const datePart = (item.date || (item.created_at || '').split('T')[0] || '').replace(/-/g, '');
        const displayId = datePart ? `CLM-${datePart}-${String(item.id).padStart(4, '0')}` : `CLM-${item.id}`;
        return {
            claim_id: item.id,
            display_claim_id: displayId,
            employee_name: item.employee_name || 'Anonymous Staff',
            travel_expense: item.travel_expense || '-',
            claim_amount: parseFloat(item.claim_amount) || 0,
            reimbursement_status: item.reimbursement_status || 'Pending Approval',
            approval_by: item.approval_by || '',
            receipt: item.receipt || '',
            proof_file_path: item.proof_file_path || '',
            proof_file_name: item.proof_file_name || '',
            proof_file_type: item.proof_file_type || '',
            proof_timestamp: item.proof_timestamp || '',
            date: item.date || (item.created_at ? item.created_at.split('T')[0] : '-')
        };
    });

    const [claimSearchTerm, setClaimSearchTerm] = useState('');
    const [claimStatusFilter, setClaimStatusFilter] = useState('All');

    const filteredClaims = claims.filter(cl => {
        const s = (cl.reimbursement_status || '').toLowerCase().trim();
        if (claimStatusFilter === 'Pending' && !s.includes('pending')) return false;
        if (claimStatusFilter === 'Approved' && !(s === 'approved' || (s.includes('approved') && !s.includes('pending')))) return false;
        if (claimStatusFilter === 'Paid' && !s.includes('paid')) return false;
        if (claimStatusFilter === 'Rejected' && !s.includes('rejected')) return false;

        if (claimSearchTerm.trim()) {
            const q = claimSearchTerm.toLowerCase().trim();
            const matchesId = (cl.display_claim_id || '').toLowerCase().includes(q);
            const matchesEmp = (cl.employee_name || '').toLowerCase().includes(q);
            const matchesPurpose = (cl.travel_expense || '').toLowerCase().includes(q);
            const matchesAmount = String(cl.claim_amount).includes(q);
            const matchesDate = (cl.date || '').toLowerCase().includes(q);
            return matchesId || matchesEmp || matchesPurpose || matchesAmount || matchesDate;
        }
        return true;
    });

    const recurrings = dbRecurrings.map(item => ({
        id: item.id,
        subscription_name: item.subscription_name || 'N/A',
        payee_name: item.payee_name || '-',
        category_name: item.category_name || 'General',
        recurring_type: item.recurring_type || 'Monthly',
        next_due_date: item.next_due_date || '-',
        auto_create: item.auto_create || 'Active',
        recurring_status: item.recurring_status || 'Active',
        amount: parseFloat(item.expense_amount) || parseFloat(item.amount) || 0
    }));

    // Form states
    const [newExpense, setNewExpense] = useState({
        category_name: 'Rent',
        subcategory: '',
        payee_name: '',
        amount_type: 'exclusive', // 'exclusive' (Base + GST added) or 'inclusive' (GST included in total)
        expense_amount: '',
        gst_percentage: 0,
        itc_eligibility: 'ineligible', // 'eligible' or 'ineligible'
        payment_mode: 'UPI',
        transaction_reference: ''
    });

    const [selectedBudgetMonthFilter, setSelectedBudgetMonthFilter] = useState('All');

    const [newBudget, setNewBudget] = useState({
        category_name: '',
        budget_limit: '',
        budget_month: currentMonthStr,
        carry_forward: true,
        spent_amount: 0
    });

    const [newBudgetMembers, setNewBudgetMembers] = useState([]);
    const [viewingTeamDetails, setViewingTeamDetails] = useState(null);
    const [selectedBudgetForSpend, setSelectedBudgetForSpend] = useState(null);
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);
    const [memberInputMode, setMemberInputMode] = useState('db'); // 'db' or 'manual'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [manualEmpId, setManualEmpId] = useState('');
    const [manualEmpName, setManualEmpName] = useState('');
    const [manualEmpSalary, setManualEmpSalary] = useState('');

    const [newClaim, setNewClaim] = useState({
        employee_name: '',
        travel_expense: '',
        claim_amount: '',
        receipt: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        file_name: '',
        file_type: '',
        file_data: '',
        file_preview_url: ''
    });

    const [newRecurring, setNewRecurring] = useState({
        subscription_name: '',
        payee_name: '',
        category_name: 'Rent',
        expense_amount: '',
        recurring_type: 'Monthly',
        next_due_date: new Date().toISOString().split('T')[0],
        auto_create: 'Active',
        recurring_status: 'Active'
    });

    const [recurringAmountError, setRecurringAmountError] = useState('');

    // Block decimal point '.', negative signs '-', '+', and 'e' at keystroke level
    const handleRecurringKeyDown = (e) => {
        if (e.key === '.' || e.key === 'Decimal' || e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    };

    // Validate amount to allow only whole positive integers (no floats / decimals)
    const handleRecurringAmountChange = (e) => {
        const val = e.target.value;

        if (val === '') {
            setNewRecurring(prev => ({ ...prev, expense_amount: '', amount: '' }));
            setRecurringAmountError('');
            return;
        }

        // Check if user pasted a decimal value or <= 0
        if (val.includes('.')) {
            setNewRecurring(prev => ({ ...prev, expense_amount: val, amount: val }));
            setRecurringAmountError('Decimal / float amounts are not allowed. Please enter a whole amount.');
            return;
        }

        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) {
            setNewRecurring(prev => ({ ...prev, expense_amount: val, amount: val }));
            setRecurringAmountError('Amount must be a whole number of at least ₹1.');
        } else {
            setNewRecurring(prev => ({ ...prev, expense_amount: String(num), amount: num }));
            setRecurringAmountError('');
        }
    };

    const handleCreateExpense = (e) => {
        e.preventDefault();
        const rawAmt = parseFloat(newExpense.expense_amount) || 0;
        if (rawAmt <= 0) {
            alert('Please enter a valid expense amount greater than 0');
            return;
        }
        const gst = parseFloat(newExpense.gst_percentage) || 0;
        
        let subtotal = rawAmt;
        let tax = 0;
        let total = rawAmt;

        if (gst > 0) {
            if (newExpense.amount_type === 'inclusive') {
                total = rawAmt;
                subtotal = Math.round((rawAmt / (1 + gst / 100)) * 100) / 100;
                tax = Math.round((total - subtotal) * 100) / 100;
            } else {
                // exclusive (Base + GST added)
                subtotal = rawAmt;
                tax = Math.round((rawAmt * (gst / 100)) * 100) / 100;
                total = Math.round((subtotal + tax) * 100) / 100;
            }
        }

        let itcStatus = 'Not Applicable';
        if (gst > 0) {
            itcStatus = newExpense.itc_eligibility === 'eligible'
                ? 'Eligible (ITC Claimed)'
                : 'Ineligible (Blocked Sec 17(5))';
        }

        const payload = {
            ...newExpense,
            amount: total,
            expense_amount: total,
            subtotal: subtotal,
            tax_amount: tax,
            gst_percentage: gst,
            input_tax_credit: itcStatus
        };

        createExpenseMutation.mutate(payload);
    };

    const handleSaveSpending = (e) => {
        e.preventDefault();
        const rawAmt = String(recordSpendingForm.amount || '');

        if (rawAmt.includes('.')) {
            setSpendingAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
            return;
        }

        const spentAmt = parseInt(rawAmt, 10);
        if (isNaN(spentAmt) || spentAmt < 1) {
            setSpendingAmountError('Please provide a valid whole amount of at least ₹1.');
            return;
        }

        let budgetUpdate = null;
        if (selectedBudgetForSpend) {
            let parsedMembers = [];
            try {
                parsedMembers = typeof selectedBudgetForSpend.team_members === 'string'
                    ? JSON.parse(selectedBudgetForSpend.team_members || '[]')
                    : (selectedBudgetForSpend.team_members || []);
            } catch (err) {
                parsedMembers = [];
            }
            
            const updatedMembers = parsedMembers.map(m => {
                if (recordSpendingForm.employee_id && String(m.employee_id) === String(recordSpendingForm.employee_id)) {
                    return {
                        ...m,
                        spent: (parseFloat(m.spent) || 0) + spentAmt
                    };
                }
                return m;
            });
            
            const newSpentAmount = (parseFloat(selectedBudgetForSpend.spent_amount) || 0) + spentAmt;
            
            budgetUpdate = {
                id: selectedBudgetForSpend.id,
                data: {
                    category_name: selectedBudgetForSpend.category_name,
                    budget_limit: String(selectedBudgetForSpend.budget_limit),
                    budget_month: selectedBudgetForSpend.budget_month || currentMonthStr,
                    carry_forward: selectedBudgetForSpend.carry_forward !== false,
                    spent_amount: newSpentAmount,
                    team_members: updatedMembers
                }
            };
        }

        const expenseData = {
            category_name: recordSpendingForm.category_name,
            subcategory: recordSpendingForm.description.trim() || 'Departmental Spend',
            payee_name: recordSpendingForm.employee_name || 'Departmental Spend',
            expense_amount: String(spentAmt),
            gst_percentage: 0,
            payment_mode: recordSpendingForm.payment_mode || 'UPI',
            transaction_reference: `SPEND-${Date.now().toString().slice(-4)}`,
            expense_date: recordSpendingForm.date,
            file_data: recordSpendingForm.file_data || null,
            file_name: recordSpendingForm.file_name || null,
            file_type: recordSpendingForm.file_type || null,
            receipt: recordSpendingForm.file_name || ''
        };

        recordDepartmentSpendingMutation.mutate({ budgetUpdate, expenseData });
    };

    const handleSaveBudget = (e) => {
        e.preventDefault();
        const rawBudget = String(newBudget.budget_limit || '');
        if (rawBudget.includes('.') || rawBudget.includes('-')) {
            setBudgetError('Decimal fractions and negative budgets are not allowed.');
            return;
        }

        const budgetLimit = parseInt(rawBudget, 10);
        if (isNaN(budgetLimit) || budgetLimit < 1) {
            setBudgetError('Please provide a valid whole positive budget target of at least ₹1.');
            return;
        }

        const targetMonth = newBudget.budget_month || currentMonthStr;
        const enteredName = (newBudget.category_name || '').trim().toLowerCase();

        // Check duplicate department name for this specific month
        if (!editingBudget) {
            const exists = (dbBudgets || []).some(b => 
                (b.category_name || '').trim().toLowerCase() === enteredName &&
                (b.budget_month || currentMonthStr) === targetMonth
            );

            if (exists) {
                alert(`A department budget for "${newBudget.category_name}" already exists for ${targetMonth}. Please select a different month or edit the existing budget.`);
                return;
            }
        } else {
            const exists = (dbBudgets || []).some(b => 
                b.id !== editingBudget.id &&
                (b.category_name || '').trim().toLowerCase() === enteredName &&
                (b.budget_month || currentMonthStr) === targetMonth
            );

            if (exists) {
                alert(`A department budget for "${newBudget.category_name}" already exists for ${targetMonth}.`);
                return;
            }
        }

        const sanitizedMembers = newBudgetMembers.map(m => ({
            ...m,
            spent: Math.max(0, Math.abs(Number(m.spent) || 0))
        }));

        const budgetData = {
            ...newBudget,
            budget_limit: String(budgetLimit),
            budget_month: targetMonth,
            carry_forward: newBudget.carry_forward !== false,
            team_members: sanitizedMembers
        };
        if (editingBudget) {
            updateBudgetMutation.mutate({ id: editingBudget.id, data: budgetData });
        } else {
            createBudgetMutation.mutate(budgetData);
        }
    };

    const handleAddMember = () => {
        const empId = (memberInputMode === 'db' ? selectedEmployeeId : manualEmpId).trim();
        const empName = (memberInputMode === 'db' ? (dbEmployees.find(e => String(e.employee_id || e.id) === selectedEmployeeId)?.name || '') : manualEmpName).trim();

        if (!empId || !empName) {
            alert('Employee ID and Name are required.');
            return;
        }
        if (newBudgetMembers.some(m => m.employee_id === empId)) {
            alert('This employee is already added to the team.');
            return;
        }

        // Newly added members start with 0 spent. Their quota is calculated equally from the total department budget.
        setNewBudgetMembers([
            ...newBudgetMembers,
            {
                employee_id: empId,
                name: empName,
                spent: 0
            }
        ]);

        // Reset add member form fields
        setSelectedEmployeeId('');
        setManualEmpId('');
        setManualEmpName('');
        setShowAddMemberForm(false);
    };

    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const apiBase = config.api.baseUrl || window.location.origin;
        const hostBase = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
        return `${hostBase}${path}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Maximum file size is 10 MB.");
            e.target.value = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF are accepted.");
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result;
            const previewUrl = URL.createObjectURL(file);
            
            setNewClaim(prev => {
                if (prev.file_preview_url) {
                    URL.revokeObjectURL(prev.file_preview_url);
                }
                return {
                    ...prev,
                    file_name: file.name,
                    file_type: file.type,
                    file_data: base64Data,
                    file_preview_url: previewUrl
                };
            });
        };
        reader.readAsDataURL(file);
    };

    const [receiptSets, setReceiptSets] = useState([
        { id: 1, receipt: '', file_name: '', file_type: '', file_data: '', file_preview_url: '' }
    ]);

    const handleAddReceiptSet = () => {
        setReceiptSets(prev => [
            ...prev,
            { id: Date.now() + Math.random(), receipt: '', file_name: '', file_type: '', file_data: '', file_preview_url: '' }
        ]);
    };

    const handleRemoveReceiptSet = (index) => {
        setReceiptSets(prev => {
            if (prev.length <= 1) {
                return [{ id: Date.now(), receipt: '', file_name: '', file_type: '', file_data: '', file_preview_url: '' }];
            }
            const copy = [...prev];
            if (copy[index].file_preview_url) {
                URL.revokeObjectURL(copy[index].file_preview_url);
            }
            copy.splice(index, 1);
            return copy;
        });
    };

    const handleReceiptTextChange = (index, text) => {
        setReceiptSets(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], receipt: text };
            return copy;
        });
    };

    const handleSetFileChange = (index, file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("Maximum file size is 10 MB.");
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF are accepted.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result;
            const previewUrl = URL.createObjectURL(file);
            setReceiptSets(prev => {
                const copy = [...prev];
                if (copy[index].file_preview_url) {
                    URL.revokeObjectURL(copy[index].file_preview_url);
                }
                copy[index] = {
                    ...copy[index],
                    file_name: file.name,
                    file_type: file.type,
                    file_data: base64Data,
                    file_preview_url: previewUrl
                };
                return copy;
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSetFileRemove = (index) => {
        setReceiptSets(prev => {
            const copy = [...prev];
            if (copy[index].file_preview_url) {
                URL.revokeObjectURL(copy[index].file_preview_url);
            }
            copy[index] = {
                ...copy[index],
                file_name: '',
                file_type: '',
                file_data: '',
                file_preview_url: ''
            };
            return copy;
        });
    };

    const handleRemoveFile = () => {
        if (newClaim.file_preview_url) {
            URL.revokeObjectURL(newClaim.file_preview_url);
        }
        setNewClaim(prev => ({
            ...prev,
            file_name: '',
            file_type: '',
            file_data: '',
            file_preview_url: ''
        }));
        const fileInput = document.getElementById('claim-receipt-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const closeClaimModal = () => {
        if (newClaim.file_preview_url) {
            URL.revokeObjectURL(newClaim.file_preview_url);
        }
        receiptSets.forEach(s => {
            if (s.file_preview_url) URL.revokeObjectURL(s.file_preview_url);
        });
        setReceiptSets([{ id: Date.now(), receipt: '', file_name: '', file_type: '', file_data: '', file_preview_url: '' }]);
        setNewClaim({
            employee_name: '',
            travel_expense: '',
            claim_amount: '',
            receipt: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            file_name: '',
            file_type: '',
            file_data: '',
            file_preview_url: ''
        });
        const fileInput = document.getElementById('claim-receipt-upload');
        if (fileInput) {
            fileInput.value = '';
        }
        setClaimAmountError('');
        setIsClaimModalOpen(false);
    };

    const handleCreateClaim = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(newClaim.claim_amount);
        if (!newClaim.claim_amount || isNaN(amountNum) || amountNum <= 0) {
            setClaimAmountError('Claim amount must be greater than 0');
            return;
        }

        const cleanAmount = parseFloat(amountNum.toFixed(2));
        const allReceipts = receiptSets.map(s => (s.receipt || '').trim()).filter(Boolean);
        const attachmentRefs = receiptSets
            .map(s => (s.file_name ? s.file_name.trim() : ''))
            .filter(Boolean);
        const uniqueProofs = Array.from(new Set([...allReceipts, ...attachmentRefs]));

        const validFiles = receiptSets.filter(s => s.file_data && s.file_name).map(s => ({
            file_name: s.file_name,
            file_type: s.file_type,
            file_data: s.file_data
        }));

        const empName = (newClaim.employee_name || '').trim();
        const matchedEmp = (dbEmployees || []).find(e => 
            (e.name || '').toLowerCase() === empName.toLowerCase() ||
            `${e.first_name || ''} ${e.last_name || ''}`.trim().toLowerCase() === empName.toLowerCase()
        );
        const employeeId = matchedEmp ? (matchedEmp.id || matchedEmp.employee_id || 1) : 1;
        const employeeCode = matchedEmp ? (matchedEmp.employee_code || `CLK-00${employeeId}`) : 'CLK-001';

        const finalDesc = (newClaim.travel_expense || newClaim.description || '').trim() || 'Staff Reimbursement';
        const finalDate = newClaim.date || new Date().toISOString().split('T')[0];
        const finalTime = newClaim.time || new Date().toTimeString().slice(0, 5);

        const claimPayload = {
            ...newClaim,
            amount: cleanAmount,
            claim_amount: cleanAmount,
            employeeId: employeeId,
            employee_id: employeeId,
            employee_name: empName,
            employee_code: employeeCode,
            date: finalDate,
            time: finalTime,
            description: finalDesc,
            travel_expense: finalDesc,
            proofs: uniqueProofs,
            attachments: uniqueProofs,
            receipt: allReceipts.join(', ') || (uniqueProofs[0] || ''),
            receipts: allReceipts,
            files: validFiles,
            file_data: validFiles[0]?.file_data || '',
            file_name: validFiles[0]?.file_name || ''
        };
        lodgeClaimMutation.mutate(claimPayload);
    };

    const handleSaveRecurring = (e) => {
        e.preventDefault();
        const amtStr = String(newRecurring.expense_amount || newRecurring.amount || '');

        if (amtStr.includes('.')) {
            setRecurringAmountError('Decimal / float amounts are not allowed.');
            return;
        }

        const intAmount = parseInt(amtStr, 10);
        if (isNaN(intAmount) || intAmount < 1) {
            setRecurringAmountError('Please enter a valid whole amount of at least ₹1.');
            return;
        }

        const payload = {
            ...newRecurring,
            expense_amount: intAmount,
            amount: intAmount
        };

        if (editingRecurring) {
            updateRecurringMutation.mutate({ id: editingRecurring.id, data: payload });
        } else {
            createRecurringMutation.mutate(payload);
        }
    };

    const filteredExpenses = expenses.filter(e => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            e.payee_name.toLowerCase().includes(term) ||
            e.category_name.toLowerCase().includes(term) ||
            (e.subcategory || '').toLowerCase().includes(term) ||
            (e.expense_number || '').toLowerCase().includes(term) ||
            (e.expense_date || '').toLowerCase().includes(term) ||
            String(e.expense_amount).includes(term) ||
            (e.payment_mode || '').toLowerCase().includes(term);
        
        const matchesCategory = categoryFilter === 'All' || e.category_name === categoryFilter;
        const matchesMode = modeFilter === 'All' || e.payment_mode === modeFilter;

        // Per-column filters
        const cf = columnFilters;
        const matchVoucher = !cf.voucher || (e.expense_number || '').toLowerCase().includes(cf.voucher.toLowerCase());
        const matchDate = !cf.date || (e.expense_date || '').toLowerCase().includes(cf.date.toLowerCase());
        const matchCat = !cf.category || (e.category_name + ' ' + (e.subcategory || '')).toLowerCase().includes(cf.category.toLowerCase());
        const matchPayee = !cf.payee || (e.payee_name || '').toLowerCase().includes(cf.payee.toLowerCase());
        const matchSubtotal = !cf.subtotal || String(e.subtotal).includes(cf.subtotal);
        const matchItc = !cf.itc || String(Math.round(e.tax_amount)).includes(cf.itc) || (e.input_tax_credit || '').toLowerCase().includes(cf.itc.toLowerCase());
        const matchTotal = !cf.total || String(e.expense_amount).includes(cf.total);
        const matchModeCol = !cf.mode || (e.payment_mode || '').toLowerCase().includes(cf.mode.toLowerCase());

        return matchesSearch && matchesCategory && matchesMode && matchVoucher && matchDate && matchCat && matchPayee && matchSubtotal && matchItc && matchTotal && matchModeCol;
    });

    const totalExpenseSpent = expenses.reduce((sum, e) => {
        const a = parseFloat(e.expense_amount) || 0;
        return sum + (a > 0 && a < 1e11 ? a : 0);
    }, 0);

    const totalITCClaimsAccumulated = expenses.reduce((sum, e) => {
        const isEligible = (e.input_tax_credit || '').toLowerCase().includes('eligible');
        const t = parseFloat(e.tax_amount) || 0;
        return sum + (isEligible && t > 0 && t < 1e11 ? t : 0);
    }, 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <TrendingUp size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Expenses & Operational Costs</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Add operational spendings, manage departmental budgets, track GST Input Tax Credit (ITC), automate recurring bills, and process staff reimbursement claims.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => {
                            setNewClaim({
                                employee_name: '',
                                travel_expense: '',
                                claim_amount: '',
                                receipt: '',
                                date: new Date().toISOString().split('T')[0],
                                time: new Date().toTimeString().slice(0, 5),
                                file_name: '',
                                file_type: '',
                                file_data: '',
                                file_preview_url: ''
                            });
                            setIsClaimModalOpen(true);
                        }}
                        className="crm-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <User size={15} /> Lodge Staff Claim
                    </button>
                    <button 
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="crm-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Stats Summary Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Operational Costs (MTD)', value: formatCurrency(totalExpenseSpent), icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'GST Input Tax Credits (ITC)', value: formatCurrency(Math.round(totalITCClaimsAccumulated)), icon: Percent, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Active Monthly Recurrings', value: `${recurrings.length} Automation`, icon: Calendar, color: '#8B5CF6', bg: '#F5F3FF' }
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

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'registry', label: 'Expenses Registry & ITC', icon: Tag, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'recurring', label: 'Recurring Subscriptions', icon: Calendar, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'budget', label: 'Department Budgets & Limits', icon: BarChart3, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'claims', label: 'Staff Reimbursements', icon: User, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="crm-btn-secondary"
                        style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', 
                            background: activeTab === tab.id ? tab.gradient : 'white', 
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeTab === tab.id ? '0 4px 8px rgba(255, 160, 122, 0.1)' : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Expense Registry */}
            {activeTab === 'registry' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', overflow: 'visible' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search any column (date, payee, amount)..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                            >
                                <option value="All">All Categories</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select 
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                            >
                                <option value="All">All Modes</option>
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'visible', overflowY: 'visible', padding: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                {(() => {
                                    const cols = [
                                        { key: 'voucher',   label: 'Voucher No',          placeholder: 'e.g. EXP-001' },
                                        { key: 'date',      label: 'Date',                placeholder: 'e.g. 2026-05' },
                                        { key: 'category',  label: 'Category Description',placeholder: 'e.g. Rent' },
                                        { key: 'payee',     label: 'Payee / Merchant',    placeholder: 'e.g. Vendor' },
                                        { key: 'subtotal',  label: 'GST Subtotal',        placeholder: 'e.g. 5000' },
                                        { key: 'itc',       label: 'ITC Tax Claim',       placeholder: 'e.g. 900' },
                                        { key: 'total',     label: 'Total Paid',          placeholder: 'e.g. 10000' },
                                        { key: 'mode',      label: 'Mode',                placeholder: 'e.g. UPI' },
                                    ];
                                    const hasAnyOpen = cols.some(c => openFilterCols[c.key]);
                                    return (
                                        <>
                                            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                {cols.map(col => {
                                                    const isOpen = !!openFilterCols[col.key];
                                                    const hasValue = !!columnFilters[col.key];
                                                    return (
                                                        <th key={col.key} style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <span>{col.label}</span>
                                                                <button
                                                                    onClick={() => toggleColFilter(col.key)}
                                                                    title={`Filter by ${col.label}`}
                                                                    style={{
                                                                        background: isOpen || hasValue ? '#EDE9FE' : 'transparent',
                                                                        border: '1px solid ' + (isOpen || hasValue ? '#7C3AED' : '#E2E8F0'),
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer',
                                                                        padding: '2px 4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        color: isOpen || hasValue ? '#7C3AED' : '#CBD5E1',
                                                                        transition: 'all 0.15s',
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    <Filter size={10} />
                                                                    <ChevronDown size={9} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                                                                </button>
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                            {hasAnyOpen && (
                                                <tr style={{ borderBottom: '2px solid #7C3AED22', background: '#FAFAFA' }}>
                                                    {cols.map(col => (
                                                        <th key={col.key} style={{ padding: '0.25rem 0.5rem' }}>
                                                            {openFilterCols[col.key] ? (
                                                                <div style={{ position: 'relative' }}>
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        placeholder={col.placeholder}
                                                                        value={columnFilters[col.key]}
                                                                        onChange={(e) => updateColumnFilter(col.key, e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.3rem 1.4rem 0.3rem 0.5rem',
                                                                            borderRadius: '6px',
                                                                            border: '1.5px solid #7C3AED',
                                                                            outline: 'none',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: '600',
                                                                            color: '#1E293B',
                                                                            background: 'white',
                                                                            boxSizing: 'border-box',
                                                                            boxShadow: '0 0 0 3px rgba(124,58,237,0.08)',
                                                                        }}
                                                                    />
                                                                    {columnFilters[col.key] && (
                                                                        <button
                                                                            onClick={() => updateColumnFilter(col.key, '')}
                                                                            style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </th>
                                                    ))}
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </thead>
                            <tbody>
                                {filteredExpenses.map((ex) => (
                                    <tr key={ex.expense_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '800', color: '#7C3AED', fontSize: '0.85rem', margin: 0 }}>{ex.expense_number}</p>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>{ex.expense_date}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem', margin: 0 }}>{ex.category_name}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>{ex.subcategory}</span>
                                            {ex.proof_file_path && (
                                                <a 
                                                    href={getFileUrl(ex.proof_file_path)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#7C3AED', fontWeight: '750', fontSize: '0.7rem', textDecoration: 'none', marginTop: '2px' }}
                                                >
                                                    📎 View Attached Bill
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{ex.payee_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{formatCurrency(ex.subtotal)}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                                            {(() => {
                                                const isEligible = (ex.input_tax_credit || '').toLowerCase().includes('eligible');
                                                const isIneligible = (ex.input_tax_credit || '').toLowerCase().includes('ineligible') || (ex.input_tax_credit || '').toLowerCase().includes('blocked');
                                                const taxAmt = Math.round(ex.tax_amount || 0);

                                                if (isEligible && taxAmt > 0) {
                                                    return (
                                                        <div>
                                                            <span style={{ color: '#10B981', fontWeight: '800' }}>
                                                                {formatCurrency(taxAmt)} ({ex.gst_percentage}%)
                                                            </span>
                                                            <span style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.68rem', fontWeight: '800', background: '#ECFDF5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                                ✓ Eligible ITC
                                                            </span>
                                                        </div>
                                                    );
                                                } else if (isIneligible || (ex.gst_percentage > 0 && !isEligible)) {
                                                    return (
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <span style={{ color: '#475569', fontWeight: '800' }}>{currency.symbol}0</span>
                                                                <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#FEE2E2', color: '#B91C1C', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                                                    Blocked Sec 17(5)
                                                                </span>
                                                            </div>
                                                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                                                                Paid GST: {formatCurrency(taxAmt)} ({ex.gst_percentage}%)
                                                            </span>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <span style={{ color: '#94A3B8', fontWeight: '600' }}>
                                                            {currency.symbol}0 (0% Excluded)
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(ex.expense_amount)}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>{ex.payment_mode}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Recurrings automatic entries */}
            {activeTab === 'recurring' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Active Recurring bills & Subscriptions</h3>
                        <button onClick={() => {
                            setEditingRecurring(null);
                            setNewRecurring({
                                subscription_name: '',
                                payee_name: '',
                                category_name: 'Rent',
                                expense_amount: '',
                                recurring_type: 'Monthly',
                                next_due_date: new Date().toISOString().split('T')[0],
                                auto_create: 'Active',
                                recurring_status: 'Active'
                            });
                            setRecurringAmountError('');
                            setIsRecurringModalOpen(true);
                        }} className="crm-btn" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#3B82F6', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Subscription</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>ID / Name</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Vendor</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Category Name</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Frequency</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Next Due Date</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Auto-Post</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Recurring Cost</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurrings.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '750', fontSize: '0.82rem', margin: 0 }}>REC-{rec.id}</p>
                                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{rec.subscription_name}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>{rec.payee_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.8rem', color: '#1E293B' }}>{rec.category_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', textTransform: 'capitalize', fontSize: '0.8rem', color: '#475569' }}>{rec.recurring_type}</td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#BE185D', fontWeight: '700', fontSize: '0.8rem' }}>{rec.next_due_date}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: rec.recurring_status === 'Active' ? '#E6F4EA' : '#FCE8E6', color: rec.recurring_status === 'Active' ? '#137333' : '#C5221F', fontWeight: '800', fontSize: '0.72rem' }}>
                                                {rec.recurring_status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: rec.auto_create === 'Active' ? '#E8F0FE' : '#F1F5F9', color: rec.auto_create === 'Active' ? '#1A73E8' : '#475569', fontWeight: '800', fontSize: '0.72rem' }}>
                                                {rec.auto_create.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.85rem' }}>{formatCurrency(rec.amount)}</td>
                                        <td style={{ padding: '0.6rem 1rem', display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => {
                                                    const newStatus = rec.recurring_status === 'Active' ? 'Paused' : 'Active';
                                                    updateRecurringMutation.mutate({
                                                        id: rec.id,
                                                        data: { ...rec, expense_amount: rec.amount, recurring_status: newStatus }
                                                    });
                                                }}
                                                style={{ border: 'none', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#475569' }}
                                            >
                                                {rec.recurring_status === 'Active' ? 'Pause' : 'Resume'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingRecurring(rec);
                                                    setNewRecurring({
                                                        subscription_name: rec.subscription_name,
                                                        payee_name: rec.payee_name,
                                                        category_name: rec.category_name,
                                                        expense_amount: rec.amount,
                                                        recurring_type: rec.recurring_type,
                                                        next_due_date: rec.next_due_date,
                                                        auto_create: rec.auto_create,
                                                        recurring_status: rec.recurring_status
                                                    });
                                                    setRecurringAmountError('');
                                                    setIsRecurringModalOpen(true);
                                                }}
                                                style={{ border: 'none', background: '#E0F2FE', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#0369A1' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this subscription?")) {
                                                        deleteRecurringMutation.mutate(rec.id);
                                                    }
                                                }}
                                                style={{ border: 'none', background: '#FCE8E6', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#C5221F' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Department Budgets */}
            {activeTab === 'budget' && (() => {
                const filteredBudgets = budgets.filter(bg => {
                    if (selectedBudgetMonthFilter === 'All') return true;
                    return bg.budget_month === selectedBudgetMonthFilter;
                });

                return (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Departmental Budgets & Spending Limits</h3>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>Track monthly department allocations, team quotas, and auto-carry forward unused balances.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Month:</span>
                                    <select
                                        value={selectedBudgetMonthFilter}
                                        onChange={(e) => setSelectedBudgetMonthFilter(e.target.value)}
                                        style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '700', background: 'white', color: '#0F172A', outline: 'none' }}
                                    >
                                        <option value="All">All Months</option>
                                        {monthOptions.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={() => {
                                    setEditingBudget(null);
                                    setNewBudget({ 
                                        category_name: '', 
                                        budget_limit: '', 
                                        budget_month: selectedBudgetMonthFilter !== 'All' ? selectedBudgetMonthFilter : currentMonthStr,
                                        carry_forward: true,
                                        spent_amount: 0 
                                    });
                                    setNewBudgetMembers([]);
                                    setShowAddMemberForm(false);
                                    setBudgetError('');
                                    setIsBudgetModalOpen(true);
                                }} className="crm-btn" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#BE185D', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    + Set Budget Limit
                                </button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Category Group</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Budget Month</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Monthly Budget</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Carried Forward</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Effective Limit</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Actual Spent</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Remaining Balance</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBudgets.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                                                No department budgets found for this month filter. Click "+ Set Budget Limit" to add one.
                                            </td>
                                        </tr>
                                    ) : filteredBudgets.map((bg) => {
                                        const isExceeded = bg.is_exceeded;
                                        const isOverWarning = bg.is_over_warning;
                                        const remaining = bg.remaining_amount;

                                        return (
                                            <tr key={bg.id || `${bg.category_name}-${bg.budget_month}`} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td 
                                                    style={{ padding: '0.6rem 0.8rem', fontWeight: '800', fontSize: '0.85rem', color: '#7C3AED', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => setViewingTeamDetails(bg)}
                                                    title="Click to view team member quotas and allocations"
                                                >
                                                    {bg.category_name}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '750', color: '#334155', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                                        {bg.budget_month}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontWeight: '700', fontSize: '0.85rem' }}>{formatCurrency(bg.budget_limit)}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}>
                                                    {bg.carried_forward > 0 ? (
                                                        <span style={{ color: '#059669', fontWeight: '800', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                                                            +{formatCurrency(bg.carried_forward)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94A3B8', fontWeight: '600' }}>₹0</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontWeight: '800', fontSize: '0.85rem', color: '#0F172A' }}>
                                                    {formatCurrency(bg.effective_limit)}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontWeight: '800', color: isExceeded ? '#EF4444' : (isOverWarning ? '#F59E0B' : '#7C3AED'), fontSize: '0.85rem' }}>
                                                    {formatCurrency(bg.spent_amount)}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontWeight: '800', color: remaining >= 0 ? '#10B981' : '#EF4444', fontSize: '0.85rem' }}>
                                                    {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <span style={{ 
                                                        padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                        background: isExceeded ? '#FCE8E6' : (isOverWarning ? '#FEF3C7' : '#E6F4EA'),
                                                        color: isExceeded ? '#C5221F' : (isOverWarning ? '#B45309' : '#137333'),
                                                        fontWeight: '800', fontSize: '0.7rem',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {isExceeded ? `EXCEEDED (-${formatCurrency(Math.abs(remaining))})` : (isOverWarning ? 'WARNING OVER LIMIT' : 'OPTIMAL')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button 
                                                        onClick={() => {
                                                             setRecordSpendingForm({
                                                                 category_name: bg.category_name,
                                                                 amount: '',
                                                                 description: '',
                                                                 date: new Date().toISOString().split('T')[0],
                                                                 payment_mode: 'UPI',
                                                                 employee_id: '',
                                                                 employee_name: '',
                                                                 file_name: '',
                                                                 file_type: '',
                                                                 file_data: '',
                                                                 file_preview_url: ''
                                                             });
                                                             setSelectedBudgetForSpend(bg);
                                                             setIsRecordSpendingModalOpen(true);
                                                        }}
                                                        style={{ 
                                                            border: 'none', 
                                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                                                            padding: '5px 11px', 
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer', 
                                                            fontSize: '0.74rem', 
                                                            fontWeight: '800', 
                                                            color: 'white', 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px', 
                                                            whiteSpace: 'nowrap',
                                                            boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)' 
                                                        }}
                                                        title="Record an expense for this department"
                                                    >
                                                        <Plus size={12} strokeWidth={3} /> Record Expense
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingBudget(bg);
                                                            setNewBudget({
                                                                category_name: bg.category_name,
                                                                budget_limit: String(bg.budget_limit),
                                                                budget_month: bg.budget_month || currentMonthStr,
                                                                carry_forward: bg.carry_forward !== false,
                                                                spent_amount: bg.spent_amount
                                                            });
                                                            let members = [];
                                                            try {
                                                                members = typeof bg.team_members === 'string' ? JSON.parse(bg.team_members) : (bg.team_members || []);
                                                            } catch (e) {
                                                                members = [];
                                                            }
                                                            setNewBudgetMembers(members);
                                                            setShowAddMemberForm(false);
                                                            setBudgetError('');
                                                            setIsBudgetModalOpen(true);
                                                        }}
                                                        style={{ border: '1px solid #BAE6FD', background: '#F0F9FF', padding: '5px 9px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: '750', color: '#0369A1' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete the budget for ${bg.category_name} (${bg.budget_month})?`)) {
                                                                deleteBudgetMutation.mutate(bg.id);
                                                            }
                                                        }}
                                                        style={{ border: '1px solid #FECDD3', background: '#FFF1F2', padding: '5px 9px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: '750', color: '#BE123C' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {/* Tab 4: Reimbursement claims */}
            {activeTab === 'claims' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Employee Reimbursements & Travel claims</h3>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>Review claims, approve or reject expenses, and disburse reimbursements.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', minWidth: '240px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, staff, purpose..."
                                    value={claimSearchTerm}
                                    onChange={(e) => setClaimSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.3rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Status:</span>
                                <select
                                    value={claimStatusFilter}
                                    onChange={(e) => setClaimStatusFilter(e.target.value)}
                                    style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', color: '#334155', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    <option value="All">All Claims ({claims.length})</option>
                                    <option value="Pending">Pending Approval ({claims.filter(c => (c.reimbursement_status || '').toLowerCase().includes('pending')).length})</option>
                                    <option value="Approved">Approved ({claims.filter(c => (c.reimbursement_status || '').toLowerCase().includes('approved') && !(c.reimbursement_status || '').toLowerCase().includes('pending')).length})</option>
                                    <option value="Paid">Paid ({claims.filter(c => (c.reimbursement_status || '').toLowerCase().includes('paid')).length})</option>
                                    <option value="Rejected">Rejected ({claims.filter(c => (c.reimbursement_status || '').toLowerCase().includes('rejected')).length})</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1.5px solid #F1F5F9', background: '#F8FAFC' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim ID</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Purpose Description</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Lodge Date</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Receipt Details</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Amount</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center', minWidth: '150px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.length > 0 ? (
                                    filteredClaims.map((cl) => {
                                        const s = (cl.reimbursement_status || '').toLowerCase().trim();
                                        const isPending = !s || s.includes('pending');
                                        const isApproved = (s === 'approved' || s.includes('approved')) && !isPending;
                                        const isPaid = s === 'paid' || s.includes('paid');
                                        const isRejected = s === 'rejected' || s.includes('rejected');

                                        return (
                                            <tr key={cl.claim_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td style={{ padding: '0.8rem 1rem', fontWeight: '750', fontSize: '0.85rem' }}>{cl.display_claim_id}</td>
                                                <td style={{ padding: '0.8rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: '#1E293B' }}>{cl.employee_name}</td>
                                                <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem' }}>{cl.travel_expense}</td>
                                                <td style={{ padding: '0.8rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>{cl.date}</td>
                                                <td style={{ padding: '0.8rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                        <span>{cl.receipt || (!cl.proof_file_path && 'No receipt attached')}</span>
                                                        {cl.proof_file_path && (
                                                            <a 
                                                                href={getFileUrl(cl.proof_file_path)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: '#7C3AED', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                            >
                                                                📎 View File
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.8rem 1rem' }}>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.65rem', borderRadius: '6px',
                                                        background: isApproved ? '#E8F0FE' : (isPaid ? '#E6F4EA' : (isRejected ? '#FCE8E6' : '#FEF3C7')),
                                                        color: isApproved ? '#1A73E8' : (isPaid ? '#137333' : (isRejected ? '#C5221F' : '#B45309')),
                                                        fontWeight: '800', fontSize: '0.72rem', whiteSpace: 'nowrap'
                                                    }}>
                                                        {cl.reimbursement_status ? cl.reimbursement_status.toUpperCase() : 'PENDING APPROVAL'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.8rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(cl.claim_amount)}</td>
                                                <td style={{ padding: '0.8rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'inline-flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        {isPending && (
                                                            <>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => approveClaimMutation.mutate(cl.claim_id)}
                                                                    disabled={approveClaimMutation.isPending}
                                                                    style={{ border: 'none', background: '#E6F4EA', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#137333', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                                                                    title="Approve this claim"
                                                                >
                                                                    {approveClaimMutation.isPending ? '...' : 'Approve'}
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const reason = prompt("Enter optional rejection reason:");
                                                                        if (reason !== null) {
                                                                            rejectClaimMutation.mutate({ id: cl.claim_id, reason });
                                                                        }
                                                                    }}
                                                                    disabled={rejectClaimMutation.isPending}
                                                                    style={{ border: 'none', background: '#FCE8E6', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#C5221F', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                                                                    title="Reject this claim"
                                                                >
                                                                    {rejectClaimMutation.isPending ? '...' : 'Reject'}
                                                                </button>
                                                            </>
                                                        )}
                                                        {isApproved && (
                                                            <>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setPayingClaimId(cl.claim_id);
                                                                        setPaymentDetails(prev => ({
                                                                            ...prev,
                                                                            paymentDate: new Date().toISOString().split('T')[0]
                                                                        }));
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    style={{ border: 'none', background: '#E8F0FE', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#1A73E8', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                                                                    title="Mark as Paid"
                                                                >
                                                                    Mark as Paid
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const reason = prompt("Enter optional rejection reason:");
                                                                        if (reason !== null) {
                                                                            rejectClaimMutation.mutate({ id: cl.claim_id, reason });
                                                                        }
                                                                    }}
                                                                    disabled={rejectClaimMutation.isPending}
                                                                    style={{ border: 'none', background: '#FCE8E6', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#C5221F', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                                                                    title="Reject this claim"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {isPaid && (
                                                            <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: '800', background: '#E6F4EA', padding: '4px 10px', borderRadius: '6px' }}>
                                                                ✓ Paid & Settled
                                                            </span>
                                                        )}
                                                        {isRejected && (
                                                            <>
                                                                <span style={{ fontSize: '0.75rem', color: '#C5221F', fontWeight: '800', background: '#FCE8E6', padding: '4px 10px', borderRadius: '6px' }}>
                                                                    Rejected
                                                                </span>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => approveClaimMutation.mutate(cl.claim_id)}
                                                                    disabled={approveClaimMutation.isPending}
                                                                    style={{ border: 'none', background: '#E6F4EA', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', color: '#137333' }}
                                                                    title="Re-approve this claim"
                                                                >
                                                                    Re-approve
                                                                </button>
                                                            </>
                                                        )}
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to delete claim ${cl.display_claim_id} (${cl.employee_name} - ${formatCurrency(cl.claim_amount)})?`)) {
                                                                    deleteClaimMutation.mutate(cl.claim_id);
                                                                }
                                                            }}
                                                            disabled={deleteClaimMutation.isPending}
                                                            style={{ border: '1px solid #FECDD3', background: '#FFF1F2', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '750', color: '#BE123C', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                                            title="Delete this claim"
                                                        >
                                                            <Trash size={12} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem', fontWeight: '600' }}>
                                            No reimbursement claims found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
            {/* Record Business Expense Modal */}
            {isExpenseModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#7C3AED' }}>Record Business Expense</h3>
                            <button onClick={() => setIsExpenseModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expense Category</label>
                                <select 
                                    value={newExpense.category_name} 
                                    onChange={(e) => {
                                        const cat = e.target.value;
                                        const catLower = cat.trim().toLowerCase();
                                        const isBlockedCat = catLower === 'rent' || catLower.includes('food') || catLower.includes('catering') || catLower.includes('welfare') || catLower.includes('personal');
                                        setNewExpense({ 
                                            ...newExpense, 
                                            category_name: cat,
                                            itc_eligibility: isBlockedCat ? 'ineligible' : 'eligible'
                                        });
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Subcategory / Expense Description</label>
                                <input required type="text" maxLength={100} value={newExpense.subcategory} onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Example : Office space rent" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payee / Merchant Profile</label>
                                <input required type="text" spellCheck="false" maxLength={50} value={newExpense.payee_name} onChange={(e) => setNewExpense({ ...newExpense, payee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Example : Property Landlord / AWS" />
                            </div>

                            {/* Amount & Calculation Mode */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0 }}>
                                        Expense Amount ({currency.symbol})
                                    </label>
                                    {/* Exclusive vs Inclusive Mode Switch */}
                                    <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '8px', gap: '2px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, amount_type: 'exclusive' })}
                                            style={{
                                                padding: '3px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '800',
                                                background: newExpense.amount_type === 'exclusive' ? '#7C3AED' : 'transparent',
                                                color: newExpense.amount_type === 'exclusive' ? 'white' : '#64748B'
                                            }}
                                        >
                                            + GST (Exclusive)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, amount_type: 'inclusive' })}
                                            style={{
                                                padding: '3px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '800',
                                                background: newExpense.amount_type === 'inclusive' ? '#7C3AED' : 'transparent',
                                                color: newExpense.amount_type === 'inclusive' ? 'white' : '#64748B'
                                            }}
                                        >
                                            Incl. GST (Total)
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <input 
                                            required 
                                            type="text" 
                                            maxLength={10} 
                                            value={newExpense.expense_amount} 
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
                                                setNewExpense({ ...newExpense, expense_amount: val });
                                            }} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700', fontSize: '1rem' }} 
                                            placeholder="e.g. 50000" 
                                        />
                                    </div>
                                    <div>
                                        <select 
                                            value={newExpense.gst_percentage} 
                                            onChange={(e) => setNewExpense({ ...newExpense, gst_percentage: parseInt(e.target.value) })} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                        >
                                            <option value="0">0% Excluded</option>
                                            <option value="5">5% GST</option>
                                            <option value="12">12% GST</option>
                                            <option value="18">18% GST</option>
                                            <option value="28">28% GST</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ITC Eligibility Selection if GST > 0 */}
                            {newExpense.gst_percentage > 0 && (
                                <div style={{ background: '#F8FAFC', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.4rem' }}>
                                        Input Tax Credit (ITC) Eligibility
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, itc_eligibility: 'ineligible' })}
                                            style={{
                                                flex: 1, padding: '0.5rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800',
                                                border: newExpense.itc_eligibility === 'ineligible' ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                                                background: newExpense.itc_eligibility === 'ineligible' ? '#FEF2F2' : 'white',
                                                color: newExpense.itc_eligibility === 'ineligible' ? '#B91C1C' : '#64748B'
                                            }}
                                        >
                                            ⛔ Ineligible / Blocked (Sec 17(5))
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, itc_eligibility: 'eligible' })}
                                            style={{
                                                flex: 1, padding: '0.5rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800',
                                                border: newExpense.itc_eligibility === 'eligible' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                                background: newExpense.itc_eligibility === 'eligible' ? '#ECFDF5' : 'white',
                                                color: newExpense.itc_eligibility === 'eligible' ? '#047857' : '#64748B'
                                            }}
                                        >
                                            ✓ Eligible for ITC Claim
                                        </button>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748B', lineHeight: '1.4' }}>
                                        {newExpense.itc_eligibility === 'ineligible' 
                                            ? 'GST paid to vendor is absorbed as a direct expense cost in P&L. No tax credit is claimed (Rent without GST invoice, employee food, personal expenses).'
                                            : 'Requires a valid GST Tax Invoice with your business GSTIN. You can offset this GST against output tax.'
                                        }
                                    </p>
                                    {newExpense.category_name.toLowerCase() === 'rent' && (
                                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.68rem', color: '#B45309', background: '#FEF3C7', padding: '0.3rem 0.5rem', borderRadius: '6px', fontWeight: '600' }}>
                                            💡 Rent Note: Residential rent or rent paid to unregistered landlords has NO ITC. Select "Eligible" only if renting commercial premises from a GST-registered landlord.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Live Calculation Breakdown Preview */}
                            {parseFloat(newExpense.expense_amount) > 0 && (() => {
                                const rawAmt = parseFloat(newExpense.expense_amount) || 0;
                                const gst = parseFloat(newExpense.gst_percentage) || 0;
                                let sub = rawAmt;
                                let tax = 0;
                                let tot = rawAmt;
                                if (gst > 0) {
                                    if (newExpense.amount_type === 'inclusive') {
                                        tot = rawAmt;
                                        sub = Math.round((rawAmt / (1 + gst / 100)) * 100) / 100;
                                        tax = Math.round((tot - sub) * 100) / 100;
                                    } else {
                                        sub = rawAmt;
                                        tax = Math.round((rawAmt * (gst / 100)) * 100) / 100;
                                        tot = Math.round((sub + tax) * 100) / 100;
                                    }
                                }
                                const isEligible = gst > 0 && newExpense.itc_eligibility === 'eligible';
                                return (
                                    <div style={{ background: '#FAF5FF', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', fontWeight: '850', color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            Calculation Breakdown
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#4B5563', marginBottom: '0.2rem' }}>
                                            <span>Base Subtotal (Expense):</span>
                                            <span style={{ fontWeight: '750' }}>{formatCurrency(sub)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#4B5563', marginBottom: '0.2rem' }}>
                                            <span>GST ({gst}%):</span>
                                            <span style={{ fontWeight: '750' }}>+{formatCurrency(tax)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0F172A', fontWeight: '900', borderTop: '1px solid #E9D5FF', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
                                            <span>Total Amount Payable:</span>
                                            <span style={{ color: '#7C3AED' }}>{formatCurrency(tot)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px dashed #E9D5FF' }}>
                                            <span style={{ fontWeight: '700', color: '#64748B' }}>ITC Claimable:</span>
                                            <span style={{ fontWeight: '800', color: isEligible ? '#059669' : '#DC2626' }}>
                                                {isEligible ? `✓ ${formatCurrency(tax)} (Eligible)` : `⛔ ${currency.symbol}0 (${gst > 0 ? 'Blocked Sec 17(5)' : 'Exempt'})`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payment Mode</label>
                                    <select value={newExpense.payment_mode} onChange={(e) => setNewExpense({ ...newExpense, payment_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Bank Transfer</option>
                                        <option>UPI</option>
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Ref / UPI reference</label>
                                    <input required type="text" maxLength={30} value={newExpense.transaction_reference} onChange={(e) => setNewExpense({ ...newExpense, transaction_reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Example : UPI/1234567890" />
                                </div>
                            </div>

                            <button type="submit" disabled={createExpenseMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: createExpenseMutation.isPending ? 'not-allowed' : 'pointer', opacity: createExpenseMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)' }}>
                                {createExpenseMutation.isPending ? 'Posting...' : 'Settle & Post Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Budget Limit Modal */}
            {isBudgetModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '540px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{editingBudget ? 'Edit Team Budget' : 'Set Team Budget'}</h3>
                            <button onClick={() => setIsBudgetModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Team / Department Name</label>
                                <input required type="text" value={newBudget.category_name} onChange={(e) => setNewBudget({ ...newBudget, category_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. HR Team" disabled={!!editingBudget} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Budget Month *</label>
                                    <select 
                                        value={newBudget.budget_month || currentMonthStr} 
                                        onChange={(e) => setNewBudget({ ...newBudget, budget_month: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', fontSize: '0.85rem' }}
                                    >
                                        {monthOptions.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Monthly Budget ({currency.code || 'INR'}) *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 50000"
                                        onKeyDown={handleBudgetKeyDown}
                                        value={newBudget.budget_limit} 
                                        onChange={handleBudgetChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.8rem', 
                                            borderRadius: '12px', 
                                            border: budgetError ? '1px solid #F87171' : '1px solid #E2E8F0', 
                                            background: budgetError ? '#FEF2F2' : 'white',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }} 
                                    />
                                </div>
                            </div>
                            {budgetError && (
                                <p style={{ margin: '-0.5rem 0 0 0', fontSize: '0.72rem', fontWeight: '700', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>⚠️</span>
                                    <span>{budgetError}</span>
                                </p>
                            )}

                            {/* Carry Forward Option */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <input 
                                    type="checkbox" 
                                    id="carryForwardCheck"
                                    checked={newBudget.carry_forward !== false} 
                                    onChange={(e) => setNewBudget({ ...newBudget, carry_forward: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: '#BE185D', cursor: 'pointer' }}
                                />
                                <div>
                                    <label htmlFor="carryForwardCheck" style={{ fontSize: '0.75rem', fontWeight: '750', color: '#1E293B', cursor: 'pointer', display: 'block' }}>
                                        Auto Carry Forward Unused Budget
                                    </label>
                                    <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>
                                        If spending in previous month is less than budget, unspent balance carries forward to this month's available limit.
                                    </span>
                                </div>
                            </div>

                            {/* Team Members Section */}
                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Team Members ({newBudgetMembers.length})</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                                        style={{ border: 'none', background: '#F1F5F9', color: '#7C3AED', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                                    >
                                        {showAddMemberForm ? 'Cancel' : '+ Add Member'}
                                    </button>
                                </div>

                                {showAddMemberForm && (
                                    <div style={{ background: '#F8FAFC', padding: '0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem', marginBottom: '0.2rem' }}>
                                            <button 
                                                type="button"
                                                onClick={() => { setMemberInputMode('db'); setSelectedEmployeeId(''); }}
                                                style={{ border: 'none', background: memberInputMode === 'db' ? '#E0F2FE' : 'transparent', color: memberInputMode === 'db' ? '#0369A1' : '#64748B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Select from HR Database
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setMemberInputMode('manual'); setSelectedEmployeeId(''); }}
                                                style={{ border: 'none', background: memberInputMode === 'manual' ? '#E0F2FE' : 'transparent', color: memberInputMode === 'manual' ? '#0369A1' : '#64748B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Manual Entry
                                            </button>
                                        </div>

                                        {memberInputMode === 'db' ? (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Select Employee</label>
                                                <select 
                                                    value={selectedEmployeeId} 
                                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem', fontWeight: '600' }}
                                                >
                                                    <option value="">-- Choose Employee --</option>
                                                    {dbEmployees.map(emp => (
                                                        <option key={emp.employee_id || emp.id} value={emp.employee_id || emp.id}>
                                                            {emp.employee_id || emp.id} - {emp.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employee ID</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="EMP001" 
                                                        value={manualEmpId} 
                                                        onChange={(e) => setManualEmpId(e.target.value)} 
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.8rem', boxSizing: 'border-box' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employee Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Arun Kumar" 
                                                        value={manualEmpName} 
                                                        onChange={(e) => setManualEmpName(e.target.value)} 
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.8rem', boxSizing: 'border-box' }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {(() => {
                                            const totalBudget = parseInt(newBudget.budget_limit, 10);
                                            const nextCount = newBudgetMembers.length + 1;
                                            const nextShare = (!isNaN(totalBudget) && totalBudget > 0) ? Math.floor(totalBudget / nextCount) : 0;
                                            return nextShare > 0 ? (
                                                <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.72rem', color: '#6B21A8' }}>
                                                    💡 <strong>Equal Budget Share:</strong> Adding this member divides the {formatCurrency(totalBudget)} budget equally into <strong>{formatCurrency(nextShare)}</strong> per member ({nextCount} total).
                                                </div>
                                            ) : null;
                                        })()}

                                        <button 
                                            type="button" 
                                            onClick={handleAddMember}
                                            style={{ background: '#7C3AED', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.2rem' }}
                                        >
                                            Add to List
                                        </button>
                                    </div>
                                )}

                                {/* Members List Table */}
                                {newBudgetMembers.length > 0 ? (() => {
                                    const totalBudget = parseInt(newBudget.budget_limit, 10);
                                    const budgetPerMember = (!isNaN(totalBudget) && totalBudget > 0)
                                        ? Math.floor(totalBudget / newBudgetMembers.length)
                                        : 0;

                                    return (
                                        <div style={{ overflowX: 'auto', marginBottom: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', fontSize: '0.74rem' }}>
                                                <span style={{ color: '#475569', fontWeight: '800' }}>Equal Share Allocation:</span>
                                                <span style={{ color: '#7C3AED', fontWeight: '850' }}>{formatCurrency(budgetPerMember)} / member ({newBudgetMembers.length} {newBudgetMembers.length === 1 ? 'member' : 'members'})</span>
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                        <th style={{ padding: '0.4rem 0.6rem', fontWeight: '800', color: '#64748B' }}>Employee ID</th>
                                                        <th style={{ padding: '0.4rem 0.6rem', fontWeight: '800', color: '#64748B' }}>Name</th>
                                                        <th style={{ padding: '0.4rem 0.6rem', fontWeight: '800', color: '#64748B' }}>Equal Quota</th>
                                                        <th style={{ padding: '0.4rem 0.6rem', fontWeight: '800', color: '#64748B' }}>Actual Spent</th>
                                                        <th style={{ padding: '0.4rem 0.6rem', fontWeight: '800', color: '#64748B', textAlign: 'center' }}>Remove</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {newBudgetMembers.map(m => {
                                                        const sanitizedSpent = Math.max(0, Math.abs(Number(m.spent) || 0));
                                                        return (
                                                            <tr key={m.employee_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                                <td style={{ padding: '0.4rem 0.6rem', fontWeight: '700' }}>{m.employee_id}</td>
                                                                <td style={{ padding: '0.4rem 0.6rem', fontWeight: '600' }}>{m.name}</td>
                                                                <td style={{ padding: '0.4rem 0.6rem', color: '#7C3AED', fontWeight: '800' }}>
                                                                    {formatCurrency(budgetPerMember)}
                                                                </td>
                                                                <td style={{ padding: '0.4rem 0.6rem', color: sanitizedSpent > 0 ? '#EF4444' : '#64748B', fontWeight: '700' }}>
                                                                    {formatCurrency(sanitizedSpent)}
                                                                </td>
                                                                <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => setNewBudgetMembers(newBudgetMembers.filter(member => member.employee_id !== m.employee_id))}
                                                                        style={{ border: 'none', background: 'transparent', color: '#EF4444', fontWeight: '800', cursor: 'pointer' }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })() : (
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic', marginBottom: '0.75rem' }}>No team members assigned yet.</div>
                                )}
                                {/* Auto Budget Distribution Section */}
                                {(() => {
                                    const totalBudget = parseInt(newBudget.budget_limit, 10);
                                    const budgetPerMember = (newBudgetMembers.length > 0 && !isNaN(totalBudget) && totalBudget > 0)
                                        ? Math.floor(totalBudget / newBudgetMembers.length)
                                        : 0;
                                    if (newBudgetMembers.length > 0) {
                                        return (
                                            <div style={{ background: '#F5F3FF', padding: '0.8rem', borderRadius: '10px', border: '1px solid #DDD6FE', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', textTransform: 'uppercase' }}>Employee Budget Share</span>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5B21B6' }}>{formatCurrency(budgetPerMember)} / member</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', background: 'white', padding: '0.5rem', borderRadius: '6px', border: '1px solid #EDE9FE', maxHeight: '120px', overflowY: 'auto' }}>
                                                    {newBudgetMembers.map(m => (
                                                        <div key={m.employee_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                                                            <span>{m.name} <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>({m.employee_id})</span></span>
                                                            <span style={{ fontWeight: '700', color: '#7C3AED' }}>{formatCurrency(budgetPerMember)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            <button type="submit" disabled={Boolean(budgetError) || !newBudget.budget_limit || createBudgetMutation.isPending || updateBudgetMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: (Boolean(budgetError) || !newBudget.budget_limit) ? '#94A3B8' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: (Boolean(budgetError) || !newBudget.budget_limit) ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)', marginTop: '0.5rem' }}>
                                {editingBudget ? (updateBudgetMutation.isPending ? 'Updating...' : 'Update') : (createBudgetMutation.isPending ? 'Settling...' : 'Settle Budget Target')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Details Modal */}
            {viewingTeamDetails && (() => {
                let parsedMembers = [];
                try {
                    parsedMembers = typeof viewingTeamDetails.team_members === 'string'
                        ? JSON.parse(viewingTeamDetails.team_members || '[]')
                        : (viewingTeamDetails.team_members || []);
                } catch (e) {
                    parsedMembers = [];
                }
                const effectiveLimit = parseFloat(viewingTeamDetails.effective_limit) || parseFloat(viewingTeamDetails.budget_limit) || 0;
                const budgetPerMember = (parsedMembers.length > 0 && effectiveLimit > 0)
                    ? Math.floor(effectiveLimit / parsedMembers.length)
                    : 0;

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{viewingTeamDetails.category_name}</h3>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>{viewingTeamDetails.budget_month}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Team Budgets, Member Quotas & Allocations</span>
                                </div>
                                <button onClick={() => setViewingTeamDetails(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Base Budget</span>
                                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>{formatCurrency(viewingTeamDetails.budget_limit)}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Carried Forward</span>
                                        <span style={{ fontSize: '1rem', fontWeight: '800', color: viewingTeamDetails.carried_forward > 0 ? '#059669' : '#64748B' }}>
                                            {viewingTeamDetails.carried_forward > 0 ? `+${formatCurrency(viewingTeamDetails.carried_forward)}` : '₹0'}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Effective Limit</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '850', color: '#7C3AED' }}>{formatCurrency(effectiveLimit)}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Actual Spent</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '850', color: viewingTeamDetails.is_exceeded ? '#EF4444' : '#0F172A' }}>{formatCurrency(viewingTeamDetails.spent_amount)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Members & Allocations ({parsedMembers.length})</h4>
                                    {parsedMembers.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {parsedMembers.map(m => {
                                                const mSpent = Math.max(0, Math.abs(parseFloat(m.spent) || 0));
                                                const mRemaining = budgetPerMember - mSpent;
                                                return (
                                                    <div key={m.employee_id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.8rem 1rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.3rem' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>{m.name}</span>
                                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>ID: {m.employee_id}</span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                                                            <div>
                                                                <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '600' }}>Quota Share</span>
                                                                <span style={{ fontWeight: '700' }}>{formatCurrency(budgetPerMember)}</span>
                                                            </div>
                                                            <div>
                                                                <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '600' }}>Spent</span>
                                                                <span style={{ fontWeight: '700', color: '#EF4444' }}>{formatCurrency(mSpent)}</span>
                                                            </div>
                                                            <div>
                                                                <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '600' }}>Remaining</span>
                                                                <span style={{ fontWeight: '700', color: mRemaining >= 0 ? '#10B981' : '#EF4444' }}>
                                                                    {mRemaining >= 0 ? formatCurrency(mRemaining) : `-${formatCurrency(Math.abs(mRemaining))}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {m.salary && (
                                                            <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#64748B', borderTop: '1px dotted #F1F5F9', paddingTop: '0.25rem' }}>
                                                                <span>Monthly Reference Salary: </span>
                                                                <span style={{ fontWeight: '700', color: '#475569' }}>{formatCurrency(m.salary)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '10px' }}>
                                            No team members registered yet. You can add members by clicking "Edit" on this department budget.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Lodge Staff Claim Modal */}
            {isClaimModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem', overflowY: 'auto' }}>
                    <div className="max-h-[90vh] flex flex-col" style={{ background: 'white', width: '100%', maxWidth: '440px', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <div className="shrink-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid #F1F5F9' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Lodge Staff Claim</h3>
                            <button type="button" onClick={closeClaimModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateClaim} className="flex flex-col flex-1 min-h-0" style={{ margin: 0 }}>
                            <div className="flex-1 overflow-y-auto pr-1" style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Profile Name</label>
                                    <input required type="text" value={newClaim.employee_name} onChange={(e) => setNewClaim({ ...newClaim, employee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Karan Mehra (Inventory)" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Out-of-pocket Description</label>
                                    <input required type="text" value={newClaim.travel_expense} onChange={(e) => setNewClaim({ ...newClaim, travel_expense: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Client Sample Box Dispatches" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Date</label>
                                        <input required type="date" value={newClaim.date} onChange={(e) => setNewClaim({ ...newClaim, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Time</label>
                                        <input required type="time" value={newClaim.time} onChange={(e) => setNewClaim({ ...newClaim, time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Claim Amount ({currency.code})</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0.01"
                                        step="any"
                                        value={newClaim.claim_amount} 
                                        onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewClaim({ ...newClaim, claim_amount: val });
                                            if (val !== '' && (parseFloat(val) <= 0 || String(val).includes('-'))) {
                                                setClaimAmountError('Claim amount must be greater than 0');
                                            } else {
                                                setClaimAmountError('');
                                            }
                                        }} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.8rem', 
                                            borderRadius: '12px', 
                                            border: (claimAmountError || (newClaim.claim_amount !== '' && parseFloat(newClaim.claim_amount) <= 0)) ? '1.5px solid #EF4444' : '1px solid #E2E8F0', 
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }} 
                                    />
                                    {(claimAmountError || (newClaim.claim_amount !== '' && parseFloat(newClaim.claim_amount) <= 0)) && (
                                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#DC2626', fontWeight: '600', marginTop: '0.35rem' }}>
                                            Claim amount must be greater than 0
                                        </span>
                                    )}
                                </div>
                                {/* Multi-Receipt Sets List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {receiptSets.map((set, idx) => (
                                        <div key={set.id || idx} style={{ border: '1px solid #F1F5F9', borderRadius: '12px', padding: '0.85rem', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Receipt / Reference #{idx + 1} (Optional)</label>
                                                {receiptSets.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveReceiptSet(idx)} 
                                                        style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                                    >
                                                        Remove Set
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input 
                                                    type="text" 
                                                    value={set.receipt} 
                                                    onChange={(e) => handleReceiptTextChange(idx, e.target.value)} 
                                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} 
                                                    placeholder="e.g. UPI Ref No, Bank Txn ID, Receipt No., or Manual Reference" 
                                                />
                                                <input 
                                                    type="file" 
                                                    id={`expense-receipt-upload-${idx}`} 
                                                    accept=".png,.jpg,.jpeg,.webp,.pdf" 
                                                    style={{ display: 'none' }} 
                                                    onChange={(e) => handleSetFileChange(idx, e.target.files[0])} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => document.getElementById(`expense-receipt-upload-${idx}`).click()} 
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        width: '2.8rem', 
                                                        height: '2.8rem', 
                                                        borderRadius: '12px', 
                                                        border: '1px solid #E2E8F0', 
                                                        background: '#F8FAFC', 
                                                        color: '#64748B', 
                                                        fontSize: '1.25rem', 
                                                        fontWeight: '600', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {set.file_name && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '12px', background: 'white' }}>
                                                    {set.file_type && set.file_type.startsWith('image/') ? (
                                                        <img 
                                                            src={set.file_preview_url} 
                                                            alt="Preview" 
                                                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1' }} 
                                                        />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem' }}>
                                                            PDF
                                                        </div>
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {set.file_name}
                                                        </p>
                                                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>
                                                            {set.file_type && set.file_type.startsWith('image/') ? 'Image File' : 'PDF Document'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => window.open(set.file_preview_url, '_blank')} 
                                                            style={{ border: 'none', background: '#EFF6FF', color: '#2563EB', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => document.getElementById(`expense-receipt-upload-${idx}`).click()} 
                                                            style={{ border: 'none', background: '#F1F5F9', color: '#475569', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                                        >
                                                            Replace
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleSetFileRemove(idx)} 
                                                            style={{ border: 'none', background: '#FCE8E6', color: '#C5221F', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button 
                                        type="button" 
                                        onClick={handleAddReceiptSet} 
                                        style={{ border: '1px dashed #7C3AED', background: '#F5F3FF', color: '#6D28D9', padding: '0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                    >
                                        + Add Another Receipt / Proof
                                    </button>
                                </div>
                            </div>

                            <div className="shrink-0 border-t bg-gray-50/80 p-4">
                                <button type="submit" disabled={lodgeClaimMutation.isPending} style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', cursor: lodgeClaimMutation.isPending ? 'not-allowed' : 'pointer', opacity: lodgeClaimMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)' }}>
                                    {lodgeClaimMutation.isPending ? 'Lodging...' : 'Lodge Reimbursement Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Recurring Subscription Modal */}
            {isRecurringModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{editingRecurring ? 'Edit Subscription' : 'Add Recurring Subscription'}</h3>
                            <button onClick={() => setIsRecurringModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveRecurring} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Subscription Name</label>
                                <input required type="text" value={newRecurring.subscription_name} onChange={(e) => setNewRecurring({ ...newRecurring, subscription_name: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. AWS Cloud Server" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Vendor Name</label>
                                <input required type="text" value={newRecurring.payee_name} onChange={(e) => setNewRecurring({ ...newRecurring, payee_name: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Amazon Web Services" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Category</label>
                                    <select value={newRecurring.category_name} onChange={(e) => setNewRecurring({ ...newRecurring, category_name: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        {categoryOptions.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Amount ({currency.code || 'INR'}) *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 5000"
                                        onKeyDown={handleRecurringKeyDown}
                                        value={newRecurring.expense_amount} 
                                        onChange={handleRecurringAmountChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.7rem', 
                                            borderRadius: '10px', 
                                            border: recurringAmountError ? '1px solid #F87171' : '1px solid #E2E8F0', 
                                            background: recurringAmountError ? '#FEF2F2' : 'white',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }} 
                                    />
                                    {recurringAmountError && (
                                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.72rem', fontWeight: '700', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>⚠️</span>
                                            <span>{recurringAmountError}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Frequency</label>
                                    <select value={newRecurring.recurring_type} onChange={(e) => setNewRecurring({ ...newRecurring, recurring_type: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Next Due Date</label>
                                    <input required type="date" value={newRecurring.next_due_date} onChange={(e) => setNewRecurring({ ...newRecurring, next_due_date: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Auto-Post</label>
                                    <select value={newRecurring.auto_create} onChange={(e) => setNewRecurring({ ...newRecurring, auto_create: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Active">Active (Auto-Create)</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>Status</label>
                                    <select value={newRecurring.recurring_status} onChange={(e) => setNewRecurring({ ...newRecurring, recurring_status: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Active">Active</option>
                                        <option value="Paused">Paused</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={Boolean(recurringAmountError) || !newRecurring.expense_amount || createRecurringMutation.isPending || updateRecurringMutation.isPending} style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: (Boolean(recurringAmountError) || !newRecurring.expense_amount) ? '#94A3B8' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', cursor: (Boolean(recurringAmountError) || !newRecurring.expense_amount) ? 'not-allowed' : 'pointer', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.15)' }}>
                                {editingRecurring ? (updateRecurringMutation.isPending ? 'Updating...' : 'Update') : (createRecurringMutation.isPending ? 'Creating...' : 'Create Subscription')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Payment Modal */}
            {isPaymentModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Process Reimbursement Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            payClaimMutation.mutate({ id: payingClaimId, data: paymentDetails });
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Cash/Bank Account</label>
                                <select 
                                    value={paymentDetails.paymentMode} 
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMode: e.target.value })} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    <option value="Cash in Hand">Cash in Hand</option>
                                    <option value="HDFC Bank Account">HDFC Bank Account</option>
                                    <option value="SBI Current Account">SBI Current Account</option>
                                    <option value="ICICI Bank Account">ICICI Bank Account</option>
                                    <option value="UPI / Razorpay">UPI / Razorpay</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payment Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    value={paymentDetails.paymentDate} 
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={payClaimMutation.isPending} 
                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.15)' }}
                            >
                                {payClaimMutation.isPending ? 'Processing...' : 'Confirm & Reduce Balance'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Department Spending Modal */}
            {isRecordSpendingModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            if (recordSpendingForm.file_preview_url) {
                                URL.revokeObjectURL(recordSpendingForm.file_preview_url);
                            }
                            setIsRecordSpendingModalOpen(false);
                            setSelectedBudgetForSpend(null);
                            setSpendingAmountError('');
                        }
                    }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem', overflowY: 'auto' }}
                >
                    <div style={{ background: 'white', width: '100%', maxWidth: '540px', borderRadius: '24px', padding: '1.75rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)', flexShrink: 0 }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Record Department Expense</h3>
                                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>Log verified spend, assign to member quota, and attach bill receipt.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (recordSpendingForm.file_preview_url) {
                                        URL.revokeObjectURL(recordSpendingForm.file_preview_url);
                                    }
                                    setIsRecordSpendingModalOpen(false);
                                    setSelectedBudgetForSpend(null);
                                    setSpendingAmountError('');
                                }} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Department Budget Context Banner */}
                        {selectedBudgetForSpend && (
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '0.8rem 1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                                <div>
                                    <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '750', textTransform: 'uppercase' }}>Department</span>
                                    <span style={{ fontWeight: '800', color: '#7C3AED' }}>{selectedBudgetForSpend.category_name}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '750', textTransform: 'uppercase' }}>Budget Month</span>
                                    <span style={{ fontWeight: '800', color: '#0F172A' }}>{selectedBudgetForSpend.budget_month || currentMonthStr}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', color: '#64748B', fontSize: '0.68rem', fontWeight: '750', textTransform: 'uppercase' }}>Available Limit</span>
                                    <span style={{ fontWeight: '850', color: (selectedBudgetForSpend.remaining_amount >= 0) ? '#059669' : '#DC2626' }}>
                                        {formatCurrency(selectedBudgetForSpend.remaining_amount !== undefined ? selectedBudgetForSpend.remaining_amount : (selectedBudgetForSpend.budget_limit - selectedBudgetForSpend.spent_amount))}
                                    </span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSaveSpending} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            
                            {/* Row 1: Department & Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Department / Category</label>
                                    <input 
                                        readOnly 
                                        type="text" 
                                        value={recordSpendingForm.category_name} 
                                        style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: '#F1F5F9', fontWeight: '750', color: '#475569', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Expense Date *</label>
                                    <input 
                                        required 
                                        type="date" 
                                        value={recordSpendingForm.date} 
                                        onChange={(e) => setRecordSpendingForm({ ...recordSpendingForm, date: e.target.value })} 
                                        style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '700', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                                    />
                                </div>
                            </div>

                            {/* Row 2: Team Member & Amount */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.75rem' }}>
                                {(() => {
                                    let currentBudgetMembers = [];
                                    if (selectedBudgetForSpend) {
                                        try {
                                            currentBudgetMembers = typeof selectedBudgetForSpend.team_members === 'string'
                                                ? JSON.parse(selectedBudgetForSpend.team_members || '[]')
                                                : (selectedBudgetForSpend.team_members || []);
                                        } catch (e) {
                                            currentBudgetMembers = [];
                                        }
                                    }
                                    if (currentBudgetMembers.length > 0) {
                                        const effectiveLimit = parseFloat(selectedBudgetForSpend.effective_limit) || parseFloat(selectedBudgetForSpend.budget_limit) || 0;
                                        const quotaPerMember = Math.floor(effectiveLimit / currentBudgetMembers.length);

                                        return (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Select Team Member *</label>
                                                <select 
                                                    required 
                                                    value={recordSpendingForm.employee_id || ''} 
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        const member = currentBudgetMembers.find(m => String(m.employee_id) === String(selectedId));
                                                        setRecordSpendingForm(prev => ({ 
                                                            ...prev, 
                                                            employee_id: selectedId,
                                                            employee_name: member ? member.name : '' 
                                                        }));
                                                    }} 
                                                    style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontWeight: '700', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                                >
                                                    <option value="">-- Choose Member --</option>
                                                    {currentBudgetMembers.map(m => {
                                                        const mSpent = Math.max(0, Math.abs(parseFloat(m.spent) || 0));
                                                        const mRemaining = quotaPerMember - mSpent;
                                                        return (
                                                            <option key={m.employee_id} value={m.employee_id}>
                                                                {m.name} (Quota: {formatCurrency(quotaPerMember)} | Rem: {formatCurrency(mRemaining)})
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Staff / Employee Name *</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="e.g. Arun Kumar"
                                                    value={recordSpendingForm.employee_name || ''}
                                                    onChange={(e) => setRecordSpendingForm(prev => ({ ...prev, employee_name: e.target.value, employee_id: `MAN-${Date.now().toString().slice(-4)}` }))}
                                                    style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '700', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                        );
                                    }
                                })()}

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Amount Spent ({currency.symbol}) *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 1500" 
                                        onKeyDown={handleSpendingKeyDown}
                                        value={recordSpendingForm.amount} 
                                        onChange={handleSpendingAmountChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.7rem 0.8rem', 
                                            borderRadius: '10px', 
                                            border: spendingAmountError ? '1px solid #F87171' : '1px solid #CBD5E1', 
                                            background: spendingAmountError ? '#FEF2F2' : 'white',
                                            outline: 'none', 
                                            fontWeight: '800', 
                                            fontSize: '0.95rem',
                                            color: '#0F172A',
                                            boxSizing: 'border-box' 
                                        }} 
                                    />
                                    {spendingAmountError && (
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', fontWeight: '700', color: '#EF4444' }}>
                                            ⚠️ {spendingAmountError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Payment Mode & Description */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Payment Account / Mode</label>
                                    <select 
                                        value={recordSpendingForm.payment_mode} 
                                        onChange={(e) => setRecordSpendingForm({ ...recordSpendingForm, payment_mode: e.target.value })} 
                                        style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontWeight: '700', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                    >
                                        <option value="UPI">UPI / Net Banking</option>
                                        <option value="Cash">Cash in Hand</option>
                                        <option value="Bank Transfer">Bank Transfer / Card</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Expense Description</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Printer cartridges, snacks" 
                                        value={recordSpendingForm.description} 
                                        onChange={(e) => setRecordSpendingForm({ ...recordSpendingForm, description: e.target.value })} 
                                        style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '600', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                                    />
                                </div>
                            </div>

                            {/* Row 4: Attach Bill / Receipt Upload Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Attach Bill / Receipt Proof (Optional)</label>
                                
                                {!recordSpendingForm.file_name ? (
                                    <div 
                                        onClick={() => document.getElementById('spendingBillUploadInput').click()}
                                        style={{ 
                                            border: '2px dashed #CBD5E1', 
                                            borderRadius: '12px', 
                                            padding: '1rem', 
                                            textAlign: 'center', 
                                            background: '#F8FAFC', 
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                                    >
                                        <input 
                                            type="file" 
                                            id="spendingBillUploadInput"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                            onChange={handleSpendingBillChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '1.25rem' }}>📎</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A' }}>Click to upload bill or voucher receipt</span>
                                            <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Supported formats: JPG, PNG, WEBP, PDF (Max 10 MB)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: '#ECFDF5', border: '1.5px solid #10B981', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '1.25rem' }}>📄</span>
                                            <div style={{ overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#065F46', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                    {recordSpendingForm.file_name}
                                                </p>
                                                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '600' }}>Bill attached successfully</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleRemoveSpendingBill}
                                            style={{ border: 'none', background: '#FEE2E2', color: '#B91C1C', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', flexShrink: 0 }}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (recordSpendingForm.file_preview_url) {
                                            URL.revokeObjectURL(recordSpendingForm.file_preview_url);
                                        }
                                        setIsRecordSpendingModalOpen(false);
                                        setSelectedBudgetForSpend(null);
                                        setSpendingAmountError('');
                                    }}
                                    style={{
                                        flex: '0 0 auto',
                                        padding: '0.85rem 1.25rem',
                                        borderRadius: '14px',
                                        background: '#F1F5F9',
                                        color: '#475569',
                                        border: '1px solid #CBD5E1',
                                        fontWeight: '750',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem'
                                    }}
                                >
                                    ← Return Back
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={Boolean(spendingAmountError) || !recordSpendingForm.amount || recordDepartmentSpendingMutation.isPending} 
                                    style={{ 
                                        flex: 1, 
                                        padding: '0.85rem', 
                                        borderRadius: '14px', 
                                        background: (Boolean(spendingAmountError) || !recordSpendingForm.amount || recordDepartmentSpendingMutation.isPending) ? '#94A3B8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                                        color: 'white', 
                                        border: 'none', 
                                        fontWeight: '800', 
                                        fontSize: '0.95rem', 
                                        cursor: (Boolean(spendingAmountError) || !recordSpendingForm.amount || recordDepartmentSpendingMutation.isPending) ? 'not-allowed' : 'pointer', 
                                        boxShadow: '0 8px 16px rgba(5, 150, 105, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CheckCircle2 size={18} />
                                    {recordDepartmentSpendingMutation.isPending ? 'Recording & Allocating...' : 'Confirm & Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessExpenses;
