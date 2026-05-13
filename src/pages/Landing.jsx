import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, ArrowRight, ShieldCheck, TrendingUp, CircleDot,
    PlayCircle, Users, Shield, Star, PieChart, CreditCard, LineChart,
    Calendar, Target, UserPlus, Link, Sparkles, Twitter, Linkedin, Facebook,
    Check
} from 'lucide-react';

import { Loader } from '../components/common';
import logoPng from '../assets/cliks.png';
import { useAuth } from '../context';

// Animation hooks
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

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            const elements = document.querySelectorAll('.scroll-animate');
            elements.forEach((el) => observer.observe(el));
        }, 100);

        return () => observer.disconnect();
    }, [loading]);
};

const Landing = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);

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
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Styles & CSS
    const styles = {
        navbar: {
            padding: scrolled ? "12px 40px" : "16px 40px",
            background: scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: scrolled ? "0 4px 30px rgba(27, 107, 58, 0.15)" : "0 2px 20px rgba(27, 107, 58, 0.1)",
            transition: "all 0.3s ease",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        hero: {
            padding: "100px 40px 60px",
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "50px",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            background: "#F0FDF4"
        },
        gradientText: {
            background: "linear-gradient(135deg, #1B6B3A 0%, #22C55E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            fontWeight: "900"
        },
        statsBar: {
            padding: "40px 40px",
            background: "linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)",
            color: "white"
        },
        section: {
            padding: "80px 40px",
            background: "#F0FDF4",
            position: "relative"
        },
        whiteSection: {
            padding: "80px 40px",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
            position: "relative"
        }
    };

    return (
        <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                
                .scroll-animate { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
                .scroll-animate.animate-in { opacity: 1; transform: translateY(0); }
                
                .hover-scale { transition: transform 0.3s ease; }
                .hover-scale:hover { transform: scale(1.05); }
                
                .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 12px 40px rgba(27, 107, 58, 0.15); }

                .nav-link { color: #546E7A; font-weight: 500; cursor: pointer; transition: color 0.3s; }
                .nav-link:hover { color: #1B6B3A; }

                .desktop-only { display: block; }

                @media (max-width: 1024px) {
                    .desktop-only { display: none !important; }
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

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '700', color: '#1B6B3A' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '32px', height: '32px' }} />
                    <span style={{ fontSize: '18px', letterSpacing: '0.5px' }}>CLIKS</span>
                </div>

                <div className="nav-items" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {['Features', 'How it Works', 'Testimonials', 'Pricing'].map(item => (
                        <span key={item} onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} className="nav-link">
                            {item}
                        </span>
                    ))}
                    <button
                        onClick={handleLogin}
                        style={{
                            padding: "10px 24px",
                            background: "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                            color: "#FFFFFF",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "14px",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(27, 107, 58, 0.3)"
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="hero-grid" style={styles.hero}>
                <div className="hero-content scroll-animate">
                    <div style={{
                        display: "inline-block", padding: "8px 16px", background: "rgba(27, 107, 58, 0.1)",
                        color: "#1B6B3A", borderRadius: "30px", fontSize: "12px", fontWeight: "600", marginBottom: "16px",
                        border: "1px solid rgba(27, 107, 58, 0.2)"
                    }}>
                        🚀 NEW: Smart Budget Predictions
                    </div>
                    <h1 style={{ fontSize: "52px", fontWeight: "800", lineHeight: "1.1", marginBottom: "24px", color: "#064E3B" }}>
                        Make your money <br />
                        <span style={styles.gradientText}>easy to understand.</span>
                    </h1>
                    <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#546E7A", marginBottom: "32px", maxWidth: "540px" }}>
                        Track accounts, budgets, debts and investments in one clean dashboard. No spreadsheets, no clutter — just clear insights.
                    </p>

                    <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
                        <button onClick={handleLogin} className="hover-scale" style={{
                            padding: "14px 28px", background: "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                            color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600",
                            cursor: "pointer", boxShadow: "0 8px 25px rgba(27, 107, 58, 0.35)", display: "flex", alignItems: "center", gap: "8px"
                        }}>
                            Start Free Trial <ArrowRight size={18} />
                        </button>
                        <button style={{
                            padding: "14px 28px", background: "#FFFFFF", color: "#1B6B3A", border: "2px solid #1B6B3A",
                            borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px"
                        }}>
                            Watch Demo <PlayCircle size={18} />
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                        <div className="hover-lift" style={{
                            padding: "20px", background: "#FFFFFF", borderRadius: "14px",
                            boxShadow: "0 4px 20px rgba(27, 107, 58, 0.08)", border: "1px solid #DCF2E4", display: "flex", gap: "14px", alignItems: "center", textAlign: "left"
                        }}>
                            <div style={{ padding: "10px", background: "#DCF2E4", borderRadius: "10px", color: "#1B6B3A" }}>
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>Private & secure by design</h3>
                                <p style={{ margin: 0, fontSize: "13px", color: "#546E7A" }}>Your data stays in your workspace. No sharing.</p>
                            </div>
                        </div>
                        <div className="hover-lift" style={{
                            padding: "20px", background: "#FFFFFF", borderRadius: "14px",
                            boxShadow: "0 4px 20px rgba(27, 107, 58, 0.08)", border: "1px solid #DCF2E4", display: "flex", gap: "14px", alignItems: "center", textAlign: "left"
                        }}>
                            <div style={{ padding: "10px", background: "#FFEBEE", borderRadius: "10px", color: "#FF6B6B" }}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>See the full picture</h3>
                                <p style={{ margin: 0, fontSize: "13px", color: "#546E7A" }}>Budgets, cashflow, goals and people connected.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scroll-animate" style={{ position: "relative", zIndex: 10 }}>
                    <div style={{
                        background: "#FFFFFF", borderRadius: "20px", padding: "32px 30px",
                        boxShadow: "0 20px 60px rgba(27, 107, 58, 0.15)", border: "1px solid #DCF2E4", maxWidth: "420px", margin: "0 auto"
                    }}>
                        <div style={{ display: 'inline-flex', padding: '12px', background: '#E8F5E9', borderRadius: '12px', marginBottom: '16px' }}>
                            <img src={logoPng} alt="CLIKS Logo" style={{ width: '40px', height: '40px' }} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#064E3B", marginBottom: "8px" }}>Sign in to continue</h2>
                        <p style={{ fontSize: "14px", color: "#78909C", marginBottom: "24px", lineHeight: "1.6" }}>
                            Use your email to create a new workspace or return to an existing one.
                        </p>
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#546E7A", marginBottom: "6px", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    style={{
                                        marginBottom: "20px", padding: "12px 16px", borderRadius: "10px", border: "2px solid #DCF2E4",
                                        fontSize: "14px", width: "100%", outline: "none", boxSizing: "border-box"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                    onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                />
                            </div>
                            <button type="submit" className="hover-scale" style={{
                                width: "100%", padding: "12px 20px", background: "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                                color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600",
                                cursor: "pointer", marginBottom: "16px", boxShadow: "0 8px 20px rgba(27, 107, 58, 0.3)"
                            }}>
                                Continue with email
                            </button>
                        </form>
                        <div style={{ textAlign: "center", color: "#B0BEC5", fontSize: "13px", margin: "16px 0" }}>or</div>
                        <button onClick={handleLogin} style={{
                            width: "100%", padding: "12px 20px", background: "#FFFFFF", color: "#1B6B3A",
                            border: "2px solid #DCF2E4", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                        }} onMouseEnter={(e) => e.target.style.background = "#F8FAFC"} onMouseLeave={(e) => e.target.style.background = "#FFFFFF"}>
                            Continue as guest
                        </button>
                        <p style={{ fontSize: "12px", color: "#90A4AE", marginTop: "20px", textAlign: "center" }}>
                            By continuing you agree to the Terms and Privacy Policy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section style={styles.statsBar}>
                <div className="stats-grid scroll-animate" style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "60px", maxWidth: "1200px", margin: "0 auto"
                }}>
                    {[
                        { num: "50K+", label: "Active Users", icon: Users },
                        { num: "₹200Cr+", label: "Assets Tracked", icon: TrendingUp },
                        { num: "99.9%", label: "Uptime", icon: Shield },
                        { num: "4.9/5", label: "User Rating", icon: Star }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: "center", color: "#FFFFFF" }}>
                            <div style={{ fontSize: "48px", fontWeight: "800", marginBottom: "8px" }}>{stat.num}</div>
                            <div style={{ fontSize: "16px", opacity: 0.9, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                <stat.icon size={20} /> {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" style={styles.section}>
                <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 40px" }} className="scroll-animate">
                    <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(27, 107, 58, 0.1)", color: "#1B6B3A", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>FEATURES</span>
                    <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#064E3B", marginBottom: "16px" }}>Everything you need to manage your finances</h2>
                    <p style={{ fontSize: "16px", color: "#546E7A" }}>Powerful tools designed to give you complete control over your financial life</p>
                </div>

                <div className="feature-grid scroll-animate" style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "1200px", margin: "0 auto"
                }}>
                    {[
                        { title: "Smart Budgeting", icon: PieChart, color: "#1B6B3A", bg: "#DCF2E4", desc: "AI-powered budget recommendations based on your spending patterns." },
                        { title: "Debt Management", icon: CreditCard, color: "#FF6B6B", bg: "#FFEBEE", desc: "Track multiple debts, visualize payoff timelines, and optimize repayment." },
                        { title: "Investment Tracking", icon: LineChart, color: "#4CAF50", bg: "#E8F5E9", desc: "Monitor your portfolio performance with real-time updates and analytics." },
                        { title: "Bill Reminders", icon: Calendar, color: "#9C27B0", bg: "#F3E5F5", desc: "Never miss a payment with intelligent reminders and automatic bill tracking." },
                        { title: "Goal Planning", icon: Target, color: "#FF9800", bg: "#FFF3E0", desc: "Set financial goals and track your progress with visual milestones." },
                        { title: "Family Sharing", icon: Users, color: "#00BCD4", bg: "#E0F7FA", desc: "Collaborate with family members on shared budgets and financial planning." }
                    ].map((feature, i) => (
                        <div key={i} className="hover-lift" style={{
                            padding: "30px 24px", background: "#FFFFFF", borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(27, 107, 58, 0.08)", border: "1px solid #DCF2E4"
                        }}>
                            <div style={{ width: "fit-content", padding: "10px", background: feature.bg, borderRadius: "10px", color: feature.color, marginBottom: "16px" }}>
                                <feature.icon size={24} />
                            </div>
                            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px", color: "#064E3B" }}>{feature.title}</h3>
                            <p style={{ color: "#546E7A", lineHeight: "1.6", fontSize: "14px" }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" style={styles.whiteSection}>
                <div style={{ textAlign: "center", marginBottom: "60px" }} className="scroll-animate">
                    <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(27, 107, 58, 0.1)", color: "#1B6B3A", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>HOW IT WORKS</span>
                    <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#064E3B", marginBottom: "16px" }}>Get started in minutes</h2>
                    <p style={{ fontSize: "16px", color: "#546E7A" }}>Three simple steps to take control of your finances</p>
                </div>

                <div className="steps-grid scroll-animate" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
                    {/* Connector Line (Desktop only) */}
                    <div className="desktop-only" style={{ position: "absolute", top: "50px", left: "0", right: "0", height: "2px", background: "linear-gradient(90deg, #DCF2E4 0%, #1B6B3A 50%, #DCF2E4 100%)", zIndex: 0 }} />

                    {[
                        { num: "01", title: "Create Your Account", desc: "Sign up in seconds with your email.", icon: UserPlus, color: "#1B6B3A" },
                        { num: "02", title: "Connect Your Accounts", desc: "Securely link your bank accounts & cards.", icon: Link, color: "#FF6B6B" },
                        { num: "03", title: "Watch the Magic Happen", desc: "Get instant insights & automated budgets.", icon: Sparkles, color: "#4CAF50" }
                    ].map((step, i) => (
                        <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                            <div style={{
                                width: "64px", height: "64px", background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                                color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 20px", boxShadow: `0 8px 30px ${step.color}4d`
                            }}>
                                <step.icon size={26} />
                            </div>
                            <h1 style={{ position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)", fontSize: "60px", fontWeight: "800", color: step.color, opacity: 0.1, zIndex: -1 }}>{step.num}</h1>
                            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "#064E3B" }}>{step.title}</h3>
                            <p style={{ color: "#546E7A", lineHeight: "1.6", fontSize: "14px" }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" style={styles.whiteSection}>
                <div style={{ textAlign: "center", marginBottom: "40px" }} className="scroll-animate">
                    <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(27, 107, 58, 0.1)", color: "#1B6B3A", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>PRICING</span>
                    <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#064E3B", marginBottom: "16px" }}>Choose your plan</h2>
                </div>

                <div className="pricing-grid scroll-animate" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "1000px", margin: "0 auto", alignItems: "center" }}>
                    {[
                        {
                            name: "Free", price: "₹0", period: "forever", feat: ["Up to 2 bank accounts", "Basic budgeting", "Monthly reports"],
                            cta: "Get Started Free", highlight: false
                        },
                        {
                            name: "Pro", price: "₹999", period: "per month", feat: ["Unlimited accounts", "Advanced budgeting", "Investment tracking", "Goal planning", "Priority support"],
                            cta: "Start Free Trial", highlight: true
                        },
                        {
                            name: "Family", price: "₹1,699", period: "per month", feat: ["Everything in Pro", "Up to 5 members", "Shared budgets", "Kids allowance"],
                            cta: "Start Free Trial", highlight: false
                        }
                    ].map((plan, i) => (
                        <div key={i} style={{
                            padding: "32px 28px",
                            background: plan.highlight ? "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)" : "#FFFFFF",
                            color: plan.highlight ? "#FFFFFF" : "#064E3B",
                            borderRadius: "20px",
                            boxShadow: plan.highlight ? "0 12px 50px rgba(27, 107, 58, 0.25)" : "0 4px 20px rgba(27, 107, 58, 0.08)",
                            border: plan.highlight ? "none" : "2px solid #DCF2E4",
                            transform: plan.highlight ? "scale(1.05)" : "scale(1)",
                            position: "relative",
                            zIndex: plan.highlight ? 10 : 1
                        }} className="hover-lift">
                            {plan.highlight && (
                                <div style={{ position: "absolute", top: "-12px", right: "20px", padding: "4px 12px", background: "#FF6B6B", color: "white", borderRadius: "20px", fontSize: "10px", fontWeight: "700" }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>{plan.name}</h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                                <span style={{ fontSize: "36px", fontWeight: "800" }}>{plan.price}</span>
                                <span style={{ opacity: 0.7, fontSize: "14px" }}>/{plan.period}</span>
                            </div>
                            <p style={{ opacity: 0.8, marginBottom: "24px", fontSize: "14px" }}>Perfect for getting started.</p>

                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", textAlign: "left" }}>
                                {plan.feat.map((f, idx) => (
                                    <li key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center", fontSize: "14px" }}>
                                        <Check size={16} style={{ opacity: plan.highlight ? 1 : 0.6 }} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button onClick={handleLogin} style={{
                                width: "100%", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                                background: plan.highlight ? "#FFFFFF" : "transparent",
                                color: plan.highlight ? "#1B6B3A" : "#1B6B3A",
                                border: plan.highlight ? "none" : "2px solid #1B6B3A"
                            }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: "80px 40px", background: "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)", textAlign: "center", position: "relative", overflow: "hidden", color: "white" }}>
                <div className="scroll-animate" style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "40px", fontWeight: "800", marginBottom: "20px" }}>Ready to take control of your finances?</h2>
                    <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px" }}>Join 50,000+ users who are already managing their money smarter</p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
                        <button onClick={handleLogin} className="hover-scale" style={{
                            padding: "16px 36px", background: "#FFFFFF", color: "#1B6B3A", border: "none", borderRadius: "10px",
                            fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
                        }}>
                            Start Free Trial
                        </button>
                        <button style={{
                            padding: "16px 36px", background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "2px solid #FFFFFF",
                            borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(10px)"
                        }}>
                            Watch Demo
                        </button>
                    </div>
                    <p style={{ fontSize: "13px", opacity: 0.85, fontWeight: "500" }}>✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Cancel anytime</p>
                </div>
                {/* Decorative Circles */}
                <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
                <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "400px", height: "400px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(80px)" }} />
            </section>

            {/* Footer */}
            <footer style={{ padding: "60px 40px 30px", background: "#064E3B", color: "#FFFFFF" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "40px", maxWidth: "1200px", margin: "0 auto 40px", paddingBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.1)" }} className="footer-grid">
                    <div style={{ gridColumn: "span 1" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <img src={logoPng} alt="CLIKS Logo" style={{ width: '28px', height: '28px' }} />
                            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>CLIKS</h3>
                        </div>
                        <p style={{ fontSize: "14px", lineHeight: "1.7", opacity: 0.7, marginBottom: "20px", maxWidth: "300px" }}>
                            Make your money easy to understand. Track accounts, budgets, debts and investments in one clean dashboard.
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                <div key={i} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.background = "#1B6B3A"} onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}>
                                    <Icon size={20} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap", "Updates"] },
                        { title: "Company", links: ["About Us", "Careers", "Blog", "Press Kit", "Contact"] },
                        { title: "Resources", links: ["Documentation", "API Reference", "Help Center", "Community", "Tutorials"] },
                        { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Licenses"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 style={{ fontWeight: "700", marginBottom: "24px" }}>{col.title}</h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {col.links.map((link, j) => (
                                    <li key={j} style={{ marginBottom: "12px", opacity: 0.7, cursor: "pointer", fontSize: "14px" }} onMouseEnter={(e) => e.target.style.color = "#4dabf7"} onMouseLeave={(e) => e.target.style.color = "white"}>
                                        {link}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", fontSize: "14px", opacity: 0.6, flexWrap: "wrap", gap: "20px" }}>
                    <div>© 2026 CLIKS. All rights reserved.</div>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <span>🔒 Bank-level Security</span>
                        <span>⚡ 99.9% Uptime</span>
                        <span>🌍 Trusted Globally</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
