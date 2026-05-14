import React, { useState } from 'react';
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
    PlayCircle, 
    ChevronRight,
    Layers,
    Gem,
    Briefcase,
    Bookmark,
    Zap
} from 'lucide-react';
import '../App.css';

// Learning Modules Data Base
const TRADING_MODULES = [
    {
        id: 'mod-1',
        title: 'Introduction to Stock Markets',
        icon: BookOpen,
        duration: '15 Mins',
        level: 'Beginner',
        shortDesc: 'Master the core architecture of equity exchanges, buyers and sellers.',
        topics: [
            {
                title: 'What is a Stock Market?',
                content: `A stock market is a centralized, regulated public marketplace where buyers and sellers congregate to trade ownership stakes (shares) of publicly listed corporations. In India, the premier platforms facilitating these secure interactions are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE).

### 🏢 Primary vs. Secondary Markets

1. **Primary Market**: This is where companies first issue shares to the public via an Initial Public Offering (IPO) to raise fresh expansion capital. The capital flows directly from the investors to the corporation.
2. **Secondary Market**: This is where regular everyday trading happens. Investors trade shares among themselves. The company is not actively involved in these transactions, and share prices fluctuate dynamically based on buyer/seller supply and demand.

### 📈 Key Market Intermediaries

* **SEBI (Securities & Exchange Board of India)**: The apex regulator overseeing integrity, preventing insider misconduct, and safeguarding retail investor capital.
* **Stock Brokers**: Licensed firms (like Zerodha, Angel One, etc.) providing the technological platform for retail clients to route orders to the exchange.
* **Depositories (NSDL/CDSL)**: Secure electronic vaults holding your acquired shares digitally so no physical paper certificates are necessary.`
            },
            {
                title: 'How Share Prices Move',
                content: `A stock price is essentially governed by the basic laws of supply and demand. If more participants desire to buy a stock (high demand) than sell it (low supply), the price rises. Conversely, if sellers outweigh buyers, the price descends.

### 🔍 Primary Price Drivers

* **Corporate Earnings**: Quarterly net profit and revenue performance metrics. High profits prompt immediate institutional buying.
* **Economic Indicators**: Interest rate variations set by the RBI, domestic inflation percentages, and GDP growth parameters.
* **Global Sentiment**: Macro-political tensions, international market indices behavior (like the US NASDAQ or S&P 500), and global crude oil pricing volatility.`
            }
        ]
    },
    {
        id: 'mod-2',
        title: 'Fundamental Analysis Mastery',
        icon: Gem,
        duration: '25 Mins',
        level: 'Intermediate',
        shortDesc: 'Evaluate a business through financial statements, ratios and valuations.',
        topics: [
            {
                title: 'Evaluating Financial Statements',
                content: `Fundamental Analysis (FA) is the holistic evaluation of a corporation's intrinsic value by examining its associated financial and economic factors. Instead of staring at charts, FA practitioners analyze the actual strength of the underlying business.

### 📊 The Big Three Documents

1. **Balance Sheet**: A snapshot of what the company owns (Assets) and what it owes to outside parties (Liabilities) alongside shareholder equity.
2. **Income Statement (P&L)**: Records total revenues minus all operating costs to display Net Income over a designated quarter or fiscal year.
3. **Cash Flow Statement**: Displays the liquidity movement—Operating cash flows, Investing cycles, and Financing activities. It determines if reported accounting profits actually exist as tangible cash.`
            },
            {
                title: 'Core Financial Ratios',
                content: `To make fast, standardized comparisons between competing companies, professional investors utilize mathematical ratios.

### 🧮 The Golden Indicators

* **P/E Ratio (Price to Earnings)**: Calculated as Current Stock Price ÷ Earnings Per Share (EPS). A P/E of 20 implies investors are willing to pay ₹20 for every ₹1 the company generates in net annual profit. 
* **Debt to Equity (D/E)**: Measures financial leverage. A D/E below 1.0 generally signifies a safe, conservative capital structure with minimal insolvency risk.
* **ROE (Return on Equity)**: Highlights efficiency. An ROE higher than 15-20% demonstrates management excels at generating healthy returns on invested shareholder equity.`
            }
        ]
    },
    {
        id: 'mod-3',
        title: 'Technical Analysis Essentials',
        icon: BarChart3,
        duration: '30 Mins',
        level: 'Intermediate',
        shortDesc: 'Decipher market psychology via price charts, candlesticks and volume indicators.',
        topics: [
            {
                title: 'Introduction to Candlestick Charts',
                content: `Technical Analysis is the study of historical market price data and volumes to forecast future directional movements. It assumes all fundamental information is already discounted into the current price chart.

### 🕯️ The Anatomy of a Candlestick

Every Japanese Candlestick encapsulates price activity within a selected timeframe (e.g., 5 minutes, 1 hour, 1 day):
* **Body**: The solid colored portion representing the distance between the Open and Close prices. Green indicates the Close is higher than the Open (bullish); Red indicates the Close is lower than the Open (bearish).
* **Wicks (Shadows)**: The thin lines extending above and below the body showing the extreme High and Low prices tagged during the period.`
            },
            {
                title: 'Support, Resistance & Indicators',
                content: `Markets do not move in direct straight lines; they undulate in structured cycles and trends.

### 🧱 Core Concepts

* **Support Level**: A price floor where historically, buying interest becomes powerful enough to halt a downward slide and reverse the trend back up.
* **Resistance Level**: A price ceiling where selling pressure habitually overpowers buying momentum, causing the price to bounce lower.
* **RSI (Relative Strength Index)**: A momentum oscillator ranging from 0 to 100. Levels above 70 generally indicate an "Overbought" condition (due for a pullback), whereas levels below 30 suggest "Oversold" status (ripe for a potential bounce).`
            }
        ]
    },
    {
        id: 'mod-4',
        title: 'Futures & Options Basics',
        icon: Layers,
        duration: '35 Mins',
        level: 'Advanced',
        shortDesc: 'Understand the high-leverage world of derivative hedging and contracts.',
        topics: [
            {
                title: 'What are Derivative Instruments?',
                content: `Derivatives are specialized financial contracts whose underlying value is entirely "derived" from a primary asset (such as a stock, index, or commodity). Instead of trading the actual stock, you trade agreements linked to its future price movements.

### 🔄 Futures Contracts

A Futures contract is a legally binding agreement to buy or sell an asset at a predetermined future date for an agreed fixed price. 
* **Key Aspect**: Futures utilize leverage—meaning you only deposit a fraction of the total trade value (Margin) to command a very large contract size. This amplifies both potential returns and potential losses.`
            },
            {
                title: 'Options: Calls and Puts',
                content: `Unlike futures, Options grant the buyer the absolute "right" (but not the obligation) to buy or sell an asset. The buyer pays a non-refundable fee called a **Premium** to the seller.

### 📑 Primary Options Categories

1. **Call Option (CE)**: Gives the buyer the right to buy the asset. Purchased when you are highly bullish and expect the price to climb steeply.
2. **Put Option (PE)**: Gives the buyer the right to sell the asset. Purchased when you are bearish and anticipate a heavy downward price drop, or used as insurance (hedging) to safeguard long holdings.

> ⚠️ **Risk Warning**: Option buying has limited risk (the premium paid) but low probability of success due to time decay (Theta). Option selling has high probability but mathematically unlimited risk.`
            }
        ]
    },
    {
        id: 'mod-5',
        title: 'Risk Management & Psychology',
        icon: ShieldAlert,
        duration: '20 Mins',
        level: 'Crucial',
        shortDesc: 'Construct protective trading rules to safeguard capital from absolute wipeouts.',
        topics: [
            {
                title: 'The Capital Preservation Strategy',
                content: `Amateur traders focus solely on potential profits; professional traders focus intensely on mitigating risk. Without rigid risk control, even the most brilliant trading strategy will lead to eventual capital ruin.

### 🛡️ The 1% Core Rule

Never risk more than **1% of your total trading capital** on any single trade. If you have ₹1,00,000 in capital, the maximum loss you should tolerate before a trade is automatically aborted is ₹1,000. This allows you to withstand long losing streaks without catastrophic account damage.

### 🛑 Stop Loss Execution

A Stop-Loss Order is an automatic instruction given to your broker to liquidate your position the exact second a stock touches a predetermined exit price. It converts emotional, spiraling losses into calculated, minor expenses.`
            },
            {
                title: 'Controlling Human Emotions',
                content: `Trading success is 20% strategy and 80% discipline and psychological control. Two toxic human emotions cause 90% of trading failures:

### 🧠 The Emotional Traps

* **Fear of Missing Out (FOMO)**: Entering a trade late at peak prices because everyone else is profiting. This invariably leads to buying the absolute top right before institutional smart money sells.
* **Revenge Trading**: Doubling your position size immediately after a heavy loss in a desperate attempt to "win it back." This bypasses analysis and frequently leads to rapid capital annihilation.`
            }
        ]
    }
];

