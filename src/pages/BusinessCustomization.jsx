import React, { useState } from 'react';
import { 
    ArrowLeft, Save, Sliders, FileText, RefreshCw, Building2, 
    ShieldCheck, CheckCircle2, Truck, ArrowRightLeft, Database, 
    Printer, MessageSquare, Users, Smartphone, LayoutGrid, Eye, Edit,
    Calculator, Bell, Camera, UploadCloud, Calendar, MapPin, Mail, Phone, Briefcase, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Toggle } from '../components/ui/toggle';

const BusinessCustomization = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [config, setConfig] = useState({
        // GENERAL
        passcode: false, gstin: true, negativeStock: false, blockItems: false, 
        blockParties: false, deliveryChallan: true, godown: false, autoBackup: true, auditTrail: true,

        // TRANSACTION
        invoiceBillNo: true, addTime: false, cashSale: false, billingName: true, custPO: false,
        inclusiveTax: true, displayPurchase: true, last5Sale: false, last5Purchase: false, freeQty: false,
        txnTax: false, txnDiscount: false, roundOff: true, billingType: 'full', 

        // PRINT
        printerType: 'regular', repeatHeader: true, printName: 'My Company', printLogo: true,
        paperSize: 'A4',

        // GST
        enableGst: true, hsnCode: true, cess: false, reverseCharge: false,
        placeSupply: true, compositeScheme: false, enableTcs: false, enableTds: false,

        // MESSAGE
        msgMethod: 'Vyapar', msgToParty: true, msgUpdate: false, msgCopySelf: false,
        autoSendSales: true, autoSendPurchase: true, autoSendReturn: true,

        // PARTY
        partyGroup: false, shipAddr: false, partyStatus: false, payReminder: true, loyalty: true,

        // NEW: ACCOUNTING & REMINDERS
        accountingModule: false,
        serviceReminders: false
    });

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); alert('Master system state synchronized and deployed!'); }, 800);
    };

    const tabs = [
        { id: 'profile', label: 'Org Profile', icon: Building2, gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', shadow: 'rgba(79, 70, 229, 0.2)' },
        { id: 'general', label: 'General', icon: Sliders, gradient: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)', shadow: 'rgba(27, 107, 58, 0.2)' },
        { id: 'transaction', label: 'Transaction', icon: FileText, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'print', label: 'Print', icon: Printer, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadow: 'rgba(139, 92, 246, 0.2)' },
        { id: 'gst', label: 'Taxes & GST', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.2)' },
        { id: 'party', label: 'Party', icon: Users, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadow: 'rgba(236, 72, 153, 0.2)' },
        { id: 'accounting', label: 'Accounting', icon: Calculator, gradient: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)', shadow: 'rgba(15, 23, 42, 0.2)' },
        { id: 'reminders', label: 'Reminders', icon: Bell, gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', shadow: 'rgba(239, 68, 68, 0.2)' },
        { id: 'betaClub', label: 'Beta Club', icon: Crown, gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', shadow: 'rgba(245, 158, 11, 0.2)' }
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'profile': return renderProfile();
            case 'general': return renderGeneral();
            case 'transaction': return renderTransaction();
            case 'print': return renderPrint();
            case 'gst': return renderGst();
            case 'party': return renderParty();
            case 'accounting': return renderAccounting();
            case 'reminders': return renderReminders();
            case 'betaClub': return renderBetaClub();
            default: return null;
        }
    };

    const renderProfile = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px dashed #CBD5E1', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94A3B8' }}>
                            <Camera size={24} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '4px' }}>Add Logo</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white', cursor: 'pointer' }}>
                            <Edit size={14} />
                        </div>
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>Company Branding</h2>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>This data will be used automatically on all official invoices and emails.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
                    {/* Column 1: Core Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Business Details</h3>
                        <ProfileInputField label="Business Name *" icon={Building2} defaultValue="My Primary Firm" />
                        <ProfileInputField label="Phone Number" icon={Phone} placeholder="Enter mobile no." />
                        <ProfileInputField label="GSTIN Reference" icon={ShieldCheck} placeholder="E.g. 27AAAAA0000A1Z5" />
                        <ProfileInputField label="Contact Email ID" icon={Mail} placeholder="mail@business.com" />
                        <ProfileInputField label="Books Beginning Date" icon={Calendar} type="date" />
                    </div>

                    {/* Column 2: Extra Detail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Localization</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Business Vertical Type</label>
                            <select style={selectStyle}><option>Select Business Type</option><option>Retail</option><option>Manufacturing</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Business Category</label>
                            <select style={selectStyle}><option>Select Category</option><option>Automobile</option><option>Grocery</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>State Registered</label>
                            <select style={selectStyle}><option>Select State</option><option>Maharashtra</option><option>Karnataka</option></select>
                        </div>
                        <ProfileInputField label="Pincode" icon={MapPin} placeholder="6 digit code" />
                    </div>

                    {/* Column 3: Signature & Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Physical Presence</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Full Registered Address</label>
                            <textarea rows="3" style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', resize: 'none' }} placeholder="Enter detailed operating address..."></textarea>
                        </div>
                        
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Authorized E-Signature</label>
                            <div style={{ height: '100px', border: '2px dashed #CBD5E1', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer' }}>
                                <UploadCloud size={24} color="#94A3B8" />
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginTop: '4px' }}>Upload Signature PNG</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAccounting = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            <CustomizationCard title="Double Entry Accounting" icon={Calculator}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    Enabling the accounting engine activates journal vouchers, ledger mapping, auto-balancing trial sheets, and real-time P&L generated directly from system debits and credits.
                </p>
                <PremiumToggleItem 
                    label="Enable Full-Scale Accounting Module" 
                    desc="Unlock advanced balance sheet mechanics." 
                    active={config.accountingModule} 
                    onToggle={() => handleToggle('accountingModule')} 
                />
            </CustomizationCard>
        </div>
    );

    const renderReminders = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 0' }}>
            {/* Promotion Banner */}
            <div style={{ width: '100%', background: 'linear-gradient(100deg, #2563EB 0%, #1D4ED8 100%)', borderRadius: '16px', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>Master Your Customer Follow-ups!</h2>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#BFDBFE' }}>Watch how to reduce outstanding dues by 40% with automated SMS/WhatsApp triggers.</p>
                </div>
                <button style={{ position: 'relative', zIndex: 2, background: '#EF4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></div>
                    PLAY DEMO VIDEO
                </button>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            </div>

            {/* Feature Visualizer */}
            <div style={{ textAlign: 'center', maxWidth: '500px', marginTop: '1rem' }}>
                <div style={{ background: '#FFFBEB', width: '160px', height: '160px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid #FDE68A', boxShadow: 'inset 0 0 20px rgba(251, 191, 36, 0.1)' }}>
                    <Bell size={60} color="#D97706" strokeWidth={1.5} className="animate-pulse" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>Automated Service & Payment Reminders <span style={{ background: '#EF4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '0.5rem' }}>NEW</span></h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.5rem', lineHeight: '1.5' }}>⏰ Never miss a renewal | 🤝 Retain existing clientele | 📈 Accelerate Cash flow.</p>
                
                <button 
                    onClick={() => handleToggle('serviceReminders')}
                    style={{ 
                        marginTop: '1.5rem', padding: '0.85rem 2rem', 
                        background: config.serviceReminders ? '#DCF2E4' : '#EF4444', 
                        color: config.serviceReminders ? '#15803D' : 'white',
                        border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                        boxShadow: config.serviceReminders ? 'none' : '0 6px 20px rgba(239, 68, 68, 0.25)'
                    }}
                >
                    <Bell size={18} />
                    {config.serviceReminders ? 'ENABLED & RUNNING' : 'ENABLE SERVICE REMINDERS NOW'}
                </button>
            </div>
        </div>
    );

    const renderGeneral = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Application Core" icon={Sliders}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem label="Security Passcode" desc="Validate auth tokens before destructive operations." active={config.passcode} onToggle={() => handleToggle('passcode')} />
                        <Divider />
                        <PremiumToggleItem label="Prevent Negative Inventory" desc="Restrict invoicing items when stock level <= 0." active={config.negativeStock} onToggle={() => handleToggle('negativeStock')} />
                        <Divider />
                        <PremiumToggleItem label="Lock Party Generation" desc="Prevent new party records within standard transaction forms." active={config.blockParties} onToggle={() => handleToggle('blockParties')} />
                    </div>
                </CustomizationCard>
                <CustomizationCard title="Operational Features" icon={Truck}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <PremiumToggleItem label="Activate Delivery Challans" active={config.deliveryChallan} onToggle={() => handleToggle('deliveryChallan')} />
                        {config.deliveryChallan && (
                            <div style={{ marginLeft: '2.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ accentColor: '#1B6B3A' }} /> Reverse Goods Logic
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ accentColor: '#1B6B3A' }} /> Display Amount
                                </label>
                            </div>
                        )}
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Warehousing" icon={ArrowRightLeft}>
                    <PremiumToggleItem label="Godown Links" active={config.godown} onToggle={() => handleToggle('godown')} />
                </CustomizationCard>
                <CustomizationCard title="Integrity" icon={Database}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem label="Auto Backup" active={config.autoBackup} onToggle={() => handleToggle('autoBackup')} />
                        <PremiumToggleItem label="Audit Trail" active={config.auditTrail} onToggle={() => handleToggle('auditTrail')} />
                    </div>
                </CustomizationCard>
            </div>
        </div>
    );

    const renderTransaction = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Transaction Header & Table" icon={LayoutGrid}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Header Logic</h4>
                            <CheckboxWithLabel label="Include Invoice/Bill No." checked={config.invoiceBillNo} onChange={() => handleToggle('invoiceBillNo')} />
                            <CheckboxWithLabel label="Timestamp Transactions" checked={config.addTime} onChange={() => handleToggle('addTime')} />
                            <CheckboxWithLabel label="Set Cash Sale as Default" checked={config.cashSale} onChange={() => handleToggle('cashSale')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Items Grid</h4>
                            <CheckboxWithLabel label="Inclusive/Exclusive Tax Toggle" checked={config.inclusiveTax} onChange={() => handleToggle('inclusiveTax')} />
                            <CheckboxWithLabel label="Show Purchase Price to Staff" checked={config.displayPurchase} onChange={() => handleToggle('displayPurchase')} />
                            <CheckboxWithLabel label="Manage Free Item Quantities" checked={config.freeQty} onChange={() => handleToggle('freeQty')} />
                        </div>
                    </div>
                </CustomizationCard>
                <CustomizationCard title="Billing Calculations" icon={Sliders}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Discounts</h4>
                            <CheckboxWithLabel label="Transaction-wise General Tax" checked={config.txnTax} onChange={() => handleToggle('txnTax')} />
                            <CheckboxWithLabel label="Transaction-level Discount %" checked={config.txnDiscount} onChange={() => handleToggle('txnDiscount')} />
                            <PremiumToggleItem label="Auto Total Round Off" active={config.roundOff} onToggle={() => handleToggle('roundOff')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Billing Mode</h4>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div onClick={() => setConfig(p => ({...p, billingType: 'lite'}))} style={{ flex: 1, padding: '0.75rem', border: config.billingType === 'lite' ? '2px solid #3B82F6' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: config.billingType === 'lite' ? '#EFF6FF' : 'white' }}>
                                    <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Lite Sale</span>
                                </div>
                                <div onClick={() => setConfig(p => ({...p, billingType: 'full'}))} style={{ flex: 1, padding: '0.75rem', border: config.billingType === 'full' ? '2px solid #3B82F6' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: config.billingType === 'full' ? '#EFF6FF' : 'white' }}>
                                    <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Full Sale</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ gridColumn: 'span 4' }}>
                <CustomizationCard title="Tracking Prefixes" icon={Edit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['Sale Invoice', 'Purchase Order', 'Credit Note'].map(item => (
                            <div key={item} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{item}</label>
                                <input type="text" placeholder="E.g. INV-" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} />
                            </div>
                        ))}
                    </div>
                </CustomizationCard>
            </div>
        </div>
    );

    const renderPrint = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Printer Mechanism" icon={Printer}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button onClick={() => setConfig(p => ({...p, printerType: 'regular'}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'regular' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'regular' ? 'white' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>REGULAR</button>
                        <button onClick={() => setConfig(p => ({...p, printerType: 'thermal'}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'thermal' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'thermal' ? 'white' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>THERMAL</button>
                    </div>
                    <CheckboxWithLabel label="Repeat header on multi-sheet outputs" checked={config.repeatHeader} onChange={() => handleToggle('repeatHeader')} />
                </CustomizationCard>
                <CustomizationCard title="Info Overrides" icon={Edit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ProfileInputField label="Display Title for Print" icon={Briefcase} defaultValue="My Super Company" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Page Dim:</span>
                            <select style={selectStyle}><option>A4 Size</option><option>Letter</option></select>
                        </div>
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}><Eye size={16} color="#8B5CF6" /> VIEWPORT</div>
                <div style={{ padding: '1.5rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: '0.8rem' }}>[ Rendering Live Frame ]</div>
            </div>
        </div>
    );

    const renderGst = () => (
        <CustomizationCard title="GST Matrix" icon={ShieldCheck}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <PremiumToggleItem label="Enable GST Mode" active={config.enableGst} onToggle={() => handleToggle('enableGst')} />
                    <PremiumToggleItem label="Force HSN Mandatory" active={config.hsnCode} onToggle={() => handleToggle('hsnCode')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <CheckboxWithLabel label="Apply Reverse Charge" checked={config.reverseCharge} onChange={() => handleToggle('reverseCharge')} />
                    <CheckboxWithLabel label="Show Place of Supply" checked={config.placeSupply} onChange={() => handleToggle('placeSupply')} />
                </div>
            </div>
        </CustomizationCard>
    );

    const renderBetaClub = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 0' }}>
            <div style={{ width: '100%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '16px', padding: '3.5rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '-50px', bottom: '-50px', width: '200px', height: '200px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
                
                <Crown size={64} color="#F59E0B" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.5))' }} />
                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#FCD34D', letterSpacing: '-0.02em' }}>Join the Beta Club</h2>
                <p style={{ margin: '1.5rem auto', fontSize: '1.1rem', color: '#94A3B8', maxWidth: '650px', lineHeight: '1.7', fontWeight: '500' }}>
                    Gain exclusive early access to experimental features, AI-powered insights, and advanced integrations before they roll out to the public.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
                    <button style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Crown size={18} /> APPLY FOR ACCESS
                    </button>
                </div>
            </div>
        </div>
    );

    const renderParty = () => (
        <CustomizationCard title="CRM Features" icon={Users}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <PremiumToggleItem label="Party Group Clustering" active={config.partyGroup} onToggle={() => handleToggle('partyGroup')} />
                    <PremiumToggleItem label="Active Status Badging" active={config.partyStatus} onToggle={() => handleToggle('partyStatus')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <PremiumToggleItem label="Loyalty Contribution" active={config.loyalty} onToggle={() => handleToggle('loyalty')} />
                    <PremiumToggleItem label="Auto Reminders" active={config.payReminder} onToggle={() => handleToggle('payReminder')} />
                </div>
            </div>
        </CustomizationCard>
    );

    return (
        <div className="premium-container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <button onClick={() => navigate('/settings')} style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>
                        <ArrowLeft size={16} /> BACK
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>Advanced Engine Configuration</h1>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Manage dynamic deployment switches and high-level metadata configuration.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)', opacity: isSaving ? 0.7 : 1, fontSize: '0.85rem' }}>
                    <Save size={18} /> {isSaving ? 'Saving...' : 'DEPLOY CONFIG'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: isActive ? tab.gradient : 'transparent', color: isActive ? 'white' : '#64748B', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isActive ? `0 4px 12px ${tab.shadow}` : 'none', whiteSpace: 'nowrap' }}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {renderContent()}
            </div>
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const ProfileInputField = ({ label, icon: Icon, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <Icon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input {...props} style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
        </div>
    </div>
);

// eslint-disable-next-line no-unused-vars
const CustomizationCard = ({ title, icon: Icon, children }) => (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FAFBFC' }}>
            <Icon size={18} color="#1B6B3A" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{title}</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
);

const PremiumToggleItem = ({ label, desc, active, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#334155' }}>{label}</h4>
            {desc && <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', lineHeight: '1.4' }}>{desc}</p>}
        </div>
        <Toggle checked={active} onChange={onToggle} size="md" />
    </div>
);

const CheckboxWithLabel = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ width: '16px', height: '16px', accentColor: '#1B6B3A' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{label}</span>
    </label>
);

const selectStyle = { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' };
const Divider = () => <div style={{ height: '1px', background: '#F1F5F9' }} />;

export default BusinessCustomization;
