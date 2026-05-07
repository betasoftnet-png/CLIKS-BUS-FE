import React, { useState } from 'react';
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

const BusinessStaffing = () => {
    const [activeTab, setActiveTab] = useState('profiles'); // 'profiles', 'employment', 'payroll', 'leaves', 'performance'
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

    // Comprehensive Employee Database (Stateful)
    const [employees, setEmployees] = useState([
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
    ]);

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
        const createdEmp = {
            employee_id: `EMP-2026-00${employees.length + 1}`,
            employee_code: `CLK-00${employees.length + 1}`,
            employee_status: 'active',
            joining_date: new Date().toISOString().split('T')[0],
            first_name: newEmp.first_name,
            last_name: newEmp.last_name,
            gender: newEmp.gender,
            date_of_birth: '1995-05-10',
            blood_group: 'B+',
            phone_number: newEmp.phone_number,
            email: newEmp.email,
            emergency_contact_name: 'Suresh Mehra (Father)',
            emergency_contact_number: '+91 91111 00000',
            address_line_1: 'Flat 102, Green Fields',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400072',
            department_name: newEmp.department_name,
            designation_name: newEmp.designation_name,
            reporting_manager: 'Priyanka Sharma (HR Manager)',
            employment_type: 'Full-time',
            salary_type: 'Monthly',
            basic_salary: parseFloat(newEmp.basic_salary) || 25000,
            bank_name: newEmp.bank_name,
            account_number: newEmp.account_number,
            ifsc_code: newEmp.ifsc_code,
            pf_number: 'MH/BAN/0011223/009',
            pan_number: 'XYZAB9911C',
            aadhaar_file: 'aadhaar_uploaded.pdf',
            pan_file: 'pan_uploaded.pdf',
            shift_name: newEmp.shift_name,
            leave_balance: parseInt(newEmp.leave_balance) || 12,
            performance_rating: 4.0,
            target_score: 85,
            role_name: 'Staff Personnel'
        };

        setEmployees([...employees, createdEmp]);
        setIsOnboardModalOpen(false);
        alert('Employee onboarding sequence completed! Welcome package circular emailed.');
    };

    // Handle performance review submit
    const handlePerformanceSubmit = (e) => {
        e.preventDefault();
        setEmployees(employees.map(emp => emp.employee_id === perfForm.employee_id ? {
            ...emp,
            performance_rating: parseFloat(perfForm.rating) || 4.0,
            target_score: parseInt(perfForm.target_score) || 85
        } : emp));
        setIsPerformanceModalOpen(false);
        alert('Employee appraisal target score & performance ratings locked successfully!');
    };

    const handleDeleteEmployee = (empId) => {
        if (window.confirm('Are you sure you want to terminate/deboard this employee profile?')) {
            setEmployees(employees.filter(emp => emp.employee_id !== empId));
            alert('Employee profile marked inactive and deboarded.');
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
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Users size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>HR Staff & Employees Database</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage whole workforce life cycle: Central Profiles database, Employment designations, Payroll PF/ESI bank accounts, Leaves, Shifts, and Performance ratings.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsPerformanceModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <Award size={16} /> File Appraisal Review
                    </button>
                    <button 
                        onClick={() => setIsOnboardModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <UserPlus size={16} /> Onboard Staff Employee
                    </button>
                </div>
            </div>

            {/* Workforce Performance Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Active Headcount', value: `${totalHeadcount} Employees`, icon: Users, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Monthly Basic Payroll', value: `₹${totalMonthlyPayroll.toLocaleString()}`, icon: CreditCard, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Workforce Satisfaction/Perf Index', value: `${averageRating} / 5.0 Rating`, icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Assigned Shifts & Rosters', className: 'rosters', value: 'General (9AM - 6PM)', icon: Clock, color: '#10B981', bg: '#ECFDF5' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'profiles', label: 'Employee Profiles', icon: User },
                    { id: 'employment', label: 'Hierarchy & Employment', icon: Building2 },
                    { id: 'payroll', label: 'Payroll & Bank Details', icon: CreditCard },
                    { id: 'leaves', label: 'Leaves & Shifts Rosters', icon: Calendar },
                    { id: 'performance', label: 'Performance Appraisals', icon: Award }
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
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>ID / Code</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Contact Info</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Emergency Person</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Personal (DOB/Blood)</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Work Location</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
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
                            {employees.map((emp) => (
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
                            {employees.map((emp) => (
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
                            {employees.map((emp) => (
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
                            {employees.map((emp) => (
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
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
                                    {employees.map(emp => (
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
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
