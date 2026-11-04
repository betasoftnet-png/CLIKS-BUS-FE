import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ShieldCheck, TrendingUp, TrendingDown,
    PlayCircle, Users, Shield, Star, CreditCard, LineChart,
    Target, UserPlus, Sparkles, Check, BarChart3, Package,
    ShoppingCart, Wallet, Receipt, Warehouse, Factory, FileText,
    Clock, Truck, Briefcase, Zap, Globe, Monitor, Lock, Headphones,
    Award, ChevronRight, ChevronDown, DollarSign, PieChart,
    LayoutDashboard, Loader2, AlertCircle, ArrowLeft, Building2,
    Sliders, RefreshCw, Smartphone, Printer, CheckCircle2,
    ExternalLink, Menu, X, ArrowUpRight, Cpu
} from 'lucide-react';

import logoPng from '../assets/cliks.png';
import { useAuth } from '../context';
import referralService from '../services/referralService';

// Module Interactive Showcase Configuration
const MODULE_SHOWCASE = [
    {
        id: 'invoicing',
        name: 'GST Billing & E-Way',
        badge: 'Compliant with GST 2.0',
        icon: Receipt,
        headline: 'Automated GST Invoicing with 1-Click E-Way Bill & IRN QR',
        description: 'Generate GST-compliant B2B and B2C invoices, compute CGST/SGST/IGST automatically based on place of supply, and generate official IRN QR codes with zero manual reconciliation.',
        metrics: [
            { label: 'Avg Invoicing Speed', value: '< 15 secs' },
            { label: 'E-Way Auto Generated', value: '100% Tax Compliant' },
            { label: 'Direct WhatsApp Dispatch', value: 'Instant Delivery' }
        ],
        previewData: {
            title: 'Tax Invoice — B2B Verified',
            code: 'INV-2026-9841',
            date: '04 Nov 2026',
            party: 'Mahalaxmi Wholesale Distributors Pvt Ltd',
            gstin: '27AABCU9603R1ZM',
            items: [
                { desc: 'Industrial Grade Heavy Bearings (SKU-HB90)', hsn: '8482', qty: '120 PCS', rate: '₹1,250', tax: '18% GST', total: '₹1,77,000' },
                { desc: 'Synthetic Lubricant Grease Drum (50L)', hsn: '2710', qty: '15 UNITS', rate: '₹4,800', tax: '18% GST', total: '₹84,960' }
            ],
            subtotal: '₹2,61,960',
            cgst: '₹23,576.40',
            sgst: '₹23,576.40',
            grandTotal: '₹3,09,112.80'
        }
    },
    {
        id: 'inventory',
        name: 'Multi-Godown Inventory',
        badge: 'FIFO & Batch Tracking',
        icon: Warehouse,
        headline: 'Real-Time Stock Quantities, Batch Expiry & Inter-Branch Transfers',
        description: 'Track inventory across central godowns, transit hubs, and retail showrooms. Automated low-stock replenishment alerts, scannable Code-128 barcodes, and physical audit reconcile sheets.',
        metrics: [
            { label: 'Real-Time Sync Accuracy', value: '99.98%' },
            { label: 'Stock Valuation Method', value: 'FIFO & Weighted Avg' },
            { label: 'Transit Loss Reduction', value: 'Down by 78%' }
        ],
        previewData: {
            title: 'Central Godown Matrix — Live Physical Counts',
            godowns: [
                { name: 'Central Godown A (Bhiwandi, MH)', skus: '4,120 SKUs', capacity: '86% Utilized', status: 'Optimal' },
                { name: 'Showroom North Transit (Delhi NCR)', skus: '1,890 SKUs', capacity: '64% Utilized', status: 'Optimal' },
                { name: 'South Distribution Hub (Bangalore)', skus: '3,450 SKUs', capacity: '92% Utilized', status: 'Reorder High' }
            ],
            recentAdjustment: {
                item: 'Alloy Drill Bit Set (12mm-24mm)',
                ref: 'AUD-ADJ-2026',
                auditor: 'Rajesh Nair (Internal Audit)',
                diff: '+250 PCS'
            }
        }
    },
    {
        id: 'accounting',
        name: 'Finance & Audit Center',
        badge: 'Double-Entry System',
        icon: BanknoteIcon,
        headline: 'Automated Accounting Journals & Real-Time Chartered Accountant Portal',
        description: 'Every sale, purchase bill, and expense automatically posts to your general ledger. Give your ICAI-verified CA read-only direct portal access for painless quarterly tax filings.',
        metrics: [
            { label: 'CA Audit Readiness', value: '1-Click Export' },
            { label: 'Automatic Journal Entries', value: 'Zero Manual Entry' },
            { label: 'Reconciliation Speed', value: '5x Faster' }
        ],
        previewData: {
            title: 'Automated General Ledger & ITC Reconciliation',
            accounts: [
                { name: 'HDFC Current Bank Account', type: 'Asset', balance: '₹42,85,910.40', trend: '+14.2%' },
                { name: 'Input Tax Credit Pool (GSTR-2B Claimed)', type: 'Tax Asset', balance: '₹8,45,210.00', trend: 'Reconciled' },
                { name: 'Accounts Payable (Raw Material Vendors)', type: 'Liability', balance: '₹14,20,500.00', trend: 'Due in 15d' }
            ],
            auditBadge: 'ICAI Fin-Pro Verified • 100% Reconciled'
        }
    },
    {
        id: 'payroll',
        name: 'Staff & Payroll HRMS',
        badge: 'Biometric & Attendance',
        icon: Users,
        headline: 'Automated Salary Calculations, Staff Claims & Shift Attendance',
        description: 'Manage staff salaries, deductions, travel reimbursement claims, and department budgets. Generate bank-ready NEFT payout files and payslips in seconds.',
        metrics: [
            { label: 'Payroll Processing Time', value: '< 2 minutes' },
            { label: 'Direct Bank NEFT File', value: 'Ready to Upload' },
            { label: 'Compliance Tracking', value: 'PF, ESI & TDS Ready' }
        ],
        previewData: {
            title: 'Payroll Disbursement Register — November 2026',
            disbursements: [
                { name: 'Sanjay Sharma', role: 'Plant Supervisor', net: '₹58,400', status: 'Approved for Bank Disbursal' },
                { name: 'Ananya Deshmukh', role: 'Senior Tax Accountant', net: '₹72,000', status: 'Approved for Bank Disbursal' },
                { name: 'Karthik Pillai', role: 'Warehouse Logistics Lead', net: '₹44,500', status: 'Processing' }
            ],
            totalPayroll: '₹18,45,900',
            reimbursementVouchers: '14 Approved Claims'
        }
    }
];

