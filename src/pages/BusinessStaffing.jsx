import React, { useState, useMemo, useRef } from 'react';
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
    Send,
    Sliders,
    Sun,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    RotateCcw,
    CalendarCheck,
    Check
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { staffingService } from '../services/staffingService';
import { attendanceService } from '../services/attendanceService';
import { expensesService } from '../services/expensesService';
import { splitExpenseService } from '../services/splitExpenseService';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';
import LodgeStaffClaimModal from '../components/hr/LodgeStaffClaimModal';
import { useCurrency, useAuth } from '../context';
import { config } from '../lib/config';
import { getPlanLimit } from '../utils/subscriptionUtils';

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
    const navigate = useNavigate();
    const { currency, formatCurrency } = useCurrency();
    const { selectedPlan, user } = useAuth();
    const activePlan = selectedPlan || user?.tier || 'Free Plan';
    const staffLimit = getPlanLimit(activePlan, 'staff');
    const [activeTab, setActiveTab] = useState('profiles');
    const [colFilters, setColFilters] = React.useState({}); // 'profiles', 'employment', 'payroll', 'leaves', 'performance'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All');
    const [selectedShiftFilter, setSelectedShiftFilter] = useState('All');
    const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState('All');
    const [selectedQuickTag, setSelectedQuickTag] = useState('All');
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const isSubmittingOnboardRef = useRef(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [colFiltersHistory, setColFiltersHistory] = useState({});
    const [editForm, setEditForm] = useState({});

    // Dynamic Monthly Leave Quota & Roster States
    const [defaultLeaveQuota, setDefaultLeaveQuota] = useState(1.5);
    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
    const [tempQuota, setTempQuota] = useState(defaultLeaveQuota);
    const [applyToAll, setApplyToAll] = useState(false);

    // Dynamic Annual Holidays Roster States
    const [selectedHolidayYear, setSelectedHolidayYear] = useState(() => new Date().getFullYear());
    const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
    const [isEditHolidayModalOpen, setIsEditHolidayModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [newHolidayForm, setNewHolidayForm] = useState({
        name: '',
        date: '',
        type: 'Public Holiday'
    });
    const [editHolidayForm, setEditHolidayForm] = useState({
        name: '',
        date: '',
        type: 'Public Holiday'
    });

    const getDefaultHolidaysForYear = (year) => {
        const y = parseInt(year, 10) || new Date().getFullYear();
        
        // Accurate year-specific official gazetted & festival dates
        if (y === 2025) {
            return [
                { id: `ny-${y}`, date: `${y}-01-01`, displayDate: `01 Jan ${y}`, name: "New Year's Day", type: 'General Holiday' },
                { id: `pg-${y}`, date: `${y}-01-14`, displayDate: `14 Jan ${y}`, name: 'Pongal / Makar Sankranti', type: 'Festival' },
                { id: `rd-${y}`, date: `${y}-01-26`, displayDate: `26 Jan ${y}`, name: 'Republic Day', type: 'National Holiday' },
                { id: `ms-${y}`, date: `${y}-02-26`, displayDate: `26 Feb ${y}`, name: 'Maha Shivaratri', type: 'Festival' },
                { id: `hl-${y}`, date: `${y}-03-14`, displayDate: `14 Mar ${y}`, name: 'Holi', type: 'Festival' },
                { id: `ed-${y}`, date: `${y}-03-31`, displayDate: `31 Mar ${y}`, name: 'Eid-ul-Fitr', type: 'Festival' },
                { id: `gf-${y}`, date: `${y}-04-18`, displayDate: `18 Apr ${y}`, name: 'Good Friday', type: 'Festival' },
                { id: `md-${y}`, date: `${y}-05-01`, displayDate: `01 May ${y}`, name: 'May Day / Labor Day', type: 'State Holiday' },
                { id: `id-${y}`, date: `${y}-08-15`, displayDate: `15 Aug ${y}`, name: 'Independence Day', type: 'National Holiday' },
                { id: `gj-${y}`, date: `${y}-10-02`, displayDate: `02 Oct ${y}`, name: 'Gandhi Jayanti', type: 'National Holiday' },
                { id: `dw-${y}`, date: `${y}-10-20`, displayDate: `20 Oct ${y}`, name: 'Diwali / Deepavali', type: 'Festival' },
                { id: `xm-${y}`, date: `${y}-12-25`, displayDate: `25 Dec ${y}`, name: 'Christmas', type: 'Festival' }
            ];
        }

        if (y === 2026) {
            return [
                { id: `ny-${y}`, date: `${y}-01-01`, displayDate: `01 Jan ${y}`, name: "New Year's Day", type: 'General Holiday' },
                { id: `pg-${y}`, date: `${y}-01-15`, displayDate: `15 Jan ${y}`, name: 'Pongal / Makar Sankranti', type: 'Festival' },
                { id: `rd-${y}`, date: `${y}-01-26`, displayDate: `26 Jan ${y}`, name: 'Republic Day', type: 'National Holiday' },
                { id: `ms-${y}`, date: `${y}-02-15`, displayDate: `15 Feb ${y}`, name: 'Maha Shivaratri', type: 'Festival' },
                { id: `hl-${y}`, date: `${y}-03-04`, displayDate: `04 Mar ${y}`, name: 'Holi', type: 'Festival' },
                { id: `ed-${y}`, date: `${y}-03-21`, displayDate: `21 Mar ${y}`, name: 'Eid-ul-Fitr', type: 'Festival' },
                { id: `gf-${y}`, date: `${y}-04-03`, displayDate: `03 Apr ${y}`, name: 'Good Friday', type: 'Festival' },
                { id: `md-${y}`, date: `${y}-05-01`, displayDate: `01 May ${y}`, name: 'May Day / Labor Day', type: 'State Holiday' },
                { id: `id-${y}`, date: `${y}-08-15`, displayDate: `15 Aug ${y}`, name: 'Independence Day', type: 'National Holiday' },
                { id: `gj-${y}`, date: `${y}-10-02`, displayDate: `02 Oct ${y}`, name: 'Gandhi Jayanti', type: 'National Holiday' },
                { id: `ap-${y}`, date: `${y}-10-20`, displayDate: `20 Oct ${y}`, name: 'Ayudha Pooja / Diwali', type: 'Festival' },
                { id: `xm-${y}`, date: `${y}-12-25`, displayDate: `25 Dec ${y}`, name: 'Christmas', type: 'Festival' }
            ];
        }

        if (y === 2027) {
            return [
                { id: `ny-${y}`, date: `${y}-01-01`, displayDate: `01 Jan ${y}`, name: "New Year's Day", type: 'General Holiday' },
                { id: `pg-${y}`, date: `${y}-01-15`, displayDate: `15 Jan ${y}`, name: 'Pongal / Makar Sankranti', type: 'Festival' },
                { id: `rd-${y}`, date: `${y}-01-26`, displayDate: `26 Jan ${y}`, name: 'Republic Day', type: 'National Holiday' },
                { id: `ed-${y}`, date: `${y}-03-10`, displayDate: `10 Mar ${y}`, name: 'Eid-ul-Fitr', type: 'Festival' },
                { id: `hl-${y}`, date: `${y}-03-23`, displayDate: `23 Mar ${y}`, name: 'Holi', type: 'Festival' },
                { id: `gf-${y}`, date: `${y}-03-26`, displayDate: `26 Mar ${y}`, name: 'Good Friday', type: 'Festival' },
                { id: `md-${y}`, date: `${y}-05-01`, displayDate: `01 May ${y}`, name: 'May Day / Labor Day', type: 'State Holiday' },
                { id: `id-${y}`, date: `${y}-08-15`, displayDate: `15 Aug ${y}`, name: 'Independence Day', type: 'National Holiday' },
                { id: `gj-${y}`, date: `${y}-10-02`, displayDate: `02 Oct ${y}`, name: 'Gandhi Jayanti', type: 'National Holiday' },
                { id: `dw-${y}`, date: `${y}-11-08`, displayDate: `08 Nov ${y}`, name: 'Diwali / Deepavali', type: 'Festival' },
                { id: `xm-${y}`, date: `${y}-12-25`, displayDate: `25 Dec ${y}`, name: 'Christmas', type: 'Festival' }
            ];
        }

        if (y === 2028) {
            return [
                { id: `ny-${y}`, date: `${y}-01-01`, displayDate: `01 Jan ${y}`, name: "New Year's Day", type: 'General Holiday' },
                { id: `pg-${y}`, date: `${y}-01-15`, displayDate: `15 Jan ${y}`, name: 'Pongal / Makar Sankranti', type: 'Festival' },
                { id: `rd-${y}`, date: `${y}-01-26`, displayDate: `26 Jan ${y}`, name: 'Republic Day', type: 'National Holiday' },
                { id: `hl-${y}`, date: `${y}-03-11`, displayDate: `11 Mar ${y}`, name: 'Holi', type: 'Festival' },
                { id: `gf-${y}`, date: `${y}-04-14`, displayDate: `14 Apr ${y}`, name: 'Good Friday', type: 'Festival' },
                { id: `md-${y}`, date: `${y}-05-01`, displayDate: `01 May ${y}`, name: 'May Day / Labor Day', type: 'State Holiday' },
                { id: `id-${y}`, date: `${y}-08-15`, displayDate: `15 Aug ${y}`, name: 'Independence Day', type: 'National Holiday' },
                { id: `gj-${y}`, date: `${y}-10-02`, displayDate: `02 Oct ${y}`, name: 'Gandhi Jayanti', type: 'National Holiday' },
                { id: `dw-${y}`, date: `${y}-10-28`, displayDate: `28 Oct ${y}`, name: 'Diwali / Deepavali', type: 'Festival' },
                { id: `xm-${y}`, date: `${y}-12-25`, displayDate: `25 Dec ${y}`, name: 'Christmas', type: 'Festival' }
            ];
        }

        // Generic fallback for any other calendar year
        return [
            { id: `ny-${y}`, date: `${y}-01-01`, displayDate: `01 Jan ${y}`, name: "New Year's Day", type: 'General Holiday' },
            { id: `rd-${y}`, date: `${y}-01-26`, displayDate: `26 Jan ${y}`, name: 'Republic Day', type: 'National Holiday' },
            { id: `md-${y}`, date: `${y}-05-01`, displayDate: `01 May ${y}`, name: 'May Day / Labor Day', type: 'State Holiday' },
            { id: `id-${y}`, date: `${y}-08-15`, displayDate: `15 Aug ${y}`, name: 'Independence Day', type: 'National Holiday' },
            { id: `gj-${y}`, date: `${y}-10-02`, displayDate: `02 Oct ${y}`, name: 'Gandhi Jayanti', type: 'National Holiday' },
            { id: `ap-${y}`, date: `${y}-10-20`, displayDate: `20 Oct ${y}`, name: 'Ayudha Pooja / Diwali', type: 'Festival' },
            { id: `xm-${y}`, date: `${y}-12-25`, displayDate: `25 Dec ${y}`, name: 'Christmas', type: 'Festival' }
        ];
    };

    const [allYearHolidays, setAllYearHolidays] = useState(() => {
        try {
            const saved = localStorage.getItem('company_annual_holiday_roster');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        const curY = new Date().getFullYear();
        return {
            [curY]: getDefaultHolidaysForYear(curY),
            [curY + 1]: getDefaultHolidaysForYear(curY + 1)
        };
    });

    const activeYearHolidays = useMemo(() => {
        if (allYearHolidays[selectedHolidayYear]) {
            return allYearHolidays[selectedHolidayYear];
        }
        return getDefaultHolidaysForYear(selectedHolidayYear);
    }, [allYearHolidays, selectedHolidayYear]);

    const handleSaveHolidaysForYear = (year, updatedList) => {
        setAllYearHolidays(prev => {
            const next = { ...prev, [year]: updatedList };
            try {
                localStorage.setItem('company_annual_holiday_roster', JSON.stringify(next));
            } catch (e) {}
            return next;
        });
    };

    const handleAddCustomHoliday = (e) => {
        e.preventDefault();
        if (!newHolidayForm.name || !newHolidayForm.date) {
            alert('Please enter holiday name and date.');
            return;
        }

        let formattedDate = newHolidayForm.date;
        try {
            const parts = newHolidayForm.date.split('-');
            if (parts.length === 3) {
                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        } catch (err) {}

        const newEntry = {
            id: `custom-${Date.now()}`,
            date: newHolidayForm.date,
            displayDate: formattedDate,
            name: newHolidayForm.name.trim(),
            type: newHolidayForm.type || 'Company Holiday'
        };

        const updated = [...activeYearHolidays, newEntry].sort((a, b) => a.date.localeCompare(b.date));
        handleSaveHolidaysForYear(selectedHolidayYear, updated);
        setIsAddHolidayModalOpen(false);
        setNewHolidayForm({ name: '', date: '', type: 'Company Holiday' });
    };

    const handleOpenEditHoliday = (holiday) => {
        setEditingHoliday(holiday);
        setEditHolidayForm({
            name: holiday.name,
            date: holiday.date,
            type: holiday.type || 'Company Holiday'
        });
        setIsEditHolidayModalOpen(true);
    };

    const handleSaveEditedHoliday = (e) => {
        e.preventDefault();
        if (!editHolidayForm.name || !editHolidayForm.date) {
            alert('Please enter holiday name and date.');
            return;
        }

        let formattedDate = editHolidayForm.date;
        try {
            const parts = editHolidayForm.date.split('-');
            if (parts.length === 3) {
                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        } catch (err) {}

        const updated = activeYearHolidays.map(h => {
            if (h.id === editingHoliday.id) {
                return {
                    ...h,
                    name: editHolidayForm.name.trim(),
                    date: editHolidayForm.date,
                    displayDate: formattedDate,
                    type: editHolidayForm.type
                };
            }
            return h;
        }).sort((a, b) => a.date.localeCompare(b.date));

        handleSaveHolidaysForYear(selectedHolidayYear, updated);
        setIsEditHolidayModalOpen(false);
        setEditingHoliday(null);
    };

    const handleDeleteHoliday = (holidayId) => {
        const holiday = activeYearHolidays.find(h => h.id === holidayId);
        if (!window.confirm(`Are you sure you want to remove "${holiday?.name || 'this holiday'}" from the ${selectedHolidayYear} schedule?`)) {
            return;
        }
        const updated = activeYearHolidays.filter(h => h.id !== holidayId);
        handleSaveHolidaysForYear(selectedHolidayYear, updated);
    };

    const handleResetYearHolidays = () => {
        if (!window.confirm(`Reset ${selectedHolidayYear} holiday roster to standard official public holidays?`)) {
            return;
        }
        const defaultList = getDefaultHolidaysForYear(selectedHolidayYear);
        handleSaveHolidaysForYear(selectedHolidayYear, defaultList);
    };

    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [rosterForm, setRosterForm] = useState({
        employee_id: '',
        employee_name: '',
        basic_salary: 35000,
        shift_mode: 'preset', // 'preset' | 'custom'
        preset_shift: 'General Shift (9 AM - 6 PM)',
        custom_shift_name: '',
        custom_start_time: '09:00 AM',
        custom_end_time: '06:00 PM',
        monthly_leave_quota: 1.5,
        leave_balance: 18,
        sync_balance: false,
        bonus_mode: 'percentage', // 'percentage' | 'fixed'
        annual_bonus_pct: 10,
        annual_bonus_amt: '',
        weekly_off: 'Sunday Off',
        custom_weekly_off: ''
    });

    // Helpers for precise local calendar dates (prevents UTC date shifts)
    const getTodayLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getYesterdayLocalDate = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 1. Calculate Yesterday's Date as max limit (blocks today & future dates)
    const maxDobDate = useMemo(() => {
        return getYesterdayLocalDate();
    }, []);

    // 2. Dynamic Age Calculator Helper
    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const birthDate = new Date(dobString);
        const today = new Date();

        if (isNaN(birthDate.getTime()) || birthDate >= today) return null;

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 0 ? age : null;
    };

    const handleOnboardDobChange = (e) => {
        const selectedDate = e.target.value;
        const todayStr = new Date().toISOString().split('T')[0];

        // Reject today or future dates if manually entered
        if (selectedDate >= todayStr) {
            return;
        }

        setNewEmp((prev) => ({
            ...prev,
            date_of_birth: selectedDate,
        }));
    };

    const handleEditDobChange = (e) => {
        const selectedDate = e.target.value;
        const todayStr = new Date().toISOString().split('T')[0];

        // Reject today or future dates if manually entered
        if (selectedDate >= todayStr) {
            return;
        }

        setEditForm((prev) => ({
            ...prev,
            date_of_birth: selectedDate,
        }));
    };

    // Interactive attendance marking states
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(getTodayLocalDate());
    const [attendanceStatus, setAttendanceStatus] = useState('Present');
    const [attendanceNote, setAttendanceNote] = useState('');
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [allowOverwrite, setAllowOverwrite] = useState(false);

    // Reimbursement module state variables
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [claimAmountError, setClaimAmountError] = useState('');
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
            file_preview_url: '',
            proof_file_path: ''
        });
        const fileInput = document.getElementById('claim-receipt-upload');
        if (fileInput) {
            fileInput.value = '';
        }
        setClaimAmountError('');
        setIsClaimModalOpen(false);
    };
    const [reimbSearchTerm, setReimbSearchTerm] = useState('');
    const [reimbStatusFilter, setReimbStatusFilter] = useState('All');
    const [reimbCurrentPage, setReimbCurrentPage] = useState(1);
    const claimsPerPage = 10;

    // Trigger instant onboarding flow from dashboard shortcuts
    const [searchParams, setSearchParams] = useSearchParams();

    const queryClient = useQueryClient();

    // Query for Live Employees from staff database
    const { data: dbEmployees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => staffingService.getEmployees()
    });

    // Query for claims list
    const { data: dbClaims = [], refetch: refetchClaims } = useQuery({
        queryKey: ['claimsList'],
        queryFn: () => expensesService.getClaims()
    });

    // Query for Live Attendance from backend database
    const { data: dbAttendances = [], refetch: refetchAttendances } = useQuery({
        queryKey: ['attendanceLogs'],
        queryFn: () => attendanceService.getAttendanceLogs()
    });

    // Helper to get attendance logs for a specific employee from backend data
    const getEmployeeAttendance = (empId) => {
        if (!empId || !Array.isArray(dbAttendances)) return [];
        const filtered = dbAttendances.filter(a => 
            String(a.employee_id) === String(empId) || 
            a.employee_id === empId
        );
        // Enforce strict deduplication by date so each day is counted only once
        const seenDates = new Set();
        const unique = [];
        for (const item of filtered) {
            if (item && item.date && !seenDates.has(item.date)) {
                seenDates.add(item.date);
                unique.push(item);
            }
        }
        return unique;
    };

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
            setClaimAmountError('');
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
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['claimsList'] });
            const previousClaims = queryClient.getQueryData(['claimsList']);
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Approved' } : item);
            });
            return { previousClaims };
        },
        onSuccess: async (_data, id) => {
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Approved' } : item);
            });
            await queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            await queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            refetchClaims();
            alert('Claim approved successfully!');
        },
        onError: (err, _id, context) => {
            if (context?.previousClaims) {
                queryClient.setQueryData(['claimsList'], context.previousClaims);
            }
            console.error('Approve claim error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to approve claim';
            alert(`Approval failed: ${msg}`);
        }
    });

    const rejectClaimMutation = useMutation({
        mutationFn: ({ id, reason }) => expensesService.rejectClaim(id, { reason }),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['claimsList'] });
            const previousClaims = queryClient.getQueryData(['claimsList']);
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Rejected' } : item);
            });
            return { previousClaims };
        },
        onSuccess: async (_data, { id }) => {
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Rejected' } : item);
            });
            await queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            refetchClaims();
            alert('Claim rejected successfully!');
        },
        onError: (err, _vars, context) => {
            if (context?.previousClaims) {
                queryClient.setQueryData(['claimsList'], context.previousClaims);
            }
            console.error('Reject claim error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to reject claim';
            alert(`Rejection failed: ${msg}`);
        }
    });

    const payClaimMutation = useMutation({
        mutationFn: ({ id, data }) => expensesService.payClaim(id, data),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['claimsList'] });
            const previousClaims = queryClient.getQueryData(['claimsList']);
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Paid' } : item);
            });
            return { previousClaims };
        },
        onSuccess: async (_data, { id }) => {
            queryClient.setQueryData(['claimsList'], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map(item => String(item.id) === String(id) ? { ...item, reimbursement_status: 'Paid' } : item);
            });
            await queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            await queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            setIsPaymentModalOpen(false);
            refetchClaims();
            alert('Claim marked as Paid and reimbursed successfully!');
        },
        onError: (err, _vars, context) => {
            if (context?.previousClaims) {
                queryClient.setQueryData(['claimsList'], context.previousClaims);
            }
            console.error('Pay claim error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to process payment';
            alert(`Payment failed: ${msg}`);
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
        const term = (reimbSearchTerm || '').trim().toLowerCase();
        const matchesSearch = !term || 
            (cl.employee_name && cl.employee_name.toLowerCase().includes(term)) ||
            (cl.travel_expense && cl.travel_expense.toLowerCase().includes(term)) ||
            (cl.display_claim_id && cl.display_claim_id.toLowerCase().includes(term)) ||
            `CLM-${cl.claim_id}`.toLowerCase().includes(term) ||
            String(cl.claim_id).toLowerCase().includes(term) ||
            (cl.reimbursement_status && cl.reimbursement_status.toLowerCase().includes(term)) ||
            cl.claim_amount.toString().includes(term);

        const statusLower = (cl.reimbursement_status || '').toLowerCase();
        let matchesStatus = true;
        if (reimbStatusFilter === 'Pending') {
            matchesStatus = statusLower.includes('pending');
        } else if (reimbStatusFilter !== 'All') {
            matchesStatus = statusLower === reimbStatusFilter.toLowerCase();
        }

        return matchesSearch && matchesStatus;
    });

    const totalClaimsPages = Math.ceil(filteredClaims.length / claimsPerPage) || 1;
    const paginatedClaims = filteredClaims.slice((reimbCurrentPage - 1) * claimsPerPage, reimbCurrentPage * claimsPerPage);

    const createEmpMutation = useMutation({
        mutationFn: async (data) => {
            const res = await staffingService.createEmployee(data);
            const empId = res.data?.id || res.id;
            if (empId) {
                // Ensure all fields including dynamic roster columns are updated
                await staffingService.updateEmployee(empId, {
                    address: data.address,
                    emergency_contact: data.emergency_contact,
                    bank_details: data.bank_details,
                    shift: data.shift,
                    deduct_tds: data.deduct_tds,
                    monthly_leave_quota: data.monthly_leave_quota,
                    annual_bonus: data.annual_bonus,
                    weekly_off: data.weekly_off,
                    esi_number: data.esi_number,
                    employee_code: data.employee_code
                });
            }
            return res;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Employee onboarding sequence completed! Welcome package circular emailed.');
            setNewEmp(initialEmpState);
            setIsOnboardModalOpen(false);
        },
        onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to onboard employee.');
        },
        onSettled: () => {
            isSubmittingOnboardRef.current = false;
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
        },
        onError: (err) => {
            console.error('[Performance Appraisal Error]:', err);
            alert(err.response?.data?.message || err.message || 'Failed to update employee appraisal review.');
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
            const msg = err.response?.data?.message || err.message || 'Failed to save changes. Please try again.';
            alert(msg);
        }
    });

    const updateRosterMutation = useMutation({
        mutationFn: ({ id, data }) => staffingService.updateEmployee(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert('Roster shift timing, leave quota & bonus settings updated successfully!');
            setIsRosterModalOpen(false);
        },
        onError: (err) => {
            console.error('Update Roster Error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to save roster settings. Please try again.';
            alert(msg);
        }
    });

    const handleOpenRosterModal = (emp) => {
        const standardShifts = [
            'General Shift (9 AM - 6 PM)',
            'Morning Shift (6 AM - 2 PM)',
            'Evening Shift (2 PM - 10 PM)',
            'Night Shift (10 PM - 6 AM)'
        ];
        const isCustomShift = emp.shift_name && !standardShifts.includes(emp.shift_name);
        
        let customTitle = emp.shift_name || 'General Shift';
        let customStart = '09:00 AM';
        let customEnd = '06:00 PM';
        if (isCustomShift && emp.shift_name) {
            const match = emp.shift_name.match(/^(.*?)\s*\((.*?)\s*-\s*(.*?)\)$/);
            if (match) {
                customTitle = match[1];
                customStart = match[2];
                customEnd = match[3];
            }
        }

        const standardWeekOffs = [
            'Sunday Off',
            'Saturday & Sunday Off',
            'Friday Off',
            'Monday Off',
            'Tuesday Off',
            'Wednesday Off',
            'Thursday Off',
            'Rotational Off'
        ];
        const isCustomWeekOff = emp.weekly_off && !standardWeekOffs.includes(emp.weekly_off);

        setRosterForm({
            employee_id: emp.employee_id || emp.id,
            employee_name: `${emp.first_name} ${emp.last_name}`,
            basic_salary: emp.basic_salary,
            shift_mode: isCustomShift ? 'custom' : 'preset',
            preset_shift: isCustomShift ? 'General Shift (9 AM - 6 PM)' : (emp.shift_name || 'General Shift (9 AM - 6 PM)'),
            custom_shift_name: customTitle,
            custom_start_time: customStart,
            custom_end_time: customEnd,
            monthly_leave_quota: (emp.monthly_leave_quota !== undefined && emp.monthly_leave_quota !== null && emp.monthly_leave_quota !== '') ? emp.monthly_leave_quota : defaultLeaveQuota,
            leave_balance: (emp.leave_balance !== undefined && emp.leave_balance !== null && emp.leave_balance !== '') ? emp.leave_balance : 0,
            sync_balance: false,
            bonus_mode: (emp.annual_bonus !== null && emp.annual_bonus !== undefined && emp.annual_bonus > 0) ? 'fixed' : 'percentage',
            annual_bonus_pct: emp.annual_bonus_pct !== undefined ? emp.annual_bonus_pct : 10,
            annual_bonus_amt: emp.annual_bonus || '',
            weekly_off: isCustomWeekOff ? 'Custom' : (emp.weekly_off || 'Sunday Off'),
            custom_weekly_off: isCustomWeekOff ? emp.weekly_off : ''
        });
        setIsRosterModalOpen(true);
    };

    const handleSaveRoster = (e) => {
        e.preventDefault();
        let finalShift = rosterForm.preset_shift;
        if (rosterForm.shift_mode === 'custom') {
            const title = (rosterForm.custom_shift_name || '').trim() || 'Custom Shift';
            finalShift = `${title} (${rosterForm.custom_start_time} - ${rosterForm.custom_end_time})`;
        }

        let finalWeeklyOff = rosterForm.weekly_off;
        if (rosterForm.weekly_off === 'Custom') {
            finalWeeklyOff = (rosterForm.custom_weekly_off || '').trim() || 'Sunday Off';
        }

        const parsedQuota = parseFloat(rosterForm.monthly_leave_quota);
        const quota = (!isNaN(parsedQuota) && rosterForm.monthly_leave_quota !== '' && rosterForm.monthly_leave_quota !== null) 
            ? Math.min(31, Math.max(0, parsedQuota)) 
            : defaultLeaveQuota;

        const parsedBal = parseFloat(rosterForm.leave_balance);
        const rawBal = rosterForm.sync_balance 
            ? Math.round(quota * 12) 
            : ((!isNaN(parsedBal) && rosterForm.leave_balance !== '' && rosterForm.leave_balance !== null) ? parsedBal : 0);
        
        // Strict restrictions: Annual leave balance cannot exceed 60 days
        const newBalance = Math.min(60, Math.max(0, rawBal));

        if (!rosterForm.sync_balance && parsedBal > 60) {
            alert('Annual leave balance cannot exceed 60 days. It has been capped at 60 days.');
        }

        const rawBonusAmt = parseFloat(rosterForm.annual_bonus_amt);
        const annualBonusAmt = rosterForm.bonus_mode === 'fixed' 
            ? Math.min(10000000, Math.max(0, !isNaN(rawBonusAmt) ? rawBonusAmt : 0)) 
            : null;

        const rawBonusPct = parseFloat(rosterForm.annual_bonus_pct);
        const annualBonusPct = rosterForm.bonus_mode === 'percentage' 
            ? Math.min(100, Math.max(0, !isNaN(rawBonusPct) ? rawBonusPct : 10)) 
            : null;

        const emp = employees.find(e => String(e.employee_id) === String(rosterForm.employee_id) || String(e.id) === String(rosterForm.employee_id));
        let addrMeta = {};
        if (emp && (emp.address || emp.raw_address)) {
            addrMeta = safeParse(emp.address || emp.raw_address);
        }

        const payload = {
            shift: JSON.stringify({ shift: finalShift, shift_name: finalShift }),
            monthly_leave_quota: quota,
            annual_bonus: annualBonusAmt,
            annual_bonus_pct: annualBonusPct,
            weekly_off: finalWeeklyOff,
            leave_balance: newBalance,
            address: JSON.stringify({
                ...addrMeta,
                shift_name: finalShift,
                monthly_leave_quota: quota,
                annual_bonus: annualBonusAmt,
                annual_bonus_pct: annualBonusPct,
                weekly_off: finalWeeklyOff,
                leave_balance: newBalance
            })
        };

        updateRosterMutation.mutate({ id: rosterForm.employee_id, data: payload });
    };

    const handleSaveCompanyQuota = async (e) => {
        e.preventDefault();
        const parsed = parseFloat(tempQuota);
        const val = (!isNaN(parsed) && tempQuota !== '' && tempQuota !== null) ? Math.max(0, parsed) : 1.5;
        setDefaultLeaveQuota(val);
        
        if (applyToAll && employees.length > 0) {
            for (const emp of employees) {
                const newBal = Math.round(val * 12);
                let addrMeta = {};
                if (emp.address) addrMeta = safeParse(emp.address);
                await staffingService.updateEmployee(emp.employee_id, {
                    monthly_leave_quota: val,
                    leave_balance: newBal,
                    address: JSON.stringify({
                        ...addrMeta,
                        monthly_leave_quota: val,
                        leave_balance: newBal
                    })
                }).catch(() => {});
            }
            await queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
        setIsQuotaModalOpen(false);
        alert(`Standard Monthly Leave Quota updated to ${val} Days / Month (${(val * 12).toFixed(1)} Days / Year)${applyToAll ? ' and synced to all employees' : ''}!`);
    };

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
            id: e.id,
            employee_id: e.id,
            raw_address: e.address,
            address: e.address,
            employee_code: e.employee_code || addrMeta.employee_code || addrMeta.employee_id || `CLK-00${e.id}`,
            employee_status: e.status || 'active',
            joining_date: e.hire_date || addrMeta.joining_date || '2026-05-08',
            first_name: e.name ? e.name.split(' ')[0] : 'Karan',
            last_name: e.name && e.name.split(' ').length > 1 ? e.name.split(' ')[1] : 'Mehra',
            gender: e.gender || addrMeta.gender || 'Male',
            date_of_birth: e.date_of_birth || addrMeta.date_of_birth || '1995-05-10',
            blood_group: e.blood_group || addrMeta.blood_group || 'O+',
            phone_number: e.phone || '+91 91111 22222',
            email: e.email || 'karan.mehra@clikbusiness.com',
            emergency_contact_name: e.emergency_contact ? (safeParse(e.emergency_contact).name || '') : '',
            emergency_contact_number: e.emergency_contact ? (safeParse(e.emergency_contact).phone || '') : '',
            address_line_1: e.address ? (addrMeta.line1 || '') : (e.address || ''),
            city: e.city || addrMeta.city || '',
            state: e.state || addrMeta.state || '',
            pincode: e.pincode || addrMeta.pincode || '',
            deduct_tds: addrMeta.deduct_tds !== undefined ? Boolean(addrMeta.deduct_tds) : (e.deduct_tds !== undefined ? Boolean(e.deduct_tds) : false),
            department_name: e.department || 'Operations',
            designation_name: e.designation || addrMeta.designation_name || 'Staff',
            reporting_manager: e.reporting_manager || addrMeta.reporting_manager || '',
            employment_type: e.employment_type || addrMeta.employment_type || 'Full-time',
            salary_type: e.salary_type || addrMeta.salary_type || 'Monthly',
            basic_salary: parseFloat(e.salary) || 0,
            bank_name: e.bank_details ? (safeParse(e.bank_details).bank_name || '') : '',
            account_number: e.bank_details ? (safeParse(e.bank_details).account_number || '') : '',
            ifsc_code: e.bank_details ? (safeParse(e.bank_details).ifsc_code || '') : '',
            pf_number: e.pf_number || addrMeta.pf_number || '',
            pan_number: e.pan_number || addrMeta.pan_number || '',
            esi_number: e.esi_number || addrMeta.esi_number || '',
            aadhaar_file: 'aadhaar_arun.pdf',
            pan_file: 'pan_arun.pdf',
            shift_name: e.shift ? (typeof e.shift === 'string' && e.shift.startsWith('{') ? (safeParse(e.shift).shift || safeParse(e.shift).shift_name || e.shift) : e.shift) : (addrMeta.shift_name || 'General Shift (9 AM - 6 PM)'),
            leave_balance: (e.leave_balance !== undefined && e.leave_balance !== null && e.leave_balance !== '') ? parseFloat(e.leave_balance) : ((addrMeta.leave_balance !== undefined && addrMeta.leave_balance !== null && addrMeta.leave_balance !== '') ? parseFloat(addrMeta.leave_balance) : 0),
            monthly_leave_quota: (e.monthly_leave_quota !== undefined && e.monthly_leave_quota !== null && e.monthly_leave_quota !== '') ? parseFloat(e.monthly_leave_quota) : ((addrMeta.monthly_leave_quota !== undefined && addrMeta.monthly_leave_quota !== null && addrMeta.monthly_leave_quota !== '') ? parseFloat(addrMeta.monthly_leave_quota) : defaultLeaveQuota),
            annual_bonus: (e.annual_bonus !== undefined && e.annual_bonus !== null && e.annual_bonus !== '') ? parseFloat(e.annual_bonus) : ((addrMeta.annual_bonus !== undefined && addrMeta.annual_bonus !== null && addrMeta.annual_bonus !== '') ? parseFloat(addrMeta.annual_bonus) : null),
            annual_bonus_pct: (e.annual_bonus_pct !== undefined && e.annual_bonus_pct !== null && e.annual_bonus_pct !== '') ? parseFloat(e.annual_bonus_pct) : ((addrMeta.annual_bonus_pct !== undefined && addrMeta.annual_bonus_pct !== null) ? parseFloat(addrMeta.annual_bonus_pct) : 10),
            weekly_off: e.weekly_off || addrMeta.weekly_off || 'Sunday Off',
            performance_rating: (e.performance_rating !== null && e.performance_rating !== undefined && e.performance_rating !== '') 
                ? parseFloat(e.performance_rating) 
                : ((addrMeta.performance_rating !== null && addrMeta.performance_rating !== undefined && addrMeta.performance_rating !== '') 
                    ? parseFloat(addrMeta.performance_rating) 
                    : null),
            target_score: (e.target_score !== null && e.target_score !== undefined && e.target_score !== '') 
                ? parseFloat(e.target_score) 
                : ((addrMeta.target_score !== null && addrMeta.target_score !== undefined && addrMeta.target_score !== '') 
                    ? parseFloat(addrMeta.target_score) 
                    : null),
            role_name: e.role || 'Staff Personnel'
        };
    }) : [];

    // Initial empty employee form state
    const initialEmpState = {
        employee_code: '',
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
        esi_number: '',
        pf_number: '',
        pan_number: '',
        shift_name: 'General Shift (9 AM - 6 PM)',
        leave_balance: defaultLeaveQuota * 12 || 18,
        monthly_leave_quota: defaultLeaveQuota,
        annual_bonus: '',
        annual_bonus_pct: 10,
        weekly_off: 'Sunday Off',
        date_of_birth: '',
        blood_group: 'O+',
        employment_type: 'Full-time',
        joining_date: new Date().toISOString().split('T')[0],
        reporting_manager: '',
        address_line_1: '',
        city: '',
        state: '',
        pincode: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        deduct_tds: false
    };

    // Form onboarding states
    const [newEmp, setNewEmp] = useState(initialEmpState);

    // Trigger instant onboarding flow from dashboard shortcuts
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            const nextCode = `CLK-00${(dbEmployees.length || 0) + 1}`;
            setNewEmp({ ...initialEmpState, employee_code: nextCode });
            setIsOnboardModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams, dbEmployees.length]);

    // Custom department states and helpers
    const DEFAULT_DEPARTMENTS = useMemo(() => [
        'Sales', 'HR', 'Operations', 'Finance', 'Marketing', 'Engineering', 'Logistics', 'Quality & Compliance'
    ], []);

    const [customDepartments, setCustomDepartments] = useState(() => {
        try {
            const saved = localStorage.getItem('pos_custom_departments');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const allDepartments = useMemo(() => {
        const list = [...DEFAULT_DEPARTMENTS, ...customDepartments];
        employees.forEach(emp => {
            if (emp.department_name && !list.includes(emp.department_name)) {
                list.push(emp.department_name);
            }
        });
        return Array.from(new Set(list.filter(Boolean)));
    }, [DEFAULT_DEPARTMENTS, customDepartments, employees]);

    const [showAddDeptOnboard, setShowAddDeptOnboard] = useState(false);
    const [newDeptInputOnboard, setNewDeptInputOnboard] = useState('');
    const [showAddDeptEdit, setShowAddDeptEdit] = useState(false);
    const [newDeptInputEdit, setNewDeptInputEdit] = useState('');

    const addCustomDepartment = (deptName) => {
        const trimmed = (deptName || '').trim();
        if (!trimmed) return null;
        if (!customDepartments.includes(trimmed) && !DEFAULT_DEPARTMENTS.includes(trimmed)) {
            const updated = [...customDepartments, trimmed];
            setCustomDepartments(updated);
            try {
                localStorage.setItem('pos_custom_departments', JSON.stringify(updated));
            } catch (e) {}
        }
        return trimmed;
    };

    // Strict Indian PAN Sanitizer & Validator (Format: 5 letters, 4 digits, 1 letter)
    const sanitizePanInput = (rawVal) => {
        if (!rawVal) return '';
        const clean = String(rawVal).toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        for (let i = 0; i < clean.length && i < 10; i++) {
            const ch = clean[i];
            if (i < 5) {
                if (/[A-Z]/.test(ch)) formatted += ch;
            } else if (i >= 5 && i < 9) {
                if (/[0-9]/.test(ch)) formatted += ch;
            } else if (i === 9) {
                if (/[A-Z]/.test(ch)) formatted += ch;
            }
        }
        return formatted;
    };

    const isValidPan = (pan) => {
        if (!pan || !String(pan).trim()) return true; // Optional field
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(pan).trim().toUpperCase());
    };

    // Strict Indian PF / UAN Sanitizer & Validator (EPFO Member ID or 12-digit UAN)
    const sanitizePfInput = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).toUpperCase().replace(/[^A-Z0-9\/]/g, '').slice(0, 26);
    };

    const isValidPf = (pf) => {
        if (!pf || !String(pf).trim()) return true; // Optional field
        const clean = String(pf).trim().toUpperCase();
        // 12-digit UAN
        if (/^[0-9]{12}$/.test(clean)) return true;
        // Standard EPFO Member ID format (e.g., MH/BAN/0011223 or MH/BAN/0011223/000/0001234 or MHBAN00112230000001234)
        if (/^[A-Z]{2}[/A-Z]{0,4}[0-9/]{5,20}$/.test(clean)) return true;
        return false;
    };

    // Strict Indian ESI Number Sanitizer & Validator (Exactly 17 digits)
    const sanitizeEsiInput = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).replace(/[^0-9]/g, '').slice(0, 17);
    };

    const isValidEsi = (esi) => {
        if (!esi || !String(esi).trim()) return true; // Optional field
        return /^[0-9]{17}$/.test(String(esi).trim());
    };

    // Strict Indian Bank Account Number Sanitizer & Validator (9 to 18 numeric digits)
    const sanitizeAccountNo = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).replace(/[^0-9]/g, '').slice(0, 18);
    };

    const isValidAccountNo = (acc) => {
        if (!acc || !String(acc).trim()) return true; // Optional field
        return /^[0-9]{9,18}$/.test(String(acc).trim());
    };

    // Strict Indian IFSC Code Sanitizer & Validator (11 chars: 4 letters, '0', 6 alphanumeric)
    const sanitizeIfscInput = (rawVal) => {
        if (!rawVal) return '';
        const clean = String(rawVal).toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        for (let i = 0; i < clean.length && i < 11; i++) {
            const ch = clean[i];
            if (i < 4) {
                if (/[A-Z]/.test(ch)) formatted += ch;
            } else if (i === 4) {
                if (ch === '0' || /[0-9]/.test(ch)) formatted += '0';
            } else {
                if (/[A-Z0-9]/.test(ch)) formatted += ch;
            }
        }
        return formatted;
    };

    const isValidIfsc = (ifsc) => {
        if (!ifsc || !String(ifsc).trim()) return true; // Optional field
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).trim().toUpperCase());
    };

    // General string & name sanitizers
    const sanitizeName = (rawVal, maxLen = 40) => {
        if (!rawVal) return '';
        return String(rawVal).replace(/[^a-zA-Z\s]/g, '').slice(0, maxLen);
    };

    const sanitizePhone = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).replace(/[^0-9]/g, '').slice(0, 10);
    };

    const isValidPhone = (phone) => {
        if (!phone) return false;
        return /^[6-9][0-9]{9}$/.test(String(phone).trim());
    };

    const sanitizePincode = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).replace(/[^0-9]/g, '').slice(0, 6);
    };

    const isValidPincode = (pin) => {
        if (!pin || !String(pin).trim()) return true; // Optional field
        return /^[0-9]{6}$/.test(String(pin).trim());
    };

    const sanitizeEmpCode = (rawVal) => {
        if (!rawVal) return '';
        return String(rawVal).toUpperCase().replace(/[^A-Z0-9\-\/]/g, '').slice(0, 16);
    };

    // Dynamic Appraisal Due Date Calculator
    const getAppraisalDueDate = (joiningDateStr) => {
        if (!joiningDateStr) return 'Pending Schedule';
        try {
            const joinDate = new Date(joiningDateStr);
            if (isNaN(joinDate.getTime())) return 'Pending Schedule';
            const dueDate = new Date(joinDate);
            dueDate.setDate(dueDate.getDate() + 90);
            return dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return 'Pending Schedule';
        }
    };

    // Form performance review states
    const [perfForm, setPerfForm] = useState({
        employee_id: '',
        rating: 5.0,
        target_score: 95
    });

    // Performance review modal open handler
    const handleOpenFileAppraisal = (targetEmpId = null) => {
        let targetEmp = null;
        if (targetEmpId) {
            targetEmp = employees.find(emp => 
                String(emp.employee_id) === String(targetEmpId) || 
                String(emp.id) === String(targetEmpId) || 
                String(emp.employee_code) === String(targetEmpId)
            );
        }
        if (!targetEmp && employees.length > 0) {
            targetEmp = employees[0];
        }

        setPerfForm({
            employee_id: targetEmp ? String(targetEmp.employee_id || targetEmp.id) : '',
            rating: targetEmp && targetEmp.performance_rating ? parseFloat(targetEmp.performance_rating) : 5.0,
            target_score: targetEmp && targetEmp.target_score ? parseInt(targetEmp.target_score) : 95
        });
        setIsPerformanceModalOpen(true);
    };

    // Handle employee onboarding submit
    const handleOnboardSubmit = (e) => {
        e.preventDefault();

        // Prevent duplicate submissions on rapid clicks
        if (isSubmittingOnboardRef.current || createEmpMutation.isPending) {
            return;
        }
        isSubmittingOnboardRef.current = true;

        const activePlan = selectedPlan || user?.tier || 'Starter Plan';
        const maxStaff = activePlan === 'Elite Suite' ? Infinity : (activePlan === 'Growth Plan' ? 25 : 5);
        if (employees.length >= maxStaff) {
            alert(`You have reached the maximum limit of ${maxStaff} staff profiles for your ${activePlan}. Upgrade your subscription plan for additional staff capacity.`);
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Name validation
        const cleanFirstName = sanitizeName(newEmp.first_name, 35);
        const cleanLastName = sanitizeName(newEmp.last_name, 35);
        if (!cleanFirstName || !cleanLastName) {
            alert('Please enter both valid First Name and Last Name (letters only).');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Phone validation
        const cleanStaffPhone = sanitizePhone(newEmp.phone_number);
        if (!isValidPhone(cleanStaffPhone)) {
            alert('Please enter a valid 10-digit mobile phone number starting with 6, 7, 8, or 9.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Email validation
        const cleanEmail = (newEmp.email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            alert('Please enter a valid corporate email address (e.g. employee@bnxmail.com).');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Emergency contact cannot be same as staff contact
        const cleanEmergPhone = sanitizePhone(newEmp.emergency_contact_number);
        if (cleanStaffPhone && cleanEmergPhone) {
            if (cleanStaffPhone === cleanEmergPhone || (cleanStaffPhone.length >= 10 && cleanEmergPhone.length >= 10 && cleanStaffPhone.slice(-10) === cleanEmergPhone.slice(-10))) {
                alert('Emergency contact number cannot be the same as the staff phone number. Please enter a different emergency contact number.');
                isSubmittingOnboardRef.current = false;
                return;
            }
        }

        // ESI Number must be unique
        const finalEsi = sanitizeEsiInput(newEmp.esi_number);
        if (finalEsi) {
            if (!isValidEsi(finalEsi)) {
                alert('Please enter a valid 17-digit ESI number (digits only, e.g. 31001234560000001) or leave it blank.');
                isSubmittingOnboardRef.current = false;
                return;
            }
            const existingWithEsi = employees.find(emp => (emp.esi_number || '').trim().toLowerCase() === finalEsi.toLowerCase());
            if (existingWithEsi) {
                alert(`ESI Number "${finalEsi}" is already assigned to ${existingWithEsi.name || 'another staff member'}. ESI Number must be unique.`);
                isSubmittingOnboardRef.current = false;
                return;
            }
        }

        // PAN validation
        const finalPan = sanitizePanInput(newEmp.pan_number);
        if (newEmp.pan_number && !isValidPan(finalPan)) {
            alert('Please enter a valid 10-character Indian PAN number (e.g. ABCDE1234F, format: 5 letters, 4 digits, 1 letter) or leave it blank.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // PF validation
        const finalPf = sanitizePfInput(newEmp.pf_number);
        if (newEmp.pf_number && !isValidPf(finalPf)) {
            alert('Please enter a valid PF number (e.g. MH/BAN/0011223 or 12-digit UAN like 100123456789) or leave it blank.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Bank Account validation
        const finalAccountNo = sanitizeAccountNo(newEmp.account_number);
        if (newEmp.account_number && !isValidAccountNo(finalAccountNo)) {
            alert('Please enter a valid 9 to 18-digit bank account number or leave it blank.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // IFSC validation
        const finalIfsc = sanitizeIfscInput(newEmp.ifsc_code);
        if (newEmp.ifsc_code && !isValidIfsc(finalIfsc)) {
            alert('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0000124 - 4 letters, 0, 6 alphanumeric characters) or leave it blank.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        // Pincode validation
        const finalPincode = sanitizePincode(newEmp.pincode);
        if (newEmp.pincode && !isValidPincode(finalPincode)) {
            alert('Please enter a valid 6-digit postal pincode (e.g. 600001) or leave it blank.');
            isSubmittingOnboardRef.current = false;
            return;
        }

        const finalEmployeeCode = sanitizeEmpCode(newEmp.employee_code) || `CLK-00${(dbEmployees.length || 0) + 1}`;
        const finalDesignation = (newEmp.designation_name || '').trim().slice(0, 40) || 'Staff';
        const finalSalary = newEmp.basic_salary !== '' && newEmp.basic_salary !== undefined ? Math.max(0, parseFloat(newEmp.basic_salary) || 0) : 0;
        const finalBankName = (newEmp.bank_name || '').replace(/[^a-zA-Z\s.\-]/g, '').trim().slice(0, 50);
        const finalManager = sanitizeName(newEmp.reporting_manager, 40);
        const finalShift = newEmp.shift_name || 'General Shift (9 AM - 6 PM)';
        const finalAddress = (newEmp.address_line_1 || '').trim().slice(0, 100);
        const finalCity = sanitizeName(newEmp.city, 35);
        const finalState = sanitizeName(newEmp.state, 35);
        const finalEmergName = sanitizeName(newEmp.emergency_contact_name, 40);
        const finalMonthlyQuota = newEmp.monthly_leave_quota !== undefined && newEmp.monthly_leave_quota !== '' ? parseFloat(newEmp.monthly_leave_quota) : defaultLeaveQuota;
        const finalBonus = newEmp.annual_bonus !== undefined && newEmp.annual_bonus !== '' ? parseFloat(newEmp.annual_bonus) : null;
        const finalWeeklyOff = newEmp.weekly_off || 'Sunday Off';
        const finalLeaveBalance = (defaultLeaveQuota !== undefined && !isNaN(defaultLeaveQuota)) ? Math.round(defaultLeaveQuota * 12) : 18;
        const finalTargetScore = newEmp.target_score !== '' && newEmp.target_score !== undefined && !isNaN(Number(newEmp.target_score)) ? Math.min(100, Math.max(0, parseFloat(newEmp.target_score))) : null;
        const finalPerfRating = newEmp.performance_rating !== '' && newEmp.performance_rating !== undefined && !isNaN(Number(newEmp.performance_rating)) ? Math.min(5, Math.max(1, parseFloat(newEmp.performance_rating))) : null;

        createEmpMutation.mutate({
            name: `${newEmp.first_name} ${newEmp.last_name}`,
            role: 'Staff',
            email: newEmp.email,
            phone: newEmp.phone_number,
            salary: finalSalary,
            status: 'active',
            hire_date: newEmp.joining_date || new Date().toISOString().split('T')[0],
            department: newEmp.department_name || 'Operations',
            designation: finalDesignation,
            gender: newEmp.gender,
            date_of_birth: newEmp.date_of_birth,
            blood_group: newEmp.blood_group || 'O+',
            employment_type: newEmp.employment_type || 'Full-time',
            reporting_manager: finalManager,
            employee_code: finalEmployeeCode,
            esi_number: finalEsi,
            shift: JSON.stringify({ shift: finalShift, shift_name: finalShift }),
            monthly_leave_quota: finalMonthlyQuota,
            annual_bonus: finalBonus,
            weekly_off: finalWeeklyOff,
            address: JSON.stringify({ 
                line1: finalAddress,
                city: finalCity,
                state: finalState,
                pincode: finalPincode,
                deduct_tds: Boolean(newEmp.deduct_tds),
                monthly_leave_quota: finalMonthlyQuota,
                annual_bonus: finalBonus,
                weekly_off: finalWeeklyOff,
                shift_name: finalShift,
                date_of_birth: newEmp.date_of_birth,
                blood_group: newEmp.blood_group,
                gender: newEmp.gender,
                employment_type: newEmp.employment_type,
                reporting_manager: finalManager,
                employee_code: finalEmployeeCode,
                pan_number: finalPan,
                pf_number: finalPf,
                esi_number: finalEsi,
                leave_balance: finalLeaveBalance,
                designation_name: finalDesignation,
                joining_date: newEmp.joining_date
            }),
            deduct_tds: newEmp.deduct_tds ? 1 : 0,
            emergency_contact: JSON.stringify({ name: finalEmergName, phone: finalEmergPhone }),
            bank_details: JSON.stringify({
                bank_name: finalBankName,
                account_number: finalAccountNo,
                ifsc_code: finalIfsc
            }),
            pf_number: finalPf,
            pan_number: finalPan,
            performance_rating: finalPerfRating,
            target_score: finalTargetScore,
            leave_balance: finalLeaveBalance
        });
    };

    // Handle performance review submit
    const handlePerformanceSubmit = (e) => {
        e.preventDefault();
        
        if (!perfForm.employee_id) {
            alert('Please select an employee.');
            return;
        }
        
        const empToUpdate = employees.find(emp => 
            String(emp.employee_id) === String(perfForm.employee_id) || 
            String(emp.id) === String(perfForm.employee_id) || 
            String(emp.employee_code) === String(perfForm.employee_id)
        );

        if (empToUpdate) {
            const targetId = empToUpdate.id || empToUpdate.employee_id;
            performanceMutation.mutate({
                id: targetId,
                rating: parseFloat(perfForm.rating) || 4.0,
                target_score: parseInt(perfForm.target_score) || 85
            });
        } else {
            alert('Selected employee not found in database.');
        }
    };

    // Handle employee profile edit save
    const handleEditSubmit = (e) => {
        e.preventDefault();

        // Name validation
        const cleanEditFirst = sanitizeName(editForm.first_name, 35);
        const cleanEditLast = sanitizeName(editForm.last_name, 35);
        if (!cleanEditFirst || !cleanEditLast) {
            alert('Please enter both valid First Name and Last Name (letters only).');
            return;
        }

        // Phone validation
        const cleanStaffPhone = sanitizePhone(editForm.phone);
        if (!isValidPhone(cleanStaffPhone)) {
            alert('Please enter a valid 10-digit mobile phone number starting with 6, 7, 8, or 9.');
            return;
        }

        // Email validation
        const cleanEditEmail = (editForm.email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEditEmail)) {
            alert('Please enter a valid corporate email address (e.g. employee@bnxmail.com).');
            return;
        }

        // Emergency contact cannot be same as staff contact
        const cleanEmergPhone = sanitizePhone(editForm.emergency_contact_number);
        if (cleanStaffPhone && cleanEmergPhone) {
            if (cleanStaffPhone === cleanEmergPhone || (cleanStaffPhone.length >= 10 && cleanEmergPhone.length >= 10 && cleanStaffPhone.slice(-10) === cleanEmergPhone.slice(-10))) {
                alert('Emergency contact number cannot be the same as the staff phone number. Please enter a different emergency contact number.');
                return;
            }
        }

        // ESI Number must be unique
        const cleanEditEsi = sanitizeEsiInput(editForm.esi_number);
        if (cleanEditEsi) {
            if (!isValidEsi(cleanEditEsi)) {
                alert('Please enter a valid 17-digit ESI number (digits only, e.g. 31001234560000001) or leave it blank.');
                return;
            }
            const existingWithEsi = employees.find(emp => 
                String(emp.id) !== String(currentSelectedEmployee?.id) && 
                (emp.esi_number || '').trim().toLowerCase() === cleanEditEsi.toLowerCase()
            );
            if (existingWithEsi) {
                alert(`ESI Number "${cleanEditEsi}" is already assigned to ${existingWithEsi.name || 'another staff member'}. ESI Number must be unique.`);
                return;
            }
        }

        const finalEditPan = sanitizePanInput(editForm.pan_number);
        if (editForm.pan_number && !isValidPan(finalEditPan)) {
            alert('Please enter a valid 10-character Indian PAN number (e.g. ABCDE1234F, format: 5 letters, 4 digits, 1 letter) or leave it blank.');
            return;
        }

        const finalEditPf = sanitizePfInput(editForm.pf_number);
        if (editForm.pf_number && !isValidPf(finalEditPf)) {
            alert('Please enter a valid PF number (e.g. MH/BAN/0011223 or 12-digit UAN like 100123456789) or leave it blank.');
            return;
        }

        const finalEditAcc = sanitizeAccountNo(editForm.account_number);
        if (editForm.account_number && !isValidAccountNo(finalEditAcc)) {
            alert('Please enter a valid 9 to 18-digit bank account number or leave it blank.');
            return;
        }

        const finalEditIfsc = sanitizeIfscInput(editForm.ifsc_code);
        if (editForm.ifsc_code && !isValidIfsc(finalEditIfsc)) {
            alert('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0000124 - 4 letters, 0, 6 alphanumeric characters) or leave it blank.');
            return;
        }

        const finalEditPincode = sanitizePincode(editForm.pincode);
        if (editForm.pincode && !isValidPincode(finalEditPincode)) {
            alert('Please enter a valid 6-digit postal pincode (e.g. 600001) or leave it blank.');
            return;
        }

        const parsedMonthlyQuota = parseFloat(editForm.monthly_leave_quota);
        const finalMonthlyQuota = (!isNaN(parsedMonthlyQuota) && editForm.monthly_leave_quota !== '' && editForm.monthly_leave_quota !== null) ? Math.max(0, parsedMonthlyQuota) : defaultLeaveQuota;
        const parsedLeaveBal = parseFloat(editForm.leave_balance);
        const finalLeaveBalance = (!isNaN(parsedLeaveBal) && editForm.leave_balance !== '' && editForm.leave_balance !== null) ? Math.max(0, parsedLeaveBal) : 0;
        const finalBonus = editForm.annual_bonus !== undefined && editForm.annual_bonus !== '' ? parseFloat(editForm.annual_bonus) : null;
        const finalWeeklyOff = editForm.weekly_off || 'Sunday Off';
        const finalShift = editForm.shift_name || 'General Shift (9 AM - 6 PM)';

        const payload = {
            name: `${editForm.first_name} ${editForm.last_name}`,
            email: editForm.email,
            phone: editForm.phone,
            department: editForm.department,
            designation: editForm.designation,
            salary: parseFloat(editForm.basic_salary) || 0,
            status: editForm.employee_status,
            hire_date: editForm.joining_date,
            employee_code: editForm.employee_code,
            esi_number: editForm.esi_number,
            city: editForm.city || '',
            state: editForm.state || '',
            pincode: editForm.pincode || '',
            shift: JSON.stringify({ shift: finalShift, shift_name: finalShift }),
            monthly_leave_quota: finalMonthlyQuota,
            leave_balance: finalLeaveBalance,
            annual_bonus: finalBonus,
            weekly_off: finalWeeklyOff,
            address: JSON.stringify({ 
                line1: editForm.address_line_1,
                city: editForm.city || '',
                state: editForm.state || '',
                pincode: editForm.pincode || '',
                deduct_tds: Boolean(editForm.deduct_tds),
                monthly_leave_quota: finalMonthlyQuota,
                annual_bonus: finalBonus,
                weekly_off: finalWeeklyOff,
                shift_name: finalShift,
                date_of_birth: editForm.date_of_birth,
                blood_group: editForm.blood_group,
                gender: editForm.gender,
                employment_type: editForm.employment_type,
                reporting_manager: editForm.reporting_manager,
                employee_code: editForm.employee_code,
                pan_number: finalEditPan,
                pf_number: finalEditPf,
                esi_number: cleanEditEsi,
                leave_balance: finalLeaveBalance,
                designation_name: editForm.designation,
                joining_date: editForm.joining_date,
                salary_type: editForm.salary_type,
                performance_rating: editForm.performance_rating,
                target_score: editForm.target_score
            }),
            pf_number: finalEditPf,
            pan_number: finalEditPan,
            deduct_tds: editForm.deduct_tds ? 1 : 0,
            emergency_contact: JSON.stringify({ name: sanitizeName(editForm.emergency_contact_name, 40), phone: cleanEmergPhone }),
            bank_details: JSON.stringify({ bank_name: (editForm.bank_name || '').replace(/[^a-zA-Z\s.\-]/g, '').trim().slice(0, 50), account_number: finalEditAcc, ifsc_code: finalEditIfsc })
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
                const tax = emp.deduct_tds ? Math.round(basic * 0.05) : 0;
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

    const departmentsList = useMemo(() => {
        const set = new Set();
        employees.forEach(e => { if (e.department_name) set.add(e.department_name); });
        return Array.from(set).sort();
    }, [employees]);

    const bloodGroupsList = useMemo(() => {
        const set = new Set();
        employees.forEach(e => { if (e.blood_group) set.add(e.blood_group); });
        return Array.from(set).sort();
    }, [employees]);

    const shiftsList = useMemo(() => {
        const set = new Set();
        employees.forEach(e => { if (e.assigned_shift) set.add(e.assigned_shift); });
        return Array.from(set).sort();
    }, [employees]);

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
        const code = String(emp.employee_code || '').toLowerCase();
        const empIdStr = String(emp.employee_id || '').toLowerCase();
        const email = String(emp.email || '').toLowerCase();
        const phone = String(emp.phone_number || '').toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch = !query || 
            fullName.includes(query) ||
            code.includes(query) ||
            empIdStr.includes(query) ||
            email.includes(query) ||
            phone.includes(query) ||
            (emp.department_name && emp.department_name.toLowerCase().includes(query)) ||
            (emp.designation_name && emp.designation_name.toLowerCase().includes(query));

        const matchesDept = selectedDepartmentFilter === 'All' || emp.department_name === selectedDepartmentFilter;
        const matchesShift = selectedShiftFilter === 'All' || emp.assigned_shift === selectedShiftFilter;
        const matchesBlood = selectedBloodGroupFilter === 'All' || emp.blood_group === selectedBloodGroupFilter;

        let matchesTag = true;
        if (selectedQuickTag === 'HighRating') {
            matchesTag = emp.performance_rating !== null && emp.performance_rating >= 4.0;
        } else if (selectedQuickTag === 'RecentJoin') {
            matchesTag = emp.joining_date && String(emp.joining_date).startsWith('2026');
        } else if (selectedQuickTag === 'NightShift') {
            matchesTag = emp.assigned_shift && emp.assigned_shift.toLowerCase().includes('night');
        }

        return matchesSearch && matchesDept && matchesShift && matchesBlood && matchesTag;
    });

    const totalHeadcount = employees.length;
    const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.basic_salary) || 0), 0);
    const ratedEmployees = employees.filter(emp => emp.performance_rating !== null && !isNaN(emp.performance_rating));
    const averageRating = ratedEmployees.length > 0
        ? (ratedEmployees.reduce((sum, emp) => sum + emp.performance_rating, 0) / ratedEmployees.length).toFixed(1)
        : 'N/A';

    function headcountSafe(h) {
        return h > 0 ? h : 1;
    }

    const handleOpenEditMode = (emp) => {
        setEditForm({
            employee_id: emp.employee_id,
            employee_code: emp.employee_code || '',
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
            esi_number: emp.esi_number || '',
            leave_balance: emp.leave_balance,
            salary_type: emp.salary_type,
            performance_rating: emp.performance_rating,
            target_score: emp.target_score,
            deduct_tds: emp.deduct_tds !== undefined ? Boolean(emp.deduct_tds) : false,
            monthly_leave_quota: emp.monthly_leave_quota !== undefined ? emp.monthly_leave_quota : defaultLeaveQuota,
            annual_bonus: emp.annual_bonus || '',
            weekly_off: emp.weekly_off || 'Sunday Off'
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
                        onClick={() => handleOpenFileAppraisal()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Award size={15} /> File Appraisal Review
                    </button>
                    <button
                        onClick={() => {
                            if ((dbEmployees?.length || 0) >= staffLimit) {
                                alert(`Employee headcount limit reached (${staffLimit} Staff on ${activePlan}). Please upgrade your subscription plan to onboard more employees.`);
                                navigate('/subscription');
                                return;
                            }
                            const nextCode = `CLK-00${(dbEmployees.length || 0) + 1}`;
                            setNewEmp({ ...initialEmpState, employee_code: nextCode });
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
                    { label: 'Workforce Performance', value: averageRating !== 'N/A' ? `${averageRating} / 5.0 Rating` : 'Pending Appraisal', icon: Award, color: '#8B5CF6', bg: '#F5F3FF' },
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
                        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {/* Primary Search & Dropdown Filters Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '440px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, ID code, email, phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 2.25rem 0.75rem 2.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Multi-Criteria Filter Dropdowns */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {/* Department Filter */}
                                    <select
                                        value={selectedDepartmentFilter}
                                        onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                                        style={{ padding: '0.7rem 0.9rem', borderRadius: '12px', border: selectedDepartmentFilter !== 'All' ? '1px solid #10B981' : '1px solid #E2E8F0', outline: 'none', background: selectedDepartmentFilter !== 'All' ? '#ECFDF5' : 'white', color: selectedDepartmentFilter !== 'All' ? '#047857' : '#334155', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        <option value="All">All Departments</option>
                                        {departmentsList.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>

                                    {/* Shift / Roster Filter */}
                                    <select
                                        value={selectedShiftFilter}
                                        onChange={(e) => setSelectedShiftFilter(e.target.value)}
                                        style={{ padding: '0.7rem 0.9rem', borderRadius: '12px', border: selectedShiftFilter !== 'All' ? '1px solid #3B82F6' : '1px solid #E2E8F0', outline: 'none', background: selectedShiftFilter !== 'All' ? '#EFF6FF' : 'white', color: selectedShiftFilter !== 'All' ? '#1D4ED8' : '#334155', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        <option value="All">All Shifts</option>
                                        {shiftsList.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    {/* Blood Group Filter */}
                                    <select
                                        value={selectedBloodGroupFilter}
                                        onChange={(e) => setSelectedBloodGroupFilter(e.target.value)}
                                        style={{ padding: '0.7rem 0.85rem', borderRadius: '12px', border: selectedBloodGroupFilter !== 'All' ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', background: selectedBloodGroupFilter !== 'All' ? '#FEF2F2' : 'white', color: selectedBloodGroupFilter !== 'All' ? '#DC2626' : '#334155', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        <option value="All">All Blood Groups</option>
                                        {bloodGroupsList.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>

                                    {/* Reset All Filters Button */}
                                    {(searchTerm || selectedDepartmentFilter !== 'All' || selectedShiftFilter !== 'All' || selectedBloodGroupFilter !== 'All' || selectedQuickTag !== 'All') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedDepartmentFilter('All');
                                                setSelectedShiftFilter('All');
                                                setSelectedBloodGroupFilter('All');
                                                setSelectedQuickTag('All');
                                            }}
                                            style={{ padding: '0.65rem 0.9rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: '750', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                        >
                                            <RotateCcw size={13} /> Reset Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Secondary Quick-Pills & Result Counter */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginRight: '0.2rem' }}>Quick Filters:</span>
                                    {[
                                        { id: 'All', label: `All Staff (${employees.length})` },
                                        { id: 'HighRating', label: '★ Rating ≥ 4.0' },
                                        { id: 'NightShift', label: 'Night Shift' },
                                        { id: 'RecentJoin', label: 'Joined in 2026' }
                                    ].map(pill => {
                                        const isActive = selectedQuickTag === pill.id;
                                        return (
                                            <button
                                                key={pill.id}
                                                type="button"
                                                onClick={() => setSelectedQuickTag(pill.id)}
                                                style={{
                                                    padding: '0.3rem 0.65rem',
                                                    borderRadius: '8px',
                                                    border: isActive ? '1px solid #1B6B3A' : '1px solid #E2E8F0',
                                                    background: isActive ? '#1B6B3A' : 'white',
                                                    color: isActive ? 'white' : '#475569',
                                                    fontSize: '0.72rem',
                                                    fontWeight: isActive ? '800' : '650',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {pill.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ fontSize: '0.75rem', fontWeight: '750', color: '#047857', background: '#ECFDF5', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                                    Showing {filteredEmployees.length} of {employees.length} Employees
                                </div>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0 0 0.15rem 0' }}>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{emp.date_of_birth} ({emp.gender})</p>
                                                    {calculateAge(emp.date_of_birth) !== null && (
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                                            Age: {calculateAge(emp.date_of_birth)} yrs
                                                        </span>
                                                    )}
                                                </div>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Leaves Balance, Pays & Assigned Roster Shifts</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0', fontWeight: '500' }}>Comprehensive view of employee salaries, bonus eligibility, monthly leave quota, and shift rosters.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', fontWeight: '800', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span>🌴 Default Policy Quota: <strong>{defaultLeaveQuota}</strong> Days / Mo ({(defaultLeaveQuota * 12).toFixed(1)} Days / Yr)</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTempQuota(defaultLeaveQuota);
                                                setApplyToAll(false);
                                                setIsQuotaModalOpen(true);
                                            }}
                                            style={{ border: 'none', background: '#059669', color: 'white', padding: '0.25rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            title="Change monthly leave quota policy"
                                        >
                                            <Sliders size={12} /> Set Quota
                                        </button>
                                    </div>
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
                                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => {
                                            const bonusEst = (emp.annual_bonus !== null && emp.annual_bonus !== undefined && emp.annual_bonus > 0)
                                                ? emp.annual_bonus
                                                : Math.round(emp.basic_salary * ((emp.annual_bonus_pct || 10) / 100));
                                            return (
                                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1B6B3A' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                            <Clock size={13} color="#059669" />
                                                            <span>{emp.shift_name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#0F172A' }}>{formatCurrency(emp.basic_salary)} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>/mo</span></td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: '800', color: '#D97706' }}>{formatCurrency(bonusEst)}</div>
                                                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>
                                                            {(emp.annual_bonus !== null && emp.annual_bonus !== undefined && emp.annual_bonus > 0) ? 'Fixed Amount' : `${emp.annual_bonus_pct || 10}% of base salary`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: '700', color: '#2563EB' }}>{(emp.monthly_leave_quota !== undefined && emp.monthly_leave_quota !== null) ? emp.monthly_leave_quota : defaultLeaveQuota} Days / mo</div>
                                                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>
                                                            {(((emp.monthly_leave_quota !== undefined && emp.monthly_leave_quota !== null) ? emp.monthly_leave_quota : defaultLeaveQuota) * 12).toFixed(1)} Days / year
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#E11D48' }}>{(emp.leave_balance !== undefined && emp.leave_balance !== null) ? emp.leave_balance : 0} Days Left</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750', display: 'inline-block' }}>
                                                            {emp.weekly_off || 'Sunday Off'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRosterModal(emp)}
                                                            style={{
                                                                border: 'none',
                                                                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                                                                color: 'white',
                                                                padding: '0.45rem 0.85rem',
                                                                borderRadius: '10px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '850',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.35rem',
                                                                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.2)',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Edit2 size={12} /> Edit Roster
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Public Holidays Card for Employees - Dynamic Year & Custom Leaves Schedule */}
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.75rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            {/* Card Header & Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={22} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                                                Official Public Holidays Roster ({selectedHolidayYear})
                                            </h4>
                                            <span style={{ fontSize: '0.72rem', fontWeight: '800', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.15rem 0.55rem', borderRadius: '8px' }}>
                                                {activeYearHolidays.length} Holidays Scheduled
                                            </span>
                                        </div>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                                            Annual workforce holiday calendar & leaves schedule for calendar year {selectedHolidayYear}
                                        </p>
                                    </div>
                                </div>

                                {/* Year Switcher & Quick Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                    {/* Interactive Year Selector Pills */}
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHolidayYear(y => y - 1)}
                                            title="Previous Year"
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#64748B',
                                                cursor: 'pointer',
                                                padding: '0.35rem 0.45rem',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {[2024, 2025, 2026, 2027, 2028].map(yr => {
                                            const isSelected = selectedHolidayYear === yr;
                                            return (
                                                <button
                                                    key={yr}
                                                    type="button"
                                                    onClick={() => setSelectedHolidayYear(yr)}
                                                    style={{
                                                        border: 'none',
                                                        background: isSelected ? '#047857' : 'transparent',
                                                        color: isSelected ? 'white' : '#64748B',
                                                        padding: '0.35rem 0.65rem',
                                                        borderRadius: '10px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: isSelected ? '850' : '700',
                                                        cursor: 'pointer',
                                                        boxShadow: isSelected ? '0 2px 6px rgba(4, 120, 87, 0.25)' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {yr}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setSelectedHolidayYear(y => y + 1)}
                                            title="Next Year"
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#64748B',
                                                cursor: 'pointer',
                                                padding: '0.35rem 0.45rem',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {/* Add Holiday Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewHolidayForm({
                                                name: '',
                                                date: `${selectedHolidayYear}-01-01`,
                                                type: 'Public Holiday'
                                            });
                                            setIsAddHolidayModalOpen(true);
                                        }}
                                        style={{
                                            border: 'none',
                                            background: '#047857',
                                            color: 'white',
                                            padding: '0.55rem 1rem',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            boxShadow: '0 2px 6px rgba(4, 120, 87, 0.2)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Plus size={15} /> Add Holiday
                                    </button>

                                    {/* Reset Defaults Button */}
                                    <button
                                        type="button"
                                        onClick={handleResetYearHolidays}
                                        title={`Reset ${selectedHolidayYear} to official public holidays`}
                                        style={{
                                            border: '1px solid #CBD5E1',
                                            background: '#F8FAFC',
                                            color: '#475569',
                                            padding: '0.55rem 0.9rem',
                                            borderRadius: '12px',
                                            fontWeight: '750',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <RefreshCw size={13} /> Reset Defaults
                                    </button>
                                </div>
                            </div>

                            {/* Leaves Schedule Integration Summary Banner */}
                            <div style={{ 
                                background: '#F8FAFC', 
                                border: '1px solid #E2E8F0', 
                                borderRadius: '16px', 
                                padding: '0.85rem 1.25rem', 
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <span style={{ fontSize: '0.95rem' }}>🌴</span>
                                        <div>
                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Monthly Leave Policy</span>
                                            <span style={{ fontSize: '0.84rem', fontWeight: '850', color: '#0F172A' }}>{defaultLeaveQuota} Days / mo ({(defaultLeaveQuota * 12).toFixed(1)} / yr)</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <span style={{ fontSize: '0.95rem' }}>🏛️</span>
                                        <div>
                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Public Holidays</span>
                                            <span style={{ fontSize: '0.84rem', fontWeight: '850', color: '#047857' }}>{activeYearHolidays.length} Days in {selectedHolidayYear}</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <span style={{ fontSize: '0.95rem' }}>✨</span>
                                        <div>
                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Total Annual Off Schedule</span>
                                            <span style={{ fontSize: '0.84rem', fontWeight: '850', color: '#2563EB' }}>{(defaultLeaveQuota * 12 + activeYearHolidays.length).toFixed(1)} Days Total Available Off</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTempQuota(defaultLeaveQuota);
                                        setApplyToAll(false);
                                        setIsQuotaModalOpen(true);
                                    }}
                                    style={{
                                        border: '1px solid #A7F3D0',
                                        background: '#ECFDF5',
                                        color: '#047857',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.74rem',
                                        fontWeight: '800',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Adjust Leave Policy Quota
                                </button>
                            </div>

                            {/* Holidays Grid */}
                            {activeYearHolidays.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))', gap: '1rem' }}>
                                    {activeYearHolidays.map((ph) => {
                                        const typeLower = (ph.type || '').toLowerCase();
                                        const badgeBg = typeLower.includes('national') ? '#ECFDF5' : (typeLower.includes('state') ? '#EFF6FF' : (typeLower.includes('festival') ? '#FDF4FF' : '#F8FAFC'));
                                        const badgeColor = typeLower.includes('national') ? '#047857' : (typeLower.includes('state') ? '#1D4ED8' : (typeLower.includes('festival') ? '#9333EA' : '#475569'));
                                        const badgeBorder = typeLower.includes('national') ? '#A7F3D0' : (typeLower.includes('state') ? '#BFDBFE' : (typeLower.includes('festival') ? '#F5D0FE' : '#E2E8F0'));

                                        return (
                                            <div 
                                                key={ph.id || ph.name} 
                                                style={{ 
                                                    background: '#F8FAFC', 
                                                    border: '1px solid #E2E8F0', 
                                                    padding: '1rem 1.15rem', 
                                                    borderRadius: '18px', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '6px', 
                                                    position: 'relative',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {/* Date & Action Buttons */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                                                        {ph.displayDate || ph.date}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {/* Edit Holiday Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditHoliday(ph)}
                                                            title={`Edit ${ph.name} for ${selectedHolidayYear} schedule`}
                                                            style={{
                                                                border: 'none',
                                                                background: '#F1F5F9',
                                                                color: '#475569',
                                                                cursor: 'pointer',
                                                                fontSize: '0.7rem',
                                                                padding: '3px 6px',
                                                                borderRadius: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.2rem',
                                                                fontWeight: '700'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#047857'; e.currentTarget.style.background = '#ECFDF5'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#F1F5F9'; }}
                                                        >
                                                            <Edit2 size={11} /> Edit
                                                        </button>

                                                        {/* Delete Holiday Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteHoliday(ph.id)}
                                                            title="Remove from schedule"
                                                            style={{
                                                                border: 'none',
                                                                background: '#F1F5F9',
                                                                color: '#94A3B8',
                                                                cursor: 'pointer',
                                                                fontSize: '0.7rem',
                                                                padding: '3px 6px',
                                                                borderRadius: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#F1F5F9'; }}
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Holiday Title */}
                                                <span style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', lineHeight: '1.3' }}>
                                                    {ph.name}
                                                </span>

                                                {/* Holiday Category Badge */}
                                                <div style={{ marginTop: '2px' }}>
                                                    <span style={{ fontSize: '0.67rem', color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, fontWeight: '750', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                                        {ph.type}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#F8FAFC', borderRadius: '18px', border: '1px dashed #CBD5E1' }}>
                                    <p style={{ margin: '0 0 0.75rem 0', color: '#64748B', fontSize: '0.85rem', fontWeight: '600' }}>
                                        No holidays recorded in the schedule for {selectedHolidayYear}.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetYearHolidays}
                                        style={{ border: 'none', background: '#047857', color: 'white', padding: '0.55rem 1.15rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)' }}
                                    >
                                        Load Standard {selectedHolidayYear} Holidays
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal: Add Custom Holiday for Selected Year */}
                {isAddHolidayModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>
                                        Add Holiday to {selectedHolidayYear} Schedule
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Configure workforce leave calendar</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddHolidayModalOpen(false)}
                                    style={{ border: 'none', background: '#F1F5F9', color: '#64748B', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddCustomHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Pongal / Makar Sankranti, Founder's Day"
                                        value={newHolidayForm.name}
                                        onChange={(e) => setNewHolidayForm({ ...newHolidayForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Date ({selectedHolidayYear}) *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={`${selectedHolidayYear}-01-01`}
                                        max={`${selectedHolidayYear}-12-31`}
                                        value={newHolidayForm.date}
                                        onChange={(e) => setNewHolidayForm({ ...newHolidayForm, date: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    />
                                    <span style={{ fontSize: '0.65rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                                        Must be within calendar year {selectedHolidayYear}
                                    </span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Holiday Category
                                    </label>
                                    <select
                                        value={newHolidayForm.type}
                                        onChange={(e) => setNewHolidayForm({ ...newHolidayForm, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    >
                                        <option value="National Holiday">National Holiday</option>
                                        <option value="State Holiday">State Holiday</option>
                                        <option value="Festival">Festival</option>
                                        <option value="Company Holiday">Company Off / Holiday</option>
                                        <option value="General Holiday">General Holiday</option>
                                        <option value="Optional / Restricted">Optional / Restricted Holiday</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddHolidayModalOpen(false)}
                                        style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', color: '#475569', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, padding: '0.65rem', background: '#047857', border: 'none', color: 'white', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)' }}
                                    >
                                        Save to {selectedHolidayYear} Roster
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Edit Existing Holiday for Selected Year */}
                {isEditHolidayModalOpen && editingHoliday && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>
                                        Edit Holiday Schedule ({selectedHolidayYear})
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Update holiday date or details for {selectedHolidayYear}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditHolidayModalOpen(false);
                                        setEditingHoliday(null);
                                    }}
                                    style={{ border: 'none', background: '#F1F5F9', color: '#64748B', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSaveEditedHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editHolidayForm.name}
                                        onChange={(e) => setEditHolidayForm({ ...editHolidayForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Date ({selectedHolidayYear}) *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={`${selectedHolidayYear}-01-01`}
                                        max={`${selectedHolidayYear}-12-31`}
                                        value={editHolidayForm.date}
                                        onChange={(e) => setEditHolidayForm({ ...editHolidayForm, date: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    />
                                    <span style={{ fontSize: '0.65rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                                        Change date according to {selectedHolidayYear} calendar leaves schedule
                                    </span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Holiday Category
                                    </label>
                                    <select
                                        value={editHolidayForm.type}
                                        onChange={(e) => setEditHolidayForm({ ...editHolidayForm, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                    >
                                        <option value="National Holiday">National Holiday</option>
                                        <option value="State Holiday">State Holiday</option>
                                        <option value="Festival">Festival</option>
                                        <option value="Company Holiday">Company Off / Holiday</option>
                                        <option value="General Holiday">General Holiday</option>
                                        <option value="Optional / Restricted">Optional / Restricted Holiday</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditHolidayModalOpen(false);
                                            setEditingHoliday(null);
                                        }}
                                        style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', color: '#475569', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, padding: '0.65rem', background: '#047857', border: 'none', color: 'white', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)' }}
                                    >
                                        Update Holiday
                                    </button>
                                </div>
                            </form>
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
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((emp) => (
                                    <tr key={emp.employee_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>
                                            <div style={{ color: '#0F172A', fontSize: '0.9rem' }}>{emp.first_name} {emp.last_name}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600', marginTop: '2px' }}>
                                                {emp.employee_code || `CLK-00${emp.id}`} • {emp.department_name || 'Staff'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {emp.performance_rating !== null && !isNaN(emp.performance_rating) ? (
                                                <span style={{ fontWeight: '800', color: '#F59E0B', fontSize: '0.9rem' }}>
                                                    ⭐ {Number(emp.performance_rating).toFixed(1)} / 5.0
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750' }}>
                                                    ⏳ Pending Appraisal
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {emp.target_score !== null && !isNaN(emp.target_score) ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '120px', height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                        <div style={{ width: `${Math.min(100, Math.max(0, emp.target_score))}%`, height: '100%', background: 'linear-gradient(90deg, #1B6B3A 0%, #10B981 100%)' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{emp.target_score}% Achieve</span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '120px', height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                        <div style={{ width: '0%', height: '100%', background: '#CBD5E1' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#94A3B8' }}>Target Not Set</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>
                                            <div>{getAppraisalDueDate(emp.joining_date)}</div>
                                            {emp.performance_rating === null && (
                                                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '500' }}>90-Day Probation Review</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenFileAppraisal(emp.employee_id || emp.id)}
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.4rem', 
                                                    padding: '0.45rem 0.85rem', 
                                                    borderRadius: '10px', 
                                                    background: emp.performance_rating !== null ? '#FDF2F8' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', 
                                                    color: emp.performance_rating !== null ? '#DB2777' : 'white', 
                                                    border: emp.performance_rating !== null ? '1px solid #FCE7F3' : 'none', 
                                                    fontWeight: '750', 
                                                    fontSize: '0.75rem', 
                                                    cursor: 'pointer', 
                                                    boxShadow: emp.performance_rating !== null ? '0 1px 2px rgba(0,0,0,0.03)' : '0 4px 10px rgba(124, 58, 237, 0.25)' 
                                                }}
                                            >
                                                <Award size={13} /> {emp.performance_rating !== null ? 'Re-Appraise' : 'Settle Appraisal'}
                                            </button>
                                        </td>
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
                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    <option value="All">All Claims</option>
                                    <option value="Pending">Pending Approval</option>
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
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supporting Documents</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Amount</th>
                                        <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '160px' }}>Actions</th>
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
                                                        <span>{cl.receipt || (!cl.proof_file_path && 'No documents attached')}</span>
                                                        {cl.proof_file_path && (
                                                            <a 
                                                                href={getFileUrl(cl.proof_file_path)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: '#10B981', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                            >
                                                                📎 View Document
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    {(() => {
                                                        const s = (cl.reimbursement_status || '').toLowerCase();
                                                        const isApproved = s === 'approved';
                                                        const isPaid = s === 'paid';
                                                        const isRejected = s === 'rejected';
                                                        return (
                                                            <span style={{
                                                                padding: '0.25rem 0.6rem', borderRadius: '6px',
                                                                background: isApproved ? '#E8F0FE' : (isPaid ? '#E6F4EA' : (isRejected ? '#FCE8E6' : '#FEF3C7')),
                                                                color: isApproved ? '#1A73E8' : (isPaid ? '#137333' : (isRejected ? '#C5221F' : '#B45309')),
                                                                fontWeight: '800', fontSize: '0.72rem', whiteSpace: 'nowrap'
                                                            }}>
                                                                {cl.reimbursement_status ? cl.reimbursement_status.toUpperCase() : 'PENDING APPROVAL'}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(cl.claim_amount)}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'inline-flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center' }}>
                                                        {(() => {
                                                            const s = (cl.reimbursement_status || '').toLowerCase();
                                                            const isPending = !s || s.includes('pending');
                                                            const isApproved = s === 'approved';
                                                            const isPaid = s === 'paid';
                                                            const isRejected = s === 'rejected';

                                                            if (isPending) {
                                                                return (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => approveClaimMutation.mutate(cl.claim_id)}
                                                                            disabled={approveClaimMutation.isPending}
                                                                            style={{ border: 'none', background: '#E6F4EA', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#137333', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
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
                                                                            style={{ border: 'none', background: '#FCE8E6', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#C5221F', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                                            title="Reject this claim"
                                                                        >
                                                                            {rejectClaimMutation.isPending ? '...' : 'Reject'}
                                                                        </button>
                                                                    </>
                                                                );
                                                            }

                                                            if (isApproved) {
                                                                return (
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
                                                                        style={{ border: 'none', background: '#E8F0FE', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', color: '#1A73E8', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                                        title="Mark claim as Paid"
                                                                    >
                                                                        Mark as Paid
                                                                    </button>
                                                                );
                                                            }

                                                            if (isPaid) {
                                                                return (
                                                                    <span style={{ fontSize: '0.72rem', color: '#137333', fontWeight: '800', background: '#E6F4EA', padding: '4px 10px', borderRadius: '6px' }}>
                                                                        ✓ Paid & Settled
                                                                    </span>
                                                                );
                                                            }

                                                            if (isRejected) {
                                                                return (
                                                                    <span style={{ fontSize: '0.72rem', color: '#C5221F', fontWeight: '800', background: '#FCE8E6', padding: '4px 10px', borderRadius: '6px' }}>
                                                                        ✕ Rejected
                                                                    </span>
                                                                );
                                                            }

                                                            return (
                                                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>Settled</span>
                                                            );
                                                        })()}
                                                    </div>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} /> Personal Details
                                        </h4>
                                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#EF4444', background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                            * Mandatory Section
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>
                                                    First Name <span style={{ color: '#EF4444' }}>*</span>
                                                </label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    maxLength={35}
                                                    value={newEmp.first_name} 
                                                    onChange={(e) => setNewEmp({ ...newEmp, first_name: sanitizeName(e.target.value, 35) })} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                    placeholder="Arun" 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>
                                                    Last Name <span style={{ color: '#EF4444' }}>*</span>
                                                </label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    maxLength={35}
                                                    value={newEmp.last_name} 
                                                    onChange={(e) => setNewEmp({ ...newEmp, last_name: sanitizeName(e.target.value, 35) })} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                    placeholder="Kumar" 
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>
                                                        Date of Birth <span style={{ color: '#EF4444' }}>*</span>
                                                    </label>
                                                    {calculateAge(newEmp.date_of_birth) !== null && (
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                                                            Age: {calculateAge(newEmp.date_of_birth)} yrs
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    required
                                                    type="date"
                                                    max={maxDobDate}
                                                    value={newEmp.date_of_birth}
                                                    onChange={handleOnboardDobChange}
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>
                                                    Gender <span style={{ color: '#EF4444' }}>*</span>
                                                </label>
                                                <select required value={newEmp.gender} onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Blood Group</label>
                                                <select 
                                                    value={newEmp.blood_group || 'O+'} 
                                                    onChange={(e) => setNewEmp({ ...newEmp, blood_group: e.target.value })} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}
                                                >
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>
                                                    Phone <span style={{ color: '#EF4444' }}>*</span>
                                                </label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    maxLength={10}
                                                    pattern="[0-9]{10}"
                                                    value={newEmp.phone_number} 
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                        setNewEmp({ ...newEmp, phone_number: val });
                                                    }} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                    placeholder="9876543210" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>
                                                Corporate Email (BNX / Company Mail) <span style={{ color: '#EF4444' }}>*</span>
                                            </label>
                                            <input required type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="arun.kumar@bnxmail.com" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Job Details section (Optional) */}
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Briefcase size={16} /> Job & Designation
                                        </h4>
                                        <span style={{ fontSize: '0.68rem', fontWeight: '750', color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                            Optional
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Department</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowAddDeptOnboard(!showAddDeptOnboard); setNewDeptInputOnboard(''); }}
                                                        style={{ background: 'none', border: 'none', color: '#047857', fontSize: '0.68rem', fontWeight: '750', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        {showAddDeptOnboard ? 'Cancel' : '+ Add Custom'}
                                                    </button>
                                                </div>
                                                {showAddDeptOnboard ? (
                                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            placeholder="Department Name"
                                                            value={newDeptInputOnboard}
                                                            onChange={(e) => setNewDeptInputOnboard(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const added = addCustomDepartment(newDeptInputOnboard);
                                                                    if (added) setNewEmp({ ...newEmp, department_name: added });
                                                                    setShowAddDeptOnboard(false);
                                                                }
                                                            }}
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #10B981', outline: 'none', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const added = addCustomDepartment(newDeptInputOnboard);
                                                                if (added) setNewEmp({ ...newEmp, department_name: added });
                                                                setShowAddDeptOnboard(false);
                                                            }}
                                                            style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: '#10B981', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            Add
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddDeptOnboard(false)}
                                                            style={{ padding: '0.5rem 0.5rem', borderRadius: '8px', background: '#E2E8F0', color: '#475569', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={newEmp.department_name}
                                                        onChange={(e) => {
                                                            if (e.target.value === '__ADD_NEW__') {
                                                                setShowAddDeptOnboard(true);
                                                                setNewDeptInputOnboard('');
                                                            } else {
                                                                setNewEmp({ ...newEmp, department_name: e.target.value });
                                                            }
                                                        }}
                                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}
                                                    >
                                                        {allDepartments.map(dept => (
                                                            <option key={dept} value={dept}>{dept}</option>
                                                        ))}
                                                        <option value="__ADD_NEW__">+ Add Custom Department...</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Designation Title</label>
                                                <input type="text" value={newEmp.designation_name} onChange={(e) => setNewEmp({ ...newEmp, designation_name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="e.g. Sales Executive (Optional)" />
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
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Reporting Manager</label>
                                                <input 
                                                    type="text" 
                                                    maxLength={40}
                                                    value={newEmp.reporting_manager} 
                                                    onChange={(e) => setNewEmp({ ...newEmp, reporting_manager: sanitizeName(e.target.value, 40) })} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                    placeholder="e.g. Ankit Sharma (Optional)" 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employee ID / Code</label>
                                                <input 
                                                    type="text" 
                                                    maxLength={16}
                                                    value={newEmp.employee_code} 
                                                    onChange={(e) => setNewEmp({ ...newEmp, employee_code: sanitizeEmpCode(e.target.value) })} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', textTransform: 'uppercase' }} 
                                                    placeholder="e.g. CLK-001 or EMP-2026-001" 
                                                />
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
                            
                            {/* Payroll & Banking section (Optional) */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CreditCard size={16} /> Payroll & Financial Structure
                                    </h4>
                                    <span style={{ fontSize: '0.68rem', fontWeight: '750', color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                        Optional
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Basic Salary (INR/mo)</label>
                                        <input type="number" value={newEmp.basic_salary} onChange={(e) => setNewEmp({ ...newEmp, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="e.g. 35000 (Optional)" />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>PAN Number</label>
                                            {newEmp.pan_number && (
                                                <span style={{ 
                                                    fontSize: '0.62rem', 
                                                    fontWeight: '750', 
                                                    color: isValidPan(newEmp.pan_number) ? '#059669' : '#D97706'
                                                }}>
                                                    {isValidPan(newEmp.pan_number) ? '✓ Valid PAN' : `${newEmp.pan_number.length}/10 chars`}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={newEmp.pan_number}
                                            onChange={(e) => {
                                                const val = sanitizePanInput(e.target.value);
                                                setNewEmp({ ...newEmp, pan_number: val });
                                            }}
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.55rem', 
                                                borderRadius: '8px', 
                                                border: newEmp.pan_number ? (isValidPan(newEmp.pan_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                outline: 'none', 
                                                fontSize: '0.85rem', 
                                                boxSizing: 'border-box', 
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontFamily: 'monospace'
                                            }}
                                            placeholder="ABCDE1234F"
                                        />
                                        <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                            Standard format: 5 letters, 4 digits, 1 letter
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>PF Number</label>
                                            {newEmp.pf_number && (
                                                <span style={{ 
                                                    fontSize: '0.62rem', 
                                                    fontWeight: '750', 
                                                    color: isValidPf(newEmp.pf_number) ? '#059669' : '#D97706'
                                                }}>
                                                    {isValidPf(newEmp.pf_number) ? '✓ Valid PF/UAN' : `${newEmp.pf_number.length} chars`}
                                                </span>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            maxLength={26}
                                            value={newEmp.pf_number} 
                                            onChange={(e) => {
                                                const val = sanitizePfInput(e.target.value);
                                                setNewEmp({ ...newEmp, pf_number: val });
                                            }} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.55rem', 
                                                borderRadius: '8px', 
                                                border: newEmp.pf_number ? (isValidPf(newEmp.pf_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                outline: 'none', 
                                                fontSize: '0.85rem', 
                                                boxSizing: 'border-box',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em',
                                                fontFamily: 'monospace'
                                            }} 
                                            placeholder="e.g. MH/BAN/0011223" 
                                        />
                                        <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                            Standard EPFO Member ID or 12-digit UAN
                                        </span>
                                    </div>
                                    <div>
                                        {(() => {
                                            const val = (newEmp.esi_number || '').trim();
                                            const dup = val ? employees.find(e => (e.esi_number || '').trim().toLowerCase() === val.toLowerCase()) : null;
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: dup ? '#DC2626' : '#64748B' }}>
                                                            ESI Number {dup && '(Must be unique)'}
                                                        </label>
                                                        {newEmp.esi_number && !dup && (
                                                            <span style={{ 
                                                                fontSize: '0.62rem', 
                                                                fontWeight: '750', 
                                                                color: isValidEsi(newEmp.esi_number) ? '#059669' : '#D97706'
                                                            }}>
                                                                {isValidEsi(newEmp.esi_number) ? '✓ Valid 17-digit ESI' : `${newEmp.esi_number.length}/17 digits`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        maxLength={17}
                                                        value={newEmp.esi_number} 
                                                        onChange={(e) => {
                                                            const val = sanitizeEsiInput(e.target.value);
                                                            setNewEmp({ ...newEmp, esi_number: val });
                                                        }} 
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '0.55rem', 
                                                            borderRadius: '8px', 
                                                            border: dup ? '1.5px solid #EF4444' : (newEmp.esi_number ? (isValidEsi(newEmp.esi_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1'), 
                                                            outline: 'none', 
                                                            fontSize: '0.85rem', 
                                                            boxSizing: 'border-box', 
                                                            background: dup ? '#FEF2F2' : 'white',
                                                            fontFamily: 'monospace'
                                                        }} 
                                                        placeholder="e.g. 31001234560000001" 
                                                    />
                                                    {dup ? (
                                                        <span style={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: '750', marginTop: '0.25rem', display: 'block' }}>
                                                            ⚠️ Already assigned to {dup.name}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                            Exact 17 numeric digits
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Name</label>
                                        <input 
                                            type="text" 
                                            maxLength={50}
                                            value={newEmp.bank_name} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z\s.\-]/g, '').slice(0, 50);
                                                setNewEmp({ ...newEmp, bank_name: val });
                                            }} 
                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                            placeholder="e.g. HDFC Bank (Optional)" 
                                        />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Bank Account Number</label>
                                            {newEmp.account_number && (
                                                <span style={{ 
                                                    fontSize: '0.62rem', 
                                                    fontWeight: '750', 
                                                    color: isValidAccountNo(newEmp.account_number) ? '#059669' : '#D97706'
                                                }}>
                                                    {isValidAccountNo(newEmp.account_number) ? '✓ Valid Account' : `${newEmp.account_number.length}d (min 9)`}
                                                </span>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            maxLength={18}
                                            value={newEmp.account_number} 
                                            onChange={(e) => {
                                                const val = sanitizeAccountNo(e.target.value);
                                                setNewEmp({ ...newEmp, account_number: val });
                                            }} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.55rem', 
                                                borderRadius: '8px', 
                                                border: newEmp.account_number ? (isValidAccountNo(newEmp.account_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                outline: 'none', 
                                                fontSize: '0.85rem', 
                                                boxSizing: 'border-box',
                                                fontFamily: 'monospace'
                                            }} 
                                            placeholder="e.g. 50100223344551 (Optional)" 
                                        />
                                        <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                            9 to 18 numeric digits
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>IFSC Code</label>
                                            {newEmp.ifsc_code && (
                                                <span style={{ 
                                                    fontSize: '0.62rem', 
                                                    fontWeight: '750', 
                                                    color: isValidIfsc(newEmp.ifsc_code) ? '#059669' : '#D97706'
                                                }}>
                                                    {isValidIfsc(newEmp.ifsc_code) ? '✓ Valid IFSC' : `${newEmp.ifsc_code.length}/11 chars`}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={11}
                                            value={newEmp.ifsc_code}
                                            onChange={(e) => {
                                                const val = sanitizeIfscInput(e.target.value);
                                                setNewEmp({ ...newEmp, ifsc_code: val });
                                            }}
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.55rem', 
                                                borderRadius: '8px', 
                                                border: newEmp.ifsc_code ? (isValidIfsc(newEmp.ifsc_code) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                outline: 'none', 
                                                fontSize: '0.85rem', 
                                                boxSizing: 'border-box', 
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontFamily: 'monospace'
                                            }}
                                            placeholder="e.g. HDFC0000124 (Optional)"
                                        />
                                        <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                            11 chars: 4 letters, 0, 6 alphanumeric
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Contact Info section (Optional) */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={16} /> Address & Emergency Details
                                    </h4>
                                    <span style={{ fontSize: '0.68rem', fontWeight: '750', color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                        Optional
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Residential Address Line 1</label>
                                        <input type="text" maxLength={100} value={newEmp.address_line_1} onChange={(e) => setNewEmp({ ...newEmp, address_line_1: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="e.g. 12, Mohamadh Ali Street (Optional)" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>City</label>
                                            <input 
                                                type="text" 
                                                maxLength={35}
                                                value={newEmp.city} 
                                                onChange={(e) => setNewEmp({ ...newEmp, city: sanitizeName(e.target.value, 35) })} 
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                placeholder="e.g. Chennai" 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>State</label>
                                            <input 
                                                type="text" 
                                                maxLength={35}
                                                value={newEmp.state} 
                                                onChange={(e) => setNewEmp({ ...newEmp, state: sanitizeName(e.target.value, 35) })} 
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                placeholder="e.g. Tamil Nadu" 
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Pincode</label>
                                                {newEmp.pincode && (
                                                    <span style={{ 
                                                        fontSize: '0.62rem', 
                                                        fontWeight: '750', 
                                                        color: isValidPincode(newEmp.pincode) ? '#059669' : '#D97706'
                                                    }}>
                                                        {isValidPincode(newEmp.pincode) ? '✓ 6 digits' : `${newEmp.pincode.length}/6`}
                                                    </span>
                                                )}
                                            </div>
                                            <input 
                                                type="text" 
                                                maxLength={6}
                                                value={newEmp.pincode} 
                                                onChange={(e) => setNewEmp({ ...newEmp, pincode: sanitizePincode(e.target.value) })} 
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '0.55rem', 
                                                    borderRadius: '8px', 
                                                    border: newEmp.pincode ? (isValidPincode(newEmp.pincode) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                    outline: 'none', 
                                                    fontSize: '0.85rem', 
                                                    boxSizing: 'border-box',
                                                    fontFamily: 'monospace'
                                                }} 
                                                placeholder="e.g. 600040" 
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.0rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                                            <input 
                                                type="text" 
                                                maxLength={40}
                                                value={newEmp.emergency_contact_name} 
                                                onChange={(e) => setNewEmp({ ...newEmp, emergency_contact_name: sanitizeName(e.target.value, 40) })} 
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                placeholder="e.g. Vijay Kumar (Optional)" 
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Emergency Phone</label>
                                                {newEmp.emergency_contact_number && (
                                                    <span style={{ 
                                                        fontSize: '0.62rem', 
                                                        fontWeight: '750', 
                                                        color: isValidPhone(newEmp.emergency_contact_number) ? '#059669' : '#D97706'
                                                    }}>
                                                        {isValidPhone(newEmp.emergency_contact_number) ? '✓ 10 digits' : `${newEmp.emergency_contact_number.length}/10`}
                                                    </span>
                                                )}
                                            </div>
                                            <input 
                                                type="text" 
                                                maxLength={10}
                                                value={newEmp.emergency_contact_number} 
                                                onChange={(e) => setNewEmp({ ...newEmp, emergency_contact_number: sanitizePhone(e.target.value) })} 
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '0.55rem', 
                                                    borderRadius: '8px', 
                                                    border: (() => {
                                                        const cleanStaff = (newEmp.phone_number || '').replace(/[^0-9]/g, '');
                                                        const cleanEmerg = (newEmp.emergency_contact_number || '').replace(/[^0-9]/g, '');
                                                        const isSame = cleanStaff && cleanEmerg && (cleanStaff === cleanEmerg || (cleanStaff.length >= 10 && cleanEmerg.length >= 10 && cleanStaff.slice(-10) === cleanEmerg.slice(-10)));
                                                        if (isSame) return '1.5px solid #EF4444';
                                                        return newEmp.emergency_contact_number ? (isValidPhone(newEmp.emergency_contact_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1';
                                                    })(), 
                                                    outline: 'none', 
                                                    fontSize: '0.85rem', 
                                                    boxSizing: 'border-box' 
                                                }} 
                                                placeholder="e.g. 9876599911 (Optional)" 
                                            />
                                            {(() => {
                                                const cleanStaff = (newEmp.phone_number || '').replace(/[^0-9]/g, '');
                                                const cleanEmerg = (newEmp.emergency_contact_number || '').replace(/[^0-9]/g, '');
                                                const isSame = cleanStaff && cleanEmerg && (cleanStaff === cleanEmerg || (cleanStaff.length >= 10 && cleanEmerg.length >= 10 && cleanStaff.slice(-10) === cleanEmerg.slice(-10)));
                                                return isSame ? (
                                                    <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.3rem', display: 'block' }}>
                                                        ⚠️ Emergency contact cannot be the same as staff phone number
                                                    </span>
                                                ) : null;
                                            })()}
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
                                    style={{
                                        padding: '0.75rem 2rem',
                                        borderRadius: '12px',
                                        background: createEmpMutation.isPending ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: createEmpMutation.isPending ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)',
                                        opacity: createEmpMutation.isPending ? 0.7 : 1,
                                        pointerEvents: createEmpMutation.isPending ? 'none' : 'auto'
                                    }}
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
                                <select 
                                    required 
                                    value={perfForm.employee_id} 
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const matched = employees.find(emp => String(emp.employee_id) === String(selectedId) || String(emp.id) === String(selectedId));
                                        setPerfForm({ 
                                            employee_id: selectedId,
                                            rating: matched?.performance_rating ? parseFloat(matched.performance_rating) : 5.0,
                                            target_score: matched?.target_score ? parseInt(matched.target_score) : 95
                                        });
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id || emp.id} value={emp.employee_id || emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.employee_code || `CLK-00${emp.id}`}) - {emp.department_name || 'Staff'}
                                        </option>
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

                            <button 
                                type="submit" 
                                disabled={performanceMutation.isPending}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '1.1rem', 
                                    cursor: performanceMutation.isPending ? 'not-allowed' : 'pointer', 
                                    boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)',
                                    opacity: performanceMutation.isPending ? 0.7 : 1
                                }}
                            >
                                {performanceMutation.isPending ? 'Recording...' : 'Settle Appraisal Score'}
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
                                                        <input 
                                                            required 
                                                            type="text" 
                                                            maxLength={35}
                                                            value={editForm.first_name || ''} 
                                                            onChange={(e) => setEditForm({ ...editForm, first_name: sanitizeName(e.target.value, 35) })} 
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Last Name</label>
                                                        <input 
                                                            required 
                                                            type="text" 
                                                            maxLength={35}
                                                            value={editForm.last_name || ''} 
                                                            onChange={(e) => setEditForm({ ...editForm, last_name: sanitizeName(e.target.value, 35) })} 
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Date of Birth</label>
                                                            {calculateAge(editForm.date_of_birth) !== null && (
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                                                                    Age: {calculateAge(editForm.date_of_birth)} yrs
                                                                </span>
                                                            )}
                                                        </div>
                                                        <input
                                                            required
                                                            type="date"
                                                            max={maxDobDate}
                                                            value={editForm.date_of_birth || ''}
                                                            onChange={handleEditDobChange}
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                                        />
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
                                                        <input 
                                                            required 
                                                            type="text" 
                                                            maxLength={10}
                                                            value={editForm.phone || ''} 
                                                            onChange={(e) => setEditForm({ ...editForm, phone: sanitizePhone(e.target.value) })} 
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        />
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
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Department</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => { setShowAddDeptEdit(!showAddDeptEdit); setNewDeptInputEdit(''); }}
                                                                style={{ background: 'none', border: 'none', color: '#047857', fontSize: '0.68rem', fontWeight: '750', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                {showAddDeptEdit ? 'Cancel' : '+ Add Custom'}
                                                            </button>
                                                        </div>
                                                        {showAddDeptEdit ? (
                                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    placeholder="Department Name"
                                                                    value={newDeptInputEdit}
                                                                    onChange={(e) => setNewDeptInputEdit(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            const added = addCustomDepartment(newDeptInputEdit);
                                                                            if (added) setEditForm({ ...editForm, department: added });
                                                                            setShowAddDeptEdit(false);
                                                                        }
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #10B981', outline: 'none', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const added = addCustomDepartment(newDeptInputEdit);
                                                                        if (added) setEditForm({ ...editForm, department: added });
                                                                        setShowAddDeptEdit(false);
                                                                    }}
                                                                    style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: '#10B981', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.75rem', cursor: 'pointer' }}
                                                                >
                                                                    Add
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowAddDeptEdit(false)}
                                                                    style={{ padding: '0.5rem 0.5rem', borderRadius: '8px', background: '#E2E8F0', color: '#475569', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={editForm.department || 'Operations'}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '__ADD_NEW__') {
                                                                        setShowAddDeptEdit(true);
                                                                        setNewDeptInputEdit('');
                                                                    } else {
                                                                        setEditForm({ ...editForm, department: e.target.value });
                                                                    }
                                                                }}
                                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}
                                                            >
                                                                {allDepartments.map(dept => (
                                                                    <option key={dept} value={dept}>{dept}</option>
                                                                ))}
                                                                <option value="__ADD_NEW__">+ Add Custom Department...</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Designation Title</label>
                                                        <input type="text" value={editForm.designation || ''} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
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
                                                        <input type="date" value={editForm.joining_date || ''} onChange={(e) => setEditForm({ ...editForm, joining_date: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Reporting Manager</label>
                                                        <input 
                                                            type="text" 
                                                            maxLength={40}
                                                            value={editForm.reporting_manager || ''} 
                                                            onChange={(e) => setEditForm({ ...editForm, reporting_manager: sanitizeName(e.target.value, 40) })} 
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Employee ID / Code</label>
                                                        <input 
                                                            type="text" 
                                                            maxLength={16}
                                                            value={editForm.employee_code || ''} 
                                                            onChange={(e) => setEditForm({ ...editForm, employee_code: sanitizeEmpCode(e.target.value) })} 
                                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', textTransform: 'uppercase' }} 
                                                            placeholder="e.g. CLK-001" 
                                                        />
                                                    </div>
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
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Basic Monthly Salary</label>
                                                <input type="number" value={editForm.basic_salary || ''} onChange={(e) => setEditForm({ ...editForm, basic_salary: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>PAN Number</label>
                                                    {editForm.pan_number && (
                                                        <span style={{ 
                                                            fontSize: '0.62rem', 
                                                            fontWeight: '750', 
                                                            color: isValidPan(editForm.pan_number) ? '#059669' : '#D97706'
                                                        }}>
                                                            {isValidPan(editForm.pan_number) ? '✓ Valid PAN' : `${editForm.pan_number.length}/10 chars`}
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    maxLength={10}
                                                    value={editForm.pan_number || ''}
                                                    onChange={(e) => {
                                                        const val = sanitizePanInput(e.target.value);
                                                        setEditForm({ ...editForm, pan_number: val });
                                                    }}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.55rem', 
                                                        borderRadius: '8px', 
                                                        border: editForm.pan_number ? (isValidPan(editForm.pan_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                        outline: 'none', 
                                                        fontSize: '0.85rem', 
                                                        boxSizing: 'border-box', 
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        fontFamily: 'monospace'
                                                    }}
                                                    placeholder="ABCDE1234F"
                                                />
                                                <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                    Standard format: 5 letters, 4 digits, 1 letter
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>PF Number</label>
                                                    {editForm.pf_number && (
                                                        <span style={{ 
                                                            fontSize: '0.62rem', 
                                                            fontWeight: '750', 
                                                            color: isValidPf(editForm.pf_number) ? '#059669' : '#D97706'
                                                        }}>
                                                            {isValidPf(editForm.pf_number) ? '✓ Valid PF/UAN' : `${editForm.pf_number.length} chars`}
                                                        </span>
                                                    )}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    maxLength={26}
                                                    value={editForm.pf_number || ''} 
                                                    onChange={(e) => {
                                                        const val = sanitizePfInput(e.target.value);
                                                        setEditForm({ ...editForm, pf_number: val });
                                                    }} 
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.55rem', 
                                                        borderRadius: '8px', 
                                                        border: editForm.pf_number ? (isValidPf(editForm.pf_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                        outline: 'none', 
                                                        fontSize: '0.85rem', 
                                                        boxSizing: 'border-box',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.03em',
                                                        fontFamily: 'monospace'
                                                    }} 
                                                    placeholder="e.g. MH/BAN/0011223" 
                                                />
                                                <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                    Standard EPFO Member ID or 12-digit UAN
                                                </span>
                                            </div>
                                            <div>
                                                {(() => {
                                                    const val = (editForm.esi_number || '').trim();
                                                    const dup = val ? employees.find(e => String(e.id) !== String(currentSelectedEmployee?.id) && (e.esi_number || '').trim().toLowerCase() === val.toLowerCase()) : null;
                                                    return (
                                                        <>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: dup ? '#DC2626' : '#64748B' }}>
                                                                    ESI Number {dup && '(Must be unique)'}
                                                                </label>
                                                                {editForm.esi_number && !dup && (
                                                                    <span style={{ 
                                                                        fontSize: '0.62rem', 
                                                                        fontWeight: '750', 
                                                                        color: isValidEsi(editForm.esi_number) ? '#059669' : '#D97706'
                                                                    }}>
                                                                        {isValidEsi(editForm.esi_number) ? '✓ Valid ESI (17d)' : `${editForm.esi_number.length}/17 digits`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                maxLength={17}
                                                                value={editForm.esi_number || ''} 
                                                                onChange={(e) => {
                                                                    const val = sanitizeEsiInput(e.target.value);
                                                                    setEditForm({ ...editForm, esi_number: val });
                                                                }} 
                                                                style={{ 
                                                                    width: '100%', 
                                                                    padding: '0.55rem', 
                                                                    borderRadius: '8px', 
                                                                    border: dup ? '1.5px solid #EF4444' : (editForm.esi_number ? (isValidEsi(editForm.esi_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1'), 
                                                                    outline: 'none', 
                                                                    fontSize: '0.85rem', 
                                                                    boxSizing: 'border-box', 
                                                                    background: dup ? '#FEF2F2' : 'white',
                                                                    fontFamily: 'monospace'
                                                                }} 
                                                                placeholder="e.g. 31001234560001" 
                                                            />
                                                            {dup ? (
                                                                <span style={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: '750', marginTop: '0.25rem', display: 'block' }}>
                                                                    ⚠️ Already assigned to {dup.name}
                                                                </span>
                                                            ) : (
                                                                <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                                    Exact 17 numeric digits
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Bank Name</label>
                                                <input 
                                                    type="text" 
                                                    maxLength={50}
                                                    value={editForm.bank_name || ''} 
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^a-zA-Z\s.\-]/g, '').slice(0, 50);
                                                        setEditForm({ ...editForm, bank_name: val });
                                                    }} 
                                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                    placeholder="e.g. HDFC Bank (Optional)" 
                                                />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Bank Account Number</label>
                                                    {editForm.account_number && (
                                                        <span style={{ 
                                                            fontSize: '0.62rem', 
                                                            fontWeight: '750', 
                                                            color: isValidAccountNo(editForm.account_number) ? '#059669' : '#D97706'
                                                        }}>
                                                            {isValidAccountNo(editForm.account_number) ? '✓ Valid Account' : `${editForm.account_number.length}d (min 9)`}
                                                        </span>
                                                    )}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    maxLength={18}
                                                    value={editForm.account_number || ''} 
                                                    onChange={(e) => {
                                                        const val = sanitizeAccountNo(e.target.value);
                                                        setEditForm({ ...editForm, account_number: val });
                                                    }} 
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.55rem', 
                                                        borderRadius: '8px', 
                                                        border: editForm.account_number ? (isValidAccountNo(editForm.account_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                        outline: 'none', 
                                                        fontSize: '0.85rem', 
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'monospace'
                                                    }} 
                                                    placeholder="e.g. 50100223344551 (Optional)" 
                                                />
                                                <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                    9 to 18 numeric digits
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>IFSC Code</label>
                                                    {editForm.ifsc_code && (
                                                        <span style={{ 
                                                            fontSize: '0.62rem', 
                                                            fontWeight: '750', 
                                                            color: isValidIfsc(editForm.ifsc_code) ? '#059669' : '#D97706'
                                                        }}>
                                                            {isValidIfsc(editForm.ifsc_code) ? '✓ Valid IFSC' : `${editForm.ifsc_code.length}/11 chars`}
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    maxLength={11}
                                                    value={editForm.ifsc_code || ''}
                                                    onChange={(e) => {
                                                        const val = sanitizeIfscInput(e.target.value);
                                                        setEditForm({ ...editForm, ifsc_code: val });
                                                    }}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.55rem', 
                                                        borderRadius: '8px', 
                                                        border: editForm.ifsc_code ? (isValidIfsc(editForm.ifsc_code) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                        outline: 'none', 
                                                        fontSize: '0.85rem', 
                                                        boxSizing: 'border-box', 
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        fontFamily: 'monospace'
                                                    }}
                                                    placeholder="e.g. HDFC0000124 (Optional)"
                                                />
                                                <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                                                    11 chars: 4 letters, 0, 6 alphanumeric
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Info section */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Address & Emergency Details</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Residential Address Line 1</label>
                                                <input type="text" maxLength={100} value={editForm.address_line_1 || ''} onChange={(e) => setEditForm({ ...editForm, address_line_1: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="e.g. 12, Mohamadh Ali Street" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>City</label>
                                                    <input 
                                                        type="text" 
                                                        maxLength={35}
                                                        value={editForm.city || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, city: sanitizeName(e.target.value, 35) })} 
                                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        placeholder="e.g. Chennai" 
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>State</label>
                                                    <input 
                                                        type="text" 
                                                        maxLength={35}
                                                        value={editForm.state || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, state: sanitizeName(e.target.value, 35) })} 
                                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        placeholder="e.g. Tamil Nadu" 
                                                    />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Pincode</label>
                                                        {editForm.pincode && (
                                                            <span style={{ 
                                                                fontSize: '0.62rem', 
                                                                fontWeight: '750', 
                                                                color: isValidPincode(editForm.pincode) ? '#059669' : '#D97706'
                                                            }}>
                                                                {isValidPincode(editForm.pincode) ? '✓ 6 digits' : `${editForm.pincode.length}/6`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        maxLength={6}
                                                        value={editForm.pincode || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, pincode: sanitizePincode(e.target.value) })} 
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '0.55rem', 
                                                            borderRadius: '8px', 
                                                            border: editForm.pincode ? (isValidPincode(editForm.pincode) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1', 
                                                            outline: 'none', 
                                                            fontSize: '0.85rem', 
                                                            boxSizing: 'border-box',
                                                            fontFamily: 'monospace'
                                                        }} 
                                                        placeholder="e.g. 600040" 
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.0rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                                                    <input 
                                                        type="text" 
                                                        maxLength={40}
                                                        value={editForm.emergency_contact_name || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: sanitizeName(e.target.value, 40) })} 
                                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                                                        placeholder="e.g. Vijay Kumar (Optional)" 
                                                    />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Emergency Phone</label>
                                                        {editForm.emergency_contact_number && (
                                                            <span style={{ 
                                                                fontSize: '0.62rem', 
                                                                fontWeight: '750', 
                                                                color: isValidPhone(editForm.emergency_contact_number) ? '#059669' : '#D97706'
                                                            }}>
                                                                {isValidPhone(editForm.emergency_contact_number) ? '✓ 10 digits' : `${editForm.emergency_contact_number.length}/10`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        maxLength={10}
                                                        value={editForm.emergency_contact_number || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_number: sanitizePhone(e.target.value) })} 
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '0.55rem', 
                                                            borderRadius: '8px', 
                                                            border: (() => {
                                                                const cleanStaff = (editForm.phone || '').replace(/[^0-9]/g, '');
                                                                const cleanEmerg = (editForm.emergency_contact_number || '').replace(/[^0-9]/g, '');
                                                                const isSame = cleanStaff && cleanEmerg && (cleanStaff === cleanEmerg || (cleanStaff.length >= 10 && cleanEmerg.length >= 10 && cleanStaff.slice(-10) === cleanEmerg.slice(-10)));
                                                                if (isSame) return '1.5px solid #EF4444';
                                                                return editForm.emergency_contact_number ? (isValidPhone(editForm.emergency_contact_number) ? '1px solid #10B981' : '1.5px solid #F59E0B') : '1px solid #CBD5E1';
                                                            })(), 
                                                            outline: 'none', 
                                                            fontSize: '0.85rem', 
                                                            boxSizing: 'border-box' 
                                                        }} 
                                                        placeholder="e.g. 9876599911 (Optional)" 
                                                    />
                                                    {(() => {
                                                        const cleanStaff = (editForm.phone || '').replace(/[^0-9]/g, '');
                                                        const cleanEmerg = (editForm.emergency_contact_number || '').replace(/[^0-9]/g, '');
                                                        const isSame = cleanStaff && cleanEmerg && (cleanStaff === cleanEmerg || (cleanStaff.length >= 10 && cleanEmerg.length >= 10 && cleanStaff.slice(-10) === cleanEmerg.slice(-10)));
                                                        return isSame ? (
                                                            <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.3rem', display: 'block' }}>
                                                                ⚠️ Emergency contact cannot be the same as staff phone number
                                                            </span>
                                                        ) : null;
                                                    })()}
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.25rem', minWidth: 0 }}>
                                        
                                        {/* Personal Info Card */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9', minWidth: 0, overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={14} />
                                                </div>
                                                Personal Info
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Employee ID</span> 
                                                    <span style={{ fontWeight: '800', color: '#0F172A', textAlign: 'right', minWidth: 0, wordBreak: 'break-all' }}>{currentSelectedEmployee.employee_code}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Date of Birth</span>
                                                    <span style={{ fontWeight: '750', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'right', minWidth: 0 }}>
                                                        {currentSelectedEmployee.date_of_birth}
                                                        {calculateAge(currentSelectedEmployee.date_of_birth) !== null && (
                                                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.05rem 0.35rem', borderRadius: '4px', flexShrink: 0 }}>
                                                                Age: {calculateAge(currentSelectedEmployee.date_of_birth)} yrs
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Gender</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0 }}>{currentSelectedEmployee.gender}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Blood Group</span> 
                                                    <span style={{ fontWeight: '800', color: '#E11D48', textAlign: 'right', minWidth: 0 }}>{currentSelectedEmployee.blood_group}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Phone</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, wordBreak: 'break-all' }}>{currentSelectedEmployee.phone_number}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Email</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, wordBreak: 'break-all' }}>{currentSelectedEmployee.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Job Details Card */}
                                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9', minWidth: 0, overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Briefcase size={14} />
                                                </div>
                                                Job Details
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Joined Date</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0 }}>{currentSelectedEmployee.joining_date}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Employment Type</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0 }}>{currentSelectedEmployee.employment_type}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Manager</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.reporting_manager}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Work Shift</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.shift_name}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Performance</span> 
                                                    <span style={{ fontWeight: '800', color: '#F59E0B', textAlign: 'right', minWidth: 0 }}>⭐ {currentSelectedEmployee.performance_rating} / 5.0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payroll & Financials Card */}
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9', minWidth: 0, overflow: 'hidden' }}>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={14} />
                                            </div>
                                            Payroll & Financials
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem', fontSize: '0.85rem', minWidth: 0 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Basic Salary</span> 
                                                    <span style={{ fontWeight: '850', color: '#064E3B', textAlign: 'right', minWidth: 0 }}>{formatCurrency(currentSelectedEmployee.basic_salary)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>PAN Number</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.pan_number || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>PF Number</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.pf_number || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>ESI Number</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.esi_number || '-'}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>Bank Name</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.bank_name || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>Account Number</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.account_number || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minWidth: 0, gap: '0.5rem' }}>
                                                    <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0, minWidth: '85px' }}>Bank IFSC</span> 
                                                    <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{currentSelectedEmployee.ifsc_code || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Attendance & Monthly Payout Summary Card with "View All" & "Mark Attendance" */}
                                    <div style={{ background: '#ECFDF5', padding: '1.25rem', borderRadius: '20px', border: '1px solid #D1FAE5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#065F46', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={14} />
                                                </div>
                                                Attendance & Monthly Payout Summary
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAttendanceDate(getTodayLocalDate());
                                                        setAttendanceStatus('Present');
                                                        setAttendanceNote('');
                                                        setAllowOverwrite(false);
                                                        setShowMarkModal(true);
                                                    }}
                                                    style={{ border: 'none', background: '#059669', color: 'white', padding: '0.45rem 0.95rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                                                >
                                                    <Plus size={13} /> Mark Attendance
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowHistoryModal(true)}
                                                    style={{ border: '1px solid #A7F3D0', background: 'white', color: '#065F46', padding: '0.45rem 0.95rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)', transition: 'all 0.2s' }}
                                                >
                                                    <Eye size={13} /> View All Records
                                                </button>
                                            </div>
                                        </div>
                                        {(() => {
                                            const joinD = new Date(currentSelectedEmployee.joining_date);
                                            const now = new Date();
                                            const isThisMonth = joinD.getMonth() === now.getMonth() && joinD.getFullYear() === now.getFullYear();
                                            const daysPassed = isThisMonth ? Math.max(0, now.getDate() - joinD.getDate() + 1) : 22;
                                            const baseLeaves = isThisMonth ? 0 : (currentSelectedEmployee.leave_balance % 4);
                                            const basePresent = Math.max(0, daysPassed - baseLeaves);

                                            const empLogs = getEmployeeAttendance(currentSelectedEmployee.employee_id);

                                            const extraPresent = empLogs.filter(a => (a.status || '').toLowerCase() === 'present').length + (empLogs.filter(a => (a.status || '').toLowerCase() === 'half day').length * 0.5);
                                            const extraLeaves = empLogs.filter(a => (a.status || '').toLowerCase() === 'on leave' || (a.status || '').toLowerCase() === 'absent').length + (empLogs.filter(a => (a.status || '').toLowerCase() === 'half day').length * 0.5);

                                            const present = basePresent + extraPresent;
                                            const leaves = baseLeaves + extraLeaves;
                                            const netPayout = Math.max(0, currentSelectedEmployee.basic_salary - (leaves * (currentSelectedEmployee.basic_salary / 30)));
                                            
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

                                    {/* Inline Attendance Entry Dialog */}
                                    {showMarkModal && (() => {
                                        const currentEmpLogs = getEmployeeAttendance(currentSelectedEmployee.employee_id);
                                        const existingRecordForDate = currentEmpLogs.find(r => r.date === attendanceDate);
                                        const isAlreadyMarked = Boolean(existingRecordForDate);

                                        const todayDateStr = getTodayLocalDate();
                                        const yesterdayDateStr = getYesterdayLocalDate();
                                        const currentYear = new Date().getFullYear();
                                        let minAttendanceDate = `${currentYear}-01-01`;
                                        if (currentSelectedEmployee?.joining_date) {
                                            const joinStr = currentSelectedEmployee.joining_date;
                                            if (joinStr && joinStr <= todayDateStr) {
                                                minAttendanceDate = joinStr;
                                            }
                                        }
                                        if (minAttendanceDate > todayDateStr) {
                                            minAttendanceDate = todayDateStr;
                                        }

                                        return (
                                            <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
                                                <div style={{ background: 'white', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', border: '1px solid #E2E8F0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
                                                        <h5 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                                                            Log Attendance: {currentSelectedEmployee.first_name} {currentSelectedEmployee.last_name}
                                                        </h5>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowMarkModal(false)}
                                                            style={{ border: 'none', background: '#F1F5F9', color: '#64748B', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    <form onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        const empId = currentSelectedEmployee.employee_id;

                                                        if (attendanceDate < minAttendanceDate || attendanceDate > todayDateStr) {
                                                            alert(`Please select an attendance date between ${minAttendanceDate} and ${todayDateStr}.`);
                                                            return;
                                                        }

                                                        const currentLogs = getEmployeeAttendance(empId);
                                                        const alreadyLogged = currentLogs.find(r => r.date === attendanceDate);

                                                        if (alreadyLogged && !allowOverwrite) {
                                                            alert(`Attendance for ${currentSelectedEmployee.first_name} has already been marked as "${alreadyLogged.status}" for ${attendanceDate}. Attendance can be marked only once for one day.`);
                                                            return;
                                                        }

                                                        try {
                                                            setAttendanceLoading(true);
                                                            await attendanceService.createPunch({
                                                                employee_id: empId,
                                                                date: attendanceDate,
                                                                status: attendanceStatus,
                                                                notes: attendanceNote,
                                                                employee_name: `${currentSelectedEmployee.first_name} ${currentSelectedEmployee.last_name}`.trim(),
                                                                overwrite: allowOverwrite
                                                            });

                                                            await queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
                                                            await refetchAttendances();

                                                            setShowMarkModal(false);
                                                            setAttendanceNote('');
                                                            setAllowOverwrite(false);
                                                            alert(alreadyLogged 
                                                                ? `Attendance updated: ${currentSelectedEmployee.first_name} changed to "${attendanceStatus}" for ${attendanceDate}` 
                                                                : `Attendance logged: ${currentSelectedEmployee.first_name} marked as "${attendanceStatus}" for ${attendanceDate}`
                                                            );
                                                        } catch (err) {
                                                            console.error('Failed to save attendance to backend:', err);
                                                            const errorMsg = err.response?.data?.message || err.message || 'Failed to save attendance';
                                                            alert(errorMsg);
                                                        } finally {
                                                            setAttendanceLoading(false);
                                                        }
                                                    }} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', textAlign: 'left' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                                                                    Attendance Date *
                                                                </label>
                                                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setAttendanceDate(todayDateStr);
                                                                            setAllowOverwrite(false);
                                                                        }}
                                                                        style={{
                                                                            padding: '0.15rem 0.5rem',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.68rem',
                                                                            fontWeight: '750',
                                                                            border: '1px solid #CBD5E1',
                                                                            background: attendanceDate === todayDateStr ? '#E2E8F0' : '#FFFFFF',
                                                                            color: '#0F172A',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Today
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (yesterdayDateStr >= minAttendanceDate) {
                                                                                setAttendanceDate(yesterdayDateStr);
                                                                                setAllowOverwrite(false);
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            padding: '0.15rem 0.5rem',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.68rem',
                                                                            fontWeight: '750',
                                                                            border: '1px solid #CBD5E1',
                                                                            background: attendanceDate === yesterdayDateStr ? '#E2E8F0' : '#FFFFFF',
                                                                            color: '#0F172A',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Yesterday
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="date"
                                                                value={attendanceDate}
                                                                min={minAttendanceDate}
                                                                max={todayDateStr}
                                                                onChange={(e) => {
                                                                    setAttendanceDate(e.target.value);
                                                                    setAllowOverwrite(false);
                                                                }}
                                                                style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                                                required
                                                            />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem', fontSize: '0.7rem', color: '#64748B' }}>
                                                                <span>📅 {(() => {
                                                                    if (!attendanceDate) return 'No date selected';
                                                                    try {
                                                                        const parts = attendanceDate.split('-');
                                                                        if (parts.length === 3) {
                                                                            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                                                            return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                                                                        }
                                                                        return attendanceDate;
                                                                    } catch (e) {
                                                                        return attendanceDate;
                                                                    }
                                                                })()}</span>
                                                                <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Valid: {minAttendanceDate} to {todayDateStr}</span>
                                                            </div>
                                                        </div>

                                                        {isAlreadyMarked && (
                                                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', padding: '0.65rem 0.75rem', fontSize: '0.75rem', color: '#991B1B', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                                <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <span>⚠️ Attendance Already Marked</span>
                                                                </div>
                                                                <div style={{ color: '#7F1D1D', fontSize: '0.72rem', lineHeight: '1.4' }}>
                                                                    Attendance for <strong>{attendanceDate}</strong> is already recorded as <strong>"{existingRecordForDate.status}"</strong>. Attendance can be marked only once for one day.
                                                                </div>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', cursor: 'pointer', fontSize: '0.72rem', color: '#1E293B', fontWeight: '750' }}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={allowOverwrite} 
                                                                        onChange={(e) => setAllowOverwrite(e.target.checked)} 
                                                                        style={{ width: '14px', height: '14px', accentColor: '#0e4b34', cursor: 'pointer' }}
                                                                    />
                                                                    <span>Update / overwrite existing status</span>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                                Status
                                                            </label>
                                                            <select
                                                                value={attendanceStatus}
                                                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                                                style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                                            >
                                                                <option value="Present">Present (Full Day)</option>
                                                                <option value="Half Day">Half Day</option>
                                                                <option value="On Leave">Approved Leave</option>
                                                                <option value="Absent">Unexcused Absent</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                                Notes (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. On-site client meeting"
                                                                value={attendanceNote}
                                                                onChange={(e) => setAttendanceNote(e.target.value)}
                                                                style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', color: '#1E293B', boxSizing: 'border-box' }}
                                                            />
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowMarkModal(false)}
                                                                style={{ flex: 1, padding: '0.6rem', background: '#F1F5F9', border: 'none', color: '#475569', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={attendanceLoading || (isAlreadyMarked && !allowOverwrite)}
                                                                style={{ 
                                                                    flex: 1, 
                                                                    padding: '0.6rem', 
                                                                    background: (isAlreadyMarked && !allowOverwrite) ? '#94A3B8' : '#0e4b34', 
                                                                    border: 'none', 
                                                                    color: 'white', 
                                                                    borderRadius: '10px', 
                                                                    fontSize: '0.8rem', 
                                                                    fontWeight: '750', 
                                                                    cursor: (isAlreadyMarked && !allowOverwrite) ? 'not-allowed' : 'pointer' 
                                                                }}
                                                            >
                                                                {attendanceLoading ? 'Saving...' : (isAlreadyMarked ? (allowOverwrite ? 'Update Record' : 'Already Marked') : 'Save Record')}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        );
                                    })()}

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
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9', minWidth: 0, overflow: 'hidden' }}>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: '850', color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MapPin size={14} />
                                            </div>
                                            Contact & Emergency Info
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.35rem', borderBottom: '1px solid #EAF0F6', minWidth: 0, gap: '0.75rem' }}>
                                                <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Residential Address</span> 
                                                <span style={{ fontWeight: '750', color: '#0F172A', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                    {[currentSelectedEmployee.address_line_1, currentSelectedEmployee.city, currentSelectedEmployee.state].filter(Boolean).join(', ')}{currentSelectedEmployee.pincode ? ` - ${currentSelectedEmployee.pincode}` : ''}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.15rem', minWidth: 0, gap: '0.75rem' }}>
                                                <span style={{ color: '#64748B', fontWeight: '600', flexShrink: 0 }}>Emergency Contact</span> 
                                                <span style={{ fontWeight: '750', color: '#E11D48', textAlign: 'right', minWidth: 0, flex: 1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
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
            <LodgeStaffClaimModal
                isOpen={isClaimModalOpen}
                onClose={closeClaimModal}
                staffList={employees}
                onClaimSubmitted={() => {
                    queryClient.invalidateQueries({ queryKey: ['claimsList'] });
                    queryClient.invalidateQueries({ queryKey: ['expensesList'] });
                    alert('Reimbursement claim submitted successfully.');
                    closeClaimModal();
                }}
            />


            {/* Edit Monthly Leave Policy Quota Modal */}
            {isQuotaModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '28px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sliders size={18} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Set Monthly Leave Quota</h3>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.15rem 0 0 0', fontWeight: '600' }}>Define default workforce leave policy</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsQuotaModalOpen(false)}
                                style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCompanyQuota} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                    Standard Monthly Quota (Days / Month)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                    <style>{`
                                        .quota-input-clean::-webkit-inner-spin-button,
                                        .quota-input-clean::-webkit-outer-spin-button {
                                            -webkit-appearance: none !important;
                                            margin: 0 !important;
                                        }
                                        .quota-input-clean {
                                            -moz-appearance: textfield !important;
                                        }
                                    `}</style>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="30"
                                        required
                                        value={tempQuota}
                                        onChange={(e) => setTempQuota(e.target.value)}
                                        className="quota-input-clean"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderTopLeftRadius: '12px',
                                            borderBottomLeftRadius: '12px',
                                            border: '1px solid #CBD5E1',
                                            borderRight: 'none',
                                            outline: 'none',
                                            fontSize: '1.15rem',
                                            fontWeight: '800',
                                            color: '#064E3B',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: '#ECFDF5',
                                        border: '1px solid #A7F3D0',
                                        borderTopRightRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                        padding: '0 0.85rem',
                                        userSelect: 'none'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setTempQuota(prev => Math.min(30, parseFloat((parseFloat(prev || 0) + 0.5).toFixed(1))))}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #A7F3D0',
                                                    borderRadius: '4px',
                                                    width: '20px',
                                                    height: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#047857',
                                                    padding: 0
                                                }}
                                                title="Increase by 0.5"
                                            >
                                                <ChevronUp size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTempQuota(prev => Math.max(0, parseFloat((parseFloat(prev || 0) - 0.5).toFixed(1))))}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #A7F3D0',
                                                    borderRadius: '4px',
                                                    width: '20px',
                                                    height: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#047857',
                                                    padding: 0
                                                }}
                                                title="Decrease by 0.5"
                                            >
                                                <ChevronDown size={12} />
                                            </button>
                                        </div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '800',
                                            color: '#047857'
                                        }}>
                                            Days / Mo
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '750', marginTop: '0.35rem', display: 'block' }}>
                                    🌴 Equals {((parseFloat(tempQuota) || 0) * 12).toFixed(1)} Days Annual Leave Quota
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                <input
                                    type="checkbox"
                                    id="apply_all_chk"
                                    checked={applyToAll}
                                    onChange={(e) => setApplyToAll(e.target.checked)}
                                    style={{ accentColor: '#059669', marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="apply_all_chk" style={{ fontSize: '0.75rem', color: '#1E293B', fontWeight: '750', cursor: 'pointer', lineHeight: '1.4' }}>
                                    Apply and sync this quota to all {employees.length} current employees (recalculates annual leave balance = Quota × 12)
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsQuotaModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.65rem 1.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                                >
                                    Save Leave Quota Policy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Shift & Leaves Roster Modal for Employee */}
            {isRosterModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '28px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Sliders size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>
                                        Edit Shift & Leaves Roster
                                    </h3>
                                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0', fontWeight: '600' }}>
                                        {rosterForm.employee_name} • Basic Salary: {formatCurrency(rosterForm.basic_salary)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRosterModalOpen(false)}
                                style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRoster} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* 1. Work Shift & Custom Timing */}
                            <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '850', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={15} color="#059669" /> Work Shift & Timing Settings
                                    </label>
                                    <div style={{ display: 'flex', background: '#E2E8F0', padding: '2px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '750' }}>
                                        <button
                                            type="button"
                                            onClick={() => setRosterForm({ ...rosterForm, shift_mode: 'preset' })}
                                            style={{
                                                border: 'none',
                                                background: rosterForm.shift_mode === 'preset' ? 'white' : 'transparent',
                                                color: rosterForm.shift_mode === 'preset' ? '#064E3B' : '#64748B',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '800'
                                            }}
                                        >
                                            Standard Presets
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRosterForm({ ...rosterForm, shift_mode: 'custom' })}
                                            style={{
                                                border: 'none',
                                                background: rosterForm.shift_mode === 'custom' ? '#059669' : 'transparent',
                                                color: rosterForm.shift_mode === 'custom' ? 'white' : '#64748B',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '800'
                                            }}
                                        >
                                            Custom Timing
                                        </button>
                                    </div>
                                </div>

                                {rosterForm.shift_mode === 'preset' ? (
                                    <div>
                                        <select
                                            value={rosterForm.preset_shift}
                                            onChange={(e) => setRosterForm({ ...rosterForm, preset_shift: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white' }}
                                        >
                                            <option>General Shift (9 AM - 6 PM)</option>
                                            <option>Morning Shift (6 AM - 2 PM)</option>
                                            <option>Evening Shift (2 PM - 10 PM)</option>
                                            <option>Night Shift (10 PM - 6 AM)</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Shift Title / Label</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Day Shift, Store Opening, Flexible Hours"
                                                value={rosterForm.custom_shift_name}
                                                onChange={(e) => setRosterForm({ ...rosterForm, custom_shift_name: e.target.value })}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Start Time</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 09:30 AM"
                                                    value={rosterForm.custom_start_time}
                                                    onChange={(e) => setRosterForm({ ...rosterForm, custom_start_time: e.target.value })}
                                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>End Time</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 06:30 PM"
                                                    value={rosterForm.custom_end_time}
                                                    onChange={(e) => setRosterForm({ ...rosterForm, custom_end_time: e.target.value })}
                                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ background: '#ECFDF5', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#047857', fontWeight: '750', border: '1px solid #A7F3D0' }}>
                                            Assigned Shift Preview: {rosterForm.custom_shift_name.trim() || 'Work Shift'} ({rosterForm.custom_start_time} - {rosterForm.custom_end_time})
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Monthly Leave Quota & Annual Leave Balance */}
                            <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <label style={{ display: 'flex', fontSize: '0.82rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', alignItems: 'center', gap: '0.4rem' }}>
                                    <Calendar size={15} color="#2563EB" /> Monthly Leave Quota & Balance
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Monthly Leave Quota (Days / Mo)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="31"
                                            value={rosterForm.monthly_leave_quota}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                if (raw === '') {
                                                    setRosterForm({ ...rosterForm, monthly_leave_quota: '' });
                                                    return;
                                                }
                                                const num = parseFloat(raw);
                                                if (!isNaN(num)) {
                                                    if (num < 0) return;
                                                    if (num > 31) {
                                                        setRosterForm({ ...rosterForm, monthly_leave_quota: '31' });
                                                        return;
                                                    }
                                                }
                                                setRosterForm({ ...rosterForm, monthly_leave_quota: raw });
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                        />
                                        <span style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: '700', marginTop: '0.25rem', display: 'block' }}>
                                            = {((parseFloat(rosterForm.monthly_leave_quota) || 0) * 12).toFixed(1)} Days / Year
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Annual Leave Balance Left</label>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Max 60 Days</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="60"
                                            value={rosterForm.leave_balance}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                if (raw === '') {
                                                    setRosterForm({ ...rosterForm, leave_balance: '' });
                                                    return;
                                                }
                                                const num = parseFloat(raw);
                                                if (!isNaN(num)) {
                                                    if (num < 0) return;
                                                    if (num > 60) {
                                                        // Strictly clamp beyond infinity numbers
                                                        setRosterForm({ ...rosterForm, leave_balance: '60' });
                                                        return;
                                                    }
                                                }
                                                setRosterForm({ ...rosterForm, leave_balance: raw });
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
                                            <input
                                                type="checkbox"
                                                id="sync_bal"
                                                checked={rosterForm.sync_balance}
                                                onChange={(e) => {
                                                    const chk = e.target.checked;
                                                    const curQ = (!isNaN(parseFloat(rosterForm.monthly_leave_quota)) && rosterForm.monthly_leave_quota !== '') ? parseFloat(rosterForm.monthly_leave_quota) : 1.5;
                                                    const calculatedBal = Math.min(60, Math.round(curQ * 12));
                                                    setRosterForm({
                                                        ...rosterForm,
                                                        sync_balance: chk,
                                                        leave_balance: chk ? calculatedBal : rosterForm.leave_balance
                                                    });
                                                }}
                                                style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="sync_bal" style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                                                Reset to Quota × 12 ({Math.min(60, Math.round(((!isNaN(parseFloat(rosterForm.monthly_leave_quota)) && rosterForm.monthly_leave_quota !== '') ? parseFloat(rosterForm.monthly_leave_quota) : 1.5) * 12))} d)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Annual Bonus Structure */}
                            <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '850', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <CreditCard size={15} color="#D97706" /> Annual Bonus Settings
                                    </label>
                                    <div style={{ display: 'flex', background: '#E2E8F0', padding: '2px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '750' }}>
                                        <button
                                            type="button"
                                            onClick={() => setRosterForm({ ...rosterForm, bonus_mode: 'percentage' })}
                                            style={{
                                                border: 'none',
                                                background: rosterForm.bonus_mode === 'percentage' ? 'white' : 'transparent',
                                                color: rosterForm.bonus_mode === 'percentage' ? '#B45309' : '#64748B',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '800'
                                            }}
                                        >
                                            % of Salary
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRosterForm({ ...rosterForm, bonus_mode: 'fixed' })}
                                            style={{
                                                border: 'none',
                                                background: rosterForm.bonus_mode === 'fixed' ? '#D97706' : 'transparent',
                                                color: rosterForm.bonus_mode === 'fixed' ? 'white' : '#64748B',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '800'
                                            }}
                                        >
                                            Fixed Amount (₹)
                                        </button>
                                    </div>
                                </div>

                                {rosterForm.bonus_mode === 'percentage' ? (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Annual Bonus % (Max 100%)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="100"
                                            value={rosterForm.annual_bonus_pct}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                if (raw === '') {
                                                    setRosterForm({ ...rosterForm, annual_bonus_pct: '' });
                                                    return;
                                                }
                                                const num = parseFloat(raw);
                                                if (!isNaN(num)) {
                                                    if (num < 0) return;
                                                    if (num > 100) {
                                                        setRosterForm({ ...rosterForm, annual_bonus_pct: '100' });
                                                        return;
                                                    }
                                                }
                                                setRosterForm({ ...rosterForm, annual_bonus_pct: raw });
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                        />
                                        <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: '750', marginTop: '0.3rem', display: 'block' }}>
                                            Est. Annual Bonus: {formatCurrency(Math.round(rosterForm.basic_salary * ((parseFloat(rosterForm.annual_bonus_pct) || 0) / 100)))}
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>Fixed Annual Bonus Amount (INR, Max ₹1 Crore)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10000000"
                                            placeholder="e.g. 25000"
                                            value={rosterForm.annual_bonus_amt}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                if (raw === '') {
                                                    setRosterForm({ ...rosterForm, annual_bonus_amt: '' });
                                                    return;
                                                }
                                                const num = parseFloat(raw);
                                                if (!isNaN(num)) {
                                                    if (num < 0) return;
                                                    if (num > 10000000) {
                                                        setRosterForm({ ...rosterForm, annual_bonus_amt: '10000000' });
                                                        return;
                                                    }
                                                }
                                                setRosterForm({ ...rosterForm, annual_bonus_amt: raw });
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 4. Weekly Off / Week Off */}
                            <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <label style={{ display: 'flex', fontSize: '0.82rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', alignItems: 'center', gap: '0.4rem' }}>
                                    <Sun size={15} color="#475569" /> Weekly Off / Holiday
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: rosterForm.weekly_off === 'Custom' ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                                    <div>
                                        <select
                                            value={rosterForm.weekly_off}
                                            onChange={(e) => setRosterForm({ ...rosterForm, weekly_off: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white' }}
                                        >
                                            <option>Sunday Off</option>
                                            <option>Saturday & Sunday Off</option>
                                            <option>Friday Off</option>
                                            <option>Monday Off</option>
                                            <option>Tuesday Off</option>
                                            <option>Wednesday Off</option>
                                            <option>Thursday Off</option>
                                            <option>Rotational Off</option>
                                            <option>Custom</option>
                                        </select>
                                    </div>
                                    {rosterForm.weekly_off === 'Custom' && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2nd & 4th Sat + Sunday"
                                                value={rosterForm.custom_weekly_off}
                                                onChange={(e) => setRosterForm({ ...rosterForm, custom_weekly_off: e.target.value })}
                                                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsRosterModalOpen(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateRosterMutation.isPending}
                                    style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                                >
                                    {updateRosterMutation.isPending ? 'Saving...' : 'Save Roster Settings'}
                                </button>
                            </div>
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
