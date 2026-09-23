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
    ChevronDown,
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
    MoreVertical,
    Pencil,
    ExternalLink
} from 'lucide-react';
import '../App.css';
import splitExpenseService from '../services/splitExpenseService';
import { config } from '../lib/config';

// Initial Seed Data for Split Groups
const INITIAL_SPLITS = [];

export const resolveFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    const cleanPath = filePath.startsWith('/') ? filePath : `/uploads/${filePath}`;
    const normalizedPath = cleanPath.startsWith('/uploads') ? cleanPath : `/uploads/${cleanPath.replace(/^\/+/, '')}`;
    return `https://cliks.beta-softnet.com${normalizedPath}`;
};
export const getDirectAttachmentUrl = resolveFileUrl;
export const resolveAttachmentUrl = resolveFileUrl;

export const isPdfFile = (urlOrName = '') => {
    return /\.pdf(\?.*)?$/i.test(urlOrName);
};

export const isImageFile = (urlOrName = '') => {
    return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(urlOrName);
};

export const openAttachmentInNewTab = (attachment) => {
    if (!attachment) return;
    const rawUrl = typeof attachment === 'string' ? attachment : attachment.url;
    const name = (typeof attachment === 'object' ? attachment.name : '') || 'Attachment Preview';
    if (!rawUrl) return;

    const fileUrl = resolveFileUrl(rawUrl);
    const isPdf = isPdfFile(fileUrl || name);

    if (isPdf) {
        window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false`, '_blank');
    } else {
        const newTab = window.open('', '_blank');
        if (newTab) {
            newTab.document.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #0b0f19;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
        }
        img {
            max-width: 96vw;
            max-height: 96vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
    </style>
</head>
<body>
    <img src="${fileUrl}" alt="${name.replace(/"/g, '&quot;')}" />
</body>
</html>`);
            newTab.document.close();
        } else {
            window.open(fileUrl, '_blank');
        }
    }
};

