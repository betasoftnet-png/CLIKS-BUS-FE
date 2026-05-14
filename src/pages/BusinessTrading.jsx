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
    Zap,
    Scale,
    Coins,
    FileText
} from 'lucide-react';
import '../App.css';

// Industrial Grade Production Learning Modules Data Base
const TRADING_MODULES = [
    {
        id: 'mod-1',
        title: '1. The Marketplace Pillars',
        icon: BookOpen,
        duration: '20 Mins',
        level: 'Beginner',
        shortDesc: 'Master order types, execution mechanisms, and exchange settlement protocols.',
        topics: [
            {
                title: 'Understanding The Market Mechanism',
                content: `At its core, the stock market is a highly engineered digital matching engine. Every time you see a ticking price, it represents the Last Traded Price (LTP) where a buyer's bid and a seller's ask matched perfectly.

### 🏢 Primary vs. Secondary Markets

1. **Primary Market**: This is the incubator. Corporations raise direct capital via Initial Public Offerings (IPOs) or Follow-on Public Offers (FPOs). Capital flows from investors directly to the business treasury.
2. **Secondary Market**: The active ecosystem. Once listed on exchanges (NSE/BSE), investors trade existing shares among themselves. The company is no longer receiving this capital; prices are purely driven by external market dynamics.

### ⏳ The Settlement Cycle: T+1

India operates on an advanced **T+1 settlement cycle** (Trade Day + 1 Business Day). If you buy shares on Monday, the funds are deducted instantly, but the absolute ownership delivery into your CDSL/NSDL Demat account completes on Tuesday.`
            },
            {
                title: 'Order Execution Protocols',
                content: `To trade professionally, you must master how to communicate instructions to the exchange engine. Using the wrong order type can lead to massive slippage and instant losses.

### 📥 The 4 Critical Order Types

1. **Market Order**: Tells the system to buy or sell instantly at the best available current price. Highly dangerous in illiquid stocks as you might get filled at an unexpectedly unfavorable rate.
2. **Limit Order**: Sets an exact price ceiling for buying or a price floor for selling. Your trade executes *only* at your specified price or better.
3. **Stop-Loss Limit (SL)**: An inactive order sitting on your broker's server. It "triggers" and enters the exchange only if the stock price reaches a specific trigger price. Essential for cutting losses.
4. **Stop-Loss Market (SL-M)**: Similar to SL, but once triggered, it fires as an immediate Market order to guarantee exit.

### 🏷️ Product Typology: MIS vs. CNC

* **MIS (Margin Intraday Square-off)**: A purely intraday product. Your broker grants leverage (e.g., 5x capital), but you *must* close the position before 3:20 PM, or the system auto-liquidates it.
* **CNC (Cash and Carry)**: Delivery-based trading. Requires 100% upfront capital. Used for holding equities for days, months, or years.`
            }
        ]
    },
    {
        id: 'mod-2',
        title: '2. Fundamental Analysis Masterclass',
        icon: Gem,
        duration: '30 Mins',
        level: 'Intermediate',
        shortDesc: 'Evaluate a business through intrinsic values, ratio matrices and balance sheets.',
        topics: [
            {
                title: 'Dissecting Financial Reports',
                content: `Fundamental Analysis (FA) evaluates a company's intrinsic worth. Instead of chasing green and red candles, FA practitioners investigate if the underlying company produces actual, tangible cash flow and profits.

### 📊 The Big Three Reports

1. **The Balance Sheet**: Displays Assets (what they own), Liabilities (what they owe), and Shareholder Equity (Net Worth). *Formula: Assets = Liabilities + Equity*. A solid sheet shows growing assets with flat or declining debt.
2. **The Profit & Loss Statement (P&L)**: Measures operating metrics—Revenue, COGS, Operating Margin, Interest, Taxes, and finally, Net Profit. Consistently rising EBITDA margins demonstrate growing corporate pricing power.
3. **The Cash Flow Statement**: Shows the actual movement of hard cash. It is divided into Operating (daily business cash), Investing (buying factories/machines), and Financing (issuing debt or paying dividends). Always verify that Operating Cash Flow is close to or higher than reported Net Profit.`
            },
            {
                title: 'Valuation Ratios & Matrices',
                content: `Never judge a stock purely by its absolute share price. A ₹2000 stock can be incredibly cheap, while a ₹2 stock can be fundamentally bankrupt. You must use valuation ratios to make standardized comparisons.

### 🧮 Core Analytical Ratios

1. **P/E Ratio (Price to Earnings)**: *Current Price ÷ Earnings Per Share (EPS)*. It tells you how many rupees investors are willing to pay for every ₹1 of annual earnings. Compare this against the industry average.
2. **Debt-to-Equity (D/E)**: *Total Liabilities ÷ Shareholder Equity*. Measures leverage risk. Generally, a D/E below 1.0 is considered safe. A D/E above 2.0 in non-banking sectors flags potential bankruptcy risks.
3. **Price-to-Book (P/B)**: Useful for asset-heavy industries like Banking and Manufacturing. Compares market price against net book asset value.
4. **ROE & ROCE**: Return on Equity (ROE) measures how efficiently management uses investor funds. Return on Capital Employed (ROCE) measures total capital efficiency including debt. Excellent companies maintain both above 15-20% consistently.`
            },
            {
                title: 'Understanding Corporate Actions',
                content: `Public corporations regularly conduct events that directly impact share structures and capital valuations.

### 📢 Primary Action Drivers

* **Dividends**: A portion of corporate net profits distributed back directly to shareholders as hard cash credited to their registered bank accounts.
* **Stock Splits**: Dividing existing shares into multiple shares to boost trading liquidity. A 1:5 split converts 1 share worth ₹500 into 5 shares worth ₹100 each. Total wealth remains identical.
* **Bonus Issues**: Giving additional free shares to current investors drawn from corporate reserves. Retains absolute market cap but increases total outstanding share volume.
* **Buybacks**: When the company purchases its own shares back from the open market, reducing total outstanding shares and automatically increasing EPS for remaining holders. Usually a highly bullish signal.`
            }
        ]
    },
    {
        id: 'mod-3',
        title: '3. Technical Analysis & Charting',
        icon: BarChart3,
        duration: '35 Mins',
        level: 'Intermediate',
        shortDesc: 'Decipher market psychology via candlesticks, moving averages, and pattern structures.',
        topics: [
            {
                title: 'Anatomy of Candlesticks & Price Action',
                content: `Technical Analysis assumes that all fundamentals, news, and rumors are already priced into the chart. It is the visual study of mass human psychology: greed and fear.

### 🕯️ Understanding The Candlestick

Each candle represents trading activity across a chosen timeframe (1 Min, 15 Min, 1 Day):
* **Body**: The rectangular core showing the distance between the Open and Close prices.
* **Wicks (Shadows)**: The thin lines displaying the absolute High and Low prices reached.
* **Green (Bullish)**: Closes higher than the Open. Buyers dominated.
* **Red (Bearish)**: Closes lower than the Open. Sellers dominated.

### 🔑 Essential Candlestick Formations

1. **Hammer / Pin Bar**: A small body at the top with a very long lower wick. Indicates sellers pushed hard, but buyers roared back to drive the price up. Potentially marks a market bottom.
2. **Marubozu**: A giant solid body with almost no wicks. Indicates absolute 100% dominance in one direction from the opening bell to the close.
3. **Doji**: Open and Close are identical. Represents total indecision. High probability of an imminent trend reversal.`
            },
            {
                title: 'Support, Resistance & Trendlines',
                content: `Markets never move in straight vertical lines. They travel in zig-zag wave structures comprised of impulses and corrections.

### 🧱 Building The Chart Infrastructure

1. **Support Level**: A historical price floor where buying pressure consistently overpowers selling pressure, stopping a decline. Think of it as a trampoline.
2. **Resistance Level**: A historical ceiling where supply increases and sellers consistently block further upward movement.
3. **Trendlines**: Slanted lines connecting rising Swing Lows (Uptrend) or falling Swing Highs (Downtrend). The third touch of a trendline is statistically highly reliable for entries.

> ⚠️ **The Rule of Polar Change**: Once a major Resistance level is broken upward, it transforms and acts as a new Support level on subsequent pullbacks.`
            },
            {
                title: 'Core Technical Indicators',
                content: `Indicators are mathematical calculations based on past price and volume. They act as secondary confirmation filters; never trade them in absolute isolation.

### 📐 The Professional Indicator Toolkit

1. **Moving Averages (SMA/EMA)**: Smooths out noise. The **200-Day EMA** is the ultimate institutional line. If price is above it, the stock is in a macro uptrend; below it, a downtrend.
2. **Relative Strength Index (RSI)**: A momentum oscillator ranging from 0 to 100.
   * **RSI > 70**: Overbought. The asset might be overextended and due for a short-term correction.
   * **RSI < 30**: Oversold. Panic selling has peaked; potential bounce candidate.
3. **Moving Average Convergence Divergence (MACD)**: Captures trend shifts. Crossovers between the MACD line and the signal line signal shifts in momentum.
4. **Volume Analysis**: The ultimate lie detector. A price breakout without high volume is likely a "bull trap." True institutional breakouts must be backed by massive, above-average volume spikes.`
            }
        ]
    },
    {
        id: 'mod-4',
        title: '4. Derivatives: Futures & Options',
        icon: Layers,
        duration: '45 Mins',
        level: 'Advanced',
        shortDesc: 'Master complex leveraged hedging, Options Greeks, and structural strategies.',
        topics: [
            {
                title: 'The World of Futures Contracts',
                content: `Derivatives are specialized contracts deriving value from an underlying asset. They allow for two critical concepts: **Leverage** and the ability to easily **Short Sell** (make money when markets fall).

### 🔄 Mechanics of Futures

A Futures contract is a binding obligation to buy or sell an asset at a preset price on a specific expiration date.
* **Lot Sizes**: You cannot buy 1 share in futures. You trade fixed "Lots" (e.g., NIFTY lot size is 75).
* **Margin Leverage**: To command a lot worth ₹10 Lakhs, your broker only requires an upfront margin of roughly ₹1.5 Lakhs (approx 15%).
* **Risk Alert**: This leverage is a double-edged sword. A 5% favorable move on the stock yields massive profits, but a 5% adverse move can instantly wipe out 30%+ of your deposited margin.`
            },
            {
                title: 'Options Essentials: Calls, Puts, & Moneyness',
                content: `Unlike futures, Options give the buyer the "right" but not the "obligation" to execute a trade. Buyers pay a non-refundable **Premium** upfront to Sellers (Writers).

### 📑 The Core Operations

1. **Call Option (CE)**: The buyer expects prices to rise sharply.
2. **Put Option (PE)**: The buyer expects prices to crash, or uses it as insurance to protect equity holdings.

### 📍 Understanding Moneyness

* **ITM (In the Money)**: Options with intrinsic value. For Call options, the strike price is *lower* than current spot price.
* **ATM (At the Money)**: The strike price is identical to current spot price.
* **OTM (Out of the Money)**: Options with zero intrinsic value, comprised entirely of "Time Value." Cheap but carry high probability of expiring worthless at ₹0.

> ⚠️ **Fact**: Nearly 90% of Out-of-the-Money (OTM) options expire completely worthless. Option buyers must be correct on direction, magnitude, AND time.`
            },
            {
                title: 'Demystifying Option Greeks',
                content: `The premium of an option fluctuates based on dynamic mathematical forces called "The Greeks." Understanding these is mandatory to avoid trading blindly.

### 🇬🇷 The Big Four Greeks

1. **Delta**: Measures rate of change. A Delta of 0.5 means for every ₹1 the stock rises, the option premium will rise by ₹0.50.
2. **Theta (Time Decay)**: The Option Buyer's worst enemy. Theta measures the daily erosion of premium as expiration approaches. The closer to expiry, the faster the premium decays to zero.
3. **Vega (Volatility)**: Measures sensitivity to market volatility. If fear spikes (India VIX rises), option premiums inflate rapidly, even if the underlying stock price hasn't moved.
4. **Gamma**: Measures the rate of change in Delta itself. Crucial for understanding violent price acceleration during expiry days ("Hero-Zero" moves).`
            }
        ]
    },
    {
        id: 'mod-5',
        title: '5. Trading Styles & Gameplans',
        icon: Briefcase,
        duration: '25 Mins',
        level: 'Intermediate',
        shortDesc: 'Identify your financial style: Scalping, Intraday, Swing, or Long-term Investing.',
        topics: [
            {
                title: 'Choosing Your Methodology',
                content: `There is no single "best" way to trade. Your success depends entirely on selecting a style that aligns with your daily schedule, capital size, and emotional tolerance.

### ⏱️ The 4 Primary Trading Disciplines

1. **Scalping**: Holds positions for mere seconds to minutes. Captures tiny price increments with massive capital and leverage. Requires robotic reflexes and low latency setups.
2. **Intraday Trading**: Positions opened and closed within the same trading session (9:15 AM to 3:30 PM). Zero overnight risk, meaning global market gaps do not affect your open capital.
3. **Swing Trading**: Holds positions for days to weeks. Targets medium-term momentum swings. Excellent for part-time traders holding regular day jobs.
4. **Positional/Investing**: Holds for months or years based on structural fundamentals and macro trends. Extremely passive but yields compounding multi-bagger wealth.`
            },
            {
                title: 'Constructing a Professional Trading Plan',
                content: `Professional trading is a business, and every business requires a rigid business plan. Trading without a written set of rules is merely sophisticated gambling.

### 📋 Components of a Structural Plan

* **The Universe**: Exactly which instruments will you trade? (e.g., "Only Top 50 High-Volume Nifty Liquid Stocks").
* **The Entry Trigger**: What concrete visual setup must appear? (e.g., "Daily 20 EMA bounce backed by 2x average volume").
* **The Exit Rule (Stop Loss)**: Defined *before* you press the buy button. (e.g., "Exit immediately if price closes below previous Swing Low").
* **The Target Rule**: How and when will you book profits? (e.g., "Book 50% profit at 1:2 Risk-Reward ratio, trail the remaining half").`
            }
        ]
    },
    {
        id: 'mod-6',
        title: '6. Risk Intelligence & Math',
        icon: ShieldAlert,
        duration: '30 Mins',
        level: 'Crucial',
        shortDesc: 'Preserve capital via position sizing formulas, drawdowns, and psychological shields.',
        topics: [
            {
                title: 'The Core Risk Management Formulas',
                content: `Amateurs obsess over how much money they can make. Professionals obsess over how much money they can lose. Without mathematics, your account will eventually go to zero.

### 🛡️ The 1% Absolute Capital Rule

Never risk more than **1% of your total account equity** on any single trade. If your total capital is ₹1,00,000, your maximum allowed loss on any failed trade is exactly ₹1,000. This allows you to survive an incredible 10-trade losing streak with 90% of your capital still intact.

### 📐 The Position Sizing Formula

To trade the 1% rule, you must mathematically calculate how many shares to buy:

* **Formula**: *Number of Shares = (Total Risk Capital) ÷ (Entry Price - Stop Loss Price)*

* **Example**: You have ₹1,00,000 capital (Risk = ₹1,000). You buy ABC stock at ₹500 with a Stop Loss at ₹480.
* **Math**: 1000 ÷ (500 - 480) = 1000 ÷ 20 = **50 Shares**.
* Buying more than 50 shares exposes you to emotional panic if the price drops.`
            },
            {
                title: 'Understanding Risk-to-Reward Ratio (RRR)',
                content: `Even if your win rate is only 40%, you can still become insanely profitable if your Risk-to-Reward ratio is mathematically favorable.

### ⚖️ The Power of 1:2 RRR

Always aim for setups that yield at least 2 units of profit for every 1 unit of risk.

### 📊 Math Comparison (10 Trades)

* **Win Rate**: 40% (4 Wins, 6 Losses)
* **Risking**: ₹1,000 per trade
* **Targeting**: ₹2,000 per trade (1:2 RR)
* **Total Losses**: 6 × ₹1,000 = **-₹6,000**
* **Total Profits**: 4 × ₹2,000 = **+₹8,000**
* **Net Result**: **+₹2,000 Net Profit**

By maintaining discipline on your Risk-Reward ratio, you make money even while being wrong more than half of the time!`
            },
            {
                title: 'Mastering Trading Psychology',
                content: `Trading strategies are cheap; discipline is expensive. Two core human instincts systematically destroy trading accounts.

### 🧠 The Fatal Biases

1. **Fear of Missing Out (FOMO)**: Watching a stock run up 10% and buying at the peak out of greed. You end up providing exit liquidity to institutional professionals.
2. **Aversion to Loss (The Hope Trap)**: Refusing to trigger your Stop Loss when a stock falls, "hoping" it will bounce back. A small 2% loss transforms into a catastrophic 50% capital destroyer.
3. **Revenge Trading**: Entering random, large positions immediately after a loss in an angry attempt to make it back. Never trade when emotionally triggered.`
            }
        ]
    },
    {
        id: 'mod-7',
        title: '7. Charges, Taxes & Compliance',
        icon: Scale,
        duration: '20 Mins',
        level: 'Crucial',
        shortDesc: 'Learn about STT, GST, brokerages, and Capital Gains tax mechanisms.',
        topics: [
            {
                title: 'The Hidden Costs of Trading',
                content: `Gross profits do not equal net profits. Every trade executes through a chain of intermediaries who charge fees. High-frequency traders can sometimes wipe out 20%+ of their profits in charges.

### 💸 Breakdown of Levies

1. **Brokerage**: The fee paid to your broker. Usually zero for equity delivery, and a flat ₹20 per executed order for Intraday and F&O.
2. **Securities Transaction Tax (STT)**: A direct government tax levied on purchase and sale values. Extremely high on equity delivery (0.1% on both sides) and moderate on F&O.
3. **Exchange Transaction Charges**: Paid directly to NSE/BSE for utilizing their matching engine.
4. **GST**: Charged at 18% on the combined value of Brokerage and Transaction fees.
5. **SEBI Turnover Fee & Stamp Duty**: Micro-charges mandated by regulators.`
            },
            {
                title: 'Capital Gains & Business Taxation',
                content: `Trading income in India is classified and taxed under specific legal headers by the Income Tax Department.

### 📁 Taxation Framework

1. **Short-Term Capital Gains (STCG)**: Applies to equity shares held for less than 12 months. Taxed at a flat rate of **20%** (increased recently from 15%).
2. **Long-Term Capital Gains (LTCG)**: Applies to equities held for longer than 12 months. Taxed at **12.5%** (on gains exceeding ₹1.25 Lakhs annually).
3. **Intraday & F&O Taxation**: Classified as **Business Income** (Speculative and Non-Speculative). These profits are added directly to your total income and taxed according to your personal income tax slab. You can offset losses against other business incomes.`
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
            if (paragraph.startsWith('* ') || paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ')) {
                return (
                    <ul key={index} style={{ paddingLeft: '1.5rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyleType: paragraph.startsWith('*') ? 'disc' : 'decimal' }}>
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
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Cliks Market Academy — Production Grade V1.2</span>
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '950', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Enterprise Trading Academy</h1>
                    <p style={{ opacity: 0.9, fontWeight: '500', fontSize: '1.02rem', lineHeight: '1.5', margin: 0 }}>Access deep-dive structured education from core exchange infrastructure up to derivatives pricing, Greeks management, and tax liabilities.</p>
                </div>
                <div style={{ width: '180px', height: '180px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={80} style={{ color: 'white', opacity: 0.25 }} />
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
                            placeholder="Search concepts or syllabus..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: '500', color: '#1E293B' }}
                        />
                    </div>

                    {/* Syllabus Module List */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Curriculum Modules</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#1B6B3A', background: '#DCF2E4', padding: '2px 8px', borderRadius: '6px' }}>{TRADING_MODULES.length} Courses</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '65vh', overflowY: 'auto' }}>
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
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isActive ? '#DCF2E4' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#1B6B3A' : '#64748B', flexShrink: 0 }}>
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
                                                <h4 style={{ fontSize: '0.92rem', fontWeight: '850', color: isActive ? '#064E3B' : '#1E293B', margin: 0, lineHeight: '1.4' }}>{module.title}</h4>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredModules.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>No matching topics found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content Reader */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    
                    {/* Inner Topic Sub-navigation Bar */}
                    <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {activeModule.topics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTopicIdx(idx)}
                                    style={{ 
                                        padding: '0.6rem 1.1rem', 
                                        borderRadius: '10px', 
                                        border: activeTopicIdx === idx ? 'none' : '1px solid #E2E8F0', 
                                        background: activeTopicIdx === idx ? '#1B6B3A' : 'white', 
                                        color: activeTopicIdx === idx ? 'white' : '#475569', 
                                        fontWeight: '800', 
                                        fontSize: '0.82rem', 
                                        cursor: 'pointer',
                                        boxShadow: activeTopicIdx === idx ? '0 4px 12px rgba(27, 107, 58, 0.15)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Part {idx + 1}: {topic.title.length > 25 ? topic.title.substring(0, 25) + '...' : topic.title}
                                </button>
                            ))}
                        </div>
                        
                        {/* Bookmark Button */}
                        <button 
                            onClick={() => toggleBookmark(currentTopic.title)}
                            style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: bookmarkList.includes(currentTopic.title) ? '#F59E0B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            title="Bookmark Chapter"
                        >
                            <Bookmark size={18} fill={bookmarkList.includes(currentTopic.title) ? '#F59E0B' : 'none'} />
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B' }}>{bookmarkList.includes(currentTopic.title) ? 'Bookmarked' : 'Save'}</span>
                        </button>
                    </div>

                    {/* Content Rendering Area */}
                    <div style={{ padding: '3.5rem' }} className="animate-in fade-in duration-300">
                        
                        {/* Heading info */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                <span>{activeModule.title}</span>
                                <ChevronRight size={14} />
                                <span>Chapter Section {activeTopicIdx + 1}</span>
                            </div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.25, margin: '0 0 1.25rem 0' }}>
                                {currentTopic.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#64748B', fontSize: '0.82rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={15} />
                                    <span style={{ fontWeight: '600' }}>Estimated Reading: ~10-12 mins</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 size={15} color="#10B981" />
                                    <span style={{ fontWeight: '600' }}>Industry Standard Certified Syllabus</span>
                                </div>
                            </div>
                        </div>

                        {/* Rich Formatted Explanations */}
                        <article style={{ fontSize: '1.02rem', color: '#334155' }}>
                            {formatContent(currentTopic.content)}
                        </article>

                        {/* Bottom Navigation Guide / Read next */}
                        <div style={{ marginTop: '4rem', borderTop: '1px solid #E2E8F0', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>Curriculum Progress</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>Section complete! Ready for next level?</span>
                                </div>
                            </div>

                            {/* Continue Button */}
                            {activeTopicIdx < activeModule.topics.length - 1 ? (
                                <button 
                                    onClick={() => {
                                        setActiveTopicIdx(activeTopicIdx + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                        color: 'white', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '12px', fontWeight: '850', fontSize: '0.92rem', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(27, 107, 58, 0.25)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Next Chapter <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        const nextIdx = TRADING_MODULES.findIndex(m => m.id === activeModule.id) + 1;
                                        if (nextIdx < TRADING_MODULES.length) {
                                            handleModuleSelect(TRADING_MODULES[nextIdx]);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        } else {
                                            alert("🎓 Magnificent Achievement! You have exhausted and fully analyzed the absolute limits of our complete Market Academy suite!");
                                        }
                                    }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                                        color: 'white', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '12px', fontWeight: '850', fontSize: '0.92rem', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(15, 23, 42, 0.25)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Proceed to Next Module <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Reference Glossary & Disclaimer Footer */}
            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}>
                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1B6B3A', marginBottom: '0.85rem' }}>
                        <Zap size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Pro-Trading Principal</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>"Plan your trade, and trade your plan." Capital security must govern every execution. Refusal to set and stick to calculated stop-losses will lead to total capital failure.</p>
                </div>

                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#3B82F6', marginBottom: '0.85rem' }}>
                        <HelpCircle size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Analyzing Real Charts?</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>Pair this documentation with elite analytical software like TradingView or Sensibull. Study historical EMA interactions and practice candlestick pattern hunting live.</p>
                </div>

                <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#EF4444', marginBottom: '0.85rem' }}>
                        <ShieldAlert size={20} />
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', margin: 0 }}>Regulatory Hazard</h4>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>Leveraged instruments (Futures & Options) are extremely speculative. Certified SEBI data warns that over 90% of retail participants lose money in derivatives trading.</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessTrading;
