import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    Clock,
    User,
    Users,
    FileText,
    Filter,
    Search,
    Plus,
    ArrowRight,
    Upload,
    Paperclip,
    ShieldCheck,
    Check,
    X,
    ChevronDown,
    Download,
    TrendingUp,
    BarChart3,
    Calendar,
    Building2,
    Briefcase,
    BadgeAlert,
    ExternalLink,
    Kanban as KanbanIcon,
    ListFilter
} from 'lucide-react';
import { finproService } from '../services/finproService';

export default function FinProPracticeSuite({ activeSuiteTool = 'tool1', setActiveSuiteTool }) {
    // ── Tab 1 State ──
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // ── Tab 2 State ──
    const [engagements, setEngagements] = useState([]);
    const [engagementsLoading, setEngagementsLoading] = useState(true);
    const [engagementSearch, setEngagementSearch] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('All');
    const [showNewEngagementModal, setShowNewEngagementModal] = useState(false);
    const [newEngagementForm, setNewEngagementForm] = useState({
        clientName: '',
        trade: '',
        pan: '',
        gstin: '',
        entityType: 'Private Limited',
        auditType: 'Statutory Audit',
        financialYear: '2025-2026',
        agreedFee: '150000',
        leadPartner: 'CA Rajesh Sharma',
        scopeOfWork: ['Statutory Audit Sec 139', 'Tax Audit Sec 44AB']
    });

    // ── Tab 3 State ──
    const [checklists, setChecklists] = useState([]);
    const [selectedClient, setSelectedClient] = useState('Metro Auto Spares Pvt Ltd');
    const [selectedFramework, setSelectedFramework] = useState('Tax Audit Form 3CD');
    const [checklistLoading, setChecklistLoading] = useState(true);
    const [savingClauseId, setSavingClauseId] = useState(null);

    // ── Tab 4 State ──
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [taskViewMode, setTaskViewMode] = useState('kanban'); // 'kanban' | 'table'
    const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        client: 'Metro Auto Spares Pvt Ltd',
        assignee: 'Suresh (Article Year 2)',
        priority: 'High',
        dueDate: '2026-09-30',
        stage: 'In Fieldwork'
    });

    // ── Data Fetching ──
    useEffect(() => {
        finproService.getAnalyticsOverview().then(data => {
            setAnalyticsData(data);
            setAnalyticsLoading(false);
        });

        finproService.getEngagements().then(data => {
            setEngagements(data || []);
            setEngagementsLoading(false);
        });

        finproService.getChecklists().then(data => {
            setChecklists(data || []);
            setChecklistLoading(false);
        });

        finproService.getTasks().then(data => {
            setTasks(data || []);
            setTasksLoading(false);
        });
    }, []);

    // ── Engagement Handlers ──
    const filteredEngagements = useMemo(() => {
        return engagements.filter(e => {
            const matchesSearch = !engagementSearch || 
                e.clientName?.toLowerCase().includes(engagementSearch.toLowerCase()) ||
                e.trade?.toLowerCase().includes(engagementSearch.toLowerCase()) ||
                e.leadPartner?.toLowerCase().includes(engagementSearch.toLowerCase());
            const matchesEntity = entityTypeFilter === 'All' || e.entityType === entityTypeFilter;
            return matchesSearch && matchesEntity;
        });
    }, [engagements, engagementSearch, entityTypeFilter]);

    const handleCreateEngagement = async (e) => {
        e.preventDefault();
        if (!newEngagementForm.clientName.trim()) {
            alert('Please enter a Client Name.');
            return;
        }

        const created = await finproService.createEngagement(newEngagementForm);
        setEngagements(prev => [created, ...prev]);
        setShowNewEngagementModal(false);
        setNewEngagementForm({
            clientName: '',
            trade: '',
            pan: '',
            gstin: '',
            entityType: 'Private Limited',
            auditType: 'Statutory Audit',
            financialYear: '2025-2026',
            agreedFee: '150000',
            leadPartner: 'CA Rajesh Sharma',
            scopeOfWork: ['Statutory Audit Sec 139', 'Tax Audit Sec 44AB']
        });
    };

    const toggleScopeOption = (opt) => {
        setNewEngagementForm(prev => {
            const exists = prev.scopeOfWork.includes(opt);
            return {
                ...prev,
                scopeOfWork: exists 
                    ? prev.scopeOfWork.filter(s => s !== opt) 
                    : [...prev.scopeOfWork, opt]
            };
        });
    };

    // ── Checklist Handlers ──
    const filteredChecklists = useMemo(() => {
        return checklists.filter(c => {
            if (!selectedFramework || selectedFramework === 'All') return true;
            return c.framework?.toLowerCase().includes(selectedFramework.toLowerCase());
        });
    }, [checklists, selectedFramework]);

    const handleClauseStatusToggle = async (clauseId, newStatus) => {
        setChecklists(prev => prev.map(c => c.id === clauseId ? { ...c, status: newStatus } : c));
        await finproService.updateChecklistClause(clauseId, { status: newStatus });
    };

    const handleClauseObservationChange = (clauseId, text) => {
        setChecklists(prev => prev.map(c => c.id === clauseId ? { ...c, observation: text } : c));
    };

    const handleSaveClauseObservation = async (clauseId, observation) => {
        setSavingClauseId(clauseId);
        await finproService.updateChecklistClause(clauseId, { observation });
        setTimeout(() => setSavingClauseId(null), 800);
    };

    const handleAddAttachment = async (clauseId) => {
        const dummyFile = prompt('Enter evidence file name / URL to link:', 'audit_voucher_evidence_' + Date.now().toString().slice(-4) + '.pdf');
        if (dummyFile) {
            const updated = checklists.find(c => c.id === clauseId);
            const attachments = [...(updated?.attachments || []), dummyFile];
            setChecklists(prev => prev.map(c => c.id === clauseId ? { ...c, attachments } : c));
            await finproService.updateChecklistClause(clauseId, { attachments });
        }
    };

    // ── Task Allocation Handlers ──
    const handleMoveTaskStage = async (taskId, currentStage) => {
        const stages = ['Unassigned', 'In Fieldwork', 'Under Review', 'Approved'];
        const curIdx = stages.indexOf(currentStage);
        const nextStage = curIdx < stages.length - 1 ? stages[curIdx + 1] : currentStage;
        
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: nextStage } : t));
        await finproService.updateTaskStage(taskId, nextStage);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskForm.title.trim()) {
            alert('Please provide a task title.');
            return;
        }

        const created = await finproService.createTask(newTaskForm);
        setTasks(prev => [created, ...prev]);
        setShowAssignTaskModal(false);
        setNewTaskForm({
            title: '',
            client: 'Metro Auto Spares Pvt Ltd',
            assignee: 'Suresh (Article Year 2)',
            priority: 'High',
            dueDate: '2026-09-30',
            stage: 'In Fieldwork'
        });
    };

    // ── Formatters ──
    const formatINR = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: PRACTICE OVERVIEW & ANALYTICS
            ══════════════════════════════════════════════════════════════════ */}
            {activeSuiteTool === 'tool1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* 4 Top KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        {/* KPI 1 */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            borderLeft: '4px solid #10B981'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Engagements</span>
                                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={16} />
                                </span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', lineHeight: 1.1 }}>
                                {analyticsData?.kpis?.activeEngagements || 14}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrendingUp size={13} /> +3 this quarter • On Track
                            </span>
                        </div>

                        {/* KPI 2 */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            borderLeft: '4px solid #3B82F6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Partner Sign-offs</span>
                                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={16} />
                                </span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', lineHeight: 1.1 }}>
                                {analyticsData?.kpis?.pendingSignOffs || 5}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} /> Awaiting Final Partner Review
                            </span>
                        </div>

                        {/* KPI 3 */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            borderLeft: '4px solid #EF4444'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overdue Statutory Deadlines</span>
                                <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '10px', fontWeight: '850' }}>
                                    ALERT
                                </span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#DC2626', lineHeight: 1.1 }}>
                                {analyticsData?.kpis?.overdueDeadlines || 2}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={13} /> Immediate Filing Action Required
                            </span>
                        </div>

                        {/* KPI 4 */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            borderLeft: '4px solid #8B5CF6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unbilled Audit Hours</span>
                                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={16} />
                                </span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', lineHeight: 1.1 }}>
                                {analyticsData?.kpis?.unbilledHours || 142.5} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>hrs</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={13} /> Verified Timesheet Workpapers
                            </span>
                        </div>
                    </div>

                    {/* Grid Split (2-cols) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
                        {/* Left: Upcoming Statutory Deadlines */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Upcoming Statutory Deadlines</h4>
                                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Critical filing timeline across corporate and tax clients</p>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '6px' }}>
                                    Q2/Q3 FY26
                                </span>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '750' }}>
                                            <th style={{ padding: '8px 10px' }}>Client Name</th>
                                            <th style={{ padding: '8px 10px' }}>Filing Type</th>
                                            <th style={{ padding: '8px 10px' }}>Target Date</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Status / Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(analyticsData?.statutoryDeadlines || []).map((row) => {
                                            const isDanger = row.statusType === 'danger';
                                            const isWarning = row.statusType === 'warning';
                                            const isSuccess = row.statusType === 'success';

                                            const bg = isDanger ? '#FEF2F2' : isWarning ? '#FFFBEB' : isSuccess ? '#ECFDF5' : '#EFF6FF';
                                            const color = isDanger ? '#DC2626' : isWarning ? '#D97706' : isSuccess ? '#059669' : '#2563EB';
                                            const border = isDanger ? '#FECACA' : isWarning ? '#FDE68A' : isSuccess ? '#A7F3D0' : '#BFDBFE';

                                            return (
                                                <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '10px', fontWeight: '750', color: '#1E293B' }}>{row.clientName}</td>
                                                    <td style={{ padding: '10px', color: '#475569' }}>{row.filingType}</td>
                                                    <td style={{ padding: '10px', color: '#0F172A', fontWeight: '600' }}>
                                                        {new Date(row.targetDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                                        <span style={{
                                                            fontSize: '10.5px',
                                                            fontWeight: '800',
                                                            background: bg,
                                                            color: color,
                                                            border: `1px solid ${border}`,
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Engagement Status Distribution */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Engagement Status Distribution</h4>
                                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Pipeline tracking across ongoing audit stages</p>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', background: '#ECFDF5', color: '#059669', padding: '4px 8px', borderRadius: '6px' }}>
                                    100% Workpapered
                                </span>
                            </div>

                            {/* Stacked Percentage Bar */}
                            <div style={{ display: 'flex', height: '14px', borderRadius: '8px', overflow: 'hidden', width: '100%', gap: '2px', background: '#F1F5F9' }}>
                                <div style={{ width: '40%', background: '#10B981' }} title="Fieldwork: 40%" />
                                <div style={{ width: '30%', background: '#3B82F6' }} title="Drafting: 30%" />
                                <div style={{ width: '20%', background: '#F59E0B' }} title="Partner Review: 20%" />
                                <div style={{ width: '10%', background: '#8B5CF6' }} title="Report Signed: 10%" />
                            </div>

                            {/* Detailed Breakdown Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10B981' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>In Fieldwork</span>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>40%</div>
                                    <span style={{ fontSize: '11px', color: '#64748B' }}>6 Mandates active on-site</span>
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#3B82F6' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>Drafting</span>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>30%</div>
                                    <span style={{ fontSize: '11px', color: '#64748B' }}>4 Reports compilation</span>
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F59E0B' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>Partner Review</span>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>20%</div>
                                    <span style={{ fontSize: '11px', color: '#64748B' }}>3 Peer / Senior reviews</span>
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#8B5CF6' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>Report Signed</span>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>10%</div>
                                    <span style={{ fontSize: '11px', color: '#64748B' }}>1 UDIN registered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: CLIENT ENGAGEMENT DESK
            ══════════════════════════════════════════════════════════════════ */}
            {activeSuiteTool === 'tool2' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Header Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                            {/* Search Input */}
                            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by client, trade, or partner..."
                                    value={engagementSearch}
                                    onChange={(e) => setEngagementSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '9px 12px 9px 36px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '13px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Entity Type Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Filter size={15} style={{ color: '#64748B' }} />
                                <select
                                    value={entityTypeFilter}
                                    onChange={(e) => setEntityTypeFilter(e.target.value)}
                                    style={{
                                        padding: '9px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#334155',
                                        background: '#FFFFFF',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="All">All Entities</option>
                                    <option value="Private Limited">Private Limited</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Sole Proprietor">Sole Proprietor</option>
                                    <option value="LLP">LLP</option>
                                </select>
                            </div>
                        </div>

                        {/* + New Engagement Button */}
                        <button
                            type="button"
                            onClick={() => setShowNewEngagementModal(true)}
                            style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
                        >
                            <Plus size={16} strokeWidth={2.5} /> + New Engagement
                        </button>
                    </div>

                    {/* Engagements Table */}
                    <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '800' }}>
                                        <th style={{ padding: '12px 16px' }}>Client Name & Trade</th>
                                        <th style={{ padding: '12px 16px' }}>Entity Type</th>
                                        <th style={{ padding: '12px 16px' }}>Audit Type</th>
                                        <th style={{ padding: '12px 16px' }}>FY</th>
                                        <th style={{ padding: '12px 16px' }}>Agreed Fee (₹)</th>
                                        <th style={{ padding: '12px 16px' }}>Lead Partner</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEngagements.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                                                No client engagements found matching your filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEngagements.map((eng) => {
                                            const isConcluded = eng.status === 'Signed & Concluded';
                                            const isFieldwork = eng.status === 'In Fieldwork';
                                            const statusBg = isConcluded ? '#ECFDF5' : isFieldwork ? '#EFF6FF' : '#FFFBEB';
                                            const statusColor = isConcluded ? '#059669' : isFieldwork ? '#2563EB' : '#D97706';
                                            const statusBorder = isConcluded ? '#A7F3D0' : isFieldwork ? '#BFDBFE' : '#FDE68A';

                                            return (
                                                <tr 
                                                    key={eng.id}
                                                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                                >
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{eng.clientName}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{eng.trade}</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                                                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                                            {eng.entityType}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#334155' }}>
                                                        {eng.auditType}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                                        {eng.financialYear}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0F172A' }}>
                                                        {formatINR(eng.agreedFee)}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '600' }}>
                                                        {eng.leadPartner}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            background: statusBg,
                                                            color: statusColor,
                                                            border: `1px solid ${statusBorder}`,
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {eng.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Modal / Slide-Over ("+ New Engagement") */}
                    {showNewEngagementModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px'
                        }}>
                            <div style={{
                                background: '#FFFFFF',
                                width: '100%',
                                maxWidth: '580px',
                                maxHeight: '90vh',
                                borderRadius: '20px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                {/* Pinned Header */}
                                <div style={{
                                    padding: '18px 24px',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#F8FAFC'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0F172A' }}>Initiate Client Engagement Mandate</h3>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Configure statutory compliance parameters & agreed audit fees</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewEngagementModal(false)}
                                        style={{ border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: '#64748B' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Form Scrollable Body */}
                                <form onSubmit={handleCreateEngagement} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Client Legal Entity Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Metro Auto Spares Pvt Ltd"
                                            value={newEngagementForm.clientName}
                                            onChange={(e) => setNewEngagementForm({ ...newEngagementForm, clientName: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>PAN *</label>
                                            <input
                                                type="text"
                                                placeholder="AAACM1234F"
                                                value={newEngagementForm.pan}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, pan: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', textTransform: 'uppercase' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>GSTIN</label>
                                            <input
                                                type="text"
                                                placeholder="27AAACM1234F1Z5"
                                                value={newEngagementForm.gstin}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, gstin: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', textTransform: 'uppercase' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Entity Type</label>
                                            <select
                                                value={newEngagementForm.entityType}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, entityType: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
                                            >
                                                <option value="Private Limited">Private Limited</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Sole Proprietor">Sole Proprietor</option>
                                                <option value="LLP">LLP</option>
                                                <option value="Public Limited">Public Limited</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Financial Year</label>
                                            <select
                                                value={newEngagementForm.financialYear}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, financialYear: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
                                            >
                                                <option value="2025-2026">FY 2025-2026</option>
                                                <option value="2024-2025">FY 2024-2025</option>
                                                <option value="2026-2027">FY 2026-2027</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Agreed Fee (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="150000"
                                                value={newEngagementForm.agreedFee}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, agreedFee: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Lead Partner</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CA Rajesh Sharma"
                                                value={newEngagementForm.leadPartner}
                                                onChange={(e) => setNewEngagementForm({ ...newEngagementForm, leadPartner: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>Scope of Work Checklist</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                            {[
                                                'Statutory Audit under Section 139',
                                                'Tax Audit under Section 44AB',
                                                'CARO 2020 Compliance Reporting',
                                                'GSTR-9C Annual Reconciliation',
                                                'Transfer Pricing Study (Form 3CEB)',
                                                'Internal Financial Controls (IFC) Testing'
                                            ].map((item) => {
                                                const checked = newEngagementForm.scopeOfWork.includes(item);
                                                return (
                                                    <div 
                                                        key={item} 
                                                        onClick={() => toggleScopeOption(item)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: checked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                                            background: checked ? '#F0FDF4' : '#FFFFFF',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '12.5px',
                                                            fontWeight: checked ? '750' : '500',
                                                            color: checked ? '#065F46' : '#334155'
                                                        }}
                                                    >
                                                        <input type="checkbox" checked={checked} readOnly style={{ accentColor: '#10B981' }} />
                                                        <span>{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Pinned Footer */}
                                    <div style={{
                                        borderTop: '1px solid #E2E8F0',
                                        paddingTop: '16px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '10px'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewEngagementModal(false)}
                                            style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Create Engagement
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3: COMPLIANCE AUDIT CHECKLIST
            ══════════════════════════════════════════════════════════════════ */}
            {activeSuiteTool === 'tool3' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Top Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {/* Client Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>CLIENT:</span>
                                <select
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: '#0F172A',
                                        background: '#FFFFFF',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Metro Auto Spares Pvt Ltd">Metro Auto Spares Pvt Ltd</option>
                                    <option value="Apex Logistics & Freight LLP">Apex Logistics & Freight LLP</option>
                                    <option value="Zenith Life Sciences Ltd">Zenith Life Sciences Ltd</option>
                                    <option value="Trident Precision Fasteners">Trident Precision Fasteners</option>
                                </select>
                            </div>

                            {/* Framework Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>FRAMEWORK:</span>
                                <select
                                    value={selectedFramework}
                                    onChange={(e) => setSelectedFramework(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: '#0F172A',
                                        background: '#FFFFFF',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Tax Audit Form 3CD">Tax Audit Form 3CD</option>
                                    <option value="CARO 2020">CARO 2020</option>
                                    <option value="Section 138">Section 138 (Companies Act)</option>
                                    <option value="All">All Frameworks</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: '750', color: '#10B981', background: '#ECFDF5', padding: '6px 12px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                            ✓ Active Engagement: {selectedClient}
                        </div>
                    </div>

                    {/* Interactive Clause Matrix / Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filteredChecklists.map((item) => {
                            const isCompliant = item.status === 'Compliant';
                            const isNonCompliant = item.status === 'Non-Compliant';
                            const isNA = item.status === 'N/A';

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '16px',
                                        padding: '18px 20px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}
                                >
                                    {/* Clause Header & Toggle */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ flex: 1, minWidth: '260px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '850', color: '#0F172A' }}>
                                                    {item.clause}
                                                </h4>
                                                <span style={{ fontSize: '10px', fontWeight: '800', background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {item.framework}
                                                </span>
                                            </div>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Segmented Toggle: [ Compliant ] [ Non-Compliant ] [ N/A ] */}
                                        <div style={{
                                            display: 'flex',
                                            background: '#F1F5F9',
                                            padding: '3px',
                                            borderRadius: '10px',
                                            gap: '3px'
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => handleClauseStatusToggle(item.id, 'Compliant')}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '11.5px',
                                                    fontWeight: isCompliant ? '850' : '600',
                                                    background: isCompliant ? '#10B981' : 'transparent',
                                                    color: isCompliant ? '#FFFFFF' : '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                Compliant
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleClauseStatusToggle(item.id, 'Non-Compliant')}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '11.5px',
                                                    fontWeight: isNonCompliant ? '850' : '600',
                                                    background: isNonCompliant ? '#EF4444' : 'transparent',
                                                    color: isNonCompliant ? '#FFFFFF' : '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                Non-Compliant
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleClauseStatusToggle(item.id, 'N/A')}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '11.5px',
                                                    fontWeight: isNA ? '850' : '600',
                                                    background: isNA ? '#64748B' : 'transparent',
                                                    color: isNA ? '#FFFFFF' : '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                N/A
                                            </button>
                                        </div>
                                    </div>

                                    {/* Observation Textarea */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Auditor Observations & Workpaper Notes</span>
                                            {savingClauseId === item.id && (
                                                <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#10B981' }}>✓ Saved</span>
                                            )}
                                        </div>
                                        <textarea
                                            rows={2}
                                            value={item.observation || ''}
                                            placeholder="Enter audit sampling observations, remarks, or reference to supporting vouchers..."
                                            onChange={(e) => handleClauseObservationChange(item.id, e.target.value)}
                                            onBlur={(e) => handleSaveClauseObservation(item.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '12px',
                                                fontFamily: 'inherit',
                                                background: '#F8FAFC',
                                                color: '#1E293B',
                                                outline: 'none',
                                                resize: 'vertical',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    {/* Attachment Mini-action & Previews */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            {(item.attachments || []).map((file, idx) => (
                                                <span 
                                                    key={idx}
                                                    style={{
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        background: '#EFF6FF',
                                                        color: '#1D4ED8',
                                                        border: '1px solid #BFDBFE',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Paperclip size={12} /> {file}
                                                </span>
                                            ))}
                                            {(!item.attachments || item.attachments.length === 0) && (
                                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>No evidence attached</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAddAttachment(item.id)}
                                            style={{
                                                background: 'transparent',
                                                color: '#1E40AF',
                                                border: '1px dashed #93C5FD',
                                                borderRadius: '6px',
                                                padding: '4px 10px',
                                                fontSize: '11.5px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <Upload size={12} /> Link Evidence
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4: TEAM TASK ALLOCATION
            ══════════════════════════════════════════════════════════════════ */}
            {activeSuiteTool === 'tool4' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Header Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        {/* View Toggle */}
                        <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
                            <button
                                type="button"
                                onClick={() => setTaskViewMode('kanban')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: taskViewMode === 'kanban' ? '800' : '600',
                                    background: taskViewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                                    color: taskViewMode === 'kanban' ? '#0F172A' : '#64748B',
                                    boxShadow: taskViewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <KanbanIcon size={14} /> Kanban Board
                            </button>
                            <button
                                type="button"
                                onClick={() => setTaskViewMode('table')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: taskViewMode === 'table' ? '800' : '600',
                                    background: taskViewMode === 'table' ? '#FFFFFF' : 'transparent',
                                    color: taskViewMode === 'table' ? '#0F172A' : '#64748B',
                                    boxShadow: taskViewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ListFilter size={14} /> Task List Table
                            </button>
                        </div>

                        {/* + Assign Task Button */}
                        <button
                            type="button"
                            onClick={() => setShowAssignTaskModal(true)}
                            style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                            }}
                        >
                            <Plus size={16} strokeWidth={2.5} /> + Assign Task
                        </button>
                    </div>

                    {/* KANBAN VIEW (4 Stages) */}
                    {taskViewMode === 'kanban' ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))',
                            gap: '14px',
                            overflowX: 'auto',
                            paddingBottom: '8px'
                        }}>
                            {[
                                { stage: 'Unassigned', title: 'Unassigned', color: '#64748B', countBg: '#F1F5F9' },
                                { stage: 'In Fieldwork', title: 'In Fieldwork', color: '#2563EB', countBg: '#EFF6FF' },
                                { stage: 'Under Review', title: 'Under Review', color: '#D97706', countBg: '#FFFBEB' },
                                { stage: 'Approved', title: 'Approved', color: '#059669', countBg: '#ECFDF5' }
                            ].map((col) => {
                                const columnTasks = tasks.filter(t => t.stage === col.stage);

                                return (
                                    <div
                                        key={col.stage}
                                        style={{
                                            background: '#F8FAFC',
                                            borderRadius: '16px',
                                            border: '1px solid #E2E8F0',
                                            padding: '14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            minHeight: '400px'
                                        }}
                                    >
                                        {/* Column Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '850', color: '#1E293B' }}>{col.title}</span>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '850',
                                                background: col.countBg,
                                                color: col.color,
                                                padding: '2px 8px',
                                                borderRadius: '10px'
                                            }}>
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        {/* Cards List */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {columnTasks.map((task) => {
                                                const isUrgent = task.priority === 'Urgent';
                                                const isHigh = task.priority === 'High';
                                                const priorityBg = isUrgent ? '#FEF2F2' : isHigh ? '#FFFBEB' : '#EFF6FF';
                                                const priorityColor = isUrgent ? '#DC2626' : isHigh ? '#D97706' : '#2563EB';

                                                return (
                                                    <div
                                                        key={task.id}
                                                        style={{
                                                            background: '#FFFFFF',
                                                            border: '1px solid #E2E8F0',
                                                            borderRadius: '12px',
                                                            padding: '14px',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '10px'
                                                        }}
                                                    >
                                                        {/* Priority & Client */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{
                                                                fontSize: '10px',
                                                                fontWeight: '850',
                                                                background: priorityBg,
                                                                color: priorityColor,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {task.priority}
                                                            </span>
                                                            <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {task.client}
                                                            </span>
                                                        </div>

                                                        {/* Title */}
                                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', lineHeight: 1.3 }}>
                                                            {task.title}
                                                        </div>

                                                        {/* Assignee & Due Date */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#334155' }}>
                                                                    {task.assignee?.charAt(0) || 'U'}
                                                                </div>
                                                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {task.assignee}
                                                                </span>
                                                            </div>

                                                            <span style={{ fontSize: '10.5px', fontWeight: '750', color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Calendar size={11} /> {task.dueDate}
                                                            </span>
                                                        </div>

                                                        {/* Stage Actions */}
                                                        {task.stage !== 'Approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMoveTaskStage(task.id, task.stage)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '6px',
                                                                    background: task.stage === 'Under Review' ? '#10B981' : '#F1F5F9',
                                                                    color: task.stage === 'Under Review' ? '#FFFFFF' : '#334155',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '800',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                {task.stage === 'Under Review' ? (
                                                                    <>
                                                                        <Check size={12} strokeWidth={3} /> Approve & Sign Off
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Move Next <ArrowRight size={12} />
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {columnTasks.length === 0 && (
                                                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                                                    No tasks in this stage.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* TABLE VIEW */
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '800' }}>
                                            <th style={{ padding: '12px 16px' }}>Task Title</th>
                                            <th style={{ padding: '12px 16px' }}>Client</th>
                                            <th style={{ padding: '12px 16px' }}>Assignee</th>
                                            <th style={{ padding: '12px 16px' }}>Priority</th>
                                            <th style={{ padding: '12px 16px' }}>Due Date</th>
                                            <th style={{ padding: '12px 16px' }}>Stage</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr key={task.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0F172A' }}>{task.title}</td>
                                                <td style={{ padding: '12px 16px', color: '#475569' }}>{task.client}</td>
                                                <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>{task.assignee}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: task.priority === 'Urgent' ? '#FEF2F2' : '#FFFBEB', color: task.priority === 'Urgent' ? '#DC2626' : '#D97706' }}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#64748B' }}>{task.dueDate}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#334155' }}>
                                                        {task.stage}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                    {task.stage !== 'Approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveTaskStage(task.id, task.stage)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#10B981',
                                                                color: '#FFFFFF',
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {task.stage === 'Under Review' ? 'Approve' : 'Move Next'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Modal: + Assign Task */}
                    {showAssignTaskModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px'
                        }}>
                            <div style={{
                                background: '#FFFFFF',
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '20px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '18px 24px',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#F8FAFC'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0F172A' }}>Assign Audit & Compliance Task</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignTaskModal(false)}
                                        style={{ border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: '#64748B' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTask} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Task Title *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Stock Reconciliation at Central Warehouse"
                                            value={newTaskForm.title}
                                            onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Associated Client</label>
                                        <select
                                            value={newTaskForm.client}
                                            onChange={(e) => setNewTaskForm({ ...newTaskForm, client: e.target.value })}
                                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
                                        >
                                            <option value="Metro Auto Spares Pvt Ltd">Metro Auto Spares Pvt Ltd</option>
                                            <option value="Apex Logistics & Freight LLP">Apex Logistics & Freight LLP</option>
                                            <option value="Zenith Life Sciences Ltd">Zenith Life Sciences Ltd</option>
                                            <option value="Trident Precision Fasteners">Trident Precision Fasteners</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Assignee Staff</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Suresh (Article Year 2)"
                                                value={newTaskForm.assignee}
                                                onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Priority</label>
                                            <select
                                                value={newTaskForm.priority}
                                                onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
                                            >
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Target Due Date</label>
                                            <input
                                                type="date"
                                                value={newTaskForm.dueDate}
                                                onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Initial Stage</label>
                                            <select
                                                value={newTaskForm.stage}
                                                onChange={(e) => setNewTaskForm({ ...newTaskForm, stage: e.target.value })}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
                                            >
                                                <option value="Unassigned">Unassigned</option>
                                                <option value="In Fieldwork">In Fieldwork</option>
                                                <option value="Under Review">Under Review</option>
                                                <option value="Approved">Approved</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowAssignTaskModal(false)}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Assign Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
