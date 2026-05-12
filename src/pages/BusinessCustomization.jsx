import React, { useState } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Box, 
    FileText, 
    RefreshCw, 
    Building2, 
    Sliders,
    ShieldCheck,
    CheckCircle2,
    Truck,
    ArrowRightLeft,
    Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Toggle } from '../components/ui/toggle';

const BusinessCustomization = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [config, setConfig] = useState({
        passcode: false,
        gstin: true,
        negativeStock: false,
        blockItems: false,
        blockParties: false,
        estimate: true,
        proforma: true,
        purchaseOrder: true,
        otherIncome: false,
        deliveryChallan: true,
        godown: false,
        autoBackup: true,
        auditTrail: true
    });

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('System configurations deployed successfully!');
        }, 800);
    };

    return (
        <div className="premium-container" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <button 
                        onClick={() => navigate('/business/settings')}
                        style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.75rem', padding: 0 }}
                    >
                        <ArrowLeft size={16} /> BACK TO SETTINGS
                    </button>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>System Customization</h1>
                    <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.25rem' }}>Master engine configuration for workflows and transactions.</p>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                        color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving Changes...' : 'Save Configurations'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                
                {/* Main Configuration Controls */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Section 1: Application Core */}
                    <CustomizationCard 
                        title="Application Core" 
                        icon={Sliders} 
                        desc="Foundational logic for items, stock levels, and security."
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <PremiumToggleItem 
                                label="Enable Security Passcode" 
                                desc="Prompts for auth token validation before destructive dashboard operations."
                                active={config.passcode}
                                onToggle={() => handleToggle('passcode')}
                            />
                            <div style={{ height: '1px', background: '#F1F5F9' }} />
                            <PremiumToggleItem 
                                label="Tax Governance (GSTIN Tracking)" 
                                desc="Force validate and store GST/VAT references globally."
                                active={config.gstin}
                                onToggle={() => handleToggle('gstin')}
                            />
                            <div style={{ height: '1px', background: '#F1F5F9' }} />
                            <PremiumToggleItem 
                                label="Prevent Negative Inventory Sales" 
                                desc="Block sales invoices if available stock dips below zero."
                                active={config.negativeStock}
                                onToggle={() => handleToggle('negativeStock')}
                            />
                            <div style={{ height: '1px', background: '#F1F5F9' }} />
                            <PremiumToggleItem 
                                label="Strict Form Field Locking" 
                                desc="Block creation of ad-hoc non-cataloged items directly in txn forms."
                                active={config.blockItems}
                                onToggle={() => handleToggle('blockItems')}
                            />
                        </div>
                    </CustomizationCard>

                    {/* Section 2: Transaction Engine */}
                    <CustomizationCard 
                        title="Transaction Engine" 
                        icon={FileText} 
                        desc="Activate optional billing modules across the business logic."
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <CheckboxCard 
                                title="Estimations & Quotes" 
                                checked={config.estimate} 
                                onChange={() => handleToggle('estimate')}
                            />
                            <CheckboxCard 
                                title="Proforma Invoicing" 
                                checked={config.proforma} 
                                onChange={() => handleToggle('proforma')}
                            />
                            <CheckboxCard 
                                title="Order Vouchers (PO/SO)" 
                                checked={config.purchaseOrder} 
                                onChange={() => handleToggle('purchaseOrder')}
                            />
                            <CheckboxCard 
                                title="Indirect Income Modules" 
                                checked={config.otherIncome} 
                                onChange={() => handleToggle('otherIncome')}
                            />
                        </div>
                        
                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Truck size={20} color="#1B6B3A" />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '750', color: '#0F172A' }}>Delivery Challan Activation</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Enable external shipping notes workflow.</p>
                                    </div>
                                </div>
                                <Toggle checked={config.deliveryChallan} onChange={() => handleToggle('deliveryChallan')} size="md" />
                            </div>

                            {config.deliveryChallan && (
                                <div style={{ display: 'flex', gap: '2rem', paddingLeft: '2.75rem', animation: 'slideDown 0.3s ease' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ accentColor: '#1B6B3A' }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Enable Reverse Challan (Goods Return)</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ accentColor: '#1B6B3A' }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Attach Valuations on Print</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </CustomizationCard>
                </div>

                {/* Sidebar Configuration (Right Col) */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Multi Firm */}
                    <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', boxShadow: '0 4px 20px rgba(6, 78, 59, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Building2 size={20} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Master Profile</h3>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%' }} />
                                <span style={{ fontWeight: '750', fontSize: '0.9rem' }}>My Primary Company</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>DEFAULT</span>
                        </div>
                    </div>

                    {/* Godown Management */}
                    <CustomizationCard title="Warehouse Linkage" icon={ArrowRightLeft}>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                            Deploy stock separation mechanism letting you logically bin items across multiple physical warehouses and locations.
                        </p>
                        <PremiumToggleItem 
                            label="Godown Movement System"
                            active={config.godown}
                            onToggle={() => handleToggle('godown')}
                        />
                    </CustomizationCard>

                    {/* Backups */}
                    <CustomizationCard title="Integrity & Backup" icon={Database}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <PremiumToggleItem 
                                label="Auto Cloud Backup"
                                active={config.autoBackup}
                                onToggle={() => handleToggle('autoBackup')}
                            />
                            <div style={{ padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #DCF2E4', fontSize: '0.75rem', color: '#15803D', fontWeight: '700' }}>
                                Last Integrity Check: 05/05/2026 | 11:05 AM
                            </div>
                            <PremiumToggleItem 
                                label="Persistent Audit Trail"
                                active={config.auditTrail}
                                onToggle={() => handleToggle('auditTrail')}
                            />
                        </div>
                    </CustomizationCard>
                </div>
            </div>
        </div>
    );
};

const CustomizationCard = ({ title, icon: Icon, desc, children }) => (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                <Icon size={18} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>{title}</h3>
                {desc && <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>{desc}</p>}
            </div>
        </div>
        <div style={{ padding: '1.5rem' }}>
            {children}
        </div>
    </div>
);

const PremiumToggleItem = ({ label, desc, active, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '750', color: '#334155' }}>{label}</h4>
            {desc && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', lineHeight: '1.4' }}>{desc}</p>}
        </div>
        <Toggle checked={active} onChange={onToggle} size="md" />
    </div>
);

const CheckboxCard = ({ title, checked, onChange }) => (
    <div 
        onClick={onChange}
        style={{ 
            padding: '1rem', borderRadius: '12px', border: '2px solid', 
            borderColor: checked ? '#1B6B3A' : '#E2E8F0',
            background: checked ? '#F0FDF4' : 'white',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}
    >
        <div style={{ 
            width: '20px', height: '20px', borderRadius: '6px', 
            border: '2px solid', borderColor: checked ? '#1B6B3A' : '#CBD5E1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: checked ? '#1B6B3A' : 'transparent'
        }}>
            {checked && <CheckCircle2 size={14} color="white" />}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '750', color: checked ? '#166534' : '#475569' }}>{title}</span>
    </div>
);

export default BusinessCustomization;
