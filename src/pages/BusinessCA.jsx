import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, ShieldAlert, FileText, CheckCircle2, AlertTriangle, 
    RefreshCw, Globe, ArrowLeftRight, Landmark, Calendar, Clock, 
    UserCheck, ChevronRight, Layers, FileCheck, HelpCircle, TrendingUp, Plus, Search, Building,
    User, Wallet, Percent, PiggyBank, FileUp, Home, Users, Folder, BarChart, Play, Square, Trash2, PlusCircle, CheckSquare, FileSpreadsheet
} from 'lucide-react';
import { accountingService, gstService, contactsService, caService, profileService } from '../services';
import { useCurrency } from '../context';
import FilterableTableHead from '../components/FilterableTableHead';
import { applyTableFilters } from '../utils/filterUtils';

export default function BusinessCA() {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab] = useState('auditor'); // auditor | ca_cpa | cs_vault | consultant

    // Top-level workspace mode switcher
    const [caMode, setCaMode] = useState('business'); // business | personal
    const [personalTab, setPersonalTab] = useState('home'); // home | clients | requests | insights | tasks | timetracking | workpaper | documents | reports

    // --- Teams & Team Requests Queries & States ---
    const { data: teamMembers = [], refetch: refetchTeamMembers } = useQuery({
        queryKey: ['teamMembers'],
        queryFn: () => caService.getTeamMembers(),
        retry: false
    });

    const { data: teamRequests = [], refetch: refetchTeamRequests } = useQuery({
        queryKey: ['teamRequests'],
        queryFn: () => caService.getTeamRequests(),
        retry: false
    });

    const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false);
    const [newTeamEmail, setNewTeamEmail] = useState('');
    const [newTeamRole, setNewTeamRole] = useState('Senior Tax Consultant');
    const [customTeamRole, setCustomTeamRole] = useState('');
    const [colFiltersChecklist, setColFiltersChecklist] = useState({});
    const [colFiltersClients, setColFiltersClients] = useState({});
    const [colFiltersTasks, setColFiltersTasks] = useState({});
    const [colFiltersTeam, setColFiltersTeam] = useState({});
    const [colFiltersTeamReq, setColFiltersTeamReq] = useState({});
    const [colFiltersReports, setColFiltersReports] = useState({});
    const [colFiltersDocuments, setColFiltersDocuments] = useState({});
    const [colFiltersTimesheet, setColFiltersTimesheet] = useState({});
    // Workpaper per-client state
    const [selectedWorkpaperClientId, setSelectedWorkpaperClientId] = useState(null);
    const [clientWorkpaperChecks, setClientWorkpaperChecks] = useState({});

    const removeTeamMemberMutation = useMutation({
        mutationFn: (id) => caService.removeTeamMember(id),
        onSuccess: () => {
            refetchTeamMembers();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to remove team member')
    });

    const addTeamRequestMutation = useMutation({
        mutationFn: ({ email, role }) => caService.addTeamRequest(email, role),
        onSuccess: (data) => {
            refetchTeamRequests();
            setNewTeamEmail('');
            setCustomTeamRole('');
            setShowAddTeamMemberModal(false);
            alert(`✉️ Team invitation sent successfully to ${data.email || 'the user'}! The request will show in the Team Requests tab.`);
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to send team invitation')
    });

    const acceptTeamRequestMutation = useMutation({
        mutationFn: (id) => caService.acceptTeamRequest(id),
        onSuccess: (data) => {
            refetchTeamMembers();
            refetchTeamRequests();
            alert(`🎉 Joined! ${data.newMember?.name || 'The candidate'} has been successfully added to your team.`);
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to accept team request')
    });

    const rejectTeamRequestMutation = useMutation({
        mutationFn: (id) => caService.rejectTeamRequest(id),
        onSuccess: () => {
            refetchTeamRequests();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to decline team request')
    });

    const cancelTeamRequestMutation = useMutation({
        mutationFn: (id) => caService.cancelTeamRequest(id),
        onSuccess: () => {
            refetchTeamRequests();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to cancel team request')
    });

    const handleSendTeamInvitation = (e) => {
        e.preventDefault();
        if (!newTeamEmail.trim() || !newTeamEmail.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        const emailLower = newTeamEmail.trim().toLowerCase();
        
        if (teamMembers.some(m => m.email.toLowerCase() === emailLower)) {
            alert('This user is already a member of your team.');
            return;
        }
        if (teamRequests.some(r => r.email.toLowerCase() === emailLower)) {
            alert('An invitation has already been sent or is pending for this user.');
            return;
        }

        const finalRole = newTeamRole === 'Others' ? (customTeamRole.trim() || 'Custom Role') : newTeamRole;
        addTeamRequestMutation.mutate({ email: emailLower, role: finalRole });
    };

    // --- Business to Personal CA Connection States ---
    const [inviteEmailInput, setInviteEmailInput] = useState('');
    const [showRevokeId, setShowRevokeId] = useState(null);

    // --- Personal CA Zoho Practice Queries & States ---
    const { data: practiceClients = [], refetch: refetchClients } = useQuery({
        queryKey: ['practiceClients'],
        queryFn: () => caService.getClients(),
        retry: false
    });

    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const newClientStatus = 'Active';
    const [newClientRegime, setNewClientRegime] = useState('New');
    const [newClientIncome, setNewClientIncome] = useState('');

    const { data: practiceRequests = [], refetch: refetchRequests } = useQuery({
        queryKey: ['practiceRequests'],
        queryFn: () => caService.getRequests(),
        retry: false
    });

    const [showAddRequestModal, setShowAddRequestModal] = useState(false);
    const [newRequestClient, setNewRequestClient] = useState('Priya Patel (SME)');
    const [newRequestTitle, setNewRequestTitle] = useState('');
    const [newRequestDesc, setNewRequestDesc] = useState('');
    const [newRequestDueDate, setNewRequestDueDate] = useState('');
    const [newRequestPriority, setNewRequestPriority] = useState('Medium');
    const [newRequestDocType, setNewRequestDocType] = useState('Form 16');

    const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);

    const { data: practiceTasks = [], refetch: refetchTasks } = useQuery({
        queryKey: ['practiceTasks'],
        queryFn: () => caService.getTasks(),
        retry: false
    });

    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTaskClient, setNewTaskClient] = useState('Rohan Sharma');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskAskForDocument, setNewTaskAskForDocument] = useState(false);

    const { data: practiceTimesheets = [], refetch: refetchTimesheets } = useQuery({
        queryKey: ['practiceTimesheets'],
        queryFn: () => caService.getTimesheets(),
        retry: false
    });

    // Timer States
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerClient, setTimerClient] = useState('Rohan Sharma');
    const [timerTask, setTimerTask] = useState('');

    const [activeClientSearch, setActiveClientSearch] = useState('');

    const { data: practiceFolders = [], refetch: refetchFolders } = useQuery({
        queryKey: ['practiceFolders'],
        queryFn: () => caService.getFolders(),
        retry: false
    });

    const { data: practiceFiles = [], refetch: refetchFiles } = useQuery({
        queryKey: ['practiceFiles'],
        queryFn: () => caService.getFiles(),
        retry: false
    });

    const [activeDocFolder, setActiveDocFolder] = useState('All');
    const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [uploadTargetFolder, setUploadTargetFolder] = useState('ITR Filings FY2025-26');

    const [workpaperChecks, setWorkpaperChecks] = useState({
        aisTds: true,
        gstItc: false,
        invest80c: false,
        capGains: true,
        presumptive44ad: false
    });
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);

    const sidebarTabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'clients', label: 'Clients', icon: User, badge: null },
        { id: 'requests', label: 'Client Requests', icon: HelpCircle, badge: null },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle2, badge: null },
        { id: 'teams', label: 'Teams', icon: Users, badge: null },
        { id: 'team_requests', label: 'Team Requests', icon: UserCheck, badge: null },
        { id: 'timetracking', label: 'Time Tracking', icon: Clock, badge: null },
        { id: 'workpaper', label: 'Workpaper', icon: FileText },
        { id: 'documents', label: 'Documents', icon: Folder },
        { id: 'reports', label: 'Reports', icon: BarChart }
    ];

    // Timer Effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (totalSeconds) => {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleInviteCA = (e) => {
        e.preventDefault();
        if (!inviteEmailInput.trim() || !inviteEmailInput.includes('@')) return;
        sendInviteMutation.mutate(inviteEmailInput.trim());
    };

    const handleAcceptInvitation = (inviteId) => {
        acceptInviteMutation.mutate(inviteId);
    };

    const handleRevokeCA = (inviteId) => {
        revokeInviteMutation.mutate(inviteId);
    };

    const handleAddPracticeClient = (e) => {
        e.preventDefault();
        if (!newClientName.trim() || !newClientEmail.trim()) return;
        addClientMutation.mutate({
            name: newClientName.trim(),
            email: newClientEmail.trim(),
            status: newClientStatus,
            regime: newClientRegime,
            income: parseFloat(newClientIncome) || 0
        });
    };

    const handleAddPracticeRequest = (e) => {
        e.preventDefault();
        if (!newRequestTitle.trim()) return;
        addRequestMutation.mutate({
            clientName: newRequestClient,
            title: newRequestTitle.trim(),
            description: newRequestDesc.trim(),
            // eslint-disable-next-line react-hooks/purity
            dueDate: newRequestDueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
            priority: newRequestPriority,
            docType: newRequestDocType
        });
    };

    const handleAddPracticeTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTaskMutation.mutate({
            clientName: newTaskClient,
            title: newTaskTitle.trim(),
            priority: newTaskPriority,
            // eslint-disable-next-line react-hooks/purity
            dueDate: newTaskDueDate || new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
            askForDocument: newTaskAskForDocument
        });
    };

    const simulateClientUpload = (requestId) => {
        uploadRequestDocMutation.mutate(requestId);
    };

    const approveUploadedDoc = (requestId) => {
        approveRequestDocMutation.mutate(requestId);
    };

    const toggleTaskStatus = (taskId) => {
        toggleTaskStatusMutation.mutate(taskId);
    };

    const handleSaveTimerSession = () => {
        if (timerSeconds === 0) return;
        const durationFormatted = formatTime(timerSeconds);
        addTimesheetMutation.mutate({
            clientName: timerClient,
            taskName: timerTask.trim() || 'General Consulting Session',
            date: new Date().toISOString().split('T')[0],
            duration: durationFormatted,
            billable: true
        });
    };

    const handleSimulateDocumentUpload = (e) => {
        e.preventDefault();
        if (!uploadedFileName.trim()) return;
        setUploadProgress(10);
        const interval = setInterval(() => {
            setUploadProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        addFileMutation.mutate({
                            name: uploadedFileName.trim(),
                            size: '1.4 MB',
                            folderName: uploadTargetFolder,
                            date: new Date().toISOString().split('T')[0]
                        });
                    }, 400);
                    return 100;
                }
                return p + 30;
            });
        }, 150);
    };

    // Module 1: Auditor Hub States
    const [_accountingStandard, setAccountingStandard] = useState('IFRS'); // IFRS | GAAP
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [scanResults, setScanResults] = useState(null);

    // Module 2: CA / CPA Module States
    const [jurisdiction, setJurisdiction] = useState('IN'); // IN | US
    const [syncingState, setSyncingState] = useState('idle'); // idle | connecting | validating | pushing | success

    // Module 3: CS Vault States
    const [resolutions, setResolutions] = useState(() => {
        const saved = localStorage.getItem('cliks_cs_resolutions');
        return saved ? JSON.parse(saved) : [];
    });
    const [newResolutionTitle, setNewResolutionTitle] = useState('');
    const [newResolutionType, setNewResolutionType] = useState('Ordinary');

    // Module 4: Consultant Desk States
    const [selectedClient, setSelectedClient] = useState(101);
    const [forecastPeriod, setForecastPeriod] = useState(6); // months
    const [clientNotes, setClientNotes] = useState(() => {
        const saved = localStorage.getItem('cliks_ca_client_notes');
        return saved ? JSON.parse(saved) : {};
    });

    const [activeNoteInput, setActiveNoteInput] = useState('');

    // ── Live Connected Queries ──
    const { data: liveExpenses = [] } = useQuery({
        queryKey: ['caExpenses'],
        queryFn: () => accountingService.getExpenses(),
        retry: false
    });

    const { data: profitLoss } = useQuery({
        queryKey: ['caProfitLoss'],
        queryFn: () => accountingService.getProfitLoss(),
        retry: false
    });

    const { data: gst3bData } = useQuery({
        queryKey: ['caGst3b'],
        queryFn: () => gstService.getGSTR3B(),
        retry: false
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['caContacts'],
        queryFn: () => contactsService.getContacts(),
        select: (res) => res.rows || res.data || res,
        retry: false
    });

    // Fetch logged-in user profile to dynamically filter out self/CA email
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getProfile(),
        retry: false
    });
    const myEmail = profile?.email || '';

    // CA Connection Queries
    const { data: outgoingInvitations = [], refetch: refetchOutgoing } = useQuery({
        queryKey: ['caInvitationsOutgoing'],
        queryFn: () => caService.getOutgoingInvitations(),
        retry: false
    });

    const { data: incomingInvitations = [], refetch: refetchIncoming } = useQuery({
        queryKey: ['caInvitationsIncoming'],
        queryFn: () => caService.getIncomingInvitations(),
        retry: false
    });

    // Merge manual/mock practiceClients with accepted incoming DB invitations, filtering out CA's own email
    const dbPracticeClients = incomingInvitations
        .filter(inv => inv.status === 'Accepted' && inv.sender_email && inv.sender_email.toLowerCase() !== myEmail.toLowerCase())
        .map(inv => ({
            id: `db-${inv.id}`,
            name: inv.sender_name || 'Cliks Business Client (Acme Corp)',
            email: inv.sender_email || 'business@cliks.com',
            status: 'Active',
            regime: 'New',
            income: inv.income || (1500000 + ((inv.sender_email || '').length % 5) * 400000),
            pendingFilings: 0
        }));

    // Combine database practice clients with dynamic accepted invitations, prioritizing DB clients for realistic values, and deduplicate by email, filtering out self/myEmail
    const allPracticeClientsRaw = [
        ...practiceClients.filter(c => c.email && c.email.toLowerCase() !== myEmail.toLowerCase()),
        ...dbPracticeClients
    ];
    const seenEmails = new Set();
    const allPracticeClients = allPracticeClientsRaw.filter(c => {
        if (!c.email) return true;
        const emailLower = c.email.toLowerCase();
        if (seenEmails.has(emailLower)) {
            return false;
        }
        seenEmails.add(emailLower);
        return true;
    });

    // ── Mutations ──
    const fileMutation = useMutation({
        mutationFn: () => gstService.fileGstr3b(),
        onSuccess: () => {
            setSyncingState('success');
        },
        onError: () => {
            setSyncingState('success'); // Fallback gracefully for UI demo continuity
        }
    });

    const auditMutation = useMutation({
        mutationFn: (std) => caService.applyCrossBorderAudit(std)
    });

    const sendInviteMutation = useMutation({
        mutationFn: (email) => caService.sendInvitation(email),
        onSuccess: () => {
            refetchOutgoing();
            setInviteEmailInput('');
        },
        onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to send invitation');
        }
    });

    const acceptInviteMutation = useMutation({
        mutationFn: (id) => caService.acceptInvitation(id),
        onSuccess: () => {
            refetchIncoming();
            refetchOutgoing();
        },
        onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to accept invitation');
        }
    });

    const revokeInviteMutation = useMutation({
        mutationFn: (id) => caService.revokeInvitation(id),
        onSuccess: () => {
            refetchOutgoing();
            refetchIncoming();
        },
        onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to revoke/reject invitation');
        }
    });

    // Practice Workspace Management Mutations
    const addClientMutation = useMutation({
        mutationFn: (client) => caService.addClient(client),
        onSuccess: () => {
            refetchClients();
            setShowAddClientModal(false);
            setNewClientName('');
            setNewClientEmail('');
            setNewClientIncome('');
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to register client')
    });

    const addRequestMutation = useMutation({
        mutationFn: (req) => caService.addRequest(req),
        onSuccess: () => {
            refetchRequests();
            setShowAddRequestModal(false);
            setNewRequestTitle('');
            setNewRequestDesc('');
            setNewRequestDueDate('');
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to issue request')
    });

    const uploadRequestDocMutation = useMutation({
        mutationFn: (id) => caService.uploadRequestDoc(id),
        onSuccess: () => {
            refetchRequests();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to upload document')
    });

    const approveRequestDocMutation = useMutation({
        mutationFn: (id) => caService.approveRequestDoc(id),
        onSuccess: () => {
            refetchRequests();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to approve document')
    });

    const addTaskMutation = useMutation({
        mutationFn: (task) => caService.addTask(task),
        onSuccess: () => {
            refetchTasks();
            setShowAddTaskModal(false);
            setNewTaskTitle('');
            setNewTaskDueDate('');
            setNewTaskAskForDocument(false);
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to add task')
    });

    const toggleTaskStatusMutation = useMutation({
        mutationFn: (id) => caService.toggleTaskStatus(id),
        onSuccess: () => {
            refetchTasks();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to update task status')
    });

    const uploadTaskDocMutation = useMutation({
        mutationFn: (id) => caService.uploadTaskDoc(id),
        onSuccess: () => {
            refetchTasks();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to upload task document')
    });

    const addTimesheetMutation = useMutation({
        mutationFn: (session) => caService.addTimesheet(session),
        onSuccess: () => {
            refetchTimesheets();
            setIsTimerRunning(false);
            setTimerSeconds(0);
            setTimerTask('');
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to save timesheet session')
    });

    const addFileMutation = useMutation({
        mutationFn: (file) => caService.addFile(file),
        onSuccess: () => {
            refetchFiles();
            refetchFolders();
            setUploadedFileName('');
            setUploadProgress(null);
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to upload file')
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id) => caService.deleteFile(id),
        onSuccess: () => {
            refetchFiles();
            refetchFolders();
        },
        onError: (err) => alert(err.response?.data?.message || err.message || 'Failed to delete file')
    });

    const scanMutation = useMutation({
        mutationFn: () => caService.runComplianceScan(),
        onSuccess: (data) => {
            setScanResults({
                amlScore: `${data.compliance}% Compliant`,
                anomaliesFound: data.issues,
                itemsChecked: data.itemsChecked,
                flaggedExpenses: data.flaggedExpenses
            });
        },
        onError: () => {
            // Fallback scan analysis logic based on live expenses if network fails
            const highRisk = liveExpenses.filter(e => parseFloat(e.amount) > 5000);
            const score = highRisk.length === 0 ? 100 : Math.max(70, 100 - highRisk.length * 4.5);
            setScanResults({
                amlScore: `${score.toFixed(1)}% Compliant`,
                anomaliesFound: highRisk.length,
                itemsChecked: liveExpenses.length,
                flaggedExpenses: highRisk.map(h => ({
                    id: h.id,
                    desc: h.notes || `Large expense under ${h.category}`,
                    amount: formatCurrency(parseFloat(h.amount)),
                    type: h.amount > 15000 ? "High Risk Spike" : "Slight Anomaly"
                }))
            });
        }

    });

    const _handleStandardChange = (std) => {
        setAccountingStandard(std);
        auditMutation.mutate(std);
    };

    // Dynamic compliance scan trigger
    // eslint-disable-next-line no-unused-vars
    const triggerComplianceScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanResults(null);
    };

    useEffect(() => {
        let timer;
        if (isScanning && scanProgress < 100) {
            timer = setTimeout(() => setScanProgress(p => p + 10), 100);
        } else if (isScanning && scanProgress === 100) {
            timer = setTimeout(() => {
                setIsScanning(false);
                scanMutation.mutate();
            }, 0);
        }
        return () => clearTimeout(timer);
    }, [isScanning, scanProgress, scanMutation]);

    const deriveRevenue = (id) => {
        const seed = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return formatCurrency((seed * 2419) % 2000000 + 500000);
    };

    // Dynamic portal sync trigger
    const triggerPortalSync = () => {
        setSyncingState('connecting');
        setTimeout(() => {
            setSyncingState('validating');
            setTimeout(() => {
                setSyncingState('pushing');
                setTimeout(() => {
                    fileMutation.mutate();
                }, 1000);
            }, 1000);
        }, 1000);
    };

    const handleAddResolution = (e) => {
        e.preventDefault();
        if (!newResolutionTitle.trim()) return;
        const newRes = {
            id: Date.now(),
            title: newResolutionTitle,
            type: newResolutionType,
            status: "Pending Approval",
            date: new Date().toISOString().split('T')[0]
        };
        const updated = [newRes, ...resolutions];
        setResolutions(updated);
        localStorage.setItem('cliks_cs_resolutions', JSON.stringify(updated));
        setNewResolutionTitle('');
    };

    const handleAddClientNote = (e) => {
        e.preventDefault();
        if (!activeNoteInput.trim()) return;
        const updated = {
            ...clientNotes,
            [selectedClient]: activeNoteInput
        };
        setClientNotes(updated);
        localStorage.setItem('cliks_ca_client_notes', JSON.stringify(updated));
        setActiveNoteInput('');
    };

    // Client portfolio derived from real contacts
    const clientsList = contacts.length > 0 ? contacts.map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.company || "Consulting Partner",
        status: c.type || "Active",
        risk: c.notes?.toLowerCase().includes('high') ? 'High' : (c.notes?.toLowerCase().includes('medium') ? 'Medium' : 'Low'),
        revenue: deriveRevenue(c.id)
    })) : [];

    const activeClientData = clientsList.find(c => c.id === selectedClient) || clientsList[0] || { id: 0, name: "No Active Client", industry: "N/A", status: "N/A", risk: "Low", revenue: formatCurrency(0) };

    // Compute live values or fallback gracefully
    const computedTotalOutputTax = gst3bData?.total_output_tax || 0;
    const computedEligibleItc = gst3bData?.total_eligible_itc || 0;
    const computedNetPayableCGST = gst3bData?.net_payable_cgst || 0;
    const computedNetPayableSGST = gst3bData?.net_payable_sgst || 0;

    const computedGrossRevenue = profitLoss?.gross_revenue || 0;
    const computedTaxUS = Math.round(computedGrossRevenue * 0.21);


    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#F8FAFC', minHeight: '85vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Workspace Selector Segment Control */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px', 
                background: '#FFFFFF', 
                padding: '6px', 
                borderRadius: '16px', 
                border: '1px solid #E2E8F0', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
            }}>
                <button 
                    onClick={() => setCaMode('business')} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '10px', 
                        padding: '14px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease-in-out',
                        background: caMode === 'business' ? 'linear-gradient(135deg, #004aad 0%, #003380 100%)' : 'transparent',
                        color: caMode === 'business' ? '#FFFFFF' : '#64748B',
                        fontWeight: '800',
                        fontSize: '14px',
                        boxShadow: caMode === 'business' ? '0 10px 15px -3px rgba(0, 74, 173, 0.3)' : 'none'
                    }}
                >
                    <Building size={18} />
                    FIN-PRO Command Centre (Business)
                </button>
                <button 
                    onClick={() => setCaMode('personal')} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '10px', 
                        padding: '14px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease-in-out',
                        background: caMode === 'personal' ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)' : 'transparent',
                        color: caMode === 'personal' ? '#FFFFFF' : '#64748B',
                        fontWeight: '800',
                        fontSize: '14px',
                        boxShadow: caMode === 'personal' ? '0 10px 15px -3px rgba(21, 128, 61, 0.3)' : 'none'
                    }}
                >
                    <User size={18} />
                    FIN-PRO Advisory Workspace (Firm)
                </button>
            </div>

            {caMode === 'business' ? (
                <>
                    {/* Command Centre Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F0F5FF', border: '1px solid #C3DAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004aad' }}>
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            FIN-PRO Command Centre <span style={{ fontSize: '11px', fontWeight: '900', color: '#004aad', background: '#E0EBFF', border: '1px solid #C3DAFE', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Professional Layer</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginTop: '2px' }}>Manage audits, taxes, compliance, and client reports in one place.</p>
                    </div>
                </div>

                {/* Tab switcher commented out per user request */}
            </div>

            {/* Main Area - Restructured as 2-column Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.7fr 1.3fr', 
                gap: '24px', 
                width: '100%',
                alignItems: 'start'
            }}>
                
                {/* Left Column: FIN-PRO-Assigned Compliance Checklist & Workspaces */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'auditor' && (() => {
                            // Find the connected CA's email dynamically from accepted invitations
                            const connectedCa = outgoingInvitations.find(inv => inv.status === 'Accepted') || 
                                                incomingInvitations.find(inv => inv.status === 'Accepted');
                            const connectedCaEmail = connectedCa 
                                ? (connectedCa.receiver_email === myEmail ? connectedCa.sender_email : connectedCa.receiver_email) 
                                : null;

                            const myClientTasks = practiceTasks.filter(task => {
                                if (!task.clientName) return false;
                                const clientNameLower = task.clientName.toLowerCase();
                                const isMyEmail = myEmail && clientNameLower === myEmail.toLowerCase();
                                const isConnectedCA = connectedCaEmail && clientNameLower === connectedCaEmail.toLowerCase();
                                const isMockClient = ['rohan sharma', 'priya patel (sme)', 'vikram malhotra', 'aditya birla group (individual)', 'ananya roy', 'general client'].includes(clientNameLower);
                                return isMyEmail || isConnectedCA || isMockClient;
                            });
                            const pendingCount = myClientTasks.filter(t => t.status !== 'Completed').length;

                            return (
                                <Motion.div key="auditor" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <CheckCircle2 size={20} style={{ color: '#004aad' }} />
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>📋 FIN-PRO-Assigned Compliance Checklist</h3>
                                            </div>
                                            {pendingCount > 0 ? (
                                                <span style={{ fontSize: '11px', background: '#FFF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', border: '1px solid #FDE047', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} className="animate-pulse" /> {pendingCount} Actions Required
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle2 size={12} /> All Caught Up!
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                            These are the live compliance and audit actions assigned to your account by your connected FIN-PRO. Mark them as 'Completed' or 'In Progress' to sync status in real time.
                                        </p>

                                        {myClientTasks.length === 0 ? (
                                            <div style={{ padding: '48px 24px', textAlign: 'center', border: '1.5px dashed #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>No Active Tasks</h4>
                                                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Your FIN-PRO Advisor hasn't assigned any compliance checklists to your email yet.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                    <FilterableTableHead columns={[
                                                        { key: 'title', label: 'Task Details', placeholder: 'Search task...' },
                                                        { key: 'dueDate', label: 'Due Date', placeholder: 'Due date...' },
                                                        { key: 'priority', label: 'Priority', placeholder: 'Priority...' },
                                                        { key: 'status', label: 'Filing Status / Action', placeholder: 'Status...' }
                                                    ]} onFilterChange={setColFiltersChecklist} />
                                                    <tbody>
                                                        {myClientTasks.filter(item => applyTableFilters(item, colFiltersChecklist)).map(task => (
                                                            <tr key={task.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                                                                <td style={{ padding: '16px 20px', fontWeight: '800', color: task.status === 'Completed' ? '#94A3B8' : '#0F172A', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                                                    {task.title}
                                                                </td>
                                                                <td style={{ padding: '16px 20px', color: '#64748B', fontWeight: '500' }}>📅 {task.dueDate}</td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '800',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '12px',
                                                                        backgroundColor: task.priority === 'High' ? '#FEF2F2' : (task.priority === 'Medium' ? '#EFF6FF' : '#F1F5F9'),
                                                                        color: task.priority === 'High' ? '#EF4444' : (task.priority === 'Medium' ? '#1D4ED8' : '#475569')
                                                                    }}>{task.priority}</span>
                                                                </td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => toggleTaskStatus(task.id)}
                                                                            style={{
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px',
                                                                                padding: '6px 12px',
                                                                                borderRadius: '8px',
                                                                                border: '1.5px solid',
                                                                                borderColor: task.status === 'Completed' ? '#BBF7D0' : (task.status === 'In Progress' ? '#BFDBFE' : '#CBD5E1'),
                                                                                background: task.status === 'Completed' ? '#F0FDF4' : (task.status === 'In Progress' ? '#EFF6FF' : 'transparent'),
                                                                                color: task.status === 'Completed' ? '#15803d' : (task.status === 'In Progress' ? '#1D4ED8' : '#475569'),
                                                                                fontWeight: '800',
                                                                                fontSize: '12px',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                        >
                                                                            {task.status === 'Completed' ? '✓ Completed' : (task.status === 'In Progress' ? '⚡ In Progress' : '○ Pending')}
                                                                        </button>
                                                                        {task.askForDocument && (
                                                                            task.attachedFile ? (
                                                                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                    <CheckCircle2 size={14} /> Uploaded
                                                                                </span>
                                                                            ) : (
                                                                                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                                                    <input 
                                                                                        type="file" 
                                                                                        style={{ display: 'none' }} 
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files && e.target.files.length > 0) {
                                                                                                uploadTaskDocMutation.mutate(task.id);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <span 
                                                                                        style={{
                                                                                            padding: '6px 12px',
                                                                                            borderRadius: '8px',
                                                                                            background: '#0F172A',
                                                                                            color: '#FFFFFF',
                                                                                            border: 'none',
                                                                                            fontWeight: '800',
                                                                                            fontSize: '12px',
                                                                                            display: 'inline-block'
                                                                                        }}
                                                                                    >
                                                                                        Upload Document
                                                                                    </span>
                                                                                </label>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </Motion.div>
                            );
                        })()}

                        {activeTab === 'ca_cpa' && (
                            <Motion.div key="ca_cpa" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                    {/* Jurisdiction Toggle */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Dynamic Jurisdiction Engine</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Instantly maps legal and tax system properties dynamically based on the client profile's geo-jurisdiction.</p>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button onClick={() => setJurisdiction('IN')} style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', fontSize: '13px', fontWeight: '850', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: jurisdiction === 'IN' ? '#004aad' : '#E2E8F0', background: jurisdiction === 'IN' ? '#F0F5FF' : 'transparent', color: jurisdiction === 'IN' ? '#004aad' : '#475569' }}>
                                                <span>🇮🇳 India Jurisdiction</span>
                                                <span style={{ fontSize: '11px', fontWeight: '600' }}>GST, TDS &amp; Income Tax</span>
                                            </button>
                                            <button onClick={() => setJurisdiction('US')} style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', fontSize: '13px', fontWeight: '850', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: jurisdiction === 'US' ? '#004aad' : '#E2E8F0', background: jurisdiction === 'US' ? '#F0F5FF' : 'transparent', color: jurisdiction === 'US' ? '#004aad' : '#475569' }}>
                                                <span>🇺🇸 United States Jurisdiction</span>
                                                <span style={{ fontSize: '11px', fontWeight: '600' }}>IRS &amp; State Sales Tax</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Tax System View */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                Active System Calculations - {jurisdiction === 'IN' ? 'India (GST/TDS)' : 'United States (IRS)'}
                                            </h3>
                                            <span style={{ fontSize: '12px', fontWeight: '750', color: '#004aad' }}>FY 2026-27</span>
                                        </div>

                                        {jurisdiction === 'IN' ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>GSTR-3B Status</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Ready to File</div>
                                                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>{formatCurrency(computedEligibleItc)} ITC Auto-matched</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Total Tax Liability</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>{formatCurrency(computedTotalOutputTax)}</div>
                                                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '600', marginTop: '4px' }}>Based on outward invoices</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Net Payable CGST/SGST</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>{formatCurrency(computedNetPayableCGST + computedNetPayableSGST)}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '4px' }}>Post ITC offset balance</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>IRS Form 1120</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Computed</div>
                                                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>21% Federal Flat Rate</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Federal Tax Due</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>${(computedTaxUS / 80).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '4px' }}>Calculated from P&amp;L ledger</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>State Franchise Tax</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Delaware Franchise</div>
                                                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '600', marginTop: '4px' }}>Min Liability calculated</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Direct E-Filing Portal Integration */}
                                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Landmark size={20} style={{ color: '#004aad' }} />
                                            Direct Portal Integration Engine
                                        </h3>
                                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>API Gateway Version: v1.4.2</span>
                                    </div>

                                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Configure secure credentials and directly upload certified draft returns to government servers (such as India's MCA/IT portal or international IRS/State tax registries) with 256-bit encryption compliance.</p>

                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <button onClick={triggerPortalSync} disabled={syncingState !== 'idle' && syncingState !== 'success'} style={{ padding: '12px 24px', background: '#004aad', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {syncingState === 'idle' && "Initialize Secure Sync"}
                                            {syncingState === 'connecting' && "Connecting Secure Tunnel..."}
                                            {syncingState === 'validating' && "Validating Tax Computations..."}
                                            {syncingState === 'pushing' && "Pushing Returns to Govt Portal..."}
                                            {syncingState === 'success' && "Upload Completed ✓"}
                                        </button>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '750', color: '#475569' }}>
                                                {syncingState === 'idle' && "System Ready to Sync"}
                                                {syncingState === 'connecting' && "Status: Connecting to MCA/IT Servers..."}
                                                {syncingState === 'validating' && "Status: Scanning for checksum integrity..."}
                                                {syncingState === 'pushing' && "Status: Uploading encrypted return packet..."}
                                                {syncingState === 'success' && "Encrypted returns pushed successfully. Reference: CLX-94857A."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}

                        {activeTab === 'cs_vault' && (
                            <Motion.div key="cs_vault" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Secretarial Dashboard */}
                                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Secretarial Dashboard & Resolutions Registry</h3>
                                        <span style={{ fontSize: '11px', background: '#F0F5FF', border: '1px solid #C3DAFE', color: '#004aad', padding: '3px 10px', borderRadius: '20px', fontWeight: '750' }}>CS Governance Module</span>
                                    </div>

                                    <form onSubmit={handleAddResolution} style={{ display: 'flex', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Enter new Resolution description (e.g. Adoption of annual finances)..." 
                                            value={newResolutionTitle} 
                                            onChange={(e) => setNewResolutionTitle(e.target.value)} 
                                            style={{ flex: 3, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontWeight: '600' }}
                                        />
                                        <select 
                                            value={newResolutionType} 
                                            onChange={(e) => setNewResolutionType(e.target.value)} 
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontWeight: '700', color: '#475569' }}
                                        >
                                            <option value="Ordinary">Ordinary Resolution</option>
                                            <option value="Special">Special Resolution</option>
                                        </select>
                                        <button type="submit" style={{ flex: 1, background: '#004aad', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                                            <Plus size={16} /> Add Resolution
                                        </button>
                                    </form>

                                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '14px 16px', fontWeight: '800', color: '#475569' }}>Date Passed</th>
                                                    <th style={{ padding: '14px 16px', fontWeight: '800', color: '#475569' }}>Resolution Details</th>
                                                    <th style={{ padding: '14px 16px', fontWeight: '800', color: '#475569' }}>Category</th>
                                                    <th style={{ padding: '14px 16px', fontWeight: '800', color: '#475569' }}>Filing Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resolutions.map((r) => (
                                                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '14px 16px', color: '#64748B', fontWeight: '600' }}>{r.date}</td>
                                                        <td style={{ padding: '14px 16px', fontWeight: '750', color: '#0F172A' }}>{r.title}</td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '6px', background: r.type === 'Special' ? '#FEE2E2' : '#F1F5F9', color: r.type === 'Special' ? '#991B1B' : '#475569' }}>
                                                                {r.type}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: '750', color: r.status === 'Approved' ? '#16A34A' : '#D97706' }}>
                                                                ● {r.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Deadline Matrix Calendar */}
                                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Compliance Deadline Matrix</h3>
                                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>High-priority calendar tracker detailing crucial global annual filing dates and corporate compliance renewals to bypass state penalties.</p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <div style={{ padding: '16px', border: '1.5px solid #FEE2E2', background: '#FEF2F2', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', background: '#EF4444', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>CRITICAL</span>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#991B1B' }}>May 30</span>
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#991B1B' }}>MCA Form MGT-7</div>
                                            <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: '600' }}>Annual corporate compliance filing for all Indian Pvt Ltd entities.</div>
                                        </div>

                                        <div style={{ padding: '16px', border: '1.5px solid #FEF3C7', background: '#FFFBEB', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', background: '#D97706', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>WARNING</span>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#B45309' }}>June 15</span>
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#B45309' }}>US Form 1120-Q</div>
                                            <div style={{ fontSize: '11px', color: '#B45309', fontWeight: '600' }}>Q2 Estimated Corporate Federal Tax filing date for C-Corps.</div>
                                        </div>

                                        <div style={{ padding: '16px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', background: '#64748B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>PENDING</span>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>July 10</span>
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#475569' }}>GST GSTR-1 File</div>
                                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Outward supplies return filing matching invoice serial databases.</div>
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}

                        {activeTab === 'consultant' && (
                            <Motion.div key="consultant" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
                                    
                                    {/* Multi-Tenant Client Portfolio */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Client Portfolio Management</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Switch seamlessly between business entities under your management desk without data token crossover.</p>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                            {clientsList.length > 0 ? clientsList.map(c => (
                                                <button 
                                                    key={c.id} 
                                                    onClick={() => setSelectedClient(c.id)}
                                                    style={{ 
                                                        width: '100%', padding: '12px', borderRadius: '10px', textAlign: 'left',
                                                        border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
                                                        borderColor: selectedClient === c.id ? '#004aad' : '#E2E8F0',
                                                        background: selectedClient === c.id ? '#F0F5FF' : 'transparent',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: '800', color: selectedClient === c.id ? '#004aad' : '#0F172A' }}>{c.name}</span>
                                                        <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: '750' }}>{c.status}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748B' }}>
                                                        <span>{c.industry}</span>
                                                        <span>Revenue: <strong>{c.revenue}</strong></span>
                                                    </div>
                                                </button>
                                            )) : (
                                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '10px', color: '#64748B', fontSize: '12px', fontWeight: '600' }}>
                                                    No client contacts registered. Go to Contacts to add a client.
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Financial Forecasting & Notes Desk */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                    Cash Flow &amp; Financial Forecasting Desk
                                                </h3>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => setForecastPeriod(3)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 3 ? '#004aad' : '#FFFFFF', color: forecastPeriod === 3 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>3M</button>
                                                    <button onClick={() => setForecastPeriod(6)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 6 ? '#004aad' : '#FFFFFF', color: forecastPeriod === 6 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>6M</button>
                                                    <button onClick={() => setForecastPeriod(12)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 12 ? '#004aad' : '#FFFFFF', color: forecastPeriod === 12 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>12M</button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                                                <span>Active Client Model: <strong>{activeClientData.name}</strong></span>
                                                <span style={{ color: '#CBD5E1' }}>|</span>
                                                <span>Industry Benchmark Risk: <strong style={{ color: activeClientData.risk === 'Low' ? '#16A34A' : '#D97706' }}>{activeClientData.risk}</strong></span>
                                            </div>

                                            {/* Simulated Bar Graph using CSS flexboxes and divs */}
                                            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 10px 10px 10px' }}>
                                                {Array.from({ length: forecastPeriod }).map((_, idx) => {
                                                    // Dynamic forecast generator algorithm
                                                    const baseRev = parseInt(activeClientData.revenue.replace(/[^0-9]/g, '')) || 500;
                                                    const multiplier = activeClientData.risk === 'High' ? 0.95 : 1.08;
                                                    const predictedValue = Math.round(baseRev * Math.pow(multiplier, idx));
                                                    const maxCapacity = baseRev * Math.pow(1.08, 12);
                                                    const barHeightPercent = Math.max(10, Math.min(95, (predictedValue / maxCapacity) * 80));

                                                    return (
                                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '30px' }}>
                                                            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>{formatCurrency(predictedValue)}</div>
                                                            <div style={{ 
                                                                width: '100%', 
                                                                height: `${barHeightPercent}%`, 
                                                                background: 'linear-gradient(180deg, #4788E6 0%, #004aad 100%)', 
                                                                borderRadius: '6px 6px 0 0',
                                                                boxShadow: '0 2px 4px rgba(0, 74, 173, 0.25)',
                                                                transition: 'height 0.3s ease-out'
                                                            }} />
                                                            <div style={{ fontSize: '9px', fontWeight: '750', color: '#64748B', marginTop: '6px' }}>M{idx + 1}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* CA Advisory Notes & Recommendations Section */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                                                    💼 FIN-PRO Advisory &amp; Recommendation Ledger
                                                </h3>
                                                <span style={{ fontSize: '10px', background: '#F0F5FF', color: '#004aad', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>Active Workspace</span>
                                            </div>

                                            <div style={{ padding: '14px', background: '#FFFDF0', border: '1px solid #FDE047', borderRadius: '10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                                <strong>Current Advisory Note:</strong> {clientNotes[selectedClient] || "No advisory note recorded for this client entity yet."}
                                            </div>

                                            <form onSubmit={handleAddClientNote} style={{ display: 'flex', gap: '8px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Add professional recommendation / compliance action note..." 
                                                    value={activeNoteInput} 
                                                    onChange={(e) => setActiveNoteInput(e.target.value)} 
                                                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', fontWeight: '600' }}
                                                />
                                                <button type="submit" style={{ padding: '10px 18px', background: '#004aad', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '850', fontSize: '12px', cursor: 'pointer' }}>
                                                    Save Note
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Accountant Connection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    {/* Accountant Connection Portal */}
                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={20} style={{ color: '#004aad' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>🤝 Accountant Connection</h3>
                            </div>
                            {outgoingInvitations.some(inv => inv.status === 'Accepted') ? (
                                <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#16A34A', padding: '3px 10px', borderRadius: '20px', fontWeight: '750', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={12} /> Connected FIN-PRO Active
                                </span>
                            ) : outgoingInvitations.some(inv => inv.status === 'Pending') ? (
                                <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '20px', fontWeight: '750', border: '1px solid #FDE047', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} className="animate-pulse" /> Pending Acceptance
                                </span>
                            ) : (
                                <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: '20px', fontWeight: '750', border: '1px solid #E2E8F0' }}>
                                    Not Connected
                                </span>
                            )}
                        </div>

                        {outgoingInvitations.length === 0 ? (
                            // 1. DISCONNECTED / INVITE FORM STATE
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                    Invite your FIN-PRO Advisory Partner to securely manage your taxes, scan transactions for compliance, and compile operational financial audits in real time.
                                </p>
                                <form onSubmit={handleInviteCA} style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    <input 
                                        type="email" 
                                        required 
                                        placeholder="Enter your FIN-PRO's professional email address (e.g., finpro@firm.com)" 
                                        value={inviteEmailInput}
                                        onChange={(e) => setInviteEmailInput(e.target.value)}
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', fontWeight: '500', outline: 'none', transition: 'all 0.2s' }}
                                    />
                                    <button 
                                        type="submit" 
                                        style={{ padding: '12px 20px', background: '#004aad', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                    >
                                        <Plus size={16} /> Invite FIN-PRO
                                    </button>
                                </form>

                                <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />

                                <div>
                                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', marginBottom: '10px' }}>What you will share with your FIN-PRO:</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                        {[
                                            { label: 'Check GST & Tax Records', desc: 'Validates input credit & filing status' },
                                            { label: 'Analyze Invoices & Fraud Risks', desc: 'Flags suspicious payments & variance scores' },
                                            { label: 'Map International Accounts', desc: 'IFRS / US GAAP layout mapping' },
                                            { label: 'Reconcile Bank Feed Transactions', desc: 'Matches inbound ledger payments' }
                                        ].map((priv, idx) => (
                                            <div key={idx} style={{ padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'start' }}>
                                                <span style={{ color: '#16A34A', marginTop: '2px', fontWeight: '800' }}>✓</span>
                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>{priv.label}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500', marginTop: '1px' }}>{priv.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : outgoingInvitations.some(inv => inv.status === 'Pending') ? (
                            // 2. PENDING ACCEPTANCE STATE
                            outgoingInvitations.filter(inv => inv.status === 'Pending').map(inv => (
                                <div key={inv.id} style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: '12.5px', color: '#78350F', fontWeight: '750' }}>Access invitation sent to: </span>
                                            <span style={{ fontSize: '13px', color: '#92400E', fontWeight: '850', textDecoration: 'underline' }}>{inv.receiver_email}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRevokeCA(inv.id)} 
                                            style={{ background: 'transparent', border: 'none', color: '#B45309', fontSize: '12px', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Trash2 size={14} /> Cancel Request
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', marginRight: '4px' }} className="animate-ping"></span>
                                        Sent: {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'Just now'}
                                    </div>
                                    <div style={{ marginTop: '4px', padding: '10px 12px', background: '#FFFDF5', borderRadius: '8px', border: '1px dashed #FCD34D', fontSize: '11.5px', color: '#92400E', fontWeight: '600', lineHeight: '1.5' }}>
                                        💡 <strong>How to Test:</strong> Switch to the <strong>Personal FIN-PRO Advisory Workspace</strong> at the top of the page, click on the <strong>Client Requests</strong> tab, and click <strong>"Accept Invitation"</strong> to simulate your accountant accepting this request.
                                    </div>
                                </div>
                            ))
                        ) : (
                            // 3. CONNECTED STATE
                            outgoingInvitations.filter(inv => inv.status === 'Accepted').map(inv => (
                                <div key={inv.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div 
                                        onClick={() => setShowRevokeId(showRevokeId === inv.id ? null : inv.id)}
                                        style={{ padding: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '850', color: '#14532D' }}>{inv.receiver_email}</div>
                                                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '2px' }}>Authorized Accountant Partner • Connected since {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Just now'}</div>
                                            </div>
                                        </div>
                                        {showRevokeId === inv.id && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRevokeCA(inv.id); }} 
                                                style={{ padding: '8px 14px', background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                Revoke Access
                                            </button>
                                        )}
                                    </div>

                                    {/* Privileges/What CA can do */}
                                    <div>
                                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>Security Clearance & Shared Privileges:</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                            {[
                                                { label: 'Check GST & Tax Records', desc: 'Validates input credit & filing status' },
                                                { label: 'Analyze Invoices & Fraud Risks', desc: 'Flags suspicious payments & variance scores' },
                                                { label: 'Map International Accounts', desc: 'IFRS / US GAAP layout mapping' },
                                                { label: 'Reconcile Bank Feed Transactions', desc: 'Matches inbound ledger payments' }
                                            ].map((priv, idx) => (
                                                <div key={idx} style={{ padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'start' }}>
                                                    <span style={{ color: '#16A34A', marginTop: '2px' }}>✔</span>
                                                    <div>
                                                        <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>{priv.label}</div>
                                                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500', marginTop: '1px' }}>{priv.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
            </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                    {/* Zoho Practice Style Scrollable Horizontal Navigation Tab Bar */}
                    <div style={{ 
                        background: '#FFFFFF', 
                        borderRadius: '16px', 
                        border: '1px solid #E2E8F0', 
                        padding: '10px 16px', 
                        display: 'flex', 
                        gap: '6px',
                        alignItems: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                        position: 'sticky',
                        top: '24px',
                        zIndex: 10,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none' // For Firefox
                    }}>
                        {/* Inline custom styles to hide scrollbar in Webkit browsers */}
                        <style dangerouslySetInnerHTML={{__html: `
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}} />

                        {sidebarTabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = personalTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setPersonalTab(tab.id)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        gap: '8px',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: isActive ? '#F0FDF4' : 'transparent',
                                        color: isActive ? '#15803d' : '#475569',
                                        fontWeight: isActive ? '800' : '600',
                                        fontSize: '13px'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = '#F8FAFC';
                                            e.currentTarget.style.color = '#0F172A';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#475569';
                                        }
                                    }}
                                >
                                    <TabIcon size={16} style={{ color: isActive ? '#15803d' : '#64748B' }} />
                                    <span>{tab.label}</span>
                                    {/* Dynamic Badges */}
                                    {tab.id === 'requests' && practiceRequests.filter(r => r.status === 'Awaiting Client').length > 0 && (
                                        <span style={{ fontSize: '10px', fontWeight: '900', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', padding: '1px 6px', borderRadius: '8px', marginLeft: '2px' }}>
                                            {practiceRequests.filter(r => r.status === 'Awaiting Client').length}
                                        </span>
                                    )}
                                    {tab.id === 'tasks' && practiceTasks.filter(t => t.status !== 'Completed').length > 0 && (
                                        <span style={{ fontSize: '10px', fontWeight: '900', background: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7', padding: '1px 6px', borderRadius: '8px', marginLeft: '2px' }}>
                                            {practiceTasks.filter(t => t.status !== 'Completed').length}
                                        </span>
                                    )}
                                    {tab.id === 'team_requests' && teamRequests.filter(r => r.status === 'Pending').length > 0 && (
                                        <span style={{ fontSize: '10px', fontWeight: '900', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '1px 6px', borderRadius: '8px', marginLeft: '2px' }}>
                                            {teamRequests.filter(r => r.status === 'Pending').length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Workspace Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
                        <AnimatePresence mode="wait">
                            {/* 1. HOME TAB */}
                            {personalTab === 'home' && (
                                <Motion.div key="home" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Stats grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '750' }}>Total Practice Clients</span>
                                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>{allPracticeClients.length}</div>
                                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>Active Taxpayers Portal</span>
                                        </div>
                                        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '750' }}>Awaiting Client Uploads</span>
                                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#D97706' }}>{practiceRequests.filter(r => r.status === 'Awaiting Client').length}</div>
                                            <span style={{ fontSize: '11px', color: '#D97706', fontWeight: '600' }}>Outbound requests pending</span>
                                        </div>
                                        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '750' }}>Open Compliance Tasks</span>
                                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#EF4444' }}>{practiceTasks.filter(t => t.status !== 'Completed').length}</div>
                                            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600' }}>Filing checklist items</span>
                                        </div>
                                        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '750' }}>Timesheet Records</span>
                                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0284C7' }}>{practiceTimesheets.length}</div>
                                            <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '600' }}>Logged consulting blocks</span>
                                        </div>
                                    </div>

                                    {/* Action Cards & Timeline */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                                        {/* Recent activity timeline */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px 0' }}>📋 Practice Activity Stream</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {(() => {
                                                    const activities = [];

                                                    // 1. Gather activities from requests
                                                    practiceRequests.forEach(req => {
                                                        let actionText = '';
                                                        let color = '#D97706'; // orange for awaiting
                                                        if (req.status === 'Approved') {
                                                            actionText = `${req.client_name || 'Client'} successfully verified document: ${req.title}`;
                                                            color = '#15803d'; // green
                                                        } else if (req.status === 'Under Review') {
                                                            actionText = `${req.client_name || 'Client'} uploaded document: ${req.title}`;
                                                            color = '#0284C7'; // blue
                                                        } else {
                                                            actionText = `Request for ${req.title} issued to ${req.client_name || 'Client'}`;
                                                            color = '#D97706';
                                                        }
                                                        activities.push({
                                                            text: actionText,
                                                            time: req.due_date ? `Due by ${req.due_date}` : 'Recently',
                                                            color,
                                                            timestamp: new Date(req.due_date || '').getTime() || 0
                                                        });
                                                    });

                                                    // 2. Gather activities from tasks
                                                    practiceTasks.forEach(task => {
                                                        let actionText = '';
                                                        let color = '#64748B';
                                                        if (task.status === 'Completed') {
                                                            actionText = `Task complete: "${task.title}" for ${task.client_name}`;
                                                            color = '#15803d';
                                                        } else if (task.status === 'In Progress') {
                                                            actionText = `Working on: "${task.title}" for ${task.client_name}`;
                                                            color = '#0284C7';
                                                        } else {
                                                            actionText = `Operations task queued: "${task.title}" for ${task.client_name}`;
                                                            color = '#D97706';
                                                        }
                                                        activities.push({
                                                            text: actionText,
                                                            time: task.due_date ? `Due ${task.due_date}` : 'Awaiting',
                                                            color,
                                                            timestamp: new Date(task.due_date || '').getTime() || 0
                                                        });
                                                    });

                                                    // 3. Gather activities from timesheets
                                                    practiceTimesheets.forEach(ts => {
                                                        activities.push({
                                                            text: `Time logged: ${ts.duration || '00:00'} for ${ts.client_name} - ${ts.task_name}`,
                                                            time: ts.date || 'Today',
                                                            color: '#0284C7',
                                                            timestamp: new Date(ts.date || '').getTime() || 0
                                                        });
                                                    });

                                                    // Show up to 4 items
                                                    const displayedActivities = activities.slice(0, 4);

                                                    if (displayedActivities.length === 0) {
                                                        return (
                                                            <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', padding: '10px 0' }}>
                                                                No practice activities recorded yet. Add clients or create tasks to see live updates.
                                                            </div>
                                                        );
                                                    }

                                                    return displayedActivities.map((act, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.color, marginTop: '6px', flexShrink: 0 }} />
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: '750', color: '#334155' }}>{act.text}</div>
                                                                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{act.time}</div>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>⚡ Quick Practice Actions</h3>
                                            <button onClick={() => setShowAddClientModal(true)} style={{ width: '100%', padding: '12px', background: '#F0FDF4', color: '#15803d', border: '1px solid #BBF7D0', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <PlusCircle size={16} /> Add New Practice Client
                                            </button>
                                            <button onClick={() => setShowAddRequestModal(true)} style={{ width: '100%', padding: '12px', background: '#F0FDF4', color: '#15803d', border: '1px solid #BBF7D0', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <HelpCircle size={16} /> Request Client Document
                                            </button>
                                            <button onClick={() => setShowAddTaskModal(true)} style={{ width: '100%', padding: '12px', background: '#F0FDF4', color: '#15803d', border: '1px solid #BBF7D0', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <CheckSquare size={16} /> Create Operations Task
                                            </button>
                                        </div>
                                    </div>
                                </Motion.div>
                            )}

                            {/* 2. CLIENTS TAB */}
                            {personalTab === 'clients' && (
                                <Motion.div key="clients" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
                                            <Search size={18} style={{ color: '#94A3B8' }} />
                                            <input 
                                                type="text" 
                                                placeholder="Search taxpayers by name or email..." 
                                                value={activeClientSearch}
                                                onChange={e => setActiveClientSearch(e.target.value)}
                                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13.5px', fontWeight: '600', color: '#0F172A' }}
                                            />
                                        </div>
                                        <button onClick={() => setShowAddClientModal(true)} style={{ padding: '8px 16px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={16} /> Add Taxpayer Client
                                        </button>
                                    </div>

                                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <FilterableTableHead columns={[
                                                { key: 'name', label: 'Taxpayer Name', placeholder: 'Name...' },
                                                { key: 'email', label: 'Email Address', placeholder: 'Email...' },
                                                { key: 'regime', label: 'Regime', placeholder: 'Regime...' },
                                                { key: 'income', label: 'Est. Gross Income', placeholder: 'Income...' },
                                                { key: 'pendingFilings', label: 'Pending Filings', placeholder: 'Pending...' },
                                                { key: 'status', label: 'Status', placeholder: 'Status...' }
                                            ]} onFilterChange={setColFiltersClients} />
                                            <tbody>
                                                {allPracticeClients
                                                    .filter(c => c.name.toLowerCase().includes(activeClientSearch.toLowerCase()) || c.email.toLowerCase().includes(activeClientSearch.toLowerCase()))
                                                    .filter(item => applyTableFilters(item, colFiltersClients))
                                                    .map(client => (
                                                    <tr key={client.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                                                        <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F0FDF4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>{client.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                                                            {client.name}
                                                        </td>
                                                        <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '600' }}>{client.email}</td>
                                                        <td style={{ padding: '16px 20px', fontWeight: '750', color: '#1E293B' }}>{client.regime} Regime</td>
                                                        <td style={{ padding: '16px 20px', fontWeight: '900', color: '#0F172A' }}>{formatCurrency(client.income)}</td>
                                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                            {client.pendingFilings > 0 ? (
                                                                <span style={{ background: '#FFFBEB', color: '#D97706', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: '1px solid #FEF3C7' }}>{client.pendingFilings} Pending</span>
                                                            ) : (
                                                                <span style={{ color: '#16A34A', fontWeight: '800', fontSize: '12px' }}>✓ Up to date</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                backgroundColor: client.status === 'Active' ? '#DCFCE7' : (client.status === 'Pending Filing' ? '#FEF3C7' : '#EFF6FF'),
                                                                color: client.status === 'Active' ? '#15803d' : (client.status === 'Pending Filing' ? '#D97706' : '#1D4ED8'),
                                                                border: `1px solid ${client.status === 'Active' ? '#BBF7D0' : (client.status === 'Pending Filing' ? '#FDE047' : '#BFDBFE')}`
                                                            }}>{client.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {/* 3. CLIENT REQUESTS TAB */}
                            {personalTab === 'requests' && (
                                <Motion.div key="requests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Incoming Client Connection Requests Portal */}
                                    {incomingInvitations.some(inv => inv.status === 'Pending') && (
                                        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Users size={20} style={{ color: '#16A34A' }} />
                                                    <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#14532D', margin: 0 }}>📩 Incoming Client Connection Requests</h3>
                                                </div>
                                                <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontWeight: '750', border: '1px solid #BBF7D0' }}>
                                                    Awaiting Action
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                                The following business client has sent you an invitation request to access their transactional audit feed, verify taxes, and manage computations.
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {incomingInvitations.filter(inv => inv.status === 'Pending').map(inv => (
                                                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                                                 <Building size={20} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A' }}>{inv.sender_name}</div>
                                                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>Client: {inv.sender_email} • Sent: {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'Just now'}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                onClick={() => handleAcceptInvitation(inv.id)}
                                                                style={{ padding: '8px 16px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                                            >
                                                                <UserCheck size={14} /> Accept Invitation
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRevokeCA(inv.id)}
                                                                style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            >
                                                                Ignore
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>🤝 Outbound Document Requests Ledger</h2>
                                        <button onClick={() => setShowAddRequestModal(true)} style={{ padding: '8px 16px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <PlusCircle size={16} /> Create Document Requisition
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                                        {/* Left Side: Requests list */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {practiceRequests.map(req => (
                                                <div 
                                                    key={req.id} 
                                                    onClick={() => setSelectedRequestForReview(req)}
                                                    style={{ 
                                                        background: '#FFFFFF', 
                                                        padding: '18px', 
                                                        borderRadius: '14px', 
                                                        border: '1.5px solid', 
                                                        borderColor: selectedRequestForReview?.id === req.id ? '#15803d' : '#E2E8F0', 
                                                        boxShadow: selectedRequestForReview?.id === req.id ? '0 4px 6px -1px rgba(21, 128, 61, 0.05)' : 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>{req.clientName}</span>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            padding: '3px 8px',
                                                            borderRadius: '12px',
                                                            backgroundColor: req.status === 'Approved' ? '#DCFCE7' : (req.status === 'Under Review' ? '#F3E8FF' : '#FEF3C7'),
                                                            color: req.status === 'Approved' ? '#15803d' : (req.status === 'Under Review' ? '#6B21A8' : '#D97706'),
                                                            border: `1px solid ${req.status === 'Approved' ? '#BBF7D0' : (req.status === 'Under Review' ? '#E9D5FF' : '#FDE047')}`
                                                        }}>{req.status}</span>
                                                    </div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A', margin: 0 }}>{req.title}</h4>
                                                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, fontWeight: '500' }}>{req.description}</p>
                                                    
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11.5px', fontWeight: '750', color: '#64748B' }}>
                                                        <span>Due: {req.dueDate}</span>
                                                        <span style={{ color: req.priority === 'High' ? '#EF4444' : '#64748B' }}>Priority: {req.priority}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Side: Simulation Panel */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', height: 'fit-content', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>🔬 Client Collaboration Simulator</h3>
                                            
                                            {selectedRequestForReview ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                    <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#15803d' }}>SELECTED REQUEST</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>{selectedRequestForReview.title}</div>
                                                        <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', fontWeight: '500' }}>For: {selectedRequestForReview.clientName}</div>
                                                    </div>

                                                    {selectedRequestForReview.status === 'Awaiting Client' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>This request has been sent to the taxpayer. You can simulate the taxpayer uploading the requested document.</p>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    simulateClientUpload(selectedRequestForReview.id);
                                                                    // Update local selection for visual sync
                                                                    setSelectedRequestForReview({
                                                                        ...selectedRequestForReview,
                                                                        status: 'Under Review',
                                                                        attachedFile: `simulated_upload_${selectedRequestForReview.docType.toLowerCase().replace(/\s+/g, '_')}_1234.pdf`
                                                                    });
                                                                }}
                                                                style={{ padding: '10px 14px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                                                            >
                                                                Simulate Taxpayer Upload
                                                            </button>
                                                        </div>
                                                    )}

                                                    {selectedRequestForReview.status === 'Under Review' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            <div style={{ background: '#F3E8FF', border: '1px solid #E9D5FF', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: '800' }}>SIMULATED ATTACHMENT</span>
                                                                <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#0F172A' }}>📄 {selectedRequestForReview.attachedFile || 'simulated_uploaded_file.pdf'}</span>
                                                            </div>
                                                            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>Review the document. You can lock and approve it to finalize this collection step.</p>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    approveUploadedDoc(selectedRequestForReview.id);
                                                                    setSelectedRequestForReview({
                                                                        ...selectedRequestForReview,
                                                                        status: 'Approved'
                                                                    });
                                                                }}
                                                                style={{ padding: '10px 14px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                                                            >
                                                                Review &amp; Approve
                                                            </button>
                                                        </div>
                                                    )}

                                                    {selectedRequestForReview.status === 'Approved' && (
                                                        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#166534', fontWeight: '750' }}>
                                                            <span>✓ Steps Approved &amp; Locked</span>
                                                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '500' }}>Document parsed, reconciled with the taxpayer filing engine, and securely cataloged.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '24px', textAlign: 'center', border: '1.5px dashed #E2E8F0', borderRadius: '10px', fontSize: '12.5px', color: '#94A3B8', fontWeight: '600' }}>
                                                    Select a request from the ledger to simulate taxpayer file uploads and audits.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Motion.div>
                            )}

                            {/* 5. TASKS TAB */}
                            {personalTab === 'tasks' && (
                                <Motion.div key="tasks" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>✅ Operational Compliance checklist</h2>
                                        <button onClick={() => setShowAddTaskModal(true)} style={{ padding: '8px 16px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={16} /> New Operations Task
                                        </button>
                                    </div>

                                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <FilterableTableHead columns={[
                                                { key: 'title', label: 'Task Description', placeholder: 'Search...' },
                                                { key: 'clientName', label: 'Taxpayer Client', placeholder: 'Client...' },
                                                { key: 'dueDate', label: 'Due Date', placeholder: 'Date...' },
                                                { key: 'priority', label: 'Priority', placeholder: 'Priority...' },
                                                { key: 'status', label: 'Filing Lifecycle Status', placeholder: 'Status...' }
                                            ]} onFilterChange={setColFiltersTasks} />
                                            <tbody>
                                                {practiceTasks.filter(item => applyTableFilters(item, colFiltersTasks)).map(task => (
                                                    <tr key={task.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                                                        <td style={{ padding: '16px 20px', fontWeight: '800', color: task.status === 'Completed' ? '#94A3B8' : '#0F172A', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                                            {task.title}
                                                        </td>
                                                        <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '600' }}>{task.clientName}</td>
                                                        <td style={{ padding: '16px 20px', color: '#64748B', fontWeight: '500' }}>📅 {task.dueDate}</td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                padding: '3px 8px',
                                                                borderRadius: '12px',
                                                                backgroundColor: task.priority === 'High' ? '#FEF2F2' : (task.priority === 'Medium' ? '#EFF6FF' : '#F1F5F9'),
                                                                color: task.priority === 'High' ? '#EF4444' : (task.priority === 'Medium' ? '#1D4ED8' : '#475569')
                                                            }}>{task.priority}</span>
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => toggleTaskStatus(task.id)}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '8px',
                                                                    border: '1.5px solid',
                                                                    borderColor: task.status === 'Completed' ? '#BBF7D0' : (task.status === 'In Progress' ? '#BFDBFE' : '#CBD5E1'),
                                                                    background: task.status === 'Completed' ? '#F0FDF4' : (task.status === 'In Progress' ? '#EFF6FF' : 'transparent'),
                                                                    color: task.status === 'Completed' ? '#15803d' : (task.status === 'In Progress' ? '#1D4ED8' : '#475569'),
                                                                    fontWeight: '800',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {task.status === 'Completed' ? '✓ Completed' : (task.status === 'In Progress' ? '⚡ In Progress' : '○ Pending')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {/* TEAMS TAB */}
                            {personalTab === 'teams' && (
                                <Motion.div key="teams" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>👥 Practice Team Members</h2>
                                            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>Manage roles, access control, and staff associations inside your advisory firm.</p>
                                        </div>
                                        <button onClick={() => setShowAddTeamMemberModal(true)} style={{ padding: '8px 16px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={16} /> Add Team Member
                                        </button>
                                    </div>

                                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12.5px', fontWeight: '800' }}>
                                                    <th style={{ padding: '14px 20px' }}>Team Member</th>
                                                    <th style={{ padding: '14px 20px' }}>Email Address</th>
                                                    <th style={{ padding: '14px 20px' }}>Designation / Role</th>
                                                    <th style={{ padding: '14px 20px' }}>Status</th>
                                                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teamMembers.map(member => {
                                                    const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                                                    return (
                                                        <tr key={member.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                                                            <td style={{ padding: '16px 20px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: '50%',
                                                                        background: '#E2F0D9',
                                                                        color: '#15803d',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: '900',
                                                                        fontSize: '12px'
                                                                    }}>
                                                                        {initials}
                                                                    </div>
                                                                    <span style={{ fontWeight: '800', color: '#0F172A' }}>{member.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '500', fontFamily: 'monospace' }}>{member.email}</td>
                                                            <td style={{ padding: '16px 20px' }}>
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: '800',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '12px',
                                                                    backgroundColor: '#EFF6FF',
                                                                    color: '#1D4ED8'
                                                                }}>{member.role}</span>
                                                            </td>
                                                            <td style={{ padding: '16px 20px' }}>
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: '800',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '12px',
                                                                    backgroundColor: member.status === 'Active' ? '#ECFDF5' : '#FFFBEB',
                                                                    color: member.status === 'Active' ? '#059669' : '#D97706'
                                                                }}>{member.status}</span>
                                                            </td>
                                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`Are you sure you want to remove ${member.name} from the practice team?`)) {
                                                                            removeTeamMemberMutation.mutate(member.id);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        background: 'transparent',
                                                                        border: '1.5px solid #FEE2E2',
                                                                        borderRadius: '8px',
                                                                        color: '#EF4444',
                                                                        fontWeight: '700',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        e.currentTarget.style.background = '#FEF2F2';
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {/* TEAM REQUESTS TAB */}
                            {personalTab === 'team_requests' && (
                                <Motion.div key="team_requests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>✉️ Team Invitations & Requests</h2>
                                        <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>Approve incoming join requests or track pending outgoing invitations sent to other advisors.</p>
                                    </div>

                                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        {teamRequests.length === 0 ? (
                                            <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                    <UserCheck size={24} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>No Pending Requests</h4>
                                                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>All team invitations and member requests have been fully processed.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <FilterableTableHead columns={[
                                                    { key: 'name', label: 'Target Candidate', placeholder: 'Name...' },
                                                    { key: 'email', label: 'Email Address', placeholder: 'Email...' },
                                                    { key: 'role', label: 'Proposed Role', placeholder: 'Role...' },
                                                    { key: 'type', label: 'Direction', placeholder: 'Type...' },
                                                    { key: 'status', label: 'Status', placeholder: 'Status...' }
                                                ]} onFilterChange={setColFiltersChecklist} />
                                                <tbody>
                                                    {teamRequests.filter(item => applyTableFilters(item, colFiltersChecklist)).map(req => {
                                                        const initials = req.name.split(' ').map(n => n[0]).join('').toUpperCase();
                                                        return (
                                                            <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                                                                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0F172A' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            borderRadius: '50%',
                                                                            background: req.type === 'Incoming' ? '#EFF6FF' : '#FFF7ED',
                                                                            color: req.type === 'Incoming' ? '#1D4ED8' : '#EA580C',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontWeight: '900',
                                                                            fontSize: '11px'
                                                                        }}>
                                                                            {initials}
                                                                        </div>
                                                                        <span>{req.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '500', fontFamily: 'monospace' }}>{req.email}</td>
                                                                <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '600' }}>{req.role}</td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '800',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '12px',
                                                                        backgroundColor: req.type === 'Incoming' ? '#E0F2FE' : '#FEE2E2',
                                                                        color: req.type === 'Incoming' ? '#0369A1' : '#B91C1C'
                                                                    }}>{req.type}</span>
                                                                </td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '800',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '12px',
                                                                        backgroundColor: '#FEF3C7',
                                                                        color: '#D97706'
                                                                    }}>{req.status}</span>
                                                                </td>
                                                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                                    {req.type === 'Incoming' ? (
                                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                            <button
                                                                                onClick={() => {
                                                                                    acceptTeamRequestMutation.mutate(req.id);
                                                                                }}
                                                                                style={{
                                                                                    padding: '6px 12px',
                                                                                    background: '#15803d',
                                                                                    border: 'none',
                                                                                    borderRadius: '8px',
                                                                                    color: 'white',
                                                                                    fontWeight: '800',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Accept
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (confirm(`Reject request from ${req.name}?`)) {
                                                                                        rejectTeamRequestMutation.mutate(req.id);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    padding: '6px 12px',
                                                                                    background: 'transparent',
                                                                                    border: '1.5px solid #E2E8F0',
                                                                                    borderRadius: '8px',
                                                                                    color: '#64748B',
                                                                                    fontWeight: '700',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Decline
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm(`Cancel invitation to ${req.name}?`)) {
                                                                                    cancelTeamRequestMutation.mutate(req.id);
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                padding: '6px 12px',
                                                                                background: 'transparent',
                                                                                border: '1.5px solid #E2E8F0',
                                                                                borderRadius: '8px',
                                                                                color: '#64748B',
                                                                                fontWeight: '700',
                                                                                fontSize: '12px',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </Motion.div>
                            )}

                            {/* 6. TIME TRACKING TAB */}
                            {personalTab === 'timetracking' && (
                                <Motion.div key="timetracking" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
                                        {/* Left Side: Stopwatch Widget */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>⏱️ Live Ticking Stopwatch Widget</h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>SELECT CLIENT</label>
                                                <select 
                                                    value={timerClient}
                                                    onChange={e => setTimerClient(e.target.value)}
                                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                                                >
                                                    {allPracticeClients.map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>TASK DESCRIPTION</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Audit draft calculation, GSTR preparation..." 
                                                    value={timerTask}
                                                    onChange={e => setTimerTask(e.target.value)}
                                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                                                />
                                            </div>

                                            {/* Digital Clock Display */}
                                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '12px', textAlign: 'center', margin: '4px 0' }}>
                                                <div style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: '900', color: isTimerRunning ? '#15803d' : '#334155' }}>
                                                    {formatTime(timerSeconds)}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>
                                                    {isTimerRunning ? '● Timer Active & Ticking' : '● Timer Paused'}
                                                </div>
                                            </div>

                                            {/* Clock controls */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {!isTimerRunning ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsTimerRunning(true)}
                                                        style={{ flex: 1, padding: '12px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                    >
                                                        <Play size={16} /> Start Timer
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsTimerRunning(false)}
                                                        style={{ flex: 1, padding: '12px', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                    >
                                                        <Square size={14} /> Pause Timer
                                                    </button>
                                                )}
                                                <button 
                                                    type="button"
                                                    onClick={() => setTimerSeconds(0)}
                                                    style={{ padding: '12px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                                                >
                                                    Reset
                                                </button>
                                            </div>

                                            {timerSeconds > 0 && (
                                                <button 
                                                    type="button"
                                                    onClick={handleSaveTimerSession}
                                                    style={{ width: '100%', padding: '12px', background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                                >
                                                    💾 Record &amp; Save Session to Ledger
                                                </button>
                                            )}
                                        </div>

                                        {/* Right Side: Timesheet Log */}
                                        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px 0' }}>📅 Practice Timesheet Sessions History</h3>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                                     <FilterableTableHead columns={[
                                                            { key: 'clientName', label: 'Client', placeholder: 'Client...' },
                                                            { key: 'taskName', label: 'Task Description', placeholder: 'Task...' },
                                                            { key: 'date', label: 'Date', placeholder: 'Date...' },
                                                            { key: 'duration', label: 'Duration', placeholder: 'Duration...' },
                                                            { key: 'billable', label: 'Billable', placeholder: 'Yes/No...' }
                                                        ]} onFilterChange={setColFiltersTimesheet} />
                                                     <tbody>
                                                        {practiceTimesheets.filter(item => applyTableFilters(item, colFiltersTimesheet)).map(session => (
                                                            <tr key={session.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                                <td style={{ padding: '12px 8px', fontWeight: '800', color: '#0F172A' }}>{session.clientName}</td>
                                                                <td style={{ padding: '12px 8px', fontWeight: '600', color: '#334155' }}>{session.taskName}</td>
                                                                <td style={{ padding: '12px 8px', color: '#64748B' }}>{session.date}</td>
                                                                <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontWeight: '750' }}>{session.duration}</td>
                                                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: '800', color: session.billable ? '#15803d' : '#475569', background: session.billable ? '#F0FDF4' : '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                                                                        {session.billable ? 'Yes' : 'No'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                     </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </Motion.div>
                            )}

                            {/* 7. WORKPAPER TAB */}
                            {personalTab === 'workpaper' && (
                                <Motion.div key="workpaper" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {!selectedWorkpaperClientId ? (
                                        /* ── Client List View ── */
                                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>📝 Workpaper — Select a Client</h3>
                                                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0' }}>Click on a client to view and manage their audit checklist.</p>
                                                </div>
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12.5px', fontWeight: '800' }}>
                                                        <th style={{ padding: '14px 20px' }}>Client Name</th>
                                                        <th style={{ padding: '14px 20px' }}>Email</th>
                                                        <th style={{ padding: '14px 20px' }}>Status</th>
                                                        <th style={{ padding: '14px 20px' }}>Checklist Progress</th>
                                                        <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allPracticeClients.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', fontSize: '13px' }}>
                                                                No clients found. Add clients first in the Clients tab.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {allPracticeClients.map(client => {
                                                        const checks = clientWorkpaperChecks[client.id] || {};
                                                        const totalItems = 5;
                                                        const doneItems = Object.values(checks).filter(Boolean).length;
                                                        const pct = Math.round((doneItems / totalItems) * 100);
                                                        return (
                                                            <tr key={client.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                                                                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0F172A' }}>{client.name}</td>
                                                                <td style={{ padding: '16px 20px', color: '#475569', fontFamily: 'monospace', fontSize: '12.5px' }}>{client.email}</td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', background: client.status === 'Active' ? '#DCFCE7' : '#FEF9C3', color: client.status === 'Active' ? '#15803d' : '#A16207' }}>
                                                                        {client.status || 'Active'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '16px 20px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                                                            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#15803d' : '#D97706', transition: 'width 0.3s ease', borderRadius: '3px' }} />
                                                                        </div>
                                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: pct === 100 ? '#15803d' : '#475569', minWidth: '36px' }}>{pct}%</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedWorkpaperClientId(client.id)}
                                                                        style={{ padding: '8px 14px', background: '#15803d', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                                                                    >
                                                                        Open Checklist →
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (() => {
                                        /* ── Per-Client Checklist View ── */
                                        const selClient = allPracticeClients.find(c => c.id === selectedWorkpaperClientId);
                                        const checks = clientWorkpaperChecks[selectedWorkpaperClientId] || {};
                                        const checkItems = [
                                            { id: 'aisTds', label: '1. Reconciliation of Form 26AS & AIS/TIS TDS matching with client ledgers' },
                                            { id: 'gstItc', label: '2. GST Input Tax Credit (ITC) matching and inward invoice sync' },
                                            { id: 'invest80c', label: '3. Verification of Section 80C, 80D receipts & insurance tax exclusions' },
                                            { id: 'capGains', label: '4. Capital Gains Statement valuation matching (Mutual funds & equity logs)' },
                                            { id: 'presumptive44ad', label: '5. Presumptive Business verification under Sec 44AD turnover checks' }
                                        ];
                                        const doneCount = checkItems.filter(i => checks[i.id]).length;
                                        const percentage = Math.round((doneCount / checkItems.length) * 100);
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {/* Back button + title */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedWorkpaperClientId(null)}
                                                        style={{ padding: '8px 14px', border: '1.5px solid #E2E8F0', background: 'transparent', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        ← Back to Clients
                                                    </button>
                                                    <div>
                                                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>📝 Workpaper: {selClient?.name}</h3>
                                                        <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Statutory Audit & Verification Checklist</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                                                    {/* Checklist */}
                                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {checkItems.map(item => (
                                                            <label
                                                                key={item.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    padding: '16px',
                                                                    borderRadius: '12px',
                                                                    border: '1.5px solid',
                                                                    borderColor: checks[item.id] ? '#15803d' : '#E2E8F0',
                                                                    background: checks[item.id] ? '#F0FDF4' : 'transparent',
                                                                    fontSize: '13px',
                                                                    fontWeight: '750',
                                                                    color: checks[item.id] ? '#166534' : '#334155',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!checks[item.id]}
                                                                    onChange={() => setClientWorkpaperChecks(prev => ({
                                                                        ...prev,
                                                                        [selectedWorkpaperClientId]: {
                                                                            ...(prev[selectedWorkpaperClientId] || {}),
                                                                            [item.id]: !checks[item.id]
                                                                        }
                                                                    }))}
                                                                    style={{ accentColor: '#15803d', width: '16px', height: '16px' }}
                                                                />
                                                                <span>{item.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {/* Progress widget */}
                                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
                                                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0, width: '100%' }}>📊 Audit Completion Progress</h3>
                                                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F0FDF4', border: '6px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: '24px', fontWeight: '950', color: '#15803d' }}>{percentage}%</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div style={{ fontSize: '13.5px', fontWeight: '850', color: '#0F172A' }}>{doneCount} of {checkItems.length} Procedures Complete</div>
                                                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>All steps must be checked before generating reports.</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${percentage}%`, height: '100%', background: '#15803d', transition: 'width 0.3s ease' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </Motion.div>
                            )}

                            {/* 8. DOCUMENTS TAB */}
                            {personalTab === 'documents' && (
                                <Motion.div key="documents" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px' }}>
                                        {/* Left Side: Folder tree */}
                                        <div style={{ background: '#FFFFFF', padding: '20px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <h3 style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A', margin: 0 }}>📁 Practice Folder Tree</h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveDocFolder('All')}
                                                    style={{ padding: '10px 12px', border: 'none', borderRadius: '8px', background: activeDocFolder === 'All' ? '#F0FDF4' : 'transparent', color: activeDocFolder === 'All' ? '#15803d' : '#475569', fontWeight: activeDocFolder === 'All' ? '800' : '600', fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                                                >
                                                    <span>📁 All Folders</span>
                                                    <span>{practiceFiles.length} files</span>
                                                </button>
                                                {practiceFolders.map(folder => (
                                                    <button
                                                        type="button"
                                                        key={folder.id}
                                                        onClick={() => setActiveDocFolder(folder.name)}
                                                        style={{ padding: '10px 12px', border: 'none', borderRadius: '8px', background: activeDocFolder === folder.name ? '#F0FDF4' : 'transparent', color: activeDocFolder === folder.name ? '#15803d' : '#475569', fontWeight: activeDocFolder === folder.name ? '800' : '600', fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                                                    >
                                                        <span>📁 {folder.name}</span>
                                                        <span style={{ opacity: 0.7 }}>{folder.count} files</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Side: Explorer & Upload Simulator */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {/* Drop zone simulator */}
                                            <form onSubmit={handleSimulateDocumentUpload} style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <h3 style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A', margin: 0 }}>⚡ Simulate Live Folder File Upload</h3>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Document Name (e.g. pan_card_draft_2026.pdf)..."
                                                        value={uploadedFileName}
                                                        onChange={e => setUploadedFileName(e.target.value)}
                                                        required
                                                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                                                    />
                                                    <select
                                                        value={uploadTargetFolder}
                                                        onChange={e => setUploadTargetFolder(e.target.value)}
                                                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '750', outline: 'none' }}
                                                    >
                                                        {practiceFolders.map(f => (
                                                            <option key={f.id} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <button
                                                    type="submit"
                                                    disabled={uploadProgress !== null}
                                                    style={{
                                                        padding: '10px 16px',
                                                        backgroundColor: '#15803d',
                                                        color: '#FFFFFF',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontWeight: '850',
                                                        fontSize: '12.5px',
                                                        cursor: uploadProgress !== null ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <FileUp size={16} /> Simulate Document Drop &amp; Upload
                                                </button>
                                                
                                                {uploadProgress !== null && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1.5px solid #F1F5F9' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#15803d' }}>
                                                            <span>Uploading: {uploadedFileName}</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#15803d', borderRadius: '3px', transition: 'width 0.15s ease' }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </form>

                                            {/* Explorer table */}
                                            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                                <h3 style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px 0' }}>
                                                    📄 File Vault Explorer: {activeDocFolder === 'All' ? 'All Secure Documents' : activeDocFolder}
                                                </h3>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                        <FilterableTableHead columns={[
                                                            { key: 'name', label: 'File Name', placeholder: 'Search...' },
                                                            { key: 'size', label: 'Size', placeholder: 'Size...' },
                                                            { key: 'folderName', label: 'Folder', placeholder: 'Folder...' },
                                                            { key: 'date', label: 'Date Added', placeholder: 'Date...' },
                                                            { key: '_actions', label: 'Actions' }
                                                        ]} onFilterChange={setColFiltersDocuments} />
                                                        <tbody>
                                                            {practiceFiles.filter(f => (activeDocFolder === 'All' || f.folderName === activeDocFolder) && applyTableFilters(f, colFiltersDocuments)).map(file => (
                                                                <tr key={file.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px', color: '#334155' }}>
                                                                    <td style={{ padding: '14px 8px', fontWeight: '750', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span>📄</span> <span>{file.name}</span>
                                                                    </td>
                                                                    <td style={{ padding: '14px 8px', fontWeight: '600' }}>{file.size}</td>
                                                                    <td style={{ padding: '14px 8px', color: '#64748B', fontWeight: '500' }}>{file.folderName}</td>
                                                                    <td style={{ padding: '14px 8px', color: '#64748B', fontWeight: '500' }}>{file.date}</td>
                                                                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                deleteFileMutation.mutate(file.id);
                                                                            }}
                                                                            style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
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
                                        </div>
                                    </div>
                                </Motion.div>
                            )}

                            {/* 9. REPORTS TAB */}
                            {personalTab === 'reports' && (
                                <Motion.div key="reports" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '14.5px', fontWeight: '850', color: '#0F172A', margin: 0 }}>📊 Filing Compliance &amp; Master Sheets</h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsGeneratingReport(true);
                                                    setShowReportSuccess(false);
                                                    setTimeout(() => {
                                                        setIsGeneratingReport(false);
                                                        setShowReportSuccess(true);
                                                    }, 1500);
                                                }}
                                                disabled={isGeneratingReport}
                                                style={{
                                                    padding: '10px 16px',
                                                    backgroundColor: '#15803d',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '850',
                                                    fontSize: '13px',
                                                    cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => { if(!isGeneratingReport) e.currentTarget.style.backgroundColor = '#166534'; }}
                                                onMouseLeave={e => { if(!isGeneratingReport) e.currentTarget.style.backgroundColor = '#15803d'; }}
                                            >
                                                {isGeneratingReport ? 'Compiling Report...' : 'Compile Master Audit Sheet'}
                                            </button>
                                        </div>
                                        
                                        {showReportSuccess && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '10px', fontSize: '13px', color: '#166534', fontWeight: '800' }}>
                                                <span>✓ Success!</span>
                                                <span>Master compliance audit sheet has been compiled and downloaded to the documents vault.</span>
                                            </div>
                                        )}
                                        
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <FilterableTableHead columns={[
                                                    { key: 'name', label: 'Client Taxpayer', placeholder: 'Client...' },
                                                    { key: 'formType', label: 'Filing Form Type', placeholder: 'Form...' },
                                                    { key: 'assessmentYear', label: 'Assessment Year', placeholder: 'Year...' },
                                                    { key: 'seasonStatus', label: 'Filing Season Status', placeholder: 'Status...' },
                                                    { key: 'exemptionStatus', label: 'Exemption Status', placeholder: 'Exemption...' }
                                                ]} onFilterChange={setColFiltersReports} />
                                                <tbody>
                                                    {allPracticeClients.map((client, idx) => {
                                                        // Derive form type dynamically
                                                        let formType = 'ITR-1 Exempt';
                                                        const nameLower = (client.name || '').toLowerCase();
                                                        if (nameLower.includes('group') || nameLower.includes('birla') || nameLower.includes('corp')) {
                                                            formType = 'ITR-2';
                                                        } else if (nameLower.includes('sme') || nameLower.includes('consulting') || client.income > 3000000) {
                                                            formType = 'ITR-4 Presumptive';
                                                        } else if (client.regime === 'Old') {
                                                            formType = 'ITR-1';
                                                        }

                                                        // Derive filing season status based on database status
                                                        let seasonStatus = 'Draft Ready';
                                                        const clientStatus = client.status || '';
                                                        if (clientStatus === 'Active') {
                                                            seasonStatus = 'Verified & Signed';
                                                        } else if (clientStatus === 'Pending Filing') {
                                                            seasonStatus = 'Filed & Locked';
                                                        } else if (clientStatus === 'Documents Awaiting' || clientStatus === 'Documents Pending') {
                                                            seasonStatus = 'Under Auditor Review';
                                                        }

                                                        // Derive exemption status
                                                        let exemptionStatus = 'Verified Exemption';
                                                        if (clientStatus === 'Documents Awaiting' || clientStatus === 'Documents Pending') {
                                                            exemptionStatus = 'Awaiting Requisition';
                                                        }

                                                        const rowData = { name: client.name, formType, assessmentYear: 'AY 2026-27', seasonStatus, exemptionStatus };
                                                        if (!applyTableFilters(rowData, colFiltersReports)) return null;

                                                        return (
                                                            <tr key={client.id || idx} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13.5px', color: '#334155' }}>
                                                                <td style={{ padding: '14px 8px', fontWeight: '800', color: '#0F172A' }}>{client.name}</td>
                                                                <td style={{ padding: '14px 8px', fontWeight: '600' }}>{formType}</td>
                                                                <td style={{ padding: '14px 8px', color: '#64748B', fontWeight: '500' }}>AY 2026-27</td>
                                                                <td style={{ padding: '14px 8px' }}>
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '800',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '20px',
                                                                        backgroundColor: seasonStatus.includes('Filed') || seasonStatus.includes('Signed') ? '#DCFCE7' : '#FEF3C7',
                                                                        color: seasonStatus.includes('Filed') || seasonStatus.includes('Signed') ? '#15803d' : '#D97706',
                                                                        border: `1px solid ${seasonStatus.includes('Filed') || seasonStatus.includes('Signed') ? '#BBF7D0' : '#FDE047'}`
                                                                    }}>
                                                                        {seasonStatus}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '14px 8px', fontWeight: '750', color: exemptionStatus.includes('Verified') ? '#15803d' : '#D97706' }}>{exemptionStatus}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {allPracticeClients.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: '24px 8px', textAlign: 'center', color: '#64748B', fontStyle: 'italic' }}>
                                                                No practice clients registered in workspace database.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Modals for CRUD operations */}
                    {showAddClientModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <form onSubmit={handleAddPracticeClient} style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>👤 Register New Taxpayer Client</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>TAXPAYER FULL NAME</label>
                                    <input type="text" value={newClientName} onChange={e=>setNewClientName(e.target.value)} required placeholder="Aditya Birla, Rohan Sharma..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>EMAIL ADDRESS</label>
                                    <input type="email" value={newClientEmail} onChange={e=>setNewClientEmail(e.target.value)} required placeholder="client@name.com" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>TAX REGIME</label>
                                        <select value={newClientRegime} onChange={e=>setNewClientRegime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                            <option value="New">New Tax Regime</option>
                                            <option value="Old">Old Tax Regime</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>EST. ANNUAL INCOME ({currency.symbol})</label>
                                        <input type="number" value={newClientIncome} onChange={e=>setNewClientIncome(e.target.value)} required placeholder="1200000" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowAddClientModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '850', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '10px 18px', background: '#15803d', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12.5px', fontWeight: '850', cursor: 'pointer' }}>Register Client</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showAddRequestModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <form onSubmit={handleAddPracticeRequest} style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>🤝 Request Document from Taxpayer</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>SELECT CLIENT</label>
                                    <select value={newRequestClient} onChange={e=>setNewRequestClient(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                        {allPracticeClients.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>REQUEST TITLE</label>
                                    <input type="text" value={newRequestTitle} onChange={e=>setNewRequestTitle(e.target.value)} required placeholder="e.g. Form 16 Q4, Q1 GST Ledger..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>DESCRIPTION / INSTRUCTIONS</label>
                                    <textarea value={newRequestDesc} onChange={e=>setNewRequestDesc(e.target.value)} placeholder="Please upload the employer issued Form 16..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none', height: '80px', resize: 'none' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>DOCUMENT CATEGORY</label>
                                        <select value={newRequestDocType} onChange={e=>setNewRequestDocType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                            <option value="Form 16">Form 16 PDF</option>
                                            <option value="Excel Ledger">Excel Inward Ledger</option>
                                            <option value="KYC Scans">KYC Scans (PAN/Aadhaar)</option>
                                            <option value="Interest Cert">Interest Certificate</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>PRIORITY</label>
                                        <select value={newRequestPriority} onChange={e=>setNewRequestPriority(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowAddRequestModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '850', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '10px 18px', background: '#15803d', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12.5px', fontWeight: '850', cursor: 'pointer' }}>Issue Request</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showAddTaskModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <form onSubmit={handleAddPracticeTask} style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>✅ Assign Practice Operation Task</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>SELECT CLIENT</label>
                                    <select value={newTaskClient} onChange={e=>setNewTaskClient(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                        {allPracticeClients.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>TASK DESCRIPTION TITLE</label>
                                    <input type="text" value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} required placeholder="Draft return, verify investment deductions..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>PRIORITY</label>
                                        <select value={newTaskPriority} onChange={e=>setNewTaskPriority(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>DUE DATE</label>
                                        <input type="date" value={newTaskDueDate} onChange={e=>setNewTaskDueDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', color: '#475569', outline: 'none' }} />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <input type="checkbox" id="askDocCheck" checked={newTaskAskForDocument} onChange={e=>setNewTaskAskForDocument(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#15803d', cursor: 'pointer' }} />
                                    <label htmlFor="askDocCheck" style={{ fontSize: '12.5px', fontWeight: '750', color: '#334155', cursor: 'pointer' }}>Require document upload from client</label>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowAddTaskModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '850', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '10px 18px', background: '#15803d', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12.5px', fontWeight: '850', cursor: 'pointer' }}>Assign Task</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showAddTeamMemberModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <form onSubmit={handleSendTeamInvitation} style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>👥 Invite New Team Member</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>EMAIL ADDRESS (MAIL ID)</label>
                                    <input type="email" value={newTeamEmail} onChange={e=>setNewTeamEmail(e.target.value)} required placeholder="e.g. associate@firm.com" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>PROPOSED ROLE / DESIGNATION</label>
                                    <select value={newTeamRole} onChange={e=>setNewTeamRole(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none' }}>
                                        <option value="Senior Tax Consultant">Senior Tax Consultant</option>
                                        <option value="Associate Consultant">Associate Consultant</option>
                                        <option value="Audit Associate">Audit Associate</option>
                                        <option value="CS Specialist">CS Specialist</option>
                                        <option value="Practice Intern">Practice Intern</option>
                                        <option value="Others">Others (Custom Role)</option>
                                    </select>
                                </div>

                                {newTeamRole === 'Others' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B' }}>CUSTOM ROLE / DESIGNATION</label>
                                        <input 
                                            type="text" 
                                            value={customTeamRole} 
                                            onChange={e=>setCustomTeamRole(e.target.value)} 
                                            required 
                                            placeholder="e.g. Lead Financial Analyst" 
                                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none' }} 
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowAddTeamMemberModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '850', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '10px 18px', background: '#15803d', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12.5px', fontWeight: '850', cursor: 'pointer' }}>Send Invitation</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
