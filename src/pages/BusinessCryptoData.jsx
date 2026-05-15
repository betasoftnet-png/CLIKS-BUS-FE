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
    Award,
    Cpu,
    Lock,
    Unlock,
    RefreshCw,
    Server,
    Key,
    Globe,
    Users
} from 'lucide-react';

export const BitcoinIcon = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M11.75 1.75v20.5M16.25 1.75v20.5M16.25 5.25c2.25 0 4 1 4 3s-1.75 3-4 3M16.25 11.25c2.5 0 4.25 1 4.25 3.5s-1.75 3.5-4.25 3.5M7.75 5.25h8.5M7.75 11.25h8.5M7.75 18.25h8.5M7.75 5.25c-2.25 0-4 1-4 3s1.75 3 4 3M7.75 11.25c-2.5 0-4.25 1-4.25 3.5s1.75 3.5 4.25 3.5" />
    </svg>
);

export const CRYPTO_CURRICULUM = [
    {
        name: 'Phase 1 — Blockchain & Digital Asset Foundations',
        icon: Compass,
        modules: [
            {
                id: 'cry-1',
                title: 'Module 1: The Genesis of Cryptography & Decentralization',
                level: 'Beginner', duration: '20 Mins', icon: BookOpen,
                topics: [{
                    title: 'Decoupling Money from Central Entities',
                    content: `Cryptocurrency represents the first time history allows digital value transfer without middlemen.

### 🌐 Core Architectural Shift

* **The Double-Spend Problem**: Digital files can usually be copied infinitely. Cryptocurrencies use decentralized consensus to ensure a coin cannot be spent twice.
* **Distributed Ledgers**: Ledger records are not stored on one corporate server; they are duplicated across thousands of independent validator nodes globally.
* **Peer-to-Peer (P2P)**: Transactions happen directly between user wallets, cutting out clearing houses and clearing banks.`
                }]
            },
            {
                id: 'cry-2',
                title: 'Module 2: Inside the Blockchain: Blocks, Nodes, & Hashes',
                level: 'Beginner', duration: '20 Mins', icon: Layers,
                topics: [{
                    title: 'Understanding Distributed Chains',
                    content: `A blockchain is literally a dynamic chain of data blocks linked securely using advanced cryptography.

### ⛓️ Block Validation Lifecycle

* **Mempool (Memory Pool)**: The digital waiting room where transactions sit after broadcast before being grouped into blocks.
* **Block Time**: The fixed cadence (e.g., Ethereum's 12 seconds) at which a new batch of transactions gets verified and appended.
* **Immutability**: Once a block is hashed and verified, altering it requires re-calculating the math for all subsequent blocks—making fraud computationally impossible.`
                }]
            },
            {
                id: 'cry-3',
                title: 'Module 3: Smart Contracts & Ethereum Virtual Machines',
                level: 'Beginner', duration: '20 Mins', icon: Cpu,
                topics: [{
                    title: 'Programmable Capital Protocols',
                    content: `While first-gen chains track static coins, Ethereum introduced active programming logic directly onto the ledger.

### 🧠 Smart Contract Logic

* **Deterministic If/Then**: "If Client deposits ₹X, then release collateral instantly." No human lawyers, no delays.
* **EVM (Ethereum Virtual Machine)**: A global, decentralized supercomputer running bytecode programs across all nodes in parallel.
* **Gas Fees**: The processing fee paid in ETH to network validators to execute computational steps.`
                }]
            },
            {
                id: 'cry-4',
                title: 'Module 4: Consensus Engines: Proof of Work vs. Stake',
                level: 'Beginner', duration: '25 Mins', icon: Scale,
                topics: [{
                    title: 'How Decentralized Networks Agree',
                    content: `For a network to maintain one ledger, thousands of distinct computers must agree on block ordering.

### ⚖️ The Two Primary Engines

* **Proof of Work (PoW)**: High-power miners solve cryptographic puzzles. Offers supreme censorship resistance but consumes high electric energy.
* **Proof of Stake (PoS)**: Validators lock (stake) native tokens as security collateral to earn validation rights. Energy-efficient and highly scalable.`
                }]
            },
            {
                id: 'cry-5',
                title: 'Module 5: The Altcoin Universe: L1s, L2s, & DApps',
                level: 'Beginner', duration: '25 Mins', icon: Globe,
                topics: [{
                    title: 'Mapping the Ecosystem Layers',
                    content: `The landscape consists of specialized layers designed to scale processing speed while keeping fees low.

### 🛸 Ecosystem Topology

* **Layer 1 (L1)**: Base settlement blockchains (e.g., Ethereum, Solana, Avalanche).
* **Layer 2 (L2)**: Execution frameworks (e.g., Arbitrum, Polygon) that process transactions off-chain, grouping them to post on L1 for cheap fees.
* **DApps**: Decentralized Applications that replace centralized services (socials, gaming, finance) via smart contract backends.`
                }]
            }
        ]
    },
    {
        name: 'Phase 2 — Decentralized Finance (DeFi) Ecosystem',
        icon: Zap,
        modules: [
            {
                id: 'cry-6',
                title: 'Module 6: Introduction to DeFi Architecture',
                level: 'Intermediate', duration: '25 Mins', icon: PieChart,
                topics: [{
                    title: 'The Open Finance Legos',
                    content: `DeFi replaces traditional financial intermediaries like brokers and banks with software code.

### 🏦 Core DeFi Values

* **Permissionless Access**: Anyone with an internet connection can trade, lend, or borrow; no credit scores or background verification checks.
* **Composable Systems**: "Money Legos" allows different platforms to plug directly into each other, enabling automated capital routing.`
                }]
            },
            {
                id: 'cry-7',
                title: 'Module 7: Decentralized Exchanges & Automated Market Makers',
                level: 'Intermediate', duration: '30 Mins', icon: RefreshCw,
                topics: [{
                    title: 'Trading Without Central Orderbooks',
                    content: `DEXs use automated math equations to set prices instead of matching buyers and sellers manually.

### 🔄 AMM Dynamics

* **Liquidity Pools**: Smart contracts holding pairs of tokens (e.g., ETH/USDC) where traders trade against the pool.
* **Slippage**: The difference between the expected price and the final executed price due to changes in pool ratios.
* **Impermanent Loss**: The temporary loss liquidity providers suffer when relative token prices shift versus just holding tokens.`
                }]
            },
            {
                id: 'cry-8',
                title: 'Module 8: Decentralized Lending, Borrowing & Collateral',
                level: 'Intermediate', duration: '25 Mins', icon: Briefcase,
                topics: [{
                    title: 'Earning Yield & Accessing Liquid Cash',
                    content: `DeFi lending protocols allow users to deposit crypto to earn interest, or borrow against it instantly.

### 🛡️ Lending Protections

* **Over-Collateralization**: To borrow ₹100 of crypto, you must deposit ₹150 of collateral to shield the protocol from volatile drops.
* **Liquidation Engines**: If your collateral value drops below a set threshold, algorithms automatically auction your deposit to repay the loan.`
                }]
            },
            {
                id: 'cry-9',
                title: 'Module 9: Stablecoins: Fiat-Backed, Crypto-Backed & Algorithmic',
                level: 'Intermediate', duration: '20 Mins', icon: Target,
                topics: [{
                    title: 'Bridging High Volatility to Stability',
                    content: `Stablecoins eliminate price volatility by pegging their market price 1:1 with assets like the US Dollar.

### 💵 The Stablecoin Taxonomy

* **Fiat-Backed**: Regulated tokens backed by hard USD in cash banks (USDC, USDT).
* **Crypto-Backed**: Backed by decentralized tokens like ETH in over-collateralized smart contracts (DAI).
* **Algorithmic**: Pegged purely using smart contract mint-and-burn loops without hard backing (High risk).`
                }]
            },
            {
                id: 'cry-10',
                title: 'Module 10: Yield Farming & Liquid Staking Mechanics',
                level: 'Intermediate', duration: '30 Mins', icon: TrendingUp,
                topics: [{
                    title: 'Optimizing Capital Efficiency',
                    content: `Liquidity providers can deploy their capital across yield curves to compound interest rates.

### 🚜 Yield Optimization

* **Yield Farming**: Moving liquidity between protocols to capture the highest APY and reward incentives.
* **Liquid Staking (LSD)**: Staking native assets to secure the network while receiving a tradeable wrapper token (e.g., stETH) to use concurrently.`
                }]
            }
        ]
    },
    {
        name: 'Phase 3 — NFTs, Web3 Governance & Asset Classes',
        icon: Gem,
        modules: [
            {
                id: 'cry-11',
                title: 'Module 11: Digital Ownership & Non-Fungible Tokens (NFTs)',
                level: 'Intermediate', duration: '20 Mins', icon: Award,
                topics: [{
                    title: 'Authenticity and Digital Scarcity',
                    content: `NFTs utilize specific token standards to register unique ownership of non-interchangeable digital assets.

### 🎨 Beyond Digital Art

* **Token Standards**: Unlike fungible ERC-20 tokens, ERC-721 ensures every individual token ID is distinct.
* **Utility Cases**: Real-world tokenized property deeds, digital event ticketing, verifiable credentials, and gaming identity skins.`
                }]
            },
            {
                id: 'cry-12',
                title: 'Module 12: DAOs & Decentralized Corporate Governance',
                level: 'Intermediate', duration: '25 Mins', icon: Users,
                topics: [{
                    title: 'The Future of Group Coordination',
                    content: `Decentralized Autonomous Organizations represent a internet-native form of corporate organization.

### 🏛️ Distributed Management

* **Governance Tokens**: Holding tokens gives rights to vote on project roadmaps, treasury deployments, and protocol changes.
* **Treasury Wallets**: Funds are locked in multisig contracts and can only move if the community votes to approve proposals.`
                }]
            },
            {
                id: 'cry-13',
                title: 'Module 13: Web3 Identities, ENS & Interoperability',
                level: 'Intermediate', duration: '20 Mins', icon: Database,
                topics: [{
                    title: 'Identity Sovereignty on Web3',
                    content: `Web3 allows users to log into applications using a self-custodial wallet instead of Facebook/Google accounts.

### 🔑 Secure Identity

* **ENS (Ethereum Name Service)**: Converting raw addresses (0x71C...) into readable domain names (yourname.eth).
* **Cross-Chain Bridges**: Software pipelines allowing tokens to move across distinct, unconnected blockchains.`
                }]
            },
            {
                id: 'cry-14',
                title: 'Module 14: Oracles & Bridging Real-World Data',
                level: 'Intermediate', duration: '25 Mins', icon: Zap,
                topics: [{
                    title: 'Connecting Off-Chain Data Feeds',
                    content: `Smart contracts cannot natively fetch external internet data (e.g., today's stock prices or weather).

### 📡 The Oracle Bridge

* **Decentralized Oracles**: Systems like Chainlink aggregate price feeds from multiple sources to inject reliable data into smart contracts.
* **Real-World Assets (RWA)**: Bringing traditional assets like US Treasuries, real estate, and gold directly on-chain.`
                }]
            },
            {
                id: 'cry-15',
                title: 'Module 15: GameFi, Play-to-Earn & The Metaverse',
                level: 'Intermediate', duration: '25 Mins', icon: Compass,
                topics: [{
                    title: 'In-Game Asset Sovereignty',
                    content: `Blockchain gaming transfers asset ownership from centralized developers directly to the players.

### 🎮 GameFi Economies

* **Asset Ownership**: Players can trade game weapons, lands, and characters on open markets for real value.
* **Metaverse Spaces**: Interconnected virtual realities built with decentralized ownership of land packets.`
                }]
            }
        ]
    },
    {
        name: 'Phase 4 — Crypto Trading, Investing & Security',
        icon: LineChart,
        modules: [
            {
                id: 'cry-16',
                title: 'Module 16: Evaluating Crypto Fundamentals & Tokenomics',
                level: 'Advanced', duration: '30 Mins', icon: FileText,
                topics: [{
                    title: 'Distinguishing Value from Hype',
                    content: `Crypto valuation requires auditing underlying coin economic models and supply schedules.

### 📈 Valuation Frameworks

* **FDV (Fully Diluted Valuation)**: Total value of the project once all restricted and locked tokens are in circulation.
* **Inflation Schedules**: Reviewing token emission rates and team unlocking cliffs that cause massive supply dumps.`
                }]
            },
            {
                id: 'cry-17',
                title: 'Module 17: Centralized Exchanges (CEX) vs. Wallet Self-Custody',
                level: 'Advanced', duration: '25 Mins', icon: ShieldCheck,
                topics: [{
                    title: 'Where Your Digital Wealth Lives',
                    content: `Understanding the difference between storing assets with custodians and holding private keys personally.

### 🔑 Security Paradigm

* **Not Your Keys, Not Your Coins**: Storing on CEXs exposes you to exchange bankruptcy or freeze risks.
* **Custodial vs Non-Custodial**: Self-custody wallets (e.g. Metamask, Ledger) give you total exclusive ownership control.`
                }]
            },
            {
                id: 'cry-18',
                title: 'Module 18: Cold Wallets, Seed Phrases & Advanced Custody',
                level: 'Advanced', duration: '30 Mins', icon: Lock,
                topics: [{
                    title: 'Fortifying High-Value Asset Vaults',
                    content: `Securing multi-generational wealth requires air-gapped, hardware storage systems.

### 🔒 Cold Storage Protocols

* **Hardware Wallets**: Dedicated devices that store private keys completely offline, signing transactions without exposing keys to the internet.
* **Seed Phrase Discipline**: The 12/24-word backup phrase must NEVER be typed into any digital file, screenshot, or cloud server.`
                }]
            },
            {
                id: 'cry-19',
                title: 'Module 19: On-Chain Analysis & Whale Tracking',
                level: 'Advanced', duration: '30 Mins', icon: Database,
                topics: [{
                    title: 'Reading the Transparent Ledger',
                    content: `Because public blockchains are fully transparent, you can trace large investor (whale) wallet balances.

### 🐳 Ledger Tracing

* **Exchange Inflows/Outflows**: High inflows to exchanges signal potential whale selling intent; outflows to cold wallets signify accumulation.
* **Active Addresses**: A healthy metric signaling real daily adoption growth.`
                }]
            },
            {
                id: 'cry-20',
                title: 'Module 20: Smart Contract Risk, Rug Pulls & Scam Prevention',
                level: 'Advanced', duration: '35 Mins', icon: ShieldAlert,
                topics: [{
                    title: 'Surviving The Wild Cyber Frontier',
                    content: `Without banking safeguards, users are solely responsible for identifying exploits and scams.

### 🚨 Top Exploits to Sidestep

* **Rug Pulls**: Developers creating hype, selling out liquidity, and abandoning the project instantly.
* **Phishing Approvals**: Signing a malicious "SetApprovalForAll" transaction that allows hackers to drain your wallet assets.`
                }]
            }
        ]
    },
    {
        name: 'Phase 5 — Regulation, Taxes & Strategy',
        icon: Gavel,
        modules: [
            {
                id: 'cry-21',
                title: 'Module 21: Global Crypto Regulations & SEC Classifications',
                level: 'Crucial', duration: '25 Mins', icon: Scale,
                topics: [{
                    title: 'Navigating the Legal Shift',
                    content: `Governments are defining whether cryptocurrencies are commodities, securities, or specialized digital assets.

### ⚖️ Legal Landscapes

* **The Howey Test**: A US legal standard used to assess if a digital token qualifies as an investment contract (Security).
* **MiCA (Markets in Crypto-Assets)**: Comprehensive framework by the European Union regulating stablecoin issuers and exchanges.`
                }]
            },
            {
                id: 'cry-22',
                title: 'Module 22: Indian Crypto Tax Framework (30% Flat + 1% TDS)',
                level: 'Crucial', duration: '35 Mins', icon: Gavel,
                topics: [{
                    title: 'Complying with the IT Act Section 115BBH',
                    content: `India treats crypto as "Virtual Digital Assets" (VDA) with very specific, strict tax mandates.

### 🇮🇳 Indian Tax Metrics

* **30% Flat Tax**: Flat tax on all net VDA transfer profits, without basic exemptions or slab benefits.
* **Zero Loss Offsetting**: Losses in Token A cannot be offset against gains in Token B; each transaction is taxed individually.
* **1% TDS**: Levied on the seller's overall transaction value to track the movement of capital.`
                }]
            },
            {
                id: 'cry-23',
                title: 'Module 23: Crypto Accounting & Tax Filing Tools',
                level: 'Crucial', duration: '25 Mins', icon: Clock,
                topics: [{
                    title: 'Automating Heavy On-Chain Ledger Accounting',
                    content: `Manually calculating gains for hundreds of on-chain trades, swaps, and stakings is virtually impossible.

### 🖥️ Automated Portfolios

* **Tax Tools**: Software integrations (Koinly, CoinTracker) that sync with wallets and exchanges via APIs to generate tax-ready forms.
* **FIFO Ledger**: Moving through inventory using First-In, First-Out principles to determine exact token cost basis.`
                }]
            },
            {
                id: 'cry-24',
                title: 'Module 24: Structuring an Asymmetric Crypto Portfolio',
                level: 'Crucial', duration: '30 Mins', icon: PieChart,
                topics: [{
                    title: 'Positioning Volatile High-Upside Assets',
                    content: `Crypto asset allocation should be managed based on your overall capital tolerance thresholds.

### 📐 Smart Allocations

* **The Barbell Strategy**: Keeping 90% of capital in safe assets, and deploying 5%-10% into ultra high-growth crypto outliers.
* **Portfolio Splitting**: Anchoring the crypto side with Bluechips (BTC/ETH) and allocating smaller slices to higher-risk L2s or DeFi.`
                }]
            },
            {
                id: 'cry-25',
                title: 'Module 25: The Next Decade: CBDCs, AI Integration & Beyond',
                level: 'Crucial', duration: '30 Mins', icon: Award,
                topics: [{
                    title: 'Visualizing the Financial Future',
                    content: `Analyzing the converging intersections of digital money, AI processing, and sovereign digital ledger tools.

### 🚀 The Future Horizon

* **CBDCs (Central Bank Digital Currencies)**: Government digital fiat (e.g., Digital Rupee) which offers efficiency but brings privacy concerns.
* **AI + Blockchain**: Smart contracts running decentralized machine learning queries and managing machine-to-machine payment infrastructure.`
                }]
            }
        ]
    }
];

