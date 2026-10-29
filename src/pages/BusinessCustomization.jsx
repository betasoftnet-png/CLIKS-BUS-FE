import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Save, Sliders, FileText, RefreshCw, Building2, 
    ShieldCheck, CheckCircle2, Truck, ArrowRightLeft, Database, 
    Printer, MessageSquare, Users, Smartphone, LayoutGrid, Eye, EyeOff, Edit,
    Calculator, Bell, Camera, UploadCloud, Calendar, MapPin, Mail, Phone, Briefcase, Crown, X,
    Globe, Shield, Coins, Zap, Clock, AlertTriangle, Lock, Award, Sparkles, ExternalLink, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import '../App.css';
import { Toggle } from '../components/ui/toggle';
import { settingsService, profileService, caService } from '../services';
import { customPrompt } from '../utils/customConfirm';
import { useCurrency, useLanguage } from '../context';

export const GSTIN_REGEX = /^[0-9]{2}[A-Z0-9]{13}$/i;

export const INDIAN_STATES = [
    { code: "01", name: "Jammu and Kashmir" },
    { code: "02", name: "Himachal Pradesh" },
    { code: "03", name: "Punjab" },
    { code: "04", name: "Chandigarh" },
    { code: "05", name: "Uttarakhand" },
    { code: "06", name: "Haryana" },
    { code: "07", name: "Delhi" },
    { code: "08", name: "Rajasthan" },
    { code: "09", name: "Uttar Pradesh" },
    { code: "10", name: "Bihar" },
    { code: "11", name: "Sikkim" },
    { code: "12", name: "Arunachal Pradesh" },
    { code: "13", name: "Nagaland" },
    { code: "14", name: "Manipur" },
    { code: "15", name: "Mizoram" },
    { code: "16", name: "Tripura" },
    { code: "17", name: "Meghalaya" },
    { code: "18", name: "Assam" },
    { code: "19", name: "West Bengal" },
    { code: "20", name: "Jharkhand" },
    { code: "21", name: "Odisha" },
    { code: "22", name: "Chhattisgarh" },
    { code: "23", name: "Madhya Pradesh" },
    { code: "24", name: "Gujarat" },
    { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { code: "27", name: "Maharashtra" },
    { code: "29", name: "Karnataka" },
    { code: "30", name: "Goa" },
    { code: "31", name: "Lakshadweep" },
    { code: "32", name: "Kerala" },
    { code: "33", name: "Tamil Nadu" },
    { code: "34", name: "Puducherry" },
    { code: "35", name: "Andaman and Nicobar Islands" },
    { code: "36", name: "Telangana" },
    { code: "37", name: "Andhra Pradesh" },
    { code: "38", name: "Ladakh" },
    { code: "97", name: "Other Territory" }
];

const BusinessCustomization = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const { currency } = useCurrency();
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'profile';
    });

    // ── ICAI & FIN-PRO Verification State ──
    const { data: icaiData, refetch: refetchIcai } = useQuery({
        queryKey: ['icaiVerificationStatus'],
        queryFn: () => caService.getIcaiVerification(),
        refetchInterval: 10000
    });

    const icaiVerification = icaiData?.data || icaiData || {};
    const caVerificationStatus = icaiVerification?.status || 'UNVERIFIED';
    const isFinProSubscribed = Boolean(icaiVerification?.isSubscribed);

    const [showIcaiModal, setShowIcaiModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [icaiFormData, setIcaiFormData] = useState({
        fullName: '',
        firmName: '',
        membershipNo: '',
        email: '',
        copStatus: 'ACTIVE',
        associateFellow: 'Associate Member (ACA)',
        address: '',
        region: 'Southern India Regional Council (SIRC)'
    });

    // Sync form data with existing icaiVerification from backend
    useEffect(() => {
        if (icaiVerification && icaiVerification.status && icaiVerification.status !== 'UNVERIFIED') {
            setIcaiFormData({
                fullName: icaiVerification.full_name || icaiVerification.fullName || '',
                firmName: icaiVerification.firm_name || icaiVerification.firmName || '',
                membershipNo: icaiVerification.membership_no || icaiVerification.membershipNo || '',
                email: icaiVerification.email || '',
                copStatus: icaiVerification.cop_status || icaiVerification.copStatus || 'ACTIVE',
                associateFellow: icaiVerification.associate_fellow || icaiVerification.associateFellow || 'Associate Member (ACA)',
                address: icaiVerification.address || '',
                region: icaiVerification.region || 'Southern India Regional Council (SIRC)'
            });
        }
    }, [icaiVerification]);

    const submitIcaiMutation = useMutation({
        mutationFn: (data) => caService.submitIcaiVerification(data),
        onSuccess: () => {
            refetchIcai();
            setShowIcaiModal(false);
            setIsEditMode(false);
            alert('ICAI membership credentials submitted successfully! Awaiting institutional approval by administrator.');
        },
        onError: (err) => {
            alert(err?.response?.data?.message || err?.message || 'Failed to submit ICAI credentials');
        }
    });

    const subscribeMutation = useMutation({
        mutationFn: (planName) => caService.activateFinproSubscription({ planName }),
        onSuccess: (res, planName) => {
            refetchIcai();
            alert(`Congratulations! You have successfully subscribed to ${planName}. FIN-PRO Workspace is now unlocked!`);
        },
        onError: (err) => {
            alert(err?.response?.data?.message || err?.message || 'Failed to subscribe to FIN-PRO');
        }
    });

    const simulateVerifyMutation = useMutation({
        mutationFn: () => caService.simulateVerifyIcai(),
        onSuccess: () => {
            refetchIcai();
            alert('ICAI Credentials Officially Verified by Admin! Subscription plans are now unlocked.');
        },
        onError: (err) => {
            alert(err?.response?.data?.message || err?.message || 'Failed to verify');
        }
    });

    const handleSubmitIcai = (e) => {
        e.preventDefault();
        if (!icaiFormData.fullName.trim() || !icaiFormData.membershipNo.trim() || !icaiFormData.firmName.trim()) {
            alert('Please fill in Member Full Name, ICAI Membership No, and Firm Name.');
            return;
        }

        // Must be exactly 6 digits
        if (!/^\d{6}$/.test(icaiFormData.membershipNo.trim())) {
            alert('ICAI Membership Number must be exactly 6 digits (e.g. 084921).');
            return;
        }

        submitIcaiMutation.mutate({
            ...icaiFormData,
            membershipNo: icaiFormData.membershipNo.trim()
        });
    };

    const handleSubscribeFinPro = (planName) => {
        subscribeMutation.mutate(planName);
    };

    const handleSimulateAdminVerify = () => {
        simulateVerifyMutation.mutate();
    };

    const logoInputRef = React.useRef(null);
    const sigInputRef = React.useRef(null);

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
        loyaltyEnabled: true,
        payReminder: true,

        // ACCOUNTING & REMINDERS
        accountingModule: false,
        serviceReminders: false,

        // SYSTEM PREFERENCES (INTEGRATED FROM SETTINGS PAGE)
        darkMode: false,
        language: localStorage.getItem('cliks_language') || 'EN-US',
        notifications: true,
        emailDigest: false,
        publicProfile: true,
        twoFactor: true,
        dataSharing: false,
        passcodePin: '1234',
        betaClubApplied: false,

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

                const localConfig = localStorage.getItem('cliks_business_config');
                const parsedLocal = localConfig ? JSON.parse(localConfig) : {};

                const localOrg = localStorage.getItem('cliks_org_profile');
                const parsedOrg = localOrg ? JSON.parse(localOrg) : {};

                setConfig(prev => {
                    const merged = {
                        ...prev,
                        ...parsedLocal,
                        ...dbSettings,
                        ...(dbSettings.settings || {})
                    };

                    if (merged.loyalty !== undefined && merged.loyaltyEnabled === undefined) {
                        merged.loyaltyEnabled = merged.loyalty;
                    } else if (merged.loyaltyEnabled !== undefined && merged.loyalty === undefined) {
                        merged.loyalty = merged.loyaltyEnabled;
                    } else if (merged.loyalty !== undefined && merged.loyaltyEnabled !== undefined) {
                        const unified = Boolean(merged.loyalty) && Boolean(merged.loyaltyEnabled);
                        merged.loyalty = unified;
                        merged.loyaltyEnabled = unified;
                    }
                    
                    if (parsedOrg.business_name && (!merged.companyName || merged.companyName === 'My Primary Firm')) {
                        merged.companyName = parsedOrg.business_name;
                    }
                    if (parsedOrg.gstin && !merged.gstinRef) {
                        merged.gstinRef = parsedOrg.gstin;
                    }
                    if (parsedOrg.state_registered && !merged.stateRegistered) {
                        merged.stateRegistered = parsedOrg.state_registered;
                    }
                    if (parsedOrg.address && !merged.registeredAddress) {
                        merged.registeredAddress = parsedOrg.address;
                    }
                    if (parsedOrg.pincode && !merged.pincode) {
                        merged.pincode = parsedOrg.pincode;
                    }
                    
                    if (dbSettings.deliveryChallan !== undefined) {
                        merged.deliveryChallan = Boolean(dbSettings.deliveryChallan);
                    } else if (dbSettings.settings && dbSettings.settings.deliveryChallan !== undefined) {
                        merged.deliveryChallan = Boolean(dbSettings.settings.deliveryChallan);
                    }

                    // Priority for signatureUrl & logoUrl: check dbSettings first, then parsedLocal
                    if (dbSettings.signatureUrl !== undefined) {
                        merged.signatureUrl = dbSettings.signatureUrl;
                    } else if (dbSettings.settings && dbSettings.settings.signatureUrl !== undefined) {
                        merged.signatureUrl = dbSettings.settings.signatureUrl;
                    }

                    if (dbSettings.logoUrl !== undefined) {
                        merged.logoUrl = dbSettings.logoUrl;
                    } else if (dbSettings.settings && dbSettings.settings.logoUrl !== undefined) {
                        merged.logoUrl = dbSettings.settings.logoUrl;
                    } else if (userProfile.avatar_url) {
                        merged.logoUrl = userProfile.avatar_url;
                    }

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
        setConfig(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            if (key === 'loyalty') {
                updated.loyaltyEnabled = updated.loyalty;
            } else if (key === 'loyaltyEnabled') {
                updated.loyalty = updated.loyaltyEnabled;
            }
            if (key === 'darkMode') {
                localStorage.setItem('cliks_dark_mode', String(updated.darkMode));
                if (updated.darkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark-theme', 'dark');
                    document.body.classList.add('dark-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    document.documentElement.classList.remove('dark-theme', 'dark');
                    document.body.classList.remove('dark-theme', 'dark');
                }
            }
            localStorage.setItem('cliks_business_config', JSON.stringify(updated));
            localStorage.setItem('cliks_active_config', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));

            // Auto-persist toggle update to backend database permanently
            settingsService.updateSettings(updated).catch(err => console.warn('[Settings Engine] Failed to save toggle to cloud:', err));
            try { queryClient.invalidateQueries({ queryKey: ['settings'] }); } catch (e) {}

            return updated;
        });
    };

    const handleTextChange = (key, val) => {
        if (key === 'gstinRef') {
            const sanitized = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
            let stateAuto = null;
            if (sanitized.length >= 2) {
                const statePrefix = sanitized.slice(0, 2);
                const matched = INDIAN_STATES.find(s => s.code === statePrefix);
                if (matched) {
                    stateAuto = matched.name;
                }
            }
            setConfig(prev => {
                const updated = { 
                    ...prev, 
                    gstinRef: sanitized,
                    ...(stateAuto ? { stateRegistered: stateAuto } : {})
                };
                localStorage.setItem('cliks_business_config', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
                return updated;
            });
            return;
        }
        if (key === 'language') {
            setLanguage(val);
            localStorage.setItem('cliks_language', val);
            document.documentElement.setAttribute('lang', val);
        }
        if (key === 'printerType') {
            const newPaperSize = val === 'thermal' ? '3 Inch (Thermal)' : 'A4 Size';
            setConfig(prev => {
                const updated = { ...prev, printerType: val, paperSize: newPaperSize };
                localStorage.setItem('cliks_business_config', JSON.stringify(updated));
                localStorage.setItem('cliks_active_config', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
                settingsService.updateSettings(updated).catch(err => console.warn('[Settings Engine] Failed to save printer config:', err));
                return updated;
            });
            return;
        }
        if (key === 'paperSize') {
            const newPrinterType = val.includes('Thermal') ? 'thermal' : 'regular';
            setConfig(prev => {
                const updated = { ...prev, paperSize: val, printerType: newPrinterType };
                localStorage.setItem('cliks_business_config', JSON.stringify(updated));
                localStorage.setItem('cliks_active_config', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
                settingsService.updateSettings(updated).catch(err => console.warn('[Settings Engine] Failed to save printer config:', err));
                return updated;
            });
            return;
        }
        setConfig(prev => {
            const updated = { ...prev, [key]: val };
            localStorage.setItem('cliks_business_config', JSON.stringify(updated));
            localStorage.setItem('cliks_active_config', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
            return updated;
        });
    };

    const handleTestPrint = () => {
        const isThermal = config.printerType === 'thermal' || (config.paperSize && config.paperSize.includes('Thermal'));
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        if (!printWindow) {
            alert('Please allow popups to execute printer test.');
            return;
        }

        const businessTitle = config.displayTitlePrint || config.companyName || 'CLIKS BUSINESS';
        const paperLabel = config.paperSize || (isThermal ? '3 Inch (Thermal)' : 'A4 Size');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Print Output - ${businessTitle}</title>
                <style>
                    @page {
                        size: ${isThermal ? '80mm auto' : (paperLabel.includes('Letter') ? 'letter' : paperLabel.includes('Legal') ? 'legal' : 'A4')};
                        margin: ${isThermal ? '2mm' : '10mm'};
                    }
                    body {
                        font-family: ${isThermal ? "'Courier New', monospace" : "'Inter', system-ui, sans-serif"};
                        margin: 0;
                        padding: ${isThermal ? '8px' : '20px'};
                        color: #000;
                        background: #fff;
                        font-size: ${isThermal ? '12px' : '14px'};
                    }
                    .ticket {
                        max-width: ${isThermal ? '280px' : '100%'};
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: ${isThermal ? '1px dashed #000' : '2px solid #1B6B3A'};
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                    }
                    .title {
                        font-size: ${isThermal ? '16px' : '22px'};
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .subtitle {
                        font-size: 11px;
                        color: #444;
                        margin-top: 4px;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    .table th, .table td {
                        text-align: left;
                        padding: 4px 0;
                        font-size: ${isThermal ? '11px' : '13px'};
                    }
                    .table th {
                        border-bottom: 1px solid #000;
                    }
                    .table td.right, .table th.right {
                        text-align: right;
                    }
                    .total-row {
                        border-top: ${isThermal ? '1px dashed #000' : '2px solid #000'};
                        font-weight: bold;
                        font-size: ${isThermal ? '13px' : '16px'};
                    }
                    .footer {
                        margin-top: 15px;
                        text-align: center;
                        font-size: 10px;
                        border-top: ${isThermal ? '1px dashed #000' : 'none'};
                        padding-top: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <div class="title">${businessTitle}</div>
                        <div class="subtitle">PRINTER MECHANISM TEST SHEET</div>
                        <div class="subtitle">Mode: ${isThermal ? 'THERMAL RECEIPT (80mm / 3")' : 'STANDARD PAGE (' + paperLabel + ')'}</div>
                        <div class="subtitle">Date: ${new Date().toLocaleString()}</div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="right">Qty</th>
                                <th class="right">Price</th>
                                <th class="right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Test Sample A</td>
                                <td class="right">1</td>
                                <td class="right">₹500.00</td>
                                <td class="right">₹500.00</td>
                            </tr>
                            <tr>
                                <td>Test Sample B</td>
                                <td class="right">2</td>
                                <td class="right">₹250.00</td>
                                <td class="right">₹500.00</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" class="right">TOTAL:</td>
                                <td class="right">₹1,000.00</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        <div>✓ Printer Mechanism Operational</div>
                        <div>Configuration: ${isThermal ? 'Thermal Slip Printer' : 'Standard Document Printer'}</div>
                        <div style="margin-top: 4px;">CLIKS Business Printing Engine</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 750);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handleSave = async () => {
        if (config.gstinRef && config.gstinRef.trim() && !GSTIN_REGEX.test(config.gstinRef.trim())) {
            alert('GSTIN Validation Error: The GSTIN Reference entered is invalid. Standard format: 2-digit state code + 13 alphanumeric chars (e.g. 05AAAPG7885R002 or 27AAAAA0000A1Z5).');
            return;
        }

        setIsSaving(true);
        const orgProfile = {
            business_name: config.companyName || 'Welton Consignor',
            legal_name: config.companyName || 'Welton Consignor',
            gstin: config.gstinRef || '05AAAPG7885R002',
            state_registered: config.stateRegistered || 'Uttarakhand',
            state: config.stateRegistered || 'Uttarakhand',
            address: config.registeredAddress || 'Dehradun Central Road',
            city: config.registeredAddress ? (config.registeredAddress.split(',')[0]?.trim() || 'Dehradun') : 'Dehradun',
            pincode: config.pincode || '248001',
            phone: config.phone || '',
            email: config.email || ''
        };

        // 1. Immediately persist to localStorage fallbacks
        localStorage.setItem('cliks_org_profile', JSON.stringify(orgProfile));
        localStorage.setItem('cliks_business_config', JSON.stringify(config));
        localStorage.setItem('cliks_active_config', JSON.stringify(config));

        // 2. Update active React Query cache/store
        queryClient.setQueryData(['profile'], (old) => ({ ...(old || {}), ...orgProfile }));
        queryClient.setQueryData(['businessProfile'], (old) => ({ ...(old || {}), ...orgProfile }));

        try {
            await Promise.allSettled([
                settingsService.updateSettings(config),
                profileService.updateProfile({
                    name: orgProfile.business_name,
                    business_name: orgProfile.business_name,
                    gstin: orgProfile.gstin,
                    state_registered: orgProfile.state_registered,
                    address: orgProfile.address,
                    pincode: orgProfile.pincode
                })
            ]);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            queryClient.invalidateQueries({ queryKey: ['gstSettings'] });
            window.dispatchEvent(new CustomEvent('cliksOrgProfileUpdated', { detail: orgProfile }));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: config }));
            alert('✅ Engine parameters & master configuration synchronized successfully!');
        } catch (err) {
            console.warn('[Sync Router] Network sync error, saved locally:', err);
            window.dispatchEvent(new CustomEvent('cliksOrgProfileUpdated', { detail: orgProfile }));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: config }));
            alert('✅ Deployment parameters saved to local workspace configuration!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoClick = () => {
        if (logoInputRef.current) logoInputRef.current.click();
    };

    const handleLogoFileSelect = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please choose a smaller image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const logoDataUrl = evt.target.result;
                setConfig(prev => {
                    const updated = { ...prev, logoUrl: logoDataUrl };
                    localStorage.setItem('cliks_business_config', JSON.stringify(updated));
                    localStorage.setItem('cliks_active_config', JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
                    return updated;
                });
                try {
                    await settingsService.updateSettings({ logoUrl: logoDataUrl });
                    await profileService.updateProfile({ avatar_data: logoDataUrl, avatar_name: file.name });
                } catch (err) {
                    console.warn('[Logo Persistence] Failed to sync logo to cloud backend:', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = async (e) => {
        if (e) e.stopPropagation();
        setConfig(prev => {
            const updated = { ...prev, logoUrl: null };
            localStorage.setItem('cliks_business_config', JSON.stringify(updated));
            localStorage.setItem('cliks_active_config', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
            return updated;
        });
        try {
            await settingsService.updateSettings({ logoUrl: null });
        } catch (err) {
            console.warn('[Logo Persistence] Failed to remove logo from backend:', err);
        }
    };

    const handleSigClick = () => {
        if (sigInputRef.current) sigInputRef.current.click();
    };

    const handleSigFileSelect = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please choose a smaller image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const sigDataUrl = evt.target.result;
                setConfig(prev => {
                    const updated = { ...prev, signatureUrl: sigDataUrl };
                    localStorage.setItem('cliks_business_config', JSON.stringify(updated));
                    localStorage.setItem('cliks_active_config', JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
                    return updated;
                });
                try {
                    await settingsService.updateSettings({ signatureUrl: sigDataUrl });
                } catch (err) {
                    console.warn('[Signature Persistence] Failed to sync signature to cloud backend:', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveSignature = async (e) => {
        if (e) e.stopPropagation();
        setConfig(prev => {
            const updated = { ...prev, signatureUrl: null };
            localStorage.setItem('cliks_business_config', JSON.stringify(updated));
            localStorage.setItem('cliks_active_config', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
            return updated;
        });
        try {
            await settingsService.updateSettings({ signatureUrl: null });
        } catch (err) {
            console.warn('[Signature Persistence] Failed to remove signature on backend:', err);
        }
    };

    const tabs = [
        { id: 'profile', label: t('tabProfile', 'Org Profile'), icon: Building2, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'general', label: t('tabGeneral', 'General'), icon: Sliders, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'transaction', label: t('tabTransaction', 'Transaction'), icon: FileText, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'print', label: t('tabPrint', 'Print'), icon: Printer, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'gst', label: t('tabGst', 'Taxes & GST'), icon: ShieldCheck, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'party', label: t('tabParty', 'Contacts'), icon: Users, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'accounting', label: t('tabAccounting', 'Accounting'), icon: Calculator, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'payment', label: t('tabPayment', 'Payment'), icon: Coins, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'finPro', label: t('tabFinPro', 'FIN-PRO'), icon: Zap, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadow: 'rgba(245, 158, 11, 0.2)' },
        { id: 'betaClub', label: t('tabBetaClub', 'Beta Club'), icon: Crown, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadow: 'rgba(139, 92, 246, 0.2)' }
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
            default: return null;
        }
    };

    const renderProfile = () => {
        const isGstinTyped = Boolean(config.gstinRef && config.gstinRef.trim());
        const isGstinValid = isGstinTyped && GSTIN_REGEX.test(config.gstinRef.trim());

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Hidden File Inputs for Native Document & Image Picking */}
                <input 
                    type="file" 
                    ref={logoInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleLogoFileSelect} 
                />
                <input 
                    type="file" 
                    ref={sigInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleSigFileSelect} 
                />

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleLogoClick} title="Click to upload company logo from your device">
                                {config.logoUrl ? (
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2.5px solid #1B6B3A', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={config.logoUrl} alt="Company Branding Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2.5px dashed #CBD5E1', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748B' }}>
                                        <Camera size={26} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: '750', marginTop: '4px', color: '#1B6B3A' }}>Add Logo</span>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: '#1B6B3A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white' }}>
                                    <Edit size={14} />
                                </div>
                            </div>
                            {config.logoUrl && (
                                <button 
                                    type="button" 
                                    onClick={handleRemoveLogo}
                                    style={{ border: 'none', background: '#FEF2F2', color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', padding: '0.2rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Remove Logo
                                </button>
                            )}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>Company Branding</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>Upload your official company logo and signature for automatic inclusion on billing documents, invoices, and reports.</p>
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
                                placeholder="E.g. 05AAAPG7885R002" 
                                value={config.gstinRef || ''} 
                                maxLength={15}
                                error={isGstinTyped && !isGstinValid}
                                onChange={(e) => handleTextChange('gstinRef', e.target.value)} 
                                helper={
                                    !isGstinTyped ? (
                                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Format: 15-character GSTIN (e.g. 05AAAPG7885R002 or 27AAAAA0000A1Z5)</span>
                                    ) : isGstinValid ? (
                                        <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Valid 15-digit GSTIN</span>
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: '750' }}>⚠️ Invalid GSTIN ({config.gstinRef.length}/15 chars). Example: 05AAAPG7885R002</span>
                                    )
                                }
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
                                    value={
                                        INDIAN_STATES.find(s => 
                                            s.name.toLowerCase() === (config.stateRegistered || '').toLowerCase() ||
                                            s.code === config.stateRegistered ||
                                            `${s.code} - ${s.name}`.toLowerCase() === (config.stateRegistered || '').toLowerCase()
                                        )?.name || config.stateRegistered || 'Maharashtra'
                                    } 
                                    onChange={(e) => handleTextChange('stateRegistered', e.target.value)}
                                >
                                    {INDIAN_STATES.map((s) => (
                                        <option key={s.code} value={s.name}>
                                            {s.code} - {s.name}
                                        </option>
                                    ))}
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
                            
                            <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Authorized E-Signature</label>
                                <div 
                                    onClick={handleSigClick}
                                    style={{ height: '110px', border: config.signatureUrl ? '2px solid #10B981' : '2px dashed #CBD5E1', borderRadius: '10px', background: config.signatureUrl ? '#ECFDF5' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer', padding: '0.5rem', position: 'relative' }}
                                    title="Click to upload electronic signature image from your device"
                                >
                                    {config.signatureUrl ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                            <img src={config.signatureUrl} alt="Authorized Signature" style={{ maxHeight: '70px', maxWidth: '90%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#065F46', marginTop: '4px' }}>✓ Signature Attached (Click to Change)</span>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud size={24} color="#94A3B8" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1B6B3A', marginTop: '4px' }}>Upload Signature PNG</span>
                                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>Pick signature file from your device</span>
                                        </>
                                    )}
                                </div>
                                {config.signatureUrl && (
                                    <button 
                                        type="button"
                                        onClick={handleRemoveSignature}
                                        style={{ border: 'none', background: '#FEF2F2', color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', padding: '0.2rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginTop: '0.4rem' }}
                                    >
                                        Remove Signature
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* ── 1. ICAI Credential Verification Gate ── */}
            <div style={{
                borderRadius: '16px',
                padding: '1.75rem',
                border: caVerificationStatus === 'VERIFIED' ? '1.5px solid #10B981' : (caVerificationStatus === 'PENDING_REVIEW' ? '1.5px solid #F59E0B' : (caVerificationStatus === 'REJECTED' ? '1.5px solid #EF4444' : '1.5px solid #3B82F6')),
                background: caVerificationStatus === 'VERIFIED' ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' : (caVerificationStatus === 'PENDING_REVIEW' ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : (caVerificationStatus === 'REJECTED' ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)')),
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: caVerificationStatus === 'VERIFIED' ? '#10B981' : (caVerificationStatus === 'PENDING_REVIEW' ? '#F59E0B' : (caVerificationStatus === 'REJECTED' ? '#EF4444' : '#2563EB')),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0
                        }}>
                            {caVerificationStatus === 'VERIFIED' ? <ShieldCheck size={26} /> : (caVerificationStatus === 'PENDING_REVIEW' ? <Clock size={26} /> : (caVerificationStatus === 'REJECTED' ? <AlertTriangle size={26} /> : <Award size={26} />))}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: caVerificationStatus === 'VERIFIED' ? '#047857' : (caVerificationStatus === 'PENDING_REVIEW' ? '#B45309' : (caVerificationStatus === 'REJECTED' ? '#B91C1C' : '#1D4ED8')),
                                    color: 'white'
                                }}>
                                    {caVerificationStatus === 'VERIFIED' ? 'ICAI Verified & Approved' : (caVerificationStatus === 'PENDING_REVIEW' ? 'Verification Pending Approval' : (caVerificationStatus === 'REJECTED' ? 'Verification Rejected' : 'Verification Required'))}
                                </span>
                                {caVerificationStatus === 'VERIFIED' && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#047857' }}>
                                        ICAI #{icaiVerification.membershipNo}
                                    </span>
                                )}
                            </div>
                            <h3 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>
                                {caVerificationStatus === 'VERIFIED' 
                                    ? `Verified Chartered Accountant — ${icaiVerification.fullName || 'Member'}` 
                                    : (caVerificationStatus === 'PENDING_REVIEW' 
                                        ? `ICAI Verification Under Administrator Review` 
                                        : (caVerificationStatus === 'REJECTED' 
                                            ? `ICAI Verification Rejected` 
                                            : `Chartered Accountant (ICAI) Credential Gate`))}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', maxWidth: '650px', lineHeight: '1.45' }}>
                                {caVerificationStatus === 'VERIFIED'
                                    ? `Your ICAI credentials have been officially authenticated by the administrator. Full access to FIN-PRO advisory modules and practice tools is unlocked.`
                                    : (caVerificationStatus === 'PENDING_REVIEW'
                                        ? `Your submission for ${icaiVerification.fullName || 'Applicant'} (ICAI #${icaiVerification.membershipNo}) has been dispatched to the Cliks Administrator. The dashboard and subscription will open once approved.`
                                        : (caVerificationStatus === 'REJECTED'
                                            ? `Your submitted details could not be validated against the official ICAI register. Please review your Registration No. and Firm name, then re-submit.`
                                            : `FIN-PRO is exclusively accessible to certified Chartered Accountants with an active Certificate of Practice (COP). Only verified CA professionals can access this suite.`))}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons based on status */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {caVerificationStatus === 'UNVERIFIED' && (
                            <button
                                type="button"
                                onClick={() => { setIsEditMode(false); setShowIcaiModal(true); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ShieldCheck size={18} /> Verify ICAI Credentials
                            </button>
                        )}

                        {caVerificationStatus === 'PENDING_REVIEW' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsEditMode(true); setShowIcaiModal(true); }}
                                    style={{
                                        padding: '0.65rem 1.1rem',
                                        borderRadius: '8px',
                                        background: 'white',
                                        border: '1.5px solid #CBD5E1',
                                        color: '#334155',
                                        fontSize: '0.85rem',
                                        fontWeight: '750',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Modify Details
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSimulateAdminVerify}
                                    title="Click to simulate admin approval for testing"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '0.65rem 1.1rem',
                                        borderRadius: '8px',
                                        background: '#10B981',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    <Sparkles size={16} /> Simulate Admin Verify
                                </button>
                            </div>
                        )}

                        {caVerificationStatus === 'REJECTED' && (
                            <button
                                type="button"
                                onClick={() => { setIsEditMode(true); setShowIcaiModal(true); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.35rem',
                                    borderRadius: '10px',
                                    background: '#DC2626',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
                                <Edit size={16} /> Modify & Re-submit Credentials
                            </button>
                        )}

                        {caVerificationStatus === 'VERIFIED' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsEditMode(false); setShowIcaiModal(true); }}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        borderRadius: '8px',
                                        background: 'white',
                                        border: '1px solid #A7F3D0',
                                        color: '#065F46',
                                        fontSize: '0.82rem',
                                        fontWeight: '750',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View Dossier
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 2. FIN-PRO Subscription & Dashboard Area ── */}
            {caVerificationStatus !== 'VERIFIED' ? (
                /* Locked State: Cannot subscribe or view dashboard until verified by admin */
                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                        <Lock size={28} />
                    </div>
                    <div style={{ maxWidth: '480px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', margin: '0 0 0.35rem 0' }}>
                            FIN-PRO Dashboard & Subscription Locked
                        </h4>
                        <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                            {caVerificationStatus === 'PENDING_REVIEW'
                                ? 'Your credentials have been submitted and are awaiting administrator verification. The FIN-PRO subscription plans and auditor dashboard will automatically unlock once approved.'
                                : 'To access FIN-PRO subscriptions and open the auditor dashboard, you must first verify your ICAI registration credentials above.'}
                        </p>
                    </div>
                    {caVerificationStatus === 'UNVERIFIED' && (
                        <button
                            type="button"
                            onClick={() => { setIsEditMode(false); setShowIcaiModal(true); }}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.65rem 1.25rem',
                                borderRadius: '8px',
                                background: '#1B6B3A',
                                color: 'white',
                                border: 'none',
                                fontWeight: '750',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            Verify ICAI Credentials Now
                        </button>
                    )}
                </div>
            ) : (
                /* Verified by Admin: Check subscription status */
                !isFinProSubscribed ? (
                    /* Show Subscription Plans */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            padding: '1.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Crown size={20} color="#F59E0B" />
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>
                                        ICAI Verified ✓ Choose Your FIN-PRO Subscription
                                    </h3>
                                </div>
                                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                                    Your professional credentials have been validated! Select a FIN-PRO plan below to activate your auditor workspace and unlock the dashboard.
                                </p>
                            </div>
                            <span style={{
                                padding: '6px 14px',
                                borderRadius: '999px',
                                background: '#FEF3C7',
                                color: '#B45309',
                                fontSize: '0.78rem',
                                fontWeight: '800'
                            }}>
                                Subscription Required for Dashboard
                            </span>
                        </div>

                        {/* Subscription Tier Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {/* Plan 1: Fin-Pro Solo */}
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                border: '1.5px solid #E2E8F0',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                transition: 'all 0.2s'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Individual Practice</span>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#0F172A', margin: '0.25rem 0 0.5rem 0' }}>Fin-Pro Solo</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>₹999</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>/ year</span>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                                        Designed for sole practitioner Chartered Accountants managing SME tax filings and audit compliance.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.83rem', color: '#334155' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> 50 Connected SME Clients</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Automated CARO 2020 Working Papers</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Real-Time GST & TDS Audit Scanners</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Statutory Disclosures & Export Suite</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSubscribeFinPro('Fin-Pro Solo')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        background: 'white',
                                        border: '2px solid #2563EB',
                                        color: '#2563EB',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#2563EB'; }}
                                >
                                    Subscribe to Fin-Pro Solo
                                </button>
                            </div>

                            {/* Plan 2: Fin-Pro Firm */}
                            <div style={{
                                background: '#0F172A',
                                borderRadius: '16px',
                                border: '2px solid #F59E0B',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                color: 'white'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    right: '20px',
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    color: 'white',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase'
                                }}>
                                    RECOMMENDED
                                </span>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full CA Practice</span>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#FFFFFF', margin: '0.25rem 0 0.5rem 0' }}>Fin-Pro Firm</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF' }}>₹1,499</span>
                                        <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>/ year</span>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                                        Multi-partner chartered practice with unlimited clients, article clerk teams, and AI forensic auditing.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.83rem', color: '#E2E8F0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Unlimited Client Ledgers & Portals</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Multi-Partner Team Permission Matrix</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> AI Forensic Anomaly & Fraud Detection</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Direct Resolution Vault & Client Chat</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSubscribeFinPro('Fin-Pro Firm')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Subscribe to Fin-Pro Firm
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Subscribed & Verified: Display Open Dashboard button and full configuration */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Status & Dashboard Launch Bar */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: '1.5px solid #10B981',
                            padding: '1.5rem 1.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={22} color="#10B981" />
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>
                                        FIN-PRO Advisory Suite Unlocked & Active
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', background: '#ECFDF5', color: '#065F46', padding: '2px 8px', borderRadius: '999px', fontWeight: '800', border: '1px solid #A7F3D0' }}>
                                        {icaiVerification.subscription?.plan_name || 'Fin-Pro Solo'} Plan
                                    </span>
                                </div>
                                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                                    ICAI credentials authenticated and subscription confirmed. You have full access to the FIN-PRO Command Centre.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/ca')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    Open FIN-PRO Dashboard <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Existing Advanced Ledgers & Analytics Settings */}
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
                                <div style={{ padding: '1rem', background: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#F8FAFC' }}>
                                    <Crown size={16} color="#F59E0B" /> FIN-PRO PLATINUM SUITE
                                </div>
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Auditor License</span>
                                            <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                FIN-PRO <span style={{ fontSize: '0.65rem', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', color: 'white', padding: '1px 6px', borderRadius: '100px', fontWeight: '800' }}>ACTIVE</span>
                                            </h3>
                                        </div>
                                        <Zap size={24} color="#F59E0B" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#94A3B8' }}>ICAI Reg Number</span>
                                            <span style={{ fontWeight: '750', color: '#10B981' }}>#{icaiVerification.membershipNo}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#94A3B8' }}>Active Tier</span>
                                            <span style={{ fontWeight: '750', color: '#FFFFFF' }}>{icaiVerification.subscription?.plan_name || 'Fin-Pro Solo'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#94A3B8' }}>COP Status</span>
                                            <span style={{ fontWeight: '750', color: '#10B981' }}>{icaiVerification.copStatus || 'ACTIVE'}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/ca')}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: '#10B981',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        Launch FIN-PRO Dashboard <ExternalLink size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
    const renderGeneral = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Core & Features Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <CustomizationCard title={t('applicationCore', 'Application Core')} icon={Sliders}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <PremiumToggleItem label={t('securityPasscode', 'Security Passcode')} desc={t('securityPasscodeDesc', 'Validate auth tokens before destructive operations.')} active={config.passcode} onToggle={() => handleToggle('passcode')} />
                            {config.passcode && (
                                <div style={{ marginLeft: '2.75rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>Security PIN:</label>
                                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                        <input 
                                            type={showPin ? 'text' : 'password'} 
                                            maxLength={6} 
                                            value={config.passcodePin || '1234'} 
                                            onChange={(e) => handleTextChange('passcodePin', e.target.value)} 
                                            style={{ width: '95px', padding: '0.35rem 1.7rem 0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '800', letterSpacing: '2px', fontSize: '0.9rem' }} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(prev => !prev)}
                                            style={{ position: 'absolute', right: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                            title={showPin ? 'Hide PIN' : 'Show PIN'}
                                        >
                                            {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Default: 1234</span>
                                </div>
                            )}
                            <Divider />
                            <PremiumToggleItem label={t('preventNegativeInventory', 'Prevent Negative Inventory')} desc={t('preventNegativeInventoryDesc', 'Restrict invoicing items when stock level <= 0.')} active={config.negativeStock} onToggle={() => handleToggle('negativeStock')} />
                            <Divider />
                            <PremiumToggleItem label={t('lockContactGeneration', 'Lock Contact Generation')} desc={t('lockContactGenerationDesc', 'Prevent new customer/supplier records within standard transaction forms.')} active={config.blockParties} onToggle={() => handleToggle('blockParties')} />
                        </div>
                    </CustomizationCard>
                    <CustomizationCard title={t('operationalFeatures', 'Operational Features')} icon={Truck}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <PremiumToggleItem label={t('activateDeliveryChallans', 'Activate Delivery Challans')} active={config.deliveryChallan} onToggle={() => handleToggle('deliveryChallan')} />
                            {config.deliveryChallan && (
                                <div style={{ marginLeft: '2.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={config.reverseGoodsLogic} 
                                            onChange={() => handleToggle('reverseGoodsLogic')} 
                                            style={{ accentColor: '#1B6B3A' }} 
                                        /> {t('reverseGoodsLogic', 'Reverse Goods Logic')}
                                    </label>
                                    <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={config.displayAmountChallan} 
                                            onChange={() => handleToggle('displayAmountChallan')} 
                                            style={{ accentColor: '#1B6B3A' }} 
                                        /> {t('displayAmount', 'Display Amount')}
                                    </label>
                                </div>
                            )}
                        </div>
                    </CustomizationCard>
                </div>
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <CustomizationCard title={t('warehousing', 'Warehousing')} icon={ArrowRightLeft}>
                        <PremiumToggleItem label={t('godownLinks', 'Godown Links')} active={config.godown} onToggle={() => handleToggle('godown')} />
                    </CustomizationCard>
                    <CustomizationCard title={t('integrity', 'Integrity & Security')} icon={Database}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <PremiumToggleItem label={t('autoBackup', 'Auto Backup')} active={config.autoBackup} onToggle={() => handleToggle('autoBackup')} />
                            <PremiumToggleItem label={t('auditTrail', 'Audit Trail')} active={config.auditTrail} onToggle={() => handleToggle('auditTrail')} />
                        </div>
                    </CustomizationCard>
                </div>
            </div>

            {/* System Preferences & Settings Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <CustomizationCard title={t('preferences', 'Preferences')} icon={Globe}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label={t('darkMode', 'Dark Mode')} 
                            desc={t('darkModeDesc', 'Use a dark theme for the application interface.')} 
                            active={config.darkMode} 
                            onToggle={() => handleToggle('darkMode')} 
                        />
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#334155' }}>{t('language', 'Language')}</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>{t('systemLanguageDesc', 'System localization language')}</p>
                            </div>
                            <select 
                                value={config.language || 'EN-US'} 
                                onChange={(e) => handleTextChange('language', e.target.value)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: '750', color: '#1E293B', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="EN-US">EN-US (English)</option>
                                <option value="HI-IN">HI-IN (Hindi)</option>
                                <option value="TA-IN">TA-IN (Tamil)</option>
                                <option value="TE-IN">TE-IN (Telugu)</option>
                                <option value="MR-IN">MR-IN (Marathi)</option>
                                <option value="GU-IN">GU-IN (Gujarati)</option>
                            </select>
                        </div>
                    </div>
                </CustomizationCard>

                <CustomizationCard title={t('notifications', 'Notifications')} icon={Bell}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label={t('pushNotifications', 'Push Notifications')} 
                            desc="Receive real-time alerts for updates and activities." 
                            active={config.notifications} 
                            onToggle={() => handleToggle('notifications')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label={t('emailDigest', 'Email Digest')} 
                            desc="Receive a weekly summary of your financial activity." 
                            active={config.emailDigest} 
                            onToggle={() => handleToggle('emailDigest')} 
                        />
                    </div>
                </CustomizationCard>

                <CustomizationCard title={t('privacySecurity', 'Privacy & Security')} icon={Shield}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem 
                            label={t('publicProfile', 'Public Profile')} 
                            desc="Allow other users on the platform to find you." 
                            active={config.publicProfile} 
                            onToggle={() => handleToggle('publicProfile')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label={t('twoFactor', 'Two-Factor Authentication')} 
                            desc="Add an extra layer of security to your account." 
                            active={config.twoFactor} 
                            onToggle={() => handleToggle('twoFactor')} 
                        />
                        <Divider />
                        <PremiumToggleItem 
                            label={t('dataSharing', 'Data & Analytics')} 
                            desc="Allow usage data to be collected to improve experience." 
                            active={config.dataSharing} 
                            onToggle={() => handleToggle('dataSharing')} 
                        />
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

    const renderPrint = () => {
        const isThermal = config.printerType === 'thermal' || (config.paperSize && config.paperSize.includes('Thermal'));

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <CustomizationCard title="Printer Mechanism" icon={Printer}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <button 
                                type="button"
                                onClick={() => handleTextChange('printerType', 'regular')} 
                                style={{ 
                                    flex: 1, 
                                    padding: '0.75rem', 
                                    borderRadius: '10px', 
                                    border: config.printerType === 'regular' ? '2px solid #8B5CF6' : '1px solid #CBD5E1', 
                                    background: config.printerType === 'regular' ? '#8B5CF6' : '#FFFFFF', 
                                    color: config.printerType === 'regular' ? '#FFFFFF' : '#475569', 
                                    fontWeight: '800', 
                                    cursor: 'pointer', 
                                    boxShadow: config.printerType === 'regular' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                                    transition: 'all 0.2s' 
                                }}
                            >
                                REGULAR
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleTextChange('printerType', 'thermal')} 
                                style={{ 
                                    flex: 1, 
                                    padding: '0.75rem', 
                                    borderRadius: '10px', 
                                    border: config.printerType === 'thermal' ? '2px solid #8B5CF6' : '1px solid #CBD5E1', 
                                    background: config.printerType === 'thermal' ? '#8B5CF6' : '#FFFFFF', 
                                    color: config.printerType === 'thermal' ? '#FFFFFF' : '#475569', 
                                    fontWeight: '800', 
                                    cursor: 'pointer', 
                                    boxShadow: config.printerType === 'thermal' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                                    transition: 'all 0.2s' 
                                }}
                            >
                                THERMAL
                            </button>
                        </div>
                        <CheckboxWithLabel label="Repeat header on multi-sheet outputs" checked={config.repeatHeader} onChange={() => handleToggle('repeatHeader')} />
                        <button
                            type="button"
                            onClick={handleTestPrint}
                            style={{
                                marginTop: '1.25rem',
                                width: '100%',
                                padding: '0.7rem 1rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Printer size={16} /> Test Print Output ({isThermal ? '3" Thermal Receipt' : (config.paperSize || 'A4 Size')})
                        </button>
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
                    <div style={{ padding: '1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                        <Eye size={16} color="#8B5CF6" /> VIEWPORT PREVIEW ({isThermal ? 'THERMAL RECEIPT' : 'REGULAR SHEET'})
                    </div>
                    <div style={{ padding: '2rem', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
                        {isThermal ? (
                            <div style={{ width: '220px', background: 'white', border: '1px dashed #CBD5E1', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'monospace' }}>
                                <div style={{ textTransform: 'uppercase', textAlign: 'center', fontWeight: '900', fontSize: '0.8rem', color: '#0F172A' }}>
                                    {config.displayTitlePrint || 'MY BUSINESS'}
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#64748B', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                                    RECEIPT #{config.prefixSale || 'INV-'}001
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#334155', marginTop: '0.2rem' }}>
                                    <span>Item Sample x1</span>
                                    <span>₹500.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#334155' }}>
                                    <span>Item Sample x2</span>
                                    <span>₹500.00</span>
                                </div>
                                <div style={{ borderTop: '1px dashed #0F172A', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '0.75rem', color: '#0F172A' }}>
                                    <span>TOTAL:</span>
                                    <span>₹1,000.00</span>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.55rem', color: '#94A3B8', marginTop: '0.4rem', borderTop: '1px dashed #E2E8F0', paddingTop: '0.3rem' }}>
                                    *** THANK YOU ***
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: '80%', background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.85rem' }}>{config.displayTitlePrint || 'MY BUSINESS'}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700' }}>{config.prefixSale || 'INV-'}001</div>
                                </div>
                                <div style={{ height: '8px', background: '#F1F5F9', width: '100%', borderRadius: '4px' }}></div>
                                <div style={{ height: '8px', background: '#F1F5F9', width: '80%', borderRadius: '4px' }}></div>
                                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    {config.signatureUrl && <div style={{ fontSize: '0.5rem', color: '#10B981', fontStyle: 'italic', border: '1px dashed #10B981', padding: '2px 4px', transform: 'rotate(-5deg)', fontWeight: '800' }}>SIGNED</div>}
                                </div>
                            </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '1rem', fontWeight: '750', textTransform: 'uppercase' }}>
                            Active Dimension: {config.paperSize || (isThermal ? '3 Inch (Thermal)' : 'A4 Size')}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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

    const handleApplyBeta = () => {
        const isAlreadyApplied = Boolean(config.betaClubApplied);
        const newStatus = !isAlreadyApplied;
        setConfig(prev => ({ ...prev, betaClubApplied: newStatus }));
        if (newStatus) {
            alert('✅ Beta Club Application Submitted! Your business workspace has been queued for priority board review.');
        } else {
            alert('Application withdrawn.');
        }
    };

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                    <button 
                        onClick={handleApplyBeta} 
                        style={{ 
                            background: config.betaClubApplied ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                            color: '#FFFFFF', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' 
                        }}
                    >
                        <Crown size={18} /> {config.betaClubApplied ? '✓ APPLICATION UNDER BOARD REVIEW' : 'APPLY FOR ACCESS'}
                    </button>
                    {config.betaClubApplied && (
                        <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '750', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Status: Priority Queue Assigned — Board Review Pending
                        </div>
                    )}
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


    return (
        <div className="premium-container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>
                        <ArrowLeft size={16} /> {t('back', 'BACK')}
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>{t('advancedEngineConfig', 'Advanced Engine Configuration')}</h1>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Manage dynamic deployment switches and high-level metadata configuration.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)', opacity: isSaving ? 0.7 : 1, fontSize: '0.85rem' }}>
                    <Save size={18} /> {isSaving ? 'Saving...' : t('deployConfig', 'DEPLOY CONFIG')}
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

            {/* ── ICAI Credential Verification Modal ── */}
            {showIcaiModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            background: '#0F172A',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #1E293B'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={22} color="#F59E0B" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>
                                        ICAI Credential Audit & Verification
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                                        Statutory Chartered Accountant registration validation for FIN-PRO Suite
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowIcaiModal(false); setIsEditMode(false); }}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            {caVerificationStatus !== 'UNVERIFIED' && !isEditMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* Status Alert Banner */}
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: caVerificationStatus === 'VERIFIED' ? '#ECFDF5' : (caVerificationStatus === 'PENDING_REVIEW' ? '#FFFBEB' : '#FEF2F2'),
                                        border: `1px solid ${caVerificationStatus === 'VERIFIED' ? '#6EE7B7' : (caVerificationStatus === 'PENDING_REVIEW' ? '#FCD34D' : '#FECACA')}`,
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        {caVerificationStatus === 'VERIFIED' ? <ShieldCheck size={22} color="#059669" /> : (caVerificationStatus === 'PENDING_REVIEW' ? <Clock size={22} color="#D97706" /> : <AlertTriangle size={22} color="#DC2626" />)}
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: caVerificationStatus === 'VERIFIED' ? '#065F46' : (caVerificationStatus === 'PENDING_REVIEW' ? '#92400E' : '#991B1B') }}>
                                                {caVerificationStatus === 'VERIFIED' ? 'ICAI Member Officially Verified & Active' : (caVerificationStatus === 'PENDING_REVIEW' ? 'Pending Administrator Institutional Review' : 'Verification Unsuccessful')}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: caVerificationStatus === 'VERIFIED' ? '#047857' : (caVerificationStatus === 'PENDING_REVIEW' ? '#B45309' : '#B91C1C'), marginTop: '2px', lineHeight: '1.4' }}>
                                                {caVerificationStatus === 'VERIFIED'
                                                    ? 'Your professional credentials are authenticated. You are authorized to activate FIN-PRO subscriptions and launch the auditor dashboard.'
                                                    : (caVerificationStatus === 'PENDING_REVIEW'
                                                        ? 'Your credentials have been submitted for official audit by the Cliks Administrator. The FIN-PRO suite will be accessible upon confirmation.'
                                                        : 'The submitted details could not be verified against the official ICAI register. Please modify your information and re-submit.')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dossier Grid */}
                                    <div style={{
                                        background: '#F8FAFC',
                                        borderRadius: '14px',
                                        border: '1px solid #E2E8F0',
                                        padding: '18px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '14px'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CA Full Name</span>
                                            <div style={{ fontSize: '14px', fontWeight: '750', color: '#1E293B', marginTop: '2px' }}>{icaiVerification.fullName || '—'}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>ICAI Membership / Reg No</span>
                                            <div style={{ fontSize: '14px', fontWeight: '850', color: '#047857', marginTop: '2px', fontFamily: 'monospace' }}>#{icaiVerification.membershipNo || '—'}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Firm / Practice Name</span>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', marginTop: '2px' }}>{icaiVerification.firmName || 'Independent Practice'}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Official Email</span>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', marginTop: '2px' }}>{icaiVerification.email || '—'}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>COP Status</span>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#047857', marginTop: '2px' }}>{icaiVerification.copStatus || 'ACTIVE'}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Regional Council</span>
                                            <div style={{ fontSize: '13px', fontWeight: '650', color: '#334155', marginTop: '2px' }}>{icaiVerification.region || '—'}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Professional Address</span>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#475569', marginTop: '2px' }}>{icaiVerification.address || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                                        {caVerificationStatus === 'REJECTED' && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditMode(true)}
                                                style={{ padding: '8px 18px', borderRadius: '8px', background: '#DC2626', color: 'white', border: 'none', fontWeight: '750', fontSize: '13px', cursor: 'pointer' }}
                                            >
                                                Edit & Re-submit
                                            </button>
                                        )}
                                        {caVerificationStatus === 'PENDING_REVIEW' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditMode(true)}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', border: '1px solid #CBD5E1', color: '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                                                >
                                                    Modify Submission
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { handleSimulateAdminVerify(); setShowIcaiModal(false); }}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#10B981', border: 'none', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                                                >
                                                    Simulate Admin Approval
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setShowIcaiModal(false); setIsEditMode(false); }}
                                            style={{ padding: '8px 18px', borderRadius: '8px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Credential Entry Form */
                                <form onSubmit={handleSubmitIcai} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                CA Full Name <span style={{ color: '#EF4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. CA Rajesh Sharma"
                                                value={icaiFormData.fullName}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                ICAI Membership / Reg No. <span style={{ color: '#EF4444' }}>* (6 Digits)</span>
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                required
                                                placeholder="e.g. 084921"
                                                value={icaiFormData.membershipNo}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, membershipNo: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontFamily: 'monospace', fontWeight: '750', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Firm / Practice Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Sharma & Associates LLP"
                                                value={icaiFormData.firmName}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, firmName: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Official Professional Email <span style={{ color: '#EF4444' }}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="e.g. ca.sharma@bnxmail.com"
                                                value={icaiFormData.email}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, email: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Certificate of Practice (COP) Status
                                            </label>
                                            <select
                                                value={icaiFormData.copStatus}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, copStatus: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                                            >
                                                <option value="ACTIVE">Active (Holding Valid COP)</option>
                                                <option value="INACTIVE">Inactive / Under Transfer</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Designation / Classification
                                            </label>
                                            <select
                                                value={icaiFormData.associateFellow}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, associateFellow: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                                            >
                                                <option value="Associate Member (ACA)">Associate Member (ACA)</option>
                                                <option value="Fellow Member (FCA)">Fellow Member (FCA)</option>
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Regional Council Jurisdiction
                                            </label>
                                            <select
                                                value={icaiFormData.region}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, region: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                                            >
                                                <option value="Southern India Regional Council (SIRC)">Southern India Regional Council (SIRC)</option>
                                                <option value="Western India Regional Council (WIRC)">Western India Regional Council (WIRC)</option>
                                                <option value="Northern India Regional Council (NIRC)">Northern India Regional Council (NIRC)</option>
                                                <option value="Eastern India Regional Council (EIRC)">Eastern India Regional Council (EIRC)</option>
                                                <option value="Central India Regional Council (CIRC)">Central India Regional Council (CIRC)</option>
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                                                Registered Office Address
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="Enter firm or practice registered address as per ICAI records"
                                                value={icaiFormData.address}
                                                onChange={(e) => setIcaiFormData(prev => ({ ...prev, address: e.target.value }))}
                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setShowIcaiModal(false); setIsEditMode(false); }}
                                            style={{ padding: '10px 18px', borderRadius: '8px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: '750', fontSize: '13px', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ padding: '10px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', border: 'none', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                                        >
                                            Submit for Institutional Verification
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const ProfileInputField = ({ label, icon: Icon, error, helper, style, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <Icon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: error ? '#EF4444' : '#94A3B8' }} />
            <input 
                {...props} 
                style={{ 
                    width: '100%', 
                    padding: '0.6rem 0.6rem 0.6rem 2.5rem', 
                    borderRadius: '8px', 
                    border: error ? '1.5px solid #EF4444' : (props.value && String(props.value).length === 15 ? '1.5px solid #10B981' : '1px solid #E2E8F0'), 
                    background: 'white', 
                    outline: 'none', 
                    fontSize: '0.85rem', 
                    boxSizing: 'border-box',
                    ...style 
                }} 
            />
        </div>
        {helper && <div style={{ marginTop: '0.1rem' }}>{helper}</div>}
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
