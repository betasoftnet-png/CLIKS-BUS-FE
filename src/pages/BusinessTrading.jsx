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

// Fallback icon wrapper just in case Globe or others have pathing mismatches
const Globe = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);

// Comprehensive 25-Module Enterprise Syllabus Databank
const CURRICULUM_PHASES = [
    {
        name: 'Phase 1 — Foundation & Market Understanding',
        icon: Compass,
        modules: [
            {
                id: 'mod-1',
                title: 'Module 1: Introduction to Financial Markets',
                level: 'Beginner', duration: '15 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'The Ecosystem Structure',
                        content: `The financial market is a sophisticated infrastructure allowing capital to flow from savers/investors to businesses needing growth funds.

### 🏦 Market Participants Matrix

* **Retail Investors**: Individual traders/investors putting in personal savings.
* **HNI (High Net-worth Individuals)**: Individuals with massive deployable capital exceeding ₹2 Crores.
* **DIIs (Domestic Institutional Investors)**: Local mutual funds (e.g., SBI Mutual Fund), insurance firms (LIC), and pension schemes.
* **FIIs (Foreign Institutional Investors)**: Giant international hedge funds, endowments, and foreign banks investing in Indian assets. They provide massive liquidity.

### 🏛️ Key Regulators & Depositories

* **SEBI (Securities & Exchange Board of India)**: The absolute apex watchdog protecting retail investor safety and regulating integrity.
* **NSE vs. BSE**: The primary National Stock Exchange (high liquidity, tech-driven) and Bombay Stock Exchange (oldest in Asia, vast listings).
* **Demat Depositories**: **NSDL** and **CDSL**. They serve as digital bank accounts holding your acquired share assets digitally to eliminate paper fraud.`
                    }
                ]
            },
            {
                id: 'mod-2',
                title: 'Module 2: Marketplace Pillars & Order Mechanics',
                level: 'Beginner', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Execution & Matching Engines',
                        content: `Trading requires telling the exchange matching engine exactly how to act. Using the wrong product type or order logic causes heavy slippage losses.

### 📥 Order Matching Protocols

* **Bid/Ask Spread**: The "Bid" is the highest price a buyer wants to pay; the "Ask" is the lowest price a seller accepts. The gap is the spread. Highly liquid stocks have tight 0.05 paisa spreads.
* **Liquidity**: How easily you can buy/sell large volumes without impacting price. Low liquidity causes high slippage (getting filled at terrible rates).
* **Settlement Cycle**: NSE/BSE use **T+1 cycles**—transactions on Day T deliver shares to your Demat by Day T+1.

### 🛠️ Understanding Order Configurations

1. **Market Order**: Buy/Sell instantly at whatever price is currently printing on screen.
2. **Limit Order**: Specifying an exact threshold price. Triggers *only* when matching conditions align.
3. **Stop Loss Order (SL)**: A protection trigger. Lies dormant until stock hits trigger price, then executes automatically.
4. **Product Codes**:
   * **CNC (Cash & Carry)**: Fully paid long-term investing. No leverage.
   * **MIS (Margin Intraday)**: Dynamic day-trading with 5x leverage. Positions auto-liquidated at 3:20 PM.`
                    }
                ]
            },
            {
                id: 'mod-3',
                title: 'Module 3: Platforms & Broker Infrastructure',
                level: 'Beginner', duration: '15 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'The Modern Terminal Architecture',
                        content: `Brokers act as tech pipelines connecting you directly to NSE/BSE matching servers.

### 💻 Terminal Components

* **Market Depth (L2 Data)**: Shows the top 5 pending buy and sell orders waiting on exchange order books. Tells you immediate demand/supply levels.
* **Option Chain**: A comprehensive map charting every single strike price, call/put pricing, and open interest positions for a stock.
* **Margin Management**: The RMS (Risk Management System) run by brokers monitors user accounts in real-time. If your losses exceed your capital buffer, the automated RMS systematically triggers margin-calls and liquidates assets.
* **API Hooks**: Connect customized algorithms or external Excel sheets directly to terminal systems for automated execution.`
                    }
                ]
            },
            {
                id: 'mod-4',
                title: 'Module 4: Economic & Market Ecosystem',
                level: 'Beginner', duration: '25 Mins',
                icon: Globe,
                topics: [
                    {
                        title: 'Macroeconomic Drivers',
                        content: `No stock operates in a vacuum. Macro factors set by central banks dictate massive institutional money flow.

### 💰 Central Banking & Policy

* **Repo Rate**: Set by the RBI (Reserve Bank of India). High rates increase corporate borrowing costs, reducing corporate expansion and theoretically pulling down equity valuations.
* **Inflation (CPI)**: Persistent inflation erodes purchasing power, prompting RBI to Hike rates.
* **USD-INR Mechanics**: A weakening Rupee boosts export companies (IT/Pharma) but hurts heavily importing companies (Oil/Paints).
* **Crude Oil Correlation**: India imports over 80% of its oil needs. Rising crude prices damage corporate profitability across aviation, logistics, and paint industries.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Fundamental Investing Masterclass',
        icon: Gem,
        modules: [
            {
                id: 'mod-5',
                title: 'Module 5: Financial Statements Deep Dive',
                level: 'Intermediate', duration: '25 Mins',
                icon: FileText,
                topics: [
                    {
                        title: 'Reading Corporate Accounts',
                        content: `To invest for the long-term, you must inspect if the actual corporate engine generates growing cash.

### 📊 The Three Fundamental Columns

1. **Profit & Loss (P&L)**: Tracks Revenues, Operating Margins (EBITDA), Depreciation, Taxes, and net PAT (Profit After Tax). If EBITDA margins expand, the business enjoys scaling efficiency.
2. **Balance Sheet**: Evaluates total assets against external borrowing debt and internal Shareholder Equity.
3. **Cash Flow Statement**: Reveals the absolute cash moving in/out. Crucially, look for **Operating Cash Flow (OCF)**. High PAT with zero OCF flags fraudulent credit sales.`
                    }
                ]
            },
            {
                id: 'mod-6',
                title: 'Module 6: Ratios & Valuation Models',
                level: 'Intermediate', duration: '30 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Mastering Mathematical Valuations',
                        content: `Ratios help distinguish between an expensive hype trap and a fundamentally undervalued powerhouse.

### 📐 Advanced Mathematical Metrics

1. **P/E Ratio**: Price-to-Earnings tells you multiple paid. Higher than 50 demands extraordinary growth backing it.
2. **PEG Ratio (P/E to Growth)**: A PEG below 1.0 generally identifies an undervalued growth stock.
3. **ROCE vs ROE**: **Return on Capital Employed** assesses total funding efficiency including debt. Excellent management teams deliver ROCE above 20% consistently.
4. **Discounted Cash Flow (DCF)**: Estimating the net present value of a business by projecting future free cash flows back to the present day using a discount rate.`
                    }
                ]
            },
            {
                id: 'mod-7',
                title: 'Module 7: Corporate Actions & Shareholder Events',
                level: 'Intermediate', duration: '20 Mins',
                icon: Zap,
                topics: [
                    {
                        title: 'Events Impacting Share Capital',
                        content: `Major events executed by the corporate board fundamentally affect equity liquidity and share counts.

### 📢 The Complete Corporate Event List

* **Stock Splits**: Breaking high-value shares (e.g., ₹5000 to 10 shares of ₹500) to improve retail trade accessibility. Total valuation stays static.
* **Dividends & Yield**: Retained profits sent directly as cash. Dividend Yield measures cash returned relative to market price.
* **Promoter Pledging**: Highly critical warning sign! If founders pledge their personal stock as collateral for heavy corporate debt, they risk forced market liquidation during crashes. Avoid companies where pledging exceeds 25% of promoter shares.`
                    }
                ]
            },
            {
                id: 'mod-8',
                title: 'Module 8: Sector & Business Analysis',
                level: 'Intermediate', duration: '25 Mins',
                icon: Briefcase,
                topics: [
                    {
                        title: 'Evaluating Cyclicality and Moats',
                        content: `Different sectors run on completely unique economic cycles and metrics.

### 🏢 Analyzing Major Indian Sectors

* **Banking (BFSI)**: Track **NPA** (Non-Performing Assets) and Net Interest Margins (NIM). Rising NPAs flag system danger.
* **Information Tech (IT)**: Heavily driven by USD strength and international US client budgets.
* **Defensive vs. Cyclical**: FMCG/Pharma remain steady in recessions (Defensive). Infrastructure, Auto, Steel boom or bust based on economy (Cyclicals).
* **The Economic Moat**: Competitive advantages like absolute brand power (Maggi/iPhone) or high customer switching costs that guard profits against competitors.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 3 — Technical Analysis Mastery',
        icon: BarChart3,
        modules: [
            {
                id: 'mod-9',
                title: 'Module 9: Chart Reading & Price Action',
                level: 'Intermediate', duration: '30 Mins',
                icon: LineChart,
                topics: [
                    {
                        title: 'Foundations of Pure Price Action',
                        content: `Price Action assumes that news, earnings, and fundamentals are automatically calculated into the current chart pattern instantly.

### 📈 Market Structure Mechanics

* **The 3 Market Cycles**:
  1. **Uptrend**: Printing a clear, stair-case sequence of Higher Highs (HH) and Higher Lows (HL).
  2. **Downtrend**: Lower Highs (LH) and Lower Lows (LL).
  3. **Sideways/Consolidation**: Equal Highs and Lows bound in a tight range.
* **Breakouts**: When a range boundary is pierced with sudden violence.
* **Multi-Timeframe Analysis (MTFA)**: Use higher timeframes (Weekly/Daily) to find the trend, and smaller timeframes (15 Min/5 Min) to execute entry precision.`
                    }
                ]
            },
            {
                id: 'mod-10',
                title: 'Module 10: Candlestick Psychology',
                level: 'Intermediate', duration: '25 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Decoding Mass Psychology',
                        content: `Candlesticks capture the visual battleground between bulls and bears in fixed time buckets.

### 🕯️ The Essential Candlestick Codex

* **Hammer/Pinbar**: A tiny body resting atop a very long lower wick. Indicates heavy panic selling occurred, but buyers fiercely rejected those prices to close near the high. Bullish reversal sign.
* **Shooting Star**: Long upper wick, small lower body. Buyers tried pushing higher but institutional sellers stepped in at the top. Bearish reversal sign.
* **Bullish Engulfing**: A large green candle fully consuming/wrapping the entire body of the previous red candle. Signifies sudden, absolute buyer dominance.`
                    }
                ]
            },
            {
                id: 'mod-11',
                title: 'Module 11: Support, Resistance & Structure',
                level: 'Intermediate', duration: '30 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Building the Chart Skeleton',
                        content: `S/R zones are historical reference price zones where institutions typically build buy or sell order reserves.

### 🧱 Principles of Key Levels

* **Static Levels**: Horizontal zones where price bounced historically multiple times.
* **The Polar Principle**: A major Resistance level once broken hard upward converts directly into a new Support zone on subsequent retests.
* **Supply & Demand Zones**: Broader boxes where institutional liquidity imbalances reside, triggering rapid price originations.
* **Trendline Validation**: Slanted lines connecting rising lows or falling highs. The 3rd touch point generally offers the highest statistical accuracy.`
                    }
                ]
            },
            {
                id: 'mod-12',
                title: 'Module 12: Indicators & Momentum Systems',
                level: 'Intermediate', duration: '35 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Mathematical Trend Following',
                        content: `Indicators process past price to reveal invisible factors like momentum, velocity, and volatility.

### 🛠️ The Professional Toolkit

* **Moving Averages (EMA)**: The **20 EMA** guides intraday momentum. The **200 EMA** represents the institutional macro bias. If price stays above 200 EMA, only buy setups.
* **RSI (Relative Strength Index)**: Ranges 0-100. Overbought (>70) flags danger; Oversold (<30) signals potential panic bottom. Look for **Divergences** between RSI and price.
* **VWAP (Volume Weighted Avg Price)**: Crucial for intraday trading. Acts as the average buying benchmark for big institutions. Price below VWAP implies bearish bias.`
                    }
                ]
            },
            {
                id: 'mod-13',
                title: 'Module 13: Volume & Smart Money Concepts',
                level: 'Intermediate', duration: '30 Mins',
                icon: Database,
                topics: [
                    {
                        title: 'Following Institutional Tracks',
                        content: `Smart Money (institutions) cannot hide their footprint because their massive order sizes must print on Volume charts.

### 🔍 Decoding The Trace

* **Volume Confirmation**: A breakout above resistance without high volume is likely a retail trap. True breakouts MUST have massive, 2x average volume spikes.
* **Accumulation/Distribution**: Long, tight consolidations where institutions quietly buy huge blocks without spiking price, before orchestrating a markup phase.
* **Liquidity Grabs**: Sweeping stop losses sitting just below support lines to collect shares before firing the price in the opposite direction.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 4 — Derivatives & Advanced Instruments',
        icon: Layers,
        modules: [
            {
                id: 'mod-14',
                title: 'Module 14: Futures Trading',
                level: 'Advanced', duration: '35 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Leveraged Obligations',
                        content: `Futures permit trading large underlying asset baskets using a fraction of the capital (Margin).

### 🔄 Futures Operational Mechanics

* **Leverage Mechanics**: An index future lot might be worth ₹10 Lakhs, but your margin requirement is only approx ₹1.5 Lakhs (15%).
* **MTM (Mark-to-Market)**: Daily profit or loss is settled electronically in cash every single day at 3:30 PM.
* **Hedging**: Institutional portfolio managers sell futures to safeguard multi-crore long portfolios from market crashes.`
                    }
                ]
            },
            {
                id: 'mod-15',
                title: 'Module 15: Options Foundations',
                level: 'Advanced', duration: '40 Mins',
                icon: Gem,
                topics: [
                    {
                        title: 'Understanding Basic Call & Put Rights',
                        content: `Unlike futures, options give rights to the buyer without absolute obligation.

### 📍 Concepts of Options Contracts

* **Call Option (CE)**: Buyer bets price will rise.
* **Put Option (PE)**: Buyer bets price will fall.
* **Premium Components**: Premium consists of **Intrinsic Value** (real-money value) + **Time Value** (decaying hope).
* **Moneyness Breakdown**:
  * **ITM (In The Money)**: Real value exists. Safe but expensive.
  * **ATM (At The Money)**: Strike exactly equal to spot.
  * **OTM (Out of The Money)**: Zero intrinsic value. Pure speculation. Mostly expire at ₹0.`
                    }
                ]
            },
            {
                id: 'mod-16',
                title: 'Module 16: Options Greeks & Volatility',
                level: 'Advanced', duration: '45 Mins',
                icon: Compass,
                topics: [
                    {
                        title: 'Mathematical Decay and Acceleration',
                        content: `The Greek metrics calculate exactly how an option premium shifts under changing volatility, price, and time.

### 🇬🇷 The Big Four Greeks

1. **Delta**: Rate of change. Call Option delta goes from 0 to +1. Put goes 0 to -1.
2. **Theta (Time Decay)**: The daily decay value. Options are melting ice-cubes. Every night you hold, Theta decays the value. Highly beneficial for option sellers.
3. **Vega**: Sensitivity to volatility changes. If India VIX rises, all premiums swell up.
4. **IV Crush**: When an event ends (earnings, elections), volatility collapses instantly, crushing option premium values even if price hasn't shifted.`
                    }
                ]
            },
            {
                id: 'mod-17',
                title: 'Module 17: Professional Options Strategies',
                level: 'Advanced', duration: '40 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Building Structured Risk Spreads',
                        content: `Professional derivative players almost never buy single naked options. They use defined-risk spreads to control risk.

### 📑 Core Structural Strategies

* **Bull Call Spread**: Buying a lower-strike Call and selling a higher-strike Call to reduce cost and hedge theta decay. Max loss is tightly capped.
* **Iron Condor**: Selling both an OTM Call and an OTM Put while buying further OTM wings as protection. Reaps max profits in non-directional sideways ranges.
* **Covered Call**: Holding physical delivery of stocks and selling OTM Calls monthly to generate consistent cash rent.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 5 — Trading Styles & Strategy Design',
        icon: Briefcase,
        modules: [
            {
                id: 'mod-18',
                title: 'Module 18: Scalping & Intraday Trading',
                level: 'Intermediate', duration: '30 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Zero-Overnight Risk Systems',
                        content: `Intraday systems demand intense focus, fast setups, and liquid instruments.

### ⏱️ Intraday Trade Frameworks

* **Scalping**: Ultra-short durations (seconds to 2 minutes) on 1-minute charts using massive sizes. Catches micro breakouts using 9 EMA.
* **ORB (Opening Range Breakout)**: Evaluating the high and low boundaries of the first 15 minutes, and entering directionally when broken with heavy volume.
* **VWAP Bounce**: Buying support near the VWAP line when strong volume establishes an early institutional trend.`
                    }
                ]
            },
            {
                id: 'mod-19',
                title: 'Module 19: Swing Trading Systems',
                level: 'Intermediate', duration: '30 Mins',
                icon: LineChart,
                topics: [
                    {
                        title: 'Capturing Mid-Term Trend Swings',
                        content: `Holds positions for days to weeks. Requires 15-30 mins daily analysis, perfect for working professionals.

### 📈 Swing Concepts

* **Pullback Entries**: Letting a stock break out, waiting for a 30-40% drop back to its 50 EMA or broken resistance (Support), and buying the bounce.
* **Gap Trading**: Spotting morning earnings gaps and either trading in gap direction or fading them on overextension.`
                    }
                ]
            },
            {
                id: 'mod-20',
                title: 'Module 20: Positional & Long-Term Investing',
                level: 'Beginner', duration: '25 Mins',
                icon: PieChart,
                topics: [
                    {
                        title: 'Compounding Wealth Structures',
                        content: `Positional systems focus on macroscopic economic shifts lasting months to multi-years.

### 💰 The Investor Core

* **Trend Following**: Entering powerful weekly chart breakouts and trailing the 20-Week EMA until a structural change.
* **SIP Methodology**: Consistent monthly purchases ignoring interim volatilities to benefit from Rupee Cost Averaging.
* **Portfolio Rebalancing**: Trimming asset allocations yearly to restore targeted risk boundaries.`
                    }
                ]
            },
            {
                id: 'mod-21',
                title: 'Module 21: Strategy Building & Backtesting',
                level: 'Intermediate', duration: '30 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Validating the Trading Edge',
                        content: `A trading strategy without written data validations is simply blind hope.

### 📋 Framework for Building

1. **Define The Set**: Write exact logical conditions for entry (e.g., Price > 200 EMA + Bullish engulfing at Support).
2. **The Backtest**: Manually scan the past 2 years of chart data and log every trade setup.
3. **Metric Target**: Your setup must achieve positive **Expectancy**. Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss). Even a 40% win rate yields immense wealth if Avg Win is 2.5x Avg Loss.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 6 — Risk, Psychology & Performance',
        icon: ShieldAlert,
        modules: [
            {
                id: 'mod-22',
                title: 'Module 22: Risk Intelligence & Capital Protection',
                level: 'Crucial', duration: '35 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Preventing Account Ruin',
                        content: `The ultimate secret of professional trading is preserving capital at all cost.

### 🛡️ Capital Survival Mathematics

* **The 1% Golden Rule**: Never risk more than 1% of total capital on any singular trade.
* **Position Sizing Formula**:
  * *Shares = (Capital * 0.01) ÷ (Entry Price - Stop Loss Price)*
  * *Example*: Capital ₹1,00,000 (Risk = ₹1,000). Entry ₹500, SL ₹480 (Risk/share = ₹20). Buying volume = 1000 / 20 = **50 Shares**.
* **Drawdown Recovery**: A 10% loss requires 11% to recover. A 50% loss requires an impossible 100% gain to break even. Never let losses compound.`
                    }
                ]
            },
            {
                id: 'mod-23',
                title: 'Module 23: Trading Psychology & Discipline',
                level: 'Crucial', duration: '30 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Conquering Internal Biological Urges',
                        content: `The human brain is biologically hardwired to fail in trading. We run from pain (realizing losses) and seek instant safety (booking profits early).

### 🧠 Psychological Pitfalls

* **FOMO (Fear of Missing Out)**: Entering too late out of pure greed.
* **Revenge Trading**: Scaling size after a loss to "win it back."
* **Aversion to Loss**: Refusing to execute a Stop Loss, praying for a rebound until a minor 2% loss destroys the account. True professionals view Stop Losses as normal, calculated business expenses.`
                    }
                ]
            },
            {
                id: 'mod-24',
                title: 'Module 24: Professional Trading Operations',
                level: 'Intermediate', duration: '25 Mins',
                icon: Briefcase,
                topics: [
                    {
                        title: 'Operating Trading as a Business',
                        content: `Retail traders act like gamblers; professionals establish standard operational workflows.

### 📋 Operational Checklist

* **Daily Journaling**: Record entry reason, chart snap, emotion at entry, slip value, and exit reasoning for every trade.
* **KPI Analytics**: Review your win rate, maximum consecutive losses, profit factor, and average hold times monthly.
* **Daily Routine**: 8:30 AM global market scans; 9:00 AM pre-market setups; 9:15 AM focus execution; 3:30 PM log performance and switch system off.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 7 — Indian Market Compliance & Growth',
        icon: Gavel,
        modules: [
            {
                id: 'mod-25',
                title: 'Module 25: Indian Taxes, Charges & Legal Compliance',
                level: 'Crucial', duration: '40 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Taxes, Charges, and ITR Filing',
                        content: `Trading generates legal taxable income that must be filed under exact heads with the Indian Income Tax Department.

### 💸 Mandatory Transactional Fees

1. **Brokerage**: Direct fee paid to broker (delivery usually ₹0; intraday/F&O flat ₹20).
2. **STT (Securities Transaction Tax)**: Goverment levy on turnover value. High on equities (0.1% buy/sell).
3. **GST**: 18% on the combined total of Brokerage + Exchange charges.
4. **Stamp Duty / SEBI Fee**: Mandatory micro-fees applied per turnover crore.

### 📁 The Indian Income Tax Framework

* **Short-Term Capital Gains (STCG)**: Equity delivery held under 12 months. Flat tax rate of **20%**.
* **Long-Term Capital Gains (LTCG)**: Delivery held over 12 months. Taxed at **12.5%** on gains over ₹1.25 Lakhs.
* **Intraday Trading**: Deemed **Speculative Business Income**. Taxed at your slab.
* **F&O Trading**: Deemed **Non-Speculative Business Income**. Add to total income, tax at personal slab. You can deduct legitimate expenses like internet, computer, advisory fees, and broker charges against business revenues.`
                    }
                ]
            }
        ]
    }
];


// Comprehensive new Curriculum Blocks for Additional Asset Learning Paths
const SIP_CURRICULUM = [
    {
        name: 'Phase 1 — SIP Fundamentals',
        icon: Target,
        modules: [
            {
                id: 'sip-1',
                title: 'Module 1: The Compounding Engine',
                level: 'Beginner', duration: '15 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'Power of Systematic Investing',
                        content: `A Systematic Investment Plan (SIP) is a structured vehicle that allows you to invest a fixed, recurring amount regularly into capital market securities.
                        
### ⏳ The Eighth Wonder: Compounding
                        
* **Time Over Money**: Starting early with smaller amounts generates vastly superior results compared to starting with large amounts later in life due to the time horizon multiplier.
* **Automated Discipline**: Eliminates the emotional and psychological barrier of "timing the market" by systematically investing regardless of ongoing market highs or lows.
* **Rupee Cost Averaging**: When the markets crash, your SIP automatically acquires more units at cheaper NAVs. When the markets rally, it buys fewer units. Over a 10-year horizon, your average acquisition cost becomes statistically optimized.

### 🏛️ The Math Foundations: Rule of 72, 114, & 144
* **Rule of 72**: Divide 72 by your expected annualized interest rate to calculate the approximate number of years required to Double your capital.
* **Rule of 114**: Calculates the time required to Triple your initial capital amount.
* **Rule of 144**: Tells you exactly when your cumulative wealth will Quadruple in nominal terms.`
                    }
                ]
            },
            {
                id: 'sip-2',
                title: 'Module 2: Product Architectures',
                level: 'Intermediate', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Step-Up & Flexible Deployments',
                        content: `Standard fixed SIPs are powerful, but advanced wealth compounders use dynamic variations to significantly speed up financial freedom timelines.
                        
### 🚀 The Step-Up (Top-Up) Strategy
                        
* **Income Alignment**: Systematically increase your monthly contribution annually (e.g., by 10% or 20%) to match your yearly professional salary appraisal.
* **Compound Acceleration**: An flat ₹10k monthly SIP for 20 years at a 12% CAGR yields ₹98.9 Lakhs. A mere 10% annual Step-Up SIP over the exact same period yields over ₹2.05 Crores! You more than double the ultimate terminal wealth with negligible incremental strain.

### ⚙️ Flexible, Trigger & Perpetual Configurations
1. **Flexible SIP**: Grants the investor rights to temporarily reduce or scale up monthly installments depending on seasonal business cash flow, without pausing the overall compound engine.
2. **Trigger SIP**: Integrates programmatic logic. For example, setting a trigger to "Automatically deploy an extra 50% capital if the Nifty 50 Index corrects by more than 4%."
3. **Perpetual Mode**: An SIP without an end date, utilizing maximum time exposure until manual retirement overrides are initiated.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Planning & Tax Alpha',
        icon: Compass,
        modules: [
            {
                id: 'sip-3',
                title: 'Module 3: Lifecycle Goal Structuring',
                level: 'Advanced', duration: '25 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Objective Based Portfolio Alignment',
                        content: `Random investing leads to random results. Pro-level financial planning dictates anchoring SIPs to definitive real-world objectives.
                        
### 🎯 Asset Correlation Framework
                        
* **Short-Term (< 3 Years)**: Map goals to Low-Duration Debt or Liquid Funds. Zero equity exposure eliminates short-term principal depletion risk.
* **Medium-Term (3 to 7 Years)**: Deploy in Conservative Hybrid or Balanced Advantage Funds which buffer market volatility via dynamic equity arbitrage.
* **Long-Term (> 7 Years)**: Aggressive allocations into Pure Equity (Flexi Cap, Mid Cap, and Small Cap) to capture maximum corporate economic expansions.

### 💸 The ELSS Wealth + Tax Hack
* **Under Section 80C**: Equity Linked Savings Schemes (ELSS) provide up to ₹1.5 Lakhs annual tax deduction.
* **Lowest Lock-In**: ELSS holds a mandatory 3-year lock-in, which is the shortest tax-saving lock-in among Indian financial instruments (compared to 5 years for Tax FDs or 15 years for PPF).`
                    }
                ]
            }
        ]
    }
];

