import React, { useState, useEffect } from 'react';
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
import { adminService } from '../../services/adminService';
import '../../App.css';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [features, setFeatures] = useState({
        signup_enabled: true,
        ai_auditing: true,
        instant_invoicing: true,
        beta_integrations: false,
        maintenance_mode: false,
        api_throttle_limit: 1200
    });

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPlatformConfig();
            
            // Convert incoming 'true'/'false' strings to genuine JS booleans
            setFeatures({
                signup_enabled: data.signup_enabled === 'true' || data.signup_enabled === true,
                ai_auditing: data.ai_auditing === 'true' || data.ai_auditing === true,
                instant_invoicing: data.instant_invoicing === 'true' || data.instant_invoicing === true,
                beta_integrations: data.beta_integrations === 'true' || data.beta_integrations === true,
                maintenance_mode: data.maintenance_mode === 'true' || data.maintenance_mode === true,
                api_throttle_limit: parseInt(data.api_throttle_limit || 1200, 10)
            });
        } catch (err) {
            console.error("Configuration hydration failure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const toggleFeature = (key) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSliderChange = (val) => {
        setFeatures(prev => ({ ...prev, api_throttle_limit: val }));
    };

    const handleSave = async (updatedOverrides = null) => {
        setSaving(true);
        const configToSave = updatedOverrides || features;
        try {
            // Push config ensuring values are properly stringified for storage
            const payload = {
                signup_enabled: String(configToSave.signup_enabled),
                ai_auditing: String(configToSave.ai_auditing),
                instant_invoicing: String(configToSave.instant_invoicing),
                beta_integrations: String(configToSave.beta_integrations),
                maintenance_mode: String(configToSave.maintenance_mode),
                api_throttle_limit: String(configToSave.api_throttle_limit)
            };
            
            await adminService.savePlatformConfig(payload);
            alert("Platform engine parameters successfully propagated across the network cluster!");
        } catch {
            alert("Failed to broadcast configurations to infrastructure node.");
        } finally {
            setSaving(false);
        }
    };

    const triggerMaintenanceToggle = async () => {
        const newState = !features.maintenance_mode;
        const message = newState 
            ? "WARNING: This will instantly block ALL active client accounts and return 503 errors. Arm system shutdown?"
            : "Do you want to DE-ARM maintenance mode and restore public infrastructure availability?";
        
        if (!window.confirm(message)) return;

        const updated = { ...features, maintenance_mode: newState };
        setFeatures(updated);
        await handleSave(updated);
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
                    position: relative;
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
                    <button 
                        onClick={() => handleSave()}
                        disabled={saving || loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', color: 'white', fontWeight: '800', cursor: (saving || loading) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)', opacity: (saving || loading) ? 0.7 : 1 }}
                    >
                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} 
                        {saving ? "Propagating..." : "Propagate Changes"}
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
                    <button className="settings-nav-item" onClick={loadConfig}><HardDrive size={18} /> Re-Sync State</button>
                </div>

                {/* Right Content */}
                <div className="settings-panel">
                    {loading ? (
                        <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#4F46E5', gap: '1rem' }}>
                            <RefreshCw size={32} className="animate-spin" />
                            <span style={{ fontWeight: '800' }}>Polling infrastructure configurations...</span>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sliders size={20} color="#4F46E5" /> Global Feature Flags</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                
                                <div className="setting-row">
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Open Registration Matrix</h4>
                                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Allowing new businesses to complete landing onboarding independently.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={features.signup_enabled} onChange={() => toggleFeature('signup_enabled')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Enable LLM-Driven Deep Audit</h4>
                                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Triggers automated LLM transaction oversight for Premium users.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={features.ai_auditing} onChange={() => toggleFeature('ai_auditing')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Realtime Invoicing Engine</h4>
                                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Force PDF invoice rendering immediately on WebSocket confirmation.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={features.instant_invoicing} onChange={() => toggleFeature('instant_invoicing')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expose Beta API Add-ons</h4>
                                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>Makes experimental external CRM sinks visible in customization toggles.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={features.beta_integrations} onChange={() => toggleFeature('beta_integrations')} />
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
                                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#4F46E5' }}>{features.api_throttle_limit} / min</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="500" 
                                        max="5000" 
                                        step="100"
                                        value={features.api_throttle_limit} 
                                        onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                                        style={{ width: '100%', cursor: 'pointer' }} 
                                    />
                                </div>
                                <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', opacity: 0.6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>Worker Thread Ratio</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#4F46E5' }}>x4 Cluster</span>
                                    </div>
                                    <input type="range" min="1" max="16" defaultValue="4" disabled style={{ width: '100%', cursor: 'not-allowed' }} />
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="danger-zone" style={{ borderLeft: features.maintenance_mode ? '4px solid #EF4444' : '1px dashed #FCA5A5' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <AlertTriangle size={24} color="#DC2626" />
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991B1B', margin: 0 }}>
                                            System Maintenance Status: <span style={{ textTransform: 'uppercase', color: features.maintenance_mode ? '#EF4444' : '#16A34A' }}>{features.maintenance_mode ? "ARMED / BLOCKED" : "DISARMED / LIVE"}</span>
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#B91C1C', margin: '4px 0 1.5rem 0', opacity: 0.8 }}>
                                            Enabling this will gracefully intercept active client transactions and serve hard-coded Static 503 Outage screens to all non-admin sessions immediately.
                                        </p>
                                        
                                        <button 
                                            onClick={triggerMaintenanceToggle}
                                            disabled={saving}
                                            style={{ 
                                                padding: '0.75rem 1.5rem', 
                                                background: features.maintenance_mode ? '#10B981' : '#DC2626', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '10px', 
                                                fontWeight: '800', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem', 
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                boxShadow: `0 4px 12px ${features.maintenance_mode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
                                            }}>
                                            <Power size={16} /> 
                                            {features.maintenance_mode ? "RESTORE PUBLIC SERVICE" : "ARM STATIC SHUTDOWN"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
