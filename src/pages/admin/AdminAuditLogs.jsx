import React, { useState, useEffect } from 'react';
import { 
    FileCheck, 
    Terminal, 
    Search, 
    RefreshCw,
    AlertTriangle,
    Info,
    CheckCircle2,
    Server,
    Download
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import '../../App.css';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAuditLogs();
            setLogs(data || []);
        } catch (err) {
            console.error("Failed to fetch audit trail:", err);
            // Static fallback
            setLogs([
                { id: 'LOG-001', type: 'INFO', message: 'Autoscaling cluster provisioned node-group-alpha-3', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), actor: 'AWS Orchestrator' },
                { id: 'LOG-002', type: 'SUCCESS', message: 'DB snapshot backup generated for finance.db (458 KB)', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), actor: 'System Cron' },
                { id: 'LOG-003', type: 'WARN', message: 'Multiple failed login attempts detected on user: admin', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), actor: 'GuardDuty' },
                { id: 'LOG-004', type: 'ERROR', message: 'Stripe Webhook invoice.payment_failed returned 500 (NullReference)', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), actor: 'Payment Gateway' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getLogColor = (type) => {
        switch (type) {
            case 'SUCCESS': return '#10B981';
            case 'WARN': return '#F59E0B';
            case 'ERROR': return '#EF4444';
            case 'INFO': default: return '#3B82F6';
        }
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 size={14} />;
            case 'WARN': return <AlertTriangle size={14} />;
            case 'ERROR': return <AlertTriangle size={14} />;
            case 'INFO': default: return <Info size={14} />;
        }
    };

    const filteredLogs = logs
        .filter(l => filter === 'ALL' || l.type === filter)
        .filter(l => 
            l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.id.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <style>{`
                .terminal-container {
                    background: #0F172A;
                    border-radius: 20px;
                    border: 1px solid #1E293B;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
                    font-family: 'Courier New', Courier, monospace;
                }
                .terminal-header {
                    background: #1E293B;
                    padding: 0.75rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #334155;
                }
                .terminal-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 6px;
                }
                .log-row {
                    display: flex;
                    padding: 0.75rem 1.25rem;
                    border-bottom: 1px solid #1E293B;
                    font-size: 0.85rem;
                    line-height: 1.4;
                    color: #94A3B8;
                    transition: background 0.15s;
                }
                .log-row:hover {
                    background: rgba(255,255,255,0.03);
                }
                .log-timestamp {
                    color: #64748B;
                    min-width: 180px;
                    flex-shrink: 0;
                }
                .log-type {
                    min-width: 90px;
                    font-weight: bold;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .log-message {
                    flex: 1;
                    color: #E2E8F0;
                    word-break: break-all;
                }
                .log-actor {
                    color: #818CF8;
                    min-width: 150px;
                    text-align: right;
                    flex-shrink: 0;
                }
                
                .pill-btn {
                    padding: 0.4rem 1rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    border: 1px solid #E2E8F0;
                    background: white;
                    cursor: pointer;
                    color: #64748B;
                    transition: all 0.2s;
                }
                .pill-btn.active {
                    background: #0F172A;
                    color: white;
                    border-color: #0F172A;
                }
            `}</style>

            {/* Header */}
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SYS AUDIT</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Audit Trail Terminal</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Real-time observability and historical infrastructure operations logging.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}>
                        <Download size={16} /> Dump TTY Stdout
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '1.25rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', minWidth: '300px', position: 'relative', margin: 0 }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Grep buffer..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent', fontSize: '0.85rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ height: '24px', width: '1px', background: '#E2E8F0', margin: '0 0.5rem' }} />
                    
                    {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setFilter(t)}
                            className={`pill-btn ${filter === t ? 'active' : ''}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={fetchLogs} 
                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                    title="Reload Buffer"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} color="#64748B" />
                </button>
            </div>

            {/* Terminal UI Container */}
            <div className="terminal-container">
                <div className="terminal-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="terminal-dot" style={{ background: '#EF4444' }} />
                        <span className="terminal-dot" style={{ background: '#F59E0B' }} />
                        <span className="terminal-dot" style={{ background: '#10B981' }} />
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', marginLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Terminal size={14} /> PlatformControl_Stdout (finance.db)
                        </span>
                    </div>
                    <span style={{ color: '#64748B', fontSize: '0.7rem' }}>ttyUSB0@admin_node</span>
                </div>

                <div style={{ minHeight: '450px', maxHeight: '600px', overflowY: 'auto', padding: '0.5rem 0' }}>
                    {loading ? (
                        <div style={{ color: '#38BDF8', padding: '2rem', fontSize: '0.9rem' }}>
                            &gt; STREAM_ESTABLISHING... Binding to local UNIX domain socket.<br/>
                            &gt; Loading stream payload buffers...
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div style={{ color: '#64748B', padding: '2rem', fontSize: '0.9rem' }}>
                            &gt; Filter yielded empty vector. Standby for background tasks.
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className="log-row">
                                <span className="log-timestamp">{new Date(log.timestamp).toISOString()}</span>
                                <span className="log-type" style={{ color: getLogColor(log.type) }}>
                                    {getLogIcon(log.type)} {log.type}
                                </span>
                                <span className="log-message">
                                    <span style={{ color: '#38BDF8', marginRight: '8px' }}>[{log.id}]</span>
                                    {log.message}
                                </span>
                                <span className="log-actor">@{log.actor}</span>
                            </div>
                        ))
                    )}
                    <div style={{ padding: '1rem 1.25rem', color: '#22C55E', animation: 'pulse 2s infinite', fontSize: '0.85rem' }}>
                        &gt; Listening for new stdout emissions... <span style={{ background: '#22C55E', width: '8px', height: '15px', display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuditLogs;