const MUTUAL_FUNDS_CURRICULUM = [
    {
        name: 'Phase 1 — Ecosystem & Fund Mechanics',
        icon: Database,
        modules: [
            {
                id: 'mf-1',
                title: 'Module 1: The Engine Under the Hood',
                level: 'Beginner', duration: '20 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'Asset Management, NAV & Expense Ratio',
                        content: `Mutual funds pool capital from millions of investors and deploy it across institutional securities, managed by licensed fund management teams.
                        
### 🏗️ The Key Pillars
                        
* **AMC (Asset Management Company)**: The regulated corporate entity (e.g., SBI MF, Parag Parikh) designed to configure and issue individual mutual schemes.
* **NAV (Net Asset Value)**: The market price per unit calculated daily at the close of trade: *(Total Portfolio Value - Administrative Liabilities) / Outstanding Units*.
* **AUM (Assets Under Management)**: The aggregate capital managed by a fund. Exceptionally large AUMs in small-cap sectors can sometimes drag on alpha generation potential.

### 🕵️ Deciphering Expense Ratio Drag
1. **TER (Total Expense Ratio)**: The annual operational fee charged directly from NAV. A 1% difference in TER over 25 years can consume nearly 15-20% of total accumulated portfolio value!
2. **Direct vs Regular Plans**: Direct plans eliminate distributor/brokerage commissions. They offer the exact same underlying assets but carry a 0.6% to 1.2% higher annual return compounding advantage.`
                    }
                ]
            },
            {
                id: 'mf-2',
                title: 'Module 2: Equities & Cap Allocation',
                level: 'Intermediate', duration: '25 Mins',
                icon: PieChart,
                topics: [
                    {
                        title: 'Bluechip to Multibagger Classifications',
                        content: `SEBI mandates specific allocation bounds for funds based on market capitalization parameters to protect investor risk profiles.
                        
### 📊 Market Cap Category Grid
                        
* **Large-Cap Funds**: Minimum 80% allocation into India's top 100 bluechip enterprises. Lowest equity volatility, high defensive resilience.
* **Mid-Cap Funds**: Targets companies ranked 101 to 250. High growth potential but prone to heavy corrections during macro bear phases.
* **Small-Cap Funds**: Deploys in companies from the 251st position onwards. Extreme explosive multibagger alpha capacity but possesses drawdowns exceeding 45%.
* **Flexi-Cap / Multi-Cap**: The fund manager holds dynamic mandate overrides, shifting capital across caps dynamically based on valuation comfort.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Passives, Debt & Advanced Ratios',
        icon: Award,
        modules: [
            {
                id: 'mf-3',
                title: 'Module 3: The Passive Alpha Paradigm',
                level: 'Advanced', duration: '25 Mins',
                icon: LineChart,
                topics: [
                    {
                        title: 'Index Funds and ETFs vs Active Management',
                        content: `Passive funds simply duplicate a major benchmark index (like Nifty 50 or Sensex) instead of paying managers to pick individual stocks.
                        
### 🧭 Passive Core Benefits
                        
* **Negligible Cost**: Many index funds have expense ratios as low as 0.05% to 0.15%, minimizing fee friction.
* **Elimination of Human Error**: Zero risk of a fund manager making highly concentrated, emotionally biased bad stock bets.
* **SPIVA Data Reality**: Globally, S&P Indices Versus Active (SPIVA) scorecards show that over 70% of large-cap active managers fail to outperform a basic low-cost Index Fund over a 10-year cycle!

### 📉 Tracking Metrics to Inspect
* **Tracking Error**: Measures the statistical variance between the index performance and fund performance. Lower is infinitely better.
* **Tracking Difference**: The absolute gap in yields primarily caused by expense drag.`
                    }
                ]
            }
        ]
    }
];

const WEALTH_CURRICULUM = [
    {
        name: 'Phase 1 — Sovereign Assets & Bonds',
        icon: Gem,
        modules: [
            {
                id: 'w-1',
                title: 'Module 1: The Gold Standard & Sovereign Debt',
                level: 'Beginner', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Sovereign Gold Bonds (SGB) vs Hard Metal',
                        content: `Diversifying into safe haven assets builds anti-fragility into portfolios during periods of systemic inflation, currency devaluation, or war.
                        
### 🏅 The Sovereign Gold Bond (SGB) Dominance
                        
* **RBI Backed Security**: Issued by the Reserve Bank on behalf of the central government. The ultimate institutional way to secure digital gold.
* **Dual Yield Mechanics**: Investors capture pure gold spot price appreciation PLUS a guaranteed **2.50% annual coupon interest** paid out semi-annually!
* **Zero Tax Burden**: Unlike physical gold, if you hold an SGB until maturity (8 years), the entire long-term capital gains (LTCG) are **100% Tax-Exempt**.

### 📊 Non-Metal Alternatives
1. **Gold ETFs**: Units representing 99.5% pure gold trading in real-time on BSE/NSE. Highly liquid, instant exit.
2. **Digital Gold**: Offered by custodial vaults. Higher buy-sell spreads, suitable only for extreme micro-savings.`
                    }
                ]
            },
            {
                id: 'w-2',
                title: 'Module 2: Corporate Debt & Fixed Income',
                level: 'Intermediate', duration: '25 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Yield Curves & Credit Rating Protocols',
                        content: `Debt investing is not about hitting home runs; it is about secure capital preservation and steady income predictable streams.
                        
### 🛡️ Debt Evaluation Matrix
                        
* **Credit Risk Filter**: Strictly inspect SEBI-approved ratings (CRISIL, ICRA, CARE). Deploy capital into AAA, AA+, or Sovereign (SOV) grade instruments. Never touch speculative B-rated debt.
* **T-Bills & G-Secs**: Directly lending money to the Central Government. Maximum safety in the country.
* **Corporate Fixed Deposits**: Unsecured NCDs issued by bluechip NBFCs, typically providing 1.5% - 2% yield spreads above typical public bank fixed deposits.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Yield Generation Real Estate',
        icon: Compass,
        modules: [
            {
                id: 'w-3',
                title: 'Module 3: REITs & Asset Tokenization',
                level: 'Advanced', duration: '30 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Real Estate Investment Trusts (REITs)',
                        content: `REITs represent mutual funds for premium commercial real estate, enabling small-scale retail participation in high-yield tech parks.
                        
### 🏢 Commercial REIT Infrastructure
                        
* **Grade-A Real Estate**: Gain fractional ownership of trophy assets (commercial buildings, office IT parks) leased to Fortune 500 conglomerates.
* **Statutory Dividend Payout**: Under Indian SEBI regulations, REIT structures are legally mandated to distribute a minimum of **90% of Net Distributable Cash Flows** back to unit holders.
* **Liquidity Advantage**: Eliminates the high-friction traditional property sale cycle (which can take months). REIT units can be bought and liquidated in seconds via the stock market.`
                    }
                ]
            }
        ]
    }
];

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

