import React, { useState, useEffect } from 'react';
import { 
    LineChart, 
    TrendingUp, 
    TrendingDown, 
    Briefcase, 
    ArrowRight, 
    Search, 
    Filter, 
    DollarSign, 
    IndianRupee, 
    Clock, 
    Activity, 
    ArrowUpRight, 
    ArrowDownRight, 
    CheckCircle2, 
    Plus, 
    History, 
    Shield, 
    Info, 
    ChevronRight,
    Globe,
    Wallet
} from 'lucide-react';
import '../App.css';

// Initial Mock Portfolio Data
const INITIAL_PORTFOLIO = [
    { id: 'S1', ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', quantity: 120, avgCost: 2450.50, ltp: 2840.20, segment: 'Equity', change: 1.45 },
    { id: 'S2', ticker: 'TCS', name: 'Tata Consultancy Services', quantity: 45, avgCost: 3200.00, ltp: 3850.45, segment: 'Equity', change: -0.32 },
    { id: 'S3', ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', quantity: 250, avgCost: 1420.10, ltp: 1610.00, segment: 'Equity', change: 0.85 },
    { id: 'S4', ticker: 'NIFTY_BEES', name: 'Nippon India Nifty 50 ETF', quantity: 1500, avgCost: 185.40, ltp: 234.10, segment: 'ETF', change: 1.20 },
    { id: 'S5', ticker: 'INFY', name: 'Infosys Technologies Ltd.', quantity: 85, avgCost: 1550.75, ltp: 1420.30, segment: 'Equity', change: -1.85 }
];

const WATCHLIST = [
    { ticker: 'TATASTEEL', name: 'Tata Steel Ltd.', ltp: 155.20, change: 2.45 },
    { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', ltp: 1220.50, change: 0.95 },
    { ticker: 'ZOMATO', name: 'Zomato Ltd.', ltp: 194.80, change: 4.20 },
    { ticker: 'ITC', name: 'ITC Ltd.', ltp: 430.15, change: -0.15 },
    { ticker: 'WIPRO', name: 'Wipro Ltd.', ltp: 465.40, change: -1.10 }
];

const BusinessTrading = () => {
    const [portfolio, setPortfolio] = useState(() => {
        const local = localStorage.getItem('cliks_trading_portfolio');
        return local ? JSON.parse(local) : INITIAL_PORTFOLIO;
    });
    
    const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'markets' | 'orders' | 'margin'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [tradeModal, setTradeModal] = useState({ isOpen: false, type: 'BUY' });
    const [tradeForm, setTradeForm] = useState({ quantity: '', price: '' });
    const [liveTick, setLiveTick] = useState(0);

    // Simulate ticking prices every few seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setPortfolio(prev => prev.map(asset => {
                const randTick = (Math.random() - 0.5) * 2.5; // Random movement
                const newLtp = parseFloat((asset.ltp + randTick).toFixed(2));
                const newChange = parseFloat((((newLtp - asset.avgCost) / asset.avgCost) * 100).toFixed(2));
                return { ...asset, ltp: newLtp > 1 ? newLtp : asset.ltp };
            }));
            setLiveTick(t => t + 1);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const savePortfolio = (data) => {
        setPortfolio(data);
        localStorage.setItem('cliks_trading_portfolio', JSON.stringify(data));
    };

    // Calculations
    const totalInvestment = portfolio.reduce((sum, item) => sum + (item.avgCost * item.quantity), 0);
    const currentValuation = portfolio.reduce((sum, item) => sum + (item.ltp * item.quantity), 0);
    const totalPnL = currentValuation - totalInvestment;
    const pnlPercentage = (totalPnL / (totalInvestment || 1)) * 100;
    const dailyPnL = portfolio.reduce((sum, item) => sum + ((item.ltp * (item.change / 100)) * item.quantity), 0); // Simulated daily movement

    const handleTradeSubmit = (e) => {
        e.preventDefault();
        if (!selectedAsset || !tradeForm.quantity) return;

        const qty = parseInt(tradeForm.quantity);
        const cost = parseFloat(tradeForm.price) || selectedAsset.ltp;

        let updated = [...portfolio];
        const existingIdx = updated.findIndex(i => i.ticker === selectedAsset.ticker);

        if (tradeModal.type === 'BUY') {
            if (existingIdx > -1) {
                const current = updated[existingIdx];
                const totalQty = current.quantity + qty;
                const newAvg = ((current.avgCost * current.quantity) + (cost * qty)) / totalQty;
                updated[existingIdx] = {
                    ...current,
                    quantity: totalQty,
                    avgCost: parseFloat(newAvg.toFixed(2)),
                    ltp: cost
                };
            } else {
                updated.push({
                    id: `S${Date.now()}`,
                    ticker: selectedAsset.ticker,
                    name: selectedAsset.name,
                    quantity: qty,
                    avgCost: cost,
                    ltp: cost,
                    segment: 'Equity',
                    change: 0
                });
            }
        } else { // SELL
            if (existingIdx > -1) {
                const current = updated[existingIdx];
                if (qty > current.quantity) {
                    alert('Insufficient holdings to complete sale.');
                    return;
                }
                const remaining = current.quantity - qty;
                if (remaining === 0) {
                    updated = updated.filter(i => i.ticker !== selectedAsset.ticker);
                } else {
                    updated[existingIdx] = {
                        ...current,
                        quantity: remaining,
                        ltp: cost
                    };
                }
            } else {
                alert('You do not own this stock in your portfolio.');
                return;
            }
        }

        savePortfolio(updated);
        setTradeModal({ isOpen: false, type: 'BUY' });
        setTradeForm({ quantity: '', price: '' });
        alert(`Successfully executed ${tradeModal.type} order for ${qty} shares of ${selectedAsset.ticker}!`);
    };

    const filteredPortfolio = portfolio.filter(item => 
        item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem 2.5rem', background: '#FAFDFB', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}>
                            <LineChart size={22} />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Enterprise Trading Desk</h1>
                    </div>
                    <p style={{ color: '#64748B', fontWeight: '500', fontSize: '0.95rem' }}>Simulate corporate equity portfolios, manage liquid treasury assets and view live market indices.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }} className="animate-ping" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Live NSE/BSE Connection Active</span>
                </div>
            </div>

            {/* Master Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Current Valuation', value: `₹${currentValuation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: Briefcase, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Total Investment', value: `₹${totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: IndianRupee, color: '#0D9488', bg: '#CCFBF1' },
                    { 
                        label: 'Total Unrealized P&L', 
                        value: `${totalPnL >= 0 ? '+' : ''}₹${totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 
                        sub: `${totalPnL >= 0 ? '▲' : '▼'} ${Math.abs(pnlPercentage).toFixed(2)}%`,
                        icon: totalPnL >= 0 ? TrendingUp : TrendingDown, 
                        color: totalPnL >= 0 ? '#1B6B3A' : '#EF4444', 
                        bg: totalPnL >= 0 ? '#DCF2E4' : '#FEE2E2' 
                    },
                    { label: 'Trading Margin Available', value: '₹5,20,000.00', icon: Wallet, color: '#3B82F6', bg: '#DBEAFE' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{stat.value}</h3>
                            {stat.sub && (
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: stat.color, marginTop: '0.2rem', display: 'inline-block' }}>{stat.sub}</span>
                            )}
                        </div>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Menu */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('portfolio')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'portfolio' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'portfolio' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📈 Current Holdings
                </button>
                <button 
                    onClick={() => setActiveTab('markets')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'markets' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'markets' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    ⚡ Watchlist & Markets
                </button>
                <button 
                    onClick={() => setActiveTab('orders')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'orders' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'orders' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📜 Order Log
                </button>
            </div>

            {/* 1. HOLDINGS PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '400px', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <Search size={16} style={{ color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search holdings..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', fontWeight: '500' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#EFF6FF', color: '#3B82F6', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>Total Scrips: {portfolio.length}</span>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '700', background: '#F8FAFC' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instrument</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Qty</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Avg. Cost</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>LTP</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Current Value</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>P&L</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPortfolio.map(item => {
                                    const cost = item.avgCost * item.quantity;
                                    const value = item.ltp * item.quantity;
                                    const pnl = value - cost;
                                    const pnlPct = ((item.ltp - item.avgCost) / item.avgCost) * 100;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                                                        <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{item.ticker}</strong>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#F1F5F9', color: '#64748B' }}>{item.segment}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>{item.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '700', color: '#334155' }}>{item.quantity}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#64748B', fontWeight: '500' }}>₹{item.avgCost.toFixed(2)}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#0F172A', fontWeight: '700' }}>₹{item.ltp.toFixed(2)}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#0F172A', fontWeight: '800' }}>₹{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: '800', color: pnl >= 0 ? '#1B6B3A' : '#EF4444', fontSize: '0.9rem' }}>
                                                        {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: pnl >= 0 ? '#1B6B3A' : '#EF4444' }}>
                                                        {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPct).toFixed(2)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button 
                                                        onClick={() => { setSelectedAsset(item); setTradeModal({ isOpen: true, type: 'BUY' }); }}
                                                        style={{ background: '#E8F5EE', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        BUY
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedAsset(item); setTradeModal({ isOpen: true, type: 'SELL' }); }}
                                                        style={{ background: '#FEE2E2', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#EF4444', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        SELL
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2. WATCHLIST & MARKETS TAB */}
            {activeTab === 'markets' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.25rem' }}>🚀 Standard Equity Watchlist</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {WATCHLIST.map(w => (
                                <div key={w.ticker} style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#FAFDFB', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{w.ticker}</strong>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{w.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '800', color: '#0F172A' }}>₹{w.ltp.toFixed(2)}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: w.change >= 0 ? '#1B6B3A' : '#EF4444' }}>
                                                {w.change >= 0 ? '+' : ''}{w.change}%
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => { setSelectedAsset(w); setTradeModal({ isOpen: true, type: 'BUY' }); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#1B6B3A', border: 'none', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '750', cursor: 'pointer' }}
                                        >
                                            <Plus size={12} /> Trade
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '850', color: '#064E3B', marginBottom: '1rem' }}>🌍 Global Market Benchmarks</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { index: 'NIFTY 50', value: '22,450.20', change: 1.25, isUp: true },
                                    { index: 'SENSEX', value: '73,910.45', change: 1.10, isUp: true },
                                    { index: 'NIFTY BANK', value: '47,820.00', change: -0.45, isUp: false },
                                    { index: 'NASDAQ 100', value: '18,210.50', change: 0.88, isUp: true }
                                ].map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155' }}>{m.index}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{m.value}</strong>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: m.isUp ? '#1B6B3A' : '#EF4444' }}>
                                                {m.isUp ? '▲' : '▼'} {m.change}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. ORDER LOG TAB */}
            {activeTab === 'orders' && (
                <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <History size={48} style={{ color: '#94A3B8', margin: '0 auto 1.25rem' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>All Orders Filled</h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '0.85rem' }}>All transaction orders are processed and settled directly to your enterprise ledger account.</p>
                </div>
            )}

            {/* TRADE MODAL DIALOG */}
            {tradeModal.isOpen && selectedAsset && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} className="animate-in fade-in zoom-in-95 duration-200">
                        <div style={{ 
                            background: tradeModal.type === 'BUY' ? 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)' : 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)', 
                            padding: '1.5rem', 
                            color: 'white' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {tradeModal.type} Order
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', marginTop: '0.5rem' }}>{selectedAsset.ticker}</h3>
                                    <p style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: '500' }}>{selectedAsset.name}</p>
                                </div>
                                <button onClick={() => setTradeModal({ isOpen: false, type: 'BUY' })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>
                        </div>

                        <form onSubmit={handleTradeSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Market LTP</label>
                                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', fontWeight: '800', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                                        ₹{selectedAsset.ltp?.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Required Quantity</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1" 
                                        value={tradeForm.quantity} 
                                        onChange={e => setTradeForm({ ...tradeForm, quantity: e.target.value })} 
                                        placeholder="0"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Limit Price (Leave empty for Market)</label>
                                <input 
                                    type="number" 
                                    step="0.05"
                                    value={tradeForm.price} 
                                    onChange={e => setTradeForm({ ...tradeForm, price: e.target.value })} 
                                    placeholder={`Market Rate (₹${selectedAsset.ltp?.toFixed(2)})`}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', outline: 'none' }}
                                />
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>Estimated Total Value:</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                                        ₹{((parseFloat(tradeForm.price) || selectedAsset.ltp) * (parseInt(tradeForm.quantity) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </strong>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                style={{ 
                                    width: '100%', 
                                    padding: '0.9rem', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    background: tradeModal.type === 'BUY' ? 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)' : 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
                                    color: 'white', 
                                    fontWeight: '800', 
                                    fontSize: '0.95rem', 
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Confirm {tradeModal.type} Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessTrading;
