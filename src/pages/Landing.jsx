import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, ShieldCheck, TrendingUp,
    PlayCircle, Users, Shield, Star, CreditCard, LineChart,
    Target, UserPlus, Sparkles, Twitter, Linkedin, Facebook,
    Check, BarChart3, Package, ShoppingCart, Wallet, Receipt,
    Warehouse, Factory, FileText, Clock, Truck, Briefcase,
    Zap, Globe, Monitor, Lock, Headphones, Award, ChevronRight,
    DollarSign, PieChart, LayoutDashboard
} from 'lucide-react';

import { Loader } from '../components/common';
import logoPng from '../assets/cliks.png';
import { useAuth } from '../context';

// Scroll-triggered animation observer
const useScrollAnimation = (loading) => {
    useEffect(() => {
        if (loading) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );
        setTimeout(() => {
            const elements = document.querySelectorAll('.scroll-animate');
            elements.forEach((el) => observer.observe(el));
        }, 100);
        return () => observer.disconnect();
    }, [loading]);
};

// Interactive console tab data
const CONSOLE_TABS = [
    {
        id: 'invoicing',
        label: 'Invoicing',
        icon: Receipt,
        rows: [
            { inv: 'INV-2048', client: 'Sunrise Traders', amount: '₹1,24,500', status: 'Paid', color: '#059669' },
            { inv: 'INV-2049', client: 'GreenLeaf Pvt. Ltd.', amount: '₹78,200', status: 'Pending', color: '#F59E0B' },
            { inv: 'INV-2050', client: 'MegaCorp Industries', amount: '₹3,45,000', status: 'Overdue', color: '#DC2626' }
        ]
    },
    {
        id: 'warehouse',
        label: 'Warehouse',
        icon: Warehouse,
        rows: [
            { inv: 'WH-Mumbai', client: '2,450 SKUs', amount: '94% Full', status: 'Active', color: '#059669' },
            { inv: 'WH-Delhi', client: '1,820 SKUs', amount: '67% Full', status: 'Active', color: '#059669' },
            { inv: 'WH-Bangalore', client: '980 SKUs', amount: '41% Full', status: 'Restocking', color: '#F59E0B' }
        ]
    },
    {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        rows: [
            { inv: 'EMP-101', client: 'Rajesh Kumar (Ops Lead)', amount: '₹65,000', status: 'Processed', color: '#059669' },
            { inv: 'EMP-102', client: 'Priya Sharma (Marketing)', amount: '₹52,000', status: 'Processed', color: '#059669' },
            { inv: 'EMP-103', client: 'Aditya Verma (Warehouse)', amount: '₹38,000', status: 'Pending', color: '#F59E0B' }
        ]
    }
];

