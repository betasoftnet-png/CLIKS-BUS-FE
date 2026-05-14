import React, { useState } from 'react';
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
    Percent,
    Lock
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../services/payrollService';
import { staffingService } from '../services/staffingService';



const BusinessPayroll = () => {
    const [activeTab, setActiveTab] = useState('run'); // 'run', 'structures', 'compliance', 'loans'
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

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

    // Process lists with fallbacks
    const payrollRecords = dbRecords.length > 0 ? dbRecords.map(rec => ({
        payroll_id: rec.id,
        employee_id: rec.employee_id || 'EMP-001',
        employee_name: rec.employee_name || 'Arun Kumar (Sales)',
        payroll_month: rec.month || 'May 2026',
        payroll_status: rec.status || 'processed',
        salary_type: rec.salary_type || 'Monthly',
        basic_salary: parseFloat(rec.basic_salary) || 30000,
        hra_amount: parseFloat(rec.hra_amount) || 5000,
        special_allowance: parseFloat(rec.special_allowance) || 2000,
        bonus_amount: parseFloat(rec.bonus_amount) || 0,
        overtime_pay: parseFloat(rec.overtime_pay) || 0,
        pf_deduction: parseFloat(rec.pf_deduction) || 1800,
        esi_deduction: parseFloat(rec.esi_deduction) || 325,
        tds_deduction: parseFloat(rec.tds_deduction) || 500,
        professional_tax: parseFloat(rec.professional_tax) || 200,
        loan_deduction: parseFloat(rec.loan_deduction) || 0,
        payable_days: parseInt(rec.payable_days) || 30,
        bank_name: rec.bank_name || 'HDFC Bank',
        account_number: rec.account_number || '50100223344551',
        payslip_number: rec.payslip_number || 'PSN-2026-091',
        pan_number: rec.pan_number || 'ABCDE1234F',
        uan_number: rec.uan_number || '100223344111',
        esi_number: rec.esi_number || '3122334455001'
    })) : [];

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
        basic_salary: 30000,
        hra_amount: 5000,
        special_allowance: 2000,
        bonus_amount: 0,
        tds_deduction: 500
    });

    const [loanForm, setLoanForm] = useState({
        employee_name: '',
        loan_amount: 10000,
        emi_amount: 1000,
        salary_advance: 0
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
            month: 'May 2026',
            status: 'processed',
            hra_amount: hra,
            special_allowance: spec,
            bonus_amount: bonus,
            pf_deduction: 1800,
            esi_deduction: 325,
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
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
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
                    { label: 'Monthly Salary Expense', value: `₹${totalSalaryExpense.toLocaleString()}`, icon: CreditCard, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Compliance PF / ESI', value: `₹${totalCompliance.toLocaleString()} Filed`, icon: ShieldCheck, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Outstanding Loans', value: `₹${totalLoanOutstanding.toLocaleString()}`, icon: Sliders, color: '#3B82F6', bg: '#EFF6FF' },
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
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Payslip Ref</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Taxable Base Salary</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Earnings (HRA/Bonus/OT)</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Deductions (PF/ESI/TDS)</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Net Take Home</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Bank Account</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((rec) => {
                                    const gross = rec.basic_salary + rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay;
                                    const deductions = rec.pf_deduction + rec.esi_deduction + rec.tds_deduction + rec.professional_tax + rec.loan_deduction;
                                    const netPay = gross - deductions;

                                    return (
                                        <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{rec.payslip_number}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Month: {rec.payroll_month}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{rec.employee_name}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>₹{rec.basic_salary.toLocaleString()}</td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#1B6B3A' }}>
                                                ₹{(rec.hra_amount + rec.special_allowance + rec.bonus_amount + rec.overtime_pay).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#EF4444' }}>
                                                -₹{deductions.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>₹{netPay.toLocaleString()}</td>
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
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
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
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                            {payrollRecords.map((rec) => (
                                <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{rec.employee_name}</td>
                                    <td style={{ padding: '1rem' }}>₹{rec.basic_salary.toLocaleString()} / Month</td>
                                    <td style={{ padding: '1rem', color: '#1B6B3A', fontWeight: '700' }}>₹{rec.hra_amount.toLocaleString()} / Month</td>
                                    <td style={{ padding: '1rem' }}>₹{rec.special_allowance.toLocaleString()} / Month</td>
                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>₹{((rec.basic_salary + rec.hra_amount + rec.special_allowance) * 12).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Compliance EPF/ESI */}
            {activeTab === 'compliance' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Statutory EPF, ESI, PAN Compliance Identifiers</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                            {payrollRecords.map((rec) => (
                                <tr key={rec.payroll_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{rec.employee_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', fontFamily: 'monospace' }}>{rec.pan_number}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{rec.uan_number || 'N/A'}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{rec.esi_number || 'N/A'}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>₹{rec.pf_deduction.toLocaleString()} (Auto EPF 12%)</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 4: Loans & Salary Advances */}
            {activeTab === 'loans' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Active Loans & Salary Advance Balances</h3>
                        <button onClick={() => setIsLoanModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Grant Employee Loan</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                            {loans.map((l, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{l.employee_name}</td>
                                    <td style={{ padding: '1rem' }}>₹{l.loan_amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#EF4444' }}>-₹{l.emi_amount.toLocaleString()} / Month</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>₹{l.remaining_balance.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>₹{l.salary_advance.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.name}>{s.name} ({s.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Basic Base Salary (INR)</label>
                                    <input required type="number" value={payForm.basic_salary} onChange={(e) => setPayForm({ ...payForm, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>HRA Allowance (INR)</label>
                                    <input required type="number" value={payForm.hra_amount} onChange={(e) => setPayForm({ ...payForm, hra_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Special Allowance</label>
                                    <input required type="number" value={payForm.special_allowance} onChange={(e) => setPayForm({ ...payForm, special_allowance: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bonus / Incentives</label>
                                    <input required type="number" value={payForm.bonus_amount} onChange={(e) => setPayForm({ ...payForm, bonus_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Estimated TDS Income Tax Deduction</label>
                                <input required type="number" value={payForm.tds_deduction} onChange={(e) => setPayForm({ ...payForm, tds_deduction: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
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
                                    {payrollRecords.map(r => (
                                        <option key={r.payroll_id} value={r.employee_name}>{r.employee_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Loan Amount (INR)</label>
                                    <input required type="number" value={loanForm.loan_amount} onChange={(e) => setLoanForm({ ...loanForm, loan_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Monthly EMI</label>
                                    <input required type="number" value={loanForm.emi_amount} onChange={(e) => setLoanForm({ ...loanForm, emi_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Immediate Salary Advance (INR)</label>
                                <input required type="number" value={loanForm.salary_advance} onChange={(e) => setLoanForm({ ...loanForm, salary_advance: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Granted Loan Allocation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPayroll;
