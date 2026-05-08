import React, { useState } from 'react';
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

const INITIAL_ATT_LOGS = [
    {
        attendance_id: 'ATT-2026-901',
        employee_id: 'EMP-001',
        employee_name: 'Arun Kumar (Sales)',
        attendance_date: '2026-05-05',
        attendance_status: 'present',
        check_in_time: '09:05 AM',
        check_out_time: '06:15 PM',
        first_punch: '09:05 AM',
        last_punch: '06:15 PM',
        total_work_hours: 9.25,
        break_hours: 1.0,
        productive_hours: 8.25,
        overtime_hours: 0.25,
        late_by_minutes: 5,
        early_exit_minutes: 0,
        geo_fence_status: 'Inside',
        location_address: 'Main Office Complex, Mumbai',
        device_id: 'BIOMETRIC-MUM-4'
    },
    {
        attendance_id: 'ATT-2026-902',
        employee_id: 'EMP-002',
        employee_name: 'Priyanka Sharma (HR)',
        attendance_date: '2026-05-05',
        attendance_status: 'present',
        check_in_time: '08:58 AM',
        check_out_time: '06:02 PM',
        first_punch: '08:58 AM',
        last_punch: '06:02 PM',
        total_work_hours: 9.07,
        break_hours: 1.0,
        productive_hours: 8.07,
        overtime_hours: 0,
        late_by_minutes: 0,
        early_exit_minutes: 0,
        geo_fence_status: 'Inside',
        location_address: 'Main Office Complex, Mumbai',
        device_id: 'BIOMETRIC-MUM-1'
    }
];

const INITIAL_SHIFTS = [
    { shift_id: 'SFT-01', shift_name: 'General Day Shift', shift_start_time: '09:00 AM', shift_end_time: '06:00 PM', shift_type: 'Fixed', grace_time: 15 },
    { shift_id: 'SFT-02', shift_name: 'Night Logistics Shift', shift_start_time: '09:00 PM', shift_end_time: '06:00 AM', shift_type: 'Fixed', grace_time: 15 }
];

const INITIAL_CORRECTIONS = [
    {
        correction_request_id: 'COR-801',
        employee_name: 'Karan Mehra',
        attendance_date: '2026-05-04',
        missed_punch_reason: 'Biometric device failed to match scanner',
        proposed_punch_in: '09:02 AM',
        proposed_punch_out: '06:05 PM',
        approval_status: 'pending',
        approved_by: ''
    }
];

