import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Briefcase,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Calendar,
    Plus,
    CreditCard,
    ShieldCheck,
    Building2,
    User,
    Edit2,
    Trash2,
    FileText,
    Percent,
    Award,
    Heart,
    MapPin,
    Lock
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { staffingService } from '../services/staffingService';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';

const INITIAL_EMPLOYEES = [
    {
        employee_id: 'EMP-2026-001',
        employee_code: 'CLK-001',
        employee_status: 'active',
        joining_date: '2026-01-10',
        first_name: 'Arun',
        last_name: 'Kumar',
        gender: 'Male',
        date_of_birth: '1994-08-15',
        blood_group: 'O+',
        phone_number: '+91 98765 43210',
        email: 'arun.kumar@clikbusiness.com',
        emergency_contact_name: 'Vijay Kumar (Father)',
        emergency_contact_number: '+91 98765 99911',
        address_line_1: 'Plot No. 12, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        department_name: 'Sales',
        designation_name: 'Sales Executive',
        reporting_manager: 'Ankit Sharma (Sales Lead)',
        employment_type: 'Full-time',
        salary_type: 'Monthly',
        basic_salary: 35000,
        bank_name: 'HDFC Bank',
        account_number: '50100223344551',
        ifsc_code: 'HDFC0000124',
        pf_number: 'MH/BAN/0011223/001',
        pan_number: 'ABCDE1234F',
        aadhaar_file: 'aadhaar_arun.pdf',
        pan_file: 'pan_arun.pdf',
        shift_name: 'General Shift (9 AM - 6 PM)',
        leave_balance: 14,
        performance_rating: 4.5,
        target_score: 92,
        role_name: 'Sales Personnel'
    },
    {
        employee_id: 'EMP-2026-002',
        employee_code: 'CLK-002',
        employee_status: 'active',
        joining_date: '2026-02-01',
        first_name: 'Priyanka',
        last_name: 'Sharma',
        gender: 'Female',
        date_of_birth: '1996-11-20',
        blood_group: 'A+',
        phone_number: '+91 99887 76655',
        email: 'priyanka.s@clikbusiness.com',
        emergency_contact_name: 'Karan Sharma (Spouse)',
        emergency_contact_number: '+91 99887 00011',
        address_line_1: 'Apt 4B, Beverly Hills',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        department_name: 'HR',
        designation_name: 'HR Specialist',
        reporting_manager: 'CEO Office',
        employment_type: 'Full-time',
        salary_type: 'Monthly',
        basic_salary: 42000,
        bank_name: 'ICICI Bank',
        account_number: '001205566778',
        ifsc_code: 'ICIC0000012',
        pf_number: 'MH/BAN/0011223/002',
        pan_number: 'PQRTS9876M',
        aadhaar_file: 'aadhaar_priyanka.pdf',
        pan_file: 'pan_priyanka.pdf',
        shift_name: 'General Shift (9 AM - 6 PM)',
        leave_balance: 16,
        performance_rating: 4.8,
        target_score: 96,
        role_name: 'HR Manager'
    }
];

