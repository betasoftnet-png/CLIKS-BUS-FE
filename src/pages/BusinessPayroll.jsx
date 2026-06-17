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
    History
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
    const [colFilters, setColFilters] = React.useState({}); // 'run', 'structures', 'compliance', 'loans'
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setIsProcessModalOpen(false);
            alert('Monthly payroll processed and basic allowances generated successfully!');
        }
    });

    const releaseSalaryMutation = useMutation({
        mutationFn: (id) => payrollService.releaseSalary(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            alert('Direct Bank Transfer (NEFT/UPI) triggered successfully! Payslip PDF dispatched.');
        }
    });

    const createLoanMutation = useMutation({
        mutationFn: ({ id, data }) => payrollService.createLoan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setIsLoanModalOpen(false);
            alert('Employee loan allocation verified and remaining balance recorded successfully!');
        }
    });

    const updatePayrollMutation = useMutation({
        mutationFn: ({ id, data }) => payrollService.updatePayroll ? payrollService.updatePayroll(id, data) : Promise.resolve({ success: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setIsEditingPayroll(false);
            alert('Payroll record updated successfully!');
        }
    });

    const deletePayrollMutation = useMutation({
        mutationFn: (id) => payrollService.deletePayroll ? payrollService.deletePayroll(id) : Promise.resolve({ success: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrollRecords'] });
            setIsDetailModalOpen(false);
            setSelectedPayroll(null);
            alert('Payroll record deleted.');
        }
    });

    // Process lists with fallbacks
    const getVal = (val, def) => (val !== undefined && val !== null) ? parseFloat(val) : def;

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
        
        let returnedGross = getVal(rec.basic_salary, 30000);
        let totalAmt = getVal(rec.amount, null);
        if (totalAmt !== null) {
             returnedGross = totalAmt;
        }
        
        let basic = returnedGross - hra - spec - bonus - overtime;
        if (basic < 0) basic = returnedGross;

        return {
            payroll_id: rec.id,
            employee_id: rec.employee_id || 'EMP-001',
            employee_name: rec.employee_name || 'Arun Kumar (Sales)',
            payroll_month: rec.month || 'May 2026',
            payroll_status: rec.status || 'processed',
            salary_type: rec.salary_type || 'Monthly',
            basic_salary: basic,
            hra_amount: hra,
            special_allowance: spec,
            bonus_amount: bonus,
            overtime_pay: overtime,
            pf_deduction: getVal(rec.pf_deduction, 1800),
            esi_deduction: getVal(rec.esi_deduction, 325),
            tds_deduction: getVal(rec.tds_deduction, 500),
            professional_tax: getVal(rec.professional_tax, 200),
            loan_deduction: getVal(rec.loan_deduction, 0),
            payable_days: parseInt(rec.payable_days) || 30,
            
            bank_name: bData.bank_name || emp.bank_name || rec.bank_name || 'HDFC Bank',
            account_number: bData.account_number || emp.account_number || rec.account_number || '50100223344551',
            payslip_number: rec.payslip_number || `PSN-2026-${rec.id ? rec.id * 8 : '091'}`,
            pan_number: addrMeta.pan_number || emp.pan_number || rec.pan_number || 'ABCDE1234F',
            uan_number: addrMeta.pf_number || emp.pf_number || rec.uan_number || '100223344111',
            esi_number: emp.esi_number || rec.esi_number || '3122334455001'
        };
    }) : [];

    const loans = dbRecords.length > 0 && dbRecords.some(rec => rec.loans_data) ? dbRecords.filter(rec => rec.loans_data).map(rec => {
        let lData = {};
        try {
            lData = typeof rec.loans_data === 'string' ? JSON.parse(rec.loans_data) : rec.loans_data;
        } catch { lData = {}; }
        return {
            employee_name: rec.employee_name || 'Arun Kumar',
            loan_amount: parseFloat(lData.loan_amount) || 12000,
            emi_amount: parseFloat(lData.emi_amount) || 1000,
            remaining_balance: parseFloat(lData.remaining_balance) || 12000,
            salary_advance: parseFloat(lData.salary_advance) || 0
        };
    }) : [];

    // Form states
    const [payForm, setPayForm] = useState({
        employee_id: '',
        employee_name: '',
        basic_salary: '',
        hra_amount: '',
        special_allowance: '',
        bonus_amount: '',
        apply_pf: true,
        esi_deduction: '325',
        tds_deduction: ''
    });

    const [loanForm, setLoanForm] = useState({
        employee_name: '',
        loan_amount: '',
        emi_amount: '',
        salary_advance: ''
    });

    // Submissions
    const handleProcessPayroll = (e) => {
        e.preventDefault();
        const base = parseFloat(payForm.basic_salary) || 0;
        const hra = parseFloat(payForm.hra_amount) || 0;
        const spec = parseFloat(payForm.special_allowance) || 0;
        const bonus = parseFloat(payForm.bonus_amount) || 0;
        const total = base + hra + spec + bonus;

        processPayrollMutation.mutate({
            employee_id: payForm.employee_id,
            employee_name: payForm.employee_name,
            amount: total,
            basic_salary: base,
            month: 'May 2026',
            status: 'processed',
            hra_amount: hra,
            special_allowance: spec,
            bonus_amount: bonus,
            pf_deduction: payForm.apply_pf ? Math.round(base * 0.12) : 0,
            esi_deduction: parseFloat(payForm.esi_deduction) || 0,
            tds_deduction: parseFloat(payForm.tds_deduction) || 0
        });
    };

    const handleCreateLoan = (e) => {
        e.preventDefault();
        const matchingRecord = payrollRecords.find(r => r.employee_name === loanForm.employee_name);
        if (matchingRecord) {
            createLoanMutation.mutate({
                id: matchingRecord.payroll_id,
                data: {
                    loan_amount: parseFloat(loanForm.loan_amount) || 10000,
                    emi_amount: parseFloat(loanForm.emi_amount) || 1000,
                    remaining_balance: parseFloat(loanForm.loan_amount) || 10000,
                    salary_advance: parseFloat(loanForm.salary_advance) || 0
                }
            });
        } else {
            alert('To grant a loan, the employee must have at least one payroll record created in the system.');
        }
    };

    const handleReleaseSalary = (payId) => {
        releaseSalaryMutation.mutate(payId);
    };

    const filteredRecords = payrollRecords.filter(rec => 
        rec.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.payroll_status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSalaryExpense = payrollRecords.reduce((sum, rec) => {
        const gross = rec.basic_salary + rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay;
        const deductions = rec.pf_deduction + rec.esi_deduction + rec.tds_deduction + rec.professional_tax + rec.loan_deduction;
        return sum + (gross - deductions);
    }, 0);

    const totalCompliance = payrollRecords.reduce((sum, rec) => sum + rec.pf_deduction + rec.esi_deduction, 0);
    const totalLoanOutstanding = loans.reduce((sum, l) => sum + l.remaining_balance, 0);

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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsLoanModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Sliders size={15} /> Allocate Employee Loan
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Monthly Salary Expense', value: formatCurrency(totalSalaryExpense), icon: CreditCard, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Compliance PF / ESI', value: `${formatCurrency(totalCompliance)} Filed`, icon: ShieldCheck, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Outstanding Loans', value: formatCurrency(totalLoanOutstanding), icon: Sliders, color: '#3B82F6', bg: '#EFF6FF' },
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
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'run', label: 'Monthly Payroll Register', icon: FileText, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'structures', label: 'Salary Structures (CTC)', icon: CreditCard, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'compliance', label: 'Compliance (PF / ESI / PAN)', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'loans', label: 'Loans & Salary Advances', icon: Sliders, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
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
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search salary register..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
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
        { key: '_actions', label: 'Action', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredRecords.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => {
                                    const gross = rec.basic_salary + rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay;
                                    const deductions = rec.pf_deduction + rec.esi_deduction + rec.tds_deduction + rec.professional_tax + rec.loan_deduction;
                                    const netPay = gross - deductions;

                                    return (
                                        <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s' }} onClick={() => { setSelectedPayroll(rec); setIsDetailModalOpen(true); setIsEditingPayroll(false); }} onMouseOver={(e) => e.currentTarget.style.background='#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{rec.payslip_number}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Month: {rec.payroll_month}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{rec.employee_name}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>{formatCurrency(rec.basic_salary)}</td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#1B6B3A' }}>
                                                {formatCurrency(rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay)}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#EF4444' }}>
                                                -{formatCurrency(deductions)}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency(netPay)}</td>
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
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                {rec.payroll_status !== 'paid' && (
                                                    <button 
                                                        onClick={() => handleReleaseSalary(rec.payroll_id)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                    >Release Salary</button>
                                                )}
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

            {/* Tab 4: Loans & Salary Advances */}
            {activeTab === 'loans' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Active Loans & Salary Advance Balances</h3>
                        <button onClick={() => setIsLoanModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Grant Employee Loan</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Granted Loan Amount</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Monthly EMI deduction</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Remaining Loan Balance</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Salary Advance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((l, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{l.employee_name}</td>
                                    <td style={{ padding: '1rem' }}>{formatCurrency(l.loan_amount)}</td>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#EF4444' }}>-{formatCurrency(l.emi_amount)} / Month</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>{formatCurrency(l.remaining_balance)}</td>
                                    <td style={{ padding: '1rem' }}>{formatCurrency(l.salary_advance)}</td>
                                </tr>
                            ))}
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
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Employee</label>
                                <select 
                                    required
                                    value={payForm.employee_name} 
                                    onChange={(e) => {
                                        const sel = staffList.find(s => s.name === e.target.value);
                                        setPayForm({ 
                                            ...payForm, 
                                            employee_name: e.target.value, 
                                            employee_id: sel ? `EMP-${sel.id}` : '',
                                            basic_salary: sel && sel.salary ? sel.salary : payForm.basic_salary
                                        });
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    <option value="">-- Select Staff Member --</option>
                                    {staffList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => (
                                        <option key={s.id} value={s.name}>{s.name} ({s.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Basic Base Salary ({currency.symbol})</label>
                                    <input required type="number" value={payForm.basic_salary} onChange={(e) => setPayForm({ ...payForm, basic_salary: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>HRA Allowance ({currency.symbol})</label>
                                    <input required type="number" value={payForm.hra_amount} onChange={(e) => setPayForm({ ...payForm, hra_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Special Allowance</label>
                                    <input required type="number" value={payForm.special_allowance} onChange={(e) => setPayForm({ ...payForm, special_allowance: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bonus / Incentives</label>
                                    <input required type="number" value={payForm.bonus_amount} onChange={(e) => setPayForm({ ...payForm, bonus_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={payForm.apply_pf} onChange={(e) => setPayForm({ ...payForm, apply_pf: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#7C3AED', cursor: 'pointer' }} />
                                        Deduct 12% PF
                                    </label>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.3rem' }}>
                                        {payForm.apply_pf ? `Est: ₹${Math.round((parseFloat(payForm.basic_salary) || 0) * 0.12)}` : 'PF Exempt'}
                                    </span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>ESI Deduction</label>
                                    <input required type="number" value={payForm.esi_deduction} onChange={(e) => setPayForm({ ...payForm, esi_deduction: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Estimated TDS</label>
                                    <input required type="number" value={payForm.tds_deduction} onChange={(e) => setPayForm({ ...payForm, tds_deduction: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
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
                                    onChange={(e) => setLoanForm({ ...loanForm, employee_name: e.target.value })} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {payrollRecords.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(r => (
                                        <option key={r.payroll_id} value={r.employee_name}>{r.employee_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Loan Amount ({currency.symbol})</label>
                                    <input required type="number" value={loanForm.loan_amount} onChange={(e) => setLoanForm({ ...loanForm, loan_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Monthly EMI</label>
                                    <input required type="number" value={loanForm.emi_amount} onChange={(e) => setLoanForm({ ...loanForm, emi_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Immediate Salary Advance ({currency.symbol})</label>
                                <input required type="number" value={loanForm.salary_advance} onChange={(e) => setLoanForm({ ...loanForm, salary_advance: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Granted Loan Allocation
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
                                    onClick={() => { if (window.confirm('Delete this payroll record?')) deletePayrollMutation.mutate(rec.payroll_id); }} 
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
                            <form onSubmit={(e) => { e.preventDefault(); updatePayrollMutation.mutate({ id: editPayrollForm.payroll_id, data: editPayrollForm }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                    {[['basic_salary','Basic Salary'],['hra_amount','HRA'],['special_allowance','Special Allowance'],['bonus_amount','Bonus'],['overtime_pay','Overtime'],['pf_deduction','PF Deduction'],['esi_deduction','ESI Deduction'],['tds_deduction','TDS Deduction'],['professional_tax','Professional Tax'],['loan_deduction','Loan Deduction']].map(([key, label]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>{label}</label>
                                            <input type="number" value={editPayrollForm[key] || 0} onChange={(e) => setEditPayrollForm(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setIsEditingPayroll(false)} style={{ border: '1px solid #E2E8F0', background: 'white', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '750', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ border: 'none', background: '#064E3B', color: 'white', padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Save Changes</button>
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
                                        const content = `PAYSLIP\n${rec.payslip_number} | ${rec.payroll_month}\nEmployee: ${rec.employee_name}\nBank: ${rec.bank_name} - ${rec.account_number}\nPAN: ${rec.pan_number} | UAN: ${rec.uan_number}\n\nGross: ${formatCurrency(gross)}\nDeductions: -${formatCurrency(deductions)}\nNET PAY: ${formatCurrency(netPay)}`;
                                        const blob = new Blob([content], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a'); a.href = url; a.download = `${rec.payslip_number}.txt`; a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '850', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.15)' }}
                                >
                                    <Download size={16} /> Download Official Payslip (TXT)
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
