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

import {
    CRYPTO_CURRICULUM,
    BITCOIN_CURRICULUM,
    BitcoinIcon
} from './BusinessCryptoData';


// Config Registry for Integrated Wealth Academies
const ACADEMIES = {
    trading: {
        title: 'Enterprise Trading Academy',
        subtitle: 'Learn how to trade and invest in the stock market with confidence using simple, practical step-by-step guides.',
        gradient: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)',
        shadow: 'rgba(6, 78, 59, 0.2)',
        icon: LineChart,
        curriculum: CURRICULUM_PHASES,
        tag: 'Stock Trading',
        desc: 'A complete 25-lesson course to master reading stock charts, analyzing company financials, and learning easy trading strategies.'
    },
    sip: {
        title: 'SIP Wealth Builder',
        subtitle: 'Grow your wealth automatically and consistently over time using disciplined investment plans.',
        gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        shadow: 'rgba(30, 58, 138, 0.2)',
        icon: TrendingUp,
        curriculum: SIP_CURRICULUM,
        tag: 'SIP & Compounding',
        desc: 'Discover how to set up systematic plans, automatically increase your savings monthly, and use compounding to reach your goals.'
    },
    mutual_funds: {
        title: 'Mutual Funds Masterclass',
        subtitle: 'Learn how to choose the best mutual funds to safely grow your money and beat inflation.',
        gradient: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)',
        shadow: 'rgba(91, 33, 182, 0.2)',
        icon: PieChart,
        curriculum: MUTUAL_FUNDS_CURRICULUM,
        tag: 'Mutual Funds',
        desc: 'An easy-to-follow masterclass on picking top-performing funds, understanding index funds, and reducing investment fees.'
    },
    more: {
        title: 'Alternative Assets & Debt',
        subtitle: 'Explore safe ways to invest in gold, government bonds, and commercial property for steady income.',
        gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
        shadow: 'rgba(146, 64, 14, 0.2)',
        icon: Gem,
        curriculum: WEALTH_CURRICULUM,
        tag: 'Gold & Safe Bonds',
        desc: 'A professional guide to earning stable returns from secure government schemes, gold bonds, and rental real estate.'
    },
    crypto: {
        title: 'Crypto & Web3 Essentials',
        subtitle: 'Master the basics of blockchain, DeFi lending, and digital currencies with direct step-by-step modules.',
        gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        shadow: 'rgba(79, 70, 229, 0.2)',
        icon: Activity,
        curriculum: CRYPTO_CURRICULUM,
        tag: 'Crypto & Web3',
        desc: 'An actionable 25-lesson course explaining Smart Contracts, Decentralized Exchanges, and Indian crypto tax rules.'
    },
    bitcoin: {
        title: 'Bitcoin Masterclass',
        subtitle: 'A foundational guide to Bitcoin security, self-custody, and macroeconomics for long-term capital.',
        gradient: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
        shadow: 'rgba(217, 119, 6, 0.2)',
        icon: BitcoinIcon,
        curriculum: BITCOIN_CURRICULUM,
        tag: 'Bitcoin Hard Money',
        desc: 'A professional 25-lesson curriculum detailing Bitcoin Mining, the 21M Hard Cap, and cold storage wallets.'
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

    // Systematic Curriculum Content Expansion Engine
    const enrichTopicContent = (academyKey, moduleTitle, topicTitle, baseContent) => {
        if (!baseContent) return "";
        
        let deepDive = "";
        let strategyFramework = "";
        let actionablePlaybook = "";
        let analyticalGlossary = "";
        
        if (academyKey === 'trading') {
            deepDive = `### 📊 Advanced Market Mechanics & Core Technical Theories
            
In the professional arena of capital speculation, mastering **${topicTitle}** demands an acute structural understanding of exchange microstructure. In Indian financial bourses like the NSE and BSE, every tick you witness is processed by a high-speed Electronic Limit Order Book (ELOB), matching incoming buy and sell intentions instantaneously based on price-time priority queues. Traders who execute without considering variables like depth of market, systemic liquidity profiles, slippage, or transaction impact costs are statistically destined to consistently underperform index benchmarks over long time horizons. When incorporating **${topicTitle}** into your routines, you must utilize institutional-grade statistical models to evaluate key resistance thresholds, historical supply buffers, and structural trend direction before committing capital to any intraday position or overnight swing-trade cycle. This guarantees your strategies are derived from validated empirical probability distributions rather than arbitrary discretionary guesses.

Furthermore, professional prop-desk operators employ volume-weighted diagnostics to augment signal validity. Volume-Weighted Average Price (VWAP) represents a critical moving anchor indicating the true 'fair market value' of professional accumulation or distribution activities. When evaluating setups related to **${topicTitle}**, checking if current prints stand above or below VWAP filters out high-risk counter-trend entries. Advanced systems also integrate derivative flow diagnostics, such as dynamic changes in Open Interest (OI), option chain Call-Put Ratio (PCR) shifts, and fluctuations in standard implied volatility (IV) skews. Combining these rich multi-dimensional data sets with the core concepts of **${topicTitle}** provides an unassailable structural edge, isolating real capital breakouts from deceptive low-volume institutional trap movements. Risk management in these scenarios is not about the impossible goal of avoiding losses entirely, but rather engineering highly asymmetric 1:3 Risk-to-Reward payoff models where your calculated gains mathematically dwarf inevitable operational drawdowns across iterative cycles of hundreds of trades.`;

            strategyFramework = `### 📈 Institutional 5-Step Step-by-Step Action Playbook

To successfully operationalize **${topicTitle}** within an active risk portfolio, professional desk specialists enforce the following standardized execution playbook with mechanical discipline:

1. **Pre-Market Scan & Liquidity Filter**: Every morning between 8:45 AM and 9:10 AM, scan the high-beta Nifty 500 constituents exhibiting high gap-up/down volumes. Filter out illiquid penny counters to shield yourself from execution slippage hazards.
2. **Top-Down Sectoral Confirmation**: Verify whether the specific sectoral index (e.g., Nifty IT, Nifty Bank, Nifty Auto) matches your stock direction. Sectoral tailwinds elevate average trade expectancy by up to 35% according to historical desk data.
3. **Intraday Signal Validation**: Once your specific trigger for **${topicTitle}** resolves on a 15-minute operational chart, require an accompanying volume bar exceeding the 20-period Exponential Moving Average by at least 150% before deploying.
4. **Absolute Risk Positioning**: Limit your maximum financial exposure per single transaction to no more than 1.25% of total account capital. Determine specific share quantity limits by measuring the absolute technical distance between entry and your stop-loss level.
5. **Tiered Escalated Scaling**: Secure 50% of your gross positional gains once the counter delivers a 1:2 initial Risk-to-Reward ratio. Adjust the remaining balance's stop-loss to breakeven, trailing the remnant using the 20-period EMA to capture potential runaway trend rallies.`;

            actionablePlaybook = `### ⚠️ Critical Execution Hazards & Common Behavioral Traps

The road to sustainable market profitability is continuously littered with psychological and technical pitfalls that quickly erode the bases of under-capitalized retail operations. When integrating the teachings of **${topicTitle}**, remain highly vigilant against these classic tactical failures:

* **Destructive Over-Leverage Syndrome**: Brokers frequently extend up to 5x intraday margin (MIS products). While leverage dramatically multiplies prospective rewards, it equally speeds the mathematics of absolute ruin. Keep positional scaling constant regardless of leverage availability.
* **Revenge Trading & Over-Trading Impulse**: Following a verified stop-loss exit, emotional impulses often trigger rapid, uncalculated entries to 'win back' lost funds. Professional systems enforce a '3-Strikes' daily rule: three consecutive losses mandate an immediate platform logout for the remainder of the calendar session.
* **Premature Profit Harvesting**: Retail participants frequently cut winning setups early due to fear of retracement while stubbornly holding losing positions hoping for recovery. To win long-term, your average winning transaction value must strictly exceed your average losing transaction value.
* **Neglecting Cumulative Friction Overheads**: Transaction taxes (STT), stamp duties, SEBI regulatory levies, GST, and basic broker commissions add up silently. On high-frequency systems, these frictional costs can cannibalize up to 40% of raw gross returns if average wins are small.
* **Neglecting Trade Journal Analytics**: Failing to document the exact technical trigger, emotional context, slippage, and eventual exit of every position relating to **${topicTitle}** limits optimization. Regular weekend reviews of performance metrics are the sole driver of systematic iterative improvement.`;

            analyticalGlossary = `### 📘 Advanced Pro-Trader Knowledge Matrix & Glossary

* **Market Profile & Point of Control (POC)**: A sophisticated charting study mapping trading volume relative to specific price levels rather than time intervals, revealing where heavy institutional distribution took place.
* **Average True Range (ATR)**: The absolute volatility indicator used by professional algorithms to formulate dynamic, volatility-adjusted stop-losses instead of static arbitrary percentages.
* **Beta Metric Analysis**: A statistical calculation measuring a particular equity's systematic volatility relative to the Nifty 50. Low-beta stocks offer safe harbor, while high-beta names provide explosive momentum.
* **Pivot Point Support/Resistance**: Forward-looking mathematical indicator lines calculated using yesterday's high, low, and closing values, serving as institutional floors and ceilings for live traders.
* **Sharpe & Sortino Performance Ratios**: Essential diagnostic tools calculating your portfolio's risk-adjusted returns. Sustained positive ratios confirm your profits are derived from actual edge rather than reckless exposure.

Adhering to these rigorous operational protocols transforms active trading from a random game of chance into an industrialized, process-driven wealth generation mechanism. Consistently audit your execution against these parameters to ensure enduring long-term survivability in global capital markets.`;
        } else if (academyKey === 'crypto' || academyKey === 'bitcoin') {
            deepDive = `### 🔐 Decentralized Systems Architecture & Blockchain Integrity

Within the non-sovereign financial frontier, achieving mastership of **${topicTitle}** necessitates a comprehensive grasp of foundational cryptographic and network consensus theories. Public blockchains utilize distributed, peer-to-peer append-only ledgers secured by cryptographic hashing algorithms (such as SHA-256) that link discrete transaction blocks into immutable chronological chains. In systems executing **${topicTitle}**, absolute security and censorship resistance are derived not from centralized institutions, but from decentralized consensus mechanisms like Proof of Work (PoW) or Proof of Stake (PoS). These trustless protocols force network participants to deploy computational or capital resources to secure the network against debilitating vectors such as double-spend exploits or 51% sybil attacks.

Furthermore, programmatic supply mechanics serve as a hard-coded algorithmic monetary policy completely decoupled from the discretionary intervention of central banking authorities. Variables like global network hashrate, block difficulty readjustments, and scheduled emission halvings directly regulate the supply dynamics of assets like Bitcoin. The unalterable 21-million Bitcoin supply limit represents the genesis of digital scarcity, contrasting sharply with legacy fiat frameworks that undergo continuous devaluation via quantitative easing expansion cycles. When utilizing **${topicTitle}**, one must view on-chain data—such as active address growth, hash-ribbon cycles, and long-term holder accumulation metrics—to diagnose real underlying network velocity and supply absorption rates.

Finally, layer-1 scaling solutions and fee optimization models represent critical operational dimensions. Analyzing network throughput bottlenecks, Gas limit economics (like Ethereum's EIP-1559 burn mechanic), and off-chain scalability engines (like the Bitcoin Lightning Network) empowers operators to minimize friction. Executing transactions without analyzing current Mempool congestion directly results in exorbitant fee payments, delayed state confirmations, and suboptimal trade fills across decentralized finance (DeFi) protocols.`;

            strategyFramework = `### 🛠️ Professional Cryptosecurity & Self-Custody Playbook

To safely and effectively deploy investment resources toward digital assets and **${topicTitle}**, standard operating procedures call for the following hardened architectural framework:

1. **Absolute Cold-Storage Custody**: Never maintain significant asset balances on centralized crypto exchanges (CEXs). Utilize dedicated hardware security modules (like Ledger or Trezor) to maintain absolute control of your private keys. Remember the cardinal crypto law: 'Not your private keys, not your crypto assets.'
2. **Recovery Seed Phrase Hardening**: Document your 24-word recovery seed offline using industrial-grade steel plates to guard against fire or water destruction. Never transcribe or store your recovery words on digital devices connected to the internet.
3. **Comprehensive Smart Contract Audit**: Before allocating liquidity to any decentralized exchange (DEX) or yield aggregator, verify third-party codebase audits and review Total Value Locked (TVL) distribution metrics to protect yourself against rug-pulls.
4. **Transaction Gas Optimization**: Coordinate execution around gas tracker dashboards to broadcast your non-urgent on-chain transactions during historically off-peak windows (like weekends or early mornings) to preserve capital.
5. **Disciplined DCA Accumulation**: Successfully neutralize extreme cryptocurrency volatility by utilizing automated Dollar-Cost Averaging (DCA) tools to acquire fixed rupee amounts of blue-chip digital assets on set schedules, removing emotion from price action.`;

            actionablePlaybook = `### ⚠️ Web3 Attack Vectors & Asset Preservation Guidelines

The trustless landscape operates under rigid 'Code-is-Law' conditions, ensuring all operational errors are completely irreversible and devoid of customer support recourse. Protect your digital holdings during **${topicTitle}** operations from these major hazards:

* **Phishing & Malicious Smart Contract Permits**: Cybercriminals leverage cloned user interfaces to deceive users into granting full 'Allow Unlimited' smart contract permissions, enabling instant wallet draining. Always double-verify exact hex contract addresses using blockchain explorers like Etherscan.
* **Centralized Exchange Insolvency Risks**: Historical crises emphasize that centralized trading desks frequently employ fractional reserves. Restrict exchange presence to transient trading activities only; transfer funds immediately to cold wallets once execution settles.
* **Regulatory & Indian Flat Tax Compliance**: Current Indian tax laws impose an aggressive 30% flat tax on all Virtual Digital Asset (VDA) capital gains, coupled with a mandatory 1% Tax Deducted at Source (TDS) on every transaction. Keep flawless accounting ledgers to satisfy statutory tax authorities.
* **DeFi Systemic & Smart Contract Vulnerabilities**: Complex financial protocols remain susceptible to flash-loan exploits, oracle manipulation, and re-entrancy bugs. Mitigate this risk by limiting protocol-level exposure to highly battle-tested blue-chip platforms.
* **Shilling & Social Media Hype Manipulation**: The digital asset sphere is rife with paid influencer coordination and pump-and-dump schematics. Force every decision regarding **${topicTitle}** to be driven by raw objective data: Github commit activity, block explorer throughputs, and fundamental developer velocity.`;

            analyticalGlossary = `### 📘 Advanced Web3 Technical Knowledge Library

* **Hot Wallets vs. Cold Wallets**: Hot wallets reside on internet-facing browser extensions offering convenient dapp connectivity but higher surface vulnerability. Cold wallets are physical, air-gapped offline hardware generators.
* **Decentralized Exchanges (DEXs)**: Platforms utilizing Automated Market Maker (AMM) protocols that facilitate trustless, direct peer-to-peer token swaps directly between user wallets via smart contracts.
* **Mempool State Diagnostics**: The virtual waiting area where user transactions reside before being selected, verified, and included into a new block by network miners or validators.
* **Fiat-to-Crypto Entry Gateways**: Compliance-heavy platforms enabling the conversion of sovereign currencies (like INR) into digital assets, requiring rigorous Know Your Customer (KYC) compliance validations.
* **Proof of Work (PoW) Hashing**: The computational consensus process requiring computers to solve difficult mathematical puzzles to validate blockchain states, expending real-world energy to protect block immutability.

Executing with these enterprise-grade digital safety standards ensures your exploration into non-sovereign currencies is characterized by unbreakable personal sovereignty and superior portfolio defense. Continually review these security guardrails before broadcasting network actions.`;
        } else {
            deepDive = `### 📊 Multi-Decadal Wealth Compounding & Asset Dynamics

Constructing enduring, generational wealth demands an absolute mastery of **${topicTitle}** paired with unwavering, multi-decade strategic vision. The foundational mathematical engine of consistent financial expansion is compounding—earning returns not just on your original principal, but also on the previously accumulated growth over protracted durations. For Indian investors attempting to maintain purchasing power, traditional instruments like standard saving accounts or bank fixed deposits (FDs) frequently yield negative inflation-adjusted returns once measured against historical inflation averages of 6%. Acquiring real ownership in productive enterprises and diversified assets via **${topicTitle}** supplies the core real growth engine necessary to generate genuine, inflation-beating net worth.

A pivotal pillar of professional portfolio maintenance is Asset Allocation—the conscious and disciplined distribution of investable capital among non-correlated asset groups (Equities, Fixed Income Bonds, Real Estate, and Gold). Exhaustive financial research verifies that more than 90% of long-term performance variation is driven by high-level asset allocation choices rather than specific stock picking or short-sighted market timing attempts. Allocating capital consistently via **${topicTitle}** reduces aggregate drawdowns and moves your personal financial equation closer toward optimal Sharpe ratio efficiency along the efficient frontier.

Lastly, recognizing the silent impact of administrative costs is vital. An seemingly minor 1% annual variance in Expense Ratios (ER) can systematically consume up to 25% of your ultimate terminal corpus over a 30-year compounding horizon. Insisting on 'Direct' deployment pathways instead of commission-loaded 'Regular' distribution schemes ensures maximum capital deployment, fully optimizing your future financial harvest to its ultimate mathematical zenith.`;

            strategyFramework = `### 🛠️ Structured Implementation & Wealth Building Blueprint

To seamlessly integrate the principles of **${topicTitle}** into your core family financial engine, implement following rigorous systemic blueprint developed by master portfolio architects:

1. **Goal-Based Outcome Mapping**: Explicitly tether every single systematic investment plan to a concrete, time-bound financial milestone (e.g., Child Education, Pre-Retirement Independence, Home Purchase) to logically determine investment duration.
2. **Hardened Liquidity Reserve**: Before forwarding capital to **${topicTitle}**, establish an emergency cash buffer containing a minimum of 6 to 12 months of base household operating expenses to ensure market corrections do not force premature liquidation.
3. **Automated SIP Percentage Escalation**: Configure your systematic deployment platforms to automatically increment your monthly contributions by 10% every year in lockstep with your annual salary growth, rapidly accelerating financial goals.
4. **Disciplined Asset Rebalancing**: Every six to twelve months, audit portfolio weight distributions. Methodically trim overweight asset classes that have outperformed and buy into temporarily undervalued categories to lock in gains.
5. **Direct Route Selection**: Always purchase mutual fund products directly from the asset management company (AMC) website or direct platforms to bypass ongoing distributor commissions and retain 100% of returns.`;

            actionablePlaybook = `### ⚠️ Behavioral Biases & Portfolio Survival Defense

Historical analytical data confirms that the primary threat to long-term wealth accumulation isn't the natural volatility of global markets, but rather the destructive emotional reactive tendencies of the individual investor. When deploying assets into **${topicTitle}**, protect yourself against these major behavioral hazards:

* **Panic Stopping During Drawdowns**: When major equity indices undergo standard 15-20% corrections, fear-induced bias causes retail participants to cease systematic plans. Bear markets provide the mathematical advantage of acquiring more units at steep discounts, drastically lowering average cost bases.
* **Over-Concentration and Failure to Diversify**: Deploying a disproportionate percentage of net worth into singular asset sectors (e.g., real estate or specialized small-cap funds) leaves the portfolio exposed to catastrophic systemic risk. Maintain global, well-rounded diversification.
* **Recency Bias & Performance Chasing**: Blindly investing capital only into specific asset classes or thematic funds that generated the highest trailing returns last year is a major fallacy. Performance cycles rotate perpetually; maintain a core index-driven core.
* **Inadequate Insurance Shielding**: Deploying long-term savings without possessing a robust personal health insurance umbrella and independent term life plan leaves your wealth highly vulnerable to liquidation during health emergencies.
* **Excessive Portfolio Meddling**: Routinely reviewing portfolio balances on a daily basis increases cortisol, promotes anxiety, and encourages unnecessary, high-friction short-term trading. Limit your review cycles to quarterly intervals for maximum peace of mind.`;

            analyticalGlossary = `### 📘 Comprehensive Advanced Wealth Glossary & Masterclass

* **Compounded Annual Growth Rate (CAGR)**: The foundational metric calculating the smoothed average annual rate of growth an investment requires to move from its initial valuation to its terminal corpus valuation.
* **Expense Ratio Overhead (ER)**: The annual fee expressed as a percentage deducted from fund assets by asset managers to cover administration, fund managers, and marketing. Lower is always mathematically superior.
* **Systematic Transfer Plan (STP)**: An algorithmic scheduling methodology where an investor deploys a lump sum into an ultra-safe debt fund and automatically transfers a fixed slice into an equity fund periodically to average entry pricing.
* **Long-Term Capital Gain Harvesting (LTCG)**: An active tax strategy leveraging standard annual ₹1.25 Lakh LTCG exemptions by systematically booking and instantly reinvesting gains each fiscal cycle.
* **Rupee Cost Averaging Protocol**: The mechanical outcome of systematic investing, ensuring that you purchase mathematically higher counts of units when prices fall and fewer when they rise, smoothing out volatility.

Embracing these hardened financial laws converts wealth creation from an emotional, anxiety-ridden activity into a reliable, automated code-driven production system. Periodically audit your operations against these frameworks to maintain flawless alignment with your multi-decadal roadmap.`;
        }
        
        return `${baseContent}\n\n${deepDive}\n\n${strategyFramework}\n\n${actionablePlaybook}\n\n${analyticalGlossary}`;
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
            <div style={{ padding: '1.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
                
                {/* Campus Hub Top Banner */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', 
                    borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', 
                    marginBottom: '1.75rem', boxShadow: '0 12px 32px -8px rgba(49, 46, 129, 0.15)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: '40px', bottom: '-60px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }} />
                    
                    <div style={{ maxWidth: '700px', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', width: 'fit-content', padding: '0.35rem 0.85rem', borderRadius: '99px', marginBottom: '1rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Award size={14} style={{ color: '#FBBF24' }} />
                            <span style={{ fontSize: '0.68rem', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#FBBF24' }}>Integrated Wealth Campus</span>
                        </div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '950', letterSpacing: '-0.03em', margin: '0 0 0.75rem 0', lineHeight: 1.15 }}>Social Trading & Finance Academies</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.98rem', lineHeight: '1.6', fontWeight: '500', margin: 0 }}>Start your financial learning journey today. Select a course below to master stock trading, automated investments, mutual funds, or safe gold bonds with simple, step-by-step lessons.</p>
                    </div>
                </div>

                {/* Dynamic Academy Choice Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {Object.keys(ACADEMIES).map((key) => {
                        const academy = ACADEMIES[key];
                        const AcademyIcon = academy.icon;
                        return (
                            <div 
                                key={key}
                                onClick={() => handleTrackSelect(key)}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    padding: '1.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.01)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 24px -8px rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = '#CBD5E1';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.01)';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                {/* Card Heading Elements */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ 
                                        width: '52px', height: '52px', borderRadius: '14px', 
                                        background: academy.gradient, display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', color: 'white',
                                        boxShadow: `0 6px 16px ${academy.shadow}`
                                    }}>
                                        <AcademyIcon size={24} />
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', 
                                        letterSpacing: '0.05em', background: '#F1F5F9', color: '#475569', 
                                        padding: '5px 10px', borderRadius: '6px' 
                                    }}>
                                        {academy.tag}
                                    </span>
                                </div>

                                {/* Title & Summary */}
                                <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                                    {academy.title}
                                </h2>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.75rem 0', flex: 1 }}>
                                    {academy.desc}
                                </p>

                                {/* Launch Indicator */}
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', 
                                    fontSize: '0.85rem', fontWeight: '900', color: '#1E293B'
                                }}>
                                    <span>Launch Learning Track</span>
                                    <ArrowRight size={15} />
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
        <div style={{ padding: '1.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            
            {/* Main Header Banner for Active Academy */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: activeAcademy.gradient, 
                borderRadius: '20px', padding: '1.5rem 2rem', color: 'white', 
                marginBottom: '1.5rem', boxShadow: `0 12px 32px -8px ${activeAcademy.shadow}`,
                position: 'relative'
            }}>
                <div style={{ maxWidth: '75%' }}>
                    <button 
                        onClick={handleBackToCampus}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.4rem', 
                            background: 'rgba(255,255,255,0.15)', color: 'white', 
                            border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', 
                            fontSize: '0.72rem', fontWeight: '900', cursor: 'pointer', 
                            marginBottom: '1rem', backdropFilter: 'blur(4px)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        ← Back to Academy Hub
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '950', letterSpacing: '-0.02em', margin: '0 0 0.4rem 0' }}>{activeAcademy.title}</h1>
                    <p style={{ opacity: 0.85, fontSize: '0.92rem', lineHeight: '1.5', fontWeight: '500', margin: 0 }}>{activeAcademy.subtitle}</p>
                </div>
                <div style={{ width: '110px', height: '110px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AcademyIcon size={52} style={{ color: 'white', opacity: 0.35 }} />
                </div>
            </div>

            {/* Content Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.4fr', gap: '1.25rem', alignItems: 'flex-start' }}>
                
                {/* Left Floating Curriculum Accordion View */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>
                    
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
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 6px 20px -8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                    
                    {/* Top Topic Controller & Bookmark Header */}
                    <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {activeModule && activeModule.topics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTopicIdx(idx)}
                                    style={{ 
                                        padding: '0.5rem 1rem', borderRadius: '8px', 
                                        border: activeTopicIdx === idx ? 'none' : '1px solid #E2E8F0', 
                                        background: activeTopicIdx === idx ? '#1B6B3A' : 'white', 
                                        color: activeTopicIdx === idx ? 'white' : '#475569', 
                                        fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer',
                                        boxShadow: activeTopicIdx === idx ? '0 4px 12px rgba(27, 107, 58, 0.12)' : 'none'
                                    }}
                                >
                                    Part {idx + 1}: {topic.title.length > 30 ? topic.title.substring(0, 30) + '...' : topic.title}
                                </button>
                            ))}
                        </div>

                        {currentTopic && (
                            <button 
                                onClick={() => toggleBookmark(currentTopic.title)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: bookmarkList.includes(currentTopic.title) ? '#F59E0B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                <Bookmark size={16} fill={bookmarkList.includes(currentTopic.title) ? '#F59E0B' : 'none'} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '850', color: '#64748B' }}>{bookmarkList.includes(currentTopic.title) ? 'Bookmarked' : 'Save'}</span>
                            </button>
                        )}
                    </div>

                    {/* Content Presentation Panel */}
                    <div style={{ padding: '2rem 2.5rem' }} className="animate-in fade-in duration-300">
                        
                        {activeModule && (
                            <>
                                {/* Header Metadata Info */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1B6B3A', fontSize: '0.75rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        <span>{activePhaseName}</span>
                                        <ChevronRight size={12} />
                                        <span>Module Selection</span>
                                    </div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: '1.25', margin: '0 0 1rem 0' }}>
                                        {activeModule.title}
                                    </h1>
                                    <div style={{ display: 'flex', gap: '1.25rem', color: '#64748B', fontSize: '0.78rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Clock size={14} />
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
                                    {currentTopic && formatContent(enrichTopicContent(selectedTrack, activeModule.title, currentTopic.title, currentTopic.content))}
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

