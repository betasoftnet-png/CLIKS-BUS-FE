/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { 
    BookOpen, 
    Target, 
    Activity, 
    FileText, 
    Scale, 
    Zap, 
    Briefcase, 
    LineChart, 
    Layers, 
    TrendingUp, 
    Gem, 
    Compass, 
    PieChart, 
    ShieldCheck, 
    ShieldAlert, 
    Gavel,
    Database,
    Clock,
    Award
} from 'lucide-react';

export const Globe = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);

export const CURRICULUM_PHASES = [
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
        icon: LineChart,
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

// Fully Expanded 25-Module Structured Systematic Wealth Builder (SIP)
export const SIP_CURRICULUM = [
    {
        name: 'Phase 1 — Compounding Dynamics & Fundamentals',
        icon: Target,
        modules: [
            {
                id: 'sip-1',
                title: 'Module 1: The Automated Compounding Engine',
                level: 'Beginner', duration: '15 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'Harnessing Continuous Growth',
                        content: `A Systematic Investment Plan (SIP) is the primary automation vehicle for recurring retail capital growth.

### ⏳ The Real Value of Time

* **Time-Horizon Dominance**: Starting earlier with smaller capital outstrips larger, delayed capitals by massive mathematical factors.
* **Rupee Cost Averaging**: Eliminating market timing risk. High markets buy few units, low markets buy heavy units, creating excellent mean-weighted acquisition costs.
* **Dopamine Management**: Automated transfers remove the psychological anxiety of watching daily market fluctuations.`
                    }
                ]
            },
            {
                id: 'sip-2',
                title: 'Module 2: The Math Framework: Rule of 72, 114 & 144',
                level: 'Beginner', duration: '15 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Speed Calculations for Capital',
                        content: `Professional planning demands quick rules to understand compounding velocity.

### 📊 Critical Compound Math

* **Rule of 72**: Divide 72 by expected yield to find the years needed to **Double** your principal.
* **Rule of 114**: Calculate years to **Triple** your capital value.
* **Rule of 144**: Predicts the exact time horizon needed to **Quadruple** your wealth.`
                    }
                ]
            },
            {
                id: 'sip-3',
                title: 'Module 3: Designing Step-Up (Top-Up) SIP Architectures',
                level: 'Beginner', duration: '15 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Compound Accelerators',
                        content: `Standard SIPs are good, but dynamic Step-Ups supercharge freedom timelines.

### 🚀 Scaled Wealth Velocity

* **Income Parity**: Linearly scale monthly deposits annually by 10%-15% aligned with career increments.
* **Terminal Wealth Impact**: A ₹10k standard monthly SIP over 20 years yields ₹98 Lakhs. A 10% annual Step-Up yields over ₹2.05 Crores!
* **Zero Friction Integration**: Modern platforms allow scheduling automatic yearly percentage escalations.`
                    }
                ]
            },
            {
                id: 'sip-4',
                title: 'Module 4: Smart Flex & Pause Configurations',
                level: 'Beginner', duration: '20 Mins',
                icon: Zap,
                topics: [
                    {
                        title: 'Configurable Systematic Architectures',
                        content: `Dynamic financial states require adaptive engines to prevent compound breaking.

### ⚙️ Smart Overrides

* **The Pause Protocol**: Stop contributions for up to 3-6 months during temporary liquidity crunch, without stopping accumulated compounding units.
* **Dynamic Flexible Mode**: Automated scale-down during high business overhead seasons and automated scale-up during cash-flush seasons.`
                    }
                ]
            },
            {
                id: 'sip-5',
                title: 'Module 5: Trigger-Based & Value-Averaging VIPS',
                level: 'Beginner', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Conditional Execution SIPs',
                        content: `VIPS (Value Investment Plans) apply logical triggers directly to systemic deployments.

### 🧠 Algorithmic Investing

* **Index Triggers**: E.g. Deploy additional 50% allocation if Nifty Corrections exceed 5% in 10 days.
* **Value Averaging**: Investing more when valuations (PE) are cheap, and cutting deployable size when market valuations swell.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Equity SIP Classifications',
        icon: Compass,
        modules: [
            {
                id: 'sip-6',
                title: 'Module 6: Large-Cap SIP Bluechips',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Defensive Wealth Columns',
                        content: `Constructing the resilient foundation of the systematic portfolio.

### 🛡️ Large-Cap Core

* **Low Volatility**: Deploys in top 100 NSE companies. Lower corrections, high stability.
* **Mean Return Predictability**: Solid historical track records with consistent defensive dividends.`
                    }
                ]
            },
            {
                id: 'sip-7',
                title: 'Module 7: Mid-Cap Growth Multipliers',
                level: 'Intermediate', duration: '20 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Mid-Range Expansion Engines',
                        content: `Acquiring high potential market participants ranked 101-250.

### 📈 Growth Expansion

* **High Beta Yields**: Potential for superior alpha compared to large caps over a 7+ year cycle.
* **Higher Drawdowns**: Requires strict mental resilience during mid-cycle bear phases.`
                    }
                ]
            },
            {
                id: 'sip-8',
                title: 'Module 8: Small-Cap Alpha Outliers',
                level: 'Intermediate', duration: '25 Mins',
                icon: Gem,
                topics: [
                    {
                        title: 'Explosive Wealth Growth',
                        content: `Navigating direct small enterprise capital deployments.

### 🌋 Highly Asymmetric Scaling

* **Multi-bagger Vectors**: Deploys from company 251st onward. Massive exponential returns potential.
* **Risk Mitigation**: Must be run only via long-term SIPs to average out sharp 40%+ corrections.`
                    }
                ]
            },
            {
                id: 'sip-9',
                title: 'Module 9: Flexi-Cap Agnostic SIPs',
                level: 'Intermediate', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Dynamic Market Adaptations',
                        content: `Leveraging adaptive fund managers across capitalization bands.

### 🔄 Agnostic Mandates

* **Capital Shift**: Automatic reallocation across Small, Mid, Large Caps by fund managers based on macro cycles.
* **Active Freedom**: Zero SEBI restrictive bounds on cap weightages.`
                    }
                ]
            },
            {
                id: 'sip-10',
                title: 'Module 10: Multi-Asset & Balanced Advantage (BAF)',
                level: 'Intermediate', duration: '20 Mins',
                icon: PieChart,
                topics: [
                    {
                        title: 'Systematic Diversification',
                        content: `Reducing portfolio correlation by pairing equity with debt and gold.

### ⚖️ Balanced Engines

* **Volatility Cushion**: Lowers standard deviation of your returns curve significantly.
* **Arbitrage Yield**: Utilizes derivative cash-futures spreads to deliver stable tax-efficient yields.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 3 — Lifecycle Goal Architectures',
        icon: Briefcase,
        modules: [
            {
                id: 'sip-11',
                title: 'Module 11: Retirement Corpus Modeling',
                level: 'Intermediate', duration: '25 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Securing Financial Freedom',
                        content: `Structuring SIPs to replace active earned income permanently.

### 🏖️ Passive Exit Targets

* **Inflation Adjustment**: Factoring 6-7% annual inflation to ensure future buying power is protected.
* **Sustainment Index**: Aiming for 25x-30x annual expense corpus via dedicated, unbreakable monthly engines.`
                    }
                ]
            },
            {
                id: 'sip-12',
                title: 'Module 12: Child Education & Lifecycle Events',
                level: 'Intermediate', duration: '20 Mins',
                icon: Clock,
                topics: [
                    {
                        title: 'Time-Framed Specific Objectives',
                        content: `Mapping dynamic target years to appropriate asset categories.

### 🎓 Educational Inflation

* **Higher Escalation**: Target education costs generally escalate at 10-12% annually.
* **Syllabus Strategy**: High Equity exposure in initial years, tapering into debt 3 years before collegiate events.`
                    }
                ]
            },
            {
                id: 'sip-13',
                title: 'Module 13: Tax Harvesting & The ELSS Lock-In',
                level: 'Intermediate', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Tax Efficiency Mechanisms',
                        content: `Leveraging Section 80C provisions via the short lock-in Equity Linked Savings Scheme.

### 💸 Tax Shield Alpha

* **Under Section 80C**: Secure deduction for up to ₹1.5 Lakhs of capital deployed per annum.
* **Shortest Tenure**: Possesses a mandatory 3-year lock-in, vastly superior to 15-year PPF or 5-year FDs.`
                    }
                ]
            },
            {
                id: 'sip-14',
                title: 'Module 14: Liquid Fund Emergency Buckets',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Short-Horizon Capital Reserves',
                        content: `Creating high liquidity, low risk reserves for unanticipated life events.

### 🚨 Emergency Guard

* **T-Bills & Call Money**: Investments in secure 91-day government/commercial debt papers.
* **Instant Liquidation**: Online redemption availability with payouts typically in under 24 hours.`
                    }
                ]
            },
            {
                id: 'sip-15',
                title: 'Module 15: International/US Equity Diversifiers',
                level: 'Intermediate', duration: '25 Mins',
                icon: Globe,
                topics: [
                    {
                        title: 'Geographic Non-Correlation',
                        content: `Hedging local market systemic risks by acquiring global technology enterprises.

### 🗺️ Global Reach

* **Currency Hedge**: Captures US Dollar appreciation against local currency INR.
* **Monetary Decoupling**: Insulates a portion of your portfolio from local macro-economic events.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 4 — Ratios, Benchmarks & Costs',
        icon: LineChart,
        modules: [
            {
                id: 'sip-16',
                title: 'Module 16: Rolling Returns vs Point-to-Point',
                level: 'Advanced', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Accurate Performance Auditing',
                        content: `Point-to-point returns are often deceptive. Advanced compounders rely on rolling analysis.

### 🌀 Rolling Metrics

* **True Consistency**: Inspecting 3, 5, or 7-year rolling cycles to view average expected yields across all market entries.
* **Outperformance Ratio**: Evaluating how consistently a fund exceeds its target index across cyclic time blocks.`
                    }
                ]
            },
            {
                id: 'sip-17',
                title: 'Module 17: Deciphering the TER (Expense Ratio)',
                level: 'Advanced', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Minimizing Manager Friction',
                        content: `Understanding the significant long-term impact of daily asset management charges.

### 📉 Expense Friction

* **Compounded Drag**: An extra 1% in TER over 25 years can deplete up to 15-20% of the absolute final terminal corpus.
* **Direct Superiority**: Direct plans bypass distribution fees, granting 0.5% to 1.0% higher CAGR performance.`
                    }
                ]
            },
            {
                id: 'sip-18',
                title: 'Module 18: Evaluating Volatility: Standard Deviation & Beta',
                level: 'Advanced', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Statistical Risk Quantification',
                        content: `Measuring fund variance to understand expected turbulence.

### 📐 Risk Ratios

* **Standard Deviation**: Measures absolute yield variation. Lower variation implies smoother returns.
* **Beta Index**: Measures fund volatility relative to its benchmark index. A beta of 0.8 is defensive; 1.2 is aggressive.`
                    }
                ]
            },
            {
                id: 'sip-19',
                title: 'Module 19: Reward Evaluation: Sharpe & Sortino Ratios',
                level: 'Advanced', duration: '25 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Risk-Adjusted Yield Auditing',
                        content: `High yields mean nothing if the excessive risk is taken to generate them.

### ⚖️ Reward Ratios

* **Sharpe Ratio**: Calculates excess yield per unit of total deviation risk. Higher is infinitely superior.
* **Sortino Index**: Only penalizes negative downside deviations. Provides real-world protection measurement.`
                    }
                ]
            },
            {
                id: 'sip-20',
                title: 'Module 20: Tracking Active Fund Alpha',
                level: 'Advanced', duration: '20 Mins',
                icon: Database,
                topics: [
                    {
                        title: 'Evaluating Portfolio Efficiency',
                        content: `Validating if active management cost generates proportional value.

### 🎯 The Alpha Check

* **Alpha Metrics**: Positive Alpha means fund manager outperformed direct passive index risk-return bounds.
* **When to Switch**: Underperformance for over 4-6 consecutive quarters against Benchmark and Category Avg.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 5 — Professional Exit & SWP Mastery',
        icon: ShieldAlert,
        modules: [
            {
                id: 'sip-21',
                title: 'Module 21: The SWP (Systematic Withdrawal Plan)',
                level: 'Advanced', duration: '30 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Automated Income Engineering',
                        content: `Transitioning accumulated capital into highly tax-efficient monthly salaries.

### 💸 Income Inversion

* **Tax Arbitrage**: SWP withdrawals are taxed as capital gains, not personal income slab rates, creating vast tax alpha.
* **Rupee Cost Harvesting**: Systematically selling few units when market prices are high.`
                    }
                ]
            },
            {
                id: 'sip-22',
                title: 'Module 22: STP (Systematic Transfer Plans) Triggers',
                level: 'Advanced', duration: '25 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Gradual Capital Transitions',
                        content: `Moving lump-sum funds into highly volatile equity gradually to optimize entry.

### 🔄 Transition Mechanics

* **Debt to Equity**: Depositing bulk capital into Liquid/Debt, and scheduling monthly automatic STPs into Equity.
* **De-risking Target**: Reversing STP to shift Equity to Debt 3 years before an established fixed life goal.`
                    }
                ]
            },
            {
                id: 'sip-23',
                title: 'Module 23: Inflation Erosion & Protection Scans',
                level: 'Advanced', duration: '25 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Preserving True Purchasing Power',
                        content: `Evaluating the real rate of return after factoring persistent inflation.

### 🛡️ Value Guard

* **Real Returns**: Nominal yield minus annual CPI Inflation. Standard FDs yield negative real returns.
* **Equity Premium**: Historic capacity of diversified equities to deliver 5-6% real alpha above inflation.`
                    }
                ]
            },
            {
                id: 'sip-24',
                title: 'Module 24: Managing Systematic Portfolio Rebalancing',
                level: 'Crucial', duration: '25 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Restoring Asset Weights',
                        content: `Regularizing equity/debt exposures to limit unintended portfolio drift.

### ⚖️ Drift Protection

* **Systematic Trim**: If dynamic bull markets balloon equity allocation from 60% to 75%, trim 15% back to Debt/Gold.
* **Yearly Cadence**: Conducting asset reviews annually or when drift exceeds 5% thresholds.`
                    }
                ]
            },
            {
                id: 'sip-25',
                title: 'Module 25: Tax Optimization & Long-Term Exits',
                level: 'Crucial', duration: '30 Mins',
                icon: Gavel,
                topics: [
                    {
                        title: 'Statutory Exit Compliance',
                        content: `Exiting wealth structures with maximum legal tax minimization.

### 🏛️ Statutory Exit Shield

* **LTCG Cushion**: Up to ₹1.25 Lakhs of Long-Term capital gains are 100% tax-exempt annually.
* **Tax Harvesting**: Intentionally booking ₹1.25 Lakh gains annually and immediately reinvesting to step-up base cost.`
                    }
                ]
            }
        ]
    }
];

