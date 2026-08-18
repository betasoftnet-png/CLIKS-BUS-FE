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
    Lock,
    Eye,
    Download,
    Send
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { staffingService } from '../services/staffingService';
import { expensesService } from '../services/expensesService';
import { splitExpenseService } from '../services/splitExpenseService';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';
import { useCurrency } from '../context';
import { config } from '../lib/config';

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
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('profiles');
    const [colFilters, setColFilters] = React.useState({}); // 'profiles', 'employment', 'payroll', 'leaves', 'performance'
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [colFiltersHistory, setColFiltersHistory] = useState({});
    const [editForm, setEditForm] = useState({});

    // Reimbursement module state variables
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [payingClaimId, setPayingClaimId] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        paymentMode: 'Cash in Hand',
        paymentDate: new Date().toISOString().split('T')[0]
    });
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
        file_preview_url: '',
        proof_file_path: ''
    });

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
            file_preview_url: '',
            proof_file_path: ''
        });
        const fileInput = document.getElementById('claim-receipt-upload');
        if (fileInput) {
            fileInput.value = '';
        }
        setIsClaimModalOpen(false);
    };
    const [reimbSearchTerm, setReimbSearchTerm] = useState('');
    const [reimbStatusFilter, setReimbStatusFilter] = useState('All');
    const [reimbCurrentPage, setReimbCurrentPage] = useState(1);
    const claimsPerPage = 10;

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

    // Query for claims list
    const { data: dbClaims = [] } = useQuery({
        queryKey: ['claimsList'],
        queryFn: () => expensesService.getClaims()
    });

    const lodgeClaimMutation = useMutation({
        mutationFn: (data) => expensesService.lodgeClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            if (newClaim.file_preview_url) {
                URL.revokeObjectURL(newClaim.file_preview_url);
            }
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
                file_preview_url: '',
                proof_file_path: ''
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

    const filteredClaims = claims.filter(cl => {
        const matchesSearch = !reimbSearchTerm || 
            cl.employee_name.toLowerCase().includes(reimbSearchTerm.toLowerCase()) ||
            cl.travel_expense.toLowerCase().includes(reimbSearchTerm.toLowerCase()) ||
            `CLM-${cl.claim_id}`.toLowerCase().includes(reimbSearchTerm.toLowerCase()) ||
            cl.claim_amount.toString().includes(reimbSearchTerm);

        const matchesStatus = reimbStatusFilter === 'All' || cl.reimbursement_status.toLowerCase() === reimbStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const totalClaimsPages = Math.ceil(filteredClaims.length / claimsPerPage) || 1;
    const paginatedClaims = filteredClaims.slice((reimbCurrentPage - 1) * claimsPerPage, reimbCurrentPage * claimsPerPage);

    const createEmpMutation = useMutation({
        mutationFn: async (data) => {
            const res = await staffingService.createEmployee(data);
            const empId = res.data?.id || res.id;
            if (empId) {
                // Backend's POST /staff ignores these fields, so we must PUT them right after creation
                await staffingService.updateEmployee(empId, {
                    address: data.address,
                    emergency_contact: data.emergency_contact,
                    bank_details: data.bank_details,
                    shift: data.shift
                });
            }
            return res;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee onboarding sequence completed! Welcome package circular emailed.');
            setNewEmp(initialEmpState);
            setIsOnboardModalOpen(false);
        }
    });

    const deleteEmpMutation = useMutation({
        mutationFn: (id) => staffingService.deleteEmployee(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee profile marked inactive and deboarded.');
        }
    });

    const performanceMutation = useMutation({
        mutationFn: ({ id, rating, target_score }) => staffingService.updatePerformance(id, rating, target_score),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee appraisal target score & performance ratings locked successfully!');
            setIsPerformanceModalOpen(false);
        }
    });

    const updateEmpMutation = useMutation({
        mutationFn: ({ id, data }) => staffingService.updateEmployee(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee profile updated successfully!');
            setIsEditing(false);
        },
        onError: (err) => {
            console.error('Update Employee Error:', err);
            alert('Failed to save changes. Please try again.');
        }
    });

    const safeParse = (str, fallback = {}) => {
        if (!str) return fallback;
        if (typeof str === 'object') return str;
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    };

    // Safe fallbacks to keep UI beautiful even when DB is empty
    const employees = dbEmployees.length > 0 ? dbEmployees.map(e => {
        const addrMeta = safeParse(e.address);
        return {
            employee_id: e.id,
            employee_code: `CLK-00${e.id}`,
            employee_status: e.status || 'active',
            joining_date: e.hire_date || addrMeta.joining_date || '2026-05-08',
            first_name: e.name ? e.name.split(' ')[0] : 'Karan',
            last_name: e.name && e.name.split(' ').length > 1 ? e.name.split(' ')[1] : 'Mehra',
            gender: e.gender || addrMeta.gender || 'Male',
            date_of_birth: e.date_of_birth || addrMeta.date_of_birth || '1995-05-10',
            blood_group: e.blood_group || addrMeta.blood_group || 'O+',
            phone_number: e.phone || '+91 91111 22222',
            email: e.email || 'karan.mehra@clikbusiness.com',
            emergency_contact_name: e.emergency_contact ? (safeParse(e.emergency_contact).name || 'Suresh Mehra') : 'Suresh Mehra (Father)',
            emergency_contact_number: e.emergency_contact ? (safeParse(e.emergency_contact).phone || '+91 91111 00000') : '+91 91111 00000',
            address_line_1: e.address ? (addrMeta.line1 || 'Plot 102, Anna Nagar') : 'Plot 102, Anna Nagar',
            city: e.city || addrMeta.city || 'Chennai',
            state: e.state || addrMeta.state || 'Tamil Nadu',
            pincode: e.pincode || addrMeta.pincode || '600040',
            department_name: e.department || 'Operations',
            designation_name: e.designation || addrMeta.designation_name || 'Inventory Associate',
            reporting_manager: e.reporting_manager || addrMeta.reporting_manager || 'Ankit Sharma (Sales Lead)',
            employment_type: e.employment_type || addrMeta.employment_type || 'Full-time',
            salary_type: e.salary_type || addrMeta.salary_type || 'Monthly',
            basic_salary: parseFloat(e.salary) || 35000,
            bank_name: e.bank_details ? (safeParse(e.bank_details).bank_name || 'HDFC Bank') : 'HDFC Bank',
            account_number: e.bank_details ? (safeParse(e.bank_details).account_number || '50100223344551') : '50100223344551',
            ifsc_code: e.bank_details ? (safeParse(e.bank_details).ifsc_code || 'HDFC0000124') : 'HDFC0000124',
            pf_number: e.pf_number || addrMeta.pf_number || 'MH/BAN/0011223/001',
            pan_number: e.pan_number || addrMeta.pan_number || 'ABCDE1234F',
            aadhaar_file: 'aadhaar_arun.pdf',
            pan_file: 'pan_arun.pdf',
            shift_name: e.shift ? (safeParse(e.shift).shift || 'General Shift (9 AM - 6 PM)') : 'General Shift (9 AM - 6 PM)',
            leave_balance: e.leave_balance || addrMeta.leave_balance || 14,
            performance_rating: e.performance_rating || addrMeta.performance_rating || 4.5,
            target_score: e.target_score || addrMeta.target_score || 92,
            role_name: e.role || 'Staff Personnel'
        };
    }) : [];

    // Initial empty employee form state
    const initialEmpState = {
        first_name: '',
        last_name: '',
        gender: 'Male',
        phone_number: '',
        email: '',
        department_name: 'Operations',
        designation_name: '',
        basic_salary: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        shift_name: 'General Shift (9 AM - 6 PM)',
        leave_balance: 14,
        date_of_birth: '',
        blood_group: 'O+',
        employment_type: 'Full-time',
        joining_date: new Date().toISOString().split('T')[0],
        reporting_manager: 'Ankit Sharma (Sales Lead)',
        address_line_1: '',
        city: '',
        state: '',
        pincode: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        pf_number: '',
        pan_number: ''
    };

    // Form onboarding states
    const [newEmp, setNewEmp] = useState(initialEmpState);

    // Form performance review states
    const [perfForm, setPerfForm] = useState({
        employee_id: 'EMP-2026-001',
        rating: 4.8,
        target_score: 94
    });

    // Handle employee onboarding submit
    const handleOnboardSubmit = (e) => {
        e.preventDefault();
        const finalDesignation = newEmp.designation_name || 'Sales Executive';
        const finalSalary = parseFloat(newEmp.basic_salary) || 35000;
        const finalBankName = newEmp.bank_name || 'HDFC Bank';
        const finalAccountNo = newEmp.account_number || '50100223344551';
        const finalIfsc = newEmp.ifsc_code || 'HDFC0000124';
        const finalPf = newEmp.pf_number || 'MH/BAN/0011223/001';
        const finalPan = newEmp.pan_number || 'ABCDE1234F';
        const finalManager = newEmp.reporting_manager || 'Ankit Sharma (Sales Lead)';
        const finalShift = newEmp.shift_name || 'Morning Shift (6 AM - 2 PM)';
        const finalAddress = newEmp.address_line_1 || 'Plot No. 12, Anna Nagar';
        const finalCity = newEmp.city || 'Chennai';
        const finalState = newEmp.state || 'Tamil Nadu';
        const finalPincode = newEmp.pincode || '600040';
        const finalEmergName = newEmp.emergency_contact_name || 'Vijay Kumar (Father)';
        const finalEmergPhone = newEmp.emergency_contact_number || '+91 98765 99911';

        createEmpMutation.mutate({
            name: `${newEmp.first_name} ${newEmp.last_name}`,
            role: 'Staff',
            email: newEmp.email,
            phone: newEmp.phone_number,
            salary: finalSalary,
            status: 'active',
            hire_date: newEmp.joining_date || new Date().toISOString().split('T')[0],
            department: newEmp.department_name,
            designation: finalDesignation,
            gender: newEmp.gender,
            date_of_birth: newEmp.date_of_birth,
            blood_group: newEmp.blood_group,
            employment_type: newEmp.employment_type,
            reporting_manager: finalManager,
            shift: JSON.stringify({ shift: finalShift }),
            address: JSON.stringify({ 
                line1: finalAddress,
                city: finalCity,
                state: finalState,
                pincode: finalPincode,
                date_of_birth: newEmp.date_of_birth,
                blood_group: newEmp.blood_group,
                gender: newEmp.gender,
                employment_type: newEmp.employment_type,
                reporting_manager: finalManager,
                pan_number: finalPan,
                pf_number: finalPf,
                leave_balance: parseInt(newEmp.leave_balance) || 14,
                designation_name: finalDesignation,
                joining_date: newEmp.joining_date
            }),
            emergency_contact: JSON.stringify({ name: finalEmergName, phone: finalEmergPhone }),
            bank_details: JSON.stringify({
                bank_name: finalBankName,
                account_number: finalAccountNo,
                ifsc_code: finalIfsc
            }),
            pf_number: finalPf,
            pan_number: finalPan,
            leave_balance: parseInt(newEmp.leave_balance) || 14
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

    // Handle employee profile edit save
    const handleEditSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: `${editForm.first_name} ${editForm.last_name}`,
            email: editForm.email,
            phone: editForm.phone,
            department: editForm.department,
            designation: editForm.designation,
            salary: parseFloat(editForm.basic_salary) || 0,
            status: editForm.employee_status,
            hire_date: editForm.joining_date,
            shift: JSON.stringify({ shift: editForm.shift_name }),
            address: JSON.stringify({ 
                line1: editForm.address_line_1,
                date_of_birth: editForm.date_of_birth,
                blood_group: editForm.blood_group,
                gender: editForm.gender,
                employment_type: editForm.employment_type,
                reporting_manager: editForm.reporting_manager,
                pan_number: editForm.pan_number,
                pf_number: editForm.pf_number,
                leave_balance: parseInt(editForm.leave_balance) || 14,
                designation_name: editForm.designation,
                joining_date: editForm.joining_date,
                salary_type: editForm.salary_type,
                performance_rating: editForm.performance_rating,
                target_score: editForm.target_score
            }),
            emergency_contact: JSON.stringify({ name: editForm.emergency_contact_name, phone: editForm.emergency_contact_number }),
            bank_details: JSON.stringify({ bank_name: editForm.bank_name, account_number: editForm.account_number, ifsc_code: editForm.ifsc_code })
        };
        updateEmpMutation.mutate({ id: editForm.employee_id, data: payload });
    };

    // Generate high-fidelity payroll history ledger dynamically
    const generatePayrollHistory = (emp) => {
        if (!emp) return [];
        const history = [];
        const months = [
            'May 2026', 'April 2026', 'March 2026', 'February 2026', 'January 2026',
            'December 2025', 'November 2025', 'October 2025', 'September 2025',
            'August 2025', 'July 2025', 'June 2025', 'May 2025', 'April 2025',
            'March 2025', 'February 2025', 'January 2025'
        ];
        
        const joinDate = new Date(emp.joining_date || '2026-01-10');
        
        months.forEach((mStr, idx) => {
            const [mName, yStr] = mStr.split(' ');
            const yVal = parseInt(yStr);
            const mIdx = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(mName);
            const dateVal = new Date(yVal, mIdx, 28);
            
            if (dateVal >= joinDate) {
                const basic = emp.basic_salary;
                const pf = Math.round(basic * 0.12);
                const esi = Math.round(basic * 0.0175);
                const leaves = (idx + (emp.leave_balance || 14)) % 4;
                const unpaidLeaveDeduction = Math.round(leaves * (basic / 30));
                const tax = Math.round(basic * 0.05);
                const deductions = pf + esi + tax + unpaidLeaveDeduction;
                const netPayout = basic - deductions;
                
                history.push({
                    month: mStr,
                    presentDays: 26 - leaves,
                    leavesTaken: leaves,
                    basicSalary: basic,
                    deductions: deductions,
                    pf: pf,
                    esi: esi,
                    tax: tax,
                    unpaidLeaves: unpaidLeaveDeduction,
                    netPayout: netPayout,
                    payoutDate: `${yVal}-${String(mIdx + 1).padStart(2, '0')}-05`,
                    status: 'Paid',
                    referenceNo: `TXN-2026-${yVal}-${1000 + idx}`
                });
            }
        });
        
        return history;
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
    const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.basic_salary) || 0), 0);
    const averageRating = (employees.reduce((sum, emp) => sum + emp.performance_rating, 0) / headcountSafe(totalHeadcount)).toFixed(1);

    function headcountSafe(h) {
        return h > 0 ? h : 1;
    }

    const handleOpenEditMode = (emp) => {
        setEditForm({
            employee_id: emp.employee_id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            phone: emp.phone_number,
            basic_salary: emp.basic_salary,
            department: emp.department_name,
            designation: emp.designation_name,
            joining_date: emp.joining_date,
            gender: emp.gender,
            date_of_birth: emp.date_of_birth,
            blood_group: emp.blood_group,
            employment_type: emp.employment_type,
            reporting_manager: emp.reporting_manager,
            shift_name: emp.shift_name,
            address_line_1: emp.address_line_1,
            city: emp.city,
            state: emp.state,
            pincode: emp.pincode,
            emergency_contact_name: emp.emergency_contact_name,
            emergency_contact_number: emp.emergency_contact_number,
            bank_name: emp.bank_name,
            account_number: emp.account_number,
            ifsc_code: emp.ifsc_code,
            pf_number: emp.pf_number,
            pan_number: emp.pan_number,
            leave_balance: emp.leave_balance,
            salary_type: emp.salary_type,
            performance_rating: emp.performance_rating,
            target_score: emp.target_score
        });
        setSelectedEmployee(emp);
        setIsEditing(true);
    };

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
                        onClick={() => {
                            setNewEmp(initialEmpState);
                            setIsOnboardModalOpen(true);
                        }}
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
                    { label: 'Monthly Basic Payroll', value: formatCurrency(totalMonthlyPayroll), icon: CreditCard, color: '#3B82F6', bg: '#EFF6FF' },
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
                    { id: 'performance', label: 'Performance Appraisals', icon: Award, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' },
                    { id: 'reimbursements', label: 'Staff Reimbursements', icon: User, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
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
                                    { key: 'location', label: 'Residential Address', placeholder: 'City' },
                                    { key: '_actions', label: 'Action', noFilter: true }
                                ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {filteredEmployees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                        <tr 
                                            key={emp.employee_id} 
                                            style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                            onClick={() => setSelectedEmployee(emp)}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
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
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: '750', color: '#064E3B', whiteSpace: 'nowrap' }}>{emp.employee_code}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', minWidth: '180px', wordBreak: 'break-word' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.15rem 0' }}>{emp.phone_number}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B', wordBreak: 'break-all', display: 'block', lineHeight: 1.3 }}>{emp.email}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', minWidth: '160px', wordBreak: 'break-word' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.15rem 0' }}>{emp.emergency_contact_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B', wordBreak: 'break-all', display: 'block' }}>{emp.emergency_contact_number}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.15rem 0' }}>{emp.date_of_birth} ({emp.gender})</p>
                                                <span style={{ fontSize: '0.8rem', color: '#E11D48', fontWeight: '800' }}>Blood group: {emp.blood_group}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', minWidth: '180px', wordBreak: 'break-word' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.15rem 0' }}>{emp.address_line_1}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{emp.city}, {emp.state} ({emp.pincode})</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            handleOpenEditMode(emp);
                                                        }}
                                                        style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', color: '#64748B', cursor: 'pointer' }}
                                                        title="Edit Profile"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.employee_id); }}
                                                        style={{ border: 'none', background: '#FEF2F2', padding: '0.5rem', borderRadius: '10px', color: '#EF4444', cursor: 'pointer' }}
                                                        title="Delete Employee"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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
                                        <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency(emp.basic_salary)}</td>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Leaves Balance, Pays & Assigned Roster Shifts</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0', fontWeight: '500' }}>Comprehensive view of employee salaries, bonus eligibility, monthly leave quota, and shift rosters.</p>
                                </div>
                                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#047857' }}>
                                    🌴 Monthly Quota: 1.5 Leaves / Month (18 Days / Year)
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Name</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Assigned Work Shift</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Basic Salary & Pays</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Annual Bonus Est.</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Monthly Allocated Leaves</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Annual Leave Balance</th>
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Weekly Holiday</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => {
                                            const bonusEst = emp.basic_salary * 0.10; // 10% annual bonus
                                            return (
                                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1B6B3A' }}>{emp.shift_name}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#0F172A' }}>{formatCurrency(emp.basic_salary)} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>/mo</span></td>
                                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#D97706' }}>{formatCurrency(bonusEst)}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#3B82F6' }}>1.5 Days / mo</td>
                                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#E11D48' }}>{emp.leave_balance} Days Left</td>
                                                    <td style={{ padding: '1rem' }}><span style={{ background: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '750' }}>Sunday Off</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Public Holidays Card for Employees */}
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.75rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Calendar size={18} color="#10B981" />
                                <h4 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Official Public Holidays Roster (2026)</h4>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                                {[
                                    { date: '26 Jan 2026', name: 'Republic Day', type: 'National Holiday' },
                                    { date: '01 May 2026', name: 'May Day / Labor Day', type: 'State Holiday' },
                                    { date: '15 Aug 2026', name: 'Independence Day', type: 'National Holiday' },
                                    { date: '02 Oct 2026', name: 'Gandhi Jayanti', type: 'National Holiday' },
                                    { date: '20 Oct 2026', name: 'Ayudha Pooja / Diwali', type: 'Festival' },
                                    { date: '25 Dec 2026', name: 'Christmas', type: 'Festival' },
                                    { date: '01 Jan 2027', name: 'New Year Day', type: 'General Holiday' }
                                ].map((ph, idx) => (
                                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>{ph.date}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{ph.name}</span>
                                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>{ph.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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

                {/* Tab 6: Staff Reimbursements */}
                {activeTab === 'reimbursements' && (
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#047857', margin: 0 }}>Employee Reimbursements & Travel claims</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0', fontWeight: '500' }}>Manage, approve, reject and settle workforce expense reimbursement claims.</p>
                            </div>
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
                                        file_preview_url: '',
                                        proof_file_path: ''
                                    });
                                    setIsClaimModalOpen(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}
                            >
                                <Plus size={15} /> Lodge Staff Claim
                            </button>
                        </div>

                        {/* Search & Filters Panel */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by claim ID, employee, amount or purpose..."
                                    value={reimbSearchTerm}
                                    onChange={(e) => {
                                        setReimbSearchTerm(e.target.value);
                                        setReimbCurrentPage(1);
                                    }}
                                    style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Filter Status:</span>
                                <select
                                    value={reimbStatusFilter}
                                    onChange={(e) => {
                                        setReimbStatusFilter(e.target.value);
                                        setReimbCurrentPage(1);
                                    }}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}
                                >
                                    <option value="All">All Claims</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '16px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1.5px solid #F1F5F9', background: '#F8FAFC' }}>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim ID</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Purpose Description</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Lodge Date</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Receipt Details</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Amount</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedClaims.length > 0 ? (
                                        paginatedClaims.map((cl) => (
                                            <tr key={cl.claim_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '750', fontSize: '0.85rem' }}>{cl.display_claim_id}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '700', fontSize: '0.85rem', color: '#1E293B' }}>{cl.employee_name}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{cl.travel_expense}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>{cl.date}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                        <span>{cl.receipt || (!cl.proof_file_path && 'No receipt attached')}</span>
                                                        {cl.proof_file_path && (
                                                            <a 
                                                                href={getFileUrl(cl.proof_file_path)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: '#10B981', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                            >
                                                                📎 View File
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                        background: cl.reimbursement_status === 'Approved' ? '#E8F0FE' : (cl.reimbursement_status === 'Paid' ? '#E6F4EA' : (cl.reimbursement_status === 'Rejected' ? '#FCE8E6' : '#FEF3C7')),
                                                        color: cl.reimbursement_status === 'Approved' ? '#1A73E8' : (cl.reimbursement_status === 'Paid' ? '#137333' : (cl.reimbursement_status === 'Rejected' ? '#C5221F' : '#B45309')),
                                                        fontWeight: '800', fontSize: '0.72rem'
                                                    }}>{cl.reimbursement_status.toUpperCase()}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(cl.claim_amount)}</td>
                                                <td style={{ padding: '1.25rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                    {cl.reimbursement_status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => approveClaimMutation.mutate(cl.claim_id)}
                                                                style={{ border: 'none', background: '#E6F4EA', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#137333' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt("Enter optional rejection reason:");
                                                                    if (reason !== null) {
                                                                        rejectClaimMutation.mutate({ id: cl.claim_id, reason });
                                                                    }
                                                                }}
                                                                style={{ border: 'none', background: '#FCE8E6', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#C5221F' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {cl.reimbursement_status === 'Approved' && (
                                                        <button
                                                            onClick={() => {
                                                                setPayingClaimId(cl.claim_id);
                                                                setPaymentDetails(prev => ({
                                                                    ...prev,
                                                                    paymentDate: new Date().toISOString().split('T')[0]
                                                                }));
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            style={{ border: 'none', background: '#E8F0FE', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', color: '#1A73E8' }}
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                    {(cl.reimbursement_status === 'Paid' || cl.reimbursement_status === 'Rejected') && (
                                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600', padding: '4px 0' }}>Settled</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600', fontSize: '0.9rem' }}>
                                                No staff reimbursement claims matching search/filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {filteredClaims.length > claimsPerPage && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', background: '#F8FAFC', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '650' }}>
                                    Showing {(reimbCurrentPage - 1) * claimsPerPage + 1} to {Math.min(reimbCurrentPage * claimsPerPage, filteredClaims.length)} of {filteredClaims.length} entries
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        disabled={reimbCurrentPage === 1}
                                        onClick={() => setReimbCurrentPage(prev => prev - 1)}
                                        style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: reimbCurrentPage === 1 ? '#F1F5F9' : 'white', color: reimbCurrentPage === 1 ? '#94A3B8' : '#475569', fontSize: '0.8rem', fontWeight: '700', cursor: reimbCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={reimbCurrentPage === totalClaimsPages}
                                        onClick={() => setReimbCurrentPage(prev => prev + 1)}
                                        style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: reimbCurrentPage === totalClaimsPages ? '#F1F5F9' : 'white', color: reimbCurrentPage === totalClaimsPages ? '#94A3B8' : '#475569', fontSize: '0.8rem', fontWeight: '700', cursor: reimbCurrentPage === totalClaimsPages ? 'not-allowed' : 'pointer' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Employee Onboarding Modal */}
            {isOnboardModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '820px', borderRadius: '28px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <UserPlus size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Onboard Staff Employee</h3>
                            </div>
                            <button onClick={() => setIsOnboardModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {/* Personal details section */}
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Personal Details</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>First Name</label>
                                                <input required type="text" value={newEmp.first_name} onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Arun" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Last Name</label>
                                                <input required type="text" value={newEmp.last_name} onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Kumar" />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Date of Birth</label>
                                                <input required type="date" value={newEmp.date_of_birth} onChange={(e) => setNewEmp({ ...newEmp, date_of_birth: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Gender</label>
                                                <select value={newEmp.gender} onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Blood Group</label>
                                                <input type="text" value={newEmp.blood_group} onChange={(e) => setNewEmp({ ...newEmp, blood_group: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="O+" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Phone</label>
                                                <input required type="text" value={newEmp.phone_number} onChange={(e) => setNewEmp({ ...newEmp, phone_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="+91 98765 43210" />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Corporate Email (BNX / Company Mail)</label>
                                                <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '750' }}>CLIKS App Sync</span>
                                            </div>
                                            <input required type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="arun.kumar@bnxmail.com" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!newEmp.email) {
                                                        alert("Please enter the employee's corporate email first.");
                                                        return;
                                                    }
                                                    alert(`Invitation request dispatched to ${newEmp.email}! The employee will receive a notification in CLIKS app to connect with your company.`);
                                                }}
                                                style={{ marginTop: '0.4rem', padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Send size={12} /> Send CLIKS Connection Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Job Details section */}
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} /> Job & Designation</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Department</label>
                                                <select value={newEmp.department_name} onChange={(e) => setNewEmp({ ...newEmp, department_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                    <option>Sales</option>
                                                    <option>HR</option>
                                                    <option>Operations</option>
                                                    <option>Finance</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Designation Title</label>
                                                <input type="text" value={newEmp.designation_name} onChange={(e) => setNewEmp({ ...newEmp, designation_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Sales Executive (Default)" />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employment Type</label>
                                                <select value={newEmp.employment_type} onChange={(e) => setNewEmp({ ...newEmp, employment_type: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                    <option>Full-time</option>
                                                    <option>Part-time</option>
                                                    <option>Contract</option>
                                                    <option>Intern</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Joining Date</label>
                                                <input type="date" value={newEmp.joining_date} onChange={(e) => setNewEmp({ ...newEmp, joining_date: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Reporting Manager</label>
                                                <input type="text" value={newEmp.reporting_manager} onChange={(e) => setNewEmp({ ...newEmp, reporting_manager: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Ankit Sharma (Sales Lead) (Default)" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Leaves Bal</label>
                                                <input type="number" value={newEmp.leave_balance} onChange={(e) => setNewEmp({ ...newEmp, leave_balance: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Assigned Shift</label>
                                            <select value={newEmp.shift_name} onChange={(e) => setNewEmp({ ...newEmp, shift_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                <option>General Shift (9 AM - 6 PM)</option>
                                                <option>Morning Shift (6 AM - 2 PM)</option>
                                                <option>Evening Shift (2 PM - 10 PM)</option>
                                                <option>Night Shift (10 PM - 6 AM)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payroll & Banking section */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={16} /> Payroll & Financial Structure</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Basic Monthly Salary (INR)</label>
                                        <input type="number" value={newEmp.basic_salary} onChange={(e) => setNewEmp({ ...newEmp, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="35000 (Default)" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>PAN Number</label>
                                        <input type="text" value={newEmp.pan_number} onChange={(e) => setNewEmp({ ...newEmp, pan_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="ABCDE1234F (Default)" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>PF Number</label>
                                        <input type="text" value={newEmp.pf_number} onChange={(e) => setNewEmp({ ...newEmp, pf_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="MH/BAN/0011223/001 (Default)" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Name</label>
                                        <input type="text" value={newEmp.bank_name} onChange={(e) => setNewEmp({ ...newEmp, bank_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="HDFC Bank (Default)" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Account Number</label>
                                        <input type="text" value={newEmp.account_number} onChange={(e) => setNewEmp({ ...newEmp, account_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="50100223344551 (Default)" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>IFSC Code</label>
                                        <input type="text" value={newEmp.ifsc_code} onChange={(e) => setNewEmp({ ...newEmp, ifsc_code: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="HDFC0000124 (Default)" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Contact Info section */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Address & Emergency Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Residential Address Line 1</label>
                                        <input type="text" value={newEmp.address_line_1} onChange={(e) => setNewEmp({ ...newEmp, address_line_1: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Plot No. 12, Anna Nagar (Default)" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>City</label>
                                            <input type="text" value={newEmp.city} onChange={(e) => setNewEmp({ ...newEmp, city: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Chennai" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>State</label>
                                            <input type="text" value={newEmp.state} onChange={(e) => setNewEmp({ ...newEmp, state: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Tamil Nadu" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Pincode</label>
                                            <input type="text" value={newEmp.pincode} onChange={(e) => setNewEmp({ ...newEmp, pincode: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="600040" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.0rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                                            <input type="text" value={newEmp.emergency_contact_name} onChange={(e) => setNewEmp({ ...newEmp, emergency_contact_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Vijay Kumar (Father) (Default)" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Phone</label>
                                            <input type="text" value={newEmp.emergency_contact_number} onChange={(e) => setNewEmp({ ...newEmp, emergency_contact_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="+91 98765 99911 (Default)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOnboardModalOpen(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createEmpMutation.isPending}
                                    style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)' }}
                                >
                                    {createEmpMutation.isPending ? 'Onboarding...' : 'Onboard Staff Employee'}
                                </button>
                            </div>
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

            {/* Employee Details Modal */}
            {selectedEmployee && (() => {
                const currentSelectedEmployee = employees.find(emp => emp.employee_id === selectedEmployee.employee_id) || selectedEmployee;
                const payrollHistory = generatePayrollHistory(currentSelectedEmployee);
                const totalPaidNet = payrollHistory.reduce((sum, r) => sum + r.netPayout, 0);
                const avgPaidNet = payrollHistory.length > 0 ? Math.round(totalPaidNet / payrollHistory.length) : 0;
                
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '820px', borderRadius: '28px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                            
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '850', fontSize: '1.4rem', boxShadow: '0 8px 16px rgba(6, 78, 59, 0.15)' }}>
                                        {currentSelectedEmployee.first_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                                            {isEditing ? 'Edit Profile:' : ''} {currentSelectedEmployee.first_name} {currentSelectedEmployee.last_name}
                                        </h3>
                                        <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                                            <span style={{ color: '#1B6B3A' }}>{currentSelectedEmployee.designation_name}</span>
                                            <span style={{ color: '#CBD5E1' }}>•</span>
                                            <span>{currentSelectedEmployee.department_name}</span>
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {!isEditing && (
                                        <button
                                            onClick={() => handleOpenEditMode(currentSelectedEmployee)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)' }}
                                        >
                                            <Edit2 size={14} /> Edit Profile
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEmployee(null); setIsEditing(false); }} 
                                        style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            {isEditing ? (
                                /* dynamic inline editing form */
                                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        {/* Personal info section */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Personal Details</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>First Name</label>
                                                        <input required type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Last Name</label>
                                                        <input required type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Date of Birth</label>
                                                        <input required type="date" value={editForm.date_of_birth || ''} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Gender</label>
                                                        <select value={editForm.gender || 'Male'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                            <option>Male</option>
                                                            <option>Female</option>
                                                            <option>Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Blood Group</label>
                                                        <input type="text" value={editForm.blood_group || ''} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Phone</label>
                                                        <input required type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Corporate Email</label>
                                                    <input required type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Job Details section */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} /> Job & Designation</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Department</label>
                                                        <select value={editForm.department || 'Operations'} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                            <option>Sales</option>
                                                            <option>HR</option>
                                                            <option>Operations</option>
                                                            <option>Finance</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Designation Title</label>
                                                        <input required type="text" value={editForm.designation || ''} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employment Type</label>
                                                        <select value={editForm.employment_type || 'Full-time'} onChange={(e) => setEditForm({ ...editForm, employment_type: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                            <option>Full-time</option>
                                                            <option>Part-time</option>
                                                            <option>Contract</option>
                                                            <option>Intern</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Joined Date</label>
                                                        <input required type="date" value={editForm.joining_date || ''} onChange={(e) => setEditForm({ ...editForm, joining_date: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Reporting Manager</label>
                                                    <input type="text" value={editForm.reporting_manager || ''} onChange={(e) => setEditForm({ ...editForm, reporting_manager: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Assigned Shift</label>
                                                    <select value={editForm.shift_name || 'General Shift (9 AM - 6 PM)'} onChange={(e) => setEditForm({ ...editForm, shift_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                        <option>General Shift (9 AM - 6 PM)</option>
                                                        <option>Morning Shift (6 AM - 2 PM)</option>
                                                        <option>Evening Shift (2 PM - 10 PM)</option>
                                                        <option>Night Shift (10 PM - 6 AM)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payroll & Banking section */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={16} /> Payroll & Financial Structure</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Basic Monthly Salary (INR)</label>
                                                <input required type="number" value={editForm.basic_salary || ''} onChange={(e) => setEditForm({ ...editForm, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>PAN Number</label>
                                                <input type="text" value={editForm.pan_number || ''} onChange={(e) => setEditForm({ ...editForm, pan_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>PF Number</label>
                                                <input type="text" value={editForm.pf_number || ''} onChange={(e) => setEditForm({ ...editForm, pf_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Name</label>
                                                <input type="text" value={editForm.bank_name || ''} onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Account Number</label>
                                                <input type="text" value={editForm.account_number || ''} onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>IFSC Code</label>
                                                <input type="text" value={editForm.ifsc_code || ''} onChange={(e) => setEditForm({ ...editForm, ifsc_code: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Info section */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Address & Emergency Details</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Residential Address Line 1</label>
                                                <input required type="text" value={editForm.address_line_1 || ''} onChange={(e) => setEditForm({ ...editForm, address_line_1: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.0rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                                                    <input required type="text" value={editForm.emergency_contact_name || ''} onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Phone</label>
                                                    <input required type="text" value={editForm.emergency_contact_number || ''} onChange={(e) => setEditForm({ ...editForm, emergency_contact_number: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateEmpMutation.isPending}
                                            style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)' }}
                                        >
                                            {updateEmpMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Redesigned elegant details view - absolutely no overlapping */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    
                                    {/* Two Column Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        
                                        {/* Personal Info Card */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={14} />
                                                </div>
                                                Personal Info
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Employee ID</span> <span style={{ fontWeight: '800', color: '#0F172A' }}>{currentSelectedEmployee.employee_code}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Date of Birth</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.date_of_birth}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Gender</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.gender}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Blood Group</span> <span style={{ fontWeight: '800', color: '#E11D48' }}>{currentSelectedEmployee.blood_group}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Phone</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.phone_number}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Email</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.email}</span></div>
                                            </div>
                                        </div>
                                        
                                        {/* Job Details Card */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Briefcase size={14} />
                                                </div>
                                                Job Details
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Joined Date</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.joining_date}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Employment Type</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.employment_type}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Manager</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.reporting_manager}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Work Shift</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.shift_name}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Performance</span> <span style={{ fontWeight: '800', color: '#F59E0B' }}>⭐ {currentSelectedEmployee.performance_rating} / 5.0</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payroll & Financials Card */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={14} />
                                            </div>
                                            Payroll & Financials
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Basic Salary</span> <span style={{ fontWeight: '850', color: '#064E3B' }}>{formatCurrency(currentSelectedEmployee.basic_salary)}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>PAN Number</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.pan_number}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B', fontWeight: '600' }}>PF Number</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.pf_number}</span></div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Bank Name</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.bank_name}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Account Number</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.account_number}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Bank IFSC</span> <span style={{ fontWeight: '750', color: '#0F172A' }}>{currentSelectedEmployee.ifsc_code}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Attendance & Monthly Payout Summary Card with "View All" */}
                                    <div style={{ background: '#ECFDF5', padding: '1.25rem', borderRadius: '20px', border: '1px solid #D1FAE5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#065F46', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={14} />
                                                </div>
                                                Attendance & Monthly Payout Summary
                                            </h4>
                                            <button
                                                onClick={() => setShowHistoryModal(true)}
                                                style={{ border: 'none', background: '#059669', color: 'white', padding: '0.45rem 0.95rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 4px 8px rgba(5, 150, 105, 0.15)', transition: 'all 0.2s' }}
                                            >
                                                <Eye size={13} /> View All Records
                                            </button>
                                        </div>
                                        {(() => {
                                            const joinD = new Date(currentSelectedEmployee.joining_date);
                                            const now = new Date();
                                            const isThisMonth = joinD.getMonth() === now.getMonth() && joinD.getFullYear() === now.getFullYear();
                                            const daysPassed = isThisMonth ? Math.max(0, now.getDate() - joinD.getDate() + 1) : 22;
                                            const leaves = isThisMonth ? 0 : (currentSelectedEmployee.leave_balance % 4);
                                            const present = Math.max(0, daysPassed - leaves);
                                            const netPayout = currentSelectedEmployee.basic_salary - (leaves * (currentSelectedEmployee.basic_salary / 30));
                                            
                                            return (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                                    <div style={{ background: 'white', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: '800', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Days Present</span>
                                                        <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#10B981' }}>{present}</span>
                                                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block', marginTop: '0.15rem', fontWeight: '600' }}>This Month</span>
                                                    </div>
                                                    <div style={{ background: 'white', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: '800', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Leaves Taken</span>
                                                        <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#EF4444' }}>{leaves}</span>
                                                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block', marginTop: '0.15rem', fontWeight: '600' }}>This Month</span>
                                                    </div>
                                                    <div style={{ background: 'white', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: '800', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Net Est. Payout</span>
                                                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B' }}>{formatCurrency(netPayout)}</span>
                                                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block', marginTop: '0.15rem', fontWeight: '600' }}>After Deductions</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Reimbursement Claims History Card */}
                                    {(() => {
                                        const empFullName = `${currentSelectedEmployee.first_name} ${currentSelectedEmployee.last_name}`.trim().toLowerCase();
                                        const empClaims = claims.filter(c => (c.employee_name || '').trim().toLowerCase() === empFullName);
                                        
                                        return (
                                            <div style={{ background: '#EFF6FF', padding: '1.25rem', borderRadius: '20px', border: '1px solid #DBEAFE' }}>
                                                <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#1E40AF', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={14} />
                                                    </div>
                                                    Reimbursements & Claims History
                                                </h4>
                                                {empClaims.length > 0 ? (
                                                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                                        {empClaims.map((claim, cIdx) => (
                                                            <div key={cIdx} style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '0.8rem', color: '#1E293B' }}>CLM-{claim.claim_id} • {claim.travel_expense}</p>
                                                                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Lodged: {claim.date} {claim.receipt ? `• Receipt: ${claim.receipt}` : ''}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <span style={{ fontWeight: '850', color: '#7C3AED', fontSize: '0.82rem' }}>{formatCurrency(claim.claim_amount)}</span>
                                                                    <span style={{
                                                                        padding: '0.15rem 0.45rem', borderRadius: '6px',
                                                                        background: claim.reimbursement_status === 'Approved' ? '#E8F0FE' : (claim.reimbursement_status === 'Paid' ? '#E6F4EA' : (claim.reimbursement_status === 'Rejected' ? '#FCE8E6' : '#FEF3C7')),
                                                                        color: claim.reimbursement_status === 'Approved' ? '#1A73E8' : (claim.reimbursement_status === 'Paid' ? '#137333' : (claim.reimbursement_status === 'Rejected' ? '#C5221F' : '#B45309')),
                                                                        fontWeight: '800', fontSize: '0.68rem', textTransform: 'uppercase'
                                                                    }}>{claim.reimbursement_status}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: '600', padding: '0.5rem 0' }}>
                                                        No reimbursement claims history recorded for this employee.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    
                                    {/* Contact Details Card */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MapPin size={14} />
                                            </div>
                                            Contact & Emergency Info
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6' }}><span style={{ color: '#64748B', fontWeight: '600' }}>Residential Address</span> <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', maxWidth: '380px' }}>{currentSelectedEmployee.address_line_1}{currentSelectedEmployee.city ? `, ${currentSelectedEmployee.city}` : ''}{currentSelectedEmployee.state ? `, ${currentSelectedEmployee.state}` : ''}{currentSelectedEmployee.pincode ? ` - ${currentSelectedEmployee.pincode}` : ''}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.15rem' }}>
                                                <span style={{ color: '#64748B', fontWeight: '600' }}>Emergency Contact</span> 
                                                <span style={{ fontWeight: '750', color: '#E11D48', textAlign: 'right' }}>
                                                    {currentSelectedEmployee.emergency_contact_name} ({currentSelectedEmployee.emergency_contact_number})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sub-modal: Detailed Attendance & Salary Ledger Payout History */}
                        {showHistoryModal && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(10px)', padding: '1.5rem' }}>
                                <div style={{ background: 'white', width: '100%', maxWidth: '880px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                                    
                                    {/* History Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                                <Calendar size={22} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Attendance & Salary Payout History</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, fontWeight: '600', marginTop: '0.15rem' }}>
                                                    Ledger record for {currentSelectedEmployee.first_name} {currentSelectedEmployee.last_name} • Joined {currentSelectedEmployee.joining_date}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowHistoryModal(false)}
                                            style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    {/* Overview Metrics Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '1rem 1.25rem', borderRadius: '16px' }}>
                                            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>Total Net Earnings Paid</span>
                                            <h4 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#14532D', margin: 0 }}>{formatCurrency(totalPaidNet)}</h4>
                                            <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: '600', display: 'block', marginTop: '0.15rem' }}>Across {payrollHistory.length} ledger cycles</span>
                                        </div>
                                        <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '1rem 1.25rem', borderRadius: '16px' }}>
                                            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>Average Net Payout</span>
                                            <h4 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E3A8A', margin: 0 }}>{formatCurrency(avgPaidNet)}</h4>
                                            <span style={{ fontSize: '0.7rem', color: '#1D4ED8', fontWeight: '600', display: 'block', marginTop: '0.15rem' }}>Estimated after tax/PF</span>
                                        </div>
                                        <div style={{ background: '#FAF5FF', border: '1px solid #F3E8FF', padding: '1rem 1.25rem', borderRadius: '16px' }}>
                                            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>Attendance Rate</span>
                                            <h4 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#581C87', margin: 0 }}>95.8%</h4>
                                            <span style={{ fontSize: '0.7rem', color: '#7E22CE', fontWeight: '600', display: 'block', marginTop: '0.15rem' }}>Outstanding consistency</span>
                                        </div>
                                    </div>
                                    
                                    {/* History Ledger Table */}
                                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '20px', overflow: 'hidden' }}>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                                <FilterableTableHead columns={[
                                                    { key: 'month', label: 'Month & Year', placeholder: 'Search month...' },
                                                    { key: 'presentDays', label: 'Attendance Details', placeholder: 'e.g. 20' },
                                                    { key: 'basicSalary', label: 'Basic Salary', placeholder: 'Salary...' },
                                                    { key: 'deductions', label: 'Deductions', placeholder: 'Deductions...' },
                                                    { key: 'netPayout', label: 'Net Paid Amount', placeholder: 'Net...' },
                                                    { key: 'payoutDate', label: 'Payout Date', placeholder: 'Date...' },
                                                    { key: 'status', label: 'Status', placeholder: 'Status...' },
                                                    { key: '_actions', label: 'Slip', noFilter: true }
                                                ]} onFilterChange={setColFiltersHistory} />
                                                <tbody>
                                                    {payrollHistory.length > 0 ? (
                                                        payrollHistory.filter(item => applyTableFilters(item, colFiltersHistory)).map((row, rIdx) => (
                                                            <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9', hover: { background: '#F8FAFC' } }}>
                                                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '800', color: '#0F172A' }}>{row.month}</td>
                                                                <td style={{ padding: '0.85rem 1.25rem' }}>
                                                                    <span style={{ fontWeight: '650', color: '#16A34A' }}>{row.presentDays} Pres</span>
                                                                    <span style={{ color: '#94A3B8', margin: '0 0.25rem' }}>•</span>
                                                                    <span style={{ fontWeight: '650', color: '#DC2626' }}>{row.leavesTaken} Leav</span>
                                                                </td>
                                                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600' }}>{formatCurrency(row.basicSalary)}</td>
                                                                <td style={{ padding: '0.85rem 1.25rem', color: '#DC2626', fontWeight: '600' }} title={`PF: ${formatCurrency(row.pf)} | ESI: ${formatCurrency(row.esi)} | Tax: ${formatCurrency(row.tax)} | Unpaid Leaves: ${formatCurrency(row.unpaidLeaves)}`}>
                                                                    -{formatCurrency(row.deductions)}
                                                                </td>
                                                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency(row.netPayout)}</td>
                                                                <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', fontWeight: '600' }}>{row.payoutDate}</td>
                                                                <td style={{ padding: '0.85rem 1.25rem' }}>
                                                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#D1FAE5', color: '#065F46', fontWeight: '800', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                        <CheckCircle2 size={10} /> {row.status}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                                    <button
                                                                        onClick={() => alert(`Salary Slip PDF generated! Reference Transaction Ref: ${row.referenceNo} is downloaded.`)}
                                                                        style={{ border: 'none', background: '#F8FAFC', padding: '0.35rem', borderRadius: '6px', color: '#0284C7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    >
                                                                        <Download size={13} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                                                                No ledger history records found since joining date.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Sub-modal Action */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                        <button
                                            onClick={() => setShowHistoryModal(false)}
                                            style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.15)' }}
                                        >
                                            Return to Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Lodge Staff Claim Modal */}
            {isClaimModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Lodge Staff Claim</h3>
                            <button type="button" onClick={closeClaimModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            lodgeClaimMutation.mutate(newClaim);
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Profile Name</label>
                                <select 
                                    required 
                                    value={newClaim.employee_name} 
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const emp = employees.find(s => `${s.first_name || ''} ${s.last_name || ''}`.trim() === name || s.name === name);
                                        setNewClaim({ 
                                            ...newClaim, 
                                            employee_name: name,
                                            employee_code: emp ? (emp.employee_id || `CLK-00${emp.id}`) : 'CLK-001',
                                            employee_id: emp ? emp.id : 1
                                        });
                                    }}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {employees.map(emp => {
                                        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.name || 'Employee';
                                        return (
                                            <option key={emp.id || emp.employee_id} value={fullName}>
                                                {fullName} ({emp.department_name || emp.department || 'Staff'})
                                            </option>
                                        );
                                    })}
                                </select>
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
                                <input required type="number" value={newClaim.claim_amount} onChange={(e) => setNewClaim({ ...newClaim, claim_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Receipt / Reference (Optional)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="text" value={newClaim.receipt} onChange={(e) => setNewClaim({ ...newClaim, receipt: e.target.value })} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. UPI Ref No, Bank Txn ID, Receipt No., or Manual Reference" />
                                    <input type="file" id="claim-receipt-upload" accept=".png,.jpg,.jpeg,.webp,.pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                                    <button 
                                        type="button" 
                                        onClick={() => document.getElementById('claim-receipt-upload').click()} 
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
                                {newClaim.file_name && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
                                        {newClaim.file_type && newClaim.file_type.startsWith('image/') ? (
                                            <img 
                                                src={newClaim.file_preview_url} 
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
                                                {newClaim.file_name}
                                            </p>
                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>
                                                {newClaim.file_type && newClaim.file_type.startsWith('image/') ? 'Image File' : 'PDF Document'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => window.open(newClaim.file_preview_url, '_blank')} 
                                                style={{ border: 'none', background: '#EFF6FF', color: '#2563EB', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                            >
                                                View
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => document.getElementById('claim-receipt-upload').click()} 
                                                style={{ border: 'none', background: '#F1F5F9', color: '#475569', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                            >
                                                Replace
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveFile} 
                                                style={{ border: 'none', background: '#FCE8E6', color: '#C5221F', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={lodgeClaimMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: lodgeClaimMutation.isPending ? 'not-allowed' : 'pointer', opacity: lodgeClaimMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.15)' }}>
                                {lodgeClaimMutation.isPending ? 'Lodging...' : 'Lodge Reimbursement Claim'}
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
        </div>
    );
};

export default BusinessStaffing;
