import React, { useState, useMemo } from 'react';
import { 
    BookOpen, 
    Search, 
    Clock, 
    Award, 
    TrendingUp, 
    ShieldAlert, 
    BarChart3, 
    Target, 
    CheckCircle2, 
    HelpCircle, 
    ArrowRight, 
    ChevronRight,
    Layers,
    Gem,
    Briefcase,
    Bookmark,
    Zap,
    Scale,
    Compass,
    Activity,
    Database,
    ShieldCheck,
    LineChart,
    PieChart,
    Maximize2,
    BookMarked,
    Gavel,
    FileText
} from 'lucide-react';
import '../App.css';

import { 
    Globe, 
    CURRICULUM_PHASES, 
    SIP_CURRICULUM, 
    MUTUAL_FUNDS_CURRICULUM, 
    WEALTH_CURRICULUM 
} from './BusinessTradingData';


// Config Registry for Integrated Wealth Academies
const ACADEMIES = {
    trading: {
        title: 'Enterprise Trading Academy',
        subtitle: 'Master the absolute spectrum of stock market operations—covering raw matching infrastructure, balance sheet evaluations, indicator strategies, and advanced Options Greeks.',
        gradient: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)',
        shadow: 'rgba(6, 78, 59, 0.2)',
        icon: LineChart,
        curriculum: CURRICULUM_PHASES,
        tag: 'Stocks, F&O & Technicals',
        desc: 'Comprehensive 25-module curriculum covering micro-structure, fundamental balance sheet analysis, technical price action, and derivative strategies.'
    },
    sip: {
        title: 'SIP Wealth Builder',
        subtitle: 'Harness the unstoppable force of compounding, automated discipline, and Step-Up systematic architectures for secure financial freedom.',
        gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        shadow: 'rgba(30, 58, 138, 0.2)',
        icon: TrendingUp,
        curriculum: SIP_CURRICULUM,
        tag: 'Compounding & Goal Planning',
        desc: 'Learn tactical Step-Up, flexible, and trigger SIPs to structure an automated wealth machine utilizing optimal Rupee Cost Averaging.'
    },
    mutual_funds: {
        title: 'Mutual Funds Masterclass',
        subtitle: 'Navigate active versus passive vehicles, analyze capitalization boundaries, and master direct plan compounding advantages.',
        gradient: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)',
        shadow: 'rgba(91, 33, 182, 0.2)',
        icon: PieChart,
        curriculum: MUTUAL_FUNDS_CURRICULUM,
        tag: 'Portfolio Diversification',
        desc: 'Deep dive into Asset Management Companies, Net Asset Values, Large, Mid & Small caps, Index fund passives, and Expense Ratio optimizations.'
    },
    more: {
        title: 'Alternative Assets & Debt',
        subtitle: 'Diversify beyond standard equities into inflation-beating Sovereign Gold Bonds (SGB), AAA corporate debt, and commercial REITs.',
        gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
        shadow: 'rgba(146, 64, 14, 0.2)',
        icon: Gem,
        curriculum: WEALTH_CURRICULUM,
        tag: 'Bonds, Gold & REITs',
        desc: 'Master stable yield generation, tax-free gold maturity strategies, credit rating due diligence, and commercial real-estate cash flows.'
    }
};

