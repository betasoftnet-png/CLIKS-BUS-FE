import React, { useState } from 'react';
import { 
    CreditCard, 
    Check, 
    Zap, 
    ShieldCheck, 
    Award, 
    Crown, 
    History, 
    ArrowUpRight, 
    Download, 
    Calendar,
    Sparkles,
    Globe,
    User,
    Home,
    FileText,
    Receipt,
    Package,
    Users,
    UserCheck,
    UserPlus,
    BookOpen,
    FileCheck,
    Layers,
    Settings,
    Code,
    Link,
    Smartphone,
    Headphones,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';
import { apiClient } from '../api/client';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import { useCurrency, useAuth } from '../context';
import { caService } from '../services';

const BusinessSubscription = () => {
    const navigate = useNavigate();
    const { currency, formatCurrency } = useCurrency();
    const { user, selectedPlan: selectedTier, changePlan, planDaysRemaining } = useAuth();
    const [activeCategory, setActiveCategory] = useState('business');
    const [betaSubCategory, setBetaSubCategory] = useState('investor'); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [firmMembersCount, setFirmMembersCount] = useState(3);
    const [showIcaiGuardModal, setShowIcaiGuardModal] = useState(false);

    const handleUpgrade = async (tier) => {
        if (tier.name === selectedTier) return;

        // Institutional ICAI Verification Guard for FIN-PRO Suite
        const isFinProTier = (tier.name && tier.name.startsWith('Fin-Pro')) || activeCategory === 'ca';
        if (isFinProTier) {
            try {
                const icaiRes = await caService.getIcaiVerification();
                const icai = icaiRes?.data || icaiRes;
                if (!icai || icai.status !== 'VERIFIED') {
                    setShowIcaiGuardModal(true);
                    return;
                }
            } catch (e) {
                setShowIcaiGuardModal(true);
                return;
            }
        }
        
        let amt = tier.priceAnnually || tier.price;
        if (tier.name === 'Fin-Pro Firm') {
            amt = 1499 + Math.max(0, firmMembersCount - 3) * 299;
        }
        
        try {
            setIsProcessing(true);
            const generatedOrderId = `SUB_${Date.now()}_${Math.floor(Math.random() * 999)}`;
            let paymentSessionId = null;

            const backendData = await apiClient.post('/payments/create-order', {
                amount: amt,
                orderId: generatedOrderId,
                currency: currency?.code || 'INR'
            });

            if (backendData && backendData.data && backendData.data.payment_session_id) {
                paymentSessionId = backendData.data.payment_session_id;
            } else {
                throw new Error("Malformed session received from server cluster.");
            }

            const mode = backendData?.data?.mode || backendData?.data?.cf_environment || (window.location.hostname.includes('cliksbusiness.com') || window.location.hostname.includes('cliks.beta-softnet.com') ? 'production' : 'sandbox');
            const cashfree = await load({ mode });

            const result = await cashfree.checkout({
                paymentSessionId: paymentSessionId,
                redirectTarget: "_modal"
            });
            
            if (result.error) {
                alert("Gateway Interrupted: " + result.error.message);
            } else {
                await changePlan(tier.name);
            }

        } catch (err) {
            console.warn("[CASHFREE GATEWAY LOGGER]:", err.message);
            const shouldSimulate = await customConfirm(
                `🚨 [CASHFREE GATEWAY ERROR]\n\n` +
                `Transaction Handshake Failed: ${err.message}\n\n` +
                `Would you like to simulate a SUCCESSFUL Gateway callback anyway to test UI loading logic?`
            );

            if (shouldSimulate) {
                await changePlan(tier.name);
                alert(`Successfully simulated upgrade to ${tier.name}!`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const allTiers = {
        business: [
            {
                name: 'Starter Plan',
                priceAnnually: 2999,
                originalPrice: 4599,
                desc: 'Ideal for small retail & emerging SMBs.',
                icon: ShieldCheck,
                color: '#1B6B3A',
                badge: 'Basic',
                features: [
                    '3 Website Users',
                    '5,000 Invoices & 5,000 Bills / year',
                    '5,000 Products & 2,000 Customers',
                    '500 Vendors & 5 Staff (HR)',
                    'Accounting & GST (Reports, Filing, ITC)',
                    'Basic Inventory & Limited E-Way Bill',
                    'Basic Data Export & Mobile App',
                    'VIP 24/7 Email Chat'
                ]
            },
            {
                name: 'Growth Plan',
                priceAnnually: 6999,
                originalPrice: 9999,
                desc: 'Built for scaling businesses and multi-site operations.',
                icon: Zap,
                color: '#064E3B',
                badge: 'Most Popular',
                features: [
                    'All features in Starter Plan',
                    '10 Website Users & 3 Warehouses',
                    '25,000 Invoices & 25,000 Bills / year',
                    '25,000 Products & 10,000 Customers',
                    '2,500 Vendors & 25 Staff (HR)',
                    'Advanced Inventory & Full E-Invoice/E-Way Bill',
                    'API & Webhooks Access',
                    'Advanced Data Export & Mobile App',
                    'VIP 24/7 Email Chat'
                ]
            },
            {
                name: 'Elite Suite',
                priceAnnually: 8999,
                originalPrice: 15999,
                desc: 'Absolute control for national distribution networks.',
                icon: Crown,
                color: '#0D9488',
                badge: 'Ultimate Value',
                features: [
                    'All features in Growth Plan',
                    '25 Website Users & 10 Warehouses',
                    '100,000 Invoices & 100,000 Bills / year',
                    'Unlimited Products, Customers & Vendors',
                    'Unlimited Staff (HR) profiles',
                    'White-label Invoices',
                    'Advanced Data Export & Mobile App',
                    'VIP 24/7 Email Chat'
                ]
            }
        ],
        ca: [
            {
                name: 'Fin-Pro Solo',
                price: 799,
                originalPrice: 1199,
                desc: 'Perfect for solo practitioners and independent auditors.',
                icon: ShieldCheck,
                color: '#1E3A8A',
                badge: 'Solo',
                period: 'month',
                features: [
                    'Manage up to 25 Active Client Ledgers',
                    'Standard Multi-Client GST/ITR Reporting',
                    'Direct Auditing & Daybook Verification Logs',
                    'Automated Exporting to CSV/Excel formats',
                    'Priority Email Support'
                ]
            },
            {
                name: 'Fin-Pro Firm',
                price: 1499,
                originalPrice: 2499,
                desc: 'Designed for scaling accounting firms and collaborative auditing teams.',
                icon: Zap,
                color: '#2563EB',
                badge: 'Firm Upgrade',
                period: 'month',
                features: [
                    'Manage Unlimited Active Client Ledgers',
                    'Custom White-Labeled Client Report Generation',
                    '3 Team Members included by default',
                    'Additional members at just ₹299/month each',
                    'Live Chat Support & Direct API Sandbox Access'
                ]
            }
        ],
        betaclub_investor: [
            {
                name: 'Basic Investor',
                price: 999,
                originalPrice: 1499,
                desc: 'Access curated startup directories with a limit of 20 pitches.',
                icon: ShieldCheck,
                color: '#7C3AED',
                badge: '20 Pitches',
                period: 'month',
                features: [
                    'Access up to 20 startup pitches',
                    'Filter pitches by industry and funding goal',
                    'Direct contact channels with verified founders',
                    'Real-time notifications for newly listed ventures'
                ]
            },
            {
                name: 'Pro Investor',
                price: 1999,
                originalPrice: 2999,
                desc: 'Expanded access for active investors with a limit of 50 pitches.',
                icon: Zap,
                color: '#6D28D9',
                badge: '50 Pitches',
                period: 'month',
                features: [
                    'Access up to 50 startup pitches',
                    'Direct contact details for startup listings',
                    'Interactive deal rooms & shared pitch folders',
                    '1-on-1 deal flow consultations with steering team'
                ]
            }
        ],
        betaclub_product: [
            {
                name: 'Monthly Innovator',
                price: 499,
                originalPrice: 699,
                desc: 'Monthly access for founders seeking foundational product testing.',
                icon: ShieldCheck,
                color: '#EC4899',
                badge: 'Monthly',
                period: 'month',
                features: [
                    'Early access to new platform updates',
                    'Standard community mastermind forum access',
                    'List active roadmaps/pitches in the Deal Marketplace',
                    'Standard investor-ready pitch templates'
                ]
            },
            {
                name: 'Yearly Founder',
                price: 4999,
                originalPrice: 5988,
                desc: 'Annual sovereign tier with lifetime fee freeze and VIP gala entry.',
                icon: Crown,
                color: '#BE185D',
                badge: 'Yearly',
                period: 'year',
                features: [
                    'All features of Monthly Innovator tier',
                    'Unlimited active roadmaps/pitches in the Marketplace',
                    'Featured homepage and dashboard spotlight placement',
                    'VIP reserved seat at the Annual Founder\'s Gala',
                    'Lifetime subscription fee freeze guarantee'
                ]
            }
        ]
    };

    const getDynamicInvoices = () => {
        if (!user || !user.tier || user.tier === 'Free Plan') return [];
        
        let amount = 0;
        for (const cat in allTiers) {
            const match = allTiers[cat].find(t => t.name === user.tier);
            if (match) {
                amount = match.priceAnnually || match.price;
                break;
            }
        }

        const billingDate = user.updated_at ? new Date(user.updated_at) : new Date();

        return [
            { 
                id: `INV-${billingDate.getFullYear()}-${String(billingDate.getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 90) + 10}`, 
                date: billingDate.toISOString().split('T')[0], 
                tier: user.tier, 
                amount: amount, 
                status: 'Paid', 
                method: 'Cashfree PG' 
            }
        ];
    };

    const invoices = getDynamicInvoices();

    const getRenewalDetails = () => {
        let foundTier = null;
        for (const cat of Object.keys(allTiers)) {
            const match = allTiers[cat].find(t => t.name === selectedTier);
            if (match) {
                foundTier = { ...match, category: cat };
                break;
            }
        }
        if (!foundTier) {
            return {
                price: 6999,
                desc: 'Your workspace is configured with high-performance ERP pipelines. All accounting, inventory, and HR modules are fully active.',
                gradient: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                color: '#1B6B3A'
            };
        }
        
        let desc = '';
        let gradient = '';
        if (foundTier.category === 'business') {
            desc = `Your workspace is configured with high-performance ERP pipelines under the Business ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)';
        } else if (foundTier.category === 'ca') {
            desc = `Your workspace is configured under the FIN-PRO ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)';
        } else if (foundTier.category === 'betaclub_investor') {
            desc = `Your workspace is configured with exclusive investor network pipelines under the Beta Club (Investor) ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)';
        } else {
            desc = `Your workspace is configured with high-exposure roadmap channels under the Beta Club (Products & Ideas) ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
        }
        
        let calculatedPrice = foundTier.priceAnnually || foundTier.price;
        if (foundTier.name === 'Fin-Pro Firm') {
            calculatedPrice = 1499 + Math.max(0, firmMembersCount - 3) * 299;
        }
        
        return {
            price: calculatedPrice,
            desc: desc,
            gradient: gradient,
            color: foundTier.color
        };
    };

    const renewal = getRenewalDetails();

    const comparisonRows = [
        { feature: 'Website Users', icon: User, starter: '3', growth: '10', elite: '25' },
        { feature: 'Warehouses', icon: Home, starter: '❌', growth: '3', elite: '10' },
        { feature: 'Invoices per year', icon: FileText, starter: '5,000', growth: '25,000', elite: '100,000' },
        { feature: 'Bills / Expenses per year', icon: Receipt, starter: '5,000', growth: '25,000', elite: '100,000' },
        { feature: 'Products / Items', icon: Package, starter: '5,000', growth: '25,000', elite: 'Unlimited' },
        { feature: 'Customers', icon: Users, starter: '2,000', growth: '10,000', elite: 'Unlimited' },
        { feature: 'Vendors / Suppliers', icon: UserCheck, starter: '500', growth: '2,500', elite: 'Unlimited' },
        { feature: 'Staff (HR)', icon: UserPlus, starter: '5', growth: '25', elite: 'Unlimited' },
        { feature: 'Accounting', icon: BookOpen, starter: '✅', growth: '✅', elite: '✅' },
        { feature: 'GST (Reports, Filing, ITC)', icon: FileCheck, starter: '✅', growth: '✅', elite: '✅' },
        { feature: 'Inventory', icon: Layers, starter: 'Basic', growth: 'Advanced', elite: 'Advanced' },
        { feature: 'E-Invoice / E-Way Bill', icon: Settings, starter: 'Limited', growth: '✅', elite: '✅' },
        { feature: 'API / Webhooks', icon: Code, starter: '❌', growth: '✅', elite: '✅' },
        { feature: 'White-label Invoices', icon: Link, starter: '❌', growth: '❌', elite: '✅' },
        { feature: 'Data Export', icon: Download, starter: 'Basic', growth: 'Advanced', elite: 'Advanced' },
        { feature: 'Mobile App', icon: Smartphone, starter: '✅', growth: '✅', elite: '✅' },
        { feature: 'Support', icon: Headphones, starter: 'VIP 24/7 Email Chat', growth: 'VIP 24/7 Email Chat', elite: 'VIP 24/7 Email Chat' }
    ];

    const renderCellValue = (val) => {
        if (val === '✅') {
            return (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%', 
                    background: '#16A34A', 
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                }}>
                    <Check size={16} strokeWidth={3} />
                </span>
            );
        }
        if (val === '❌') {
            return (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '24px', 
                    height: '24px', 
                    color: '#EF4444', 
                    fontSize: '1.1rem',
                    fontWeight: '800'
                }}>
                    ✕
                </span>
            );
        }
        return <span className={`cmp-cell-val ${val === 'Unlimited' ? 'unlimited' : ''}`} style={{ fontWeight: val === 'Unlimited' ? '800' : '600', fontSize: '0.88rem' }}>{val}</span>;
    };

    return (
        <div className="subscription-page-root" style={{ padding: '1.25rem 2.5rem', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .subscription-page-root {
                    background-color: #F0F9F4;
                    color: #1E293B;
                }
                .subscription-title {
                    color: #064E3B;
                }
                .subscription-subtitle {
                    color: #475569;
                }
                .sub-billing-cycle-badge {
                    background: #DCF2E4;
                }
                .sub-billing-cycle-label {
                    color: #064E3B;
                }
                .sub-tabs-pill-container {
                    background: rgba(220, 242, 228, 0.7);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(27, 107, 58, 0.15);
                    box-shadow: 0 8px 32px 0 rgba(27, 107, 58, 0.04);
                }
                .sub-tab-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sub-tab-btn:not(.active) {
                    color: #475569;
                }
                .sub-tab-btn.active {
                    color: #ffffff;
                }
                .sub-tab-btn:hover {
                    transform: translateY(-1px) scale(1.03);
                    opacity: 0.95;
                }
                .sub-beta-card {
                    background: #ffffff;
                    color: #1E293B;
                    border: 1px solid #E2E8F0;
                }
                .sub-section-title {
                    color: #064E3B;
                }
                .plan-card {
                    background: #ffffff;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .plan-card:hover {
                    transform: translateY(-8px) !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08) !important;
                }
                .plan-title {
                    color: #1E293B;
                }
                .plan-desc {
                    color: #64748B;
                }
                .plan-orig-price {
                    color: #94A3B8;
                }
                .plan-save-badge {
                    color: #1B6B3A;
                    background: #DCF2E4;
                }
                .plan-price {
                    color: #1E293B;
                }
                .plan-period,
                .plan-equiv {
                    color: #64748B;
                }
                .firm-stepper-box {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                }
                .firm-stepper-box span {
                    color: #475569;
                }
                .firm-stepper-box button {
                    background: white;
                    border: 1px solid #CBD5E1;
                    color: #1E293B;
                }
                .plan-card .upgrade-btn {
                    background: white;
                }
                .upgrade-btn {
                    transition: all 0.2s ease-in-out;
                }
                .upgrade-btn:hover {
                    opacity: 0.95;
                    transform: scale(1.02);
                }
                .plan-divider {
                    border-color: #F1F5F9;
                }
                .plan-included-header {
                    color: #1E293B;
                }
                .plan-feature-item {
                    color: #475569;
                }
                .cmp-table-container {
                    background: white;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);
                }
                .cmp-header-icon-wrap {
                    background: #DCF2E4;
                    color: #1B6B3A;
                }
                .cmp-title {
                    color: #064E3B;
                }
                .cmp-desc {
                    color: #64748B;
                }
                .cmp-table-inner-wrap {
                    border: 1px solid #E2E8F0;
                }
                .cmp-th-feature {
                    color: #0F172A;
                    background: #F8FAFC;
                    border-bottom: 2px solid #E2E8F0;
                }
                .cmp-row {
                    border-bottom: 1px solid #E2E8F0;
                }
                .cmp-row-even {
                    background: #ffffff;
                }
                .cmp-row-odd {
                    background: #FAFAFA;
                }
                .cmp-table tr:hover td {
                    background-color: #F8FAFC !important;
                }
                .cmp-feature-name {
                    color: #334155;
                }
                .cmp-cell-val {
                    color: #1E293B;
                }
                .cmp-cell-val.unlimited {
                    color: #16A34A;
                }
                .invoices-history-card {
                    background: white;
                    border: 1px solid #E2E8F0;
                }
                .invoices-title {
                    color: #064E3B;
                }
                .invoices-table-inner-wrap {
                    border: 1px solid #E2E8F0;
                }
                .invoices-thead {
                    background: #F8FAFC;
                }
                .invoices-thead th {
                    color: #94A3B8;
                }
                .invoice-row {
                    border-bottom: 1px solid #F1F5F9;
                }
                .invoice-row.inv-row-even {
                    background: #ffffff;
                }
                .invoice-row.inv-row-odd {
                    background: #FAFAFA;
                }
                .invoice-id {
                    color: #064E3B;
                }
                .invoice-date {
                    color: #64748B;
                }
                .invoice-tier {
                    color: #1E293B;
                }
                .invoice-method-pill {
                    background: #F1F5F9;
                    color: #475569;
                }
                .invoice-status-pill {
                    background: #F0FDF4;
                    color: #1B6B3A;
                }
                .invoice-amount {
                    color: #1E293B;
                }
                .icai-modal-card {
                    background: #ffffff;
                    border: 1px solid #E2E8F0;
                    color: #0F172A;
                }
                .icai-modal-card h3 {
                    color: #0F172A;
                }
                .icai-modal-card p {
                    color: #64748B;
                }
                .icai-modal-info {
                    background: #F8FAFC;
                    border-top: 1px solid #F1F5F9;
                    border-bottom: 1px solid #F1F5F9;
                    color: #475569;
                }
                .icai-modal-cancel-btn {
                    background: #F1F5F9;
                    color: #475569;
                    border: 1px solid #CBD5E1;
                }

                /* Dark Mode Overrides for Subscription Page */
                [data-theme='dark'] .subscription-page-root,
                .dark-theme .subscription-page-root,
                .dark .subscription-page-root {
                    background-color: #0B0F19 !important;
                    background: #0B0F19 !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .subscription-title,
                .dark-theme .subscription-title,
                .dark .subscription-title,
                [data-theme='dark'] .sub-section-title,
                .dark-theme .sub-section-title,
                .dark .sub-section-title,
                [data-theme='dark'] .cmp-title,
                .dark-theme .cmp-title,
                .dark .cmp-title,
                [data-theme='dark'] .invoices-title,
                .dark-theme .invoices-title,
                .dark .invoices-title {
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .subscription-subtitle,
                .dark-theme .subscription-subtitle,
                .dark .subscription-subtitle,
                [data-theme='dark'] .cmp-desc,
                .dark-theme .cmp-desc,
                .dark .cmp-desc {
                    color: #94A3B8 !important;
                }
                [data-theme='dark'] .sub-billing-cycle-badge,
                .dark-theme .sub-billing-cycle-badge,
                .dark .sub-billing-cycle-badge {
                    background: rgba(16, 185, 129, 0.15) !important;
                    border: 1px solid rgba(16, 185, 129, 0.3) !important;
                }
                [data-theme='dark'] .sub-billing-cycle-label,
                .dark-theme .sub-billing-cycle-label,
                .dark .sub-billing-cycle-label {
                    color: #34D399 !important;
                }
                [data-theme='dark'] .sub-tabs-pill-container,
                .dark-theme .sub-tabs-pill-container,
                .dark .sub-tabs-pill-container {
                    background: #141E33 !important;
                    border: 1px solid #1E293B !important;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4) !important;
                }
                [data-theme='dark'] .sub-tab-btn:not(.active),
                .dark-theme .sub-tab-btn:not(.active),
                .dark .sub-tab-btn:not(.active) {
                    color: #94A3B8 !important;
                }
                [data-theme='dark'] .sub-beta-card,
                .dark-theme .sub-beta-card,
                .dark .sub-beta-card {
                    background: #141E33 !important;
                    border: 1px solid #1E293B !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .plan-card,
                .dark-theme .plan-card,
                .dark .plan-card {
                    background: #141E33 !important;
                    border-color: #1E293B !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .plan-card.is-active,
                .dark-theme .plan-card.is-active,
                .dark .plan-card.is-active {
                    border-color: #0f766e !important;
                    box-shadow: 0 20px 25px -5px rgba(15, 118, 110, 0.35) !important;
                }
                [data-theme='dark'] .plan-title,
                .dark-theme .plan-title,
                .dark .plan-title,
                [data-theme='dark'] .plan-price,
                .dark-theme .plan-price,
                .dark .plan-price {
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .plan-desc,
                .dark-theme .plan-desc,
                .dark .plan-desc,
                [data-theme='dark'] .plan-period,
                .dark-theme .plan-period,
                .dark .plan-period,
                [data-theme='dark'] .plan-equiv,
                .dark-theme .plan-equiv,
                .dark .plan-equiv {
                    color: #94A3B8 !important;
                }
                [data-theme='dark'] .plan-orig-price,
                .dark-theme .plan-orig-price,
                .dark .plan-orig-price {
                    color: #64748B !important;
                }
                [data-theme='dark'] .plan-save-badge,
                .dark-theme .plan-save-badge,
                .dark .plan-save-badge {
                    background: rgba(16, 185, 129, 0.2) !important;
                    color: #6EE7B7 !important;
                }
                [data-theme='dark'] .firm-stepper-box,
                .dark-theme .firm-stepper-box,
                .dark .firm-stepper-box {
                    background: #0F172A !important;
                    border-color: #1E293B !important;
                }
                [data-theme='dark'] .firm-stepper-box span,
                .dark-theme .firm-stepper-box span,
                .dark .firm-stepper-box span {
                    color: #E2E8F0 !important;
                }
                [data-theme='dark'] .firm-stepper-box button,
                .dark-theme .firm-stepper-box button,
                .dark .firm-stepper-box button {
                    background: #1E293B !important;
                    border-color: #334155 !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .plan-card .upgrade-btn,
                .dark-theme .plan-card .upgrade-btn,
                .dark .plan-card .upgrade-btn {
                    background: #141E33 !important;
                }
                [data-theme='dark'] .plan-card .upgrade-btn:hover,
                .dark-theme .plan-card .upgrade-btn:hover,
                .dark .plan-card .upgrade-btn:hover {
                    background: #1E293B !important;
                }
                [data-theme='dark'] .plan-divider,
                .dark-theme .plan-divider,
                .dark .plan-divider {
                    border-color: #1E293B !important;
                }
                [data-theme='dark'] .plan-included-header,
                .dark-theme .plan-included-header,
                .dark .plan-included-header {
                    color: #E2E8F0 !important;
                }
                [data-theme='dark'] .plan-feature-item,
                .dark-theme .plan-feature-item,
                .dark .plan-feature-item {
                    color: #CBD5E1 !important;
                }
                [data-theme='dark'] .cmp-table-container,
                .dark-theme .cmp-table-container,
                .dark .cmp-table-container,
                [data-theme='dark'] .invoices-history-card,
                .dark-theme .invoices-history-card,
                .dark .invoices-history-card {
                    background: #141E33 !important;
                    border-color: #1E293B !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4) !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .cmp-header-icon-wrap,
                .dark-theme .cmp-header-icon-wrap,
                .dark .cmp-header-icon-wrap {
                    background: rgba(16, 185, 129, 0.15) !important;
                    color: #34D399 !important;
                }
                [data-theme='dark'] .cmp-table-inner-wrap,
                .dark-theme .cmp-table-inner-wrap,
                .dark .cmp-table-inner-wrap,
                [data-theme='dark'] .invoices-table-inner-wrap,
                .dark-theme .invoices-table-inner-wrap,
                .dark .invoices-table-inner-wrap {
                    border-color: #1E293B !important;
                }
                [data-theme='dark'] .cmp-table,
                .dark-theme .cmp-table,
                .dark .cmp-table {
                    background: #141E33 !important;
                }
                [data-theme='dark'] .cmp-th-feature,
                .dark-theme .cmp-th-feature,
                .dark .cmp-th-feature {
                    background: #0F172A !important;
                    color: #F8FAFC !important;
                    border-bottom: 2px solid #1E293B !important;
                }
                [data-theme='dark'] .cmp-table th,
                .dark-theme .cmp-table th,
                .dark .cmp-table th {
                    border-bottom: 2px solid #1E293B !important;
                }
                [data-theme='dark'] .cmp-row,
                .dark-theme .cmp-row,
                .dark .cmp-row {
                    border-bottom: 1px solid #1E293B !important;
                }
                [data-theme='dark'] .cmp-row-even,
                .dark-theme .cmp-row-even,
                .dark .cmp-row-even {
                    background: #141E33 !important;
                }
                [data-theme='dark'] .cmp-row-odd,
                .dark-theme .cmp-row-odd,
                .dark .cmp-row-odd {
                    background: #0F172A !important;
                }
                [data-theme='dark'] .cmp-table tr:hover td,
                .dark-theme .cmp-table tr:hover td,
                .dark .cmp-table tr:hover td {
                    background-color: #1E293B !important;
                }
                [data-theme='dark'] .cmp-feature-name,
                .dark-theme .cmp-feature-name,
                .dark .cmp-feature-name {
                    color: #E2E8F0 !important;
                }
                [data-theme='dark'] .cmp-cell-val,
                .dark-theme .cmp-cell-val,
                .dark .cmp-cell-val {
                    color: #F1F5F9 !important;
                }
                [data-theme='dark'] .cmp-cell-val.unlimited,
                .dark-theme .cmp-cell-val.unlimited,
                .dark .cmp-cell-val.unlimited {
                    color: #34D399 !important;
                }
                [data-theme='dark'] .invoices-header-icon,
                .dark-theme .invoices-header-icon,
                .dark .invoices-header-icon {
                    color: #34D399 !important;
                }
                [data-theme='dark'] .invoices-thead,
                .dark-theme .invoices-thead,
                .dark .invoices-thead {
                    background: #0F172A !important;
                }
                [data-theme='dark'] .invoices-thead th,
                .dark-theme .invoices-thead th,
                .dark .invoices-thead th {
                    color: #94A3B8 !important;
                    border-bottom: 1px solid #1E293B !important;
                }
                [data-theme='dark'] .invoice-row,
                .dark-theme .invoice-row,
                .dark .invoice-row {
                    border-bottom: 1px solid #1E293B !important;
                }
                [data-theme='dark'] .invoice-row.inv-row-even,
                .dark-theme .invoice-row.inv-row-even,
                .dark .invoice-row.inv-row-even {
                    background: #141E33 !important;
                }
                [data-theme='dark'] .invoice-row.inv-row-odd,
                .dark-theme .invoice-row.inv-row-odd,
                .dark .invoice-row.inv-row-odd {
                    background: #0F172A !important;
                }
                [data-theme='dark'] .invoice-id,
                .dark-theme .invoice-id,
                .dark .invoice-id {
                    color: #34D399 !important;
                }
                [data-theme='dark'] .invoice-date,
                .dark-theme .invoice-date,
                .dark .invoice-date {
                    color: #94A3B8 !important;
                }
                [data-theme='dark'] .invoice-tier,
                .dark-theme .invoice-tier,
                .dark .invoice-tier,
                [data-theme='dark'] .invoice-amount,
                .dark-theme .invoice-amount,
                .dark .invoice-amount {
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .invoice-method-pill,
                .dark-theme .invoice-method-pill,
                .dark .invoice-method-pill {
                    background: #1E293B !important;
                    color: #CBD5E1 !important;
                }
                [data-theme='dark'] .invoice-status-pill,
                .dark-theme .invoice-status-pill,
                .dark .invoice-status-pill {
                    background: rgba(16, 185, 129, 0.18) !important;
                    color: #34D399 !important;
                }
                [data-theme='dark'] .icai-modal-card,
                .dark-theme .icai-modal-card,
                .dark .icai-modal-card {
                    background: #141E33 !important;
                    border-color: #1E293B !important;
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .icai-modal-card h3,
                .dark-theme .icai-modal-card h3,
                .dark .icai-modal-card h3 {
                    color: #F8FAFC !important;
                }
                [data-theme='dark'] .icai-modal-card p,
                .dark-theme .icai-modal-card p,
                .dark .icai-modal-card p {
                    color: #94A3B8 !important;
                }
                [data-theme='dark'] .icai-modal-info,
                .dark-theme .icai-modal-info,
                .dark .icai-modal-info {
                    background: #0F172A !important;
                    border-color: #1E293B !important;
                    color: #CBD5E1 !important;
                }
                [data-theme='dark'] .icai-modal-cancel-btn,
                .dark-theme .icai-modal-cancel-btn,
                .dark .icai-modal-cancel-btn {
                    background: #1E293B !important;
                    border-color: #334155 !important;
                    color: #CBD5E1 !important;
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <CreditCard size={22} />
                        </div>
                        <h1 className="subscription-title" style={{ fontSize: '2rem', fontWeight: '850' }}>Subscription & Billing</h1>
                    </div>
                    <p className="subscription-subtitle" style={{ fontWeight: '500' }}>Manage your active workspace tier, features access, and transaction statements.</p>
                </div>
                
                {/* Billing Badge */}
                <div className="sub-billing-cycle-badge" style={{ display: 'flex', padding: '0.6rem 1.25rem', borderRadius: '14px', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="sub-billing-cycle-label" style={{ fontWeight: '800', fontSize: '0.85rem' }}>Annual Billing Cycle</span>
                    <span style={{ background: '#1B6B3A', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: '800' }}>ACTIVE</span>
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Current Tier Widget */}
            <div style={{ 
                background: renewal.gradient, 
                borderRadius: '24px', 
                padding: '1.25rem 2rem', 
                color: 'white', 
                marginBottom: '2rem', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: `0 12px 20px -8px ${renewal.color}30`, 
                transition: 'all 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Active Plan:</span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, lineHeight: 1.2 }}>{selectedTier}</h2>
                        </div>
                        <p style={{ color: '#DCF2E4', fontWeight: '500', fontSize: '0.85rem', margin: 0, opacity: 0.95 }}>{renewal.desc}</p>
                    </div>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.12)', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#DCF2E4', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Next Renewal</p>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>
                            {selectedTier === 'Free Plan' ? '-' : (() => {
                                const d = new Date();
                                d.setDate(d.getDate() + (planDaysRemaining || 0));
                                return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                            })()}
                        </h3>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#DCF2E4', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Renewal Amount</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>{formatCurrency(renewal.price)} <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.8 }}>+ GST</span></p>
                    </div>
                </div>
            </div>

            {/* Custom Modern Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div className="sub-tabs-pill-container" style={{ 
                    display: 'flex', 
                    padding: '0.4rem', 
                    borderRadius: '24px', 
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {[
                        { id: 'business', label: 'Business', icon: ShieldCheck, color: '#1B6B3A' },
                        { id: 'ca', label: 'FIN-PRO', icon: Award, color: '#1E3A8A' },
                        { id: 'betaclub', label: 'PARTNER LAUNCH DESK', icon: Crown, color: '#7C3AED' }
                    ].map((tab) => {
                        const isTabActive = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`sub-tab-btn ${isTabActive ? 'active' : ''}`}
                                onClick={() => setActiveCategory(tab.id)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: isTabActive 
                                        ? `linear-gradient(135deg, ${tab.color} 0%, #0c0f1d 160%)` 
                                        : 'transparent',
                                    fontSize: '0.9rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transform: isTabActive ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: isTabActive ? `0 10px 15px -3px ${tab.color}40` : 'none'
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nested Sub-selector when Beta Club is active */}
            {activeCategory === 'betaclub' && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '2rem', 
                    marginBottom: '3rem', 
                    flexWrap: 'wrap' 
                }}>
                    <div 
                        onClick={() => setBetaSubCategory('investor')}
                        className={`sub-beta-card ${betaSubCategory === 'investor' ? 'active' : ''}`}
                        style={{
                            background: betaSubCategory === 'investor' ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : undefined,
                            padding: '1.25rem 2rem',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            width: '280px',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: betaSubCategory === 'investor' ? '0 15px 30px rgba(124, 58, 237, 0.25)' : 'none',
                            transform: betaSubCategory === 'investor' ? 'scale(1.05) translateY(-4px)' : 'scale(1)'
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Crown size={20} /> Investor Club
                        </h4>
                    </div>

                    <div 
                        onClick={() => setBetaSubCategory('product')}
                        className={`sub-beta-card ${betaSubCategory === 'product' ? 'active' : ''}`}
                        style={{
                            background: betaSubCategory === 'product' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : undefined,
                            padding: '1.25rem 2rem',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            width: '280px',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: betaSubCategory === 'product' ? '0 15px 30px rgba(236, 72, 153, 0.25)' : 'none',
                            transform: betaSubCategory === 'product' ? 'scale(1.05) translateY(-4px)' : 'scale(1)'
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Zap size={20} /> Products & Ideas
                        </h4>
                    </div>
                </div>
            )}

            {/* Pricing Tiers Selection Grid */}
            <h3 className="sub-section-title" style={{ fontSize: '1.5rem', fontWeight: '850', marginBottom: '1.25rem' }}>Upgrade Workspace Tier</h3>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${allTiers[activeCategory === 'betaclub' ? (betaSubCategory === 'investor' ? 'betaclub_investor' : 'betaclub_product') : activeCategory].length}, minmax(0, 1fr))`, 
                gap: '1.5rem', 
                marginBottom: '3rem',
                maxWidth: allTiers[activeCategory === 'betaclub' ? (betaSubCategory === 'investor' ? 'betaclub_investor' : 'betaclub_product') : activeCategory].length < 3 ? '800px' : 'none',
                margin: '0 auto 3rem auto'
            }}>
                {allTiers[activeCategory === 'betaclub' ? (betaSubCategory === 'investor' ? 'betaclub_investor' : 'betaclub_product') : activeCategory].map((tier, idx) => {
                    const isFirmPlan = tier.name === 'Fin-Pro Firm';
                    const price = isFirmPlan ? (1499 + Math.max(0, firmMembersCount - 3) * 299) : (tier.priceAnnually || tier.price);
                    const originalPrice = isFirmPlan ? (2499 + Math.max(0, firmMembersCount - 3) * 499) : tier.originalPrice;
                    
                    const currentCategoryKey = activeCategory === 'betaclub' ? (betaSubCategory === 'investor' ? 'betaclub_investor' : 'betaclub_product') : activeCategory;
                    const activeModulePlan = 
                        currentCategoryKey === 'business' ? (user?.active_subscriptions?.business?.plan || user?.tier || 'Starter Plan') :
                        currentCategoryKey === 'ca' ? (user?.active_subscriptions?.fin_pro?.plan || user?.finpro_plan || null) :
                        currentCategoryKey === 'betaclub_investor' ? (user?.active_subscriptions?.investor?.plan || user?.investor_plan || (localStorage.getItem('cliks_investor_active') === 'true' ? 'Basic Investor' : null)) :
                        currentCategoryKey === 'betaclub_product' ? (user?.active_subscriptions?.poster?.plan || user?.poster_plan || (localStorage.getItem('cliks_poster_active') === 'true' ? 'Monthly Innovator' : null)) : null;

                    const isActive = tier.name === activeModulePlan || (tier.name === selectedTier && currentCategoryKey === 'business');
                    const TierIcon = tier.icon;
                    return (
                        <div 
                            key={idx} 
                            className={`plan-card ${isActive ? 'is-active' : ''}`}
                            onClick={() => setSelectedTier(tier.name)}
                            style={{ 
                                borderRadius: '24px', 
                                border: isActive ? `3px solid #0f766e` : '1px solid #E2E8F0',
                                padding: '1.75rem 2rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transform: isActive ? 'translateY(-6px)' : 'none',
                                boxShadow: isActive ? `0 20px 25px -5px rgba(15, 118, 110, 0.2)` : 'none'
                            }}
                        >
                            {isActive && (
                                <span style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#0f766e', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '0.4rem 0.8rem', borderRadius: '10px', textTransform: 'uppercase' }}>
                                    {tier.badge}
                                </span>
                            )}
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${tier.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color, marginBottom: '1rem' }}>
                                <TierIcon size={24} />
                            </div>
                            <h4 className="plan-title" style={{ fontSize: '1.35rem', fontWeight: '850', marginBottom: '0.5rem' }}>{tier.name}</h4>
                            <p className="plan-desc" style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.25rem', minHeight: '34px' }}>{tier.desc}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <span className="plan-orig-price" style={{ fontSize: '1.25rem', fontWeight: '700', textDecoration: 'line-through' }}>{formatCurrency(originalPrice)}</span>
                                    <span className="plan-save-badge" style={{ fontSize: '0.8rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Save {formatCurrency(originalPrice - price)}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5" style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                                    <span className="plan-price leading-none" style={{ fontSize: '2.25rem', fontWeight: '900', lineHeight: 1 }}>{formatCurrency(price)}</span>
                                    <span className="plan-period" style={{ fontWeight: '600', fontSize: '0.9rem', lineHeight: 1 }}>/ {tier.period || 'year'}</span>
                                </div>
                                {(!tier.period || tier.period === 'year') ? (
                                    <span className="plan-equiv" style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.15rem' }}>
                                        (Equivalent to {formatCurrency(Math.round(price / 12))} per month)
                                    </span>
                                ) : (
                                    <span className="plan-equiv" style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.15rem' }}>
                                        (Billed every month)
                                    </span>
                                )}
                            </div>

                            {isFirmPlan && (
                                <div className="firm-stepper-box" style={{ 
                                    margin: '0 0 1.25rem 0', 
                                    padding: '0.75rem 1rem', 
                                    borderRadius: '16px', 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.35rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Total Team Members:</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFirmMembersCount(prev => Math.max(1, prev - 1));
                                                }}
                                                style={{ 
                                                    width: '24px', 
                                                    height: '24px', 
                                                    borderRadius: '50%', 
                                                    fontWeight: '800', 
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.85rem'
                                                }}
                                            >-</button>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '800', minWidth: '16px', textAlign: 'center' }}>{firmMembersCount}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFirmMembersCount(prev => prev + 1);
                                                }}
                                                style={{ 
                                                    width: '24px', 
                                                    height: '24px', 
                                                    borderRadius: '50%', 
                                                    fontWeight: '800', 
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.85rem'
                                                }}
                                            >+</button>
                                        </div>
                                    </div>
                                    {firmMembersCount > 3 && (
                                         <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563EB', textAlign: 'right' }}>
                                             +{firmMembersCount - 3} extra members (₹299/mo each)
                                         </div>
                                     )}
                                </div>
                            )}

                            {isActive ? (
                                <button 
                                    disabled
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.85rem', 
                                        borderRadius: '9999px', 
                                        border: 'none',
                                        background: '#0f766e',
                                        color: '#FFFFFF',
                                        fontWeight: '700',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.025em',
                                        textAlign: 'center',
                                        cursor: 'default',
                                        marginBottom: '1.25rem',
                                        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    Currently Active Plan
                                </button>
                            ) : activeCategory === 'betaclub' ? (
                                <button 
                                    type="button"
                                    disabled
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold cursor-default select-none transition-none shadow-none"
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.85rem', 
                                        borderRadius: '16px', 
                                        border: `1px solid ${tier.color || '#a855f7'}`,
                                        color: tier.color || '#7c3aed',
                                        fontWeight: '800',
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        marginBottom: '1.25rem'
                                    }}
                                >
                                    Upgrade Plan
                                </button>
                            ) : (
                                <button 
                                    className="upgrade-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpgrade(tier);
                                    }}
                                    disabled={isProcessing}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.85rem', 
                                        borderRadius: '16px', 
                                        border: `1px solid ${tier.color}`,
                                        color: tier.color,
                                        fontWeight: '800',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        marginBottom: '1.25rem'
                                    }}
                                >
                                    {isProcessing ? 'Connecting...' : 'Upgrade Plan'}
                                </button>
                            )}

                            <div className="plan-divider" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                                <p className="plan-included-header" style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>What's Included</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="plan-feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                            <Check size={16} style={{ color: tier.color, flexShrink: 0, marginTop: '0.15rem' }} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Plan Comparison Table Section (Business Category) */}
            {activeCategory === 'business' && (
                <div className="cmp-table-container" style={{ borderRadius: '32px', padding: '2rem 2.5rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                        <div className="cmp-header-icon-wrap" style={{ width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="cmp-title" style={{ fontSize: '1.35rem', fontWeight: '850', margin: 0 }}>Plan Features Comparison</h3>
                            <p className="cmp-desc" style={{ fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>Compare exact features, usage quotas, and capabilities across all subscription tiers.</p>
                        </div>
                    </div>

                    <div className="cmp-table-inner-wrap" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        <table className="cmp-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                            <thead>
                                <tr>
                                    <th className="cmp-th-feature" style={{ width: '31%', padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '1.1rem', fontWeight: '850' }}>
                                        Platform / Feature
                                    </th>
                                    
                                    {/* Starter Plan Header Column */}
                                    <th style={{ width: '23%', padding: '1.25rem 1rem', background: '#16A34A', color: 'white', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>Starter</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '800' }}>₹2,999 / year</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600', marginBottom: '0.5rem' }}>(~₹250/month)</div>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'inline-block' }}>
                                            Best for Small business
                                        </div>
                                    </th>

                                    {/* Growth Plan Header Column */}
                                    <th style={{ width: '23%', padding: '1.25rem 1rem', background: '#2563EB', color: 'white', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>Growth</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '800' }}>₹6,999 / year</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600', marginBottom: '0.5rem' }}>(~₹583/month)</div>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'inline-block' }}>
                                            Best for Growing business
                                        </div>
                                    </th>

                                    {/* Elite Plan Header Column */}
                                    <th style={{ width: '23%', padding: '1.25rem 1rem', background: '#7C3AED', color: 'white', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>Elite</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '800' }}>₹8,999 / year</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600', marginBottom: '0.5rem' }}>(~₹750/month)</div>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'inline-block' }}>
                                            Best for Large / advanced business
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Standard Feature Rows */}
                                {comparisonRows.map((row, rIdx) => {
                                    const RowIcon = row.icon;
                                    return (
                                        <tr key={rIdx} className={`cmp-row ${rIdx % 2 === 0 ? 'cmp-row-even' : 'cmp-row-odd'}`}>
                                            <td className="cmp-feature-name" style={{ padding: '0.85rem 1.5rem', textAlign: 'left', fontWeight: '700', fontSize: '0.88rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                    <RowIcon size={17} color="#2563EB" />
                                                    <span>{row.feature}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                {renderCellValue(row.starter)}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                {renderCellValue(row.growth)}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                {renderCellValue(row.elite)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invoices History list */}
            <div className="invoices-history-card" style={{ borderRadius: '32px', padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <History size={20} className="invoices-header-icon" />
                    <h3 className="invoices-title" style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Billing & Statement History</h3>
                </div>
                <div className="invoices-table-inner-wrap" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead className="invoices-thead">
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Invoice ID</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Billing Date</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Tier Details</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Payment Mode</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, idx) => (
                                <tr key={idx} className={`invoice-row ${idx % 2 === 0 ? 'inv-row-even' : 'inv-row-odd'}`}>
                                    <td className="invoice-id" style={{ padding: '1.25rem', fontWeight: '800' }}>{inv.id}</td>
                                    <td className="invoice-date" style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '500' }}>{inv.date}</td>
                                    <td className="invoice-tier" style={{ padding: '1.25rem', fontWeight: '700' }}>{inv.tier}</td>
                                    <td className="invoice-method" style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '600' }}><span className="invoice-method-pill">{inv.method}</span></td>
                                    <td className="invoice-status" style={{ padding: '1.25rem' }}><span className="invoice-status-pill">{inv.status}</span></td>
                                    <td className="invoice-amount" style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '850' }}>{formatCurrency(inv.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🛡 ICAI Verification Guard Modal */}
            {showIcaiGuardModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999999,
                    padding: '20px'
                }}>
                    <div className="icai-modal-card" style={{
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '520px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            padding: '28px 28px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '20px',
                                background: '#FEF3C7',
                                color: '#D97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                border: '1px solid #FDE68A'
                            }}>
                                <ShieldAlert size={34} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '850', margin: 0, letterSpacing: '-0.02em' }}>
                                Institutional ICAI Verification Required
                            </h3>
                            <p style={{ fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
                                You must verify your official ICAI credentials before subscribing to the <strong>FIN-PRO Advisory Suite</strong>. This ensures compliance with institutional CA standards.
                            </p>
                        </div>

                        <div className="icai-modal-info" style={{
                            padding: '16px 28px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                            <span style={{ fontSize: '12.5px', fontWeight: '600' }}>
                                Verification takes only a minute and unlocks multi-client auditing, direct workpapers, and client billing.
                            </span>
                        </div>

                        <div style={{
                            padding: '20px 28px',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                className="icai-modal-cancel-btn"
                                onClick={() => setShowIcaiGuardModal(false)}
                                style={{
                                    padding: '11px 20px',
                                    borderRadius: '12px',
                                    fontSize: '13.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Not Now
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowIcaiGuardModal(false);
                                    navigate('/ca?verify_icai=true');
                                }}
                                style={{
                                    padding: '11px 24px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontSize: '13.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>Proceed to ICAI Verification</span>
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default BusinessSubscription;

