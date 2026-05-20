import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, ShieldAlert, FileText, CheckCircle2, AlertTriangle, 
    RefreshCw, Globe, ArrowLeftRight, Landmark, Calendar, Clock, 
    UserCheck, ChevronRight, Layers, FileCheck, HelpCircle, TrendingUp, Plus, Search, Building
} from 'lucide-react';

export default function BusinessCA() {
    const [activeTab, setActiveTab] = useState('auditor'); // auditor | ca_cpa | cs_vault | consultant

    // Module 1: Auditor Hub States
    const [accountingStandard, setAccountingStandard] = useState('IFRS'); // IFRS | GAAP
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanResults, setScanResults] = useState(null);

    // Module 2: CA / CPA Module States
    const [jurisdiction, setJurisdiction] = useState('IN'); // IN | US
    const [syncingState, setSyncingState] = useState('idle'); // idle | connecting | validating | pushing | success

    // Module 3: CS Vault States
    const [resolutions, setResolutions] = useState([
        { id: 1, title: "Adoption of Annual Financial Statements", type: "Ordinary", status: "Approved", date: "2026-05-10" },
        { id: 2, title: "Appointment of Statutory Auditors", type: "Ordinary", status: "Approved", date: "2026-05-12" },
        { id: 3, title: "Authorization of Related Party Transactions", type: "Special", status: "Pending Approval", date: "2026-05-18" }
    ]);
    const [newResolutionTitle, setNewResolutionTitle] = useState('');
    const [newResolutionType, setNewResolutionType] = useState('Ordinary');

    // Module 4: Consultant Desk States
    const [clients, setClients] = useState([
        { id: 101, name: "Apex Technologies Pvt Ltd", industry: "SaaS & Software", status: "Active", risk: "Low", revenue: "$450K" },
        { id: 102, name: "Global Trade Logistics Inc", industry: "Supply Chain", status: "Active", risk: "Medium", revenue: "$1.2M" },
        { id: 103, name: "Vanguard Retail Ventures", industry: "E-Commerce", status: "Pending Audit", risk: "High", revenue: "$890K" },
        { id: 104, name: "Zenith Real Estate Group", industry: "Real Estate", status: "Active", risk: "Low", revenue: "$3.1M" }
    ]);
    const [selectedClient, setSelectedClient] = useState(101);
    const [forecastPeriod, setForecastPeriod] = useState(6); // months

    // Dynamic scan animation helper
    const triggerComplianceScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanResults(null);
    };

    useEffect(() => {
        let timer;
        if (isScanning && scanProgress < 100) {
            timer = setTimeout(() => setScanProgress(p => p + 10), 200);
        } else if (isScanning && scanProgress === 100) {
            setIsScanning(false);
            setScanResults({
                amlScore: "98.5% Compliant",
                anomaliesFound: 2,
                itemsChecked: 1450,
                flaggedExpenses: [
                    { id: 1, desc: "Unvouched Travel reimbursement to Board", amount: "$4,250", type: "Slight Anomaly" },
                    { id: 2, desc: "Uncategorized Cash outflow to offshore entity", amount: "$15,000", type: "High Risk spike" }
                ]
            });
        }
        return () => clearTimeout(timer);
    }, [isScanning, scanProgress]);

    // Dynamic portal sync animation helper
    const triggerPortalSync = () => {
        setSyncingState('connecting');
        setTimeout(() => {
            setSyncingState('validating');
            setTimeout(() => {
                setSyncingState('pushing');
                setTimeout(() => {
                    setSyncingState('success');
                }, 1500);
            }, 1500);
        }, 1200);
    };

    const handleAddResolution = (e) => {
        e.preventDefault();
        if (!newResolutionTitle.trim()) return;
        const newRes = {
            id: resolutions.length + 1,
            title: newResolutionTitle,
            type: newResolutionType,
            status: "Pending Approval",
            date: new Date().toISOString().split('T')[0]
        };
        setResolutions([newRes, ...resolutions]);
        setNewResolutionTitle('');
    };

    const activeClientData = clients.find(c => c.id === selectedClient) || clients[0];

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#F8FAFC', minHeight: '85vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Command Centre Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#FFFDF0', border: '1px solid #FDE047', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            CA Command Centre <span style={{ fontSize: '11px', fontWeight: '900', color: '#B8860B', background: '#FFFDF0', border: '1px solid #FDE047', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Professional Layer</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginTop: '2px' }}>Enterprise Audit, Compliance & Advisory Workspace</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                    <button onClick={() => setActiveTab('auditor')} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '750', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'auditor' ? '#FFFFFF' : 'transparent', color: activeTab === 'auditor' ? '#B8860B' : '#64748B', boxShadow: activeTab === 'auditor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>📊 Auditor Hub</button>
                    <button onClick={() => setActiveTab('ca_cpa')} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '750', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'ca_cpa' ? '#FFFFFF' : 'transparent', color: activeTab === 'ca_cpa' ? '#B8860B' : '#64748B', boxShadow: activeTab === 'ca_cpa' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>🏛️ Tax Engine</button>
                    <button onClick={() => setActiveTab('cs_vault')} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '750', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'cs_vault' ? '#FFFFFF' : 'transparent', color: activeTab === 'cs_vault' ? '#B8860B' : '#64748B', boxShadow: activeTab === 'cs_vault' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>🔒 CS Vault</button>
                    <button onClick={() => setActiveTab('consultant')} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '750', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'consultant' ? '#FFFFFF' : 'transparent', color: activeTab === 'consultant' ? '#B8860B' : '#64748B', boxShadow: activeTab === 'consultant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>💼 Consultant Desk</button>
                </div>
            </div>

            {/* Main Area with recommended sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '3.1fr 1fr', gap: '24px', alignItems: 'start', width: '100%' }}>
                
                {/* Left Column: Interactive Workspace */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'auditor' && (
                            <Motion.div key="auditor" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {/* Cross-Border Standards Toggler */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Cross-Border Auditing</h3>
                                            <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: '20px', fontWeight: '750', border: '1px solid #BBF7D0' }}>Active Standard</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Select the accounting pipeline architecture required for auditing cross-border files automatically matching corporate base tokens.</p>
                                        
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={() => setAccountingStandard('IFRS')} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '800', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: accountingStandard === 'IFRS' ? '#B8860B' : '#E2E8F0', background: accountingStandard === 'IFRS' ? '#FFFDF0' : 'transparent', color: accountingStandard === 'IFRS' ? '#B8860B' : '#475569' }}>
                                                IFRS (Global GAAP)
                                            </button>
                                            <button onClick={() => setAccountingStandard('GAAP')} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '800', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: accountingStandard === 'GAAP' ? '#B8860B' : '#E2E8F0', background: accountingStandard === 'GAAP' ? '#FFFDF0' : 'transparent', color: accountingStandard === 'GAAP' ? '#B8860B' : '#475569' }}>
                                                US GAAP (GAAP-US)
                                            </button>
                                        </div>

                                        <div style={{ padding: '12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
                                            <strong>Rules Applied:</strong> {accountingStandard === 'IFRS' ? 'Fair value measurements, principles-based reporting, and dynamic presentation mapping.' : 'Rules-based framework, LIFO inventory allowance, and explicit segment disclosures.'}
                                        </div>
                                    </div>

                                    {/* Compliance Check Engine */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>One-Click Compliance Check</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Instantly parse client transactional data feeds to verify AML status, tax reconciliation matching, and systemic compliance parameters.</p>

                                        <button onClick={triggerComplianceScan} disabled={isScanning} style={{ padding: '12px', background: '#1E293B', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s', opacity: isScanning ? 0.7 : 1 }}>
                                            {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <FileCheck size={16} />}
                                            {isScanning ? `Scanning Transaction Feed (${scanProgress}%)` : "Run Compliance Scanner"}
                                        </button>

                                        {isScanning && (
                                            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${scanProgress}%`, height: '100%', background: '#D4AF37', transition: 'width 0.2s' }} />
                                            </div>
                                        )}

                                        {scanResults && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                                                    <span>Audit Coverage: <strong>{scanResults.itemsChecked}</strong> records</span>
                                                    <span style={{ color: '#16A34A', fontWeight: '700' }}>{scanResults.amlScore}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Fraud & Anomaly Visualizer */}
                                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ShieldAlert style={{ color: '#EF4444' }} size={20} />
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>AI Anomaly & Fraud Detection</h3>
                                        </div>
                                        <span style={{ fontSize: '11px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', padding: '3px 10px', borderRadius: '20px', fontWeight: '750' }}>Real-time Monitoring Active</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '16px' }}>
                                        <div style={{ padding: '16px', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#D97706' }}>2</div>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#B45309' }}>Anomalies Flagged this Cycle</div>
                                            <p style={{ fontSize: '11px', color: '#D97706', lineHeight: '1.5' }}>Transactions flagged with high variance scores compared to the past 12-month client behavioral index.</p>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {scanResults ? (
                                                scanResults.flaggedExpenses.map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px' }}>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: '750', color: '#991B1B' }}>{item.desc}</div>
                                                                <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600', marginTop: '2px' }}>{item.type}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#991B1B' }}>{item.amount}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #E2E8F0', borderRadius: '10px', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>
                                                    Click "Run Compliance Scanner" to run the anomaly detection module.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}

                        {activeTab === 'ca_cpa' && (
                            <Motion.div key="ca_cpa" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                    {/* Jurisdiction Toggle */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Dynamic Jurisdiction Engine</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Instantly maps legal and tax system properties dynamically based on the client profile's geo-jurisdiction.</p>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button onClick={() => setJurisdiction('IN')} style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', fontSize: '13px', fontWeight: '850', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: jurisdiction === 'IN' ? '#B8860B' : '#E2E8F0', background: jurisdiction === 'IN' ? '#FFFDF0' : 'transparent', color: jurisdiction === 'IN' ? '#B8860B' : '#475569' }}>
                                                <span>🇮🇳 India Jurisdiction</span>
                                                <span>GST, TDS &amp; Income Tax</span>
                                            </button>
                                            <button onClick={() => setJurisdiction('US')} style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', fontSize: '13px', fontWeight: '850', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', borderColor: jurisdiction === 'US' ? '#B8860B' : '#E2E8F0', background: jurisdiction === 'US' ? '#FFFDF0' : 'transparent', color: jurisdiction === 'US' ? '#B8860B' : '#475569' }}>
                                                <span>🇺🇸 United States Jurisdiction</span>
                                                <span>IRS &amp; State Sales Tax</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Tax System View */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                Active System Calculations - {jurisdiction === 'IN' ? 'India (GST/TDS)' : 'United States (IRS)'}
                                            </h3>
                                            <span style={{ fontSize: '12px', fontWeight: '750', color: '#B8860B' }}>FY 2026-27</span>
                                        </div>

                                        {jurisdiction === 'IN' ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>GSTR-1 Status</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Ready to File</div>
                                                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>INR 42,500 ITC Auto-matched</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>TDS Section 194C</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Computed</div>
                                                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '600', marginTop: '4px' }}>2% Standard rate applied</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Corporate Income Tax</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>25.17% Matched</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '4px' }}>Under Sec 115BAA</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>IRS Form 1120</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Draft Formed</div>
                                                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>21% Federal Flat Rate</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>State Franchise Tax</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Delaware Franchise</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '4px' }}>Min Liability calculated</div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>State Sales Tax</div>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>Calculated</div>
                                                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '600', marginTop: '4px' }}>Multi-state nexus active</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Direct E-Filing Portal Integration */}
                                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Landmark size={20} style={{ color: '#B8860B' }} />
                                            Direct Portal Integration Engine
                                        </h3>
                                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>API Gateway Version: v1.4.2</span>
                                    </div>

                                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Configure secure credentials and directly upload certified draft returns to government servers (such as India's MCA/IT portal or international IRS/State tax registries) with 256-bit encryption compliance.</p>

                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <button onClick={triggerPortalSync} disabled={syncingState !== 'idle' && syncingState !== 'success'} style={{ padding: '12px 24px', background: '#B8860B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                        <span style={{ fontSize: '11px', background: '#FFFDF0', border: '1px solid #FDE047', color: '#B8860B', padding: '3px 10px', borderRadius: '20px', fontWeight: '750' }}>CS Governance Module</span>
                                    </div>

                                    <form onSubmit={handleAddResolution} style={{ display: 'flex', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Enter new Resolution description (e.g. Appointment of directors)..." 
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
                                        <button type="submit" style={{ flex: 1, background: '#B8860B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                    
                                    {/* Multi-Tenant Client Portfolio */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Client Portfolio Management</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>Switch seamlessly between 50+ business entities under your management desk without data token crossover.</p>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                            {clients.map(c => (
                                                <button 
                                                    key={c.id} 
                                                    onClick={() => setSelectedClient(c.id)}
                                                    style={{ 
                                                        width: '100%', padding: '12px', borderRadius: '10px', textAlign: 'left',
                                                        border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
                                                        borderColor: selectedClient === c.id ? '#B8860B' : '#E2E8F0',
                                                        background: selectedClient === c.id ? '#FFFDF0' : 'transparent',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: '800', color: selectedClient === c.id ? '#B8860B' : '#0F172A' }}>{c.name}</span>
                                                        <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: '750' }}>{c.status}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748B' }}>
                                                        <span>{c.industry}</span>
                                                        <span>Revenue: <strong>{c.revenue}</strong></span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Financial Forecasting Engine */}
                                    <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                Cash Flow &amp; Financial Forecasting Desk
                                            </h3>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => setForecastPeriod(3)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 3 ? '#B8860B' : '#FFFFFF', color: forecastPeriod === 3 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>3M</button>
                                                <button onClick={() => setForecastPeriod(6)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 6 ? '#B8860B' : '#FFFFFF', color: forecastPeriod === 6 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>6M</button>
                                                <button onClick={() => setForecastPeriod(12)} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', background: forecastPeriod === 12 ? '#B8860B' : '#FFFFFF', color: forecastPeriod === 12 ? '#FFFFFF' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}>12M</button>
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
                                                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>${predictedValue}K</div>
                                                        <div style={{ 
                                                            width: '100%', 
                                                            height: `${barHeightPercent}%`, 
                                                            background: 'linear-gradient(180deg, #D4AF37 0%, #B8860B 100%)', 
                                                            borderRadius: '6px 6px 0 0',
                                                            boxShadow: '0 2px 4px rgba(184, 134, 11, 0.25)',
                                                            transition: 'height 0.3s ease-out'
                                                        }} />
                                                        <div style={{ fontSize: '9px', fontWeight: '750', color: '#64748B', marginTop: '6px' }}>M{idx + 1}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Recommended CA Features Checklist */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', 
                    background: '#FFFFFF', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    border: '1px solid #E2E8F0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    position: 'sticky',
                    top: '24px'
                }}>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Layers size={18} style={{ color: '#B8860B' }} />
                            Features You May Need
                        </h3>
                        <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>Quick access coordinates to crucial professional tools.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* 1. Compliance Scanner */}
                        <div 
                            onClick={() => {
                                setActiveTab('auditor');
                                triggerComplianceScan();
                            }}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '12px', 
                                border: '1.5px solid #F1F5F9', 
                                background: '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D4AF37';
                                e.currentTarget.style.background = '#FFFDF0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#F1F5F9';
                                e.currentTarget.style.background = '#F8FAFC';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <FileCheck size={16} style={{ color: '#B8860B' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>1. Compliance Scanner</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Validate GST/tax</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Detect missing invoices</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Match transactions</span>
                            </div>
                        </div>

                        {/* 2. Fraud Detection */}
                        <div 
                            onClick={() => setActiveTab('auditor')}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '12px', 
                                border: '1.5px solid #F1F5F9', 
                                background: '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D4AF37';
                                e.currentTarget.style.background = '#FFFDF0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#F1F5F9';
                                e.currentTarget.style.background = '#F8FAFC';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <ShieldAlert size={16} style={{ color: '#EF4444' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>2. Fraud Detection</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Large unusual transactions</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Duplicate invoices</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Offshore transfers</span>
                            </div>
                        </div>

                        {/* 3. Tax Engine */}
                        <div 
                            onClick={() => setActiveTab('ca_cpa')}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '12px', 
                                border: '1.5px solid #F1F5F9', 
                                background: '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D4AF37';
                                e.currentTarget.style.background = '#FFFDF0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#F1F5F9';
                                e.currentTarget.style.background = '#F8FAFC';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Landmark size={16} style={{ color: '#B8860B' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>3. Tax Engine</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• GST calculations</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• IFRS / US GAAP logic</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Tax reports</span>
                            </div>
                        </div>

                        {/* 4. Auditor Hub */}
                        <div 
                            onClick={() => setActiveTab('auditor')}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '12px', 
                                border: '1.5px solid #F1F5F9', 
                                background: '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D4AF37';
                                e.currentTarget.style.background = '#FFFDF0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#F1F5F9';
                                e.currentTarget.style.background = '#F8FAFC';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Briefcase size={16} style={{ color: '#B8860B' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>4. Auditor Hub</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Download reports</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• View financial summaries</span>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>• Audit history</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