export const BITCOIN_CURRICULUM = [
    {
        name: 'Phase 1 — Genesis & The Philosophy of Money',
        icon: Compass,
        modules: [
            {
                id: 'btc-1',
                title: 'Module 1: The History of Fiat & The Fiat Standard',
                level: 'Beginner', duration: '20 Mins', icon: BookOpen,
                topics: [{
                    title: 'Unveiling Currency debasement',
                    content: `To appreciate Bitcoin, you must first analyze the system it was designed to opt out from.

### 📜 Debt-Backed Money

* **The End of Bretton Woods (1971)**: When global currencies severed all ties to physical gold, allowing infinite money printing by central banks.
* **Inflation as a Hidden Tax**: Expansions in money supply directly erode the purchasing power of saved cash earnings over time.`
                }]
            },
            {
                id: 'btc-2',
                title: 'Module 2: Sound Money & The Hardness Metric',
                level: 'Beginner', duration: '15 Mins', icon: Scale,
                topics: [{
                    title: 'The Physics of Real Money',
                    content: `Money is a tool to store time and energy. The "hardness" of money dictates its long-term reliability.

### 🧱 Stock-to-Flow Concept

* **Hard Money**: An asset where production costs are high and existing supply cannot be inflated by centralized command.
* **Stock-to-Flow Index**: Dividing existing supply by yearly new production. Bitcoin is mathematically hard-coded to possess the highest hardness ratio in human history.`
                }]
            },
            {
                id: 'btc-3',
                title: 'Module 3: Satoshi Nakamoto & The Cypherpunk Legacy',
                level: 'Beginner', duration: '20 Mins', icon: Lock,
                topics: [{
                    title: 'Privacy, Cryptography & Releasing the Code',
                    content: `Bitcoin was not born in a vacuum; it was the culmination of decades of digital cash research.

### 🕶️ Cypherpunk Principles

* **The Whitepaper (Oct 31, 2008)**: Entitled "Bitcoin: A Peer-to-Peer Electronic Cash System".
* **No Single Point of Failure**: By remaining completely anonymous and stepping away, Satoshi guaranteed Bitcoin could never be subpoenaed or controlled.`
                }]
            },
            {
                id: 'btc-4',
                title: 'Module 4: The Anatomy of the Bitcoin Network',
                level: 'Beginner', duration: '20 Mins', icon: Server,
                topics: [{
                    title: 'Distributed Peer-to-Peer Consensus',
                    content: `Bitcoin is an open network running a software protocol that any computer on earth can run.

### 🖥️ Nodes vs. Miners

* **Nodes**: Keep the record. They act as the judiciary, verifying that miners follow the strict consensus rules.
* **Miners**: Propose new blocks. They expend physical energy to process transactions into the chain.`
                }]
            },
            {
                id: 'btc-5',
                title: 'Module 5: The Absolute 21 Million Hard Cap',
                level: 'Beginner', duration: '20 Mins', icon: Target,
                topics: [{
                    title: 'Programmed Scarcity in an Infinite Universe',
                    content: `For the first time, humanity has an asset with absolute, unalterable mathematical scarcity.

### 📊 Hard-Coded Economics

* **Fixed Supply**: The code strictly guarantees only 21,000,000 Bitcoins will EVER exist.
* **Divisibility**: Each Bitcoin is divisible into 100 Million sub-units called **Satoshis** (Sats).`
                }]
            }
        ]
    },
    {
        name: 'Phase 2 — Mechanics, Hashes & The Protocol',
        icon: Layers,
        modules: [
            {
                id: 'btc-6',
                title: 'Module 6: Cryptographic Hashes & SHA-256 Protocol',
                level: 'Intermediate', duration: '25 Mins', icon: Cpu,
                topics: [{
                    title: 'The Mathematics of Bitcoin Security',
                    content: `Bitcoin uses the SHA-256 cryptographic hashing algorithm designed by the NSA.

### 🔐 Secure One-Way Math

* **One-Way Property**: Easy to generate a hash from input data, but impossible to reverse-engineer original data from the hash.
* **Collision Resistance**: Finding two inputs that yield the identical hash is mathematically impossible with modern computing power.`
                }]
            },
            {
                id: 'btc-7',
                title: 'Module 7: Public & Private Keys: Elliptic Curve',
                level: 'Intermediate', duration: '25 Mins', icon: Key,
                topics: [{
                    title: 'Digital Signatures and True Asset Control',
                    content: `Your Bitcoin is secured using Elliptic Curve Cryptography (ECDSA) to create keys.

### 🔑 The Key Matrix

* **Private Key**: Your secret digital signature. Whoever controls the private key controls the capital.
* **Public Key / Address**: Generated from the private key. Safe to share publicly to receive transactions.`
                }]
            },
            {
                id: 'btc-8',
                title: 'Module 8: The UTXO Accounting Framework',
                level: 'Intermediate', duration: '20 Mins', icon: Database,
                topics: [{
                    title: 'Understanding Unspent Output Models',
                    content: `Unlike banks that use simple "account balance" tables, Bitcoin tracks individual piles of coins.

### 💰 UTXO Dynamics

* **UTXO (Unspent Transaction Output)**: Think of them as physical bills in a wallet.
* **Transaction Inputs**: Spending Bitcoin combines existing UTXOs, signs them, and generates brand new UTXOs to the recipient and yourself (change).`
                }]
            },
            {
                id: 'btc-9',
                title: 'Module 9: Timechain, Mempools & Block Building',
                level: 'Intermediate', duration: '20 Mins', icon: Clock,
                topics: [{
                    title: 'Ordering Time in a Decentralized World',
                    content: `Bitcoin solves the double spend problem by ordering transactions into specific block buckets.

### ⏳ Ledger Assembly

* **Block Space**: Space inside a Bitcoin block is scarce (approx 1-2MB).
* **Fee Market**: Miners naturally select transactions offering higher fees per byte from the mempool.`
                }]
            },
            {
                id: 'btc-10',
                title: 'Module 10: Soft Forks, Hard Forks & SegWit History',
                level: 'Intermediate', duration: '25 Mins', icon: Activity,
                topics: [{
                    title: 'Upgrading an Un-governed Protocol',
                    content: `Since nobody owns Bitcoin, upgrades must occur through community consensus.

### 🔄 Protocol Updates

* **Soft Fork**: A backwards-compatible upgrade where old nodes still accept new blocks.
* **Hard Fork**: An incompatible split resulting in two distinct blockchains (e.g., the Bitcoin Cash split of 2017).`
                }]
            }
        ]
    },
    {
        name: 'Phase 3 — Mining, Energy & Security',
        icon: ShieldCheck,
        modules: [
            {
                id: 'btc-11',
                title: 'Module 11: Mining ASICs & Thermodynamic Security',
                level: 'Intermediate', duration: '30 Mins', icon: Zap,
                topics: [{
                    title: 'Anchoring Code to Physical Reality',
                    content: `Bitcoin uses thermodynamics to lock digital transactions, converting electricity directly into network protection.

### ⚙️ Mining Compute

* **ASIC**: Specialized hardware chips engineered to do only one thing—calculate SHA-256 hashes incredibly fast.
* **Hashrate**: The combined computational power actively securing the network.`
                }]
            },
            {
                id: 'btc-12',
                title: 'Module 12: The Automated Difficulty Adjustment',
                level: 'Intermediate', duration: '25 Mins', icon: RefreshCw,
                topics: [{
                    title: 'Bitcoin\'s Central Nervous Regulator',
                    content: `Perhaps Satoshi's most brilliant innovation, the Difficulty Adjustment maintains the 10-minute pace automatically.

### ⚙️ Self-Regulation

* **2,016 Blocks cadence**: Every two weeks, the network measures miner speeds.
* **Dynamic Tuning**: If mining power increases, math problems become harder automatically; if miners leave, problems become easier.`
                }]
            },
            {
                id: 'btc-13',
                title: 'Module 13: The Bitcoin Halving Protocol',
                level: 'Intermediate', duration: '30 Mins', icon: TrendingUp,
                topics: [{
                    title: 'Visualizing the Supply Shock Cycles',
                    content: `Every 210,000 blocks (roughly 4 years), the new Bitcoin entering circulation is cut in half.

### ✂️ Supply Halvings

* **2009-2012**: 50 BTC per block.
* **Halving Mechanics**: Iteratively dropping rewards to 25, then 12.5, then 6.25, and 3.125 BTC per block, until terminal year 2140.`
                }]
            },
            {
                id: 'btc-14',
                title: 'Module 14: The 51% Attack & Network Anti-Fragility',
                level: 'Intermediate', duration: '25 Mins', icon: ShieldAlert,
                topics: [{
                    title: 'Understanding Network Defense Limits',
                    content: `What does it take to break or hack the Bitcoin global blockchain?

### 🛡️ Attack Costs

* **51% Attack**: Gaining more hashing power than the rest of the network combined.
* **Game Theory Defense**: At Bitcoin's current scale, acquiring the hardware/energy costs billions, and attacking the network would immediately crash the attacker's acquired asset value.`
                }]
            },
            {
                id: 'btc-15',
                title: 'Module 15: Mining & Environmental Realities',
                level: 'Intermediate', duration: '25 Mins', icon: Scale,
                topics: [{
                    title: 'Debunking the Energy Narrative',
                    content: `Evaluating how Bitcoin mining interacts with renewable grids and stranded energy.

### 🔌 Green Mining

* **Stranded Energy**: Miners locate near remote hydro/geothermal sources that traditional grids cannot reach.
* **Grid Balancing**: Miners can shut down instantly during civilian demand surges, subsidizing power grids.`
                }]
            }
        ]
    },
    {
        name: 'Phase 4 — Scalability, Layer 2s & Wallets',
        icon: Briefcase,
        modules: [
            {
                id: 'btc-16',
                title: 'Module 16: The Scalability Trilemma',
                level: 'Advanced', duration: '25 Mins', icon: PieChart,
                topics: [{
                    title: 'Why Bitcoin Must Scale in Layers',
                    content: `A base settlement layer cannot process billions of transactions per second without sacrificing decentralization.

### ⚖️ Trilemma Balance

* **The Choice**: Security and Decentralization are prioritized on L1.
* **Speed (Scalability)**: Offloaded to specialized secondary processing layers.`
                }]
            },
            {
                id: 'btc-17',
                title: 'Module 17: The Lightning Network Protocol (L2)',
                level: 'Advanced', duration: '30 Mins', icon: Zap,
                topics: [{
                    title: 'Instant, Near-Zero Fee Bitcoin Payments',
                    content: `Lightning allows processing millions of sub-penny transactions off-chain in milliseconds.

### ⚡ Lightning Payment Channels

* **Smart Payment Channels**: Locking Bitcoin in L1 multisig vaults and transacting instantly via digital IOUs.
* **Final Settlement**: Closing the channel posts one final consolidated transaction balance back to the Bitcoin L1.`
                }]
            },
            {
                id: 'btc-18',
                title: 'Module 18: Self-Custody, Hardware Wallets & Nodes',
                level: 'Advanced', duration: '30 Mins', icon: Lock,
                topics: [{
                    title: 'Mastering Your Personal Monetary Vault',
                    content: `To unlock true financial sovereignty, you must maintain personal verification systems.

### 🏢 Custody Tiers

* **Hardware Wallet**: Crucial for large long-term cold savings.
* **Running a Full Node**: Allowing you to broadcast and verify your transactions independently without trusting third-party servers.`
                }]
            },
            {
                id: 'btc-19',
                title: 'Module 19: Advanced Multisig & Inheritance Architectures',
                level: 'Advanced', duration: '30 Mins', icon: Layers,
                topics: [{
                    title: 'Protecting Generational Family Assets',
                    content: `Multisig configurations require signatures from multiple keys to move capital.

### 🗝️ Setup Matrix

* **2-of-3 Multisig**: Requiring 2 keys to sign. One key at home, one at your bank vault, one with a trusted lawyer.
* **Inheritance Protocols**: Clear, physical instructions ensuring heirs can recover keys without unauthorized access.`
                }]
            },
            {
                id: 'btc-20',
                title: 'Module 20: Bitcoin Anonymity, Privacy & CoinJoins',
                level: 'Advanced', duration: '25 Mins', icon: ShieldCheck,
                topics: [{
                    title: 'Pseudonymous vs Anonymous Tracking',
                    content: `Every Bitcoin transaction is etched into history publicly; it is not naturally fully anonymous.

### 🕶️ Privacy Best Practices

* **Address Reuse Danger**: Reusing the same address reveals your total stash and transactional links.
* **CoinJoin Protocols**: Merging UTXOs with other users to break the digital tracing chain back to your identity.`
                }]
            }
        ]
    },
    {
        name: 'Phase 5 — Hyperbitcoinization & Institutions',
        icon: Award,
        modules: [
            {
                id: 'btc-21',
                title: 'Module 21: The Institutional Wall: Bitcoin Spot ETFs',
                level: 'Crucial', duration: '30 Mins', icon: Briefcase,
                topics: [{
                    title: 'Bridging Wall Street Pipelines',
                    content: `Spot ETFs allow institutional retirement funds to access physical Bitcoin price action via traditional brokerage accounts.

### 🏛️ ETF Mechanics

* **Direct Asset Buying**: The fund issuers (BlackRock, Fidelity) must legally acquire and hold physical Bitcoin in cold vaults equivalent to client capital.`
                }]
            },
            {
                id: 'btc-22',
                title: 'Module 22: Corporate Treasury & The MicroStrategy Model',
                level: 'Crucial', duration: '25 Mins', icon: FileText,
                topics: [{
                    title: 'Replacing Fiat Reserves with Pristine Collateral',
                    content: `Companies are replacing decaying fiat cash reserves on their corporate balance sheets with Bitcoin.

### 🏢 Corporate Reserve

* **Treasury Asset**: Holding Bitcoin prevents annual corporate inflation depreciation.
* **Debt Leverage**: Issuing convertible corporate bonds to acquire harder collateral assets.`
                }]
            },
            {
                id: 'btc-23',
                title: 'Module 23: Nation-State Adoption & Legal Tender',
                level: 'Crucial', duration: '30 Mins', icon: Globe,
                topics: [{
                    title: 'The El Salvador Paradigm Shift',
                    content: `Nations are declaring Bitcoin legal tender to gain financial autonomy and attract investment.

### 🇸🇻 Sovereign Adoption

* **El Salvador (2021)**: The first nation declaring Bitcoin legal tender alongside the USD.
* **Volcanic Mining**: Harnessing natural geothermal energy to mine Bitcoin direct to state coffers.`
                }]
            },
            {
                id: 'btc-24',
                title: 'Module 24: Valuation Models: PlanB, Realized Cap & Thermocap',
                level: 'Crucial', duration: '30 Mins', icon: Scale,
                topics: [{
                    title: 'Measuring the Intrinsic Worth of Data',
                    content: `How do you model value for an asset without dividend yield or direct cashflows?

### 📈 Bitcoin Valuations

* **Realized Cap**: Pricing each coin UTXO based on when it was last moved, removing inactive/lost coins from calculation.
* **Delta / Top Models**: Historical algorithmic indicators signaling macro market cycle extremes.`
                }]
            },
            {
                id: 'btc-25',
                title: 'Module 25: Hyperbitcoinization & The Orange Future',
                level: 'Crucial', duration: '35 Mins', icon: Award,
                topics: [{
                    title: 'Visualizing a World on a Bitcoin Standard',
                    content: `What does society look like when money cannot be debased, manipulated, or censored by authorities?

### 🌍 The Orange Horizon

* **Low Time Preference**: Saving becomes viable, encouraging long-term societal building instead of rampant, cheap consumption.
* **Decentralized Prosperity**: Global frictionless payment parity for every human without discrimination.`
                }]
            }
        ]
    }
];
