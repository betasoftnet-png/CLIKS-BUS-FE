import React, { useState, useEffect } from 'react';

import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, X, Search, IndianRupee, Loader } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';
import { useCurrency } from '../context';

const BusinessWallet = () => {
    const { currency, formatCurrency } = useCurrency();
    // Persisted LocalState for the Wallet context
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem('cliks_wallet_balance');
        return saved ? parseFloat(saved) : 25000.00;
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('cliks_wallet_history');
        return saved ? JSON.parse(saved) : [
            { id: 'TX-48901', type: 'CREDIT', amount: 15000, description: 'Opening Balance Auto Load', date: '14 May, 2026 • 10:24 AM' },
            { id: 'TX-48902', type: 'DEBIT', amount: 3500, description: 'Supplier Settlement (Disbursement)', date: '13 May, 2026 • 04:45 PM' },
            { id: 'TX-48903', type: 'CREDIT', amount: 13500, description: 'Quick QR Fund Transfer', date: '12 May, 2026 • 11:15 AM' }
        ];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [colFilters, setColFilters] = React.useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [addForm, setAddForm] = useState({ amount: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    // Reward points state synced with localStorage
    const [rewardPoints, setRewardPoints] = useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1450;
    });

    const [activeTab, setActiveTab] = useState('gateway'); // 'gateway' | 'points'
    const [pointsToConvert, setPointsToConvert] = useState('');

    // Auto-open Add Money modal if navigated from sidebar button
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('addMoney') === 'true') {
            setIsModalOpen(true);
            if (params.get('tab') === 'points') {
                setActiveTab('points');
            }
        }
    }, [location.search]);

    // Update persisted storage on mutation
    useEffect(() => {
        localStorage.setItem('cliks_wallet_balance', balance.toString());
    }, [balance]);

    useEffect(() => {
        localStorage.setItem('cliks_wallet_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('cliks_reward_points', rewardPoints.toString());
    }, [rewardPoints]);

    const handleConvertPoints = (e) => {
        e.preventDefault();
        const pts = parseInt(pointsToConvert, 10);
        if (isNaN(pts) || pts <= 0) {
            alert('Please enter a valid amount of points to convert.');
            return;
        }
        if (pts > rewardPoints) {
            alert(`Insufficient points balance. You have ${rewardPoints} points.`);
            return;
        }

        const creditAmount = pts / 100; // 100 Points = 1.00 Rupee
        const now = new Date();
        const formattedDate = now.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        
        const newTxId = `TX-PTS-${Date.now()}`;
        const newTx = {
            id: newTxId,
            type: 'CREDIT',
            amount: creditAmount,
            description: `Loyalty Points Conversion (${pts} Pts converted)`,
            date: formattedDate
        };

        setRewardPoints(prev => prev - pts);
        setBalance(prev => prev + creditAmount);
        setHistory(prev => [newTx, ...prev]);
        setPointsToConvert('');
        setIsModalOpen(false);
        alert(`🎉 Successfully converted ${pts} reward points to ${formatCurrency(creditAmount)}!`);
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        const amt = parseFloat(addForm.amount);
        if (isNaN(amt) || amt < 500) {
            alert(`Minimum load amount is ${formatCurrency(500)}.`);
            return;
        }

        try {
            setIsProcessing(true);
            const generatedOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 999)}`;

            let paymentSessionId = null;
            let actualOrderId = generatedOrderId;

            // PREFERENCE 1: Secure Production Backend Proxy (Bypasses CORS & Prevents Token Exposure)
            try {
                const backendData = await apiClient.post('/payments/create-order', {
                    amount: amt,
                    orderId: generatedOrderId,
                    currency: currency?.code || 'INR'
                });
                
                if (backendData && backendData.data && backendData.data.payment_session_id) {
                    paymentSessionId = backendData.data.payment_session_id;
                    actualOrderId = backendData.data.order_id || generatedOrderId;
                    console.log("[WALLET PROD LOG]: Retrieved payment session securely from backend pipeline.");
                } else {
                    throw new Error("Malformed session received from server cluster.");
                }
            } catch (backendErr) {
                console.error("[WALLET PROD ERROR]:", backendErr);
                throw new Error(backendErr.message || "Secure backend gateway offline. Payment cannot proceed.");
            }

            if (!paymentSessionId) {
                throw new Error("Session Token missing in payload chain.");
            }

            // Step 2: Initialize Native Cashfree SDK for React Client
            const cashfree = await load({
                mode: "sandbox"
            });

            // Step 3: Launch the Native IFrame Checkout Modal inside Cliks UI
            const checkoutOptions = {
                paymentSessionId: paymentSessionId,
                redirectTarget: "_modal"
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    alert("Gateway Interrupted: " + result.error.message);
                } else {
                    // Successful flow settlement
                    executeLocalWalletCredit(amt, actualOrderId);
                }
            });

        } catch (err) {
            console.warn("[CASHFREE GATEWAY LOGGER]:", err.message);
            
            // Display the actual error message instead of defaulting to a CORS warning
            const shouldSimulate = await customConfirm(
                `🚨 [CASHFREE GATEWAY ERROR]\n\n` +
                `Transaction Handshake Failed: ${err.message}\n\n` +
                `Would you like to simulate a SUCCESSFUL Gateway callback anyway to test UI loading logic?`
            );

            if (shouldSimulate) {
                executeLocalWalletCredit(amt, `TX-${Math.floor(10000 + Math.random() * 90000)}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const executeLocalWalletCredit = (amt, txnId) => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        const newTx = {
            id: txnId,
            type: 'CREDIT',
            amount: amt,
            description: addForm.description.trim() || '',
            date: formattedDate
        };

        setBalance(prev => prev + amt);
        setHistory(prev => [newTx, ...prev]);
        setAddForm({ amount: '', description: '' });
        setIsModalOpen(false);
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchId = !colFilters.transaction_id || item.id.toLowerCase().includes(colFilters.transaction_id.toLowerCase());
        const matchDate = !colFilters.date || item.date.toLowerCase().includes(colFilters.date.toLowerCase());
        const matchDesc = !colFilters.description || item.description.toLowerCase().includes(colFilters.description.toLowerCase());
        const matchDirection = !colFilters.direction || (item.type === 'CREDIT' ? 'in' : 'out').includes(colFilters.direction.toLowerCase());
        const matchAmount = !colFilters.amount || String(item.amount).includes(colFilters.amount);

        return matchesSearch && matchId && matchDate && matchDesc && matchDirection && matchAmount;
    });

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Simple Header Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)'
                    }}>
                        <Wallet size={22} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>Beta Wallet</h1>
                        <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0.25rem 0 0 0', fontWeight: '500' }}>Manage stored value balances and load funds securely.</p>
                    </div>
                </div>
            </div>

            {/* Interactive Balance Dashboard Card */}
            <div style={{ 
                flexShrink: 0,
                background: 'white', 
                borderRadius: '24px', 
                padding: '2.5rem', 
                border: '1px solid #E2E8F0', 
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)', 
                marginBottom: '2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Stored Balance</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B', marginRight: '2px' }}>{currency.symbol}</span>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '850', color: '#064E3B', margin: 0, letterSpacing: '-0.01em' }}>
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem', 
                        padding: '1rem 2rem', 
                        borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        color: 'white', 
                        border: 'none', 
                        fontWeight: '800', 
                        fontSize: '1rem',
                        cursor: 'pointer', 
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} strokeWidth={3} /> Add Money
                </button>
            </div>

            {/* Action Table Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                
                {/* Table Toolbar header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>Wallet History</h3>
                    
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search descriptions or IDs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.65rem 1rem 0.65rem 2.5rem', 
                                borderRadius: '12px', 
                                border: '1px solid #E2E8F0', 
                                outline: 'none',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>
                </div>

                {/* History Display Grid/Table */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead columns={[
        { key: 'transaction_id', label: 'Transaction ID', placeholder: 'e.g. TXN-001' },
        { key: 'date', label: 'Date & Time', placeholder: 'e.g. 2026-05' },
        { key: 'description', label: 'Description', placeholder: 'Desc' },
        { key: 'direction', label: 'Direction', placeholder: 'e.g. Credit' },
        { key: 'amount', label: 'Amount', placeholder: 'e.g. 500' }
    ]} onFilterChange={setColFilters} />
                        <tbody>
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600', fontSize: '0.9rem' }}>
                                        No transaction matching records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((tx) => {
                                    const isCredit = tx.type === 'CREDIT';
                                    return (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <span style={{ fontFamily: 'monospace', fontWeight: '750', color: '#64748B', fontSize: '0.85rem' }}>{tx.id}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>{tx.date}</td>
                                            <td style={{ padding: '1.25rem 2rem', fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{tx.description || '-'}</td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.35rem', 
                                                    padding: '0.35rem 0.65rem', 
                                                    borderRadius: '8px', 
                                                    background: isCredit ? '#ECFDF5' : '#FEF2F2', 
                                                    color: isCredit ? '#059669' : '#DC2626',
                                                    fontWeight: '800',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {isCredit ? <ArrowDownLeft size={13} strokeWidth={3} /> : <ArrowUpRight size={13} strokeWidth={3} />}
                                                    {isCredit ? 'IN' : 'OUT'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', textAlign: 'right', fontWeight: '900', color: isCredit ? '#059669' : '#DC2626', fontSize: '0.95rem' }}>
                                                {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simplistic Beautiful Modal for Add Money */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Add Money to Wallet</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }}><X size={18} /></button>
                        </div>

                        {/* Elegant Tab Switcher */}
                        <div style={{ 
                            display: 'flex', 
                            background: '#F1F5F9', 
                            padding: '0.25rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem',
                            gap: '0.25rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => setActiveTab('gateway')}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem 0.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    background: activeTab === 'gateway' ? 'white' : 'transparent',
                                    color: activeTab === 'gateway' ? '#064E3B' : '#64748B',
                                    boxShadow: activeTab === 'gateway' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                UPI / Bank Load
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('points')}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem 0.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    background: activeTab === 'points' ? 'white' : 'transparent',
                                    color: activeTab === 'points' ? '#064E3B' : '#64748B',
                                    boxShadow: activeTab === 'points' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Convert Points
                            </button>
                        </div>

                        {activeTab === 'gateway' ? (
                            <form onSubmit={handleAddMoney} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Load Amount ({currency.code})</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{currency.symbol}</span>
                                        <input 
                                            required 
                                            autoFocus
                                            type="number" 
                                            min="500"
                                            placeholder="500.00"
                                            value={addForm.amount} 
                                            onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })} 
                                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.2rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.1rem', fontWeight: '750', color: '#0F172A' }} 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Brief Note / Description</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. UPI Top-up, Bank Load"
                                        value={addForm.description} 
                                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} 
                                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#1E293B' }} 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.9rem', 
                                        borderRadius: '12px', 
                                        background: isProcessing ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                        color: 'white', 
                                        border: 'none', 
                                        fontWeight: '850', 
                                        fontSize: '1rem', 
                                        cursor: isProcessing ? 'not-allowed' : 'pointer', 
                                        boxShadow: isProcessing ? 'none' : '0 8px 16px rgba(27, 107, 58, 0.25)',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader className="animate-spin" size={18} /> Connecting Gateway...
                                        </>
                                    ) : (
                                        'Confirm Load'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleConvertPoints} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Points Balance Indicator */}
                                <div style={{ 
                                    background: '#F0FDF4', 
                                    border: '1px solid #DCFCE7', 
                                    borderRadius: '12px', 
                                    padding: '0.85rem 1rem', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#15803D' }}>Current Reward Points:</span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#15803D' }}>{rewardPoints.toLocaleString()} Pts</span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Points to Convert</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            required 
                                            autoFocus
                                            type="number" 
                                            min="1"
                                            max={rewardPoints}
                                            placeholder="Enter points (e.g. 500)"
                                            value={pointsToConvert} 
                                            onChange={(e) => setPointsToConvert(e.target.value)} 
                                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.1rem', fontWeight: '750', color: '#0F172A' }} 
                                        />
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: '600', display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                                        <span>Rate: 100 Pts = {currency.symbol}1.00</span>
                                        {pointsToConvert && !isNaN(parseInt(pointsToConvert)) && (
                                            <span style={{ color: '#059669', fontWeight: '800' }}>
                                                You get: {formatCurrency(parseInt(pointsToConvert) / 100)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.9rem', 
                                        borderRadius: '12px', 
                                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                        color: 'white', 
                                        border: 'none', 
                                        fontWeight: '850', 
                                        fontSize: '1rem', 
                                        cursor: 'pointer', 
                                        boxShadow: '0 8px 16px rgba(27, 107, 58, 0.25)',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    Convert Points Now
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessWallet;
