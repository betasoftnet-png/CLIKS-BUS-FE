import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { 
    CreditCard, 
    Plus, 
    Search, 
    CheckCircle2, 
    AlertTriangle, 
    X, 
    Activity, 
    TrendingUp, 
    Sliders, 
    ShieldCheck, 
    Calendar, 
    Briefcase,
    FileText,
    Award,
    Heart,
    Lock,
    Edit2,
    Trash2,
    Download,
    History,
    Zap
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../services/payrollService';
import { staffingService } from '../services/staffingService';
import FilterableTableHead from '../components/FilterableTableHead';
import { useCurrency } from '../context';

const BusinessPayroll = () => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('run');
    const [colFilters, setColFilters] = React.useState({}); // 'run', 'structures', 'compliance', 'loans', 'advances'
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditingPayroll, setIsEditingPayroll] = useState(false);
    const [editPayrollForm, setEditPayrollForm] = useState({});

    const queryClient = useQueryClient();

    // Queries
    const { data: dbRecords = [] } = useQuery({
        queryKey: ['payrollRecords'],
        queryFn: () => payrollService.getPayrollRecords()
    });

    const { data: staffList = [] } = useQuery({
        queryKey: ['staffList'],
        queryFn: () => staffingService.getEmployees()
    });

    // Mutations
    const processPayrollMutation = useMutation({
        mutationFn: (data) => payrollService.processPayroll(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            await refetchPayroll();
            setIsProcessModalOpen(false);
            setPayForm({
                employee_id: '',
                employee_name: '',
                month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                basic_salary: '',
                hra_amount: '',
                special_allowance: '',
                bonus_amount: '',
                overtime_pay: '',
                professional_tax: 200,
                apply_pf: true,
                apply_tds: false,
                esi_deduction: '',
                tds_deduction: ''
            });
            alert('Monthly payroll processed and basic allowances generated successfully!');
        }
    });

    const releaseSalaryMutation = useMutation({
        mutationFn: (id) => payrollService.releaseSalary(id),
        onSuccess: async (_, id) => {
            queryClient.setQueryData(['payrollRecords'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(rec => rec.id === id ? { ...rec, status: 'paid' } : rec);
            });
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            await refetchPayroll();
            setSelectedPayroll(prev => prev && prev.payroll_id === id ? { ...prev, payroll_status: 'paid' } : prev);
            alert('Direct Bank Transfer (NEFT/UPI) triggered successfully! Payslip PDF dispatched.');
        }
    });

    const createLoanMutation = useMutation({
        mutationFn: ({ id, data }) => payrollService.createLoan(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setLoanForm({ employee_name: '', loan_amount: '', emi_amount: '', deduction_months: '' });
            setIsLoanModalOpen(false);
            alert('Employee loan allocation verified and remaining balance recorded successfully!');
        }
    });

    const createAdvanceMutation = useMutation({
        mutationFn: ({ id, data }) => payrollService.createAdvance(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setAdvanceForm({
                employee_name: '',
                advance_amount: '',
                reason: '',
                recovery_month: 'Immediate (Next Payroll)'
            });
            setIsAdvanceModalOpen(false);
            alert('Salary advance disbursed and recovery cycle registered successfully!');
        }
    });

    const updatePayrollMutation = useMutation({
        mutationFn: ({ id, data }) => payrollService.updatePayroll(id, data),
        onSuccess: async (updatedData, { id, data }) => {
            const updatedRec = updatedData || data;
            queryClient.setQueryData(['payrollRecords'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(rec => rec.id === id ? { ...rec, ...updatedRec } : rec);
            });
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            await refetchPayroll();
            setSelectedPayroll(prev => prev ? { ...prev, ...data } : null);
            setIsEditingPayroll(false);
            alert('Payroll record updated successfully!');
        }
    });

    const deletePayrollMutation = useMutation({
        mutationFn: (id) => payrollService.deletePayroll(id),
        onSuccess: async (_, id) => {
            queryClient.setQueryData(['payrollRecords'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.filter(rec => rec.id !== id);
            });
            await queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            await refetchPayroll();
            setIsDetailModalOpen(false);
            setSelectedPayroll(null);
            alert('Payroll record deleted.');
        }
    });

    // Process lists with fallbacks
    const getVal = (val, def) => (val !== undefined && val !== null && val !== '') ? parseFloat(val) : def;

    const payrollRecords = dbRecords.length > 0 ? dbRecords.map(rec => {
        const emp = staffList.find(s => s.name === rec.employee_name || s.id === String(rec.employee_id || '').replace('EMP-', '')) || {};
        let bData = {};
        let addrMeta = {};
        try { bData = typeof emp.bank_details === 'string' ? JSON.parse(emp.bank_details) : (emp.bank_details || {}); } catch(e){}
        try { addrMeta = typeof emp.address === 'string' ? JSON.parse(emp.address) : (emp.address || {}); } catch(e){}

        let hra = getVal(rec.hra_amount, 0);
        let spec = getVal(rec.special_allowance, 0);
        let bonus = getVal(rec.bonus_amount, 0);
        let overtime = getVal(rec.overtime_pay, 0);
        
        let basic = getVal(rec.basic_salary, null);
        if (basic === null) {
            let totalAmt = getVal(rec.amount, 30000);
            basic = totalAmt - hra - spec - bonus - overtime;
            if (basic < 0) basic = totalAmt;
        }

        const earnings = hra + spec + bonus + overtime;
        const pf = getVal(rec.pf_deduction, 0);
        const esi = getVal(rec.esi_deduction, 0);
        const tds = getVal(rec.tds_deduction, 0);
        const profTax = getVal(rec.professional_tax, 0);
        const loan = getVal(rec.loan_deduction, 0);
        const deductions = pf + esi + tds + profTax + loan;
        const netPay = (basic + earnings) - deductions;

        return {
            payroll_id: rec.id,
            employee_id: rec.employee_id || 'EMP-001',
            employee_name: rec.employee_name || 'Arun Kumar (Sales)',
            payroll_month: rec.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            payroll_status: (rec.status || 'processed').toLowerCase(),
            status: (rec.status || 'processed').toLowerCase(),
            salary_type: rec.salary_type || 'Monthly',
            basic_salary: basic,
            base_salary: basic,
            salary: basic,
            hra_amount: hra,
            special_allowance: spec,
            bonus_amount: bonus,
            overtime_pay: overtime,
            earnings: earnings,
            total_earnings: earnings,
            pf_deduction: pf,
            esi_deduction: esi,
            tds_deduction: tds,
            professional_tax: profTax,
            loan_deduction: loan,
            deductions: deductions,
            total_deductions: deductions,
            net_pay: netPay,
            net_take_home: netPay,
            take_home: netPay,
            payable_days: parseInt(rec.payable_days) || 30,
            
            bank_name: bData.bank_name || emp.bank_name || rec.bank_name || 'HDFC Bank',
            account_number: bData.account_number || emp.account_number || rec.account_number || '50100223344551',
            bank_account: `${bData.bank_name || emp.bank_name || rec.bank_name || 'HDFC Bank'} ${bData.account_number || emp.account_number || rec.account_number || ''}`,
            payslip_number: rec.payslip_number || `PSN-2026-${rec.id ? rec.id * 8 : '091'}`,
            payslip_ref: rec.payslip_number || `PSN-2026-${rec.id ? rec.id * 8 : '091'}`,
            pan_number: addrMeta.pan_number || emp.pan_number || rec.pan_number || 'ABCDE1234F',
            uan_number: addrMeta.pf_number || emp.pf_number || rec.uan_number || '100223344111',
            esi_number: emp.esi_number || rec.esi_number || '3122334455001'
        };
    }) : [];

    const loans = dbRecords.length > 0 ? dbRecords.filter(rec => {
        if (!rec.loans_data) return false;
        let lData = {};
        try { lData = typeof rec.loans_data === 'string' ? JSON.parse(rec.loans_data) : rec.loans_data; } catch(e){}
        return parseFloat(lData.loan_amount) > 0;
    }).map(rec => {
        let lData = {};
        try { lData = typeof rec.loans_data === 'string' ? JSON.parse(rec.loans_data) : rec.loans_data; } catch(e){}
        const loanAmt = parseFloat(lData.loan_amount) || 0;
        const emiAmt = parseFloat(lData.emi_amount) || 0;
        const remBal = parseFloat(lData.remaining_balance) !== undefined ? parseFloat(lData.remaining_balance) : loanAmt;
        const tenure = lData.deduction_months || (emiAmt > 0 ? Math.ceil(loanAmt / emiAmt) : 0);
        return {
            payroll_id: rec.id,
            employee_name: rec.employee_name || lData.employee_name || 'Staff Member',
            loan_amount: loanAmt,
            emi_amount: emiAmt,
            remaining_balance: remBal,
            deduction_months: tenure,
            status: remBal <= 0 ? 'Repaid' : 'Active'
        };
    }) : [];

    const salaryAdvances = dbRecords.length > 0 ? dbRecords.filter(rec => {
        let aData = null;
        let lData = null;
        try { if (rec.advances_data) aData = typeof rec.advances_data === 'string' ? JSON.parse(rec.advances_data) : rec.advances_data; } catch(e){}
        try { if (rec.loans_data) lData = typeof rec.loans_data === 'string' ? JSON.parse(rec.loans_data) : rec.loans_data; } catch(e){}
        return (aData && parseFloat(aData.advance_amount) > 0) || (lData && parseFloat(lData.salary_advance) > 0);
    }).map(rec => {
        let aData = {};
        let lData = {};
        try { if (rec.advances_data) aData = typeof rec.advances_data === 'string' ? JSON.parse(rec.advances_data) : rec.advances_data; } catch(e){}
        try { if (rec.loans_data) lData = typeof rec.loans_data === 'string' ? JSON.parse(rec.loans_data) : rec.loans_data; } catch(e){}

        const amt = parseFloat(aData.advance_amount) || parseFloat(lData.salary_advance) || 0;
        const date = aData.disbursal_date || (rec.created_at ? rec.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
        const recoveryMonth = aData.recovery_month || rec.month || 'Immediate (Next Payroll)';
        const reason = aData.reason || lData.reason || 'General Salary Advance';
        const status = aData.status || (rec.status === 'paid' ? 'Deducted' : 'Disbursed');

        return {
            payroll_id: rec.id,
            employee_name: rec.employee_name || aData.employee_name || 'Staff Member',
            advance_amount: amt,
            disbursal_date: date,
            recovery_month: recoveryMonth,
            reason: reason,
            status: status
        };
    }) : [];

    // Available employees memoized across staff and payroll records
    const availableEmployees = React.useMemo(() => {
        const list = [];
        const namesSeen = new Set();

        if (Array.isArray(staffList)) {
            staffList.forEach(s => {
                if (s && s.name && !namesSeen.has(s.name)) {
                    namesSeen.add(s.name);
                    list.push({ 
                        id: `EMP-${s.id}`, 
                        name: s.name, 
                        department: s.department || s.role || 'Staff', 
                        salary: parseFloat(s.salary) || '' 
                    });
                }
            });
        }

        if (Array.isArray(payrollRecords)) {
            payrollRecords.forEach(r => {
                if (r && r.employee_name && !namesSeen.has(r.employee_name)) {
                    namesSeen.add(r.employee_name);
                    list.push({ 
                        id: r.employee_id || `EMP-${r.payroll_id}`, 
                        name: r.employee_name, 
                        department: 'Employee', 
                        salary: r.basic_salary || '' 
                    });
                }
            });
        }

        return list;
    }, [staffList, payrollRecords]);

    // Input guards against negative numbers and exponent keys
    const preventNegativeKeys = (e) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const sanitizePositiveInput = (setter) => (e) => {
        const val = e.target.value;
        if (val === '') {
            setter('');
            return;
        }
        const cleanVal = Math.max(0, parseFloat(val) || 0);
        setter(cleanVal);
    };

    // Month options for processing and filtering
    const monthOptions = [
        'January 2026', 'February 2026', 'March 2026', 'April 2026',
        'May 2026', 'June 2026', 'July 2026', 'August 2026',
        'September 2026', 'October 2026', 'November 2026', 'December 2026',
        'January 2027', 'February 2027', 'March 2027', 'April 2027'
    ];

    const [selectedMonthFilter, setSelectedMonthFilter] = useState('All');

    // Form states
    const [payForm, setPayForm] = useState({
        employee_id: '',
        employee_name: '',
        month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        basic_salary: '',
        hra_amount: '',
        special_allowance: '',
        bonus_amount: '',
        overtime_pay: '',
        professional_tax: 200,
        apply_pf: true,
        apply_tds: false,
        esi_deduction: '',
        tds_deduction: ''
    });

    const [loanForm, setLoanForm] = useState({
        employee_name: '',
        loan_amount: '',
        emi_amount: '',
        deduction_months: ''
    });

    const [advanceForm, setAdvanceForm] = useState({
        employee_name: '',
        advance_amount: '',
        reason: '',
        recovery_month: 'Immediate (Next Payroll)'
    });

    // Submissions
    const handleProcessPayroll = (e) => {
        e.preventDefault();
        const base = parseFloat(payForm.basic_salary) || 0;
        const hra = parseFloat(payForm.hra_amount) || 0;
        const spec = parseFloat(payForm.special_allowance) || 0;
        const bonus = parseFloat(payForm.bonus_amount) || 0;
        const overtime = parseFloat(payForm.overtime_pay) || 0;
        const pf = payForm.apply_pf ? Math.round(base * 0.12) : 0;
        const esi = parseFloat(payForm.esi_deduction) || 0;
        const tds = payForm.apply_tds ? (parseFloat(payForm.tds_deduction) || 0) : 0;
        const profTax = (payForm.professional_tax !== '' && payForm.professional_tax !== undefined) ? parseFloat(payForm.professional_tax) : 200;
        const total = (base + hra + spec + bonus + overtime) - (pf + esi + tds + profTax);

        processPayrollMutation.mutate({
            employee_id: payForm.employee_id,
            employee_name: payForm.employee_name,
            amount: total,
            basic_salary: base,
            month: payForm.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            status: 'processed',
            hra_amount: hra,
            special_allowance: spec,
            bonus_amount: bonus,
            overtime_pay: overtime,
            pf_deduction: pf,
            esi_deduction: esi,
            tds_deduction: tds,
            professional_tax: profTax
        });
    };

    const handleCreateLoan = (e) => {
        e.preventDefault();
        const loanAmt = parseFloat(loanForm.loan_amount) || 0;
        const emiAmt = parseFloat(loanForm.emi_amount) || 0;
        const months = emiAmt > 0 ? Math.ceil(loanAmt / emiAmt) : (parseInt(loanForm.deduction_months) || 0);

        const matchingRecord = payrollRecords.find(r => r.employee_name === loanForm.employee_name);
        const targetId = matchingRecord ? matchingRecord.payroll_id : 1;
        createLoanMutation.mutate({
            id: targetId,
            data: {
                employee_name: loanForm.employee_name,
                loan_amount: loanAmt,
                emi_amount: emiAmt,
                remaining_balance: loanAmt,
                deduction_months: months
            }
        });
    };

    const handleCreateAdvance = (e) => {
        e.preventDefault();
        const amt = parseFloat(advanceForm.advance_amount) || 0;
        if (amt <= 0) {
            alert('Please specify an advance amount greater than 0');
            return;
        }

        const matchingRecord = payrollRecords.find(r => r.employee_name === advanceForm.employee_name);
        const targetId = matchingRecord ? matchingRecord.payroll_id : 1;
        createAdvanceMutation.mutate({
            id: targetId,
            data: {
                employee_name: advanceForm.employee_name,
                advance_amount: amt,
                reason: advanceForm.reason || 'General Salary Advance',
                recovery_month: advanceForm.recovery_month || 'Immediate (Next Payroll)',
                disbursal_date: new Date().toISOString().split('T')[0],
                status: 'Disbursed'
            }
        });
    };

    const handleReleaseSalary = (payId) => {
        releaseSalaryMutation.mutate(payId);
    };

    const filteredRecords = payrollRecords.filter(rec => {
        const matchesSearch = rec.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.payroll_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.payslip_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = selectedMonthFilter === 'All' || rec.payroll_month === selectedMonthFilter;
        return matchesSearch && matchesMonth;
    });

    const totalSalaryExpense = payrollRecords.reduce((sum, rec) => {
        const gross = rec.basic_salary + rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay;
        const deductions = rec.pf_deduction + rec.esi_deduction + rec.tds_deduction + rec.professional_tax + rec.loan_deduction;
        return sum + (gross - deductions);
    }, 0);

    const totalCompliance = payrollRecords.reduce((sum, rec) => sum + rec.pf_deduction + rec.esi_deduction, 0);
    const totalLoanOutstanding = loans.reduce((sum, l) => sum + l.remaining_balance, 0);
    const totalAdvanceDisbursed = salaryAdvances.reduce((sum, a) => sum + a.advance_amount, 0);

    return (
        <>
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <CreditCard size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Workforce Payroll Engine</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage monthly earnings structures, HRA allowances, EPF/ESI statutory compliance filings, TDS calculations, loans EMIs, and auto payouts.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => {
                            setLoanForm({ employee_name: '', loan_amount: '', emi_amount: '', deduction_months: '' });
                            setIsLoanModalOpen(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#059669', border: '1px solid #A7F3D0', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Sliders size={15} /> Allocate Employee Loan
                    </button>
                    <button 
                        onClick={() => {
                            setAdvanceForm({ employee_name: '', advance_amount: '', reason: '', recovery_month: 'Immediate (Next Payroll)' });
                            setIsAdvanceModalOpen(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#D97706', border: '1px solid #FDE68A', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Zap size={15} /> Disburse Salary Advance
                    </button>
                    <button 
                        onClick={() => setIsProcessModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Process Monthly Payroll
                    </button>
                </div>
            </div>

            {/* Payroll Metrics Grid */}
            {/* Modern Payroll Left-Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Monthly Salary Expense', value: formatCurrency(totalSalaryExpense), icon: CreditCard, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Compliance PF / ESI', value: `${formatCurrency(totalCompliance)} Filed`, icon: ShieldCheck, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Outstanding Loans', value: formatCurrency(totalLoanOutstanding), icon: Sliders, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Salary Advances', value: `${formatCurrency(totalAdvanceDisbursed)} Disbursed`, icon: Zap, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Total Payslips', value: `${payrollRecords.length} Generated`, icon: FileText, color: '#8B5CF6', bg: '#F5F3FF' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '1.25rem 1.5rem 1.25rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default', position: 'relative', overflow: 'hidden', gap: '1rem' }}>
                        {/* Left Accent Pillar */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: stat.color }} />
                        
                        {/* Circular Icon Container */}
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={22} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                             <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                             <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[
                    { id: 'run', label: 'Monthly Payroll Register', icon: FileText, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'structures', label: 'Salary Structures (CTC)', icon: CreditCard, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'compliance', label: 'Compliance (PF / ESI / PAN)', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'loans', label: 'Employee Loans', icon: Sliders, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' },
                    { id: 'advances', label: 'Salary Advances', icon: Zap, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', 
                            background: activeTab === tab.id ? tab.gradient : 'white', 
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeTab === tab.id ? `0 4px 10px ${tab.shadowColor}` : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Monthly Payroll Register */}
            {activeTab === 'run' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ position: 'relative', width: '380px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search salary register..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.88rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#64748B' }}>Payroll Month:</span>
                            <select
                                value={selectedMonthFilter}
                                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                                style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                            >
                                <option value="All">All Months (Show All)</option>
                                {Array.from(new Set(payrollRecords.map(r => r.payroll_month).filter(Boolean))).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', minWidth: 'max-content', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <FilterableTableHead columns={[
        { key: 'payslip_ref', label: 'Payslip Ref', placeholder: 'e.g. PAY-001' },
        { key: 'employee_name', label: 'Employee', placeholder: 'Name' },
        { key: 'base_salary', label: 'Base Salary', placeholder: 'e.g. 50000' },
        { key: 'earnings', label: 'Earnings', placeholder: 'e.g. 5000' },
        { key: 'deductions', label: 'Deductions', placeholder: 'e.g. 2000' },
        { key: 'net_pay', label: 'Net Take Home', placeholder: 'e.g. 48000' },
        { key: 'bank_account', label: 'Bank Account', placeholder: 'Account' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Paid' },
        { key: '_actions', label: 'Actions', noFilter: true, align: 'center' }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredRecords.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => {
                                    return (
                                        <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s' }} onClick={() => { setSelectedPayroll(rec); setIsDetailModalOpen(true); setIsEditingPayroll(false); }} onMouseOver={(e) => e.currentTarget.style.background='#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{rec.payslip_number}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Month: {rec.payroll_month}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{rec.employee_name}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>{formatCurrency(rec.basic_salary)}</td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#1B6B3A' }}>
                                                {formatCurrency(rec.earnings)}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#EF4444' }}>
                                                -{formatCurrency(rec.deductions)}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency(rec.net_pay)}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{rec.bank_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{rec.account_number}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                    background: rec.payroll_status === 'paid' ? '#ECFDF5' : '#FFFBEB',
                                                    color: rec.payroll_status === 'paid' ? '#10B981' : '#D97706',
                                                    fontWeight: '800', fontSize: '0.75rem'
                                                }}>{rec.payroll_status.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', alignItems: 'center' }}>
                                                    {rec.payroll_status !== 'paid' && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleReleaseSalary(rec.payroll_id); }}
                                                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                        >Release Salary</button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPayroll(rec);
                                                            setEditPayrollForm({ ...rec });
                                                            setIsEditingPayroll(true);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: '#334155', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                                    >
                                                        <Edit2 size={13} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={async (e) => { e.stopPropagation(); if (await window.confirm('Delete this payroll record?')) deletePayrollMutation.mutate(rec.payroll_id); }}
                                                        style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                    >
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Salary Structures CTC */}
            {activeTab === 'structures' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Compensation Breakdown Structure (Annual CTC)</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Basic Base Salary</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>House Rent Allowance (HRA)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Special Allowances</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Approx Annual Cost (CTC)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollRecords.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => (
                                    <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{rec.employee_name}</td>
                                        <td style={{ padding: '1rem' }}>{formatCurrency(rec.basic_salary)} / Month</td>
                                        <td style={{ padding: '1rem', color: '#1B6B3A', fontWeight: '700' }}>{formatCurrency(rec.hra_amount)} / Month</td>
                                        <td style={{ padding: '1rem' }}>{formatCurrency(rec.special_allowance)} / Month</td>
                                        <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency((rec.basic_salary + rec.hra_amount + rec.special_allowance) * 12)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Compliance EPF/ESI */}
            {activeTab === 'compliance' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Statutory EPF, ESI, PAN Compliance Identifiers</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>PAN Number</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Universal Account Number (UAN)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>ESI Identification No</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Monthly EPF Contribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollRecords.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => (
                                    <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{rec.employee_name}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700', fontFamily: 'monospace' }}>{rec.pan_number}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{rec.uan_number || 'N/A'}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{rec.esi_number || 'N/A'}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>{formatCurrency(rec.pf_deduction)} (Auto EPF 12%)</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Employee Loans */}
            {activeTab === 'loans' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Active Employee Loans</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Track long-term employee loans, tenure duration, and monthly recurring EMI deductions.</p>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Granted Loan Amount</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Monthly EMI deduction</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Remaining Loan Balance</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Deduction Duration</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((l, idx) => {
                                const tenureMonths = (parseFloat(l.emi_amount) > 0) 
                                    ? Math.ceil((parseFloat(l.remaining_balance) || parseFloat(l.loan_amount)) / parseFloat(l.emi_amount)) 
                                    : (l.deduction_months || 0);
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{l.employee_name}</td>
                                        <td style={{ padding: '1rem' }}>{formatCurrency(l.loan_amount)}</td>
                                        <td style={{ padding: '1rem', fontWeight: '750', color: '#EF4444' }}>-{formatCurrency(l.emi_amount)} / Month</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>{formatCurrency(l.remaining_balance)}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#15803D' }}>
                                            {tenureMonths > 0 ? `${tenureMonths} Months` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800',
                                                background: l.status === 'Repaid' ? '#DCFCE7' : '#EFF6FF',
                                                color: l.status === 'Repaid' ? '#15803D' : '#2563EB'
                                            }}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {loans.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                                        No active employee loans recorded. Click "Allocate Employee Loan" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* Tab 5: Salary Advances */}
            {activeTab === 'advances' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#92400E', margin: 0 }}>Disbursed Salary Advances</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Manage immediate emergency payouts and advances slated for recovery in upcoming payroll cycles.</p>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Advance Amount</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Disbursal Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Recovery Payroll Month</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Reason / Purpose</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryAdvances.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((a, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{a.employee_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#D97706' }}>{formatCurrency(a.advance_amount)}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{a.disbursal_date}</td>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#4B5563' }}>{a.recovery_month}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{a.reason}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800',
                                            background: a.status === 'Deducted' ? '#DCFCE7' : '#FEF3C7',
                                            color: a.status === 'Deducted' ? '#15803D' : '#B45309'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {salaryAdvances.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                                        No salary advances recorded. Click "Disburse Salary Advance" to disburse an advance.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
            </div>
            {/* Process Monthly Payroll Modal */}
            {isProcessModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Process Monthly Payroll</h3>
                            <button onClick={() => setIsProcessModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleProcessPayroll} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payroll Month</label>
                                    <select 
                                        required
                                        value={payForm.month} 
                                        onChange={(e) => setPayForm({ ...payForm, month: e.target.value })} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700' }}
                                    >
                                        {monthOptions.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Employee</label>
                                    <select 
                                        required
                                        value={payForm.employee_name} 
                                        onChange={(e) => {
                                            const selName = e.target.value;
                                            const sel = availableEmployees.find(s => s.name === selName);
                                            setPayForm({ 
                                                ...payForm, 
                                                employee_name: selName, 
                                                employee_id: sel ? sel.id : '',
                                                basic_salary: sel && sel.salary ? sel.salary : ''
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700' }}
                                    >
                                        <option value="">-- Staff Member --</option>
                                        {availableEmployees.map(s => (
                                            <option key={s.id} value={s.name}>{s.name} ({s.department || 'Staff'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Basic Base Salary ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 50000"
                                        value={payForm.basic_salary} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, basic_salary: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>HRA Allowance ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 5000"
                                        value={payForm.hra_amount} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, hra_amount: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Special Allowance</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 2000"
                                        value={payForm.special_allowance} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, special_allowance: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bonus / Incentives</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 3000"
                                        value={payForm.bonus_amount} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, bonus_amount: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Overtime Pay</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 1000"
                                        value={payForm.overtime_pay} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, overtime_pay: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={payForm.apply_pf} onChange={(e) => setPayForm({ ...payForm, apply_pf: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#7C3AED', cursor: 'pointer' }} />
                                        Deduct 12% PF
                                    </label>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.3rem' }}>
                                        {payForm.apply_pf ? `Est: ₹${Math.round((parseFloat(payForm.basic_salary) || 0) * 0.12)}` : 'PF Exempt'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={payForm.apply_tds} onChange={(e) => setPayForm({ ...payForm, apply_tds: e.target.checked, tds_deduction: e.target.checked ? (payForm.tds_deduction || Math.round((parseFloat(payForm.basic_salary) || 0) * 0.05)) : 0 })} style={{ width: '16px', height: '16px', accentColor: '#7C3AED', cursor: 'pointer' }} />
                                        Deduct TDS
                                    </label>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.3rem' }}>
                                        {payForm.apply_tds ? 'TDS Active' : 'No TDS Deduction'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>ESI Deduction</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 325"
                                        value={payForm.esi_deduction} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, esi_deduction: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Estimated TDS</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder={payForm.apply_tds ? "e.g. 100" : "TDS Exempt (0)"}
                                        disabled={!payForm.apply_tds}
                                        value={payForm.apply_tds ? payForm.tds_deduction : ''} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPayForm({ ...payForm, tds_deduction: val === '' ? '' : Math.max(0, parseFloat(val) || 0) });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', opacity: !payForm.apply_tds ? 0.6 : 1 }} 
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Monthly Take-Home Salary
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocate Employee Loan Modal */}
            {isLoanModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Grant Employee Loan</h3>
                            <button onClick={() => setIsLoanModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Name</label>
                                <select 
                                    required 
                                    value={loanForm.employee_name} 
                                    onChange={(e) => setLoanForm(prev => ({ ...prev, employee_name: e.target.value }))} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {availableEmployees.map(r => (
                                        <option key={r.id} value={r.name}>{r.name} ({r.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Loan Amount ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 2000"
                                        value={loanForm.loan_amount} 
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const amt = raw === '' ? '' : Math.max(0, parseFloat(raw) || 0);
                                            setLoanForm(prev => {
                                                const emi = parseFloat(prev.emi_amount);
                                                const loan = parseFloat(amt);
                                                const months = (loan > 0 && emi > 0) ? Math.ceil(loan / emi) : prev.deduction_months;
                                                return { ...prev, loan_amount: amt, deduction_months: months };
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Monthly EMI ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        onKeyDown={preventNegativeKeys}
                                        placeholder="e.g. 50"
                                        value={loanForm.emi_amount} 
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const emiStr = raw === '' ? '' : Math.max(0, parseFloat(raw) || 0);
                                            setLoanForm(prev => {
                                                const emi = parseFloat(emiStr);
                                                const loan = parseFloat(prev.loan_amount);
                                                const months = (loan > 0 && emi > 0) ? Math.ceil(loan / emi) : prev.deduction_months;
                                                return { ...prev, emi_amount: emiStr, deduction_months: months };
                                            });
                                        }} 
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            {/* Loan Deduction Period (Months) Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Loan Deduction Period (Months)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    onKeyDown={preventNegativeKeys}
                                    placeholder="e.g. 40"
                                    value={
                                        loanForm.deduction_months !== undefined && loanForm.deduction_months !== ''
                                            ? loanForm.deduction_months
                                            : ((parseFloat(loanForm.loan_amount) > 0 && parseFloat(loanForm.emi_amount) > 0)
                                                ? Math.ceil(parseFloat(loanForm.loan_amount) / parseFloat(loanForm.emi_amount))
                                                : '')
                                    }
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const val = raw === '' ? '' : Math.max(0, parseFloat(raw) || 0);
                                        const months = parseFloat(val);
                                        const loanAmt = parseFloat(loanForm.loan_amount);
                                        if (months > 0 && loanAmt > 0) {
                                            const emi = Math.round((loanAmt / months) * 100) / 100;
                                            setLoanForm(prev => ({ ...prev, emi_amount: String(emi), deduction_months: val }));
                                        } else {
                                            setLoanForm(prev => ({ ...prev, deduction_months: val }));
                                        }
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                                {parseFloat(loanForm.loan_amount) > 0 && parseFloat(loanForm.emi_amount) > 0 && (
                                    <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700', marginTop: '0.35rem', display: 'block' }}>
                                        {(() => {
                                            const loanAmt = parseFloat(loanForm.loan_amount);
                                            const emiAmt = parseFloat(loanForm.emi_amount);
                                            const months = Math.ceil(loanAmt / emiAmt);
                                            const fullMonths = Math.floor(loanAmt / emiAmt);
                                            const remainder = Math.round((loanAmt - (fullMonths * emiAmt)) * 100) / 100;
                                            if (remainder > 0) {
                                                return `🗓️ Deduction Period: ${fullMonths} cycles @ ${currency.symbol}${emiAmt} + final cycle @ ${currency.symbol}${remainder} (${months} Months total)`;
                                            } else {
                                                return `🗓️ Deduction Period: ${months} cycles @ ${currency.symbol}${emiAmt}/month (${months} Months total)`;
                                            }
                                        })()}
                                    </span>
                                )}
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)' }}>
                                Settle Granted Loan Allocation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Disburse Salary Advance Modal */}
            {isAdvanceModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(180, 83, 9, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                                    <Zap size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#92400E', margin: 0 }}>Disburse Salary Advance</h3>
                            </div>
                            <button onClick={() => setIsAdvanceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateAdvance} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Name</label>
                                <select 
                                    required 
                                    value={advanceForm.employee_name} 
                                    onChange={(e) => setAdvanceForm(prev => ({ ...prev, employee_name: e.target.value }))} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {availableEmployees.map(r => (
                                        <option key={r.id} value={r.name}>{r.name} ({r.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Advance Amount ({currency.symbol})</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    step="any"
                                    onKeyDown={preventNegativeKeys}
                                    placeholder="e.g. 5000"
                                    value={advanceForm.advance_amount} 
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const amt = raw === '' ? '' : Math.max(0, parseFloat(raw) || 0);
                                        setAdvanceForm(prev => ({ ...prev, advance_amount: amt }));
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '700' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Recovery Payroll Month</label>
                                <select 
                                    value={advanceForm.recovery_month} 
                                    onChange={(e) => setAdvanceForm(prev => ({ ...prev, recovery_month: e.target.value }))} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    <option value="Immediate (Next Payroll)">Immediate (Next Payroll)</option>
                                    {monthOptions.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason / Purpose (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Medical emergency, festival advance, urgent travel"
                                    value={advanceForm.reason} 
                                    onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.25)' }}>
                                Confirm Salary Advance Disbursal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

        {/* Payroll Detail / Payslip Modal */}
        {isDetailModalOpen && selectedPayroll && (() => {
            const rec = selectedPayroll;
            const gross = rec.basic_salary + rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay;
            const deductions = rec.pf_deduction + rec.esi_deduction + rec.tds_deduction + rec.professional_tax + rec.loan_deduction;
            const netPay = gross - deductions;
            return (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5', color: '#064E3B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>Payslip: {rec.payslip_number}</h3>
                                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: '600' }}>{rec.employee_name} · <span style={{ color: '#059669', fontWeight: '800' }}>{rec.payroll_month}</span></p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button 
                                    onClick={() => { setEditPayrollForm({ ...rec }); setIsEditingPayroll(true); }} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #E2E8F0', background: 'white', color: '#475569', padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                                >
                                    <Edit2 size={13} /> Edit
                                </button>
                                <button 
                                    onClick={async () => { if (await window.confirm('Delete this payroll record?')) deletePayrollMutation.mutate(rec.payroll_id); }} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none', background: '#FEF2F2', color: '#EF4444', padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                                <button 
                                    onClick={() => { setIsDetailModalOpen(false); setSelectedPayroll(null); }} 
                                    style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {isEditingPayroll ? (
                            <form onSubmit={(e) => { 
                                e.preventDefault(); 
                                const payload = {
                                    ...editPayrollForm,
                                    month: editPayrollForm.payroll_month,
                                    status: editPayrollForm.payroll_status,
                                    basic_salary: parseFloat(editPayrollForm.basic_salary) || 0,
                                    hra_amount: parseFloat(editPayrollForm.hra_amount) || 0,
                                    special_allowance: parseFloat(editPayrollForm.special_allowance) || 0,
                                    bonus_amount: parseFloat(editPayrollForm.bonus_amount) || 0,
                                    overtime_pay: parseFloat(editPayrollForm.overtime_pay) || 0,
                                    pf_deduction: parseFloat(editPayrollForm.pf_deduction) || 0,
                                    esi_deduction: parseFloat(editPayrollForm.esi_deduction) || 0,
                                    tds_deduction: parseFloat(editPayrollForm.tds_deduction) || 0,
                                    professional_tax: (editPayrollForm.professional_tax !== '' && editPayrollForm.professional_tax !== undefined) ? parseFloat(editPayrollForm.professional_tax) : 0,
                                    loan_deduction: parseFloat(editPayrollForm.loan_deduction) || 0
                                };
                                updatePayrollMutation.mutate({ id: editPayrollForm.payroll_id, data: payload }); 
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Payroll Month</label>
                                        <select 
                                            value={editPayrollForm.payroll_month || ''} 
                                            onChange={(e) => setEditPayrollForm(prev => ({ ...prev, payroll_month: e.target.value }))}
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '700', background: 'white' }}
                                        >
                                            {monthOptions.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Status</label>
                                        <select 
                                            value={(editPayrollForm.payroll_status || 'processed').toLowerCase()} 
                                            onChange={(e) => setEditPayrollForm(prev => ({ ...prev, payroll_status: e.target.value }))}
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '700', background: 'white' }}
                                        >
                                            <option value="processed">PROCESSED</option>
                                            <option value="paid">PAID</option>
                                        </select>
                                    </div>
                                    {[['basic_salary','Basic Salary'],['hra_amount','HRA'],['special_allowance','Special Allowance'],['bonus_amount','Bonus'],['overtime_pay','Overtime Pay'],['pf_deduction','PF Deduction'],['esi_deduction','ESI Deduction'],['tds_deduction','TDS Deduction'],['professional_tax','Professional Tax'],['loan_deduction','Loan Deduction']].map(([key, label]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>{label}</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="any"
                                                value={editPayrollForm[key] !== undefined && editPayrollForm[key] !== null ? editPayrollForm[key] : ''} 
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setEditPayrollForm(prev => ({ ...prev, [key]: v === '' ? '' : Math.max(0, parseFloat(v) || 0) }));
                                                }} 
                                                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setIsEditingPayroll(false)} style={{ border: '1px solid #E2E8F0', background: 'white', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '750', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={updatePayrollMutation.isPending} style={{ border: 'none', background: '#064E3B', color: 'white', padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                                        {updatePayrollMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Payslip Summary Card */}
                                <div style={{ background: '#F4FBF7', borderRadius: '20px', padding: '1.5rem', border: '1px solid #D1FAE5' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#047857', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>BANK DISBURSEMENT</p>
                                            <p style={{ fontWeight: '900', color: '#0F172A', margin: 0, fontSize: '0.95rem' }}>{rec.bank_name}</p>
                                            <p style={{ fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace', margin: 0, fontWeight: '600' }}>A/C: {rec.account_number}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#047857', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>COMPLIANCE PORTAL IDs</p>
                                            <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0F172A', margin: 0, fontWeight: '700' }}>PAN: {rec.pan_number}</p>
                                            <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#475569', margin: 0, fontWeight: '700' }}>UAN: {rec.uan_number}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', borderTop: '1px solid #D1FAE5', paddingTop: '1.1rem' }}>
                                        {[
                                            { label: 'Gross Earnings', value: formatCurrency(gross), color: '#15803d', bg: '#E8F5E9' },
                                            { label: 'Total Deductions', value: `-${formatCurrency(deductions)}`, color: '#DC2626', bg: '#FFEBEE' },
                                            { label: 'Net Take Home', value: formatCurrency(netPay), color: '#0369A1', bg: '#E0F7FA' }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ textAlign: 'center', background: item.bg, padding: '0.6rem 0.4rem', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{item.label}</p>
                                                <p style={{ fontSize: '1.15rem', fontWeight: '950', color: item.color, margin: 0, letterSpacing: '-0.02em' }}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Earnings / Deductions breakdown */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                                        <p style={{ fontWeight: '900', color: '#15803d', fontSize: '0.82rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <TrendingUp size={14} /> Earnings Breakdown
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            {[
                                                ['Basic Salary', rec.basic_salary],
                                                ['HRA Allowance', rec.hra_amount],
                                                ['Special Allowance', rec.special_allowance],
                                                ['Bonus / Incentive', rec.bonus_amount],
                                                ['Overtime Pay', rec.overtime_pay]
                                            ].map(([l, v]) => v > 0 && (
                                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px dashed #E2E8F0' }}>
                                                    <span style={{ color: '#475569', fontWeight: '600' }}>{l}</span>
                                                    <span style={{ fontWeight: '800', color: '#0F172A' }}>{formatCurrency(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ background: '#FEF2F2', borderRadius: '16px', padding: '1.25rem', border: '1px solid #FEE2E2' }}>
                                        <p style={{ fontWeight: '900', color: '#DC2626', fontSize: '0.82rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <AlertTriangle size={14} /> Deductions Breakdown
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            {[
                                                ['EPF (12%)', rec.pf_deduction],
                                                ['ESI', rec.esi_deduction],
                                                ['TDS Income Tax', rec.tds_deduction],
                                                ['Professional Tax', rec.professional_tax],
                                                ['Loan EMI', rec.loan_deduction]
                                            ].map(([l, v]) => v > 0 && (
                                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px dashed #FEE2E2' }}>
                                                    <span style={{ color: '#475569', fontWeight: '600' }}>{l}</span>
                                                    <span style={{ fontWeight: '800', color: '#DC2626' }}>-{formatCurrency(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* History Timeline */}
                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                                    <p style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.88rem', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <History size={15} style={{ color: '#64748B' }} /> Prior Months Ledger Payout Timeline
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {payrollRecords.filter(r => r.employee_name === rec.employee_name).map((hr, idx, arr) => {
                                            const hGross = hr.basic_salary + hr.hra_amount + hr.special_allowance + hr.bonus_amount;
                                            const hNet = hGross - hr.pf_deduction - hr.esi_deduction - hr.tds_deduction;
                                            return (
                                                <div key={hr.payroll_id} style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hr.payroll_status === 'paid' ? '#059669' : '#D97706', flexShrink: 0, marginTop: '5px' }} />
                                                        {idx < arr.length - 1 && <div style={{ width: '1.5px', flex: 1, background: '#E2E8F0', minHeight: '18px', marginTop: '4px' }} />}
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: '800', fontSize: '0.82rem', color: '#1E293B' }}>{hr.payroll_month}</p>
                                                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Ref: {hr.payslip_number}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.85rem' }}>{formatCurrency(hNet)}</span>
                                                            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: hr.payroll_status === 'paid' ? '#059669' : '#D97706' }}>{hr.payroll_status.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {payrollRecords.filter(r => r.employee_name === rec.employee_name).length === 0 && (
                                            <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>No prior history timeline found.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Download Payslip Button */}
                                <button
                                    onClick={() => {
                                        const htmlTemplate = `
                                            <html>
                                            <head>
                                                <title>Payslip - ${rec.employee_name}</title>
                                                <style>
                                                    body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 40px; background: #f9f9f9; }
                                                    .payslip-container { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 40px; border-top: 6px solid #059669; }
                                                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                                                    .company-info h1 { margin: 0; color: #059669; font-size: 28px; letter-spacing: -0.5px; }
                                                    .company-info p { margin: 4px 0 0; color: #666; font-size: 14px; }
                                                    .payslip-title h2 { margin: 0 0 5px 0; color: #111; font-size: 24px; text-align: right; text-transform: uppercase; letter-spacing: 1px; }
                                                    .payslip-title p { margin: 0; color: #777; text-align: right; font-size: 14px; }
                                                    .emp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #fdfdfd; padding: 20px; border-radius: 6px; border: 1px solid #f0f0f0; }
                                                    .emp-details div p { margin: 5px 0; font-size: 14px; }
                                                    .emp-details strong { display: inline-block; width: 120px; color: #555; }
                                                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                                    th { background: #f4fbf7; color: #047857; padding: 12px 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #d1fae5; }
                                                    td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; color: #444; }
                                                    .amount { text-align: right; font-family: monospace; font-size: 15px; }
                                                    .net-pay { background: #059669; color: white; padding: 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
                                                    .net-pay h3 { margin: 0; font-size: 18px; font-weight: normal; }
                                                    .net-pay h1 { margin: 0; font-size: 32px; font-family: monospace; }
                                                    .footer { text-align: center; margin-top: 40px; color: #888; font-size: 12px; padding-top: 20px; border-top: 1px dashed #ddd; }
                                                    @media print { body { background: #fff; padding: 0; } .payslip-container { box-shadow: none; padding: 0; border: none; } }
                                                </style>
                                            </head>
                                            <body onload="setTimeout(function() { window.print(); }, 500)">
                                                <div class="payslip-container">
                                                    <div class="header">
                                                        <div class="company-info">
                                                            <h1>CLIK Business</h1>
                                                            <p>123 Business Avenue, Tech Park</p>
                                                            <p>HQ Location</p>
                                                        </div>
                                                        <div class="payslip-title">
                                                            <h2>PAYSLIP</h2>
                                                            <p><strong>Month:</strong> ${rec.payroll_month}</p>
                                                            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                                                        </div>
                                                    </div>

                                                    <div class="emp-details">
                                                        <div>
                                                            <p><strong>Employee Name:</strong> <span style="color:#111; font-weight:bold;">${rec.employee_name}</span></p>
                                                            <p><strong>Employee ID:</strong> EMP-${rec.employee_id || '001'}</p>
                                                        </div>
                                                        <div>
                                                            <p><strong>Bank Name:</strong> ${rec.bank_name}</p>
                                                            <p><strong>Account A/C:</strong> ${rec.account_number}</p>
                                                            <p><strong>PAN Number:</strong> ${rec.pan_number}</p>
                                                            <p><strong>UAN Number:</strong> ${rec.uan_number}</p>
                                                        </div>
                                                    </div>

                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style="width: 50%;">Earnings</th>
                                                                <th class="amount" style="width: 50%;">Amount (INR)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${rec.basic_salary > 0 ? '<tr><td>Basic Salary</td><td class="amount">' + rec.basic_salary.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.hra_amount > 0 ? '<tr><td>HRA Allowance</td><td class="amount">' + rec.hra_amount.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.special_allowance > 0 ? '<tr><td>Special Allowance</td><td class="amount">' + rec.special_allowance.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.bonus_amount > 0 ? '<tr><td>Bonus / Incentives</td><td class="amount">' + rec.bonus_amount.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.overtime_pay > 0 ? '<tr><td>Overtime Pay</td><td class="amount">' + rec.overtime_pay.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            <tr style="background: #fafafa; font-weight: bold;">
                                                                <td>Total Gross Earnings</td>
                                                                <td class="amount">${gross.toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style="width: 50%; background: #fef2f2; color: #dc2626; border-bottom-color: #fecaca;">Deductions</th>
                                                                <th class="amount" style="width: 50%; background: #fef2f2; color: #dc2626; border-bottom-color: #fecaca;">Amount (INR)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${rec.pf_deduction > 0 ? '<tr><td>EPF (12%)</td><td class="amount">' + rec.pf_deduction.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.esi_deduction > 0 ? '<tr><td>ESI</td><td class="amount">' + rec.esi_deduction.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.tds_deduction > 0 ? '<tr><td>TDS Income Tax</td><td class="amount">' + rec.tds_deduction.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.professional_tax > 0 ? '<tr><td>Professional Tax</td><td class="amount">' + rec.professional_tax.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            ${rec.loan_deduction > 0 ? '<tr><td>Loan EMI</td><td class="amount">' + rec.loan_deduction.toLocaleString('en-IN') + '</td></tr>' : ''}
                                                            <tr style="background: #fafafa; font-weight: bold;">
                                                                <td>Total Deductions</td>
                                                                <td class="amount">${deductions.toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="net-pay">
                                                        <h3>Net Take Home Pay</h3>
                                                        <h1>INR ${netPay.toLocaleString('en-IN')}</h1>
                                                    </div>

                                                    <div class="footer">
                                                        <p>This is a system generated payslip and does not require a signature.</p>
                                                        <p>Generated by CLIK Business OS &bull; Ref: ${rec.payslip_number}</p>
                                                    </div>
                                                </div>
                                            </body>
                                            </html>
                                        `;
                                        const win = window.open('', '_blank');
                                        win.document.write(htmlTemplate);
                                        win.document.close();
                                    }}
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '850', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.15)' }}
                                >
                                    <Download size={16} /> Generate & Print Official Payslip (PDF)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        })()}
        </>)
};

export default BusinessPayroll;