const BusinessStaffing = () => {
    const [activeTab, setActiveTab] = useState('profiles');
    const [colFilters, setColFilters] = React.useState({}); // 'profiles', 'employment', 'payroll', 'leaves', 'performance'
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);

    // Trigger instant onboarding flow from dashboard shortcuts
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsOnboardModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const queryClient = useQueryClient();

    // Query for Live Employees from staff database
    const { data: dbEmployees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => staffingService.getEmployees()
    });

    const createEmpMutation = useMutation({
        mutationFn: (data) => staffingService.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee onboarding sequence completed! Welcome package circular emailed.');
            setIsOnboardModalOpen(false);
        }
    });

    const deleteEmpMutation = useMutation({
        mutationFn: (id) => staffingService.deleteEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee profile marked inactive and deboarded.');
        }
    });

    const performanceMutation = useMutation({
        mutationFn: ({ id, rating, target_score }) => staffingService.updatePerformance(id, rating, target_score),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee appraisal target score & performance ratings locked successfully!');
            setIsPerformanceModalOpen(false);
        }
    });

    // Safe fallbacks to keep UI beautiful even when DB is empty
    const employees = dbEmployees.length > 0 ? dbEmployees.map(e => ({
        employee_id: e.id,
        employee_code: `CLK-00${e.id}`,
        employee_status: e.status || 'active',
        joining_date: e.hire_date || '2026-05-08',
        first_name: e.name ? e.name.split(' ')[0] : 'Karan',
        last_name: e.name && e.name.split(' ').length > 1 ? e.name.split(' ')[1] : 'Mehra',
        gender: e.gender || 'Male',
        date_of_birth: e.date_of_birth || '1995-05-10',
        blood_group: e.blood_group || 'O+',
        phone_number: e.phone || '+91 91111 22222',
        email: e.email || 'karan.mehra@clikbusiness.com',
        emergency_contact_name: e.emergency_contact ? (JSON.parse(e.emergency_contact || '{}').name || 'Suresh Mehra') : 'Suresh Mehra (Father)',
        emergency_contact_number: e.emergency_contact ? (JSON.parse(e.emergency_contact || '{}').phone || '+91 91111 00000') : '+91 91111 00000',
        address_line_1: e.address ? (JSON.parse(e.address || '{}').line1 || 'Plot 102, Anna Nagar') : 'Plot 102, Anna Nagar',
        city: e.city || 'Chennai',
        state: e.state || 'Tamil Nadu',
        pincode: e.pincode || '600040',
        department_name: e.department || 'Operations',
        designation_name: e.designation || 'Inventory Associate',
        reporting_manager: e.reporting_manager || 'Ankit Sharma (Sales Lead)',
        employment_type: e.employment_type || 'Full-time',
        salary_type: e.salary_type || 'Monthly',
        basic_salary: e.salary || 35000,
        bank_name: e.bank_details ? (JSON.parse(e.bank_details || '{}').bank_name || 'HDFC Bank') : 'HDFC Bank',
        account_number: e.bank_details ? (JSON.parse(e.bank_details || '{}').account_number || '50100223344551') : '50100223344551',
        ifsc_code: e.bank_details ? (JSON.parse(e.bank_details || '{}').ifsc_code || 'HDFC0000124') : 'HDFC0000124',
        pf_number: e.pf_number || 'MH/BAN/0011223/001',
        pan_number: e.pan_number || 'ABCDE1234F',
        aadhaar_file: 'aadhaar_arun.pdf',
        pan_file: 'pan_arun.pdf',
        shift_name: e.shift ? (JSON.parse(e.shift || '{}').shift || 'General Shift (9 AM - 6 PM)') : 'General Shift (9 AM - 6 PM)',
        leave_balance: e.leave_balance || 14,
        performance_rating: e.performance_rating || 4.5,
        target_score: e.target_score || 92,
        role_name: e.role || 'Staff Personnel'
    })) : [];

    // Form onboarding states
    const [newEmp, setNewEmp] = useState({
        first_name: 'Karan',
        last_name: 'Mehra',
        gender: 'Male',
        phone_number: '+91 91111 22222',
        email: 'karan.mehra@clikbusiness.com',
        department_name: 'Operations',
        designation_name: 'Inventory Associate',
        basic_salary: 28000,
        bank_name: 'State Bank of India',
        account_number: '31029312022',
        ifsc_code: 'SBIN0001104',
        shift_name: 'General Shift (9 AM - 6 PM)',
        leave_balance: 12
    });

    // Form performance review states
    const [perfForm, setPerfForm] = useState({
        employee_id: 'EMP-2026-001',
        rating: 4.8,
        target_score: 94
    });

    // Handle employee onboarding submit
    const handleOnboardSubmit = (e) => {
        e.preventDefault();
        createEmpMutation.mutate({
            name: `${newEmp.first_name} ${newEmp.last_name}`,
            role: 'Staff',
            email: newEmp.email,
            phone: newEmp.phone_number,
            salary: parseFloat(newEmp.basic_salary) || 25000,
            status: 'active',
            hire_date: new Date().toISOString().split('T')[0],
            department: newEmp.department_name,
            designation: newEmp.designation_name,
            bank_details: {
                bank_name: newEmp.bank_name,
                account_number: newEmp.account_number,
                ifsc_code: newEmp.ifsc_code
            }
        });
    };

    // Handle performance review submit
    const handlePerformanceSubmit = (e) => {
        e.preventDefault();
        const empToUpdate = employees.find(emp => emp.employee_id === perfForm.employee_id);
        if (empToUpdate) {
            performanceMutation.mutate({
                id: empToUpdate.employee_id,
                rating: parseFloat(perfForm.rating) || 4.0,
                target_score: parseInt(perfForm.target_score) || 85
            });
        }
    };

    const handleDeleteEmployee = async (empId) => {
        if (await customConfirm('Are you sure you want to terminate/deboard this employee profile?')) {
            deleteEmpMutation.mutate(empId);
        }
    };

    const filteredEmployees = employees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalHeadcount = employees.length;
    const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + emp.basic_salary, 0);
    const averageRating = (employees.reduce((sum, emp) => sum + emp.performance_rating, 0) / headcountSafe(totalHeadcount)).toFixed(1);

    function headcountSafe(h) {
        return h > 0 ? h : 1;
    }

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Users size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>HR Staff & Employees Database</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage whole workforce life cycle: Central Profiles database, Employment designations, Payroll PF/ESI bank accounts, Leaves, Shifts, and Performance ratings.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsPerformanceModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Award size={15} /> File Appraisal Review
                    </button>
                    <button 
                        onClick={() => setIsOnboardModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <UserPlus size={15} /> Onboard Staff Employee
                    </button>
                </div>
            </div>

            {/* Workforce Performance Metrics Grid */}
            {/* Modern Staffing Left-Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Active Headcount', value: `${totalHeadcount} Employees`, icon: Users, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Monthly Basic Payroll', value: `₹${totalMonthlyPayroll.toLocaleString()}`, icon: CreditCard, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Workforce Performance', value: `${averageRating} / 5.0 Rating`, icon: Award, color: '#8B5CF6', bg: '#F5F3FF' },
                    { label: 'Assigned Shifts', value: 'General (9AM - 6PM)', icon: Clock, color: '#10B981', bg: '#ECFDF5' }
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
                    { id: 'profiles', label: 'Employee Profiles', icon: User, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'employment', label: 'Hierarchy & Employment', icon: Building2, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'payroll', label: 'Payroll & Bank Details', icon: CreditCard, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'leaves', label: 'Leaves & Shifts Rosters', icon: Calendar, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' },
                    { id: 'performance', label: 'Performance Appraisals', icon: Award, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' }
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

            {/* Tab 1: Employee Profiles */}
            {activeTab === 'profiles' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search employees by name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'name', label: 'Employee Profile', placeholder: 'Name' },
        { key: 'employee_id', label: 'ID / Code', placeholder: 'EMP-' },
        { key: 'contact', label: 'Contact Info', placeholder: 'Phone/Email' },
        { key: 'emergency', label: 'Emergency Person', placeholder: 'Name' },
        { key: 'personal', label: 'Personal Info', placeholder: 'DOB' },
        { key: 'location', label: 'Work Location', placeholder: 'City' },
        { key: '_actions', label: 'Action', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredEmployees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                    <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                                    {emp.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '800', color: '#1E293B' }}>{emp.first_name} {emp.last_name}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Joined: {emp.joining_date}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#064E3B' }}>{emp.employee_code}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{emp.phone_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{emp.email}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{emp.emergency_contact_name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{emp.emergency_contact_number}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{emp.date_of_birth} ({emp.gender})</p>
                                            <span style={{ fontSize: '0.8rem', color: '#E11D48', fontWeight: '800' }}>Blood group: {emp.blood_group}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{emp.address_line_1}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{emp.city}, {emp.state} ({emp.pincode})</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleDeleteEmployee(emp.employee_id)}
                                                style={{ border: 'none', background: '#FEF2F2', padding: '0.5rem', borderRadius: '10px', color: '#EF4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Hierarchy & Employment */}
            {activeTab === 'employment' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Organizational Structure & Hierarchy</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Department</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Designation Roles</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Reporting Manager</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employment Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1B6B3A' }}>{emp.department_name}</td>
                                    <td style={{ padding: '1rem' }}>{emp.designation_name}</td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontWeight: '600' }}>{emp.reporting_manager}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{emp.employment_type.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Payroll & Bank Details */}
            {activeTab === 'payroll' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Workforce Payroll Structure & Bank Details</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Salary Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Basic Monthly Salary</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Bank Name & Account</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>IFSC Code</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>PF Number</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>PAN Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                    <td style={{ padding: '1rem' }}>{emp.salary_type}</td>
                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>₹{emp.basic_salary.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <p style={{ fontWeight: '700' }}>{emp.bank_name}</p>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>A/c: {emp.account_number}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{emp.ifsc_code}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{emp.pf_number || 'N/A'}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{emp.pan_number}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 4: Leaves & Shifts Rosters */}
            {activeTab === 'leaves' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Leaves Balance & assigned Roster Shifts</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Assigned Work Shift</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Annual Leave Balance</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Weekly Holiday</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1B6B3A' }}>{emp.shift_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#E11D48' }}>{emp.leave_balance} Days Left</td>
                                    <td style={{ padding: '1rem' }}>Sunday Off</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 5: Performance Appraisals */}
            {activeTab === 'performance' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Personnel Appraisal & Rating scorecard</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Performance Rating</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>KPI Targets Score</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Appraisal Target Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#F59E0B' }}>⭐ {emp.performance_rating} / 5.0</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '120px', height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                <div style={{ width: `${emp.target_score}%`, height: '100%', background: 'linear-gradient(90deg, #1B6B3A 0%, #10B981 100%)' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{emp.target_score}% Achieve</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>1st October 2026</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </div>
            {/* Employee Onboarding Modal */}
            {isOnboardModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Onboard Staff Employee</h3>
                            <button onClick={() => setIsOnboardModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>First Name</label>
                                    <input required type="text" value={newEmp.first_name} onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Last Name</label>
                                    <input required type="text" value={newEmp.last_name} onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Phone Number</label>
                                    <input required type="text" value={newEmp.phone_number} onChange={(e) => setNewEmp({ ...newEmp, phone_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Corporate Email</label>
                                    <input required type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Department</label>
                                    <select value={newEmp.department_name} onChange={(e) => setNewEmp({ ...newEmp, department_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Sales</option>
                                        <option>HR</option>
                                        <option>Operations</option>
                                        <option>Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Designation Title</label>
                                    <input required type="text" value={newEmp.designation_name} onChange={(e) => setNewEmp({ ...newEmp, designation_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Inventory Manager" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Monthly Basic Salary (INR)</label>
                                    <input required type="number" value={newEmp.basic_salary} onChange={(e) => setNewEmp({ ...newEmp, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bank Name</label>
                                    <input required type="text" value={newEmp.bank_name} onChange={(e) => setNewEmp({ ...newEmp, bank_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bank Account No</label>
                                    <input required type="text" value={newEmp.account_number} onChange={(e) => setNewEmp({ ...newEmp, account_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Bank IFSC Code</label>
                                    <input required type="text" value={newEmp.ifsc_code} onChange={(e) => setNewEmp({ ...newEmp, ifsc_code: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Onboarding sequence
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Performance Review Modal */}
            {isPerformanceModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>File Performance Review</h3>
                            <button onClick={() => setIsPerformanceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handlePerformanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Employee</label>
                                <select value={perfForm.employee_id} onChange={(e) => setPerfForm({ ...perfForm, employee_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Appraisal Rating (1.0 - 5.0)</label>
                                    <input required type="number" step="0.1" max="5" min="1" value={perfForm.rating} onChange={(e) => setPerfForm({ ...perfForm, rating: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>KPI Target Score %</label>
                                    <input required type="number" max="100" min="0" value={perfForm.target_score} onChange={(e) => setPerfForm({ ...perfForm, target_score: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Appraisal Score
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessStaffing;