export const getViewableUrl = (rawFilePath) => {
    if (!rawFilePath) return '';

    let absoluteFileUrl = rawFilePath;
    if (!rawFilePath.startsWith('http://') && !rawFilePath.startsWith('https://')) {
        const clean = rawFilePath.startsWith('/') ? rawFilePath : `/${rawFilePath}`;
        const base = 'https://cliks.beta-softnet.com';
        absoluteFileUrl = clean.startsWith('/uploads') ? `${base}${clean}` : `${base}/uploads${clean}`;
    }

    const isPdf = isPdfFile(absoluteFileUrl);

    // If it's a PDF, wrap with Google Docs Viewer so any browser tab displays the rendered document directly
    if (isPdf) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteFileUrl)}&embedded=false`;
    }

    // If image, return direct asset path
    return absoluteFileUrl;
};

// Pure calculation function to compute total outlay across both list cards and details view
export const calculateGroupOutlay = (expenses) => {
    return (expenses || [])
        .filter(item => isPrimaryExpense(item))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
};

export const formatCurrencyUniversal = (amount, currencyCode) => {
    const code = currencyCode || 'USD';
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        return `${code} ${parseFloat(amount || 0).toFixed(2)}`;
    }
};

// Helper to find specific unsettled expenses paid by creditor for a debt
export const getEligibleExpensesForDebt = (debt, expenses = [], participants = []) => {
    if (!debt || !expenses) return [];
    
    // Non-settlement expenses paid by the creditor (debt.to)
    const creditorExpenses = expenses.filter(exp => 
        isPrimaryExpense(exp) &&
        exp.paidBy === debt.to
    );

    const pool = creditorExpenses.length > 0 ? creditorExpenses : expenses.filter(exp => isPrimaryExpense(exp));

    return pool.map(exp => {
        let memberShare = 0;
        if (exp.shares && exp.shares[debt.from] !== undefined) {
            memberShare = parseFloat(exp.shares[debt.from]) || 0;
        } else {
            const numParts = (participants && participants.length) || 1;
            memberShare = Math.round(((parseFloat(exp.amount) || 0) / numParts) * 100) / 100;
        }
        return {
            ...exp,
            memberShare: memberShare > 0 ? memberShare : (parseFloat(exp.amount) || 0)
        };
    });
};

export const isPrimaryExpense = (item) => {
    if (!item) return false;
    if (item.isSettlement === true || item.is_settlement === true) return false;
    if (item.type === 'SETTLEMENT' || item.type === 'REPAYMENT') return false;
    if (typeof item.title === 'string' && item.title.toLowerCase().trim().startsWith('settlement')) return false;
    return true;
};

export const isSettlementLinkedToExpense = (settlement, exp, allPrimaryExpenses = []) => {
    if (!settlement || !exp) return false;
    if (settlement.linked_expense_id && String(settlement.linked_expense_id) === String(exp.id)) return true;
    if (settlement.expenseId && String(settlement.expenseId) === String(exp.id)) return true;
    if (settlement.relatedExpenseId && String(settlement.relatedExpenseId) === String(exp.id)) return true;
    if (settlement.linkedExpenseId && String(settlement.linkedExpenseId) === String(exp.id)) return true;
    if (settlement.title && exp.title) {
        const sTitle = settlement.title.toLowerCase().trim();
        const expTitle = exp.title.toLowerCase().trim();
        const titleMatch = sTitle.match(/^settlement\s+for\s+(.*?):\s*/);
        if (titleMatch && titleMatch[1]) {
            const extracted = titleMatch[1].trim().toLowerCase();
            if (extracted === expTitle || expTitle.includes(extracted) || extracted.includes(expTitle)) {
                return true;
            }
        }
        if (expTitle && (sTitle.includes(`for ${expTitle}:`) || sTitle.includes(`for ${expTitle}`) || sTitle.includes(expTitle))) {
            return true;
        }
    }
    // Fallback 1: If only 1 primary expense exists in the ticket, link settlement to it
    if (allPrimaryExpenses && allPrimaryExpenses.length === 1 && String(allPrimaryExpenses[0].id) === String(exp.id)) {
        return true;
    }

    // Fallback 2: If settlement has no explicit expense in title or IDs, link to the matching debt session
    if (allPrimaryExpenses && allPrimaryExpenses.length > 1) {
        const sTitle = (settlement.title || '').toLowerCase().trim();
        // If settlement mentions another primary expense in title, do not link to this one
        const mentionsOther = allPrimaryExpenses.some(otherExp => {
            if (String(otherExp.id) === String(exp.id)) return false;
            const oTitle = (otherExp.title || '').toLowerCase().trim();
            return oTitle && (sTitle.includes(`for ${oTitle}:`) || sTitle.includes(`for ${oTitle}`));
        });
        if (!mentionsOther) {
            let recipient = null;
            if (settlement.shares && typeof settlement.shares === 'object') {
                recipient = Object.keys(settlement.shares).find(k => k !== settlement.paidBy && (parseFloat(settlement.shares[k]) || 0) > 0);
            }
            if (!recipient && settlement.title) {
                const match = settlement.title.match(/paid\s+(.+)$/i);
                if (match && match[1]) recipient = match[1].trim();
            }

            if (recipient && exp.paidBy === recipient) {
                const eligibleForRecipient = allPrimaryExpenses.filter(pe => pe.paidBy === recipient);
                if (eligibleForRecipient.length === 1) return true;
                const expAmt = parseFloat(exp.amount) || 0;
                const sAmt = parseFloat(settlement.amount) || 0;
                if (Math.abs(sAmt - (expAmt / 2)) < 0.01 || Math.abs(sAmt - expAmt) < 0.01) return true;
            }
        }
    }
    return false;
};

// Calculate session-specific balances and simplified debts for an individual primary expense
export const calculateSessionBalances = (expense, linkedSettlements = [], participants = []) => {
    if (!expense) return { members: {}, debts: [] };

    const balances = {};
    const baseParticipants = (participants && participants.length > 0)
        ? [...participants]
        : (expense.shares ? Object.keys(expense.shares) : [expense.paidBy]);

    if (expense.paidBy && !baseParticipants.includes(expense.paidBy)) {
        baseParticipants.push(expense.paidBy);
    }

    baseParticipants.forEach(p => {
        balances[p] = 0;
    });

    const payer = expense.paidBy;
    const totalAmt = parseFloat(expense.amount) || 0;

    // Credit the payer
    if (balances[payer] !== undefined) {
        balances[payer] += totalAmt;
    } else {
        balances[payer] = totalAmt;
    }

    // Debit each member's share
    if (expense.shares && Object.keys(expense.shares).length > 0) {
        Object.keys(expense.shares).forEach(member => {
            const share = parseFloat(expense.shares[member]) || 0;
            if (balances[member] !== undefined) {
                balances[member] -= share;
            } else {
                balances[member] = -share;
            }
        });
    } else {
        const count = baseParticipants.length > 0 ? baseParticipants.length : 1;
        const equalShare = totalAmt / count;
        baseParticipants.forEach(p => {
            balances[p] = (balances[p] || 0) - equalShare;
        });
    }

    // Apply linked settlements
    (linkedSettlements || []).forEach(s => {
        const sAmt = parseFloat(s.amount) || 0;
        const sPayer = s.paidBy;

        // Credit settlement payer
        if (balances[sPayer] !== undefined) {
            balances[sPayer] += sAmt;
        } else {
            balances[sPayer] = sAmt;
        }

        // Debit settlement recipient (creditor receiving reimbursement)
        let recipient = null;
        if (s.shares && Object.keys(s.shares).length > 0) {
            recipient = Object.keys(s.shares).find(k => k !== sPayer && (parseFloat(s.shares[k]) || 0) > 0);
        }
        if (!recipient) {
            recipient = expense.paidBy;
        }

        if (balances[recipient] !== undefined) {
            balances[recipient] -= sAmt;
        } else {
            balances[recipient] = -sAmt;
        }
    });

    // Simplify debts for this session
    const tempBalances = { ...balances };
    const debts = [];
    const allMembers = Object.keys(tempBalances);

    while (true) {
        let debtor = null;
        let creditor = null;
        let maxDebit = 0;
        let maxCredit = 0;

        allMembers.forEach(p => {
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
            amount: Math.round(amtToSettle * 100) / 100,
            expenseId: expense.id,
            expenseTitle: expense.title
        });
    }

    return {
        members: balances,
        debts: debts
    };
};

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
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [expandedExpenseIds, setExpandedExpenseIds] = useState([]);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [isSettleExpanded, setIsSettleExpanded] = useState(true);

    const toggleExpenseExpand = (expenseId) => {
        setExpandedExpenseIds(prev =>
            prev.includes(expenseId) ? prev.filter(id => id !== expenseId) : [...prev, expenseId]
        );
    };

    // Custom Pay Modal State
    const [isCustomPayModalOpen, setIsCustomPayModalOpen] = useState(false);
    const [customPayDebt, setCustomPayDebt] = useState(null);
    const [customPayExpenseId, setCustomPayExpenseId] = useState('');
    const [customPayAmount, setCustomPayAmount] = useState('');
    
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
        attachmentFile: null,
        attachmentSizeKb: null,
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

        if (editingGroupId) {
            const updatedData = {
                title: groupForm.title,
                currency: groupForm.currency,
                currencySymbol: getCurrencySymbol(groupForm.currency),
                description: groupForm.description,
                participants: [...groupForm.participants],
            };

            try {
                const updated = await splitExpenseService.updateSplit(editingGroupId, updatedData);
                setSplits(splits.map(s => s.id === editingGroupId ? { ...s, ...updated, expenses: s.expenses } : s));
            } catch (err) {
                console.error("Error updating group on backend:", err);
                setSplits(splits.map(s => s.id === editingGroupId ? { ...s, ...updatedData } : s));
            }

            setIsCreateGroupModalOpen(false);
            setEditingGroupId(null);
            setGroupForm({ title: '', currency: 'INR', description: '', participants: ['You'] });
            return;
        }

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
        setEditingGroupId(null);
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
        if (await window.confirm('Are you sure you want to delete this split group? All logged expenses will be lost.')) {
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
        setEditingExpenseId(null);
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
            attachmentFile: null,
            attachmentSizeKb: null,
            splitType: 'equal',
            shares: initialShares
        });
        setIsAddExpenseModalOpen(true);
    };

    const openEditExpenseModal = (expense) => {
        if (!activeSplit) return;
        setEditingExpenseId(expense.id);
        
        // Initialize shares
        const initialShares = {};
        activeSplit.participants.forEach(p => {
            initialShares[p] = expense.shares && expense.shares[p] !== undefined ? expense.shares[p].toString() : '';
        });

        setExpenseForm({
            title: expense.title,
            amount: expense.amount.toString(),
            paidBy: expense.paidBy,
            date: expense.date,
            attachmentName: expense.attachment || '',
            attachmentFile: null,
            attachmentSizeKb: null,
            splitType: expense.splitType || 'equal',
            shares: initialShares
        });
        setIsAddExpenseModalOpen(true);
    };

    const closeExpenseModal = () => {
        setIsAddExpenseModalOpen(false);
        setEditingExpenseId(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
        const isValidType = validTypes.includes(file.type) || /\.(png|jpe?g|webp|pdf)$/i.test(file.name);
        if (!isValidType) {
            alert('Please select a valid image (PNG, JPG, WEBP) or PDF file.');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            alert('File size exceeds the 20MB limit.');
            return;
        }

        const sizeKb = (file.size / 1024).toFixed(1);
        setExpenseForm(prev => ({
            ...prev,
            attachmentName: file.name,
            attachmentFile: file,
            attachmentSizeKb: sizeKb
        }));
    };

    const handleRemoveFile = () => {
        setExpenseForm(prev => ({
            ...prev,
            attachmentName: '',
            attachmentFile: null,
            attachmentSizeKb: null
        }));
        const inputEl = document.getElementById('expense-attachment-input');
        if (inputEl) inputEl.value = '';
    };

    const handleAmountChange = (e) => {
        let val = e.target.value;

        // Remove non-numeric characters except single decimal point
        val = val.replace(/[^0-9.]/g, '');

        const parts = val.split('.');
        if (parts.length > 2) {
            val = parts[0] + '.' + parts.slice(1).join('');
        }

        // Enforce max 12 digits on integer part
        let integerPart = parts[0] || '';
        if (integerPart.length > 12) {
            integerPart = integerPart.slice(0, 12);
        }

        // Cap decimals to 2 places
        let decimalPart = parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '';

        const cleanAmount = integerPart + decimalPart;

        setExpenseForm((prev) => ({
            ...prev,
            amount: cleanAmount
        }));
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
            let hasNegativeOrInvalid = false;
            activeSplit.participants.forEach(p => {
                const rawVal = expenseForm.shares[p];
                const share = parseFloat(rawVal);
                if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '' || isNaN(share) || share < 0) {
                    hasNegativeOrInvalid = true;
                }
                finalShares[p] = share || 0;
                sum += (share || 0);
            });

            if (hasNegativeOrInvalid) {
                alert('Participant allocations cannot be negative or non-numeric.');
                return;
            }
            
            if (Math.abs(sum - amount) > 0.1) {
                alert(`The sum of custom shares (${activeSplit.currencySymbol}${sum.toFixed(2)}) must exactly match the total expense amount (${activeSplit.currencySymbol}${amount.toFixed(2)})!`);
                return;
            }
        }

        let uploadedAttachment = expenseForm.attachmentName || null;
        if (expenseForm.attachmentFile) {
            try {
                const formData = new FormData();
                formData.append('file', expenseForm.attachmentFile);
                const uploadRes = await splitExpenseService.uploadAttachment(formData);
                uploadedAttachment = uploadRes?.url || uploadRes?.filename || (uploadRes?.data && (uploadRes.data.url || uploadRes.data.filename)) || expenseForm.attachmentName;
            } catch (err) {
                console.error("Failed to upload document:", err);
                alert("Attachment upload failed: " + (err.response?.data?.message || err.message || "Unknown error"));
                return;
            }
        }

        if (editingExpenseId) {
            const updatedExpense = {
                id: editingExpenseId,
                title: expenseForm.title,
                amount: amount,
                paidBy: expenseForm.paidBy,
                date: expenseForm.date,
                attachment: uploadedAttachment,
                splitType: expenseForm.splitType,
                shares: finalShares
            };

            try {
                const res = await splitExpenseService.updateExpense(selectedSplitId, editingExpenseId, updatedExpense);
                const updatedSplits = splits.map(s => {
                    if (s.id === selectedSplitId) {
                        return {
                            ...s,
                            expenses: s.expenses.map(e => e.id === editingExpenseId ? res : e)
                        };
                    }
                    return s;
                });
                setSplits(updatedSplits);
            } catch (err) {
                console.error("Error updating expense on backend:", err);
                // Fallback to local state update
                const updatedSplits = splits.map(s => {
                    if (s.id === selectedSplitId) {
                        return {
                            ...s,
                            expenses: s.expenses.map(e => e.id === editingExpenseId ? updatedExpense : e)
                        };
                    }
                    return s;
                });
                setSplits(updatedSplits);
            }
            closeExpenseModal();
            return;
        }

        const newExpense = {
            id: 'exp-' + Date.now(),
            title: expenseForm.title,
            amount: amount,
            paidBy: expenseForm.paidBy,
            date: expenseForm.date,
            attachment: uploadedAttachment,
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

        closeExpenseModal();
    };

    const handleDeleteExpense = async (expenseId) => {
        if (await window.confirm('Delete this expense?')) {
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
            try {
                localStorage.setItem('cliks_splits_data', JSON.stringify(updatedSplits));
            } catch {}
        }
    };

    // ── Debts & Balances Calculations ──────────────────────────────────────
    const calculatedBalances = React.useMemo(() => {
        if (!activeSplit) return { members: {}, debts: [], totalSpent: 0 };

        const balances = {};
        const participants = activeSplit.participants || [];
        participants.forEach(p => {
            balances[p] = 0;
        });

        // Exclude settlement transactions when calculating total group outlay:
        // Debt settlements are internal balance transfers, not new group expenses.
        const totalGroupOutlay = calculateGroupOutlay(activeSplit.expenses);
        const totalSpent = totalGroupOutlay;

        const allExpenses = activeSplit.expenses || [];
        const allPrimaries = allExpenses.filter(item => isPrimaryExpense(item));
        const allSettlements = allExpenses.filter(item => !isPrimaryExpense(item));

        allExpenses.forEach(exp => {
            const payer = exp.paidBy;
            const amt = parseFloat(exp.amount) || 0;

            if (isPrimaryExpense(exp)) {
                // Primary Expense: Credit the payer
                if (balances[payer] !== undefined) {
                    balances[payer] += amt;
                } else {
                    balances[payer] = amt;
                }

                // Debit everyone who shared
                const hasExplicitShares = exp.shares && typeof exp.shares === 'object' && Object.keys(exp.shares).length > 0;
                if (hasExplicitShares) {
                    Object.keys(exp.shares).forEach(member => {
                        const share = parseFloat(exp.shares[member]) || 0;
                        if (balances[member] !== undefined) {
                            balances[member] -= share;
                        } else {
                            balances[member] = -share;
                        }
                    });
                } else {
                    const count = participants.length > 0 ? participants.length : 1;
                    const equalShare = amt / count;
                    participants.forEach(p => {
                        if (balances[p] !== undefined) {
                            balances[p] -= equalShare;
                        } else {
                            balances[p] = -equalShare;
                        }
                    });
                }
            } else {
                // Settlement / Repayment Transaction
                // Credit the settlement payer
                if (balances[payer] !== undefined) {
                    balances[payer] += amt;
                } else {
                    balances[payer] = amt;
                }

                // Debit the recipient
                let recipient = null;
                if (exp.shares && typeof exp.shares === 'object' && Object.keys(exp.shares).length > 0) {
                    recipient = Object.keys(exp.shares).find(k => k !== payer && (parseFloat(exp.shares[k]) || 0) > 0);
                }
                if (!recipient && exp.title) {
                    const match = exp.title.match(/paid\s+(.+)$/i);
                    if (match && match[1]) {
                        recipient = match[1].trim();
                    }
                }
                if (!recipient && participants.length === 2) {
                    recipient = participants.find(p => p !== payer);
                }

                if (recipient) {
                    if (balances[recipient] !== undefined) {
                        balances[recipient] -= amt;
                    } else {
                        balances[recipient] = -amt;
                    }
                }
            }
        });

        // Deep copy balances for debt simplification
        const tempBalances = { ...balances };
        const debts = [];

        // Simplify debts algorithm (Splitwise style)
        const memberKeys = Object.keys(tempBalances);
        
        while (true) {
            let debtor = null;
            let creditor = null;
            let maxDebit = 0;
            let maxCredit = 0;

            memberKeys.forEach(p => {
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

            // Link debt to matching primary expense session if identifiable
            const matchingSession = allPrimaries.find(pe => {
                const linked = allSettlements.filter(s => isSettlementLinkedToExpense(s, pe, allPrimaries));
                const sess = calculateSessionBalances(pe, linked, participants);
                return sess.debts.some(sd => sd.from === debtor && sd.to === creditor);
            });

            debts.push({
                from: debtor,
                to: creditor,
                amount: Math.round(amtToSettle * 100) / 100,
                expenseId: matchingSession?.id,
                expenseTitle: matchingSession?.title
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
        if (await window.confirm(`Mark settlement: does ${debt.from} paid ${activeSplit.currencySymbol}${debt.amount.toLocaleString()} to ${debt.to}?`)) {
            const allPrimaries = (activeSplit.expenses || []).filter(item => isPrimaryExpense(item));
            let targetExpense = null;

            if (debt.expenseId) {
                targetExpense = allPrimaries.find(e => String(e.id) === String(debt.expenseId));
            }

            if (!targetExpense) {
                // Find primary expense session where this debt originates
                const candidates = [];
                for (const exp of allPrimaries) {
                    const linked = (activeSplit.expenses || []).filter(item => !isPrimaryExpense(item) && isSettlementLinkedToExpense(item, exp, allPrimaries));
                    const sess = calculateSessionBalances(exp, linked, activeSplit.participants);
                    const matchingDebt = sess.debts.find(d => d.from === debt.from && d.to === debt.to);
                    if (matchingDebt) {
                        candidates.push({ exp, debt: matchingDebt, diff: Math.abs(matchingDebt.amount - debt.amount) });
                    }
                }
                if (candidates.length > 0) {
                    candidates.sort((a, b) => a.diff - b.diff);
                    targetExpense = candidates[0].exp;
                }
            }

            if (!targetExpense) {
                const eligible = getEligibleExpensesForDebt(debt, activeSplit.expenses, activeSplit.participants);
                if (eligible.length > 0) {
                    targetExpense = eligible[0];
                } else if (allPrimaries.length === 1) {
                    targetExpense = allPrimaries[0];
                }
            }

            const targetExpenseId = targetExpense ? targetExpense.id : (debt.expenseId || null);
            const expenseTitle = targetExpense ? targetExpense.title : (debt.expenseTitle || null);

            // Settle creates a custom expense compensating the debt
            const settlementExpense = {
                id: 'exp-settle-' + Date.now(),
                title: expenseTitle ? `Settlement for ${expenseTitle}: ${debt.from} paid ${debt.to}` : `Settlement: ${debt.from} paid ${debt.to}`,
                amount: debt.amount,
                paidBy: debt.from,
                date: new Date().toISOString().split('T')[0],
                attachment: null,
                splitType: 'custom',
                isSettlement: true,
                type: 'SETTLEMENT',
                linked_expense_id: targetExpenseId,
                expenseId: targetExpenseId,
                relatedExpenseId: targetExpenseId,
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
                const finalSettlement = {
                    ...createdSettlement,
                    title: settlementExpense.title,
                    amount: settlementExpense.amount,
                    paidBy: settlementExpense.paidBy,
                    shares: settlementExpense.shares,
                    isSettlement: true,
                    type: 'SETTLEMENT',
                    linked_expense_id: targetExpenseId,
                    expenseId: targetExpenseId,
                    relatedExpenseId: targetExpenseId
                };
                const updatedSplits = splits.map(s => {
                    if (s.id === selectedSplitId) {
                        return {
                            ...s,
                            expenses: [finalSettlement, ...s.expenses]
                        };
                    }
                    return s;
                });
                setSplits(updatedSplits);
                try {
                    localStorage.setItem('cliks_splits_data', JSON.stringify(updatedSplits));
                } catch {}
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
                try {
                    localStorage.setItem('cliks_splits_data', JSON.stringify(updatedSplits));
                } catch {}
                alert('Settlement logged perfectly!');
            }
        }
    };

    const openCustomPayModal = (debt) => {
        setCustomPayDebt(debt);
        const eligible = getEligibleExpensesForDebt(debt, activeSplit?.expenses || [], activeSplit?.participants || []);
        if (debt.expenseId) {
            setCustomPayExpenseId(debt.expenseId);
            const chosen = eligible.find(e => String(e.id) === String(debt.expenseId));
            const rawShare = chosen ? (parseFloat(chosen.memberShare) || debt.amount) : debt.amount;
            const amountToPay = customPayDebt ? Math.min(rawShare, customPayDebt.amount) : rawShare;
            setCustomPayAmount(String(amountToPay));
        } else if (eligible.length > 0) {
            setCustomPayExpenseId(eligible[0].id);
            const rawShare = parseFloat(eligible[0].memberShare) || debt.amount;
            const amountToPay = Math.min(rawShare, debt.amount);
            setCustomPayAmount(String(amountToPay));
        } else {
            setCustomPayExpenseId('general');
            setCustomPayAmount(String(debt.amount));
        }
        setIsCustomPayModalOpen(true);
    };

    const handleSelectExpenseForPay = (expId) => {
        setCustomPayExpenseId(expId);
        const eligible = getEligibleExpensesForDebt(customPayDebt, activeSplit?.expenses || [], activeSplit?.participants || []);
        const chosen = eligible.find(e => String(e.id) === String(expId));
        if (chosen) {
            const rawShare = parseFloat(chosen.memberShare) || (customPayDebt?.amount || 0);
            const amountToPay = customPayDebt ? Math.min(rawShare, customPayDebt.amount) : rawShare;
            setCustomPayAmount(String(amountToPay));
        }
    };

    const handleCustomPaySubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!activeSplit || !customPayDebt) return;

        const payAmt = parseFloat(customPayAmount);
        if (!payAmt || payAmt <= 0) {
            alert("Please enter a valid payment amount greater than 0.");
            return;
        }

        if (customPayDebt && payAmt > customPayDebt.amount) {
            alert(`Payment amount cannot exceed the debtor's net outstanding debt of ${activeSplit.currencySymbol || '₹'}${customPayDebt.amount.toLocaleString()}.`);
            return;
        }

        const eligible = getEligibleExpensesForDebt(customPayDebt, activeSplit.expenses, activeSplit.participants);
        let chosenExp = eligible.find(exp => String(exp.id) === String(customPayExpenseId));
        if (!chosenExp && customPayExpenseId !== 'general') {
            chosenExp = activeSplit.expenses.find(exp => String(exp.id) === String(customPayExpenseId));
        }
        if (!chosenExp && customPayDebt.expenseId) {
            chosenExp = activeSplit.expenses.find(exp => String(exp.id) === String(customPayDebt.expenseId));
        }
        const allPrimaries = (activeSplit.expenses || []).filter(item => isPrimaryExpense(item));
        if (!chosenExp && allPrimaries.length === 1) {
            chosenExp = allPrimaries[0];
        }

        const targetExpenseId = chosenExp ? chosenExp.id : (customPayExpenseId !== 'general' && customPayExpenseId ? customPayExpenseId : (customPayDebt.expenseId || (allPrimaries.length === 1 ? allPrimaries[0].id : null)));
        const expenseTitle = chosenExp ? chosenExp.title : (customPayDebt.expenseTitle || 'Expense');

        // Requirement: Settlement for [Expense Title]: [From] paid [To]
        const settlementTitle = `Settlement for ${expenseTitle}: ${customPayDebt.from} paid ${customPayDebt.to}`;

        const settlementExpense = {
            id: 'exp-settle-' + Date.now(),
            title: settlementTitle,
            amount: payAmt,
            paidBy: customPayDebt.from,
            date: new Date().toISOString().split('T')[0],
            attachment: null,
            splitType: 'custom',
            isSettlement: true,
            type: 'SETTLEMENT',
            linked_expense_id: targetExpenseId,
            expenseId: targetExpenseId,
            relatedExpenseId: targetExpenseId,
            shares: {
                [customPayDebt.to]: payAmt
            }
        };

        // Set shares to 0 for everyone else
        activeSplit.participants.forEach(p => {
            if (p !== customPayDebt.to) {
                settlementExpense.shares[p] = 0;
            }
        });

        try {
            const createdSettlement = await splitExpenseService.addExpense(selectedSplitId, settlementExpense);
            const finalSettlement = {
                ...createdSettlement,
                title: settlementExpense.title,
                amount: settlementExpense.amount,
                paidBy: settlementExpense.paidBy,
                shares: settlementExpense.shares,
                isSettlement: true,
                type: 'SETTLEMENT',
                linked_expense_id: targetExpenseId,
                expenseId: targetExpenseId,
                relatedExpenseId: targetExpenseId
            };
            const updatedSplits = splits.map(s => {
                if (s.id === selectedSplitId) {
                    return {
                        ...s,
                        expenses: [finalSettlement, ...s.expenses]
                    };
                }
                return s;
            });
            setSplits(updatedSplits);
            try {
                localStorage.setItem('cliks_splits_data', JSON.stringify(updatedSplits));
            } catch {}
            alert(`✨ Settlement for "${expenseTitle}" logged successfully!`);
        } catch (err) {
            console.error("Error saving custom settlement to backend:", err);
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
            try {
                localStorage.setItem('cliks_splits_data', JSON.stringify(updatedSplits));
            } catch {}
            alert(`✨ Settlement for "${expenseTitle}" logged successfully!`);
        } finally {
            setIsCustomPayModalOpen(false);
            setCustomPayDebt(null);
            setCustomPayExpenseId('');
            setCustomPayAmount('');
        }
    };

    const handleShareGroup = () => {
        if (!activeSplit) return;
        const groupTotal = calculateGroupOutlay(activeSplit.expenses);
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
        const groupTotal = calculateGroupOutlay(activeSplit.expenses);
        
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
                    <td style="text-align: right; font-weight: 700;">${activeSplit.currencySymbol}${(parseFloat(e.amount) || 0).toLocaleString()}</td>
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

    const hasInvalidCustomShares = expenseForm.splitType === 'custom' && (
        !activeSplit?.participants ||
        activeSplit.participants.length === 0 ||
        activeSplit.participants.some(p => {
            const val = expenseForm.shares?.[p];
            if (val === undefined || val === null || String(val).trim() === '') return true;
            const num = Number(val);
            return isNaN(num) || num < 0;
        })
    );

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
                        onClick={() => {
                            setEditingGroupId(null);
                            setGroupForm({ title: '', currency: 'INR', description: '', participants: ['You'] });
                            setIsCreateGroupModalOpen(true);
                        }}
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
                                            const groupTotal = calculateGroupOutlay(s.expenses);
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
                                                                            setEditingGroupId(s.id);
                                                                            setGroupForm({
                                                                                title: s.title,
                                                                                currency: s.currency,
                                                                                description: s.description || '',
                                                                                participants: [...s.participants]
                                                                            });
                                                                            setIsCreateGroupModalOpen(true);
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
                                                                        <Pencil size={14} style={{ color: '#004aad' }} />
                                                                        Edit Ticket
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

                            {/* ── 2-COLUMN GRID (SUMMARY & TRANSFERS vs SETTLEMENTS & SIMPLIFIED DEBTS) ── */}
                            {(() => {
                                const allExpenses = activeSplit.expenses || [];
                                const splitSettlements = allExpenses.filter(item => !isPrimaryExpense(item));
                                const totalSettledAmount = splitSettlements.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                                const currSym = activeSplit.currencySymbol || '₹';

                                return (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                        {/* ── Left Column (lg:col-span-6) ── */}
                                        <div className="lg:col-span-6 flex flex-col gap-6">
                                            
                                            {/* 1. Summary Card */}
                                            <div
                                                className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm"
                                                style={{
                                                    background: '#FFFFFF',
                                                    borderRadius: '24px',
                                                    border: '1.5px solid #E2E8F0',
                                                    padding: '1.25rem 1.5rem',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                                                }}
                                            >
                                                {/* Summary Header Row */}
                                                <div
                                                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                                                            Summary
                                                        </h3>
                                                        <span
                                                            className="text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full"
                                                            style={{
                                                                fontSize: '0.68rem',
                                                                fontWeight: '850',
                                                                background: '#EFF6FF',
                                                                color: '#2563EB',
                                                                border: '1px solid #BFDBFE',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                textTransform: 'uppercase'
                                                            }}
                                                        >
                                                            {activeSplit.currency || 'INR'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            setIsSummaryExpanded(!isSummaryExpanded);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#64748B',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title={isSummaryExpanded ? 'Collapse summary' : 'Expand summary'}
                                                    >
                                                        <ChevronDown
                                                            size={18}
                                                            strokeWidth={2.5}
                                                            style={{
                                                                transform: isSummaryExpanded ? 'rotate(0deg)' : 'rotate(-180deg)',
                                                                transition: 'transform 0.2s ease'
                                                            }}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Members List Accordion Content */}
                                                {isSummaryExpanded && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                                                        {activeSplit.participants.map(m => {
                                                            const primaryExpenses = allExpenses.filter(item => isPrimaryExpense(item));

                                                            // Initial Audit Totals (Primary non-settlement expenses)
                                                            const paid = primaryExpenses
                                                                .filter(e => e.paidBy === m)
                                                                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

                                                            const charged = primaryExpenses.reduce((sum, e) => {
                                                                let share = 0;
                                                                if (e.shares && e.shares[m] !== undefined) {
                                                                    share = parseFloat(e.shares[m]) || 0;
                                                                } else if (e.splitType && !e.splitType.toLowerCase().includes('equal')) {
                                                                    share = parseFloat(e.shares?.[m]) || 0;
                                                                } else {
                                                                    const numParticipants = activeSplit.participants?.length || 1;
                                                                    share = (parseFloat(e.amount) || 0) / numParticipants;
                                                                }
                                                                return sum + share;
                                                            }, 0);

                                                            // Live Net Balance from calculatedBalances.members
                                                            const rawNet = calculatedBalances.members[m] !== undefined ? calculatedBalances.members[m] : (paid - charged);
                                                            const isSettled = Math.abs(rawNet) < 0.01;
                                                            const net = isSettled ? 0 : rawNet;
                                                            const isPositive = net > 0.001;

                                                            return (
                                                                <div
                                                                    key={m}
                                                                    className="bg-gray-50/60 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between"
                                                                    style={{
                                                                        background: 'rgba(249, 250, 251, 0.6)',
                                                                        borderRadius: '16px',
                                                                        border: '1px solid #F1F5F9',
                                                                        padding: '0.85rem 1rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between'
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                                            <span style={{ fontSize: '0.92rem', fontWeight: '850', color: '#1E293B' }}>
                                                                                {m}
                                                                            </span>
                                                                            {isSettled && (
                                                                                <span
                                                                                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold"
                                                                                    style={{
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '3px',
                                                                                        fontSize: '0.68rem',
                                                                                        fontWeight: '800',
                                                                                        background: '#ECFDF5',
                                                                                        color: '#059669',
                                                                                        border: '1px solid #A7F3D0',
                                                                                        padding: '1px 7px',
                                                                                        borderRadius: '9999px'
                                                                                    }}
                                                                                >
                                                                                    <Check size={11} strokeWidth={2.5} /> Settled
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>
                                                                            Charged {currSym}{charged.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}, Paid {currSym}{paid.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <span style={{
                                                                            fontSize: '1rem',
                                                                            fontWeight: '950',
                                                                            color: isSettled ? '#64748B' : (isPositive ? '#059669' : '#DC2626')
                                                                        }}>
                                                                            {isSettled ? `${currSym}0.00` : `${isPositive ? '+' : '-'}${currSym}${Math.abs(net).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. How to settle? Card */}
                                            <div
                                                className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm"
                                                style={{
                                                    background: '#FFFFFF',
                                                    borderRadius: '24px',
                                                    border: '1.5px solid #E2E8F0',
                                                    padding: '1.25rem 1.5rem',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                                                }}
                                            >
                                                {/* Header Row */}
                                                <div
                                                    onClick={() => setIsSettleExpanded(!isSettleExpanded)}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                                                            How to settle?
                                                        </h3>
                                                        <span
                                                            className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-black uppercase"
                                                            style={{
                                                                fontSize: '0.68rem',
                                                                fontWeight: '850',
                                                                background: '#ECFDF5',
                                                                color: '#059669',
                                                                border: '1px solid #A7F3D0',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                textTransform: 'uppercase'
                                                            }}
                                                        >
                                                            {calculatedBalances.debts.length} {calculatedBalances.debts.length === 1 ? 'TRANSFER' : 'TRANSFERS'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            setIsSettleExpanded(!isSettleExpanded);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#64748B',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title={isSettleExpanded ? 'Collapse settlement instructions' : 'Expand settlement instructions'}
                                                    >
                                                        <ChevronDown
                                                            size={18}
                                                            strokeWidth={2.5}
                                                            style={{
                                                                transform: isSettleExpanded ? 'rotate(0deg)' : 'rotate(-180deg)',
                                                                transition: 'transform 0.2s ease'
                                                            }}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Content Accordion */}
                                                {isSettleExpanded && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                                                        {calculatedBalances.debts.length === 0 ? (
                                                            <div 
                                                                className="flex items-center justify-center gap-2 py-4 text-emerald-600 font-extrabold text-sm"
                                                                style={{ textAlign: 'center', padding: '0.85rem 0', color: '#059669', fontWeight: '750', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                            >
                                                                <Check size={18} strokeWidth={2.5} /> All accounts completely settled!
                                                            </div>
                                                        ) : (
                                                            calculatedBalances.debts.map((d, dIdx) => (
                                                                <div
                                                                    key={dIdx}
                                                                    className="bg-gray-50/60 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between"
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.65rem 0.85rem',
                                                                        borderRadius: '12px',
                                                                        background: '#F8FAFC',
                                                                        border: '1px solid #F1F5F9'
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <span style={{ fontSize: '0.92rem', fontWeight: '850', color: '#1E293B', display: 'block' }}>
                                                                            {d.from}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                                                                            should pay to <strong style={{ color: '#0F172A', fontWeight: '750' }}>{d.to}</strong>
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <span style={{
                                                                            fontSize: '0.98rem',
                                                                            fontWeight: '950',
                                                                            color: '#2563EB'
                                                                        }}>
                                                                            {formatCurrencyUniversal(d.amount, activeSplit.currency)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {/* ── Right Column (lg:col-span-6) ── */}
                                        <div className="lg:col-span-6 flex flex-col gap-6">

                                            {/* 1. SETTLEMENTS Section */}
                                            <div className="flex flex-col gap-3">
                                                {/* Top row */}
                                                <div 
                                                    className="flex items-center justify-between px-1"
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}
                                                >
                                                    <span 
                                                        className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider"
                                                        style={{ fontSize: '0.75rem', fontWeight: '850', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                    >
                                                        <Check size={14} strokeWidth={2.5} /> SETTLEMENTS ({splitSettlements.length})
                                                    </span>
                                                    <span 
                                                        className="text-xs font-bold text-emerald-600"
                                                        style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}
                                                    >
                                                        Settled: {currSym}{totalSettledAmount.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Settlements Container */}
                                                {splitSettlements.length === 0 ? (
                                                    <div 
                                                        className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center"
                                                        style={{ background: 'rgba(236, 253, 245, 0.5)', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                                                    >
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '750', color: '#065F46' }}>No settlements recorded yet</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Settling dues will record payment receipts here.</div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="flex flex-col gap-2.5 pr-1.5 max-h-[226px] overflow-y-auto" 
                                                        style={{ 
                                                            display: 'flex', 
                                                            flexDirection: 'column', 
                                                            gap: '0.625rem',
                                                            maxHeight: '226px',
                                                            overflowY: 'auto',
                                                            paddingRight: '6px',
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#CBD5E1 transparent'
                                                        }}
                                                    >
                                                        {splitSettlements.map(s => (
                                                            <div
                                                                key={s.id}
                                                                className="h-[68px] min-h-[68px] shrink-0 bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm transition-all"
                                                                style={{
                                                                    height: '68px',
                                                                    minHeight: '68px',
                                                                    flexShrink: 0,
                                                                    boxSizing: 'border-box',
                                                                    background: 'rgba(236, 253, 245, 0.5)',
                                                                    border: '1px solid #A7F3D0',
                                                                    borderRadius: '16px',
                                                                    padding: '0.85rem 1rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '0.75rem'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                                    {/* Emerald checkmark square icon */}
                                                                    <div 
                                                                        className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center flex-shrink-0"
                                                                        style={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            borderRadius: '12px',
                                                                            background: '#DCFCE7',
                                                                            color: '#059669',
                                                                            border: '1px solid #86EFAC',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            flexShrink: 0
                                                                        }}
                                                                    >
                                                                        <Check size={18} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div style={{ minWidth: 0 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                                                            <span style={{ fontSize: '0.88rem', fontWeight: '850', color: '#065F46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                {s.title}
                                                                            </span>
                                                                            <span 
                                                                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300"
                                                                                style={{
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    padding: '1px 7px',
                                                                                    borderRadius: '9999px',
                                                                                    fontSize: '0.62rem',
                                                                                    fontWeight: '750',
                                                                                    background: '#DCFCE7',
                                                                                    color: '#059669',
                                                                                    border: '1px solid #86EFAC'
                                                                                }}
                                                                            >
                                                                                Settlement
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: '600', marginTop: '2px' }}>
                                                                            Paid by <strong style={{ color: '#065F46' }}>{s.paidBy}</strong> • {s.date}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                                    <span style={{ fontSize: '1rem', fontWeight: '950', color: '#059669' }}>
                                                                        +{currSym}{(parseFloat(s.amount) || 0).toLocaleString()}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteExpense(s.id)}
                                                                        title="Delete Settlement"
                                                                        style={{
                                                                            background: 'transparent',
                                                                            border: 'none',
                                                                            color: '#94A3B8',
                                                                            cursor: 'pointer',
                                                                            padding: '4px',
                                                                            borderRadius: '6px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.15s'
                                                                        }}
                                                                        onMouseOver={(ev) => ev.currentTarget.style.color = '#EF4444'}
                                                                        onMouseOut={(ev) => ev.currentTarget.style.color = '#94A3B8'}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. SIMPLIFIED DEBTS Container */}
                                            <div 
                                                className="bg-[#0b1329] text-white rounded-3xl p-6 shadow-md"
                                                style={{
                                                    background: '#0b1329',
                                                    color: '#FFFFFF',
                                                    borderRadius: '24px',
                                                    padding: '1.5rem',
                                                    boxShadow: '0 8px 24px rgba(11, 19, 41, 0.18)'
                                                }}
                                            >
                                                <h5 
                                                    className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4"
                                                    style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                                                >
                                                    SIMPLIFIED DEBTS
                                                </h5>

                                                {calculatedBalances.debts.length === 0 ? (
                                                    <div 
                                                        className="flex flex-col items-center justify-center py-6 text-center"
                                                        style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <div 
                                                            className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2"
                                                            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}
                                                        >
                                                            <Check size={22} color="#34D399" strokeWidth={3} />
                                                        </div>
                                                        <p 
                                                            className="text-sm font-bold text-slate-300 m-0"
                                                            style={{ margin: 0, fontSize: '0.85rem', color: '#CBD5E1', fontWeight: '750' }}
                                                        >
                                                            ✓ All accounts completely settled!
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {calculatedBalances.debts.map((d, dIdx) => (
                                                            <div
                                                                key={dIdx}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.04)',
                                                                    padding: '0.85rem 1rem',
                                                                    borderRadius: '16px',
                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    flexWrap: 'wrap'
                                                                }}
                                                            >
                                                                <div>
                                                                    <div style={{ fontSize: '0.82rem', fontWeight: '750', color: '#F8FAFC' }}>
                                                                        {d.from} owes <strong style={{ color: '#FFFFFF' }}>{d.to}</strong>
                                                                    </div>
                                                                    <div style={{ fontSize: '1.05rem', fontWeight: '950', color: '#38BDF8', marginTop: '2px' }}>
                                                                        {currSym}{d.amount.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openCustomPayModal(d)}
                                                                        style={{
                                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                                            background: 'rgba(255,255,255,0.08)',
                                                                            color: '#F8FAFC',
                                                                            padding: '0.4rem 0.75rem',
                                                                            borderRadius: '8px',
                                                                            fontWeight: '800',
                                                                            fontSize: '0.72rem',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s'
                                                                        }}
                                                                        onMouseOver={(ev) => ev.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                                                                        onMouseOut={(ev) => ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                                    >
                                                                        Custom Pay
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSettleDebt(d)}
                                                                        style={{
                                                                            border: 'none',
                                                                            background: '#34D399',
                                                                            color: '#064E3B',
                                                                            padding: '0.4rem 0.85rem',
                                                                            borderRadius: '8px',
                                                                            fontWeight: '900',
                                                                            fontSize: '0.72rem',
                                                                            cursor: 'pointer',
                                                                            boxShadow: '0 4px 10px rgba(52, 211, 153, 0.2)'
                                                                        }}
                                                                    >
                                                                        Settle
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Sessions Content: Each primary expense creates its own self-contained session section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                
                                {/* Top Action Bar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            Logged Expenses
                                        </h3>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: '750', 
                                            background: '#F1F5F9', 
                                            color: '#475569', 
                                            padding: '2px 8px', 
                                            borderRadius: '9999px',
                                            border: '1px solid #E2E8F0'
                                        }}>
                                            {(activeSplit.expenses || []).filter(item => isPrimaryExpense(item)).length} {((activeSplit.expenses || []).filter(item => isPrimaryExpense(item)).length === 1) ? 'Session' : 'Sessions'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {/* Search Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <AnimatePresence>
                                                {showDetailSearch && (
                                                    <Motion.input
                                                        initial={{ width: 0, opacity: 0 }}
                                                        animate={{ width: 150, opacity: 1 }}
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
                                    // Separate primary expenses and settlements
                                    const allItems = activeSplit.expenses || [];
                                    const primaryExpenses = allItems.filter(item => isPrimaryExpense(item));
                                    const settlements = allItems.filter(item => !isPrimaryExpense(item));

                                    // Filter primary expenses by search query (or if any of its linked settlements match)
                                    const filteredPrimaryExpenses = primaryExpenses.filter(e => {
                                        if (!detailSearchQuery.trim()) return true;
                                        const term = detailSearchQuery.toLowerCase().trim();
                                        const matchesExp = e.title.toLowerCase().includes(term) ||
                                               e.paidBy.toLowerCase().includes(term) ||
                                               String(e.amount).includes(term) ||
                                               (e.attachment || '').toLowerCase().includes(term);
                                        if (matchesExp) return true;
                                        return settlements.some(s => isSettlementLinkedToExpense(s, e, primaryExpenses) && (
                                            s.title.toLowerCase().includes(term) ||
                                            s.paidBy.toLowerCase().includes(term) ||
                                            String(s.amount).includes(term)
                                        ));
                                    });

                                    // Settlements not linked to any primary expense
                                    const generalSettlements = settlements.filter(s => {
                                        const isLinked = primaryExpenses.some(exp => isSettlementLinkedToExpense(s, exp, primaryExpenses));
                                        if (isLinked) return false;
                                        if (!detailSearchQuery.trim()) return true;
                                        const term = detailSearchQuery.toLowerCase().trim();
                                        return s.title.toLowerCase().includes(term) ||
                                               s.paidBy.toLowerCase().includes(term) ||
                                               String(s.amount).includes(term);
                                    });

                                    const hasItems = filteredPrimaryExpenses.length > 0 || generalSettlements.length > 0;

                                    if (!hasItems) {
                                        return (
                                            <div style={{ border: '2px dashed #E2E8F0', borderRadius: '24px', background: 'white', padding: '3.5rem 2rem', textAlign: 'center' }}>
                                                <Receipt size={36} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#334155', margin: '0 0 0.15rem 0' }}>No Expenses Found</h4>
                                                <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '280px', margin: '0 auto' }}>
                                                    {activeSplit.expenses.length === 0 
                                                        ? 'Click "+ Add Expense" to record dinners, travel costs, or team bills in this split ticket.'
                                                        : `No expenses match your search query "${detailSearchQuery}".`
                                                    }
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Primary Expenses: Each in its own self-contained session section */}
                                            {filteredPrimaryExpenses.map(e => {
                                                // Determine split type badge
                                                const splitBadgeText = e.splitType && !e.splitType.toLowerCase().includes('equal') ? 'Custom Split' : 'Equal Split';
                                                const badgeStyle = splitBadgeText === 'Equal Split'
                                                    ? { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' }
                                                    : { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' };

                                                const linkedSettlements = settlements.filter(s => isSettlementLinkedToExpense(s, e, primaryExpenses));
                                                const sessionBalances = calculateSessionBalances(e, linkedSettlements, activeSplit.participants);
                                                const isExpanded = expandedExpenseIds.includes(e.id);

                                                return (
                                                    <div 
                                                        key={e.id} 
                                                        className="bg-white border rounded-3xl p-6 shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
                                                        style={{
                                                            background: '#FFFFFF',
                                                            borderRadius: '24px',
                                                            border: '1px solid #E2E8F0',
                                                            padding: '1.5rem',
                                                            marginBottom: '1.5rem',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)'
                                                        }}
                                                    >
                                                        {/* Header Card (Clickable Row to Toggle) */}
                                                        <div
                                                            onClick={() => toggleExpenseExpand(e.id)}
                                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }}
                                                        >
                                                            {/* Left: Toggle Chevron, Receipt Icon & Content */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: '240px' }}>
                                                                {/* Dropdown Chevron Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(ev) => {
                                                                        ev.stopPropagation();
                                                                        toggleExpenseExpand(e.id);
                                                                    }}
                                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                                    style={{
                                                                        width: '28px',
                                                                        height: '28px',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#94A3B8',
                                                                        border: 'none',
                                                                        background: 'transparent',
                                                                        cursor: 'pointer',
                                                                        flexShrink: 0,
                                                                        transition: 'all 0.15s'
                                                                    }}
                                                                    title={isExpanded ? 'Collapse session' : 'Expand session'}
                                                                    onMouseOver={(ev) => {
                                                                        ev.currentTarget.style.color = '#334155';
                                                                        ev.currentTarget.style.background = '#F1F5F9';
                                                                    }}
                                                                    onMouseOut={(ev) => {
                                                                        ev.currentTarget.style.color = '#94A3B8';
                                                                        ev.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    <ChevronDown
                                                                        size={16}
                                                                        strokeWidth={2.5}
                                                                        style={{
                                                                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                                            transition: 'transform 0.2s ease-in-out'
                                                                        }}
                                                                    />
                                                                </button>

                                                                <div
                                                                    style={{ 
                                                                        width: '42px', 
                                                                        height: '42px', 
                                                                        borderRadius: '12px', 
                                                                        background: '#F8FAFC', 
                                                                        color: '#475569', 
                                                                        border: '1px solid #E2E8F0',
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        justifyContent: 'center', 
                                                                        flexShrink: 0 
                                                                    }}
                                                                >
                                                                    <Receipt size={20} />
                                                                </div>

                                                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                        <h4 
                                                                            style={{ 
                                                                                margin: 0, 
                                                                                fontSize: '1rem', 
                                                                                fontWeight: '800', 
                                                                                color: '#0F172A',
                                                                                letterSpacing: '-0.01em'
                                                                            }}
                                                                        >
                                                                            {e.title}
                                                                        </h4>

                                                                        <span 
                                                                            style={{
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                padding: '2px 8px',
                                                                                borderRadius: '9999px',
                                                                                fontSize: '0.68rem',
                                                                                fontWeight: '750',
                                                                                background: badgeStyle.bg,
                                                                                color: badgeStyle.color,
                                                                                border: `1px solid ${badgeStyle.border}`
                                                                            }}
                                                                        >
                                                                            {splitBadgeText}
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748B' }}>
                                                                            Paid by <strong style={{ color: '#1E293B', fontWeight: '750' }}>{e.paidBy}</strong>
                                                                        </span>
                                                                        
                                                                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
                                                                        
                                                                        <span 
                                                                            style={{ 
                                                                                display: 'inline-flex', 
                                                                                alignItems: 'center', 
                                                                                gap: '4px',
                                                                                fontSize: '0.7rem', 
                                                                                fontWeight: '600', 
                                                                                color: '#64748B',
                                                                                background: '#F8FAFC',
                                                                                border: '1px solid #E2E8F0',
                                                                                padding: '1px 7px',
                                                                                borderRadius: '6px'
                                                                            }}
                                                                        >
                                                                            <Calendar size={11} style={{ color: '#94A3B8' }} /> {e.date}
                                                                        </span>

                                                                        {e.attachment && (
                                                                            <>
                                                                                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(ev) => {
                                                                                        ev.stopPropagation();
                                                                                        const cleanName = e.attachment.split('/').pop().replace(/^\d+_/, '') || e.attachment;
                                                                                        setPreviewAttachment({
                                                                                            url: resolveFileUrl(e.attachment),
                                                                                            name: cleanName
                                                                                        });
                                                                                    }}
                                                                                    style={{
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '4px',
                                                                                        background: '#EFF6FF',
                                                                                        color: '#2563EB',
                                                                                        border: '1px solid #BFDBFE',
                                                                                        padding: '1px 8px',
                                                                                        borderRadius: '6px',
                                                                                        fontSize: '0.68rem',
                                                                                        fontWeight: '750',
                                                                                        cursor: 'pointer',
                                                                                        maxWidth: '160px',
                                                                                        transition: 'all 0.15s'
                                                                                    }}
                                                                                    title="Click to view attachment inline"
                                                                                    onMouseOver={(ev) => ev.currentTarget.style.background = '#DBEAFE'}
                                                                                    onMouseOut={(ev) => ev.currentTarget.style.background = '#EFF6FF'}
                                                                                >
                                                                                    <FileText size={11} style={{ flexShrink: 0 }} />
                                                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                        {e.attachment.split('/').pop().replace(/^\d+_/, '') || 'Attachment'}
                                                                                    </span>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right: Amount & Actions */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <span 
                                                                        style={{ 
                                                                            fontSize: '1.2rem', 
                                                                            fontWeight: '900', 
                                                                            color: '#0F172A',
                                                                            letterSpacing: '-0.02em',
                                                                            display: 'block'
                                                                        }}
                                                                    >
                                                                        {activeSplit.currencySymbol || '₹'}{(parseFloat(e.amount) || 0).toLocaleString()}
                                                                    </span>
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(ev) => {
                                                                            ev.stopPropagation();
                                                                            openEditExpenseModal(e);
                                                                        }}
                                                                        title="Edit Expense"
                                                                        style={{ 
                                                                            background: 'transparent', 
                                                                            border: 'none', 
                                                                            color: '#94A3B8', 
                                                                            cursor: 'pointer', 
                                                                            padding: '6px', 
                                                                            borderRadius: '8px',
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.15s'
                                                                        }}
                                                                        onMouseOver={(ev) => {
                                                                            ev.currentTarget.style.color = '#16A34A';
                                                                            ev.currentTarget.style.background = '#F0FDF4';
                                                                        }}
                                                                        onMouseOut={(ev) => {
                                                                            ev.currentTarget.style.color = '#94A3B8';
                                                                            ev.currentTarget.style.background = 'transparent';
                                                                        }}
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(ev) => {
                                                                            ev.stopPropagation();
                                                                            handleDeleteExpense(e.id);
                                                                        }}
                                                                        title="Delete Expense"
                                                                        style={{ 
                                                                            background: 'transparent', 
                                                                            border: 'none', 
                                                                            color: '#94A3B8', 
                                                                            cursor: 'pointer', 
                                                                            padding: '6px', 
                                                                            borderRadius: '8px',
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.15s'
                                                                        }}
                                                                        onMouseOver={(ev) => {
                                                                            ev.currentTarget.style.color = '#EF4444';
                                                                            ev.currentTarget.style.background = '#FEF2F2';
                                                                        }}
                                                                        onMouseOut={(ev) => {
                                                                            ev.currentTarget.style.color = '#94A3B8';
                                                                            ev.currentTarget.style.background = 'transparent';
                                                                        }}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sub-Grid (2 Columns) - Collapsible Accordion Content */}
                                                        {isExpanded && (
                                                            <div
                                                                style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                                                    gap: '1.25rem',
                                                                    marginTop: '1.25rem',
                                                                    paddingTop: '1.25rem',
                                                                    borderTop: '1px solid #F1F5F9',
                                                                    alignItems: 'start'
                                                                }}
                                                            >
                                                                {/* Left Column: Balances & Simplified Debts */}
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                    {/* 1. INDIVIDUAL BALANCES card */}
                                                                    <div style={{ background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.15rem' }}>
                                                                        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                            Individual Balances
                                                                        </h5>

                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                                                            {activeSplit.participants.map(m => {
                                                                                const bal = sessionBalances.members[m] || 0;
                                                                                return (
                                                                                    <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                        <span style={{ fontWeight: '750', color: '#334155', fontSize: '0.82rem' }}>{m}</span>
                                                                                        <span style={{
                                                                                            fontWeight: '900',
                                                                                            fontSize: '0.82rem',
                                                                                            color: bal > 0.01 ? '#059669' : bal < -0.01 ? '#DC2626' : '#64748B'
                                                                                        }}>
                                                                                            {bal > 0.01 ? '+' : ''}{activeSplit.currencySymbol || '₹'}{bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                    {/* 2. SIMPLIFIED DEBTS dark box */}
                                                                    <div style={{ background: '#0F172A', borderRadius: '18px', padding: '1.15rem', color: 'white', boxShadow: '0 8px 18px rgba(15,23,42,0.12)' }}>
                                                                        <h5 style={{ margin: '0 0 0.85rem 0', fontSize: '0.75rem', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                            Simplified Debts
                                                                        </h5>

                                                                        {sessionBalances.debts.length === 0 ? (
                                                                            <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                                                                                <Check size={22} color="#34D399" style={{ marginBottom: '0.35rem' }} />
                                                                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>✓ All accounts completely settled!</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                                                                {sessionBalances.debts.map((d, dIdx) => (
                                                                                    <div
                                                                                        key={dIdx}
                                                                                        style={{
                                                                                            background: 'rgba(255,255,255,0.04)',
                                                                                            padding: '0.7rem 0.85rem',
                                                                                            borderRadius: '12px',
                                                                                            border: '1px solid rgba(255,255,255,0.07)',
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            gap: '0.5rem',
                                                                                            flexWrap: 'wrap'
                                                                                        }}
                                                                                    >
                                                                                        <div>
                                                                                            <div style={{ fontSize: '0.78rem', fontWeight: '750', color: '#F8FAFC' }}>
                                                                                                {d.from} owes {d.to}
                                                                                            </div>
                                                                                            <div style={{ fontSize: '0.95rem', fontWeight: '950', color: '#38BDF8', marginTop: '1px' }}>
                                                                                                {activeSplit.currencySymbol || '₹'}{d.amount.toLocaleString()}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => openCustomPayModal(d)}
                                                                                                style={{
                                                                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                                                                    background: 'rgba(255,255,255,0.08)',
                                                                                                    color: '#F8FAFC',
                                                                                                    padding: '0.35rem 0.65rem',
                                                                                                    borderRadius: '8px',
                                                                                                    fontWeight: '800',
                                                                                                    fontSize: '0.7rem',
                                                                                                    cursor: 'pointer',
                                                                                                    transition: 'all 0.15s'
                                                                                                }}
                                                                                                onMouseOver={(ev) => ev.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                                                                                                onMouseOut={(ev) => ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                                                            >
                                                                                                Custom Pay
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleSettleDebt(d)}
                                                                                                style={{
                                                                                                    border: 'none',
                                                                                                    background: '#34D399',
                                                                                                    color: '#064E3B',
                                                                                                    padding: '0.35rem 0.65rem',
                                                                                                    borderRadius: '8px',
                                                                                                    fontWeight: '900',
                                                                                                    fontSize: '0.7rem',
                                                                                                    cursor: 'pointer',
                                                                                                    boxShadow: '0 4px 10px rgba(52, 211, 153, 0.2)'
                                                                                                }}
                                                                                            >
                                                                                                Settle
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Right Column: List of Settlement Cards linked to this specific expense */}
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: '850', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                            <Check size={14} strokeWidth={2.5} /> Settlements ({linkedSettlements.length})
                                                                        </span>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>
                                                                            Settled: {activeSplit.currencySymbol || '₹'}{linkedSettlements.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0).toLocaleString()}
                                                                        </span>
                                                                    </div>

                                                                    {linkedSettlements.length === 0 ? (
                                                                        <div style={{
                                                                            background: '#F8FAFC',
                                                                            border: '1.5px dashed #E2E8F0',
                                                                            borderRadius: '18px',
                                                                            padding: '2rem 1.25rem',
                                                                            textAlign: 'center',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Check size={24} style={{ color: '#CBD5E1', marginBottom: '0.5rem' }} />
                                                                            <div style={{ fontSize: '0.82rem', fontWeight: '750', color: '#64748B' }}>No settlements yet</div>
                                                                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>Settling dues will record payment receipts here.</div>
                                                                        </div>
                                                                    ) : (
                                                                        linkedSettlements.map(s => (
                                                                            <div
                                                                                key={s.id}
                                                                                style={{
                                                                                    background: '#F0FDF4',
                                                                                    border: '1px solid #BBF7D0',
                                                                                    borderRadius: '16px',
                                                                                    padding: '0.75rem 1rem',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-between',
                                                                                    gap: '0.75rem'
                                                                                }}
                                                                            >
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                                                    <div style={{
                                                                                        width: '32px',
                                                                                        height: '32px',
                                                                                        borderRadius: '10px',
                                                                                        background: '#DCFCE7',
                                                                                        color: '#059669',
                                                                                        border: '1px solid #86EFAC',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        flexShrink: 0
                                                                                    }}>
                                                                                        <Check size={16} strokeWidth={2.5} />
                                                                                    </div>
                                                                                    <div style={{ minWidth: 0 }}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#065F46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                                {s.title}
                                                                                            </span>
                                                                                            <span style={{
                                                                                                display: 'inline-flex',
                                                                                                alignItems: 'center',
                                                                                                padding: '1px 6px',
                                                                                                borderRadius: '9999px',
                                                                                                fontSize: '0.62rem',
                                                                                                fontWeight: '750',
                                                                                                background: '#DCFCE7',
                                                                                                color: '#059669',
                                                                                                border: '1px solid #86EFAC'
                                                                                            }}>
                                                                                                Settlement
                                                                                            </span>
                                                                                        </div>
                                                                                        <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '600', marginTop: '1px' }}>
                                                                                            Paid by <strong style={{ color: '#065F46' }}>{s.paidBy}</strong> • {s.date}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#059669' }}>
                                                                                        +{activeSplit.currencySymbol || '₹'}{(parseFloat(s.amount) || 0).toLocaleString()}
                                                                                    </span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteExpense(s.id)}
                                                                                        title="Delete Settlement"
                                                                                        style={{
                                                                                            background: 'transparent',
                                                                                            border: 'none',
                                                                                            color: '#94A3B8',
                                                                                            cursor: 'pointer',
                                                                                            padding: '4px',
                                                                                            borderRadius: '6px',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            transition: 'all 0.15s'
                                                                                        }}
                                                                                        onMouseOver={(ev) => ev.currentTarget.style.color = '#EF4444'}
                                                                                        onMouseOut={(ev) => ev.currentTarget.style.color = '#94A3B8'}
                                                                                    >
                                                                                        <X size={15} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Unlinked / General Settlements Card (if any) */}
                                            {generalSettlements.length > 0 && (
                                                <div 
                                                    className="bg-white border rounded-3xl p-6 shadow-sm mb-6"
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: '24px',
                                                        border: '1px solid #E2E8F0',
                                                        padding: '1.5rem',
                                                        marginBottom: '1.5rem',
                                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <Check size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#065F46' }}>Other Settlements</h4>
                                                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Direct or group debt settlements</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {generalSettlements.map(s => (
                                                            <div 
                                                                key={s.id}
                                                                style={{
                                                                    background: '#F0FDF4',
                                                                    border: '1px solid #BBF7D0',
                                                                    borderRadius: '16px',
                                                                    padding: '0.75rem 1rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '0.75rem'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#DCFCE7', color: '#059669', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        <Check size={16} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div style={{ minWidth: 0 }}>
                                                                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#065F46' }}>
                                                                            {s.title}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '600' }}>
                                                                            Paid by <strong style={{ color: '#065F46' }}>{s.paidBy}</strong> • {s.date}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#059669' }}>
                                                                        +{activeSplit.currencySymbol || '₹'}{(parseFloat(s.amount) || 0).toLocaleString()}
                                                                    </span>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleDeleteExpense(s.id)}
                                                                        title="Delete Settlement"
                                                                        style={{ 
                                                                            background: 'transparent', 
                                                                            border: 'none', 
                                                                            color: '#94A3B8', 
                                                                            cursor: 'pointer', 
                                                                            padding: '4px', 
                                                                            borderRadius: '6px' 
                                                                        }}
                                                                        onMouseOver={(ev) => ev.currentTarget.style.color = '#EF4444'}
                                                                        onMouseOut={(ev) => ev.currentTarget.style.color = '#94A3B8'}
                                                                    >
                                                                        <X size={15} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
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
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>{editingGroupId ? 'Edit Split Ticket' : 'Create Split Ticket'}</h3>
                                <button style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} onClick={() => {
                                    setIsCreateGroupModalOpen(false);
                                    setEditingGroupId(null);
                                }}><X size={18} /></button>
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
                                    {editingGroupId ? 'Save Changes' : 'Create Ticket'}
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
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>{editingExpenseId ? 'Edit Expense Item' : 'Record Expense'}</h3>
                                <button style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} onClick={closeExpenseModal}><X size={18} /></button>
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
                                            type="text" 
                                            inputMode="decimal"
                                            placeholder="0.00"
                                            value={expenseForm.amount}
                                            onChange={handleAmountChange}
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
                                </div> {/* End Grid */}

                                {/* ATTACH YOUR EXPENSES */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                        ATTACH YOUR EXPENSES
                                    </label>
                                    
                                    <input 
                                        id="expense-attachment-input"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,application/pdf"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />

                                    {expenseForm.attachmentFile || expenseForm.attachmentName ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                <FileText size={18} style={{ color: '#059669', flexShrink: 0 }} />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: '850', color: '#064E3B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {expenseForm.attachmentName}
                                                    </div>
                                                    {expenseForm.attachmentSizeKb && (
                                                        <div style={{ fontSize: '0.68rem', fontWeight: '750', color: '#047857' }}>
                                                            {expenseForm.attachmentSizeKb} KB
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveFile}
                                                style={{ border: 'none', background: '#D1FAE5', color: '#065F46', padding: '4px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px' }}
                                                title="Remove attachment"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => document.getElementById('expense-attachment-input')?.click()}
                                            style={{ 
                                                border: '1.5px dashed #CBD5E1', 
                                                borderRadius: '12px', 
                                                padding: '0.9rem', 
                                                textAlign: 'center', 
                                                cursor: 'pointer', 
                                                background: '#FFFFFF',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.background = '#F0FDF4'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <Upload size={18} style={{ color: '#059669' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155' }}>Click to upload invoice / receipt copy</span>
                                            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>Supports PNG, JPG, WEBP, or PDF (up to 20MB)</span>
                                        </div>
                                    )}
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
                                                            {activeSplit.currencySymbol}{Number.isFinite(equalShare) ? equalShare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                        </span>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#64748B' }}>{activeSplit.currencySymbol}</span>
                                                            <input 
                                                                required
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                inputMode="decimal"
                                                                placeholder="0.00"
                                                                value={expenseForm.shares[p] || ''}
                                                                onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                                                                onChange={(e) => {
                                                                    let val = e.target.value;
                                                                    if (Number(val) < 0) return;
                                                                    val = val.replace(/[^0-9.]/g, '');
                                                                    if (Number(val) < 0) return;
                                                                    const parts = val.split('.');
                                                                    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                                                                    let intPart = parts[0] || '';
                                                                    if (intPart.length > 12) intPart = intPart.slice(0, 12);
                                                                    let decPart = parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '';
                                                                    const cleanVal = intPart + decPart;
                                                                    if (Number(cleanVal) < 0) return;
                                                                    const newShares = { ...expenseForm.shares };
                                                                    newShares[p] = cleanVal;
                                                                    setExpenseForm({ ...expenseForm, shares: newShares });
                                                                }}
                                                                style={{ width: '100px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '900', textAlign: 'right', fontSize: '0.82rem', color: '#1B6B3A' }}
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
                                                        : `Allocated: ${activeSplit.currencySymbol}${Number.isFinite(sum) ? sum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} (${difference > 0 ? 'Remaining' : 'Over'}: ${activeSplit.currencySymbol}${Number.isFinite(difference) ? Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'})`
                                                    }
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={hasInvalidCustomShares}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        borderRadius: '12px', 
                                        background: hasInvalidCustomShares ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                        color: 'white', 
                                        border: 'none', 
                                        fontWeight: '850', 
                                        fontSize: '0.88rem', 
                                        cursor: hasInvalidCustomShares ? 'not-allowed' : 'pointer', 
                                        marginTop: '0.5rem',
                                        opacity: hasInvalidCustomShares ? 0.6 : 1
                                    }}
                                >
                                    {editingExpenseId ? 'Save Changes' : 'Log Expense'}
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ──────── MODAL: CUSTOM PAY SETTLEMENT ──────── */}
            <AnimatePresence>
                {isCustomPayModalOpen && customPayDebt && activeSplit && (() => {
                    const eligibleExpenses = getEligibleExpensesForDebt(customPayDebt, activeSplit.expenses || [], activeSplit.participants || []);
                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
                            >
                                {/* Header */}
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Custom Expense Settlement</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0', fontWeight: '600' }}>Settle debt linked to a specific purchase</p>
                                    </div>
                                    <button 
                                        type="button"
                                        style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} 
                                        onClick={() => {
                                            setIsCustomPayModalOpen(false);
                                            setCustomPayDebt(null);
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleCustomPaySubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Debtor & Creditor Overview */}
                                    <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Settlement Flow</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: '#DC2626' }}>{customPayDebt.from}</span>
                                                <span style={{ color: '#94A3B8' }}>➔</span>
                                                <span style={{ color: '#059669' }}>{customPayDebt.to}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Outstanding Debt</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '950', color: '#0284C7', marginTop: '3px' }}>
                                                {activeSplit.currencySymbol || '₹'}{customPayDebt.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expense Selector: Dropdown / Radio list */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
                                            Select Expense Paid by {customPayDebt.to}
                                        </label>

                                        {eligibleExpenses.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {eligibleExpenses.map(exp => {
                                                    const isSelected = String(customPayExpenseId) === String(exp.id);
                                                    return (
                                                        <div 
                                                            key={exp.id}
                                                            onClick={() => handleSelectExpenseForPay(exp.id)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                padding: '0.75rem 0.9rem',
                                                                borderRadius: '14px',
                                                                border: isSelected ? '2px solid #059669' : '1px solid #E2E8F0',
                                                                background: isSelected ? '#F0FDF4' : '#FFFFFF',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                                <input 
                                                                    type="radio" 
                                                                    name="customPayExpense" 
                                                                    checked={isSelected} 
                                                                    onChange={() => handleSelectExpenseForPay(exp.id)} 
                                                                    style={{ accentColor: '#059669', cursor: 'pointer', flexShrink: 0 }}
                                                                />
                                                                <div style={{ minWidth: 0 }}>
                                                                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isSelected ? '#065F46' : '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {exp.title}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', marginTop: '1px' }}>
                                                                        Total: {activeSplit.currencySymbol || '₹'}{(parseFloat(exp.amount) || 0).toLocaleString()} • {exp.date}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: isSelected ? '#047857' : '#64748B', display: 'block', textTransform: 'uppercase' }}>
                                                                    Member Share
                                                                </span>
                                                                <span style={{ fontSize: '0.88rem', fontWeight: '900', color: isSelected ? '#059669' : '#0F172A' }}>
                                                                    {activeSplit.currencySymbol || '₹'}{exp.memberShare.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
                                                No individual itemized purchases found for {customPayDebt.to}. Settlement will be logged against the general debt.
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                                Settlement Amount ({activeSplit.currencySymbol || '₹'})
                                            </label>
                                            {customPayExpenseId && eligibleExpenses.length > 0 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const exp = eligibleExpenses.find(e => String(e.id) === String(customPayExpenseId));
                                                        if (exp && customPayDebt) {
                                                            const rawShare = parseFloat(exp.memberShare) || customPayDebt.amount;
                                                            const amountToPay = Math.min(rawShare, customPayDebt.amount);
                                                            setCustomPayAmount(String(amountToPay));
                                                        }
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.72rem', fontWeight: '850', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Fill Share Amount
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '850', color: '#94A3B8' }}>
                                                {activeSplit.currencySymbol || '₹'}
                                            </span>
                                            <input 
                                                required
                                                type="number" 
                                                min="0.01" 
                                                max={customPayDebt.amount}
                                                step="any"
                                                placeholder="0.00"
                                                value={customPayAmount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setCustomPayAmount('');
                                                        return;
                                                    }
                                                    const num = parseFloat(val);
                                                    if (customPayDebt && num > customPayDebt.amount) {
                                                        setCustomPayAmount(String(customPayDebt.amount));
                                                    } else {
                                                        setCustomPayAmount(val);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem 0.75rem 2.25rem',
                                                    borderRadius: '14px',
                                                    border: '1.5px solid #E2E8F0',
                                                    outline: 'none',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '800',
                                                    color: '#0F172A',
                                                    boxSizing: 'border-box'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#059669'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            />
                                        </div>
                                        {customPayDebt && Number(customPayAmount) >= customPayDebt.amount && (
                                            <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '700', marginTop: '0.3rem' }}>
                                                Capped at debtor's net outstanding debt ({activeSplit.currencySymbol || '₹'}{customPayDebt.amount.toLocaleString()})
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsCustomPayModalOpen(false);
                                                setCustomPayDebt(null);
                                            }}
                                            style={{ flex: 1, padding: '0.8rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!customPayAmount || Number(customPayAmount) <= 0 || (customPayDebt && Number(customPayAmount) > customPayDebt.amount)}
                                            style={{ 
                                                flex: 1.5, 
                                                padding: '0.8rem', 
                                                borderRadius: '14px', 
                                                border: 'none', 
                                                background: (!customPayAmount || Number(customPayAmount) <= 0 || (customPayDebt && Number(customPayAmount) > customPayDebt.amount)) ? '#94A3B8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                                                color: 'white', 
                                                fontWeight: '850', 
                                                fontSize: '0.85rem', 
                                                cursor: (!customPayAmount || Number(customPayAmount) <= 0 || (customPayDebt && Number(customPayAmount) > customPayDebt.amount)) ? 'not-allowed' : 'pointer',
                                                boxShadow: (!customPayAmount || Number(customPayAmount) <= 0 || (customPayDebt && Number(customPayAmount) > customPayDebt.amount)) ? 'none' : '0 4px 14px rgba(5, 150, 105, 0.25)' 
                                            }}
                                        >
                                            Record Settlement
                                        </button>
                                    </div>
                                </form>
                            </Motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* ──────── MODAL: ATTACHMENT PREVIEW ──────── */}
            <AnimatePresence>
                {previewAttachment && (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(15, 23, 42, 0.75)', 
                            backdropFilter: 'blur(8px)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 1100,
                            padding: '1.25rem'
                        }}
                        onClick={() => setPreviewAttachment(null)}
                    >
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                                background: 'white', 
                                width: '100%', 
                                maxWidth: '840px', 
                                height: '85vh', 
                                borderRadius: '24px', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column' 
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#FAFAFA' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <FileText size={18} style={{ color: '#059669', flexShrink: 0 }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {previewAttachment.name || 'Expense Attachment'}
                                    </h3>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (previewAttachment?.url) {
                                                window.open(previewAttachment.url, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '5px', 
                                            padding: '0.45rem 0.85rem', 
                                            borderRadius: '10px', 
                                            background: '#ECFDF5', 
                                            color: '#065F46', 
                                            textDecoration: 'none', 
                                            fontSize: '0.78rem', 
                                            fontWeight: '850',
                                            border: '1px solid #A7F3D0',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ExternalLink size={13} /> Open in New Tab
                                    </button>
                                    <button 
                                        style={{ 
                                            background: '#F1F5F9', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            padding: '0.45rem', 
                                            cursor: 'pointer', 
                                            color: '#475569',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }} 
                                        onClick={() => setPreviewAttachment(null)}
                                        title="Close preview"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div style={{ flex: 1, padding: '1rem', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {isPdfFile(previewAttachment.url || previewAttachment.name) ? (
                                    <iframe 
                                        src={previewAttachment.url}
                                        title="PDF Preview"
                                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: 'white' }}
                                    />
                                ) : (
                                    <img 
                                        src={previewAttachment.url} 
                                        alt={previewAttachment.name || 'Expense Attachment'} 
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                                    />
                                )}
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default BusinessSplitCollect;
