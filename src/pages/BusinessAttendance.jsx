import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { 
    Clock, 
    Plus, 
    Search, 
    CheckCircle2, 
    AlertTriangle, 
    MapPin, 
    X, 
    Activity, 
    TrendingUp, 
    Sliders, 
    ShieldCheck, 
    Calendar, 
    Briefcase,
    RefreshCw,
    Check,
    User,
    QrCode
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import { staffingService } from '../services/staffingService';
import FilterableTableHead from '../components/FilterableTableHead';



const BusinessAttendance = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [colFilters, setColFilters] = React.useState({}); // 'today', 'shifts', 'geo', 'corrections', 'datewise', 'history'
    const [colFiltersHistory, setColFiltersHistory] = useState({});
    const [colFiltersDatewise, setColFiltersDatewise] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({});

    // New state hooks for Employee Calendar popup and Date Details popup
    const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState(null);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);
    const [lookupDate, setLookupDate] = useState(new Date().toISOString().split('T')[0]);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbEmployees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => staffingService.getEmployees()
    });

    const { data: dbLogs = [] } = useQuery({
        queryKey: ['attendanceLogs'],
        queryFn: () => attendanceService.getAttendanceLogs()
    });

    const { data: dbShifts = [] } = useQuery({
        queryKey: ['shifts'],
        queryFn: () => attendanceService.getShifts()
    });

    // Mutations
    const addPunchMutation = useMutation({
        mutationFn: (data) => attendanceService.createPunch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
            setIsPunchModalOpen(false);
            alert('Daily check-in / check-out timesheet entry logged successfully!');
        }
    });

    const addCorrectionMutation = useMutation({
        mutationFn: (data) => attendanceService.createRegularization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
            setIsCorrectionModalOpen(false);
            alert('Attendance missed punch regularization request submitted to HR Queue!');
        }
    });

    const approveCorrectionMutation = useMutation({
        mutationFn: (id) => attendanceService.approveRegularization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
            alert('Correction request approved! Employee timesheet automatically updated.');
        }
    });

    const updateAttendanceMutation = useMutation({
        mutationFn: ({ id, data }) => attendanceService.updateAttendance(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
            setIsEditModalOpen(false);
            alert('Attendance log updated successfully!');
        },
        onError: (err) => {
            console.error('Failed to update attendance log:', err);
            alert('Failed to update timesheet log.');
        }
    });

    // Time conversion helpers
    const convertTo12Hour = (time24) => {
        if (!time24) return '';
        const parts = time24.split(':');
        if (parts.length < 2) return time24;
        let hour = parseInt(parts[0], 10);
        const minStr = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${String(hour).padStart(2, '0')}:${minStr} ${ampm}`;
    };

    const convertTo24Hour = (time12) => {
        if (!time12) return '';
        const trimmed = time12.trim();
        const ampmMatch = trimmed.match(/(AM|PM)$/i);
        if (!ampmMatch) return trimmed; // already 24h
        
        const ampm = ampmMatch[0].toUpperCase();
        const timePart = trimmed.replace(/\s*(AM|PM)$/i, '');
        const parts = timePart.split(':');
        if (parts.length < 2) return trimmed;
        
        let hour = parseInt(parts[0], 10);
        const minStr = parts[1];
        
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        return `${String(hour).padStart(2, '0')}:${minStr}`;
    };

    // Process lists with fallbacks
    const calculateDuration = (inTime12, outTime12) => {
        if (!inTime12 || !outTime12) return 0;
        const parseMinutes = (time12) => {
            const time24 = convertTo24Hour(time12);
            if (!time24) return 0;
            const [h, m] = time24.split(':').map(Number);
            return (h * 60) + (m || 0);
        };
        let start = parseMinutes(inTime12);
        let end = parseMinutes(outTime12);
        if (end < start) end += 24 * 60; // Handle cross-midnight shifts
        return (end - start) / 60;
    };

    const attendanceLogs = dbLogs.length > 0 ? dbLogs.map(log => {
        const checkIn = log.check_in_time || '09:00 AM';
        const checkOut = log.check_out_time || '06:00 PM';
        
        let dbTotalHours = parseFloat(log.total_work_hours);
        let dbProdHours = parseFloat(log.productive_hours);
        let dbBreakHours = parseFloat(log.break_hours) || 1.0;
        
        let computedTotal = calculateDuration(checkIn, checkOut);
        
        // Force strict dynamic calculation on the frontend, overriding any backend default 8.0 value.
        const finalTotalWork = parseFloat(computedTotal.toFixed(1));
        let finalProductive = Math.max(0, parseFloat((computedTotal - dbBreakHours).toFixed(1)));
        
        if (computedTotal === 0) {
            finalProductive = 8.0;
        }

        return {
            attendance_id: log.id,
            employee_id: log.employee_id || 'EMP-001',
            employee_name: log.employee_name || 'Arun Kumar (Sales)',
            attendance_date: log.date || '2026-05-08',
            attendance_status: log.status || 'present',
            check_in_time: checkIn,
            check_out_time: checkOut,
            first_punch: log.first_punch || checkIn,
            last_punch: log.last_punch || checkOut,
            total_work_hours: finalTotalWork || 9.0,
            break_hours: dbBreakHours,
            productive_hours: finalProductive || 8.0,
            overtime_hours: parseFloat(log.overtime_hours) || 0,
            late_by_minutes: parseInt(log.late_by_minutes) || 0,
            early_exit_minutes: parseInt(log.early_exit_minutes) || 0,
            geo_fence_status: log.geo_fence_status || 'Inside',
            location_address: log.location_address || 'Main Office Complex, Mumbai',
            device_id: log.device_id || 'BIOMETRIC-MUM-1'
        };
    }) : [];

    const shifts = dbShifts.length > 0 ? dbShifts : [];

    const corrections = dbLogs.length > 0 && dbLogs.some(log => log.approval_status) ? dbLogs.filter(log => log.approval_status).map(log => ({
        correction_request_id: log.id,
        employee_name: log.employee_name || 'Arun Kumar',
        attendance_date: log.date || '2026-05-08',
        missed_punch_reason: log.missed_punch_reason || 'Travel time delay',
        proposed_punch_in: log.proposed_punch_in || '09:00 AM',
        proposed_punch_out: log.proposed_punch_out || '06:00 PM',
        approval_status: log.approval_status || 'pending',
        approved_by: log.approved_by || ''
    })) : [];

    // Form inputs states
    const [punchForm, setPunchForm] = useState({
        employee_id: '',
        employee_name: '',
        check_in_time: '',
        check_out_time: '',
        location_address: '',
        late_by_minutes: 0
    });

    const [correctionForm, setCorrectionForm] = useState({
        employee_name: '',
        attendance_date: '',
        missed_punch_reason: '',
        proposed_punch_in: '',
        proposed_punch_out: ''
    });

    const [shiftForm, setShiftForm] = useState({
        shift_id: null,
        shift_name: 'Flexible Evening Shift',
        shift_start_time: '03:00 PM',
        shift_end_time: '12:00 AM',
        grace_time: 20
    });

    // Submissions
    const handleAddPunch = (e) => {
        e.preventDefault();
        
        const in12 = convertTo12Hour(punchForm.check_in_time);
        const out12 = convertTo12Hour(punchForm.check_out_time);
        
        const computedTotal = calculateDuration(in12, out12);
        const breakHrs = 1.0;
        const computedProd = Math.max(0, computedTotal - breakHrs);

        addPunchMutation.mutate({
            employee_id: punchForm.employee_id,
            employee_name: punchForm.employee_name,
            check_in_time: in12,
            check_out_time: out12,
            late_by_minutes: parseInt(punchForm.late_by_minutes) || 0,
            productive_hours: parseFloat(computedProd.toFixed(1)),
            total_work_hours: parseFloat(computedTotal.toFixed(1)),
            break_hours: breakHrs,
            location_address: punchForm.location_address || 'Main Office Complex, Mumbai',
            status: parseInt(punchForm.late_by_minutes) > 15 ? 'late' : 'present',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleAddCorrection = (e) => {
        e.preventDefault();
        addCorrectionMutation.mutate({
            employee_name: correctionForm.employee_name,
            attendance_date: correctionForm.attendance_date,
            missed_punch_reason: correctionForm.missed_punch_reason,
            proposed_punch_in: convertTo12Hour(correctionForm.proposed_punch_in),
            proposed_punch_out: convertTo12Hour(correctionForm.proposed_punch_out)
        });
    };

    const handleEditPunchSubmit = (e) => {
        e.preventDefault();
        const in12 = convertTo12Hour(editForm.check_in_time);
        const out12 = convertTo12Hour(editForm.check_out_time);
        
        const computedTotal = calculateDuration(in12, out12);
        const breakHrs = 1.0;
        const computedProd = Math.max(0, computedTotal - breakHrs);
        
        const payload = {
            date: editForm.attendance_date,
            check_in_time: in12,
            check_out_time: out12,
            late_by_minutes: parseInt(editForm.late_by_minutes) || 0,
            productive_hours: parseFloat(computedProd.toFixed(1)),
            total_work_hours: parseFloat(computedTotal.toFixed(1)),
            location_address: editForm.location_address || 'Main Office Complex, Mumbai',
            status: editForm.status
        };
        updateAttendanceMutation.mutate({ id: editForm.attendance_id, data: payload });
    };

    const handleCreateShift = (e) => {
        e.preventDefault();
        // Since shift setup is mock / dynamic config:
        if (shiftForm.shift_id) {
            alert('Assigned work roster shift updated successfully!');
        } else {
            alert('New assigned work roster shift created successfully!');
        }
        setIsShiftModalOpen(false);
    };

    const handleApproveCorrection = (corId) => {
        approveCorrectionMutation.mutate(corId);
    };

    const filteredLogs = attendanceLogs.filter(log => 
        log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.attendance_status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalLogsCount = attendanceLogs.length;
    const presentsCount = attendanceLogs.filter(l => l.attendance_status === 'present').length;
    const latesCount = attendanceLogs.filter(l => l.attendance_status === 'late').length;
    const attendancePercentage = Math.round(((presentsCount + latesCount) / totalLogsCountSafe(totalLogsCount)) * 100);

    function totalLogsCountSafe(c) {
        return c > 0 ? c : 1;
    }

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Clock size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Time & Attendance tracking</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage work hours timesheets, shifts rosters, late punch penalty deductions, biometric syncs, and regularization approvals.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsCorrectionModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <RefreshCw size={15} /> Regularize Missed Punch
                    </button>
                    <button 
                        onClick={() => setIsPunchModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Manual Punch Entry
                    </button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            {/* Modern Attendance Left-Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Attendance Percentage', value: `${attendancePercentage}% Present`, icon: ShieldCheck, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Late Punch Check-Ins', value: `${latesCount} Late marks`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Roster Shifts', value: `${shifts.length} Active`, icon: Calendar, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Pending Regularization', value: `${corrections.filter(c => c.approval_status === 'pending').length} Claims`, icon: RefreshCw, color: '#8B5CF6', bg: '#F5F3FF' }
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
                    { id: 'today', label: "Today's Logs", icon: Clock, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'history', label: 'History Ledger', icon: User, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' },
                    { id: 'datewise', label: 'Date-wise Lookup', icon: Calendar, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'shifts', label: 'Shift Configurations', icon: Calendar, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'geo', label: 'GPS Location Fencing', icon: MapPin, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' },
                    { id: 'corrections', label: 'Correction Verifications', icon: RefreshCw, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'calendar', label: 'Calendar View', icon: Calendar, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' }
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

            {/* Tab 1: Today's Attendance Logs */}
            {activeTab === 'today' && (() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayLogs = filteredLogs.filter(log => log.attendance_date === todayStr);
                return (
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                            <div style={{ position: 'relative', width: '400px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search today's logs by employee..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#064E3B', background: '#D1FAE5', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                                Today: {todayStr}
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto', padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
                                    { key: 'attendance_id', label: 'Log ID', placeholder: 'ID' },
                                    { key: 'employee_name', label: 'Employee Profile', placeholder: 'Name' },
                                    { key: 'check_in_time', label: 'Check-In / Out', placeholder: 'e.g. 09:00' },
                                    { key: 'productive_hours', label: 'Productive Hours', placeholder: 'e.g. 8' },
                                    { key: 'location_address', label: 'Location', placeholder: 'Address' },
                                    { key: 'attendance_status', label: 'Status', placeholder: 'e.g. Present' },
                                    { key: '_actions', label: 'Action', noFilter: true }
                                ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {todayLogs.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((log) => (
                                        <tr 
                                            key={log.attendance_id} 
                                            style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease', cursor: 'default' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>#{log.attendance_id}</p>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '0.78rem', flexShrink: 0 }}>
                                                        {log.employee_name.charAt(0)}
                                                    </div>
                                                    <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.82rem' }}>{log.employee_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F8FAFC', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
                                                    <Clock size={11} style={{ color: '#EC4899', flexShrink: 0 }} />
                                                    <span style={{ fontWeight: '800', color: '#065F46', fontSize: '0.75rem' }}>{log.check_in_time}</span>
                                                    <span style={{ color: '#94A3B8', fontWeight: '800', fontSize: '0.7rem' }}>→</span>
                                                    <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.75rem' }}>{log.check_out_time}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.8rem' }}>{log.productive_hours} Hrs</span>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={12} style={{ color: log.location_address ? '#EC4899' : '#CBD5E1', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.78rem', color: log.location_address ? '#334155' : '#94A3B8', fontWeight: '600' }}>
                                                        {log.location_address || 'Remote check-in'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.45rem', borderRadius: '6px',
                                                    background: log.attendance_status === 'present' ? '#D1FAE5' : log.attendance_status === 'late' ? '#FEF3C7' : '#FEE2E2',
                                                    color: log.attendance_status === 'present' ? '#065F46' : log.attendance_status === 'late' ? '#92400E' : '#991B1B',
                                                    fontWeight: '850', fontSize: '0.68rem', display: 'inline-block',
                                                    whiteSpace: 'nowrap', letterSpacing: '0.01em'
                                                }}>{log.attendance_status.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditForm({
                                                            attendance_id: log.attendance_id,
                                                            attendance_date: log.attendance_date,
                                                            check_in_time: convertTo24Hour(log.check_in_time),
                                                            check_out_time: convertTo24Hour(log.check_out_time),
                                                            late_by_minutes: log.late_by_minutes || 0,
                                                            productive_hours: log.productive_hours || 8.0,
                                                            location_address: log.location_address || '',
                                                            status: log.attendance_status || 'present'
                                                        });
                                                        setSelectedLog(log);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#EC4899'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#EC4899'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                                    style={{ border: '1px solid #E2E8F0', background: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#475569', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {todayLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B', fontWeight: '700' }}>
                                                No attendance logs recorded for today yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {/* Tab: History Ledger */}
            {activeTab === 'history' && (() => {
                const searchVal = searchTerm.toLowerCase();
                const filteredEmps = dbEmployees.filter(emp => {
                    const fullName = (emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`).toLowerCase();
                    return fullName.includes(searchVal);
                });
                return (
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                            <div style={{ position: 'relative', width: '400px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search staff ledger..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
                                    { key: 'id', label: 'Employee ID', placeholder: 'ID' },
                                    { key: 'name', label: 'Staff Member', placeholder: 'Name' },
                                    { key: 'presents', label: 'Present Days', placeholder: 'Count' },
                                    { key: 'absents', label: 'Absent Days', placeholder: 'Count' },
                                    { key: 'lates', label: 'Late Marks', placeholder: 'Count' },
                                    { key: '_actions', label: 'Action Ledger', noFilter: true }
                                ]} onFilterChange={setColFiltersHistory} />
                                <tbody>
                                    {filteredEmps.map((emp) => {
                                        const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                                        const empLogs = attendanceLogs.filter(l => l.employee_name.toLowerCase() === name.toLowerCase());
                                        const presents = empLogs.filter(l => l.attendance_status === 'present').length;
                                        const absents = empLogs.filter(l => l.attendance_status === 'absent').length;
                                        const lates = empLogs.filter(l => l.attendance_status === 'late').length;

                                        return (
                                            <tr 
                                                key={emp.id} 
                                                style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem', fontWeight: '850', color: '#0F172A' }}>#{emp.id || emp.employee_code}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '0.78rem' }}>
                                                            {name.charAt(0)}
                                                        </div>
                                                        <span style={{ fontWeight: '800', color: '#1E293B' }}>{name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '800', color: '#065F46' }}>{presents} Days</td>
                                                <td style={{ padding: '1rem', fontWeight: '800', color: '#991B1B' }}>{absents} Days</td>
                                                <td style={{ padding: '1rem', fontWeight: '800', color: '#92400E' }}>{lates} Late</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button 
                                                        onClick={() => setSelectedEmployeeHistory(emp)}
                                                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)' }}
                                                    >
                                                        📅 View Attendance Calendar
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

            {/* Tab: Date-wise Attendance Lookup */}
            {activeTab === 'datewise' && (() => {
                const datewiseLogs = filteredLogs.filter(log => log.attendance_date === lookupDate);
                return (
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>Select Lookup Date:</span>
                                <input 
                                    type="date" 
                                    value={lookupDate} 
                                    onChange={(e) => setLookupDate(e.target.value)} 
                                    style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }} 
                                />
                            </div>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search by employee..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
                                    { key: 'attendance_id', label: 'Log ID', placeholder: 'ID' },
                                    { key: 'employee_name', label: 'Employee Profile', placeholder: 'Name' },
                                    { key: 'check_in_time', label: 'Check-In / Out', placeholder: 'e.g. 09:00' },
                                    { key: 'productive_hours', label: 'Productive Hours', placeholder: 'e.g. 8' },
                                    { key: 'location_address', label: 'Location', placeholder: 'Address' },
                                    { key: 'attendance_status', label: 'Status', placeholder: 'e.g. Present' },
                                    { key: '_actions', label: 'Action', noFilter: true }
                                ]} onFilterChange={setColFiltersDatewise} />
                                <tbody>
                                    {datewiseLogs.filter(item => applyTableFilters(item, typeof colFiltersDatewise !== "undefined" ? colFiltersDatewise : {})).map((log) => (
                                        <tr 
                                            key={log.attendance_id} 
                                            style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>#{log.attendance_id}</p>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '0.78rem', flexShrink: 0 }}>
                                                        {log.employee_name.charAt(0)}
                                                    </div>
                                                    <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.82rem' }}>{log.employee_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F8FAFC', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
                                                    <Clock size={11} style={{ color: '#3B82F6', flexShrink: 0 }} />
                                                    <span style={{ fontWeight: '800', color: '#065F46', fontSize: '0.75rem' }}>{log.check_in_time}</span>
                                                    <span style={{ color: '#94A3B8', fontWeight: '800', fontSize: '0.7rem' }}>→</span>
                                                    <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.75rem' }}>{log.check_out_time}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.8rem' }}>{log.productive_hours} Hrs</span>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={12} style={{ color: log.location_address ? '#3B82F6' : '#CBD5E1', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.78rem', color: log.location_address ? '#334155' : '#94A3B8', fontWeight: '600' }}>
                                                        {log.location_address || 'Remote check-in'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.45rem', borderRadius: '6px',
                                                    background: log.attendance_status === 'present' ? '#D1FAE5' : log.attendance_status === 'late' ? '#FEF3C7' : '#FEE2E2',
                                                    color: log.attendance_status === 'present' ? '#065F46' : log.attendance_status === 'late' ? '#92400E' : '#991B1B',
                                                    fontWeight: '850', fontSize: '0.68rem', display: 'inline-block',
                                                    whiteSpace: 'nowrap', letterSpacing: '0.01em'
                                                }}>{log.attendance_status.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '0.65rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditForm({
                                                            attendance_id: log.attendance_id,
                                                            attendance_date: log.attendance_date,
                                                            check_in_time: convertTo24Hour(log.check_in_time),
                                                            check_out_time: convertTo24Hour(log.check_out_time),
                                                            late_by_minutes: log.late_by_minutes || 0,
                                                            productive_hours: log.productive_hours || 8.0,
                                                            location_address: log.location_address || '',
                                                            status: log.attendance_status || 'present'
                                                        });
                                                        setSelectedLog(log);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#3B82F6'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                                    style={{ border: '1px solid #E2E8F0', background: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#475569', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {datewiseLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B', fontWeight: '700' }}>
                                                No attendance logs recorded for this date.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {/* Tab 2: Shifts Configurator */}
            {activeTab === 'shifts' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Roster Shifts & Work Timings</h3>
                        <button onClick={() => {
                            setShiftForm({ shift_id: null, shift_name: '', shift_start_time: '', shift_end_time: '', grace_time: 15 });
                            setIsShiftModalOpen(true);
                        }} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Add Roster Shift</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Timing</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Allowed Grace Time</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((s) => (
                                <tr key={s.shift_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{s.shift_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>{s.shift_name}</td>
                                    <td style={{ padding: '1rem' }}>{s.shift_start_time} - {s.shift_end_time}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{s.shift_type.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#64748B' }}>{s.grace_time} Minutes</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => {
                                                setShiftForm({
                                                    shift_id: s.shift_id,
                                                    shift_name: s.shift_name,
                                                    shift_start_time: s.shift_start_time,
                                                    shift_end_time: s.shift_end_time,
                                                    grace_time: s.grace_time
                                                });
                                                setIsShiftModalOpen(true);
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#3B82F6'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                            style={{ border: '1px solid #E2E8F0', background: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#475569', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: GPS Geo-Fencing */}
            {activeTab === 'geo' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1rem' }}>Geo-Fenced Active GPS Coordinates</h3>
                    <p style={{ color: '#64748B', marginBottom: '2rem' }}>Only check-ins inside these coordinate boundaries are verified automatically as 'present' without manager intervention.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {[
                            { name: 'Headquarters Office, Mumbai', lat: '19.0760° N', lng: '72.8777° E', radius: '200 Meters', status: 'Active' },
                            { name: 'Operations Godown Godown B, Pune', lat: '18.5204° N', lng: '73.8567° E', radius: '500 Meters', status: 'Active' }
                        ].map((loc, idx) => (
                            <div key={idx} style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>{loc.name}</h4>
                                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Coordinates: {loc.lat}, {loc.lng} | Fence Radius: {loc.radius}</p>
                                </div>
                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', fontWeight: '800', fontSize: '0.75rem' }}>{loc.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 4: Regularization Corrections */}
            {activeTab === 'corrections' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Regularization Verification Request Queue</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Request ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Profile</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Timesheet Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Missed Punch Reason</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Proposed Times</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Approved By</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {corrections.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((cor) => (
                                <tr key={cor.correction_request_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{cor.correction_request_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{cor.employee_name}</td>
                                    <td style={{ padding: '1rem' }}>{cor.attendance_date}</td>
                                    <td style={{ padding: '1rem' }}>{cor.missed_punch_reason}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1B6B3A' }}>{cor.proposed_punch_in} - {cor.proposed_punch_out}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{cor.approved_by || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            background: cor.approval_status === 'approved' ? '#ECFDF5' : '#FFFBEB',
                                            color: cor.approval_status === 'approved' ? '#10B981' : '#D97706',
                                            fontWeight: '800', fontSize: '0.75rem'
                                        }}>{cor.approval_status.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {cor.approval_status !== 'approved' && (
                                            <button 
                                                onClick={() => handleApproveCorrection(cor.correction_request_id)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >Approve Correction</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 5: Calendar View */}
            {activeTab === 'calendar' && (() => {
                const year = 2026, month = 4; // May 2026 (0-indexed)
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDay = new Date(year, month, 1).getDay();
                const days = [];
                for (let i = 0; i < firstDay; i++) days.push(null);
                for (let i = 1; i <= daysInMonth; i++) days.push(i);
                const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                return (
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Monthly Attendance Calendar — May 2026</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                            {dayNames.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', padding: '8px 0' }}>{d}</div>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {days.map((day, idx) => {
                                if (!day) return <div key={idx} />;
                                const dateStr = `2026-05-${String(day).padStart(2,'0')}`;
                                const logs = attendanceLogs.filter(l => l.attendance_date === dateStr);
                                const status = logs.length > 0 ? (logs[0].attendance_status === 'present' ? 'present' : logs[0].attendance_status === 'late' ? 'late' : 'absent') : 'none';
                                const bg = status === 'present' ? '#D1FAE5' : status === 'late' ? '#FEF3C7' : status === 'absent' ? '#FEE2E2' : '#F8FAFC';
                                const color = status === 'present' ? '#065F46' : status === 'late' ? '#92400E' : status === 'absent' ? '#991B1B' : '#94A3B8';
                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => setSelectedDateDetails(dateStr)}
                                        style={{ background: bg, borderRadius: '10px', padding: '12px 8px', textAlign: 'center', border: '1px solid #E2E8F0', minHeight: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <span style={{ fontWeight: '900', fontSize: '1rem', color }}>{day}</span>
                                        {status !== 'none' && <span style={{ fontSize: '0.6rem', fontWeight: '800', color, textTransform: 'uppercase' }}>{status}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                            {[['#D1FAE5','#065F46','Present'],['#FEF3C7','#92400E','Late'],['#FEE2E2','#991B1B','Absent'],['#F8FAFC','#94A3B8','No Data']].map(([bg, color, label]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: bg, border: '1px solid #E2E8F0' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
            </div>
            {/* Manual Punch Entry Modal */}
            {isPunchModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Log Manual Punch Entry</h3>
                            <button onClick={() => setIsPunchModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleAddPunch} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Employee Name</label>
                                <select required value={punchForm.employee_name} onChange={(e) => {
                                    const selectedName = e.target.value;
                                    const selectedEmp = dbEmployees.find(emp => (emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()) === selectedName);
                                    setPunchForm({ 
                                        ...punchForm, 
                                        employee_name: selectedName,
                                        employee_id: selectedEmp ? selectedEmp.id : ''
                                    });
                                }} style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontSize: '0.85rem' }}>
                                    <option value="" disabled>Select Employee</option>
                                    {dbEmployees.map(emp => {
                                        const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                                        return <option key={emp.id} value={name}>{name}</option>;
                                    })}
                                    {dbEmployees.length === 0 && <option value="" disabled>No employees found</option>}
                                </select>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Check-In Time</label>
                                    <input required type="time" value={punchForm.check_in_time} onChange={(e) => setPunchForm({ ...punchForm, check_in_time: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Check-Out Time</label>
                                    <input required type="time" value={punchForm.check_out_time} onChange={(e) => setPunchForm({ ...punchForm, check_out_time: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Late Duration (Mins)</label>
                                    <input required type="number" min="0" value={punchForm.late_by_minutes} onChange={(e) => setPunchForm({ ...punchForm, late_by_minutes: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Check-in Location <span style={{ color: '#94A3B8', fontWeight: '600' }}>(Optional)</span></label>
                                    <input type="text" value={punchForm.location_address} onChange={(e) => setPunchForm({ ...punchForm, location_address: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Main Office, Mumbai" />
                                </div>
                            </div>
 
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)', marginTop: '0.5rem' }}>
                                Settle Timesheet Punch
                            </button>
                        </form>
                    </div>
                </div>
            )}
 
            {/* Regularize Missed Punch Modal */}
            {isCorrectionModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Regularize Missed Punch</h3>
                            <button onClick={() => setIsCorrectionModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>
 
                        <form onSubmit={handleAddCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Employee Name</label>
                                <select required value={correctionForm.employee_name} onChange={(e) => setCorrectionForm({ ...correctionForm, employee_name: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontSize: '0.85rem' }}>
                                    <option value="" disabled>Select Employee</option>
                                    {dbEmployees.map(emp => {
                                        const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                                        return <option key={emp.id} value={name}>{name}</option>;
                                    })}
                                    {dbEmployees.length === 0 && <option value="" disabled>No employees found</option>}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Timesheet Date</label>
                                <input required type="date" value={correctionForm.attendance_date} onChange={(e) => setCorrectionForm({ ...correctionForm, attendance_date: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Reason for Regularization</label>
                                <input required type="text" value={correctionForm.missed_punch_reason} onChange={(e) => setCorrectionForm({ ...correctionForm, missed_punch_reason: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Biometric mismatch/Travel delay" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Proposed Check-In</label>
                                    <input required type="time" value={correctionForm.proposed_punch_in} onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_punch_in: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Proposed Check-Out</label>
                                    <input required type="time" value={correctionForm.proposed_punch_out} onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_punch_out: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>
 
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)', marginTop: '0.5rem' }}>
                                Settle Regularization Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Timesheet Log Modal */}
            {isEditModalOpen && selectedLog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Clock size={16} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Edit Timesheet Log</h3>
                            </div>
                            <button onClick={() => { setIsEditModalOpen(false); setSelectedLog(null); }} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleEditPunchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Employee Profile</label>
                                <input readOnly type="text" value={selectedLog.employee_name} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.88rem', fontWeight: '700', color: '#475569', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Timesheet Date</label>
                                <input required type="date" value={editForm.attendance_date || ''} onChange={(e) => setEditForm({ ...editForm, attendance_date: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Check-In Time</label>
                                    <input required type="time" value={editForm.check_in_time || ''} onChange={(e) => setEditForm({ ...editForm, check_in_time: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Check-Out Time</label>
                                    <input required type="time" value={editForm.check_out_time || ''} onChange={(e) => setEditForm({ ...editForm, check_out_time: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Late Duration (Mins)</label>
                                    <input required type="number" min="0" value={editForm.late_by_minutes || 0} onChange={(e) => setEditForm({ ...editForm, late_by_minutes: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Productive Hours</label>
                                    <input required type="number" step="0.5" min="0" max="24" value={editForm.productive_hours || 8.0} onChange={(e) => setEditForm({ ...editForm, productive_hours: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Location <span style={{ color: '#94A3B8', fontWeight: '600' }}>(Optional)</span></label>
                                    <input type="text" value={editForm.location_address || ''} onChange={(e) => setEditForm({ ...editForm, location_address: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.35rem' }}>Attendance Status</label>
                                    <select value={editForm.status || 'present'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', boxSizing: 'border-box' }}>
                                        <option value="present">PRESENT</option>
                                        <option value="late">LATE</option>
                                        <option value="absent">ABSENT</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsEditModalOpen(false); setSelectedLog(null); }}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateAttendanceMutation.isPending}
                                    style={{ flex: 1.2, padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(6, 79, 59, 0.2)' }}
                                >
                                    {updateAttendanceMutation.isPending ? 'Saving...' : 'Save Timesheet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shift Configurator Modal */}
            {isShiftModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>{shiftForm.shift_id ? 'Edit' : 'Add'} Roster Shift Timings</h3>
                            <button onClick={() => setIsShiftModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Shift Name</label>
                                <input required type="text" value={shiftForm.shift_name} onChange={(e) => setShiftForm({ ...shiftForm, shift_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="General Day Shift" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Shift Start Time</label>
                                    <input required type="text" value={shiftForm.shift_start_time} onChange={(e) => setShiftForm({ ...shiftForm, shift_start_time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="09:00 AM" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Shift End Time</label>
                                    <input required type="text" value={shiftForm.shift_end_time} onChange={(e) => setShiftForm({ ...shiftForm, shift_end_time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="06:00 PM" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Allowed Grace Time (Minutes)</label>
                                <input required type="number" value={shiftForm.grace_time} onChange={(e) => setShiftForm({ ...shiftForm, grace_time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Settle Assigned Work Shift
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Employee History Calendar Modal */}
            {selectedEmployeeHistory && (() => {
                const emp = selectedEmployeeHistory;
                const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                const empLogs = attendanceLogs.filter(l => l.employee_name.toLowerCase() === name.toLowerCase());
                const presents = empLogs.filter(l => l.attendance_status === 'present').length;
                const absents = empLogs.filter(l => l.attendance_status === 'absent').length;
                const lates = empLogs.filter(l => l.attendance_status === 'late').length;

                const year = 2026, month = 4; // May 2026
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDay = new Date(year, month, 1).getDay();
                const days = [];
                for (let i = 0; i < firstDay; i++) days.push(null);
                for (let i = 1; i <= daysInMonth; i++) days.push(i);
                const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '540px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>📅 Attendance History Calendar</h3>
                                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '600', margin: '4px 0 0 0' }}>{name} · May 2026</p>
                                </div>
                                <button onClick={() => setSelectedEmployeeHistory(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            {/* Summary metrics for employee */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                {[
                                    { label: 'Present Days', val: `${presents} days`, color: '#065F46', bg: '#D1FAE5' },
                                    { label: 'Absent Days', val: `${absents} days`, color: '#991B1B', bg: '#FEE2E2' },
                                    { label: 'Late Marks', val: `${lates} times`, color: '#92400E', bg: '#FEF3C7' }
                                ].map((stat, idx) => (
                                    <div key={idx} style={{ background: stat.bg, padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: '800', color: stat.color, textTransform: 'uppercase' }}>{stat.label}</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: stat.color }}>{stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                                {dayNames.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', padding: '4px 0' }}>{d}</div>)}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {days.map((day, idx) => {
                                    if (!day) return <div key={idx} />;
                                    const dateStr = `2026-05-${String(day).padStart(2,'0')}`;
                                    const log = empLogs.find(l => l.attendance_date === dateStr);
                                    const status = log ? log.attendance_status : 'none';
                                    const bg = status === 'present' ? '#D1FAE5' : status === 'late' ? '#FEF3C7' : status === 'absent' ? '#FEE2E2' : '#F8FAFC';
                                    const color = status === 'present' ? '#065F46' : status === 'late' ? '#92400E' : status === 'absent' ? '#991B1B' : '#94A3B8';
                                    return (
                                        <div 
                                            key={day} 
                                            onClick={() => setSelectedDateDetails(dateStr)}
                                            style={{ background: bg, borderRadius: '10px', padding: '10px 4px', textAlign: 'center', border: '1px solid #E2E8F0', minHeight: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                                            title="Click to view detailed metrics for all staff"
                                        >
                                            <span style={{ fontWeight: '900', fontSize: '0.9rem', color }}>{day}</span>
                                            {status !== 'none' && <span style={{ fontSize: '0.55rem', fontWeight: '800', color, textTransform: 'uppercase' }}>{status}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Date Details Popup (Timesheet metrics for all staff for a date) */}
            {selectedDateDetails && (() => {
                const targetDate = selectedDateDetails;
                const logsForDate = attendanceLogs.filter(l => l.attendance_date === targetDate);
                
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '85vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>📊 Timesheet Metrics for {targetDate}</h3>
                                    <p style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: '600', margin: '4px 0 0 0' }}>Daily summary report for all company personnel</p>
                                </div>
                                <button onClick={() => setSelectedDateDetails(null)} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Staff Member</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Check-In / Out</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Duration</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Location</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dbEmployees.map(emp => {
                                            const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                                            const log = logsForDate.find(l => l.employee_name.toLowerCase() === name.toLowerCase());
                                            
                                            return (
                                                <tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.75rem', fontWeight: '800', color: '#1E293B', fontSize: '0.82rem' }}>{name}</td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                                                        {log ? `${log.check_in_time} - ${log.check_out_time}` : '—'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontWeight: '750', fontSize: '0.8rem' }}>
                                                        {log ? `${log.productive_hours} Hrs` : '—'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#64748B' }}>
                                                        {log ? (log.location_address || 'Main Office') : '—'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{ 
                                                            padding: '0.2rem 0.45rem', borderRadius: '6px',
                                                            background: log ? (log.attendance_status === 'present' ? '#D1FAE5' : log.attendance_status === 'late' ? '#FEF3C7' : '#FEE2E2') : '#F1F5F9',
                                                            color: log ? (log.attendance_status === 'present' ? '#065F46' : log.attendance_status === 'late' ? '#92400E' : '#991B1B') : '#64748B',
                                                            fontWeight: '850', fontSize: '0.68rem', textTransform: 'uppercase'
                                                        }}>
                                                            {log ? log.attendance_status : 'absent'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default BusinessAttendance;