const BusinessTrading = () => {
    const [activeModule, setActiveModule] = useState(TRADING_MODULES[0]);
    const [activeTopicIdx, setActiveTopicIdx] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarkList, setBookmarkList] = useState(() => {
        const local = localStorage.getItem('cliks_reading_bookmarks');
        return local ? JSON.parse(local) : [];
    });

    const filteredModules = TRADING_MODULES.filter(mod => 
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        mod.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const currentTopic = activeModule.topics[activeTopicIdx];

    // Dynamic Markdown Bold Processor (**Bold**)
    const renderInlineMarkdown = (lineText) => {
        if (!lineText) return '';
        // Regex split using capturing group for double asterisks to retain them in array
        const parts = lineText.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ fontWeight: '850', color: '#0F172A' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Parse rich content into HTML friendly rendering
    const formatContent = (text) => {
        return text.split('\n\n').map((paragraph, index) => {
            // Subheaders
            if (paragraph.startsWith('### ')) {
                const cleaned = paragraph.replace('### ', '');
                return (
                    <h3 key={index} style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        {renderInlineMarkdown(cleaned)}
                    </h3>
                );
            }
            // Main Headers
            if (paragraph.startsWith('## ')) {
                const cleaned = paragraph.replace('## ', '');
                return (
                    <h2 key={index} style={{ fontSize: '1.5rem', fontWeight: '950', color: '#064E3B', marginTop: '2.5rem', marginBottom: '1.25rem', borderBottom: '2.5px solid #ECFDF5', paddingBottom: '0.6rem' }}>
                        {renderInlineMarkdown(cleaned)}
                    </h2>
                );
            }
            // Bullet / Numbered lists
            if (paragraph.startsWith('* ') || paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
                return (
                    <ul key={index} style={{ paddingLeft: '1.5rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyleType: paragraph.startsWith('*') ? 'disc' : 'decimal' }}>
                        {paragraph.split('\n').map((li, liIdx) => {
                            // Extract clean textual line removing markdown numbering/bullet chars
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
            // Quote / Block Alert Warning
            if (paragraph.startsWith('> ')) {
                const cleaned = paragraph.replace('> ', '');
                return (
                    <div key={index} style={{ padding: '1.25rem 1.5rem', borderLeft: '5px solid #EF4444', background: '#FEF2F2', borderRadius: '0 16px 16px 0', color: '#B91C1C', fontSize: '0.95rem', margin: '1.75rem 0', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.04)' }}>
                        {renderInlineMarkdown(cleaned)}
                    </div>
                );
            }
            // Default standard paragraphs
            return (
                <p key={index} style={{ color: '#334155', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.25rem' }}>
                    {renderInlineMarkdown(paragraph)}
                </p>
            );
        });
    };

    return (
        <div style={{ padding: '2rem 2.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)', borderRadius: '24px', padding: '2rem 2.5rem', color: 'white', boxShadow: '0 12px 30px rgba(6, 78, 59, 0.15)' }}>
                <div style={{ maxWidth: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.15)', width: 'fit-content', padding: '0.35rem 0.75rem', borderRadius: '999px', marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
                        <Award size={14} className="text-yellow-300" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Knowledge Hub Academy</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Cliks Trading Academy</h1>
                    <p style={{ opacity: 0.9, fontWeight: '500', fontSize: '0.98rem', lineHeight: '1.5' }}>Master stock market fundamentals, decode technical indicators, and study corporate financial matrices directly inside your system.</p>
                </div>
                <div style={{ width: '180px', height: '180px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'blur(0)' }}>
                    <BookOpen size={80} style={{ color: 'white', opacity: 0.3 }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* Left Navigation Syllabus */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
                    
                    {/* Search Input */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                        <Search size={18} style={{ color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search learning modules..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: '500', color: '#1E293B' }}
                        />
                    </div>

                    {/* Syllabus Module List */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Course Curriculum</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '60vh', overflowY: 'auto' }}>
                            {filteredModules.map((module) => {
                                const Icon = module.icon;
                                const isActive = activeModule.id === module.id;
                                return (
                                    <div 
                                        key={module.id}
                                        onClick={() => handleModuleSelect(module)}
                                        style={{ 
                                            padding: '1.25rem 1.5rem', 
                                            borderBottom: '1px solid #F1F5F9', 
                                            cursor: 'pointer',
                                            background: isActive ? '#F0FDF4' : 'transparent',
                                            borderLeft: isActive ? '4px solid #1B6B3A' : '4px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isActive ? '#DCF2E4' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#1B6B3A' : '#64748B', flexShrink: 0 }}>
                                                <Icon size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: isActive ? '#1B6B3A' : '#64748B' }}>{module.level}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                                                        <Clock size={10} />
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '650' }}>{module.duration}</span>
                                                    </div>
                                                </div>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isActive ? '#064E3B' : '#1E293B', margin: 0, lineHeight: '1.4' }}>{module.title}</h4>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredModules.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>No matching modules found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content Reader */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    
                    {/* Inner Topic Sub-navigation Bar */}
                    <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {activeModule.topics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTopicIdx(idx)}
                                    style={{ 
                                        padding: '0.6rem 1.25rem', 
                                        borderRadius: '10px', 
                                        border: activeTopicIdx === idx ? 'none' : '1px solid #E2E8F0', 
                                        background: activeTopicIdx === idx ? '#1B6B3A' : 'white', 
                                        color: activeTopicIdx === idx ? 'white' : '#475569', 
                                        fontWeight: '750', 
                                        fontSize: '0.85rem', 
                                        cursor: 'pointer',
                                        boxShadow: activeTopicIdx === idx ? '0 4px 12px rgba(27, 107, 58, 0.15)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {idx + 1}. {topic.title}
                                </button>
                            ))}
                        </div>
                        
                        {/* Bookmark Button */}
                        <button 
                            onClick={() => toggleBookmark(currentTopic.title)}
                            style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: bookmarkList.includes(currentTopic.title) ? '#F59E0B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            title="Save Article for later"
                        >
                            <Bookmark size={20} fill={bookmarkList.includes(currentTopic.title) ? '#F59E0B' : 'none'} />
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>{bookmarkList.includes(currentTopic.title) ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>

                    {/* Content Rendering Area */}
                    <div style={{ padding: '3rem' }} className="animate-in fade-in duration-300">
                        
                        {/* Heading info */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                <span>{activeModule.title}</span>
                                <ChevronRight size={14} />
                                <span>Chapter {activeTopicIdx + 1}</span>
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 1rem 0' }}>
                                {currentTopic.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.25rem', color: '#64748B', fontSize: '0.82rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} />
                                    <span>Est. read time: ~8-10 mins</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={14} color="#10B981" />
                                    <span>Self-Paced Module Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Rich Formatted Explanations */}
                        <article style={{ fontSize: '1rem', color: '#334155' }}>
                            {formatContent(currentTopic.content)}
                        </article>

                        {/* Bottom Navigation Guide / Read next */}
                        <div style={{ marginTop: '3.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Academy Status</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#0F172A' }}>You've read through this section!</span>
                                </div>
                            </div>

                            {/* Continue Button */}
                            {activeTopicIdx < activeModule.topics.length - 1 ? (
                                <button 
                                    onClick={() => setActiveTopicIdx(activeTopicIdx + 1)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                        color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' 
                                    }}
                                >
                                    Next Chapter <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        const nextIdx = TRADING_MODULES.findIndex(m => m.id === activeModule.id) + 1;
                                        if (nextIdx < TRADING_MODULES.length) {
                                            handleModuleSelect(TRADING_MODULES[nextIdx]);
                                        } else {
                                            alert("🎓 Outstanding! You have fully read and reviewed all corporate curriculum modules!");
                                        }
                                    }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                                        color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' 
                                    }}
                                >
                                    Continue to Next Module <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Reference Glossary & Disclaimer Footer */}
            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', marginBottom: '0.75rem' }}>
                        <Zap size={18} />
                        <h4 style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>Pro-Trading Principle</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>"Plan your trade, and trade your plan." Strict adherence to structured stop-losses is what separates durable wealth creation from quick failures.</p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3B82F6', marginBottom: '0.75rem' }}>
                        <HelpCircle size={18} />
                        <h4 style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>Need Real-Time Charts?</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>Use trusted portals such as TradingView or Sensibull to analyze ticking candles, verify RSI signals and deploy mock strategy buckets safely.</p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', marginBottom: '0.75rem' }}>
                        <ShieldAlert size={18} />
                        <h4 style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>Regulatory Warning</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>Equity derivatives (F&O) carry heavy systemic risk. Statistically, SEBI studies show 9 out of 10 retail traders suffer net capital erosion in derivatives.</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessTrading;