const Landing = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeConsoleTab, setActiveConsoleTab] = useState('invoicing');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { isAuthenticated, user } = useAuth();
    useScrollAnimation(loading);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (loading) {
        return (
            <div style={{
                height: '100vh', width: '100vw',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: '#F0FDF4'
            }}>
                <Loader />
            </div>
        );
    }

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        navigate('/auth');
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    const activeTabData = CONSOLE_TABS.find(t => t.id === activeConsoleTab) || CONSOLE_TABS[0];

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", overflowX: 'hidden', background: '#FAFFFE' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(27,107,58,0.15); } 50% { box-shadow: 0 0 40px rgba(27,107,58,0.3); } }
                @keyframes slideRight { from { transform: translateX(-10px); opacity:0; } to { transform: translateX(0); opacity:1; } }

                .scroll-animate { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
                .scroll-animate.animate-in { opacity: 1; transform: translateY(0); }
                .hover-scale { transition: transform 0.3s ease; }
                .hover-scale:hover { transform: scale(1.04); }
                .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(27,107,58,0.12); }
                .nav-link { color: #475569; font-weight: 600; cursor: pointer; transition: color 0.3s; font-size: 14px; }
                .nav-link:hover { color: #1B6B3A; }

                .console-row { animation: slideRight 0.3s ease forwards; }
                .console-row:nth-child(2) { animation-delay: 0.08s; }
                .console-row:nth-child(3) { animation-delay: 0.16s; }

                .gradient-border { position: relative; }
                .gradient-border::before {
                    content: ''; position: absolute; inset: -1px; border-radius: inherit;
                    padding: 1.5px; background: linear-gradient(135deg, #1B6B3A, #22C55E, #1B6B3A);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude;
                }

                .desktop-only { display: block; }
                .mobile-menu { display: none; }

                @media (max-width: 1024px) {
                    .desktop-only { display: none !important; }
                    .mobile-menu { display: flex !important; }
                    .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; text-align: center; }
                    .hero-content { align-items: center; display: flex; flex-direction: column; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .pricing-grid { grid-template-columns: 1fr !important; max-width: 500px !important; margin: 0 auto; }
                    .steps-grid { grid-template-columns: 1fr !important; }
                    .footer-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr !important; }
                    .feature-grid { grid-template-columns: 1fr !important; }
                    .footer-grid { grid-template-columns: 1fr !important; }
                    .nav-items { display: none !important; }
                }
            `}</style>

            {/* ═══════════════════ NAVBAR ═══════════════════ */}
            <nav style={{
                padding: scrolled ? '10px 40px' : '14px 40px',
                background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(16px)',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                boxShadow: scrolled ? '0 4px 30px rgba(6,78,59,0.12)' : '0 1px 20px rgba(6,78,59,0.06)',
                transition: 'all 0.3s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '34px', height: '34px' }} />
                    <span style={{ fontSize: '19px', fontWeight: '800', color: '#064E3B', letterSpacing: '0.5px' }}>CLIKS</span>
                    <span style={{
                        fontSize: '9px', fontWeight: '800', color: '#059669', background: '#ECFDF5',
                        padding: '2px 8px', borderRadius: '6px', letterSpacing: '1px', marginLeft: '2px'
                    }}>BUSINESS</span>
                </div>

                <div className="nav-items" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    {['Features', 'How it Works', 'Pricing'].map(item => (
                        <span key={item} onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} className="nav-link">
                            {item}
                        </span>
                    ))}
                    <button onClick={handleLogin} style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)',
                        color: '#FFFFFF', borderRadius: '10px', fontWeight: '700', fontSize: '13px',
                        border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 18px rgba(27,107,58,0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,107,58,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(27,107,58,0.3)'; }}
                    >
                        Get Started <ArrowRight size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            </nav>

            {/* ═══════════════════ HERO SECTION ═══════════════════ */}
            <section id="hero" className="hero-grid" style={{
                padding: '120px 40px 80px', minHeight: '100vh',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px',
                alignItems: 'center', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(180deg, #F0FDF4 0%, #FAFFFE 60%, #FFFFFF 100%)'
            }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-200px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(27,107,58,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div className="hero-content scroll-animate">
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px', background: 'linear-gradient(135deg, rgba(27,107,58,0.08), rgba(34,197,94,0.08))',
                        color: '#1B6B3A', borderRadius: '30px', fontSize: '12px', fontWeight: '700', marginBottom: '20px',
                        border: '1px solid rgba(27,107,58,0.15)'
                    }}>
                        <Zap size={13} /> NOW LIVE: 30+ Connected Business Modules
                    </div>

                    <h1 style={{
                        fontSize: '52px', fontWeight: '900', lineHeight: '1.08', marginBottom: '24px', color: '#064E3B',
                        letterSpacing: '-0.03em'
                    }}>
                        The Complete<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #22C55E 50%, #1B6B3A 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text', color: 'transparent',
                            animation: 'shimmer 4s linear infinite'
                        }}>Enterprise Operating</span><br />
                        <span style={{ color: '#064E3B' }}>System.</span>
                    </h1>

                    <p style={{
                        fontSize: '17px', lineHeight: '1.75', color: '#475569', marginBottom: '36px', maxWidth: '520px', fontWeight: '500'
                    }}>
                        Run invoicing, warehouses, payroll, accounting, GST compliance, and CA audits — all from one ultra-fast business console. Built for Indian enterprises.
                    </p>

                    <div style={{ display: 'flex', gap: '14px', marginBottom: '44px', flexWrap: 'wrap' }}>
                        <button onClick={handleLogin} className="hover-scale" style={{
                            padding: '15px 32px',
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)',
                            color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                            cursor: 'pointer', boxShadow: '0 8px 30px rgba(27,107,58,0.35)',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            Start Free Trial <ArrowRight size={18} />
                        </button>
                        <button onClick={() => scrollToSection('features')} style={{
                            padding: '15px 32px', background: 'white', color: '#1B6B3A',
                            border: '2px solid rgba(27,107,58,0.25)', borderRadius: '12px', fontSize: '15px',
                            fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B6B3A'; e.currentTarget.style.background = '#F0FDF4'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(27,107,58,0.25)'; e.currentTarget.style.background = 'white'; }}
                        >
                            Explore Modules <PlayCircle size={18} />
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        {[
                            { icon: ShieldCheck, text: 'Bank-grade encryption' },
                            { icon: Globe, text: 'GST compliant by design' },
                            { icon: Headphones, text: '24/7 Enterprise support' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '600' }}>
                                <item.icon size={15} style={{ color: '#1B6B3A' }} />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interactive Console Preview */}
                <div className="scroll-animate" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="gradient-border" style={{
                        background: '#FFFFFF', borderRadius: '20px', padding: '0',
                        boxShadow: '0 25px 80px rgba(6,78,59,0.12)', overflow: 'hidden',
                        maxWidth: '520px', margin: '0 auto',
                        animation: 'pulseGlow 4s ease-in-out infinite'
                    }}>
                        {/* Console Titlebar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px', background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginLeft: '6px' }}>CLIKS Business Console</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Monitor size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                <Lock size={11} style={{ color: '#22C55E' }} />
                            </div>
                        </div>

                        {/* Console Tabs */}
                        <div style={{
                            display: 'flex', background: '#F8FAF9', borderBottom: '1px solid #E2E8F0', padding: '0 12px'
                        }}>
                            {CONSOLE_TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveConsoleTab(tab.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '12px 16px', border: 'none', cursor: 'pointer',
                                    fontWeight: '700', fontSize: '12px',
                                    background: activeConsoleTab === tab.id ? 'white' : 'transparent',
                                    color: activeConsoleTab === tab.id ? '#064E3B' : '#94A3B8',
                                    borderBottom: activeConsoleTab === tab.id ? '2px solid #1B6B3A' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <tab.icon size={13} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Console Content */}
                        <div style={{ padding: '16px 20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody key={activeConsoleTab}>
                                    {activeTabData.rows.map((row, i) => (
                                        <tr key={i} className="console-row" style={{ borderBottom: '1px solid #F8FAFC', opacity: 0 }}>
                                            <td style={{ padding: '12px 0', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>{row.inv}</td>
                                            <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.client}</td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#064E3B' }}>{row.amount}</td>
                                            <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: '800', color: row.color,
                                                    background: `${row.color}15`, padding: '3px 10px', borderRadius: '6px'
                                                }}>{row.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Console Footer */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 20px', background: '#F8FAF9', borderTop: '1px solid #E2E8F0'
                        }}>
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Live Data Feed • Secured</span>
                            <button onClick={handleLogin} style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: '800', color: '#1B6B3A',
                                background: 'none', border: 'none', cursor: 'pointer'
                            }}>
                                Open Full Console <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ STATS BAR ═══════════════════ */}
            <section style={{
                padding: '50px 40px',
                background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 50%, #064E3B 100%)',
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
                <div className="stats-grid scroll-animate" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px',
                    maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1
                }}>
                    {[
                        { num: '5,000+', label: 'Active Enterprises', icon: Briefcase },
                        { num: '₹1,200 Cr+', label: 'Transactions Processed', icon: TrendingUp },
                        { num: '99.99%', label: 'Enterprise SLA Uptime', icon: Shield },
                        { num: '30+', label: 'Connected Modules', icon: LayoutDashboard }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'rgba(255,255,255,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 14px', backdropFilter: 'blur(4px)'
                            }}>
                                <stat.icon size={22} style={{ color: '#A7F3D0' }} />
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '4px', letterSpacing: '-0.02em' }}>{stat.num}</div>
                            <div style={{ fontSize: '14px', opacity: 0.8, fontWeight: '600' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ FEATURES ═══════════════════ */}
            <section id="features" style={{ padding: '100px 40px', background: '#FAFFFE', position: 'relative' }}>
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }} className="scroll-animate">
                    <span style={{
                        display: 'inline-block', padding: '6px 18px',
                        background: 'linear-gradient(135deg, rgba(27,107,58,0.08), rgba(34,197,94,0.08))',
                        color: '#1B6B3A', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        marginBottom: '18px', letterSpacing: '1px'
                    }}>PLATFORM CAPABILITIES</span>
                    <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#064E3B', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Everything your business needs.<br />One powerful suite.
                    </h2>
                    <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', fontWeight: '500' }}>
                        From retail POS to chartered accountant auditing — every module connects seamlessly.
                    </p>
                </div>

                <div className="feature-grid scroll-animate" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
                    maxWidth: '1200px', margin: '0 auto'
                }}>
                    {[
                        {
                            title: 'Omnichannel POS & Invoicing',
                            icon: ShoppingCart, color: '#1B6B3A', bg: '#ECFDF5',
                            desc: 'Multi-device billing with barcode scanning, dynamic tax calculations, GST-compliant invoices, and instant PDF receipts.'
                        },
                        {
                            title: 'Logistics & Multi-Godown Warehousing',
                            icon: Warehouse, color: '#0284C7', bg: '#F0F9FF',
                            desc: 'Track inventory across unlimited warehouse locations. Inter-godown transfers, stock alerts, and production BOM workflows.'
                        },
                        {
                            title: 'CA Audit Hub & Compliance',
                            icon: Briefcase, color: '#7C3AED', bg: '#F5F3FF',
                            desc: 'Secure portal for Chartered Accountants to verify ledgers, audit tax returns, and download financial statements remotely.'
                        },
                        {
                            title: 'Biometric HR & Automated Payroll',
                            icon: Clock, color: '#EA580C', bg: '#FFF7ED',
                            desc: 'Attendance rosters, staff onboarding, leave management, TDS calculations, and automated salary payouts to bank accounts.'
                        },
                        {
                            title: 'Beta Wallet & Split Payments',
                            icon: Wallet, color: '#059669', bg: '#ECFDF5',
                            desc: 'Stored value business wallet with Cashfree gateway integration, loyalty point conversion, and collaborative group splits.'
                        },
                        {
                            title: 'CRM, Campaigns & Marketing',
                            icon: Target, color: '#DC2626', bg: '#FEF2F2',
                            desc: 'Customer pipeline tracking, WhatsApp broadcast campaigns, lead scoring, and automated engagement workflows.'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="hover-lift" style={{
                            padding: '32px 28px', background: '#FFFFFF', borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(6,78,59,0.05)', border: '1px solid #E8F5E9',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '14px',
                                background: feature.bg, color: feature.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <feature.icon size={24} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px', color: '#0F172A' }}>{feature.title}</h3>
                            <p style={{ color: '#64748B', lineHeight: '1.7', fontSize: '14px', fontWeight: '500' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
            <section id="how-it-works" style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '70px' }} className="scroll-animate">
                    <span style={{
                        display: 'inline-block', padding: '6px 18px',
                        background: 'linear-gradient(135deg, rgba(27,107,58,0.08), rgba(34,197,94,0.08))',
                        color: '#1B6B3A', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        marginBottom: '18px', letterSpacing: '1px'
                    }}>GET STARTED</span>
                    <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#064E3B', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Launch your business in three steps
                    </h2>
                    <p style={{ fontSize: '16px', color: '#64748B', fontWeight: '500' }}>
                        From sign-up to your first invoice in under 5 minutes.
                    </p>
                </div>

                <div className="steps-grid scroll-animate" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px',
                    maxWidth: '1000px', margin: '0 auto', position: 'relative'
                }}>
                    {/* Connector line */}
                    <div className="desktop-only" style={{
                        position: 'absolute', top: '55px', left: '15%', right: '15%',
                        height: '2px',
                        background: 'linear-gradient(90deg, #DCFCE7 0%, #1B6B3A 50%, #DCFCE7 100%)',
                        zIndex: 0
                    }} />

                    {[
                        { num: '01', title: 'Activate Business Console', desc: 'Create your workspace, enter GST/PAN details, and configure your business profile in seconds.', icon: UserPlus, color: '#1B6B3A' },
                        { num: '02', title: 'Connect Operational Nodes', desc: 'Import your items catalog, warehouse locations, employee rosters, and bank accounts.', icon: Sparkles, color: '#7C3AED' },
                        { num: '03', title: 'Launch Omnichannel Operations', desc: 'Instantly run POS billing, dispatch deliveries, process payments, and generate GST returns.', icon: Zap, color: '#059669' }
                    ].map((step, i) => (
                        <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '70px', height: '70px',
                                background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}cc 100%)`,
                                color: 'white', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: `0 10px 35px ${step.color}40`,
                                border: '4px solid white'
                            }}>
                                <step.icon size={28} />
                            </div>
                            <h1 style={{
                                position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                                fontSize: '64px', fontWeight: '900', color: step.color, opacity: 0.06, zIndex: -1
                            }}>{step.num}</h1>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px', color: '#0F172A' }}>{step.title}</h3>
                            <p style={{ color: '#64748B', lineHeight: '1.7', fontSize: '14px', fontWeight: '500' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ PRICING ═══════════════════ */}
            <section id="pricing" style={{ padding: '100px 40px', background: '#FAFFFE' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }} className="scroll-animate">
                    <span style={{
                        display: 'inline-block', padding: '6px 18px',
                        background: 'linear-gradient(135deg, rgba(27,107,58,0.08), rgba(34,197,94,0.08))',
                        color: '#1B6B3A', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        marginBottom: '18px', letterSpacing: '1px'
                    }}>PRICING</span>
                    <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#064E3B', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Plans that scale with your enterprise
                    </h2>
                    <p style={{ fontSize: '16px', color: '#64748B', fontWeight: '500' }}>
                        Start free. Upgrade when you need more power.
                    </p>
                </div>

                <div className="pricing-grid scroll-animate" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
                    maxWidth: '1100px', margin: '0 auto', alignItems: 'center'
                }}>
                    {[
                        {
                            name: 'Growth', price: '₹1,999', period: 'per month',
                            subtitle: 'Ideal for small retail stores.',
                            feat: ['POS billing & invoicing', 'Single warehouse management', 'Basic GST compliance reports', 'Up to 500 products', 'Email support'],
                            cta: 'Start Free Trial', highlight: false
                        },
                        {
                            name: 'Professional', price: '₹4,999', period: 'per month',
                            subtitle: 'For growing multi-branch businesses.',
                            feat: ['Everything in Growth', 'Multi-godown logistics & BOM', 'Split payments & Beta Wallet', 'CRM & marketing campaigns', 'Staff payroll & attendance', 'Unlimited products', 'Priority support'],
                            cta: 'Start Free Trial', highlight: true
                        },
                        {
                            name: 'Auditor Ultimate', price: '₹9,999', period: 'per month',
                            subtitle: 'For audit-ready corporates & CAs.',
                            feat: ['Everything in Professional', 'CA Audit Hub (secure access)', 'Double-entry general ledger', 'Advanced financial reports', 'Custom branding & themes', 'Dedicated account manager'],
                            cta: 'Contact Sales', highlight: false
                        }
                    ].map((plan, i) => (
                        <div key={i} style={{
                            padding: '36px 30px',
                            background: plan.highlight ? 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)' : '#FFFFFF',
                            color: plan.highlight ? '#FFFFFF' : '#0F172A',
                            borderRadius: '24px',
                            boxShadow: plan.highlight ? '0 20px 60px rgba(6,78,59,0.25)' : '0 4px 24px rgba(6,78,59,0.06)',
                            border: plan.highlight ? 'none' : '1px solid #E8F5E9',
                            transform: plan.highlight ? 'scale(1.05)' : 'scale(1)',
                            position: 'relative', zIndex: plan.highlight ? 10 : 1,
                            transition: 'all 0.3s'
                        }} className="hover-lift">
                            {plan.highlight && (
                                <div style={{
                                    position: 'absolute', top: '-14px', right: '24px',
                                    padding: '6px 16px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                    color: 'white', borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                                    letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                                }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{plan.name}</h3>
                            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px', fontWeight: '500' }}>{plan.subtitle}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em' }}>{plan.price}</span>
                                <span style={{ opacity: 0.6, fontSize: '14px', fontWeight: '600' }}>/{plan.period}</span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0' }}>
                                {plan.feat.map((f, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex', gap: '10px', marginBottom: '14px',
                                        alignItems: 'center', fontSize: '14px', fontWeight: '600'
                                    }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: plan.highlight ? 'rgba(255,255,255,0.15)' : '#ECFDF5',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <Check size={12} style={{ color: plan.highlight ? '#A7F3D0' : '#059669' }} />
                                        </div>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button onClick={handleLogin} style={{
                                width: '100%', padding: '14px 20px', borderRadius: '12px', fontSize: '14px',
                                fontWeight: '800', cursor: 'pointer',
                                background: plan.highlight ? 'white' : 'linear-gradient(135deg, #1B6B3A, #228B4C)',
                                color: plan.highlight ? '#064E3B' : 'white',
                                border: 'none',
                                boxShadow: plan.highlight ? '0 4px 16px rgba(0,0,0,0.1)' : '0 4px 16px rgba(27,107,58,0.2)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ FINAL CTA ═══════════════════ */}
            <section style={{
                padding: '100px 40px',
                background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 50%, #064E3B 100%)',
                textAlign: 'center', position: 'relative', overflow: 'hidden', color: 'white'
            }}>
                <div className="scroll-animate" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 16px', background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                        marginBottom: '24px', border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                        <Award size={14} /> Trusted by 5,000+ Indian Enterprises
                    </div>
                    <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                        Ready to transform your<br />business operations?
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '36px', fontWeight: '500', lineHeight: '1.6' }}>
                        Join thousands of enterprises running smarter with CLIKS Business Suite.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
                        <button onClick={handleLogin} className="hover-scale" style={{
                            padding: '16px 40px', background: 'white', color: '#064E3B', border: 'none',
                            borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}>
                            Start Free Trial
                        </button>
                        <button onClick={() => scrollToSection('features')} style={{
                            padding: '16px 40px', background: 'rgba(255,255,255,0.1)', color: 'white',
                            border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontSize: '16px',
                            fontWeight: '700', cursor: 'pointer', backdropFilter: 'blur(10px)'
                        }}>
                            Explore Platform
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text, i) => (
                            <span key={i} style={{ fontSize: '13px', opacity: 0.8, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Check size={13} /> {text}
                            </span>
                        ))}
                    </div>
                </div>
                {/* Decorative elements */}
                <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '350px', height: '350px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />
            </section>

            {/* ═══════════════════ FOOTER ═══════════════════ */}
            <footer style={{ padding: '70px 40px 30px', background: '#0A2F1F', color: '#FFFFFF' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '40px',
                    maxWidth: '1200px', margin: '0 auto 50px',
                    paddingBottom: '50px', borderBottom: '1px solid rgba(255,255,255,0.08)'
                }} className="footer-grid">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <img src={logoPng} alt="CLIKS Logo" style={{ width: '30px', height: '30px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>CLIKS</h3>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#A7F3D0', background: 'rgba(167,243,208,0.1)', padding: '2px 8px', borderRadius: '4px' }}>BUSINESS</span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.8', opacity: 0.6, marginBottom: '24px', maxWidth: '300px' }}>
                            The complete enterprise operating system for modern Indian businesses. Invoicing, warehousing, accounting, and more.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                <div key={i} style={{
                                    width: '38px', height: '38px',
                                    background: 'rgba(255,255,255,0.06)', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(27,107,58,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                >
                                    <Icon size={16} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: 'Platform', links: ['POS Billing', 'Invoicing', 'Inventory', 'Accounting', 'GST Compliance'] },
                        { title: 'Operations', links: ['Warehousing', 'Manufacturing', 'Delivery', 'Payroll', 'Attendance'] },
                        { title: 'Enterprise', links: ['CA Audit Hub', 'Reports & Analytics', 'CRM & Marketing', 'Beta Wallet', 'API Access'] },
                        { title: 'Company', links: ['About Us', 'Contact', 'Careers', 'Blog', 'Privacy Policy'] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 style={{ fontWeight: '800', marginBottom: '24px', fontSize: '14px', letterSpacing: '0.5px' }}>{col.title}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {col.links.map((link, j) => (
                                    <li key={j} style={{
                                        marginBottom: '14px', opacity: 0.5, cursor: 'pointer', fontSize: '13px',
                                        fontWeight: '500', transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                                    >
                                        {link}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    maxWidth: '1200px', margin: '0 auto', fontSize: '13px', opacity: 0.4,
                    flexWrap: 'wrap', gap: '16px'
                }}>
                    <div>© 2026 CLIKS Business Suite. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>🔒 Bank-level Security</span>
                        <span>⚡ 99.99% Uptime SLA</span>
                        <span>🇮🇳 Made in India</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
