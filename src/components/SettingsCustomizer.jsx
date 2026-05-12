import React, { useState } from 'react';
import { 
    Settings as SettingsIcon, 
    X, 
    Info, 
    HelpCircle, 
    Edit2, 
    Play,
    ChevronDown
} from 'lucide-react';

const SettingsCustomizer = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('GENERAL');
    const [settings, setSettings] = useState({
        enablePasscode: false,
        gstinNumber: true,
        stopSaleNegative: false,
        blockNewItems: false,
        blockNewParties: false,
        estimate: true,
        proformaInvoice: true,
        salePurchaseOrder: true,
        otherIncome: false,
        fixedAssets: false,
        deliveryChallan: true,
        goodsReturnDelivery: true,
        printAmountDelivery: false,
        multiFirm: false,
        godownManagement: false,
        autoBackup: false,
        auditTrail: true
    });
    const [zoom, setZoom] = useState(100);

    if (!isOpen) return null;

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const menuItems = [
        'GENERAL', 'TRANSACTION', 'PRINT', 'TAXES & GST', 
        'TRANSACTION MESSAGE', 'PARTY', 'ITEM', 
        'SERVICE REMINDERS', 'ACCOUNTING'
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <div style={{
                width: '96%', height: '92%', background: '#f5f6f8',
                borderRadius: '8px', display: 'flex', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                
                {/* Sidebar */}
                <div style={{ width: '240px', background: '#1e2235', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #2a2e45' }}>
                        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            Settings
                        </h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {menuItems.map(item => (
                            <button
                                key={item}
                                onClick={() => setActiveTab(item)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                                    background: activeTab === item ? 'white' : 'transparent',
                                    border: 'none', color: activeTab === item ? '#1e2235' : '#94a3b8',
                                    fontSize: '0.8rem', fontWeight: activeTab === item ? '800' : '600',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    borderLeft: activeTab === item ? '4px solid #1B6B3A' : '4px solid transparent'
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#ffffff' }}>
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        style={{ 
                            position: 'absolute', top: '15px', right: '20px', zIndex: 10,
                            background: '#d1d5db', color: '#6b7280', border: 'none',
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', padding: 0
                        }}
                    >
                        <X size={16} strokeWidth={3} />
                    </button>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '2.5rem', height: '100%' }}>
                            
                            {/* Column 1 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div>
                                    <SectionTitle title="Application" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                        <CheckboxField label="Enable Passcode" checked={settings.enablePasscode} onChange={() => handleToggle('enablePasscode')} hasInfo />
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500' }}>Business Currency <InfoIcon /></span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#f9fafb', cursor: 'pointer' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>₹</span>
                                                <ChevronDown size={14} color="#9ca3af" />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}>Amount</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(upto Decimal Places) <InfoIcon /></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input type="number" defaultValue={2} style={{ width: '40px', padding: '0.25rem', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>e.g. 0.00</span>
                                            </div>
                                        </div>

                                        <CheckboxField label="GSTIN Number" checked={settings.gstinNumber} onChange={() => handleToggle('gstinNumber')} hasInfo />
                                        <CheckboxField label="Stop Sale on Negative Stock" checked={settings.stopSaleNegative} onChange={() => handleToggle('stopSaleNegative')} hasInfo />
                                        <CheckboxField label="Block New Items from Txn Form" checked={settings.blockNewItems} onChange={() => handleToggle('blockNewItems')} hasInfo />
                                        <CheckboxField label="Block New Parties from Txn Form" checked={settings.blockNewParties} onChange={() => handleToggle('blockNewParties')} hasInfo />
                                    </div>
                                </div>

                                <div>
                                    <SectionTitle title="More Transactions" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                        <CheckboxField label="Estimate/Quotation" checked={settings.estimate} onChange={() => handleToggle('estimate')} hasInfo />
                                        <CheckboxField label="Proforma Invoice" checked={settings.proformaInvoice} onChange={() => handleToggle('proformaInvoice')} hasInfo />
                                        <CheckboxField label="Sale/Purchase Order" checked={settings.salePurchaseOrder} onChange={() => handleToggle('salePurchaseOrder')} hasInfo />
                                        <CheckboxField label="Other Income" checked={settings.otherIncome} onChange={() => handleToggle('otherIncome')} hasInfo />
                                        <CheckboxField label="Fixed Assets (FA)" checked={settings.fixedAssets} onChange={() => handleToggle('fixedAssets')} hasInfo />
                                        <CheckboxField label="Delivery Challan" checked={settings.deliveryChallan} onChange={() => handleToggle('deliveryChallan')} hasInfo />
                                        
                                        {settings.deliveryChallan && (
                                            <div style={{ marginLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                                                <CheckboxField label={<span>Goods return on <strong>Delivery Challan</strong></span>} checked={settings.goodsReturnDelivery} onChange={() => handleToggle('goodsReturnDelivery')} hasInfo />
                                                <CheckboxField label={<span>Print amount on <strong>Delivery Challan</strong></span>} checked={settings.printAmountDelivery} onChange={() => handleToggle('printAmountDelivery')} hasInfo />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={settings.multiFirm} onChange={() => handleToggle('multiFirm')} style={{ accentColor: '#1B6B3A' }} />
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>Multi Firm</h3>
                                    </div>
                                    <div style={{ 
                                        marginTop: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', 
                                        borderRadius: '6px', padding: '0.75rem', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'space-between',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '16px', height: '16px', border: '2px solid #1B6B3A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '8px', height: '8px', background: '#1B6B3A', borderRadius: '50%' }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>My Company</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>DEFAULT</span>
                                            <Edit2 size={14} color="#3b82f6" style={{ cursor: 'pointer' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '5rem' }}>
                                    <SectionTitle title="Stock Transfer Between Godowns" />
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        Manage all your stores/godowns and transfer stock seamlessly between them. Using this feature, you can transfer stock between stores/godowns and manage your inventory more efficiently.
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={settings.godownManagement} onChange={() => handleToggle('godownManagement')} style={{ width: '18px', height: '18px', border: '1px solid #d1d5db', borderRadius: '4px', accentColor: '#1B6B3A' }} />
                                        <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}>Godown management & Stock transfer</span>
                                        <InfoIcon />
                                        <Play size={12} fill="#ef4444" color="#ef4444" style={{ marginLeft: '4px', cursor: 'pointer' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                <div>
                                    <SectionTitle title="Backup & History" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                                        <CheckboxField label="Auto Backup" checked={settings.autoBackup} onChange={() => handleToggle('autoBackup')} hasInfo />
                                        <div style={{ paddingLeft: '1.75rem', fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                                            Last Backup <span style={{ fontWeight: '600' }}>05/05/2026 | 11:05 AM</span> <InfoIcon />
                                        </div>
                                        <CheckboxField label="Audit Trail" checked={settings.auditTrail} onChange={() => handleToggle('auditTrail')} hasInfo />
                                    </div>
                                </div>

                                <div style={{ marginTop: '5rem' }}>
                                    <SectionTitle title="Customize Your View" />
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#374151' }}>Choose Your Screen Zoom/Scale</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                                            You can use this setting to resize the system screen, making it larger or smaller to fit your preferences.
                                        </p>

                                        <div style={{ position: 'relative', padding: '0 0.5rem' }}>
                                            <input 
                                                type="range" 
                                                min="70" max="130" step="10"
                                                value={zoom}
                                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                                style={{ width: '100%', height: '4px', background: '#e5e7eb', appearance: 'none', borderRadius: '2px', outline: 'none', accentColor: '#3b82f6' }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                                {['70%', '80%', '90%', '100%', '110%', '115%', '120%', '130%'].map(val => (
                                                    <span key={val} style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: '600' }}>{val}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                            <button style={{
                                                background: '#dbeafe', color: '#3b82f6', border: 'none',
                                                padding: '0.5rem 1.25rem', borderRadius: '20px', fontWeight: '600',
                                                fontSize: '0.8rem', cursor: 'pointer'
                                            }}>
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }) => (
    <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>{title}</h3>
    </div>
);

const InfoIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1', color: '#ffffff', fontSize: '8px', fontWeight: 'bold', marginLeft: '4px', cursor: 'pointer' }}>i</span>
);

const CheckboxField = ({ label, checked, onChange, hasInfo = false }) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '18px' }}>
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={onChange}
                style={{ width: '16px', height: '16px', border: '1px solid #d1d5db', borderRadius: '2px', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500', lineHeight: '18px' }}>
            {label}
            {hasInfo && <InfoIcon />}
        </span>
    </label>
);

export default SettingsCustomizer;
