import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../context';
import {
    Plus,
    Search,
    Users,
    Receipt,
    Calendar,
    ChevronRight,
    Trash2,
    X,
    ChevronLeft,
    Globe,
    FileText,
    Check,
    AlertCircle,
    ArrowRight,
    UserPlus,
    Upload,
    DollarSign,
    CreditCard,
    Share2,
    Download,
    Pin,
    MoreVertical
} from 'lucide-react';
import '../App.css';
import splitExpenseService from '../services/splitExpenseService';

// Initial Seed Data for Split Groups
const INITIAL_SPLITS = [];

const BusinessSplitCollect = () => {
    const { currency } = useCurrency();
    // ── State Management ───────────────────────────────────────────────────
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [pinnedSplitIds, setPinnedSplitIds] = useState(() => {
        const saved = localStorage.getItem('cliks_pinned_splits');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const handleGlobalClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const [selectedSplitId, setSelectedSplitId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [detailSearchQuery, setDetailSearchQuery] = useState('');
    const [showDetailSearch, setShowDetailSearch] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    
    // Group Form State
    const [groupForm, setGroupForm] = useState({
        title: '',
        currency: (() => {
            try {
                return JSON.parse(localStorage.getItem('cliks_currency') || '{}')?.code || 'INR';
            } catch {
                return 'INR';
            }
        })(),
        description: '',
        participants: ['You']
    });
    const [newParticipantName, setNewParticipantName] = useState('');

    // Expense Form State
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        paidBy: 'You',
        date: new Date().toISOString().split('T')[0],
        attachmentName: '',
        splitType: 'equal', // equal, custom
        shares: {} // Custom shares per participant
    });

    // Fetch splits from backend on mount
    useEffect(() => {
        const loadSplits = async () => {
            try {
                setLoading(true);
                const data = await splitExpenseService.getSplits();
                if (data && data.length > 0) {
                    setSplits(data);
                } else {
                    setSplits([]);
                }
            } catch (err) {
                console.error("Error loading split data from backend:", err);
                const saved = localStorage.getItem('cliks_splits_data');
                setSplits(saved ? JSON.parse(saved) : []);
            } finally {
                setLoading(false);
            }
        };
        loadSplits();
    }, []);

    // Active Split Lookup
    const activeSplit = splits.find(s => s.id === selectedSplitId);

    // Filtered Splits List
    const filteredSplits = splits.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Currency Symbols Helper
    const getCurrencySymbol = (code) => {
        switch (code) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            default: return code === currency.code ? currency.symbol : '₹';
        }
    };

    // ── Group Actions ──────────────────────────────────────────────────────
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupForm.title.trim()) return alert('Please enter a group title.');
        if (groupForm.participants.length < 2) return alert('Please add at least one other participant.');

        const tempId = 'split-' + Date.now();
        const newGroup = {
            id: tempId,
            title: groupForm.title,
            currency: groupForm.currency,
            currencySymbol: getCurrencySymbol(groupForm.currency),
            description: groupForm.description,
            participants: [...groupForm.participants],
            created_at: new Date().toISOString(),
            expenses: []
        };

        try {
            const created = await splitExpenseService.createSplit(newGroup);
            created.expenses = [];
            setSplits([created, ...splits]);
            setSelectedSplitId(created.id);
        } catch (err) {
            console.error("Error creating group on backend:", err);
            setSplits([newGroup, ...splits]);
            setSelectedSplitId(tempId);
        }

        setIsCreateGroupModalOpen(false);
        setGroupForm({ title: '', currency: 'INR', description: '', participants: ['You'] });
    };

    const addParticipantToForm = () => {
        if (!newParticipantName.trim()) return;
        if (groupForm.participants.includes(newParticipantName.trim())) {
            alert('This participant is already added!');
            return;
        }
        setGroupForm({
            ...groupForm,
            participants: [...groupForm.participants, newParticipantName.trim()]
        });
        setNewParticipantName('');
    };

    const removeParticipantFromForm = (name) => {
        if (name === 'You') return;
        setGroupForm({
            ...groupForm,
            participants: groupForm.participants.filter(p => p !== name)
        });
    };

    const handleDeleteGroup = async (groupId) => {
        if (window.confirm('Are you sure you want to delete this split group? All logged expenses will be lost.')) {
            try {
                await splitExpenseService.deleteSplit(groupId);
            } catch (err) {
                console.error("Error deleting group from backend:", err);
            }
            setSplits(splits.filter(s => s.id !== groupId));
            setSelectedSplitId(null);
        }
    };

    // ── Expense Actions ────────────────────────────────────────────────────
    const openAddExpenseModal = () => {
        if (!activeSplit) return;
        // Initialize shares
        const initialShares = {};
        activeSplit.participants.forEach(p => {
            initialShares[p] = '';
        });
        setExpenseForm({
            title: '',
            amount: '',
            paidBy: 'You',
            date: new Date().toISOString().split('T')[0],
            attachmentName: '',
            splitType: 'equal',
            shares: initialShares
        });
        setIsAddExpenseModalOpen(true);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expenseForm.title.trim()) return alert('Please enter expense title.');
        const amount = parseFloat(expenseForm.amount);
        if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount.');

        let finalShares = {};
        if (expenseForm.splitType === 'equal') {
            const equalShare = amount / activeSplit.participants.length;
            activeSplit.participants.forEach(p => {
                finalShares[p] = Math.round(equalShare * 100) / 100;
            });
        } else {
            // Validate custom shares sum matches total amount
            let sum = 0;
            activeSplit.participants.forEach(p => {
                const share = parseFloat(expenseForm.shares[p]) || 0;
                finalShares[p] = share;
                sum += share;
            });
            
            if (Math.abs(sum - amount) > 0.1) {
                alert(`The sum of custom shares (${activeSplit.currencySymbol}${sum.toFixed(2)}) must exactly match the total expense amount (${activeSplit.currencySymbol}${amount.toFixed(2)})!`);
                return;
            }
        }

        const newExpense = {
            id: 'exp-' + Date.now(),
            title: expenseForm.title,
            amount: amount,
            paidBy: expenseForm.paidBy,
            date: expenseForm.date,
            attachment: expenseForm.attachmentName || null,
            splitType: expenseForm.splitType,
            shares: finalShares
        };

        try {
            const createdExpense = await splitExpenseService.addExpense(selectedSplitId, newExpense);
            const updatedSplits = splits.map(s => {
                if (s.id === selectedSplitId) {
                    return {
                        ...s,
                        expenses: [createdExpense, ...s.expenses]
                    };
                }
                return s;
            });
            setSplits(updatedSplits);
        } catch (err) {
            console.error("Error saving expense to backend:", err);
            // Fallback to local state update
            const updatedSplits = splits.map(s => {
                if (s.id === selectedSplitId) {
                    return {
                        ...s,
                        expenses: [newExpense, ...s.expenses]
                    };
                }
                return s;
            });
            setSplits(updatedSplits);
        }

        setIsAddExpenseModalOpen(false);
    };

    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Delete this expense?')) {
            try {
                await splitExpenseService.deleteExpense(selectedSplitId, expenseId);
            } catch (err) {
                console.error("Error deleting expense from backend:", err);
            }
            const updatedSplits = splits.map(s => {
                if (s.id === selectedSplitId) {
                    return {
                        ...s,
                        expenses: s.expenses.filter(e => e.id !== expenseId)
                    };
                }
                return s;
            });
            setSplits(updatedSplits);
        }
    };

    // Simulated Attachment Upload
    const triggerSimulatedUpload = () => {
        const fileNames = ['invoice_rent.pdf', 'dinner_bill_482.jpg', 'uber_receipt.png', 'supplies_list.pdf', 'grocery_slip.jpg'];
        const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
        setExpenseForm({
            ...expenseForm,
            attachmentName: randomName
        });
    };

    // ── Debts & Balances Calculations ──────────────────────────────────────
    const calculatedBalances = React.useMemo(() => {
        if (!activeSplit) return { members: {}, debts: [], totalSpent: 0 };

        const balances = {};
        let totalSpent = 0;
        activeSplit.participants.forEach(p => {
            balances[p] = 0;
        });

        activeSplit.expenses.forEach(exp => {
            const payer = exp.paidBy;
            const amt = exp.amount;
            totalSpent += amt;

            // Credit the payer
            if (balances[payer] !== undefined) {
                balances[payer] += amt;
            }

            // Debit everyone who shared
            Object.keys(exp.shares).forEach(member => {
                if (balances[member] !== undefined) {
                    balances[member] -= exp.shares[member];
                }
            });
        });

        // Deep copy balances for debt simplification
        const tempBalances = { ...balances };
        const debts = [];

        // Simplify debts algorithm (Splitwise style)
        const participants = Object.keys(tempBalances);
        
        while (true) {
            let debtor = null;
            let creditor = null;
            let maxDebit = 0;
            let maxCredit = 0;

            participants.forEach(p => {
                const bal = tempBalances[p];
                if (bal < -0.01 && bal < maxDebit) {
                    maxDebit = bal;
                    debtor = p;
                }
                if (bal > 0.01 && bal > maxCredit) {
                    maxCredit = bal;
                    creditor = p;
                }
            });

            if (!debtor || !creditor) break;

            const amtToSettle = Math.min(-maxDebit, maxCredit);
            tempBalances[debtor] += amtToSettle;
            tempBalances[creditor] -= amtToSettle;

            debts.push({
                from: debtor,
                to: creditor,
                amount: Math.round(amtToSettle * 100) / 100
            });
        }

        return {
            members: balances,
            debts: debts,
            totalSpent: totalSpent
        };
    }, [activeSplit]);

    // Handle instant settlement log
    const handleSettleDebt = async (debt) => {
        if (!activeSplit) return;
        if (window.confirm(`Mark settlement: does ${debt.from} paid ${activeSplit.currencySymbol}${debt.amount.toLocaleString()} to ${debt.to}?`)) {
            // Settle creates a custom expense compensating the debt
            const settlementExpense = {
                id: 'exp-settle-' + Date.now(),
                title: `Settlement: ${debt.from} paid ${debt.to}`,
                amount: debt.amount,
                paidBy: debt.from,
                date: new Date().toISOString().split('T')[0],
                attachment: null,
                splitType: 'custom',
                shares: {
                    [debt.to]: debt.amount
                }
            };

            // Set shares to 0 for everyone else
            activeSplit.participants.forEach(p => {
                if (p !== debt.to) {
                    settlementExpense.shares[p] = 0;
                }
            });

            try {
                const createdSettlement = await splitExpenseService.addExpense(selectedSplitId, settlementExpense);
                const updatedSplits = splits.map(s => {
                    if (s.id === selectedSplitId) {
                        return {
                            ...s,
                            expenses: [createdSettlement, ...s.expenses]
                        };
                    }
                    return s;
                });
                setSplits(updatedSplits);
                alert('Settlement logged perfectly!');
            } catch (err) {
                console.error("Error saving settlement to backend:", err);
                // Fallback to local state update
                const updatedSplits = splits.map(s => {
                    if (s.id === selectedSplitId) {
                        return {
                            ...s,
                            expenses: [settlementExpense, ...s.expenses]
                        };
                    }
                    return s;
                });
                setSplits(updatedSplits);
                alert('Settlement logged perfectly!');
            }
        }
    };

    const handleShareGroup = () => {
        if (!activeSplit) return;
        const groupTotal = activeSplit.expenses.reduce((sum, e) => sum + e.amount, 0);
        let summaryText = `📊 SPLITWISE STATEMENT: ${activeSplit.title}\n`;
        summaryText += `Total Spent: ${activeSplit.currencySymbol}${groupTotal.toLocaleString()}\n\n`;
        summaryText += `👥 NET BALANCES:\n`;
        activeSplit.participants.forEach(p => {
            const bal = calculatedBalances.members[p] || 0;
            summaryText += `- ${p}: ${bal > 0 ? '+' : ''}${activeSplit.currencySymbol}${bal.toLocaleString()}\n`;
        });
        summaryText += `\n🤝 SIMPLIFIED SETTLEMENTS:\n`;
        if (calculatedBalances.debts.length === 0) {
            summaryText += `All accounts completely settled! 🎉\n`;
        } else {
            calculatedBalances.debts.forEach(d => {
                summaryText += `- ${d.from} owes ${d.to} ${activeSplit.currencySymbol}${d.amount.toLocaleString()}\n`;
            });
        }
        
        navigator.clipboard.writeText(summaryText);
        alert('📋 Splitwise statement summary copied to clipboard!');
    };

    const handleDownloadPDF = () => {
        if (!activeSplit) return;
        const groupTotal = activeSplit.expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup blocked! Please allow popups to download/print the PDF.');
            return;
        }

        const memberBalancesHTML = activeSplit.participants.map(m => {
            const bal = calculatedBalances.members[m] || 0;
            const balClass = bal > 0.01 ? 'balance-positive' : bal < -0.01 ? 'balance-negative' : '';
            const sign = bal > 0.01 ? '+' : '';
            return `
                <tr>
                    <td><strong>${m}</strong></td>
                    <td class="${balClass}" style="text-align: right;">${sign}${activeSplit.currencySymbol}${bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        const debtsHTML = calculatedBalances.debts.length === 0 
            ? `<tr><td colspan="2" style="text-align: center; color: #059669; font-weight: 700; padding: 15px;">All accounts completely settled! 🎉</td></tr>`
            : calculatedBalances.debts.map(d => `
                <tr>
                    <td><strong>${d.from}</strong> owes <strong>${d.to}</strong></td>
                    <td style="text-align: right; color: #2563EB; font-weight: 800;">${activeSplit.currencySymbol}${d.amount.toLocaleString()}</td>
                </tr>
            `).join('');

        const expensesHTML = activeSplit.expenses.length === 0
            ? `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748B;">No expenses logged yet.</td></tr>`
            : activeSplit.expenses.map(e => `
                <tr>
                    <td>${e.date}</td>
                    <td><strong>${e.title}</strong></td>
                    <td>${e.paidBy}</td>
                    <td><span class="badge">${e.splitType}</span></td>
                    <td style="text-align: right; font-weight: 700;">${activeSplit.currencySymbol}${e.amount.toLocaleString()}</td>
                </tr>
            `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Split Statement - ${activeSplit.title}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1E293B; background: white; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #064E3B; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo-area { display: flex; align-items: center; gap: 8px; }
                    .logo { font-size: 26px; font-weight: 900; color: #064E3B; letter-spacing: -0.5px; }
                    .logo-sub { font-size: 11px; font-weight: 700; color: #16A34A; text-transform: uppercase; letter-spacing: 1px; }
                    .title { font-size: 28px; font-weight: 900; color: #0F172A; margin: 0; }
                    .subtitle { font-size: 13px; color: #64748B; margin-top: 5px; font-weight: 500; }
                    .outlay-box { background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 14px; padding: 15px; text-align: right; min-width: 200px; }
                    .outlay-title { font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
                    .outlay-amount { font-size: 26px; font-weight: 900; color: #065F46; }
                    .section-title { font-size: 14px; font-weight: 900; color: #064E3B; text-transform: uppercase; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; letter-spacing: 0.5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                    th { background: #F8FAFC; text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 800; color: #475569; border-bottom: 1.5px solid #E2E8F0; text-transform: uppercase; }
                    td { padding: 12px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9; }
                    .badge { background: #EFF6FF; color: #1E40AF; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                    .balance-positive { color: #16A34A; font-weight: 800; }
                    .balance-negative { color: #DC2626; font-weight: 800; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                    .footer { text-align: center; font-size: 11px; color: #94A3B8; margin-top: 60px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo-area">
                            <span class="logo" style="font-weight: 900; color: #064E3B;">CliKs</span>
                            <span class="logo-sub" style="font-weight: 700; color: #16A34A; margin-left: 5px;">Business</span>
                        </div>
                        <h1 class="title" style="margin-top: 15px;">${activeSplit.title}</h1>
                        <p class="subtitle">${activeSplit.description || 'Split Ticket Statement'}</p>
                    </div>
                    <div class="outlay-box">
                        <div class="outlay-title">Total Outlay</div>
                        <div class="outlay-amount">${activeSplit.currencySymbol}${groupTotal.toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid-2">
                    <div>
                        <div class="section-title">Individual Balances</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="text-align: left;">Member</th>
                                    <th style="text-align: right;">Net Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${memberBalancesHTML}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div class="section-title">Simplified Debts</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="text-align: left;">Debt Settlement</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${debtsHTML}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="section-title">Logged Expenses Ledger</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Date</th>
                            <th style="width: 40%;">Description</th>
                            <th style="width: 20%;">Paid By</th>
                            <th style="width: 13%;">Protocol</th>
                            <th style="text-align: right; width: 12%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expensesHTML}
                    </tbody>
                </table>

                <div class="footer">
                    Generated via CLIKS Business Ledger on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}. All rights reserved.
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header Dashboard Banner */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            boxShadow: '0 4px 10px rgba(27, 107, 58, 0.15)' 
                        }}>
                            <CreditCard size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em', margin: 0 }}>Splitwise & Collect</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>Divide collaborative bills, track expenses, and simplify balances with team members.</p>
                </div>

                {!selectedSplitId && (
                    <button 
                        onClick={() => setIsCreateGroupModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.4rem', 
                            padding: '0.65rem 1.15rem', borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                            fontWeight: '850', fontSize: '0.82rem', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.15)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <Plus size={16} strokeWidth={3} />
                        New Split Ticket
                    </button>
                )}
            </div>

            {/* Scrollable Container Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {!selectedSplitId ? (
                        
                        // ── ALL SPLITS VIEW ──
                        <Motion.div 
                            key="splits-list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}
                        >
                            {/* Search bar */}
                            <div style={{ background: 'white', borderRadius: '14px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #E2E8F0', maxWidth: '320px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <Search size={16} color="#94A3B8" />
                                <input
                                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: '600', fontSize: '0.85rem', color: '#1E293B' }}
                                    type="text"
                                    placeholder="Search split tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Splits Cards Grid */}
                            {loading ? (
                                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#064E3B', borderRadius: '50%', margin: '0 auto 1rem auto' }}
                                        />
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '750' }}>Loading Split Tickets...</p>
                                    </div>
                                </div>
                            ) : filteredSplits.length === 0 ? (
                                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Users size={48} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155', margin: '0 0 0.25rem 0' }}>No Active Split Tickets</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '320px', margin: 0 }}>Create a new split ticket to begin tracking collaborative expenses with your co-workers.</p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                                    {filteredSplits
                                        .sort((a, b) => {
                                            const aPinned = pinnedSplitIds.includes(a.id);
                                            const bPinned = pinnedSplitIds.includes(b.id);
                                            if (aPinned && !bPinned) return -1;
                                            if (!aPinned && bPinned) return 1;
                                            return 0;
                                        })
                                        .map(s => {
                                            const groupTotal = s.expenses.reduce((sum, e) => sum + e.amount, 0);
                                            const isPinned = pinnedSplitIds.includes(s.id);
                                            return (
                                                <div 
                                                    key={s.id} 
                                                    onClick={() => setSelectedSplitId(s.id)}
                                                    style={{ 
                                                        background: 'white', 
                                                        borderRadius: '20px', 
                                                        border: '1.5px solid #E2E8F0', 
                                                        padding: '1.5rem', 
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.borderColor = '#1B6B3A';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                                                    }}
                                                >
                                                    {/* Card Header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {s.title}
                                                                {isPinned && (
                                                                    <Pin size={12} style={{ color: '#004aad', transform: 'rotate(45deg)' }} />
                                                                )}
                                                            </h3>
                                                            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', marginTop: '4px', display: 'inline-block' }}>
                                                                {s.currency}
                                                            </span>
                                                        </div>
                                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(activeMenuId === s.id ? null : s.id);
                                                                }}
                                                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
                                                                onMouseOver={(e) => e.currentTarget.style.color = '#004aad'}
                                                                onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>
                                                            
                                                            {activeMenuId === s.id && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    right: 0,
                                                                    top: '100%',
                                                                    background: 'white',
                                                                    borderRadius: '12px',
                                                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                                                                    border: '1px solid #E2E8F0',
                                                                    padding: '6px',
                                                                    zIndex: 100,
                                                                    minWidth: '160px',
                                                                    textAlign: 'left'
                                                                }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const next = pinnedSplitIds.includes(s.id)
                                                                                ? pinnedSplitIds.filter(id => id !== s.id)
                                                                                : [...pinnedSplitIds, s.id];
                                                                            setPinnedSplitIds(next);
                                                                            localStorage.setItem('cliks_pinned_splits', JSON.stringify(next));
                                                                            setActiveMenuId(null);
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            color: '#334155',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '600',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '8px',
                                                                            transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                                    >
                                                                        <Pin size={14} style={{ color: '#004aad', transform: isPinned ? 'rotate(45deg)' : 'none' }} />
                                                                        {isPinned ? 'Unpin Ticket' : 'Pin to top'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteGroup(s.id);
                                                                            setActiveMenuId(null);
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            color: '#EF4444',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '600',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '8px',
                                                                            transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                                    >
                                                                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                                                                        Delete Ticket
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4', height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {s.description || 'No description provided.'}
                                                    </p>
                                                    
                                                    {/* Card Footer Statistics */}
                                                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1B6B3A' }}>
                                                            <Users size={14} />
                                                            <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{s.participants.length} Members</span>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Total Spent</span>
                                                            <span style={{ fontSize: '1.05rem', fontWeight: '950', color: '#064E3B' }}>
                                                                {s.currencySymbol}{groupTotal.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </Motion.div>
                    ) : (
                        
                        // ── DETAILED SPLIT VIEW ──
                        <Motion.div 
                            key="split-detail"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem' }}
                        >
                            {/* Back and Action Panel */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button 
                                    onClick={() => setSelectedSplitId(null)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: '#064E3B', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                                >
                                    <ChevronLeft size={18} strokeWidth={2.5} /> Back to all tickets
                                </button>

                                <button 
                                    onClick={openAddExpenseModal}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                                        padding: '0.6rem 1.15rem', borderRadius: '12px', 
                                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                                        fontWeight: '850', fontSize: '0.82rem', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.15)'
                                    }}
                                >
                                    <Plus size={16} strokeWidth={3} />
                                    Add Expense
                                </button>
                            </div>

                            {/* Split Banner Header */}
                            <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.62rem', color: '#1B6B3A', fontWeight: '850', textTransform: 'uppercase', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #D1FAE5' }}>
                                        {activeSplit.currency} Group
                                    </span>
                                    <h2 style={{ margin: '0.35rem 0 0.15rem 0', fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>{activeSplit.title}</h2>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', fontWeight: '500' }}>{activeSplit.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748B', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Group Outlay</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '950', color: '#064E3B', letterSpacing: '-0.02em' }}>
                                            {activeSplit.currencySymbol}{calculatedBalances.totalSpent.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Split Content */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '1.5rem', alignItems: 'start' }}>
                                
                                {/* LEFT SIDE: Ledger Expenses List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Logged Expenses</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {/* Search Toggle */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <AnimatePresence>
                                                    {showDetailSearch && (
                                                        <Motion.input
                                                            initial={{ width: 0, opacity: 0 }}
                                                            animate={{ width: 140, opacity: 1 }}
                                                            exit={{ width: 0, opacity: 0 }}
                                                            type="text"
                                                            placeholder="Search expenses..."
                                                            value={detailSearchQuery}
                                                            onChange={(e) => setDetailSearchQuery(e.target.value)}
                                                            style={{
                                                                padding: '0.35rem 0.65rem',
                                                                borderRadius: '8px',
                                                                border: '1px solid #CBD5E1',
                                                                fontSize: '0.75rem',
                                                                outline: 'none',
                                                                fontWeight: '600'
                                                            }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                                <button 
                                                    onClick={() => {
                                                        setShowDetailSearch(!showDetailSearch);
                                                        if (showDetailSearch) setDetailSearchQuery('');
                                                     }}
                                                     title="Search expenses"
                                                     style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                 >
                                                     <Search size={14} />
                                                 </button>
                                             </div>

                                             {/* Share Icon */}
                                             <button 
                                                 onClick={handleShareGroup}
                                                 title="Share Split Summary"
                                                 style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                             >
                                                 <Share2 size={14} />
                                             </button>

                                             {/* PDF Download Icon */}
                                             <button 
                                                 onClick={handleDownloadPDF}
                                                 title="Download Statement (PDF)"
                                                 style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                             >
                                                 <Download size={14} />
                                             </button>
                                         </div>
                                     </div>
                                    
                                    {(() => {
                                        const filteredExpenses = (activeSplit.expenses || []).filter(e => {
                                            if (!detailSearchQuery.trim()) return true;
                                            const term = detailSearchQuery.toLowerCase().trim();
                                            return e.title.toLowerCase().includes(term) ||
                                                   e.paidBy.toLowerCase().includes(term) ||
                                                   String(e.amount).includes(term) ||
                                                   (e.attachment || '').toLowerCase().includes(term);
                                        });
                                        return filteredExpenses.length === 0 ? (
                                            <div style={{ border: '2px dashed #E2E8F0', borderRadius: '24px', background: 'white', padding: '3.5rem 2rem', textAlign: 'center' }}>
                                                <Receipt size={36} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#334155', margin: '0 0 0.15rem 0' }}>No Expenses Found</h4>
                                                <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '280px', margin: '0 auto' }}>
                                                    {activeSplit.expenses.length === 0 
                                                        ? 'Click "Add Expense" to record dinners, travel costs, or team bills in this split ticket.'
                                                        : `No expenses match your search query "${detailSearchQuery}".`
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                {filteredExpenses.map(e => {
                                                    const isSettlement = e.title.startsWith('Settlement:');
                                                    return (
                                                        <div 
                                                            key={e.id} 
                                                            style={{ 
                                                                background: 'white', 
                                                                borderRadius: '16px', 
                                                                border: '1.5px solid #E2E8F0', 
                                                                padding: '1rem 1.25rem', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '1rem',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            {/* Icon indicator */}
                                                            <div style={{ 
                                                                width: '38px', 
                                                                height: '38px', 
                                                                borderRadius: '10px', 
                                                                background: isSettlement ? '#F0FDF4' : '#F8FAFC', 
                                                                color: isSettlement ? '#10B981' : '#475569', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center', 
                                                                flexShrink: 0 
                                                            }}>
                                                                {isSettlement ? <Check size={18} strokeWidth={2.5} /> : <Receipt size={18} />}
                                                            </div>

                                                            {/* Details */}
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: '850', color: '#1F2937' }}>{e.title}</h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B' }}>
                                                                        Paid by <strong style={{ color: '#1E293B' }}>{e.paidBy}</strong>
                                                                    </span>
                                                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }} />
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: '750', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                        <Calendar size={12} /> {e.date}
                                                                    </span>
                                                                    {e.attachment && (
                                                                        <>
                                                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }} />
                                                                            <span 
                                                                                title={`Attachment: ${e.attachment}`}
                                                                                style={{ fontSize: '0.65rem', fontWeight: '800', color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1px 6px', borderRadius: '5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                                                            >
                                                                                <FileText size={10} /> {e.attachment}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Amount & Actions */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <span style={{ fontSize: '1.05rem', fontWeight: '950', color: isSettlement ? '#059669' : '#1E293B' }}>
                                                                        {activeSplit.currencySymbol}{e.amount.toLocaleString()}
                                                                    </span>
                                                                    <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', marginTop: '1px' }}>
                                                                        {e.splitType} Split
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDeleteExpense(e.id)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                                                                    onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                                                                    onMouseOut={(e) => e.currentTarget.style.color = '#CBD5E1'}
                                                                >
                                                                    <X size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* RIGHT SIDE: Balances, Debts, Settlement */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    {/* 1. Net Balances Breakdown */}
                                    <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #E2E8F0', padding: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Individual Balances</h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {activeSplit.participants.map(m => {
                                                const bal = calculatedBalances.members[m] || 0;
                                                return (
                                                    <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: '800', color: '#1F2937', fontSize: '0.85rem' }}>{m}</span>
                                                        <span style={{ 
                                                            fontWeight: '950', 
                                                            fontSize: '0.88rem', 
                                                            color: bal > 0.01 ? '#059669' : bal < -0.01 ? '#DC2626' : '#64748B' 
                                                        }}>
                                                            {bal > 0.01 ? '+' : ''}{activeSplit.currencySymbol}{bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Simplified Settlements / Debts */}
                                    <div style={{ background: '#0F172A', borderRadius: '24px', padding: '1.5rem', color: 'white', boxShadow: '0 12px 24px rgba(15,23,42,0.1)' }}>
                                        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simplified Debts</h3>

                                        {calculatedBalances.debts.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                                <Check size={28} color="#34D399" style={{ marginBottom: '0.5rem' }} />
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>All accounts completely settled!</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                {calculatedBalances.debts.map((d, index) => (
                                                    <div 
                                                        key={index}
                                                        style={{ 
                                                            background: 'rgba(255,255,255,0.03)', 
                                                            padding: '0.85rem 1rem', 
                                                            borderRadius: '16px', 
                                                            border: '1px solid rgba(255,255,255,0.06)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '750', color: '#F8FAFC' }}>
                                                                {d.from} owes {d.to}
                                                            </div>
                                                            <div style={{ fontSize: '1rem', fontWeight: '950', color: '#38BDF8', marginTop: '2px' }}>
                                                                {activeSplit.currencySymbol}{d.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleSettleDebt(d)}
                                                            style={{ 
                                                                border: 'none', 
                                                                background: '#34D399', 
                                                                color: '#064E3B', 
                                                                padding: '0.45rem 0.85rem', 
                                                                borderRadius: '10px', 
                                                                fontWeight: '900', 
                                                                fontSize: '0.75rem', 
                                                                cursor: 'pointer',
                                                                boxShadow: '0 4px 10px rgba(52, 211, 153, 0.2)'
                                                            }}
                                                        >
                                                            Settle Debt
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>

                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ──────── MODAL: CREATE GROUP ──────── */}
            <AnimatePresence>
                {isCreateGroupModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Create Split Ticket</h3>
                                <button style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} onClick={() => setIsCreateGroupModalOpen(false)}><X size={18} /></button>
                            </div>
                            
                            <form onSubmit={handleCreateGroup} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Ticket Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. Goa Trip, Office lunch split"
                                        value={groupForm.title}
                                        onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Group Currency</label>
                                        <select 
                                            value={groupForm.currency}
                                            onChange={(e) => setGroupForm({ ...groupForm, currency: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none' }}
                                        >
                                            {currency.code !== 'INR' && currency.code !== 'USD' && currency.code !== 'EUR' && currency.code !== 'GBP' && (
                                                <option value={currency.code}>{currency.code} ({currency.symbol})</option>
                                            )}
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Description</label>
                                        <input 
                                            type="text" 
                                            placeholder="Optional details"
                                            value={groupForm.description}
                                            onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                {/* Participants Manager */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Participants ({groupForm.participants.length})</label>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Add participant name..."
                                            value={newParticipantName}
                                            onChange={(e) => setNewParticipantName(e.target.value)}
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }}
                                            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addParticipantToForm(); } }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={addParticipantToForm}
                                            style={{ border: 'none', background: '#ECFDF5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <UserPlus size={15} /> Add
                                        </button>
                                    </div>

                                    {/* Participants Badges list */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '100px', overflowY: 'auto', background: '#F8FAFC', padding: '0.5rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                                        {groupForm.participants.map(p => (
                                            <span 
                                                key={p} 
                                                style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px', 
                                                    background: p === 'You' ? '#ECFDF5' : 'white', 
                                                    color: p === 'You' ? '#047857' : '#334155', 
                                                    border: '1px solid #E2E8F0', 
                                                    padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750' 
                                                }}
                                            >
                                                {p}
                                                {p !== 'You' && (
                                                    <button type="button" onClick={() => removeParticipantFromForm(p)} style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={12} /></button>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '850', fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.5rem' }}
                                >
                                    Create Ticket
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ──────── MODAL: ADD EXPENSE ──────── */}
            <AnimatePresence>
                {isAddExpenseModalOpen && activeSplit && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Record Expense</h3>
                                <button style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} onClick={() => setIsAddExpenseModalOpen(false)}><X size={18} /></button>
                            </div>
                            
                            <form onSubmit={handleAddExpense} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, background: '#FAFAFA' }}>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Expense Description</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. Dinner, Uber, Flight ticket"
                                            value={expenseForm.title}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '700', fontSize: '0.88rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Amount ({activeSplit.currencySymbol})</label>
                                        <input 
                                            required
                                            type="number" 
                                            placeholder="0.00"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '900', color: '#1B6B3A', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Who Paid?</label>
                                        <select 
                                            value={expenseForm.paidBy}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontWeight: '600' }}
                                        >
                                            {activeSplit.participants.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Date</label>
                                        <input 
                                            type="date"
                                            value={expenseForm.date}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>

                                {/* Attachment Upload Panel */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Expense Attachment</label>
                                    <div 
                                        onClick={triggerSimulatedUpload}
                                        style={{ border: '2px dashed #CBD5E1', borderRadius: '14px', padding: '0.75rem', background: '#F8FAFC', textAlign: 'center', cursor: 'pointer', color: '#475569', transition: 'border-color 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#1B6B3A'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <Upload size={16} />
                                            <span style={{ fontSize: '0.78rem', fontWeight: '750' }}>
                                                {expenseForm.attachmentName ? expenseForm.attachmentName : 'Click to upload invoice / receipt copy'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Split Type Protocol */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Splitting Protocol</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setExpenseForm({ ...expenseForm, splitType: 'equal' })}
                                            style={{ 
                                                padding: '0.6rem', borderRadius: '10px', 
                                                border: expenseForm.splitType === 'equal' ? '2px solid #1B6B3A' : '1px solid #E2E8F0',
                                                background: expenseForm.splitType === 'equal' ? 'white' : '#F8FAFC', 
                                                fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', color: expenseForm.splitType === 'equal' ? '#1B6B3A' : '#475569'
                                            }}
                                        >
                                            Split Equally
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setExpenseForm({ ...expenseForm, splitType: 'custom' })}
                                            style={{ 
                                                padding: '0.6rem', borderRadius: '10px', 
                                                border: expenseForm.splitType === 'custom' ? '2px solid #1B6B3A' : '1px solid #E2E8F0',
                                                background: expenseForm.splitType === 'custom' ? 'white' : '#F8FAFC', 
                                                fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', color: expenseForm.splitType === 'custom' ? '#1B6B3A' : '#475569'
                                            }}
                                        >
                                            Customize Shares
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Shares Breakdown */}
                                <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase' }}>Shares Allocations</h4>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {activeSplit.participants.map(p => {
                                            const totalAmt = parseFloat(expenseForm.amount) || 0;
                                            const equalShare = totalAmt / activeSplit.participants.length;
                                            return (
                                                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: '750', color: '#1F2937' }}>{p}</span>
                                                    
                                                    {expenseForm.splitType === 'equal' ? (
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#1E293B' }}>
                                                            {activeSplit.currencySymbol}{Math.round(equalShare * 100) / 100}
                                                        </span>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#64748B' }}>{activeSplit.currencySymbol}</span>
                                                            <input 
                                                                required
                                                                type="number"
                                                                placeholder="0.00"
                                                                value={expenseForm.shares[p] || ''}
                                                                onChange={(e) => {
                                                                    const newShares = { ...expenseForm.shares };
                                                                    newShares[p] = e.target.value;
                                                                    setExpenseForm({ ...expenseForm, shares: newShares });
                                                                }}
                                                                style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '900', textAlign: 'right', fontSize: '0.82rem', color: '#1B6B3A' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Shares Sum Warning */}
                                    {expenseForm.splitType === 'custom' && (() => {
                                        const totalAmt = parseFloat(expenseForm.amount) || 0;
                                        const sum = activeSplit.participants.reduce((s, p) => s + (parseFloat(expenseForm.shares[p]) || 0), 0);
                                        const difference = totalAmt - sum;
                                        return (
                                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '6px', color: Math.abs(difference) < 0.1 ? '#059669' : '#DC2626' }}>
                                                <AlertCircle size={14} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                                                    {Math.abs(difference) < 0.1 
                                                        ? 'All allocations match total perfectly!' 
                                                        : `Allocated: ${activeSplit.currencySymbol}${sum.toFixed(2)} (${difference > 0 ? 'Remaining' : 'Over'}: ${activeSplit.currencySymbol}${Math.abs(difference).toFixed(2)})`
                                                    }
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <button 
                                    type="submit"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '850', fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.5rem' }}
                                >
                                    Log Expense
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default BusinessSplitCollect;