function BanknoteIcon(props) {
    return <CreditCard {...props} />;
}

export default function Landing() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTabId, setActiveTabId] = useState('invoicing');
    const [pricingAnnual, setPricingAnnual] = useState(true);
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    // Interactive ROI Calculator State
    const [monthlyTurnover, setMonthlyTurnover] = useState(25); // In Lakhs
    const [monthlyInvoices, setMonthlyInvoices] = useState(350);

    const { isAuthenticated, user, ssoLogin } = useAuth();
    const [isProcessingAuth, setIsProcessingAuth] = useState(false);
    const [authError, setAuthError] = useState('');
    const [processedCode, setProcessedCode] = useState(null);

    const CLIENT_ID = 'cliks-business';
    const REDIRECT_URI = 'https://cliksbusiness.com/';
    const BNX_AUTH_URL = 'https://www.b2auth.com';
    const BNX_API_URL = 'https://api.bnxmail.com';

    // Calculation estimates
    const estimatedItcRecovered = useMemo(() => {
        // Average 2.8% leakage caught by automated GSTR-2B reconciliation
        const yearlyTurnover = monthlyTurnover * 12 * 100000;
        return Math.round((yearlyTurnover * 0.028));
    }, [monthlyTurnover]);

    const estimatedHoursSaved = useMemo(() => {
        // approx 1.8 mins per manual invoice entry + audit time
        return Math.round((monthlyInvoices * 1.8 * 12) / 60);
    }, [monthlyInvoices]);

    // Handle OAuth Callback
    const handleOAuthCallback = React.useCallback(async (code) => {
        setIsProcessingAuth(true);
        setAuthError('');

        try {
            let bnxToken = null;
            try {
                const tokenRes = await fetch(`${BNX_API_URL}/api/oauth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        grant_type: 'authorization_code',
                        grantType: 'authorization_code',
                        code,
                        client_id: CLIENT_ID,
                        clientId: CLIENT_ID,
                        client_secret: 'secure-cliks-biz-secret-2026',
                        clientSecret: 'secure-cliks-biz-secret-2026',
                        redirect_uri: REDIRECT_URI,
                        redirectUri: REDIRECT_URI
                    })
                });

                const tokenData = await tokenRes.json().catch(() => ({}));
                bnxToken = tokenData.access_token || tokenData.data?.access_token || tokenData.token || tokenData.data?.token || (typeof tokenData.data === 'string' ? tokenData.data : null);
            } catch (fetchErr) {
                console.warn('[SSO Token Exchange Notice]', fetchErr.message);
            }

            if (!bnxToken) {
                if (typeof code === 'string' && (code.startsWith('eyJ') || code.length > 10)) {
                    bnxToken = code;
                } else {
                    bnxToken = `sso-session-token-${code}`;
                }
            }

            await ssoLogin(bnxToken, 'BUSINESS');

            const pendingRef = localStorage.getItem('cliks_referral_code') || sessionStorage.getItem('cliks_pending_ref');
            if (pendingRef) {
                try {
                    referralService.validateAndApplyReferralCode(pendingRef, 'user@cliks.in');
                } catch (e) {
                    console.warn('[Landing] Referral apply notice:', e);
                }
            }

            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('SSO Exchange error:', err);
            setAuthError('Authentication failed. Please try again.');
        } finally {
            setIsProcessingAuth(false);
        }
    }, [ssoLogin, navigate]);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const refParam = urlParams.get('ref') || urlParams.get('referral');
        if (refParam && refParam.trim()) {
            const clean = refParam.trim().toUpperCase();
            localStorage.setItem('cliks_referral_code', clean);
            sessionStorage.setItem('cliks_pending_ref', clean);
        }
    }, [location]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated) return;
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        if (code && code !== processedCode) {
            setProcessedCode(code);
            handleOAuthCallback(code);
        }
    }, [location, processedCode, handleOAuthCallback, isAuthenticated]);

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        const state = 'cliks-business-auth-state';
        window.location.href =
            `${BNX_AUTH_URL}/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&mode=business`;
    };

    const scrollToSection = (id) => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const activeShowcase = MODULE_SHOWCASE.find(m => m.id === activeTabId) || MODULE_SHOWCASE[0];

    // Auth verification screen
    if (isProcessingAuth || authError) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                padding: '24px',
                fontFamily: "'Inter', sans-serif"
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '48px 40px',
                        maxWidth: '460px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <img src={logoPng} alt="CLIKS" style={{ width: '48px', height: '48px' }} />
                    </div>

                    {authError ? (
                        <>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2',
                                color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <AlertCircle size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#1E293B', marginBottom: '8px' }}>
                                Authentication Notice
                            </h2>
                            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '24px' }}>
                                {authError}
                            </p>
                            <button
                                onClick={() => { setAuthError(''); navigate('/', { replace: true }); }}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px', background: '#064E3B',
                                    color: 'white', border: 'none', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer'
                                }}
                            >
                                Return to Homepage
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                            }}>
                                <Loader2 size={32} color="#065F46" className="animate-spin" />
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
                                Initializing Secure Console
                            </h2>
                            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                Authenticating via BNX Secure Gate. Preparing your multi-branch enterprise books...
                            </p>
                        </>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            color: '#0F172A',
            background: '#FAFCFA',
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            {/* 1. TOP ANNOUNCEMENT BAR */}
            <div style={{
                background: 'linear-gradient(90deg, #064E3B 0%, #047857 50%, #064E3B 100%)',
                color: '#ECFDF5',
                padding: '0.55rem 1rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: '0.01em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
            }}>
                <span style={{
                    background: '#10B981', color: '#064E3B', padding: '0.15rem 0.55rem',
                    borderRadius: '12px', fontSize: '0.68rem', fontWeight: '900', textTransform: 'uppercase'
                }}>GST 2.0</span>
                <span>Automated GSTR-1 & GSTR-2B Input Tax Credit reconciliation is now live for all Indian enterprises.</span>
                <span onClick={() => scrollToSection('features')} style={{ textDecoration: 'underline', cursor: 'pointer', opacity: 0.95 }}>
                    See Capabilities →
                </span>
            </div>

            {/* 2. STICKY GLASS NAVBAR */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: scrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(250, 252, 250, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent',
                transition: 'all 0.25s ease'
            }}>
                <div style={{
                    maxWidth: '1240px',
                    margin: '0 auto',
                    padding: '0.85rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Brand Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src={logoPng} alt="CLIKS" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064E3B', letterSpacing: '-0.02em' }}>
                                CLIKS
                            </span>
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '850',
                                color: '#065F46',
                                background: '#DCF2E4',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                            }}>
                                BUSINESS
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
                        {[
                            { label: 'Platform Modules', target: 'modules' },
                            { label: 'GST & Compliance', target: 'compliance' },
                            { label: 'Interactive Demo', target: 'showcase' },
                            { label: 'ROI Calculator', target: 'calculator' },
                            { label: 'Enterprise Pricing', target: 'pricing' }
                        ].map((link, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToSection(link.target)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#475569',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'color 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#064E3B'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    {/* Right CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <button
                            onClick={handleLogin}
                            style={{
                                background: 'transparent',
                                border: '1px solid #CBD5E1',
                                color: '#1E293B',
                                padding: '0.55rem 1.15rem',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: '750',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#064E3B'; e.currentTarget.style.color = '#064E3B'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B'; }}
                        >
                            Sign In
                        </button>

                        <button
                            onClick={handleLogin}
                            style={{
                                background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '0.58rem 1.35rem',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.22)',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(6, 78, 59, 0.28)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 78, 59, 0.22)'; }}
                        >
                            <span>Launch Console</span>
                            <ArrowRight size={14} />
                        </button>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="mobile-toggle"
                            style={{
                                display: 'none',
                                background: 'none',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                padding: '0.45rem',
                                cursor: 'pointer'
                            }}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: 'white',
                                borderBottom: '1px solid #E2E8F0',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                        >
                            {['modules', 'compliance', 'showcase', 'calculator', 'pricing'].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    style={{
                                        background: 'none', border: 'none', textAlign: 'left',
                                        fontSize: '0.95rem', fontWeight: '750', color: '#1E293B', padding: '0.4rem 0'
                                    }}
                                >
                                    {id.charAt(0).toUpperCase() + id.slice(1)}
                                </button>
                            ))}
                            <button
                                onClick={handleLogin}
                                style={{
                                    background: '#064E3B', color: 'white', padding: '0.75rem', borderRadius: '10px',
                                    border: 'none', fontWeight: '800', marginTop: '0.5rem'
                                }}
                            >
                                Launch Business Console
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* 3. HERO SECTION */}
            <section style={{
                padding: '4.5rem 1.5rem 3.5rem',
                maxWidth: '1240px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                {/* Status Pill */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 0.95rem',
                        borderRadius: '24px',
                        background: '#DCF2E4',
                        border: '1px solid #A7F3D0',
                        color: '#064E3B',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        marginBottom: '1.75rem'
                    }}
                >
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#059669', animation: 'pulse 2s infinite' }} />
                    <span>BUILT FOR INDIAN ENTERPRISE, DISTRIBUTORS & WHOLESALE NETWORKS</span>
                </motion.div>

                {/* Primary Hero Typography */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{
                        fontSize: 'clamp(2.3rem, 5.2vw, 3.85rem)',
                        fontWeight: '900',
                        lineHeight: 1.12,
                        letterSpacing: '-0.035em',
                        color: '#064E3B',
                        maxWidth: '960px',
                        margin: '0 auto 1.35rem'
                    }}
                >
                    Unified ERP, GST Compliance & Multi-Branch Intelligence.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                        lineHeight: 1.6,
                        color: '#475569',
                        maxWidth: '740px',
                        margin: '0 auto 2.25rem',
                        fontWeight: '500'
                    }}
                >
                    Streamline GST tax invoicing, multi-godown physical stock, double-entry ledgers, staff payroll, and direct Chartered Accountant audit trails in one unified, ultra-fast workspace.
                </motion.p>

                {/* Main Hero Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        marginBottom: '2.5rem'
                    }}
                >
                    <button
                        onClick={handleLogin}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.95rem 2.2rem',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.95rem',
                            fontWeight: '850',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(6, 78, 59, 0.32)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 78, 59, 0.25)'; }}
                    >
                        <span>Start Free Enterprise Trial</span>
                        <ArrowRight size={17} />
                    </button>

                    <button
                        onClick={() => scrollToSection('showcase')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.55rem',
                            padding: '0.95rem 1.85rem',
                            borderRadius: '14px',
                            background: 'white',
                            color: '#1E293B',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.95rem',
                            fontWeight: '750',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#064E3B'; e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = 'white'; }}
                    >
                        <PlayCircle size={17} color="#065F46" />
                        <span>Interactive Workspace Tour</span>
                    </button>
                </motion.div>

                {/* Compliance & Security Credential Ribbons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.75rem',
                    flexWrap: 'wrap',
                    color: '#64748B',
                    fontSize: '0.8rem',
                    fontWeight: '650'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={16} color="#059669" /> Bank-Grade 256-bit TLS Encryption
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={16} color="#059669" /> GSTN E-Invoicing & E-Way Ready
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Award size={16} color="#059669" /> ICAI Chartered Accountant Compatible
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RefreshCw size={16} color="#059669" /> Real-Time Multi-Branch Sync
                    </span>
                </div>
            </section>

            {/* 4. SHOWSTOPPER: THE INTERACTIVE LIVE CONSOLE SHOWCASE */}
            <section id="showcase" style={{
                maxWidth: '1240px',
                margin: '0 auto 5rem',
                padding: '0 1.5rem'
            }}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 25px 60px -15px rgba(6, 78, 59, 0.12), 0 0 1px 1px rgba(0,0,0,0.02)',
                    overflow: 'hidden'
                }}>
                    {/* Console Header Bar */}
                    <div style={{
                        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#EF4444' }} />
                                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F59E0B' }} />
                                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10B981' }} />
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.02em', color: '#DCF2E4' }}>
                                CLIKS PRODUCTION CONSOLE • ACTIVE SHOWROOM: CENTRAL GODOWN (MAHARASHTRA)
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                                padding: '0.2rem 0.65rem',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.12)',
                                fontSize: '0.72rem',
                                fontWeight: '750',
                                color: '#A7F3D0'
                            }}>
                                ● GSTN Live Reconciled
                            </span>
                            <span style={{
                                padding: '0.2rem 0.65rem',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.12)',
                                fontSize: '0.72rem',
                                fontWeight: '750',
                                color: 'white'
                            }}>
                                Branch ID: MH-BOM-01
                            </span>
                        </div>
                    </div>

                    {/* Interactive Tab Controller */}
                    <div style={{
                        display: 'flex',
                        background: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0',
                        padding: '0.5rem 1rem',
                        overflowX: 'auto',
                        gap: '0.4rem'
                    }}>
                        {MODULE_SHOWCASE.map((mod) => {
                            const isSelected = mod.id === activeTabId;
                            const IconComp = mod.icon;
                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => setActiveTabId(mod.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.55rem',
                                        padding: '0.65rem 1.15rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.15s ease',
                                        background: isSelected ? 'white' : 'transparent',
                                        color: isSelected ? '#064E3B' : '#64748B',
                                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                                    }}
                                >
                                    <IconComp size={15} color={isSelected ? '#064E3B' : '#94A3B8'} />
                                    <span>{mod.name}</span>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '6px',
                                        background: isSelected ? '#DCF2E4' : '#F1F5F9',
                                        color: isSelected ? '#064E3B' : '#94A3B8',
                                        fontWeight: '850'
                                    }}>
                                        {mod.badge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Interactive Workspace Body */}
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.9fr)', gap: '2rem', alignItems: 'start' }}>
                            {/* Left Description Column */}
                            <div>
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '900',
                                    color: '#059669',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    display: 'block',
                                    marginBottom: '0.5rem'
                                }}>
                                    INTEGRATED WORKSPACE COMPONENT
                                </span>
                                <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                                    {activeShowcase.headline}
                                </h3>
                                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: '500' }}>
                                    {activeShowcase.description}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                                    {activeShowcase.metrics.map((met, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.65rem 0.95rem',
                                            borderRadius: '10px',
                                            background: '#F8FAFC',
                                            border: '1px solid #F1F5F9'
                                        }}>
                                            <span style={{ fontSize: '0.78rem', fontWeight: '650', color: '#64748B' }}>{met.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#064E3B' }}>{met.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleLogin}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: '#064E3B',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>Try {activeShowcase.name} Live</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>

                            {/* Right Live Interactive Simulation Panel */}
                            <div style={{
                                background: '#F8FAFC',
                                borderRadius: '18px',
                                border: '1px solid #E2E8F0',
                                padding: '1.25rem',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                            }}>
                                {activeTabId === 'invoicing' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A' }}>{activeShowcase.previewData.title}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Voucher Ref: {activeShowcase.previewData.code} • Date: {activeShowcase.previewData.date}</div>
                                            </div>
                                            <span style={{
                                                padding: '0.25rem 0.65rem',
                                                borderRadius: '20px',
                                                background: '#ECFDF5',
                                                color: '#065F46',
                                                border: '1px solid #A7F3D0',
                                                fontSize: '0.72rem',
                                                fontWeight: '850'
                                            }}>
                                                ✓ Tax Authenticated
                                            </span>
                                        </div>

                                        <div style={{ background: 'white', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>BILLED TO (B2B CUSTOMER)</div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#0F172A', marginTop: '0.15rem' }}>{activeShowcase.previewData.party}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace', fontWeight: '750' }}>GSTIN: {activeShowcase.previewData.gstin}</div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem', marginBottom: '1rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                                                    <th style={{ padding: '0.45rem' }}>Item Description</th>
                                                    <th style={{ padding: '0.45rem' }}>HSN</th>
                                                    <th style={{ padding: '0.45rem' }}>Qty</th>
                                                    <th style={{ padding: '0.45rem', textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeShowcase.previewData.items.map((it, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.65rem 0.45rem', fontWeight: '750', color: '#0F172A' }}>{it.desc}</td>
                                                        <td style={{ padding: '0.65rem 0.45rem', color: '#64748B', fontFamily: 'monospace' }}>{it.hsn}</td>
                                                        <td style={{ padding: '0.65rem 0.45rem', color: '#475569', fontWeight: '700' }}>{it.qty}</td>
                                                        <td style={{ padding: '0.65rem 0.45rem', textAlign: 'right', fontWeight: '850', color: '#064E3B' }}>{it.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div style={{ background: '#ECFDF5', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '750' }}>Total GST (CGST 9% + SGST 9%)</div>
                                                <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '850' }}>₹47,152.80</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '750' }}>Final Amount</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B' }}>{activeShowcase.previewData.grandTotal}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTabId === 'inventory' && (
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.85rem' }}>
                                            {activeShowcase.previewData.title}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                                            {activeShowcase.previewData.godowns.map((g, idx) => (
                                                <div key={idx} style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0F172A' }}>{g.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Physical Live Count: {g.skus}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: '850', color: '#064E3B' }}>{g.capacity}</span>
                                                        <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '750', color: g.status === 'Optimal' ? '#059669' : '#D97706' }}>● {g.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ background: '#FFFBEB', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '750' }}>
                                                Last Inward Reconcile: <strong>{activeShowcase.previewData.recentAdjustment.item}</strong> ({activeShowcase.previewData.recentAdjustment.ref})
                                            </div>
                                            <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#B45309' }}>{activeShowcase.previewData.recentAdjustment.diff}</span>
                                        </div>
                                    </div>
                                )}

                                {activeTabId === 'accounting' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A' }}>{activeShowcase.previewData.title}</div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '850', color: '#047857', background: '#DCF2E4', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                                {activeShowcase.previewData.auditBadge}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                            {activeShowcase.previewData.accounts.map((acc, idx) => (
                                                <div key={idx} style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0F172A' }}>{acc.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Ledger Classification: {acc.type}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#064E3B' }}>{acc.balance}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '750' }}>{acc.trend}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTabId === 'payroll' && (
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.85rem' }}>
                                            {activeShowcase.previewData.title}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                                            {activeShowcase.previewData.disbursements.map((emp, idx) => (
                                                <div key={idx} style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0F172A' }}>{emp.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{emp.role}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#064E3B' }}>{emp.net}</div>
                                                        <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '750' }}>✓ {emp.status}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ background: '#ECFDF5', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '750' }}>Total Batch Net Salary</div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B' }}>{activeShowcase.previewData.totalPayroll}</div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#065F46', background: 'white', padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                                                {activeShowcase.previewData.reimbursementVouchers}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CORE ARCHITECTURAL MODULE MATRIX ("Everything Your Enterprise Runs On") */}
            <section id="modules" style={{
                background: '#FFFFFF',
                padding: '5rem 1.5rem',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0'
            }}>
                <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: '900', color: '#059669',
                            textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem'
                        }}>
                            ENTERPRISE MODULE SUITE
                        </span>
                        <h2 style={{ fontSize: '2.35rem', fontWeight: '900', color: '#064E3B', letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
                            Engineered for high-volume Indian commerce.
                        </h2>
                        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, fontWeight: '500' }}>
                            Every department in your company connects to the same live database. No sync delays, no manual ledger duplication, and zero discrepancies during audits.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[
                            {
                                icon: Receipt,
                                title: 'GST Billing & E-Invoicing Engine',
                                desc: 'Generate official B2B, B2C, SEZ, and export invoices. Compute CGST/SGST/IGST automatically with place-of-supply detection and real-time GSTIN validation.',
                                tag: 'GST 2.0 Compliant'
                            },
                            {
                                icon: Warehouse,
                                title: 'Multi-Godown Stock & Barcoding',
                                desc: 'Track physical inventory quantities across central godowns and retail counters. GS1 scannable barcode generation, batch management, and FIFO valuation.',
                                tag: 'FIFO Inventory'
                            },
                            {
                                icon: FileText,
                                title: 'Automated Double-Entry Ledger',
                                desc: 'Sales, purchase bills, payments, and staff claims automatically write journal entries to Cash, Bank, Receivables, and Payables accounts with full audit trails.',
                                tag: 'Zero Ledger Errors'
                            },
                            {
                                icon: Cpu,
                                title: 'ICAI Chartered Accountant Audit Center',
                                desc: 'Dedicated audit access for your external or in-house CA. Verified ICAI Fin-Pro badge, automated GSTR-1 vs 2B reconciliation, and 1-click tax filing data packs.',
                                tag: 'CA Audit Gate'
                            },
                            {
                                icon: Users,
                                title: 'Staff Attendance & Payroll HRMS',
                                desc: 'Log biometric or shift attendance, process monthly salaries, track employee travel expense claim receipts, and generate NEFT bank disbursement files.',
                                tag: 'HRMS Automated'
                            },
                            {
                                icon: Monitor,
                                title: 'Rapid POS Counter & Thermal Billing',
                                desc: 'Blazing fast counter billing with 2-inch and 3-inch thermal printer support, customer loyalty point credits/redemptions, and instant WhatsApp invoice dispatch.',
                                tag: 'POS & WhatsApp'
                            }
                        ].map((card, i) => (
                            <div
                                key={i}
                                style={{
                                    background: '#F8FAFC',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    padding: '1.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.borderColor = '#A7F3D0';
                                    e.currentTarget.style.background = '#FFFFFF';
                                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(6, 78, 59, 0.08)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.background = '#F8FAFC';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5',
                                            border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46'
                                        }}>
                                            <card.icon size={20} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: '850', color: '#065F46', background: '#DCF2E4',
                                            padding: '0.2rem 0.6rem', borderRadius: '6px'
                                        }}>
                                            {card.tag}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.65rem' }}>
                                        {card.title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0, fontWeight: '500' }}>
                                        {card.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. INTERACTIVE ROI & ITC RECOVERY CALCULATOR */}
            <section id="calculator" style={{
                padding: '5rem 1.5rem',
                maxWidth: '1240px',
                margin: '0 auto'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                    borderRadius: '24px',
                    padding: '3rem 2.5rem',
                    color: 'white',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.3fr)',
                    gap: '3rem',
                    alignItems: 'center',
                    boxShadow: '0 20px 50px rgba(6, 78, 59, 0.25)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            LIVE SAVINGS SIMULATION
                        </span>
                        <h2 style={{ fontSize: '2.1rem', fontWeight: '900', lineHeight: 1.2, margin: '0.6rem 0 1rem' }}>
                            Estimate what CLIKS recovers for your enterprise.
                        </h2>
                        <p style={{ color: '#D1FAE5', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Indian enterprises lose an average of 2.8% of turnover in missed GSTR-2B Input Tax Credits and hundreds of hours in manual tally adjustments. Move the sliders to calculate your enterprise savings.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '750', marginBottom: '0.5rem' }}>
                                    <span>Average Monthly Turnover:</span>
                                    <span style={{ color: '#6EE7B7', fontWeight: '900', fontSize: '1rem' }}>₹{monthlyTurnover} Lakhs / mo</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="500"
                                    step="5"
                                    value={monthlyTurnover}
                                    onChange={(e) => setMonthlyTurnover(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '750', marginBottom: '0.5rem' }}>
                                    <span>Monthly B2B & Retail Invoices:</span>
                                    <span style={{ color: '#6EE7B7', fontWeight: '900', fontSize: '1rem' }}>{monthlyInvoices} Invoices / mo</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="5000"
                                    step="50"
                                    value={monthlyInvoices}
                                    onChange={(e) => setMonthlyInvoices(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Output Savings Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: '800', textTransform: 'uppercase' }}>
                                ESTIMATED ANNUAL UNCLAIMED ITC RECOVERED
                            </span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
                                ₹{(estimatedItcRecovered / 100000).toFixed(2)} Lakhs <span style={{ fontSize: '1rem', fontWeight: '700', color: '#6EE7B7' }}>/ year</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#D1FAE5', display: 'block', marginTop: '0.2rem' }}>
                                Via automatic GSTR-2B invoice cross-matching against supplier purchase bills.
                            </span>
                        </div>

                        <div>
                            <span style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: '800', textTransform: 'uppercase' }}>
                                ESTIMATED ACCOUNTING & AUDIT TIME SAVED
                            </span>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
                                ~{estimatedHoursSaved} Hours <span style={{ fontSize: '1rem', fontWeight: '700', color: '#6EE7B7' }}>/ year</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#D1FAE5', display: 'block', marginTop: '0.2rem' }}>
                                Zero manual ledger balancing; 1-click CA audit export package.
                            </span>
                        </div>

                        <button
                            onClick={handleLogin}
                            style={{
                                background: 'white',
                                color: '#064E3B',
                                border: 'none',
                                padding: '0.9rem',
                                borderRadius: '12px',
                                fontWeight: '850',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                marginTop: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                            }}
                        >
                            <span>Claim Your Enterprise ROI Free</span>
                            <ArrowRight size={15} color="#064E3B" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. TRANSPARENT ENTERPRISE PRICING */}
            <section id="pricing" style={{
                background: '#FFFFFF',
                padding: '5rem 1.5rem',
                borderTop: '1px solid #E2E8F0'
            }}>
                <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ENTERPRISE LICENSING
                        </span>
                        <h2 style={{ fontSize: '2.3rem', fontWeight: '900', color: '#064E3B', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
                            Predictable, transparent investment.
                        </h2>
                        <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                            Every license includes unlimited GST invoices, continuous compliance upgrades, and 24/7 dedicated support.
                        </p>

                        {/* Annual / Monthly Toggle */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#F1F5F9',
                            padding: '4px',
                            borderRadius: '12px',
                            marginTop: '1.5rem',
                            border: '1px solid #E2E8F0'
                        }}>
                            <button
                                onClick={() => setPricingAnnual(false)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: '800',
                                    background: !pricingAnnual ? 'white' : 'transparent',
                                    color: !pricingAnnual ? '#064E3B' : '#64748B',
                                    boxShadow: !pricingAnnual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                                }}
                            >
                                Monthly Billing
                            </button>
                            <button
                                onClick={() => setPricingAnnual(true)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: '800',
                                    background: pricingAnnual ? '#064E3B' : 'transparent',
                                    color: pricingAnnual ? 'white' : '#64748B',
                                    boxShadow: pricingAnnual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                                }}
                            >
                                <span>Annual Plan</span>
                                <span style={{
                                    fontSize: '0.65rem', background: '#10B981', color: '#064E3B',
                                    padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '900'
                                }}>SAVE 20%</span>
                            </button>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '1.75rem',
                        alignItems: 'stretch'
                    }}>
                        {[
                            {
                                name: 'Starter Business',
                                tag: 'For Single Store / Trader',
                                price: pricingAnnual ? '₹4,999' : '₹599',
                                period: pricingAnnual ? '/ year' : '/ month',
                                features: [
                                    'Up to 2 Showrooms / Warehouses',
                                    'Unlimited GST Invoices & E-Way Bills',
                                    'Inventory FIFO & Barcode Printing',
                                    'Standard Accounting & Vendor Ledger',
                                    'WhatsApp Invoices (up to 500/mo)',
                                    'Email & Phone Technical Support'
                                ],
                                cta: 'Start with Starter',
                                popular: false
                            },
                            {
                                name: 'Growth Enterprise',
                                tag: 'Most Popular for Multi-Branch',
                                price: pricingAnnual ? '₹9,999' : '₹1,199',
                                period: pricingAnnual ? '/ year' : '/ month',
                                features: [
                                    'Up to 10 Godowns & Retail Showrooms',
                                    'Unlimited GST Invoicing + Auto IRN QR',
                                    'Automated GSTR-1, 2B & 3B Reconciler',
                                    'ICAI CA Audit Center Portal Access',
                                    'Staff Attendance & Biometric HRMS',
                                    'Branch-to-Branch Stock Requisitions',
                                    'Priority 24/7 Enterprise Assistance'
                                ],
                                cta: 'Launch Growth Enterprise',
                                popular: true
                            },
                            {
                                name: 'Industrial Scale',
                                tag: 'Distributors & Manufacturing',
                                price: pricingAnnual ? '₹19,999' : '₹2,399',
                                period: pricingAnnual ? '/ year' : '/ month',
                                features: [
                                    'Unlimited Warehouses & Transit Depots',
                                    'Dedicated Account Executive',
                                    'Custom ERP & Tally Data Importer',
                                    'High-Frequency POS Counter Billing',
                                    'Multi-User Granular Role Permissions',
                                    'Dedicated Database Backup & SLA Uptime',
                                    'Full Custom Fin-Pro Audit Pipeline'
                                ],
                                cta: 'Deploy Industrial Scale',
                                popular: false
                            }
                        ].map((plan, i) => (
                            <div
                                key={i}
                                style={{
                                    background: plan.popular ? '#FFFFFF' : '#F8FAFC',
                                    borderRadius: '24px',
                                    border: plan.popular ? '2px solid #064E3B' : '1px solid #E2E8F0',
                                    padding: '2.25rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    boxShadow: plan.popular ? '0 20px 40px rgba(6, 78, 59, 0.12)' : 'none'
                                }}
                            >
                                {plan.popular && (
                                    <span style={{
                                        position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                                        background: '#064E3B', color: 'white', padding: '0.25rem 0.85rem',
                                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.04em'
                                    }}>
                                        RECOMMENDED FOR MOST ENTERPRISES
                                    </span>
                                )}

                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{plan.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', marginBottom: '1.25rem' }}>{plan.tag}</div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.75rem' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#064E3B' }}>{plan.price}</span>
                                        <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>{plan.period}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>
                                                <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogin}
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: '850',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        background: plan.popular ? 'linear-gradient(135deg, #064E3B 0%, #047857 100%)' : '#E2E8F0',
                                        color: plan.popular ? 'white' : '#1E293B',
                                        boxShadow: plan.popular ? '0 4px 14px rgba(6, 78, 59, 0.25)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. FAQ ACCORDION */}
            <section style={{
                maxWidth: '860px',
                margin: '0 auto 6rem',
                padding: '0 1.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#064E3B' }}>Frequently Answered Inquiries</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.35rem' }}>Clear answers on setup, compliance, and multi-branch operations.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                        {
                            q: 'Can I import my existing product inventory and customer data from Tally or Excel?',
                            a: 'Yes. CLIKS provides a 1-click Excel/CSV bulk importer that cleanly imports your existing customer master list, vendor catalogs, opening stock balances, and HSN codes in seconds.'
                        },
                        {
                            q: 'How does the ICAI Chartered Accountant audit center work?',
                            a: 'You can grant your Chartered Accountant read-only or filing permissions. They receive a dedicated dashboard to review your GSTR-1, GSTR-2B, and GSTR-3B matching, download tally audit packs, and certify audit trails.'
                        },
                        {
                            q: 'Does CLIKS support multiple godowns and inter-branch stock transfers?',
                            a: 'Yes. You can configure multiple godowns, showrooms, and transit depots. Branch managers can raise internal requisitions, and central godown supervisors can dispatch goods with auto-generated delivery challans.'
                        },
                        {
                            q: 'Is my enterprise data hosted securely and backed up?',
                            a: 'All data is secured using bank-grade 256-bit TLS encryption with daily automated backups. Your records are compliant with Indian IT Act and GST audit preservation mandates.'
                        }
                    ].map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: 'white',
                                    borderRadius: '14px',
                                    border: '1px solid #E2E8F0',
                                    overflow: 'hidden'
                                }}
                            >
                                <button
                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                    style={{
                                        width: '100%',
                                        padding: '1.15rem 1.35rem',
                                        background: 'none',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.92rem',
                                        fontWeight: '800',
                                        color: '#0F172A'
                                    }}
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        color="#064E3B"
                                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                                    />
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 1.35rem 1.15rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, borderTop: '1px solid #F1F5F9' }}>
                                        <p style={{ margin: '0.75rem 0 0 0' }}>{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 9. BOTTOM ENTERPRISE CTA BANNER */}
            <section style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                color: 'white',
                padding: '4.5rem 1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ONE-CLICK ONBOARDING
                    </span>
                    <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: '900', lineHeight: 1.18, margin: '0.75rem 0 1rem' }}>
                        Ready to elevate your business operations?
                    </h2>
                    <p style={{ color: '#D1FAE5', fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.25rem' }}>
                        Join thousands of enterprises, distributors, and retail chains operating on CLIKS. Setup takes under 2 minutes.
                    </p>
                    <button
                        onClick={handleLogin}
                        style={{
                            background: '#FFFFFF',
                            color: '#064E3B',
                            border: 'none',
                            padding: '1rem 2.5rem',
                            borderRadius: '14px',
                            fontWeight: '900',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.55rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span>Launch Your Business Console</span>
                        <ArrowRight size={18} color="#064E3B" />
                    </button>
                </div>
            </section>

            {/* 10. REFINED FOOTER */}
            <footer style={{
                background: '#042F24',
                color: 'rgba(255,255,255,0.7)',
                padding: '3rem 1.5rem 2rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.8rem'
            }}>
                <div style={{
                    maxWidth: '1240px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={logoPng} alt="CLIKS" style={{ width: '28px', height: '28px' }} />
                        <span style={{ fontSize: '1.05rem', fontWeight: '900', color: 'white' }}>CLIKS Business</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>• Operating System for Indian Enterprise</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span onClick={() => scrollToSection('modules')} style={{ cursor: 'pointer' }}>Modules</span>
                        <span onClick={() => scrollToSection('compliance')} style={{ cursor: 'pointer' }}>GST Compliance</span>
                        <span onClick={() => scrollToSection('pricing')} style={{ cursor: 'pointer' }}>Pricing</span>
                        <span onClick={handleLogin} style={{ cursor: 'pointer', color: '#6EE7B7' }}>Sign In</span>
                    </div>
                </div>

                <div style={{
                    maxWidth: '1240px',
                    margin: '2rem auto 0',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.45)'
                }}>
                    <span>© {new Date().getFullYear()} CLIKS Business. All rights reserved. Registered Indian Enterprise ERP.</span>
                    <span>100% Tax Compliant • 256-Bit SSL Secured • GSTN Sandbox Tested</span>
                </div>
            </footer>
        </div>
    );
}