// Fully Expanded 25-Module Mutual Funds Masterclass
export const MUTUAL_FUNDS_CURRICULUM = [
    {
        name: 'Phase 1 — Ecosystem & Industry Infrastructure',
        icon: Database,
        modules: [
            {
                id: 'mf-1',
                title: 'Module 1: AMC Structural Foundations',
                level: 'Beginner', duration: '20 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'Industry Custodian Mapping',
                        content: `Mutual funds are highly regulated conduits pooling public capital.

### 🏗️ Organizational Layers

* **AMC (Asset Management Company)**: The corporate entity designing and executing fund schemes.
* **Trustee Board**: The legal guardians safeguarding investor interest, verifying AMC policies.
* **Custodian (Banks)**: Third-party vaults physically holding client securities to eliminate internal theft.`
                    }
                ]
            },
            {
                id: 'mf-2',
                title: 'Module 2: Demystifying NAV & Pricing Mechanics',
                level: 'Beginner', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Net Asset Value Computation',
                        content: `Decoding the underlying price per unit of a mutual scheme.

### 📐 Daily Valuations

* **Formula Math**: *(Current Market Value of Assets - Statutory Liabilities) / Units Outstanding*.
* **Cut-off Times**: Exact transaction times dictating whether you receive Today's NAV or Tomorrow's NAV.`
                    }
                ]
            },
            {
                id: 'mf-3',
                title: 'Module 3: Direct vs Regular Plan Economics',
                level: 'Beginner', duration: '20 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Eliminating Middlemen Drag',
                        content: `Distinguishing between self-directed and agent-distributed fund architectures.

### ⚖️ Asset Yield Drag

* **Brokerage Commissions**: Regular plans charge up to 1% annual commission directly from your compounding capital.
* **Direct Platform Leverage**: Direct investments grant the exact same assets but compound at higher annual CAGRs.`
                    }
                ]
            },
            {
                id: 'mf-4',
                title: 'Module 4: AUM Scale & Liquidity Thresholds',
                level: 'Beginner', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Sizing the Investment Vessel',
                        content: `Evaluating how massive Assets Under Management (AUM) impact fund agility.

### 📊 Scale Constraints

* **Large-Cap Scale**: Large AUM is highly beneficial, offering vast operational scaling.
* **Small-Cap Friction**: Enormous AUM in small-caps can limit the manager's ability to deploy capital efficiently.`
                    }
                ]
            },
            {
                id: 'mf-5',
                title: 'Module 5: Regulatory Bodies: SEBI & AMFI Roles',
                level: 'Beginner', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Statutory Safety Frameworks',
                        content: `Understanding the oversight ensuring institutional reliability.

### 🏛️ Oversight Columns

* **SEBI**: Apex statutory regulator. Sets stringent category limits and absolute pricing transparency rules.
* **AMFI**: Industry trade body. Configures industry standard certifications and compliance.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Equity Category Deep Dive',
        icon: Compass,
        modules: [
            {
                id: 'mf-6',
                title: 'Module 6: Large-Cap Pillars',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Top 100 Dominance',
                        content: `Stable mandates restricting capital to India's largest corporations.

### 🛡️ Bluechip Core

* **Mandatory Allocation**: Minimum 80% exposure into top 100 capitalized NSE enterprises.
* **Defensive Qualities**: Ideal for capital preservation with moderate upside exposure.`
                    }
                ]
            },
            {
                id: 'mf-7',
                title: 'Module 7: Mid-Cap Dynamics',
                level: 'Intermediate', duration: '20 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Mid-Cycle Growth Capture',
                        content: `Mandates focused on rapid scaling medium corporations.

### 📈 Expanding Frontiers

* **Position Mapping**: Minimum 65% allocation in ranks 101 to 250.
* **Cyclic Volatility**: Delivers explosive alpha during economic expansions, but sharp drawdowns.`
                    }
                ]
            },
            {
                id: 'mf-8',
                title: 'Module 8: Small-Cap Explosion',
                level: 'Intermediate', duration: '25 Mins',
                icon: Gem,
                topics: [
                    {
                        title: 'Emerging Multibagger Vectors',
                        content: `High-risk mandates targeting corporations ranked 251st onwards.

### 🌋 High Asymmetry

* **Extreme Alpha**: Potential for multibagger returns via highly scaling small enterprises.
* **Exit Friction**: Fund managers must maintain higher liquidity buffers to handle potential heavy redemptions.`
                    }
                ]
            },
            {
                id: 'mf-9',
                title: 'Module 9: Multi-Cap vs Flexi-Cap Structuring',
                level: 'Intermediate', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Mandate Comparison Matrix',
                        content: `Decoding structural differences in diversified equity schemes.

### ⚖️ Structural Mandates

* **Multi-Cap**: Legally mandated 25% each in Large, Mid, and Small caps. Balanced risk spread.
* **Flexi-Cap**: Fund manager holds 100% discretion to move weights anywhere based on evaluations.`
                    }
                ]
            },
            {
                id: 'mf-10',
                title: 'Module 10: Value & Contra Styles',
                level: 'Intermediate', duration: '25 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Contrarian Asset Hunting',
                        content: `Acquiring fundamentally sound businesses facing temporary market neglect.

### 🕵️ Anti-Hype Investing

* **Margin of Safety**: Acquiring assets trading below intrinsic value benchmarks.
* **Underperformance Horizon**: Value investing demands immense patience as value realization cycles are long.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 3 — Passives, Factors & ETFs',
        icon: Briefcase,
        modules: [
            {
                id: 'mf-11',
                title: 'Module 11: Passive Investing & The Index Advantage',
                level: 'Intermediate', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Duplicating Market Benchmarks',
                        content: `Passive funds remove human manager biases to duplicate market yields.

### 🧭 Passive Foundations

* **SPIVA Scorecards**: Statistics reveal most active managers fail to exceed Index returns over long cycles.
* **Low Friction**: Minimal expense ratios (0.1% to 0.2%) compared to Active management.`
                    }
                ]
            },
            {
                id: 'mf-12',
                title: 'Module 12: ETF Mechanics & Market Trading',
                level: 'Intermediate', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Exchange Traded Infrastructure',
                        content: `Index funds structured to trade live like individual equities.

### ⚡ Live Liquidity

* **Intraday Tradeability**: Buy and sell instantly on the NSE/BSE throughout the market session.
* **Authorized Participants**: Market makers creating units to ensure ETF price tracks Net Asset Value.`
                    }
                ]
            },
            {
                id: 'mf-13',
                title: 'Module 13: Deciphering Tracking Error',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Measuring Passive Imperfection',
                        content: `Auditing the efficiency of passive/index fund replications.

### 📐 Tracking Gaps

* **Tracking Error**: Measures standard deviation of difference between fund and index yields.
* **Tracking Difference**: Absolute yield underperformance largely due to statutory fund expenses.`
                    }
                ]
            },
            {
                id: 'mf-14',
                title: 'Module 14: Factor & Smart Beta Indices',
                level: 'Intermediate', duration: '25 Mins',
                icon: Zap,
                topics: [
                    {
                        title: 'Rules-Based Alpha Passive',
                        content: `Indices configured on mathematical factor rules rather than capitalization.

### 🧠 Factor Protocols

* **Momentum Factor**: Index of top stocks showing highest price acceleration.
* **Low Volatility Factor**: Index picking highly stable, low-beta defensive corporations.`
                    }
                ]
            },
            {
                id: 'mf-15',
                title: 'Module 15: Sector & Thematic Pitfalls',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Concentrated Risk Domains',
                        content: `Highly volatile funds restricting investments to single distinct sectors.

### 🌋 Sector Focus

* **Cyclical Timing**: Sector funds (e.g., Pharma, Tech) demand precise entry/exit timing.
* **No Diversification**: Fails to offer standard mutual fund protections during sector downturns.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 4 — Debt, Arbitrage & Hybrids',
        icon: LineChart,
        modules: [
            {
                id: 'mf-16',
                title: 'Module 16: Liquid & Overnight Safety',
                level: 'Advanced', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Short Horizon Capital Sentry',
                        content: `The safest and most liquid segments of the mutual fund environment.

### 🛡️ Cash Equivalents

* **Overnight Schemes**: Invest in secure debt maturing in a single business day. Lowest risk.
* **Liquid Funds**: Invest in papers maturing under 91 days. High safety parking reservoir.`
                    }
                ]
            },
            {
                id: 'mf-17',
                title: 'Module 17: Duration Risk & Gilt Funds',
                level: 'Advanced', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Interest Rate Sensitivity',
                        content: `Evaluating debt assets that fluctuate wildly with Central Bank Repo Rates.

### 📈 Interest Cycles

* **Inverse Correlation**: When interest rates drop, existing long-term Gilt prices rise sharply.
* **Duration Metrics**: Measures how sensitive a debt portfolio's valuation is to rate shifts.`
                    }
                ]
            },
            {
                id: 'mf-18',
                title: 'Module 18: Credit Risk Mechanics',
                level: 'Advanced', duration: '25 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Corporate Default Assessments',
                        content: `Analyzing funds lending money to low credit rated corporations for higher yields.

### ⚖️ Default Risk

* **Yield Seeking**: Acquiring corporate papers rated AA, A, or BBB to capture yield spreads.
* **Illiquidity Trap**: Low-grade papers can become impossible to liquidate during credit crises.`
                    }
                ]
            },
            {
                id: 'mf-19',
                title: 'Module 19: Balanced Advantage (BAF) Dynamic Shifts',
                level: 'Advanced', duration: '25 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Automated Dynamic Rebalancing',
                        content: `Dynamic asset allocation funds utilizing internal Valuation Models.

### ⚖️ Valuation Cushion

* **Greed & Fear Logic**: Deploys heavily in Debt during equity peaks, and buys heavy Equity during crashes.
* **Risk Softening**: Smoothens the portfolio ride significantly for conservative retail participants.`
                    }
                ]
            },
            {
                id: 'mf-20',
                title: 'Module 20: Arbitrage Funds & Tax Play',
                level: 'Advanced', duration: '25 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Risk-Free Yield Harnessing',
                        content: `Simultaneously buying equity and selling futures to lock in spreads.

### 🛡️ Arbitrage Shield

* **Market Neutral**: Completely protected against directional equity crashes.
* **Tax Alpha**: Treated legally as Equity taxation, offering vast yields above bank savings.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 5 — Advanced Portfolio Picking & Tax',
        icon: ShieldAlert,
        modules: [
            {
                id: 'mf-21',
                title: 'Module 21: Auditing Fund Management Quality',
                level: 'Advanced', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Manager Continuity Scans',
                        content: `Ensuring the core human decision architect remains sound.

### 👨‍💼 Manager Auditing

* **Track Records**: Inspecting the manager's historical performance across different AMCs.
* **Skin In The Game**: Verifying if AMC executives invest their personal capital in the scheme.`
                    }
                ]
            },
            {
                id: 'mf-22',
                title: 'Module 22: Portfolio Turnover Ratio (PTR)',
                level: 'Advanced', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Auditing Transaction Costs',
                        content: `Measuring how frequently the fund manager buys/sells underlying assets.

### 🔄 Turnover Drag

* **High PTR**: Indicates active churning/trading. Increases operational costs hidden from TER.
* **Low PTR**: Indicates conviction and buy-and-hold institutional management.`
                    }
                ]
            },
            {
                id: 'mf-23',
                title: 'Module 23: Advanced Concentration Limits',
                level: 'Advanced', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Single Stock Exposure Risk',
                        content: `Evaluating how dependent a fund is on a tiny subset of holdings.

### 📊 Concentration Scans

* **Top 10 Weight**: Verifying percentage of assets locked in top 10 corporate stocks.
* **Over-concentration**: Avoids single enterprise defaults destroying portfolio values.`
                    }
                ]
            },
            {
                id: 'mf-24',
                title: 'Module 24: Equity Taxation Mastery (STCG/LTCG)',
                level: 'Crucial', duration: '30 Mins',
                icon: Gavel,
                topics: [
                    {
                        title: 'Equity Statutory Slabs',
                        content: `Indian tax code compliance on realized mutual scheme gains.

### 🏛️ Equity Slabs

* **STCG (<12 months)**: Flat **20%** realized gain tax.
* **LTCG (>12 months)**: Taxed at **12.5%** on realized gains exceeding standard ₹1.25 Lakhs exempt buffer.`
                    }
                ]
            },
            {
                id: 'mf-25',
                title: 'Module 25: Debt Taxation & Corporate Rules',
                level: 'Crucial', duration: '30 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Fixed Income Statutory Compliance',
                        content: `Navigating regulatory tax changes on debt-oriented assets.

### 💸 Debt Realization

* **Slab Inversion**: New rules dictate debt mutual realizations are added to personal taxable income.
* **Tax Shield Need**: Arbitrage schemes and Hybrid equity structures are now critical to reduce debt tax drag.`
                    }
                ]
            }
        ]
    }
];

// Fully Expanded 25-Module Alternative Wealth & Debt
export const WEALTH_CURRICULUM = [
    {
        name: 'Phase 1 — Sovereign Instruments & Safe Debt',
        icon: ShieldCheck,
        modules: [
            {
                id: 'w-1',
                title: 'Module 1: The Gold Standard & Sovereign Gold Bonds (SGB)',
                level: 'Beginner', duration: '20 Mins',
                icon: BookOpen,
                topics: [
                    {
                        title: 'Institutional Digital Gold',
                        content: `SGBs represent the ultimate sovereign wealth diversification instrument.

### 🏅 The SGB Supremacy

* **RBI Assurance**: Backed directly by the Government of India. Sovereign default risk is zero.
* **Dual Earning Channel**: Capture 100% of gold price appreciation plus a guaranteed **2.5% annual coupon interest**.
* **Tax Arbitrage**: Holding to the full 8-year maturity yields **100% Tax-Exempt** Long Term Capital Gains.`
                    }
                ]
            },
            {
                id: 'w-2',
                title: 'Module 2: Corporate Fixed Deposits (NBFC)',
                level: 'Beginner', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Unsecured Corporate Income',
                        content: `Securing yield spreads above public banking rates via private placements.

### 🏢 Corporate Yields

* **Spread Premium**: Typically yields 1.5% to 2.5% above traditional state bank deposits.
* **Safety Filter**: Ensure you exclusively deploy in AAA or AA+ rated non-banking financial companies.`
                    }
                ]
            },
            {
                id: 'w-3',
                title: 'Module 3: Non-Convertible Debentures (NCD)',
                level: 'Beginner', duration: '20 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'Tradable Fixed Debt',
                        content: `Long-term corporate debt instruments registered on stock exchanges.

### 📊 Debt Listing

* **Coupon Payments**: Offers highly predictable monthly, quarterly, or annual cash flows.
* **Market Liquidity**: Listed NCDs can be traded prior to maturity on NSE/BSE secondary platforms.`
                    }
                ]
            },
            {
                id: 'w-4',
                title: 'Module 4: Government G-Secs & Treasury Bills',
                level: 'Beginner', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Lending to the Sovereign',
                        content: `Directly financing Central Government capital requirements.

### 🏛️ National Paper

* **T-Bills**: Short term bills issued for 91, 182, or 364 day horizons. Issued at discounts.
* **G-Secs**: Long-horizon dated government bonds delivering semi-annual coupon cash.`
                    }
                ]
            },
            {
                id: 'w-5',
                title: 'Module 5: RBI Floating Rate Savings Bonds',
                level: 'Beginner', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Dynamic Interest Rate Hedges',
                        content: `Safeguarding against inflationary shifts via floating coupon yields.

### ⚖️ Dynamic Coupons

* **NSC Benchmarks**: Yields are reset semi-annually, pegged at a fixed 0.35% premium above NSC rates.
* **Inflation Cover**: Coupons automatically scale up during broader economic rate-hiking cycles.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 2 — Real Estate & Yield Infrastructures',
        icon: Compass,
        modules: [
            {
                id: 'w-6',
                title: 'Module 6: Real Estate Investment Trusts (REITs)',
                level: 'Intermediate', duration: '25 Mins',
                icon: Briefcase,
                topics: [
                    {
                        title: 'Fractional Trophy Asset Ownership',
                        content: `REITs function as mutual funds for institutional-grade commercial real estate.

### 🏢 Grade-A Property

* **Dividend Mandate**: Legally forced to distribute minimum **90% of Net Distributable Cash Flows** back to holders.
* **Capital Appreciation**: Enjoys commercial property valuation escalations over time.`
                    }
                ]
            },
            {
                id: 'w-7',
                title: 'Module 7: Infrastructure Investment Trusts (InvITs)',
                level: 'Intermediate', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Owning National Infrastructure',
                        content: `Instruments pooling capital to operate revenue-producing toll roads and power grids.

### 🛣️ National Arteries

* **Predictable Flows**: Gains stable cash derived from statutory toll fees and regulated electricity transmissions.
* **High Yield Spreads**: Typically delivers higher yields compared to REITs to compensate for asset concession risks.`
                    }
                ]
            },
            {
                id: 'w-8',
                title: 'Module 8: Fractional Commercial Real Estate Platforms',
                level: 'Intermediate', duration: '25 Mins',
                icon: Gem,
                topics: [
                    {
                        title: 'Tokenized Tech Parks',
                        content: `Direct crowd-sourced ownership of specific premium office buildings.

### 🏢 Tech Warehousing

* **Grade Asset Specificity**: Allows pick-and-choose fractional investing in single tenant corporate assets.
* **High Entry Barriers**: High typical entry minimums compared to publicly traded stock market REITs.`
                    }
                ]
            },
            {
                id: 'w-9',
                title: 'Module 9: Real Estate vs Equity Cycles',
                level: 'Intermediate', duration: '20 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Cyclical Diversification',
                        content: `Navigating long-duration real estate expansion and contraction phases.

### ⚖️ Cycle Drift

* **Macro Divergence**: Real estate cycles typically stretch 10-12 years, decoupled from shorter stock volatility.
* **Inflation Pass-through**: Commercial rent escalations are generally written to track wholesale inflation indexes.`
                    }
                ]
            },
            {
                id: 'w-10',
                title: 'Module 10: Liquidity Disconnects in Real Assets',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Evaluating Real Exit Frictions',
                        content: `Recognizing the exit time requirements when dealing with physical-adjacent assets.

### ⏳ Exit Friction

* **Direct Exit Deficit**: Hard property can take months or years to liquidate in a bear phase.
* **The REIT Override**: Listed REITs bypass this, allowing instantaneous liquidation via market exchanges.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 3 — Hard Metal & Gold Structures',
        icon: Gem,
        modules: [
            {
                id: 'w-11',
                title: 'Module 11: The Safe Haven: Physical Gold Mechanics',
                level: 'Intermediate', duration: '20 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Primal Hard Assets',
                        content: `Direct physical bullion as a defense against fiat currency collapse.

### 🏅 Bullion Defense

* **Making Charges**: Physical jewelry carries 8-20% waste charges. Direct bars/coins are superior.
* **Storage Friction**: Demands secure storage vaults and insurance premiums to prevent loss.`
                    }
                ]
            },
            {
                id: 'w-12',
                title: 'Module 12: Digital Gold Ecosystem & Custodians',
                level: 'Intermediate', duration: '20 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Secured Micro-Savings',
                        content: `Mobile enabled digital custody of fractional physical gold.

### ⚡ Micro Gold

* **Fractional Access**: Buy gold starting from as low as ₹1.
* **Custodial Spreads**: Higher buy/sell price spreads compared to stock market gold ETFs.`
                    }
                ]
            },
            {
                id: 'w-13',
                title: 'Module 13: Gold ETFs & Stock Market Liquidity',
                level: 'Intermediate', duration: '20 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Exchange Gold Infrastructure',
                        content: `Securities representing physical 99.5% pure gold trading on the stock market.

### 📊 Gold Listing

* **Total Transparency**: Eliminates storage worries and purity concerns entirely.
* **Tight Spreads**: The most liquid, low-friction way to trade short term gold cycles.`
                    }
                ]
            },
            {
                id: 'w-14',
                title: 'Module 14: Gold Mutual Funds',
                level: 'Intermediate', duration: '20 Mins',
                icon: Compass,
                topics: [
                    {
                        title: 'Systematic Gold Exposure',
                        content: `Mutual fund units investing in underlying Gold ETFs.

### ⏳ Gold Systematic

* **Demat Not Required**: Permits automated gold accumulation SIPs directly from savings accounts.
* **Compounded Asset**: Seamlessly accumulates gold wealth over long horizons.`
                    }
                ]
            },
            {
                id: 'w-15',
                title: 'Module 15: Silver ETFs & Industrial Metal Dynamics',
                level: 'Intermediate', duration: '25 Mins',
                icon: TrendingUp,
                topics: [
                    {
                        title: 'High Beta Precious Metals',
                        content: `Navigating silver as both a precious safe-haven and vital industrial metal.

### ⛓️ Industrial Correlation

* **High Volatility**: Silver experiences sharper rallies and corrections compared to gold.
* **Solar/EV Needs**: Industrial fabrication demand creates deep cyclical valuation runs.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 4 — Modern Alt-Platforms & Debt',
        icon: Briefcase,
        modules: [
            {
                id: 'w-16',
                title: 'Module 16: Peer-to-Peer (P2P) Lending Systems',
                level: 'Advanced', duration: '25 Mins',
                icon: ShieldAlert,
                topics: [
                    {
                        title: 'Crowdsourced Personal Credit',
                        content: `Disintermediating banks to lend capital directly to diversified consumer pools.

### ⚡ Crowd Lending

* **High Yield**: Potential for 10%-12% annual yields via micro-loan pools.
* **Default Scans**: Strict credit diversification across hundreds of borrowers is mandatory to absorb inevitable defaults.`
                    }
                ]
            },
            {
                id: 'w-17',
                title: 'Module 17: Invoice Discounting Platforms',
                level: 'Advanced', duration: '25 Mins',
                icon: Activity,
                topics: [
                    {
                        title: 'Supply Chain Capital Optimization',
                        content: `Purchasing bluechip corporate invoices at discounts for short-term payouts.

### 🏢 Working Capital

* **Short Horizons**: Extremely short cycles ranging typically from 30 to 90 days.
* **Enterprise Security**: Repayment dependent on the credit rating of the large paying corporate.`
                    }
                ]
            },
            {
                id: 'w-18',
                title: 'Module 18: Lease Financing Platforms',
                level: 'Advanced', duration: '25 Mins',
                icon: Zap,
                topics: [
                    {
                        title: 'Asset-Backed Equipment Yields',
                        content: `Fractionally buying machinery/vehicles and leasing to companies for monthly rental income.

### ⚙️ Asset Backed

* **Physical Underlying**: If the company defaults, the hard machinery can be repossessed.
* **Taxation Slabs**: Payouts often contain a mix of principal refund and taxable rent income.`
                    }
                ]
            },
            {
                id: 'w-19',
                title: 'Module 19: Target Maturity Debt Funds (TMF)',
                level: 'Advanced', duration: '25 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Passive Indexed Fixed Income',
                        content: `Passive debt funds holding sovereign/AAA assets until a fixed maturity date.

### ⏳ Maturity Locks

* **Duration Predictability**: Eliminates rate volatility if you hold the fund until its pre-defined target year.
* **High Credit Quality**: Exclusively deploys in central G-Secs, SDLs, and AAA PSUs.`
                    }
                ]
            },
            {
                id: 'w-20',
                title: 'Module 20: Venture Debt & High-Yield Structures',
                level: 'Advanced', duration: '30 Mins',
                icon: Gem,
                topics: [
                    {
                        title: 'Financing High-Growth Startups',
                        content: `Debt provided to VC-backed startups, pairing fixed interest with equity upside warrants.

### 🌋 Hybrid Risk

* **Interest + Equity**: Predictable cash yields plus warrants that capture massive startup equity valuation hits.
* **Startup Friction**: Risk of absolute loss if startup fails to secure subsequent funding rounds.`
                    }
                ]
            }
        ]
    },
    {
        name: 'Phase 5 — Portfolio Anti-Fragility & Rebalancing',
        icon: LineChart,
        modules: [
            {
                id: 'w-21',
                title: 'Module 21: The All-Weather Asset Framework',
                level: 'Advanced', duration: '30 Mins',
                icon: ShieldCheck,
                topics: [
                    {
                        title: 'Surviving All Macro Seasons',
                        content: `Designing a structurally diversified framework immune to singular economic collapses.

### ⚖️ Macro Seasons

* **The 4 Seasons**: Inflation, Deflation, Economic Growth, Economic Stagnation.
* **Asset Mapping**: Gold shields against inflation; Stocks capture growth; T-Bills shield deflation.`
                    }
                ]
            },
            {
                id: 'w-22',
                title: 'Module 22: Sovereign Credit Risk Evaluation',
                level: 'Advanced', duration: '25 Mins',
                icon: Scale,
                topics: [
                    {
                        title: 'Assessing National Safety',
                        content: `Understanding credit parameters set by global rating agencies (S&P, Moody's).

### 🏛️ Sovereign Balance

* **Fiscal Deficits**: Evaluating the national borrowing levels against Gross Domestic Product.
* **Forex Reserves**: Strong reserves safeguard central currency against global market contagion.`
                    }
                ]
            },
            {
                id: 'w-23',
                title: 'Module 23: Cross-Asset Rebalancing Protocols',
                level: 'Advanced', duration: '25 Mins',
                icon: Layers,
                topics: [
                    {
                        title: 'Portfolio Weight Audits',
                        content: `Tactical reallocation protocols deployed to restrict portfolio risk creep.

### 🔄 Asset Trim

* **Anti-Cyclic Action**: Trim winning assets that became overweight and buy depressed, undervalued asset classes.
* **Dynamic Thresholds**: Execute rebalancing when any asset class drifts past 10% of its targeted weight.`
                    }
                ]
            },
            {
                id: 'w-24',
                title: 'Module 24: Tax Management Across Alt-Buckets',
                level: 'Crucial', duration: '30 Mins',
                icon: Gavel,
                topics: [
                    {
                        title: 'Complex Income Compliance',
                        content: `Navigating distinct tax laws applied to various non-traditional payouts.

### 🏛️ Alt Tax Compliance

* **P2P & Lease Tax**: Usually treated as Other Income taxed at your personal highest slab.
* **REIT Dividends**: Subject to intricate rules depending on SPV taxation structures.`
                    }
                ]
            },
            {
                id: 'w-25',
                title: 'Module 25: Deep Strategic Cash Management',
                level: 'Crucial', duration: '30 Mins',
                icon: Target,
                topics: [
                    {
                        title: 'Preserving Buying Power Dry Powder',
                        content: `Maintaining strategic opportunistic liquidity ready to exploit generational market crashes.

### 🚨 Dry Powder

* **Capital Readiness**: Keeping 10%-15% allocation in Liquid Funds waiting purely for equity corrections.
* **Greed Protocol**: Deploying cash systematically when public panic peaks and stock valuations fall below historical averages.`
                    }
                ]
            }
        ]
    }
];