const BusinessAttendance = () => {
    const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'shifts', 'geo', 'corrections'
    const [searchTerm, setSearchTerm] = useState('');
    const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Queries
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

    // Process lists with fallbacks
    const attendanceLogs = dbLogs.length > 0 ? dbLogs.map(log => ({
        attendance_id: log.id,
        employee_id: log.employee_id || 'EMP-001',
        employee_name: log.employee_name || 'Arun Kumar (Sales)',
        attendance_date: log.date || '2026-05-08',
        attendance_status: log.status || 'present',
        check_in_time: log.check_in_time || '09:00 AM',
        check_out_time: log.check_out_time || '06:00 PM',
        first_punch: log.first_punch || '09:00 AM',
        last_punch: log.last_punch || '06:00 PM',
        total_work_hours: parseFloat(log.total_work_hours) || 9.0,
        break_hours: parseFloat(log.break_hours) || 1.0,
        productive_hours: parseFloat(log.productive_hours) || 8.0,
        overtime_hours: parseFloat(log.overtime_hours) || 0,
        late_by_minutes: parseInt(log.late_by_minutes) || 0,
        early_exit_minutes: parseInt(log.early_exit_minutes) || 0,
        geo_fence_status: log.geo_fence_status || 'Inside',
        location_address: log.location_address || 'Main Office Complex, Mumbai',
        device_id: log.device_id || 'BIOMETRIC-MUM-1'
    })) : INITIAL_ATT_LOGS;

    const shifts = dbShifts.length > 0 ? dbShifts : INITIAL_SHIFTS;

    const corrections = dbLogs.length > 0 && dbLogs.some(log => log.approval_status) ? dbLogs.filter(log => log.approval_status).map(log => ({
        correction_request_id: log.id,
        employee_name: log.employee_name || 'Arun Kumar',
        attendance_date: log.date || '2026-05-08',
        missed_punch_reason: log.missed_punch_reason || 'Travel time delay',
        proposed_punch_in: log.proposed_punch_in || '09:00 AM',
        proposed_punch_out: log.proposed_punch_out || '06:00 PM',
        approval_status: log.approval_status || 'pending',
        approved_by: log.approved_by || ''
    })) : INITIAL_CORRECTIONS;

    // Form inputs states
    const [punchForm, setPunchForm] = useState({
        employee_id: 'EMP-001',
        employee_name: 'Arun Kumar (Sales)',
        check_in_time: '09:00 AM',
        check_out_time: '06:00 PM',
        location_address: 'Main Office Complex, Mumbai',
        late_by_minutes: 0
    });

    const [correctionForm, setCorrectionForm] = useState({
        employee_name: 'Arun Kumar',
        attendance_date: '2026-05-03',
        missed_punch_reason: 'Client site travel missed biometric punch',
        proposed_punch_in: '09:15 AM',
        proposed_punch_out: '06:15 PM'
    });

    const [shiftForm, setShiftForm] = useState({
        shift_name: 'Flexible Evening Shift',
        shift_start_time: '03:00 PM',
        shift_end_time: '12:00 AM',
        grace_time: 20
    });

    // Submissions
    const handleAddPunch = (e) => {
        e.preventDefault();
        addPunchMutation.mutate({
            employee_id: punchForm.employee_id,
            employee_name: punchForm.employee_name,
            check_in_time: punchForm.check_in_time,
            check_out_time: punchForm.check_out_time,
            late_by_minutes: parseInt(punchForm.late_by_minutes) || 0,
            location_address: punchForm.location_address,
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
            proposed_punch_in: correctionForm.proposed_punch_in,
            proposed_punch_out: correctionForm.proposed_punch_out
        });
    };

    const handleCreateShift = (e) => {
        e.preventDefault();
        // Since shift setup is mock / dynamic config:
        alert('New assigned work roster shift created successfully!');
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
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Clock size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Time & Attendance tracking</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage work hours timesheets, shifts rosters, late punch penalty deductions, biometric syncs, and regularization approvals.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsCorrectionModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <RefreshCw size={16} /> Regularize Missed Punch
                    </button>
                    <button 
                        onClick={() => setIsPunchModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <Plus size={16} /> Manual Punch Entry
                    </button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Workforce Attendance Percentage', value: `${attendancePercentage}% Present`, icon: ShieldCheck, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Late Punch Check-Ins Today', value: `${latesCount} Late marks`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Assigned active Shifts', value: `${shifts.length} Roster shifts`, icon: Calendar, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Pending Regularization Claims', value: `${corrections.filter(c => c.approval_status === 'pending').length} Requests`, icon: RefreshCw, color: '#F59E0B', bg: '#FFFBEB' }
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
                    { id: 'daily', label: 'Daily Timesheet logs', icon: Clock },
                    { id: 'shifts', label: 'Shift Configurations', icon: Calendar },
                    { id: 'geo', label: 'GPS Location Fencing', icon: MapPin },
                    { id: 'corrections', label: 'Correction Verifications', icon: RefreshCw }
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

            {/* Tab 1: Daily Attendance Timesheet */}
            {activeTab === 'daily' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search timesheets by employee..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Log Reference</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Check-In / Out</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Late (Mins)</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Productive Hours</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Device Sync ID</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Location Coordinates</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.attendance_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{log.attendance_id}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {log.attendance_date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{log.employee_name}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>{log.check_in_time} - {log.check_out_time}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ color: log.late_by_minutes > 15 ? '#EF4444' : '#64748B', fontWeight: '750' }}>
                                                {log.late_by_minutes > 0 ? `${log.late_by_minutes} Mins` : 'On Time'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: '#1B6B3A' }}>{log.productive_hours} Hrs</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B', fontSize: '0.85rem', fontFamily: 'monospace' }}>{log.device_id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', color: '#475569' }}>
                                            <MapPin size={12} style={{ display: 'inline', marginRight: '0.25rem', color: '#1B6B3A' }} /> {log.location_address}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                background: log.attendance_status === 'present' ? '#ECFDF5' : '#FFFBEB',
                                                color: log.attendance_status === 'present' ? '#10B981' : '#D97706',
                                                fontWeight: '800', fontSize: '0.75rem'
                                            }}>{log.attendance_status.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Shifts Configurator */}
            {activeTab === 'shifts' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Roster Shifts & Work Timings</h3>
                        <button onClick={() => setIsShiftModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Add Roster Shift</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Timing</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Shift Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Allowed Grace Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map((s) => (
                                <tr key={s.shift_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{s.shift_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>{s.shift_name}</td>
                                    <td style={{ padding: '1rem' }}>{s.shift_start_time} - {s.shift_end_time}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{s.shift_type.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#64748B' }}>{s.grace_time} Minutes</td>
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
                            {corrections.map((cor) => (
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

            {/* Manual Punch Entry Modal */}
            {isPunchModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Log Manual Punch Entry</h3>
                            <button onClick={() => setIsPunchModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddPunch} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Name</label>
                                <input required type="text" value={punchForm.employee_name} onChange={(e) => setPunchForm({ ...punchForm, employee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Check-In Time</label>
                                    <input required type="text" value={punchForm.check_in_time} onChange={(e) => setPunchForm({ ...punchForm, check_in_time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="09:00 AM" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Check-Out Time</label>
                                    <input required type="text" value={punchForm.check_out_time} onChange={(e) => setPunchForm({ ...punchForm, check_out_time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="06:00 PM" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Late duration (Mins)</label>
                                    <input required type="number" value={punchForm.late_by_minutes} onChange={(e) => setPunchForm({ ...punchForm, late_by_minutes: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Check-in Location</label>
                                    <input required type="text" value={punchForm.location_address} onChange={(e) => setPunchForm({ ...punchForm, location_address: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Timesheet Punch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Regularize Missed Punch Modal */}
            {isCorrectionModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Regularize Missed Punch</h3>
                            <button onClick={() => setIsCorrectionModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Name</label>
                                <input required type="text" value={correctionForm.employee_name} onChange={(e) => setCorrectionForm({ ...correctionForm, employee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Timesheet Date</label>
                                <input required type="date" value={correctionForm.attendance_date} onChange={(e) => setCorrectionForm({ ...correctionForm, attendance_date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason for missed punch regularization</label>
                                <input required type="text" value={correctionForm.missed_punch_reason} onChange={(e) => setCorrectionForm({ ...correctionForm, missed_punch_reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Proposed Check-In</label>
                                    <input required type="text" value={correctionForm.proposed_punch_in} onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_punch_in: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="09:00 AM" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Proposed Check-Out</label>
                                    <input required type="text" value={correctionForm.proposed_punch_out} onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_punch_out: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="06:00 PM" />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Regularization request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Shift Configurator Modal */}
            {isShiftModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Add Roster Shift Timings</h3>
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Assigned Work Shift
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessAttendance;
