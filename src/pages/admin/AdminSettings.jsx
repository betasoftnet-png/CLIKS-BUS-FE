import React, { useState } from 'react';
import { 
    Settings, 
    Database, 
    Server, 
    Key, 
    Lock, 
    RefreshCw, 
    Power, 
    Cpu, 
    Sliders, 
    Save, 
    HardDrive,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import '../../App.css';

const AdminSettings = () => {
    const [features, setFeatures] = useState({
        signupEnabled: true,
        aiAuditing: true,
        instantInvoicing: true,
        betaIntegrations: false,
        maintenanceMode: false
    });

    const toggleFeature = (key) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <style>{`
                .admin-settings-grid {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .settings-nav {
                    background: white;
                    border-radius: 20px;
                    padding: 1rem;
                    border: 1px solid #E2E8F0;
                    height: fit-content;
                }
                .settings-nav-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: #64748B;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                }
                .settings-nav-item.active {
                    background: #F1F5F9;
                    color: #4F46E5;
                }
                .settings-nav-item:hover:not(.active) {
                    background: #F8FAFC;
                    color: #334155;
                }
                .settings-panel {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #E2E8F0;
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
                }
                .setting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 0;
                    border-bottom: 1px solid #F1F5F9;
                }
                .setting-row:last-child {
                    border-bottom: none;
                }
                
                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #E2E8F0;
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px; width: 18px;
                    left: 3px; bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #4F46E5;
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
                
                .danger-zone {
                    border: 1px dashed #FCA5A5;
                    border-radius: 16px;
                    background: #FEF2F2;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
            `}</style>

            {/* Header */}
            <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>INFRASTRUCTURE OVERRIDES</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Global Engine Parameters</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Control global platform behavior, throttling coefficients, and maintenance toggles.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
                        <Save size={18} /> Propagate Changes
                    </button>
                </div>
            </div>

            <div className="admin-settings-grid">
                {/* Left Nav */}
                <div className="settings-nav">
                    <button className="settings-nav-item active"><Sliders size={18} /> Feature Switches</button>
                    <button className="settings-nav-item"><Server size={18} /> DB Scaling</button>
                    <button className="settings-nav-item"><Key size={18} /> Third-Party Keys</button>
                    <button className="settings-nav-item"><Lock size={18} /> Security Headers</button>
                    <button className="settings-nav-item"><HardDrive size={18} /> Cache Purges</button>
                </div>

                {/* Right Content */}
                <div className="settings-panel">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sliders size={20} color="#4F46E5" /> Global Feature Flags</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        
                        <div className="setting-row">
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Open Registration Matrix</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Allowing new businesses to complete landing onboarding independently.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={features.signupEnabled} onChange={() => toggleFeature('signupEnabled')} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-row">
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Enable LLM-Driven Deep Audit</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Triggers automated LLM transaction oversight for Premium users.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={features.aiAuditing} onChange={() => toggleFeature('aiAuditing')} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-row">
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Realtime Invoicing Engine</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Force PDF invoice rendering immediately on WebSocket confirmation.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={features.instantInvoicing} onChange={() => toggleFeature('instantInvoicing')} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-row">
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expose Beta API Add-ons</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Makes experimental external CRM sinks visible in customization toggles.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={features.betaIntegrations} onChange={() => toggleFeature('betaIntegrations')} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Infrastructure Tuning */}
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={20} color="#4F46E5" /> Resource Thresholds</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>API Throttle Limits</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#4F46E5' }}>1,200 / min</span>
                            </div>
                            <input type="range" min="500" max="5000" defaultValue="1200" style={{ width: '100%', cursor: 'pointer' }} />
                        </div>
                        <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>Worker Thread Ratio</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#4F46E5' }}>x4 Cluster</span>
                            </div>
                            <input type="range" min="1" max="16" defaultValue="4" style={{ width: '100%', cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="danger-zone">
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <AlertTriangle size={24} color="#DC2626" />
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991B1B', margin: 0 }}>System Maintenance Override</h3>
                                <p style={{ fontSize: '0.85rem', color: '#B91C1C', margin: '4px 0 1.5rem 0', opacity: 0.8 }}>Enabling this will gracefully close active client WebSockets and serve hard-coded Static 503 Down headers to all non-admin IPs immediately.</p>
                                
                                <button style={{ 
                                    padding: '0.75rem 1.5rem', 
                                    background: '#DC2626', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '10px', 
                                    fontWeight: '800', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                                }}>
                                    <Power size={16} /> ARM STATIC SHUTDOWN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