const BusinessTrading = () => {
    const [selectedTrack, setSelectedTrack] = useState(null); // Tracks Academy category. If null, shows selection Hub.
    
    const activeAcademy = useMemo(() => {
        return selectedTrack ? ACADEMIES[selectedTrack] : null;
    }, [selectedTrack]);
    
    const CURRICULUM_DATA = useMemo(() => {
        return activeAcademy ? activeAcademy.curriculum : [];
    }, [activeAcademy]);
    
    const trackModulesFlat = useMemo(() => {
        return CURRICULUM_DATA.flatMap(phase => phase.modules);
    }, [CURRICULUM_DATA]);

    const [activeModule, setActiveModule] = useState(null);
    const [activeTopicIdx, setActiveTopicIdx] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarkList, setBookmarkList] = useState(() => {
        const local = localStorage.getItem('cliks_reading_bookmarks');
        return local ? JSON.parse(local) : [];
    });

    // Track open/collapsed state for Phase accordions
    const [openPhases, setOpenPhases] = useState([]);

    const handleTrackSelect = (trackKey) => {
        setSelectedTrack(trackKey);
        const academy = ACADEMIES[trackKey];
        const firstMod = academy.curriculum[0].modules[0];
        setActiveModule(firstMod);
        setActiveTopicIdx(0);
        setSearchQuery('');
        // Start with all phases expanded by default for visibility
        setOpenPhases(academy.curriculum.map((_, idx) => idx));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToCampus = () => {
        setSelectedTrack(null);
        setActiveModule(null);
        setActiveTopicIdx(0);
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const togglePhase = (phaseIdx) => {
        if (openPhases.includes(phaseIdx)) {
            setOpenPhases(openPhases.filter(i => i !== phaseIdx));
        } else {
            setOpenPhases([...openPhases, phaseIdx]);
        }
    };

    const toggleBookmark = (topicTitle) => {
        let updated = [...bookmarkList];
        if (updated.includes(topicTitle)) {
            updated = updated.filter(t => t !== topicTitle);
        } else {
            updated.push(topicTitle);
        }
        setBookmarkList(updated);
        localStorage.setItem('cliks_reading_bookmarks', JSON.stringify(updated));
    };

    const handleModuleSelect = (module) => {
        setActiveModule(module);
        setActiveTopicIdx(0);
    };

    const currentTopic = activeModule ? activeModule.topics[activeTopicIdx] : null;

    // Helper to find which Phase an active module belongs to
    const activePhaseName = useMemo(() => {
        if (!activeModule || !CURRICULUM_DATA) return '';
        const found = CURRICULUM_DATA.find(phase => 
            phase.modules.some(m => m.id === activeModule.id)
        );
        return found ? found.name : '';
    }, [activeModule, CURRICULUM_DATA]);

    // Filtering logic spanning current track
    const filteredPhases = useMemo(() => {
        if (!CURRICULUM_DATA) return [];
        if (!searchQuery) return CURRICULUM_DATA;
        
        return CURRICULUM_DATA.map(phase => {
            const matchingModules = phase.modules.filter(mod => 
                mod.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return { ...phase, modules: matchingModules };
        }).filter(phase => phase.modules.length > 0);
    }, [searchQuery, CURRICULUM_DATA]);

    // Inline Markdown Bold Processing Engine
    const renderInlineMarkdown = (lineText) => {
        if (!lineText) return '';
        const parts = lineText.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ fontWeight: '850', color: '#0F172A' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Rich Text Parser
    const formatContent = (text) => {
        if (!text) return null;
        return text.split('\n\n').map((paragraph, index) => {
            // Custom Blockquotes
            if (paragraph.startsWith('> ')) {
                const cleaned = paragraph.replace('> ', '');
                return (
                    <div key={index} style={{ padding: '1.25rem 1.5rem', borderLeft: '5px solid #EF4444', background: '#FEF2F2', borderRadius: '0 16px 16px 0', color: '#B91C1C', fontSize: '0.95rem', margin: '1.75rem 0', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.03)' }}>
                        {renderInlineMarkdown(cleaned)}
                    </div>
                );
            }
            // Main headers
            if (paragraph.trim().startsWith('### ')) {
                const cleaned = paragraph.replace('### ', '');
                return (
                    <h3 key={index} style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '2.25rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                        {renderInlineMarkdown(cleaned)}
                    </h3>
                );
            }
            // List builders
            if (paragraph.trim().startsWith('* ') || paragraph.trim().startsWith('1. ') || paragraph.trim().startsWith('2. ') || paragraph.trim().startsWith('3. ') || paragraph.trim().startsWith('4. ')) {
                return (
                    <ul key={index} style={{ paddingLeft: '1.5rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyleType: paragraph.trim().startsWith('*') ? 'disc' : 'decimal' }}>
                        {paragraph.split('\n').map((li, liIdx) => {
                            const bulletCleaned = li.replace(/^\s*(\*|\d+\.)\s+/, '');
                            return (
                                <li key={liIdx} style={{ color: '#334155', lineHeight: '1.75', fontSize: '0.96rem', paddingLeft: '0.25rem' }}>
                                    {renderInlineMarkdown(bulletCleaned)}
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            // Paragraphs
            return (
                <p key={index} style={{ color: '#334155', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.25rem' }}>
                    {renderInlineMarkdown(paragraph)}
                </p>
            );
        });
    };

    // Linear navigation controls
    const handleNextModuleStep = () => {
        const currentFlatIdx = trackModulesFlat.findIndex(m => m.id === activeModule.id);
        
        if (activeTopicIdx < activeModule.topics.length - 1) {
            setActiveTopicIdx(activeTopicIdx + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentFlatIdx < trackModulesFlat.length - 1) {
            // Advance to next module in database
            const nextModule = trackModulesFlat[currentFlatIdx + 1];
            setActiveModule(nextModule);
            setActiveTopicIdx(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert("🎓 Outstanding Achievement! You have fully reviewed and completed our complete syllabus for the " + activeAcademy.title + "!");
        }
    };

    // Rendering the Campus Hub selection screen if no track is selected
    if (!selectedTrack) {
        return (
            <div style={{ padding: '2.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
                
                {/* Campus Hub Top Banner */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', 
                    borderRadius: '28px', padding: '3rem', color: 'white', 
                    marginBottom: '3rem', boxShadow: '0 20px 45px -12px rgba(49, 46, 129, 0.3)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '260px', height: '260px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: '60px', bottom: '-90px', width: '190px', height: '190px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }} />
                    
                    <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.1)', width: 'fit-content', padding: '0.45rem 1rem', borderRadius: '99px', marginBottom: '1.5rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Award size={16} style={{ color: '#FBBF24' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FBBF24' }}>Integrated Wealth Campus</span>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '950', letterSpacing: '-0.03em', margin: '0 0 1rem 0', lineHeight: 1.1 }}>Social Trading & Finance Academies</h1>
                        <p style={{ opacity: 0.9, fontSize: '1.15rem', lineHeight: '1.65', fontWeight: '500', margin: 0 }}>Empower your capital and secure financial literacy. Select one of our professional-tier courses covering stock market dynamics, compounding via SIP, Mutual Funds strategies, and Alternative Fixed Assets.</p>
                    </div>
                </div>

                {/* Dynamic Academy Choice Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                    {Object.keys(ACADEMIES).map((key) => {
                        const academy = ACADEMIES[key];
                        const AcademyIcon = academy.icon;
                        return (
                            <div 
                                key={key}
                                onClick={() => handleTrackSelect(key)}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    border: '1px solid #E2E8F0',
                                    padding: '2.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = '#CBD5E1';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                {/* Card Heading Elements */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                    <div style={{ 
                                        width: '62px', height: '62px', borderRadius: '18px', 
                                        background: academy.gradient, display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', color: 'white',
                                        boxShadow: `0 8px 20px ${academy.shadow}`
                                    }}>
                                        <AcademyIcon size={28} />
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', 
                                        letterSpacing: '0.06em', background: '#F1F5F9', color: '#475569', 
                                        padding: '6px 12px', borderRadius: '8px' 
                                    }}>
                                        {academy.tag}
                                    </span>
                                </div>

                                {/* Title & Summary */}
                                <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
                                    {academy.title}
                                </h2>
                                <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.65', margin: '0 0 2.25rem 0', flex: 1 }}>
                                    {academy.desc}
                                </p>

                                {/* Launch Indicator */}
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                    fontSize: '0.92rem', fontWeight: '900', color: '#1E293B'
                                }}>
                                    <span>Launch Learning Track</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // The visual reader interface for an active Selected Track
    const AcademyIcon = activeAcademy.icon;

    return (
        <div style={{ padding: '2.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            
            {/* Main Header Banner for Active Academy */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: activeAcademy.gradient, 
                borderRadius: '28px', padding: '2.5rem 3rem', color: 'white', 
                marginBottom: '2.5rem', boxShadow: `0 15px 40px -10px ${activeAcademy.shadow}`,
                position: 'relative'
            }}>
                <div style={{ maxWidth: '70%' }}>
                    <button 
                        onClick={handleBackToCampus}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            background: 'rgba(255,255,255,0.15)', color: 'white', 
                            border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', 
                            fontSize: '0.78rem', fontWeight: '900', cursor: 'pointer', 
                            marginBottom: '1.25rem', backdropFilter: 'blur(4px)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        ← Back to Academy Hub
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>{activeAcademy.title}</h1>
                    <p style={{ opacity: 0.9, fontSize: '1.05rem', lineHeight: '1.6', fontWeight: '500', margin: 0 }}>{activeAcademy.subtitle}</p>
                </div>
                <div style={{ width: '160px', height: '160px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AcademyIcon size={80} style={{ color: 'white', opacity: 0.35 }} />
                </div>
            </div>

            {/* Content Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.4fr', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* Left Floating Curriculum Accordion View */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
                    
                    {/* Dynamic Search Filter */}
                    <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <Search size={19} style={{ color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search modules or phases..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: '500', color: '#1E293B' }}
                        />
                    </div>

                    {/* Major Course Accordion Stack */}
                    <div style={{ 
                        background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', 
                        overflow: 'hidden', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', 
                        maxHeight: '70vh', display: 'flex', flexDirection: 'column' 
                    }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Course Syllabus</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '850', color: '#1B6B3A', background: '#DCF2E4', padding: '3px 8px', borderRadius: '6px' }}>{trackModulesFlat.length} Modules</span>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {filteredPhases.map((phase, phaseIdx) => {
                                const PhaseIcon = phase.icon;
                                const isOpen = openPhases.includes(phaseIdx);
                                return (
                                    <div key={phaseIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        {/* Phase Accordion Header Toggle */}
                                        <div 
                                            onClick={() => togglePhase(phaseIdx)}
                                            style={{ 
                                                padding: '1.1rem 1.25rem', background: '#FAFAFA', cursor: 'pointer', 
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                borderBottom: isOpen ? '1px solid #F1F5F9' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ color: '#1B6B3A' }}>
                                                    <PhaseIcon size={16} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#1E293B' }}>{phase.name}</span>
                                            </div>
                                            <ChevronRight size={16} style={{ color: '#94A3B8', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                                        </div>

                                        {/* Render Module Items nested in this Phase */}
                                        {isOpen && (
                                            <div style={{ display: 'flex', flexDirection: 'column', background: 'white' }}>
                                                {phase.modules.map((module) => {
                                                    const Icon = module.icon;
                                                    const isActive = activeModule && activeModule.id === module.id;
                                                    return (
                                                        <div 
                                                            key={module.id}
                                                            onClick={() => handleModuleSelect(module)}
                                                            style={{ 
                                                                padding: '1rem 1.25rem', 
                                                                cursor: 'pointer',
                                                                borderLeft: isActive ? '4px solid #1B6B3A' : '4px solid transparent',
                                                                background: isActive ? '#F0FDF4' : 'transparent',
                                                                borderBottom: '1px solid #F8FAFC',
                                                                transition: 'background 0.15s'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? '#DCF2E4' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#1B6B3A' : '#64748B', flexShrink: 0 }}>
                                                                    <Icon size={15} />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                                        <span style={{ fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', color: isActive ? '#1B6B3A' : '#64748B' }}>{module.level}</span>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#94A3B8' }}>
                                                                            <Clock size={9} />
                                                                            <span style={{ fontSize: '0.6rem', fontWeight: '600' }}>{module.duration}</span>
                                                                        </div>
                                                                    </div>
                                                                    <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: isActive ? '#064E3B' : '#334155', margin: 0, lineHeight: '1.35' }}>{module.title}</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredPhases.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>No matching modules found in this curriculum.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Premium Content Reader Board */}
                <div style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                    
                    {/* Top Topic Controller & Bookmark Header */}
                    <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            {activeModule && activeModule.topics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTopicIdx(idx)}
                                    style={{ 
                                        padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                        border: activeTopicIdx === idx ? 'none' : '1px solid #E2E8F0', 
                                        background: activeTopicIdx === idx ? '#1B6B3A' : 'white', 
                                        color: activeTopicIdx === idx ? 'white' : '#475569', 
                                        fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer',
                                        boxShadow: activeTopicIdx === idx ? '0 4px 12px rgba(27, 107, 58, 0.15)' : 'none'
                                    }}
                                >
                                    Part {idx + 1}: {topic.title.length > 35 ? topic.title.substring(0, 35) + '...' : topic.title}
                                </button>
                            ))}
                        </div>

                        {currentTopic && (
                            <button 
                                onClick={() => toggleBookmark(currentTopic.title)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: bookmarkList.includes(currentTopic.title) ? '#F59E0B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <Bookmark size={18} fill={bookmarkList.includes(currentTopic.title) ? '#F59E0B' : 'none'} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '850', color: '#64748B' }}>{bookmarkList.includes(currentTopic.title) ? 'Bookmarked' : 'Save'}</span>
                            </button>
                        )}
                    </div>

                    {/* Content Presentation Panel */}
                    <div style={{ padding: '3.5rem' }} className="animate-in fade-in duration-300">
                        
                        {activeModule && (
                            <>
                                {/* Header Metadata Info */}
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', fontSize: '0.82rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                        <span>{activePhaseName}</span>
                                        <ChevronRight size={14} />
                                        <span>Module Selection</span>
                                    </div>
                                    <h1 style={{ fontSize: '2.25rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.03em', lineHeight: '1.25', margin: '0 0 1.25rem 0' }}>
                                        {activeModule.title}
                                    </h1>
                                    <div style={{ display: 'flex', gap: '1.5rem', color: '#64748B', fontSize: '0.82rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={15} />
                                            <span style={{ fontWeight: '650' }}>System Estimation: ~15 mins</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CheckCircle2 size={15} color="#10B981" />
                                            <span style={{ fontWeight: '650' }}>Institutional Training Framework</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Content Rich Text Rendering */}
                                <article style={{ fontSize: '1.02rem', color: '#334155' }}>
                                    {currentTopic && formatContent(currentTopic.content)}
                                </article>

                                {/* Footer Navigation Guide */}
                                <div style={{ marginTop: '4.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>Module Completion State</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                                            <span style={{ fontSize: '0.88rem', fontWeight: '850', color: '#0F172A' }}>Finished this section! Ready to unlock next chapter?</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleNextModuleStep}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.6rem', background: activeAcademy.gradient, 
                                            color: 'white', border: 'none', padding: '0.9rem 2rem', borderRadius: '14px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer',
                                            boxShadow: `0 8px 25px ${activeAcademy.shadow}`, transition: 'transform 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Next Curriculum Stage <ArrowRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Institutional Warnings */}
            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}>
                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1B6B3A', marginBottom: '0.85rem' }}>
                        <Zap size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Principle of Capital</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>Wealth is built by maximizing compounding asymmetry. Restrict speculative risks on individual setups to survive macro market volatility cycles mathematically.</p>
                </div>

                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#3B82F6', marginBottom: '0.85rem' }}>
                        <HelpCircle size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Practice Environments</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>Pair this academic theoretical data with interactive simulators. Inspect 10-year rolling CAGR performance parameters across asset buckets before deploying live capital.</p>
                </div>

                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#EF4444', marginBottom: '0.85rem' }}>
                        <ShieldAlert size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Legal Risk Advisory</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>This integrated campus is strictly informational. Markets are subject to investment risks. Always evaluate detailed statutory scheme offer documents before deploying capital.</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessTrading;

