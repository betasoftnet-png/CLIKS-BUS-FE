import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Save, Sliders, FileText, RefreshCw, Building2, 
    ShieldCheck, CheckCircle2, Truck, ArrowRightLeft, Database, 
    Printer, MessageSquare, Users, Smartphone, LayoutGrid, Eye, Edit,
    Calculator, Bell, Camera, UploadCloud, Calendar, MapPin, Mail, Phone, Briefcase, Crown, X,
    Settings as SettingsIcon, Globe, Shield, Coins, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Toggle } from '../components/ui/toggle';
import { settingsService, profileService } from '../services';
import { customPrompt } from '../utils/customConfirm';
import { useCurrency } from '../context';

const BusinessCustomization = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const { currency } = useCurrency();
    const [activeTab, setActiveTab] = useState('profile');

    const [config, setConfig] = useState({
        // PROFILE / COMPANY INFO
        companyName: 'My Primary Firm',
        phone: '',
        gstinRef: '',
        email: '',
        booksBeginDate: '',
        businessVerticalType: 'Retail',
        businessCategory: 'Grocery',
        stateRegistered: 'Maharashtra',
        pincode: '',
        registeredAddress: '',
        signatureUrl: null,
        logoUrl: null,

        // GENERAL CONFIGS
        passcode: false, 
        negativeStock: false, 
        blockParties: false, 
        deliveryChallan: true, 
        godown: false, 
        autoBackup: true, 
        auditTrail: true,
        reverseGoodsLogic: true,
        displayAmountChallan: false,

        // TRANSACTION CONFIGS
        invoiceBillNo: true, 
        addTime: false, 
        cashSale: false, 
        billingName: false,
        customerPo: false,
        inclusiveTax: true, 
        displayPurchase: true, 
        showLast5Sale: false,
        showLast5Purchase: false,
        freeQty: false,
        countItems: false,
        txnTax: false, 
        txnDiscount: false, 
        roundOff: true, 
        billingType: 'full', 
        prefixSale: 'INV-',
        prefixPurchase: 'PO-',
        prefixCredit: 'CN-',
        prefixSaleOrder: 'SO-',
        prefixEstimate: 'EST-',
        prefixChallan: 'DC-',
        prefixProforma: 'PRO-',
        prefixPaymentIn: 'PAY-',
        ewayBill: false,
        quickEntry: false,
        noInvoicePreview: false,
        passcodeTxn: false,
        discountPayments: false,
        linkPayments: false,
        dueDates: false,
        showProfitSale: false,

        // PRINT CONFIGS
        printerType: 'regular', 
        repeatHeader: true, 
        printName: 'My Company', 
        printLogo: true,
        paperSize: 'A4 Size',
        displayTitlePrint: 'My Super Company',

        // GST CONFIGS
        enableGst: true, 
        hsnCode: true, 
        reverseCharge: false,
        placeSupply: true,

        // PARTY CRM CONFIGS
        partyGroup: false, 
        partyStatus: false, 
        loyalty: true, 
        payReminder: true,

        // ACCOUNTING & REMINDERS
        accountingModule: false,
        serviceReminders: false,

        // SYSTEM PREFERENCES (INTEGRATED FROM SETTINGS PAGE)
        darkMode: false,
        notifications: true,
        emailDigest: false,
        publicProfile: true,
        twoFactor: true,
        dataSharing: false,

        // PAYMENT MODULE CONFIGS
        paymentUpi: true,
        paymentCard: false,
        paymentReminders: true,

        // FIN-PRO ADVANCED OPERATIONS
        finProMultiCurrency: false,
        finProAiCashflow: true,
        finProSmartAudit: false
    });

    // ── Load Cloud Sync Configuration ───────────────────────────────
    useEffect(() => {
        const loadMasterConfig = async () => {
            try {
                const [settingsRes, profileRes] = await Promise.allSettled([
                    settingsService.getSettings(),
                    profileService.getProfile()
                ]);
                
                let dbSettings = {};
                if (settingsRes.status === 'fulfilled') {
                    const res = settingsRes.value;
                    dbSettings = res?.data || res || {};
                }

                let userProfile = {};
                if (profileRes.status === 'fulfilled') {
                    const res = profileRes.value;
                    userProfile = res?.data || res || {};
                }

                setConfig(prev => {
                    const merged = {
                        ...prev,
                        ...dbSettings,
                        ...(dbSettings.settings || {})
                    };
                    
                    // Fallback empty profile settings to registered account details
                    if (!merged.companyName || merged.companyName === 'My Primary Firm') {
                        merged.companyName = userProfile.business_name || userProfile.name || 'My Primary Firm';
                    }
                    if (!merged.email) {
                        merged.email = userProfile.email || '';
                    }
                    if (!merged.phone) {
                        merged.phone = userProfile.phone || '';
                    }
                    
                    return merged;
                });
            } catch (err) {
                console.warn('[Settings Engine] Cloud node offline. Operating locally.', err);
            }
        };
        loadMasterConfig();
    }, []);

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTextChange = (key, val) => {
        setConfig(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsService.updateSettings(config);
            alert('Master deployment parameters synchronized to secure ledger successfully!');
        } catch (err) {
            console.error('[Sync Router] Failed to write metadata:', err);
            alert('Network Sync Exception: Connection to backend control layer was interrupted.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSimulateUpload = async (field) => {
        const name = await customPrompt('Simulate Uploading (Enter dummy file URL or click OK):', `https://api.cliksbusiness.com/simulations/${field}.png`);
        if (name) {
            setConfig(prev => ({ ...prev, [field]: name }));
        }
    };

    const tabs = [
        { id: 'profile', label: 'Org Profile', icon: Building2, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'general', label: 'General', icon: Sliders, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'transaction', label: 'Transaction', icon: FileText, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'print', label: 'Print', icon: Printer, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'gst', label: 'Taxes & GST', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'party', label: 'Contacts', icon: Users, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'accounting', label: 'Accounting', icon: Calculator, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'payment', label: 'Payment', icon: Coins, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'finPro', label: 'FIN-PRO', icon: Zap, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'betaClub', label: 'Beta Club', icon: Crown, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' }
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
            case 'payment': return renderPayment();
            case 'finPro': return renderFinPro();
            case 'betaClub': return renderBetaClub();
            case 'settings': return renderSettings();
            default: return null;
        }
    };

    const renderProfile = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleSimulateUpload('logoUrl')}>
                        {config.logoUrl ? (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #4F46E5', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img src={config.logoUrl} alt="Branding Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                                <Building2 size={32} color="#4F46E5" />
                            </div>
                        ) : (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px dashed #CBD5E1', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94A3B8' }}>
                                <Camera size={24} />
                                <span style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '4px' }}>Add Logo</span>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white' }}>
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
                        <ProfileInputField 
                            label="Business Name *" 
                            icon={Building2} 
                            value={config.companyName} 
                            onChange={(e) => handleTextChange('companyName', e.target.value)} 
                        />
                        <ProfileInputField 
                            label="Phone Number" 
                            icon={Phone} 
                            placeholder="Enter mobile no." 
                            value={config.phone} 
                            onChange={(e) => handleTextChange('phone', e.target.value)} 
                        />
                        <ProfileInputField 
                            label="GSTIN Reference" 
                            icon={ShieldCheck} 
                            placeholder="E.g. 27AAAAA0000A1Z5" 
                            value={config.gstinRef} 
                            onChange={(e) => handleTextChange('gstinRef', e.target.value)} 
                        />
                        <ProfileInputField 
                            label="Contact Email ID" 
                            icon={Mail} 
                            placeholder="mail@business.com" 
                            value={config.email} 
                            onChange={(e) => handleTextChange('email', e.target.value)} 
                        />
                        <ProfileInputField 
                            label="Books Beginning Date" 
                            icon={Calendar} 
                            type="date" 
                            value={config.booksBeginDate} 
                            onChange={(e) => handleTextChange('booksBeginDate', e.target.value)} 
                        />
                    </div>

                    {/* Column 2: Extra Detail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Localization</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Business Vertical Type</label>
                            <select 
                                style={selectStyle} 
                                value={config.businessVerticalType} 
                                onChange={(e) => handleTextChange('businessVerticalType', e.target.value)}
                            >
                                <option>Retail</option>
                                <option>Manufacturing</option>
                                <option>Wholesale Distributor</option>
                                <option>Service Provider</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Business Category</label>
                            <select 
                                style={selectStyle} 
                                value={config.businessCategory} 
                                onChange={(e) => handleTextChange('businessCategory', e.target.value)}
                            >
                                <option>Grocery</option>
                                <option>Automobile</option>
                                <option>Apparel & Clothing</option>
                                <option>Electronics</option>
                                <option>Pharmaceutical</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>State Registered</label>
                            <select 
                                style={selectStyle} 
                                value={config.stateRegistered} 
                                onChange={(e) => handleTextChange('stateRegistered', e.target.value)}
                            >
                                <option>Maharashtra</option>
                                <option>Karnataka</option>
                                <option>Delhi</option>
                                <option>Tamil Nadu</option>
                                <option>Gujarat</option>
                                <option>West Bengal</option>
                            </select>
                        </div>
                        <ProfileInputField 
                            label="Pincode" 
                            icon={MapPin} 
                            placeholder="6 digit code" 
                            value={config.pincode} 
                            onChange={(e) => handleTextChange('pincode', e.target.value)} 
                        />
                    </div>

                    {/* Column 3: Signature & Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Physical Presence</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Full Registered Address</label>
                            <textarea 
                                rows="3" 
                                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', resize: 'none' }} 
                                placeholder="Enter detailed operating address..."
                                value={config.registeredAddress}
                                onChange={(e) => handleTextChange('registeredAddress', e.target.value)}
                            />
                        </div>
                        
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Authorized E-Signature</label>
                            <div 
                                onClick={() => handleSimulateUpload('signatureUrl')}
                                style={{ height: '100px', border: config.signatureUrl ? '2px solid #10B981' : '2px dashed #CBD5E1', borderRadius: '10px', background: config.signatureUrl ? '#ECFDF5' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer' }}
                            >
                                {config.signatureUrl ? (
                                    <>
                                        <CheckCircle2 size={24} color="#10B981" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#065F46', marginTop: '4px' }}>Signature Attached</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={24} color="#94A3B8" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginTop: '4px' }}>Upload Signature PNG</span>
                                    </>
                                )}
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

    const renderPayment = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Payment Integration Rules" icon={Coins}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label="Instant UPI Dynamic QR Generation" 
                            desc="Embed auto-generated dynamic UPI QR codes on all invoices for instant customer scans." 
                            active={config.paymentUpi} 
                            onToggle={() => handleToggle('paymentUpi')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Card Payment Settlements" 
                            desc="Support direct credit/debit card transactions (Visa, Mastercard, RuPay) during billing checkout." 
                            active={config.paymentCard} 
                            onToggle={() => handleToggle('paymentCard')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Automated Outstanding Reminders" 
                            desc="Automatically ping customers via WhatsApp/SMS when invoice due date is near or elapsed." 
                            active={config.paymentReminders} 
                            onToggle={() => handleToggle('paymentReminders')} 
                        />
                    </div>
                </CustomizationCard>
            </div>
            
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#1E293B' }}>
                    <Eye size={16} color="#3B82F6" /> REALTIME PAYMENT PREVIEW
                </div>
                <div style={{ padding: '2rem', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
                    <div style={{ width: '85%', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: '700' }}>Merchant Account</div>
                                <div style={{ fontWeight: '850', fontSize: '0.9rem' }}>{config.companyName || 'My Primary Firm'}</div>
                            </div>
                            <Coins size={20} />
                        </div>
                        
                        {/* Body */}
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '750', textTransform: 'uppercase' }}>Amount Due</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>{currency.symbol} 5,249.00</div>
                            </div>
                            
                            {/* UPI QR Display */}
                            {config.paymentUpi ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: '#FAFBFC' }}>
                                    {/* Mock QR SVG */}
                                    <svg width="120" height="120" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                                        {/* Corners */}
                                        <path d="M0,0 h30 v10 h-20 v20 h-10 z" fill="#0F172A" />
                                        <path d="M70,0 h30 v30 h-10 v-20 h-20 z" fill="#0F172A" />
                                        <path d="M0,70 h10 v20 h20 v10 h-30 z" fill="#0F172A" />
                                        <path d="M70,100 h30 v-30 h-10 v20 h-20 z" fill="#0F172A" />
                                        
                                        {/* Inner squares */}
                                        <rect x="5" y="5" width="10" height="10" fill="#0F172A" />
                                        <rect x="85" y="5" width="10" height="10" fill="#0F172A" />
                                        <rect x="5" y="85" width="10" height="10" fill="#0F172A" />
                                        
                                        {/* Random mock QR dots */}
                                        <rect x="25" y="25" width="10" height="10" fill="#3B82F6" />
                                        <rect x="45" y="15" width="5" height="15" fill="#0F172A" />
                                        <rect x="65" y="25" width="15" height="5" fill="#0F172A" />
                                        <rect x="25" y="45" width="15" height="10" fill="#0F172A" />
                                        <rect x="55" y="45" width="10" height="15" fill="#3B82F6" />
                                        <rect x="15" y="65" width="15" height="5" fill="#0F172A" />
                                        <rect x="45" y="65" width="15" height="10" fill="#0F172A" />
                                        <rect x="75" y="55" width="10" height="20" fill="#0F172A" />
                                        <rect x="35" y="80" width="15" height="10" fill="#3B82F6" />
                                        <rect x="65" y="85" width="15" height="5" fill="#0F172A" />
                                    </svg>
                                    <div style={{ fontSize: '0.6rem', color: '#1B6B3A', fontWeight: '800', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <ShieldCheck size={10} /> BHIM UPI SECURED
                                    </div>
                                </div>
                            ) : (
                                <div style={{ width: '120px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed #CBD5E1', borderRadius: '8px', background: '#F8FAFC', color: '#94A3B8', padding: '0.5rem', textAlign: 'center' }}>
                                    <Coins size={24} style={{ marginBottom: '4px' }} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>UPI Disabled</span>
                                    <span style={{ fontSize: '0.5rem', marginTop: '2px' }}>Enable dynamic QR generation to display code</span>
                                </div>
                            )}
                            
                            {/* Settlement methods */}
                            <div style={{ width: '100%', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.65rem', fontWeight: '700', color: '#64748B' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: config.paymentCard ? '#10B981' : '#94A3B8' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.paymentCard ? '#10B981' : '#94A3B8' }} /> VISA/MC Card
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: config.paymentReminders ? '#10B981' : '#94A3B8' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.paymentReminders ? '#10B981' : '#94A3B8' }} /> Auto SMS Reminders
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinPro = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Professional Ledger & AI Analytics" icon={Zap}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label="Multi-Currency Ledgers" 
                            desc="Enable cross-border entries with real-time currency conversions and daily forex adjustments." 
                            active={config.finProMultiCurrency} 
                            onToggle={() => handleToggle('finProMultiCurrency')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="AI Predictive Cashflow Projections" 
                            desc="Activate self-learning neural engines to forecast cash runways, collections, and burn rates." 
                            active={config.finProAiCashflow} 
                            onToggle={() => handleToggle('finProAiCashflow')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Smart Audit Trail GST Sync" 
                            desc="Maintain a cryptographically hashed log of every invoice action with instant tax node parity." 
                            active={config.finProSmartAudit} 
                            onToggle={() => handleToggle('finProSmartAudit')} 
                        />
                    </div>
                </CustomizationCard>
            </div>
            
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', position: 'relative' }}>
                {/* Accent glows */}
                <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '-30px', bottom: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ padding: '1rem', background: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#F8FAFC' }}>
                    <Crown size={16} color="#F59E0B" /> FIN-PRO PLATINUM SUITE
                </div>
                
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '320px', boxSizing: 'border-box' }}>
                    {/* Glassmorphic card */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Layer</span>
                                <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    FIN-PRO <span style={{ fontSize: '0.65rem', background: 'linear-gradient(90deg, #F59E0B 0%, #EC4899 100%)', color: 'white', padding: '1px 6px', borderRadius: '100px', fontWeight: '800' }}>ACTIVE</span>
                                </h3>
                            </div>
                            <Zap size={24} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' }} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                            {/* Multi-currency indicator */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} color="#6366F1" /> Multi-Currency Ledger</span>
                                <span style={{ fontWeight: '750', color: config.finProMultiCurrency ? '#10B981' : '#64748B' }}>
                                    {config.finProMultiCurrency ? 'USD, EUR, INR ENABLED' : 'LOCAL CURRENCY ONLY'}
                                </span>
                            </div>
                            
                            {/* AI Cashflow engine */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}><Calculator size={14} color="#EC4899" /> AI Cashflow Engine</span>
                                <span style={{ fontWeight: '750', color: config.finProAiCashflow ? '#10B981' : '#64748B' }}>
                                    {config.finProAiCashflow ? 'PREDICTIVE ANALYSIS UP' : 'DEACTIVATED'}
                                </span>
                            </div>
                            
                            {/* Compliance node status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} color="#10B981" /> Hashed GST Node Sync</span>
                                <span style={{ fontWeight: '750', color: config.finProSmartAudit ? '#10B981' : '#64748B' }}>
                                    {config.finProSmartAudit ? 'CRYPTOGRAPHIC HANDSHAKE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tiny glassmorphic preview banner for Cashflow Prediction */}
                    {config.finProAiCashflow && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#818CF8', textTransform: 'uppercase' }}>AI Runaway Projection (30 Days)</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem', fontWeight: '850', color: '#FFFFFF' }}>{currency.symbol} 14.8L Safe Reserve</span>
                                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '700' }}>+8.4% growth forecasted</span>
                            </div>
                        </div>
                    )}
                </div>
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
                        <PremiumToggleItem label="Lock Contact Generation" desc="Prevent new customer/supplier records within standard transaction forms." active={config.blockParties} onToggle={() => handleToggle('blockParties')} />
                    </div>
                </CustomizationCard>
                <CustomizationCard title="Operational Features" icon={Truck}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <PremiumToggleItem label="Activate Delivery Challans" active={config.deliveryChallan} onToggle={() => handleToggle('deliveryChallan')} />
                        {config.deliveryChallan && (
                            <div style={{ marginLeft: '2.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={config.reverseGoodsLogic} 
                                        onChange={() => handleToggle('reverseGoodsLogic')} 
                                        style={{ accentColor: '#1B6B3A' }} 
                                    /> Reverse Goods Logic
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={config.displayAmountChallan} 
                                        onChange={() => handleToggle('displayAmountChallan')} 
                                        style={{ accentColor: '#1B6B3A' }} 
                                    /> Display Amount
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Row: Header, Items, and Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <CustomizationCard title="Transaction Header" icon={LayoutGrid}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <CheckboxWithLabel label="Invoice/Bill No." checked={config.invoiceBillNo} onChange={() => handleToggle('invoiceBillNo')} />
                        <CheckboxWithLabel label="Add Time on Transactions" checked={config.addTime} onChange={() => handleToggle('addTime')} />
                        <CheckboxWithLabel label="Cash Sale by default" checked={config.cashSale} onChange={() => handleToggle('cashSale')} />
                        <CheckboxWithLabel label="Billing Name of Contacts" checked={config.billingName} onChange={() => handleToggle('billingName')} />
                        <CheckboxWithLabel label="Customers P.O. Details on Transactions" checked={config.customerPo} onChange={() => handleToggle('customerPo')} />
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Items Table" icon={Sliders}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <CheckboxWithLabel label="Inclusive/Exclusive Tax on Rate(Price/Unit)" checked={config.inclusiveTax} onChange={() => handleToggle('inclusiveTax')} />
                        <CheckboxWithLabel label="Display Purchase Price of Items" checked={config.displayPurchase} onChange={() => handleToggle('displayPurchase')} />
                        <CheckboxWithLabel label="Show last 5 Sale Price of Items" checked={config.showLast5Sale} onChange={() => handleToggle('showLast5Sale')} />
                        <CheckboxWithLabel label="Show last 5 Purchase Price of Items" checked={config.showLast5Purchase} onChange={() => handleToggle('showLast5Purchase')} />
                        <CheckboxWithLabel label="Free Item Quantity" checked={config.freeQty} onChange={() => handleToggle('freeQty')} />
                        <CheckboxWithLabel label="Count" checked={config.countItems} onChange={() => handleToggle('countItems')} />
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Taxes, Discount & Totals" icon={Calculator}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <CheckboxWithLabel label="Transaction wise Tax" checked={config.txnTax} onChange={() => handleToggle('txnTax')} />
                        <CheckboxWithLabel label="Transaction wise Discount" checked={config.txnDiscount} onChange={() => handleToggle('txnDiscount')} />
                        <CheckboxWithLabel label="Round Off Total" checked={config.roundOff} onChange={() => handleToggle('roundOff')} />
                    </div>
                </CustomizationCard>
            </div>

            {/* Bottom Row: More Features, Prefixes, and Billing Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <CustomizationCard title="More Transaction Features" icon={Sliders}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <CheckboxWithLabel label="E-way bill no" checked={config.ewayBill} onChange={() => handleToggle('ewayBill')} />
                        <CheckboxWithLabel label="Quick Entry" checked={config.quickEntry} onChange={() => handleToggle('quickEntry')} />
                        <CheckboxWithLabel label="Do not Show Invoice Preview" checked={config.noInvoicePreview} onChange={() => handleToggle('noInvoicePreview')} />
                        <CheckboxWithLabel label="Enable Passcode for transaction edit/delete" checked={config.passcodeTxn} onChange={() => handleToggle('passcodeTxn')} />
                        <CheckboxWithLabel label="Discount During Payments" checked={config.discountPayments} onChange={() => handleToggle('discountPayments')} />
                        <CheckboxWithLabel label="Link Payments to Invoices" checked={config.linkPayments} onChange={() => handleToggle('linkPayments')} />
                        <CheckboxWithLabel label="Due Dates and Payment Terms" checked={config.dueDates} onChange={() => handleToggle('dueDates')} />
                        <CheckboxWithLabel label="Show Profit while making Sale Invoice" checked={config.showProfitSale} onChange={() => handleToggle('showProfitSale')} />
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Transaction Prefixes" icon={Edit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Sale</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixSale || ''}
                                onChange={(e) => handleTextChange('prefixSale', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Credit Note</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixCredit || ''}
                                onChange={(e) => handleTextChange('prefixCredit', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Sale Order</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixSaleOrder || ''}
                                onChange={(e) => handleTextChange('prefixSaleOrder', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Purchase Order</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixPurchase || ''}
                                onChange={(e) => handleTextChange('prefixPurchase', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Estimate</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixEstimate || ''}
                                onChange={(e) => handleTextChange('prefixEstimate', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Proforma Invoice</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixProforma || ''}
                                onChange={(e) => handleTextChange('prefixProforma', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Delivery Challan</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixChallan || ''}
                                onChange={(e) => handleTextChange('prefixChallan', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Payment In</label>
                            <input 
                                type="text" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} 
                                value={config.prefixPaymentIn || ''}
                                onChange={(e) => handleTextChange('prefixPaymentIn', e.target.value)}
                            />
                        </div>
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Billing Type" icon={Sliders}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="billingType" 
                                checked={config.billingType === 'lite'} 
                                onChange={() => handleTextChange('billingType', 'lite')} 
                                style={{ accentColor: '#1B6B3A' }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Lite Sale</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="billingType" 
                                checked={config.billingType === 'full'} 
                                onChange={() => handleTextChange('billingType', 'full')} 
                                style={{ accentColor: '#1B6B3A' }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Full Sale</span>
                        </label>
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
                        <button onClick={() => handleTextChange('printerType', 'regular')} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'regular' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'regular' ? 'white' : '#64748B', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>REGULAR</button>
                        <button onClick={() => handleTextChange('printerType', 'thermal')} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'thermal' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'thermal' ? 'white' : '#64748B', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>THERMAL</button>
                    </div>
                    <CheckboxWithLabel label="Repeat header on multi-sheet outputs" checked={config.repeatHeader} onChange={() => handleToggle('repeatHeader')} />
                </CustomizationCard>
                <CustomizationCard title="Info Overrides" icon={Edit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ProfileInputField 
                            label="Display Title for Print" 
                            icon={Briefcase} 
                            value={config.displayTitlePrint} 
                            onChange={(e) => handleTextChange('displayTitlePrint', e.target.value)} 
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Page Dim:</span>
                            <select 
                                style={selectStyle} 
                                value={config.paperSize} 
                                onChange={(e) => handleTextChange('paperSize', e.target.value)}
                            >
                                <option>A4 Size</option>
                                <option>Letter</option>
                                <option>Legal</option>
                                <option>3 Inch (Thermal)</option>
                            </select>
                        </div>
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}><Eye size={16} color="#8B5CF6" /> VIEWPORT PREVIEW</div>
                <div style={{ padding: '2rem', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
                    <div style={{ width: '75%', background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.85rem' }}>{config.displayTitlePrint}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700' }}>{config.prefixSale}001</div>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', width: '100%', borderRadius: '4px' }}></div>
                        <div style={{ height: '8px', background: '#F1F5F9', width: '80%', borderRadius: '4px' }}></div>
                        <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            {config.signatureUrl && <div style={{ fontSize: '0.5rem', color: '#10B981', fontStyle: 'italic', border: '1px dashed #10B981', padding: '2px 4px', transform: 'rotate(-5deg)', fontWeight: '800' }}>SIGNED</div>}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '1rem', fontWeight: '750', textTransform: 'uppercase' }}>Active Dimension: {config.paperSize}</div>
                </div>
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
                    <button onClick={() => alert('Application queued! The board will review.')} style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <PremiumToggleItem label="Contact Group Clustering" active={config.partyGroup} onToggle={() => handleToggle('partyGroup')} />
                    <PremiumToggleItem label="Active Status Badging" active={config.partyStatus} onToggle={() => handleToggle('partyStatus')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <PremiumToggleItem label="Loyalty Contribution" active={config.loyalty} onToggle={() => handleToggle('loyalty')} />
                    <PremiumToggleItem label="Auto Reminders" active={config.payReminder} onToggle={() => handleToggle('payReminder')} />
                </div>
            </div>
        </CustomizationCard>
    );

    const renderSettings = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Preferences" icon={Globe}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label="Dark Mode" 
                            desc="Use a dark theme for the application interface." 
                            active={config.darkMode} 
                            onToggle={() => handleToggle('darkMode')} 
                        />
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#334155' }}>Language</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Current system language: English (US)</p>
                            </div>
                            <div style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: '#F1F5F9', borderRadius: '6px', fontWeight: '750', color: '#475569' }}>EN-US</div>
                        </div>
                    </div>
                </CustomizationCard>
                
                <CustomizationCard title="Notifications" icon={Bell}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label="Push Notifications" 
                            desc="Receive real-time alerts for updates and activities." 
                            active={config.notifications} 
                            onToggle={() => handleToggle('notifications')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Email Digest" 
                            desc="Receive a weekly summary of your financial activity." 
                            active={config.emailDigest} 
                            onToggle={() => handleToggle('emailDigest')} 
                        />
                    </div>
                </CustomizationCard>
            </div>
            
            <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Privacy & Security" icon={Shield}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label="Public Profile" 
                            desc="Allow other users on the platform to find you." 
                            active={config.publicProfile} 
                            onToggle={() => handleToggle('publicProfile')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Two-Factor Authentication" 
                            desc="Add an extra layer of security to your account." 
                            active={config.twoFactor} 
                            onToggle={() => handleToggle('twoFactor')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label="Data & Analytics" 
                            desc="Allow usage data to be collected to improve experience." 
                            active={config.dataSharing} 
                            onToggle={() => handleToggle('dataSharing')} 
                        />
                    </div>
                </CustomizationCard>
            </div>
        </div>
    );

    return (
        <div className="premium-container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>
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
