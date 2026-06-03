import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatorService } from '../../services';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { customConfirm } from '../../utils/customConfirm';
import { 
    Calculator, X, RotateCcw, Delete, Share2, Trash2, 
    Tag, Globe, Plus, Percent, Hash, Check, ArrowUpDown, History
} from "lucide-react";

export function CalcPopover() {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef(null);
    const tapeEndRef = useRef(null);
    const idCounter = useRef(0);

    // Core State for BETA Calc
    const [tape, setTape] = useState([]); // { id, type: 'base' | '+' | '-' | '*' | '/' | 'gst' | 'discount', value, label }
    const [activeInput, setActiveInput] = useState("0");
    const [activeOp, setActiveOp] = useState(null); // The pending operator for the active line
    const [activeLabel, setActiveLabel] = useState("");

    // Smart Bar UI States
    const [showSmartOptions, setShowSmartOptions] = useState(null);
    const [isConverted, setIsConverted] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [showHistory, setShowHistory] = useState(false); // History panel toggle
    const queryClient = useQueryClient();

    // Queries
    const { data: calcHistory = [] } = useQuery({
        queryKey: ['calculator-history'],
        queryFn: calculatorService.getHistory,
        enabled: open
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: calculatorService.saveHistory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calculator-history'] })
    });

    const deleteItemMutation = useMutation({
        mutationFn: calculatorService.deleteHistoryItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calculator-history'] })
    });

    const clearHistoryMutation = useMutation({
        mutationFn: calculatorService.clearHistory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calculator-history'] })
    });

    const [sciMode, setSciMode] = useState(false);

    // Compare Mode state: unified table with description, side A value, and side B value
    const [cmpItems, setCmpItems] = useState([]); // Array of { id, desc, valA, valB }
    const [cmpInputDesc, setCmpInputDesc] = useState("");
    const [cmpInputValA, setCmpInputValA] = useState("");
    const [cmpInputValB, setCmpInputValB] = useState("");
    const cmpIdRef = useRef(0);

    const leftTotal = cmpItems.reduce((sum, item) => sum + (item.valA || 0), 0);
    const rightTotal = cmpItems.reduce((sum, item) => sum + (item.valB || 0), 0);
    const hasCompareData = cmpItems.length > 0;
    const compareDiff = Math.abs(leftTotal - rightTotal);
    const compareWinner = leftTotal > rightTotal ? 'A' : leftTotal < rightTotal ? 'B' : '=';

    const cmpAddItem = () => {
        const desc = cmpInputDesc.trim() || `Item ${cmpItems.length + 1}`;
        const valA = parseFloat(cmpInputValA) || 0;
        const valB = parseFloat(cmpInputValB) || 0;

        setCmpItems(prev => [
            ...prev,
            {
                id: String(cmpIdRef.current++),
                desc,
                valA,
                valB
            }
        ]);

        // Reset inputs
        setCmpInputDesc("");
        setCmpInputValA("");
        setCmpInputValB("");
    };

    const cmpRemoveItem = (id) => {
        setCmpItems(prev => prev.filter(item => item.id !== id));
    };

    const cmpClearAll = () => {
        setCmpItems([]);
        setCmpInputDesc("");
        setCmpInputValA("");
        setCmpInputValB("");
    };

    const cmpHandleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            cmpAddItem();
        }
    };

    // Constants
    const CONVERSION_RATE = 83.5; // 1 USD = 83.5 INR (Simulated placeholder)

    // Recalculate entire tape
    const getTapeCalculations = () => {
        let running = 0;
        const steps = [];

        tape.forEach((step) => {
            const prevRunning = running;
            let computedValue = 0;

            if (step.type === 'base') {
                running = parseFloat(step.value || 0);
                computedValue = running;
            } else if (step.type === '+') {
                computedValue = parseFloat(step.value || 0);
                running += computedValue;
            } else if (step.type === '-') {
                computedValue = parseFloat(step.value || 0);
                running -= computedValue;
            } else if (step.type === '*') {
                computedValue = parseFloat(step.value || 0);
                running *= computedValue;
            } else if (step.type === '/') {
                const val = parseFloat(step.value || 0);
                computedValue = val;
                running = val !== 0 ? running / val : 0;
            } else if (step.type === 'gst') {
                const pct = parseFloat(step.value || 0);
                computedValue = prevRunning * (pct / 100);
                running += computedValue;
            } else if (step.type === 'discount') {
                const pct = parseFloat(step.value || 0);
                computedValue = prevRunning * (pct / 100);
                running -= computedValue;
            }

            steps.push({
                ...step,
                runningBefore: prevRunning,
                runningAfter: running,
                contribution: computedValue
            });
        });

        return { steps, finalTotal: running };
    };

    const { steps, finalTotal } = getTapeCalculations();

    // Handles committing current activeInput and operator to the tape
    const commitActiveToTape = (nextOp = null) => {
        const val = parseFloat(activeInput);
        if (isNaN(val)) return;

        // If tape is empty, this is the Base step
        if (tape.length === 0) {
            setTape([
                {
                    id: String(idCounter.current++),
                    type: 'base',
                    value: val,
                    label: activeLabel || "Base Amount"
                }
            ]);
        } else {
            // Commit current number with existing activeOp (default + if none selected)
            setTape(prev => [
                ...prev,
                {
                    id: String(idCounter.current++),
                    type: activeOp || '+',
                    value: val,
                    label: activeLabel || ""
                }
            ]);
        }

        // Set the next active operator, clear active input
        setActiveOp(nextOp);
        setActiveInput("0");
        setActiveLabel("");
        setShowSmartOptions(null);
    };

    // Keyboard Bindings
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;
            
            // Prevent processing inputs if user is typing in active inputs on the tape
            if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                if (e.key === 'Escape') {
                    document.activeElement.blur();
                }
                return; 
            }

            if (e.key >= '0' && e.key <= '9') {
                handleNumber(e.key);
            } else if (e.key === '.') {
                handleDecimal();
            } else if (e.key === 'Backspace') {
                handleDelete();
            } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
                handleOperator(e.key);
            } else if (e.key === 'Enter' || e.key === '=') {
                handleCalculate();
            } else if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, activeInput, activeOp, tape, activeLabel]);

    // Auto Scroll to Tape Bottom
    useEffect(() => {
        if (tapeEndRef.current) {
            tapeEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [tape, activeInput, activeOp]);

    // Auto Close Popover outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Grid Actions
    function handleNumber(num) {
        setActiveInput(prev => prev === "0" ? String(num) : prev + String(num));
    }

    function handleDecimal() {
        if (!activeInput.includes(".")) {
            setActiveInput(activeInput + ".");
        }
    }

    function handleDelete() {
        if (activeInput.length === 1) {
            setActiveInput("0");
        } else {
            setActiveInput(activeInput.slice(0, -1));
        }
    }

    function handleClearAll() {
        setTape([]);
        setActiveInput("0");
        setActiveOp(null);
        setActiveLabel("");
        setShowSmartOptions(null);
    }

    function handleOperator(op) {
        if (tape.length === 0 && activeInput === "0") {
            // Prevent base operator without base value
            return;
        }
        // Commit current number and set operator for next line
        commitActiveToTape(op);
    }

    function handleCalculate() {
        let finalTapeState = tape;
        
        // If there's an uncommitted value, push it synchronously to simulate what will happen
        const val = parseFloat(activeInput);
        if (!isNaN(val) && activeInput !== "0") {
            const newStep = {
                id: String(idCounter.current++),
                type: tape.length === 0 ? 'base' : (activeOp || '+'),
                value: val,
                label: activeLabel || ""
            };
            finalTapeState = [...tape, newStep];
            
            // Actually commit to real state
            setTape(finalTapeState);
            setActiveInput("0");
            setActiveOp(null);
            setActiveLabel("");
            setShowSmartOptions(null);
        }

        if (finalTapeState.length === 0) return;

        // Compute the static final total for this snapshot log
        let runningTotal = 0;
        finalTapeState.forEach((step) => {
            const v = parseFloat(step.value || 0);
            if (step.type === 'base') {
                runningTotal = v;
            } else if (step.type === '+') {
                runningTotal += v;
            } else if (step.type === '-') {
                runningTotal -= v;
            } else if (step.type === '*') {
                runningTotal *= v;
            } else if (step.type === '/') {
                runningTotal = v !== 0 ? runningTotal / v : 0;
            } else if (step.type === 'gst') {
                runningTotal += runningTotal * (v / 100);
            } else if (step.type === 'discount') {
                runningTotal -= runningTotal * (v / 100);
            }
        });

        // Save to backend history
        saveMutation.mutate({
            tape: finalTapeState,
            total: runningTotal,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
    }

    // Smart Presets logic
    const applySmartPreset = (type, percentage) => {
        // If there is an active input, commit it first to ensure the tape has the right base value
        let currentTape = tape;
        if (parseFloat(activeInput) !== 0 && activeInput !== "0") {
            const val = parseFloat(activeInput);
            const newStep = {
                id: String(idCounter.current++),
                type: currentTape.length === 0 ? 'base' : (activeOp || '+'),
                value: val,
                label: activeLabel || ""
            };
            currentTape = [...currentTape, newStep];
            setTape(currentTape);
            setActiveInput("0");
            setActiveOp(null);
            setActiveLabel("");
        }

        if (currentTape.length === 0) {
            alert("Please enter a base amount first.");
            return;
        }

        // Now apply the GST or Discount
        const smartStep = {
            id: String(idCounter.current++),
            type: type, // 'gst' or 'discount'
            value: percentage,
            label: type === 'gst' ? `${percentage}% GST` : `${percentage}% Disc`
        };

        setTape([...currentTape, smartStep]);
        setShowSmartOptions(null);
    };

    // In-Tape Modification / Edit Handlers
    const updateTapeStepValue = (id, newValue) => {
        setTape(prev => prev.map(s => s.id === id ? { ...s, value: newValue } : s));
    };

    const updateTapeStepLabel = (id, newLabel) => {
        setTape(prev => prev.map(s => s.id === id ? { ...s, label: newLabel } : s));
    };

    const removeTapeStep = (id) => {
        setTape(prev => prev.filter(s => s.id !== id));
    };

    // Export text flow
    const handleShareText = () => {
        const { steps, finalTotal } = getTapeCalculations();
        if (steps.length === 0) return;

        let text = "🧮 BETA Calc \n";
        text += "=============================\n";
        
        steps.forEach((s) => {
            const lbl = s.label ? ` [${s.label}]` : "";
            if (s.type === 'base') {
                text += `Base: ₹${s.value.toLocaleString('en-IN')}${lbl}\n`;
            } else if (s.type === 'gst') {
                text += `(+) ${s.value}% GST: ₹${s.contribution.toLocaleString('en-IN', {maximumFractionDigits: 2})}${lbl}\n`;
            } else if (s.type === 'discount') {
                text += `(-) ${s.value}% Discount: ₹${s.contribution.toLocaleString('en-IN', {maximumFractionDigits: 2})}${lbl}\n`;
            } else {
                text += `${s.type} ${s.value.toLocaleString('en-IN')}${lbl}\n`;
            }
        });
        
        text += "-----------------------------\n";
        text += `TOTAL: ₹${finalTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}\n`;
        if (isConverted) {
            text += `TOTAL (USD): $${(finalTotal / CONVERSION_RATE).toLocaleString('en-US', {maximumFractionDigits: 2})}\n`;
        }
        text += "=============================\n";

        navigator.clipboard.writeText(text);
        alert("Process summary copied to clipboard successfully!");
    };

    // Styles configuration
    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
        },
        triggerButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '11px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        },
        popover: {
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 12px)',
            zIndex: 2000,
            width: 'calc(100vw - 24px)',
            maxWidth: '360px',
            maxHeight: 'min(580px, 80vh)',
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif"
        },
        header: {
            padding: '10px 16px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FAFBFC',
            flexShrink: 0
        },
        title: {
            fontSize: '14px',
            fontWeight: '800',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        tapeArea: {
            flex: 1,
            maxHeight: '140px',
            minHeight: '70px',
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: '#FAFAFB',
            borderBottom: '1px solid #EDF2F7',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        tapeRow: {
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '8px 12px',
            position: 'relative',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
        },
        activeLine: {
            padding: '8px 16px',
            background: 'linear-gradient(to right, #F8FAFC, #F1F5F9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '52px',
            borderBottom: '1px solid #E2E8F0',
            flexShrink: 0
        },
        smartBar: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
            gap: '8px'
        },
        smartBtn: {
            flex: 1,
            padding: '5px 0',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '5px',
            padding: '12px',
            background: '#FFFFFF',
            flexShrink: 0
        },
        keyBtn: {
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
        }
    };

    return (
        <div style={styles.container} ref={popoverRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    ...styles.triggerButton,
                    backgroundColor: open ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
                }}
                title="BETA Calc"
            >
                <Calculator size={18} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={styles.popover}
                    >
                        {/* Header Section */}
                        <div style={styles.header}>
                            <div style={styles.title}>
                                <Hash size={16} color="#10B981" />
                                <span>BETA CALC</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                    onClick={() => { setShowHistory(h => !h); }}
                                    title="Calculation History"
                                    style={{ background: showHistory ? '#EEF2FF' : '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: showHistory ? '#6366F1' : '#475569', transition: 'all 0.2s' }}
                                >
                                    <History size={15} />
                                </button>
                                <button 
                                    onClick={handleShareText} 
                                    title="Copy process summary"
                                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569' }}
                                >
                                    <Share2 size={15} />
                                </button>
                                <button 
                                    onClick={handleClearAll} 
                                    title="Clear Entire Tape"
                                    style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#EF4444' }}
                                >
                                    <Trash2 size={15} />
                                </button>
                                <button 
                                    onClick={() => setOpen(false)} 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '6px' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Middle Scrollable Section */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">

                        {/* Requirement 1 & 2: Toggle between Archive History Log or Live Interactive Tape */}
                        {showHistory ? (
                            <div style={{
                                flex: 1,
                                maxHeight: '180px',
                                minHeight: '100px',
                                overflowY: 'auto',
                                padding: '12px',
                                backgroundColor: '#F8FAFC',
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }} className="custom-scrollbar">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tape Archives</span>
                                    {calcHistory.length > 0 && (
                                        <button 
                                            onClick={async () => { if(await customConfirm("Clear calculation history?")) clearHistoryMutation.mutate(); }} 
                                            style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '9px', fontWeight: '900', cursor: 'pointer', padding: 0 }}
                                        >
                                            CLEAR ALL
                                        </button>
                                    )}
                                </div>
                                
                                {calcHistory.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94A3B8', padding: '12px 10px', textAlign: 'center' }}>
                                        <History size={20} style={{ opacity: 0.4, marginBottom: '6px' }} />
                                        <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748B' }}>No archives available</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#94A3B8', fontWeight: '500', lineHeight: 1.2 }}>Type numbers and press '=' to save.</p>
                                    </div>
                                ) : (
                                    calcHistory.map((hist) => (
                                        <div key={hist.id} style={{
                                            background: 'white',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '14px',
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                            transition: 'transform 0.1s ease'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748B' }}>⏰ {hist.timestamp}</span>
                                                <span style={{ fontSize: '9px', fontWeight: '900', background: '#EFF6FF', color: '#3B82F6', padding: '2px 6px', borderRadius: '5px' }}>
                                                    {hist.tape.length} Item{hist.tape.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2px' }}>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '8px', fontWeight: '850', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Calculated Log</span>
                                                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>
                                                        ₹{hist.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button 
                                                        onClick={() => {
                                                            setTape(hist.tape);
                                                            setActiveInput("0");
                                                            setActiveOp(null);
                                                            setShowHistory(false);
                                                        }}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                                                            border: 'none', 
                                                            borderRadius: '8px', 
                                                            color: 'white', 
                                                            fontSize: '9px', 
                                                            fontWeight: '900', 
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 4px rgba(16,185,129,0.15)'
                                                        }}
                                                    >
                                                        RESTORE
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            deleteItemMutation.mutate(hist.id);
                                                        }}
                                                        style={{ 
                                                            width: '26px',
                                                            height: '26px',
                                                            background: '#FEF2F2', 
                                                            border: '1px solid #FECACA', 
                                                            borderRadius: '8px', 
                                                            color: '#EF4444', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Requirement 1: The Live Tape History list */}
                                <div style={styles.tapeArea} className="custom-scrollbar">
                                    {steps.length === 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94A3B8', padding: '12px 10px' }}>
                                            <RotateCcw size={20} style={{ opacity: 0.5, marginBottom: '6px' }} />
                                            <span style={{ fontSize: '11px', fontWeight: '600' }}>Start typing to record Tape</span>
                                        </div>
                                    ) : (
                                        steps.map((step) => (
                                            <div key={step.id} className="tape-group" style={styles.tapeRow}>
                                                {/* Row Meta & Delete */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {/* Op Tag */}
                                                        <span style={{
                                                            fontSize: '9px',
                                                            fontWeight: '900',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            color: 'white',
                                                            background: step.type === 'base' ? '#6366F1' : 
                                                                        step.type === 'gst' ? '#10B981' : 
                                                                        step.type === 'discount' ? '#F59E0B' : '#64748B'
                                                        }}>
                                                            {step.type.toUpperCase()}
                                                        </span>
                                                        {/* Label Editor */}
                                                        <input 
                                                            type="text"
                                                            value={step.label}
                                                            placeholder="Add label..."
                                                            onChange={(e) => updateTapeStepLabel(step.id, e.target.value)}
                                                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '10px', fontWeight: '600', color: '#64748B', width: '90px' }}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => removeTapeStep(step.id)}
                                                        style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', opacity: 0.6, color: '#EF4444' }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>

                                                {/* Requirement 3: Live Click-to-Edit input */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>
                                                            {step.type === 'gst' || step.type === 'discount' ? '%' : step.type === 'base' ? '=' : step.type}
                                                        </span>
                                                        <input 
                                                            type="number"
                                                            value={step.value}
                                                            onChange={(e) => updateTapeStepValue(step.id, parseFloat(e.target.value) || 0)}
                                                            style={{
                                                                border: '1px solid transparent',
                                                                background: 'transparent',
                                                                outline: 'none',
                                                                fontSize: '16px',
                                                                fontWeight: '850',
                                                                color: '#0F172A',
                                                                width: '80px',
                                                                borderRadius: '4px',
                                                                padding: '2px 4px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onFocus={(e) => e.target.style.borderColor = '#cbd5e1'}
                                                            onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                                        />
                                                    </div>
                                                    
                                                    {/* Numerical evaluation after this step */}
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: '750', color: '#10B981' }}>
                                                            ₹{step.runningAfter.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                        </span>
                                                        {/* Subtext context (Tax or discount values) */}
                                                        {(step.type === 'gst' || step.type === 'discount') && (
                                                            <div style={{ fontSize: '9px', fontWeight: '700', color: step.type === 'gst' ? '#10B981' : '#D97706', marginTop: '1px' }}>
                                                                {step.type === 'gst' ? '+' : '-'}₹{step.contribution.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={tapeEndRef} />
                                </div>

                                {/* Middle Section: The Active Line (typing zone) */}
                                <div style={styles.activeLine}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {activeOp ? `Next Op: ${activeOp}` : tape.length === 0 ? 'Set Base' : 'Continue'}
                                            {activeLabel && <span style={{ background: '#E2E8F0', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', color: '#475569' }}>🏷️ {activeLabel}</span>}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>{activeOp || (tape.length === 0 ? "" : "+")}</span>
                                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                                            {activeInput}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Requirement 2: Smart Bar with GST, Discount & Labels */}
                        <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', flexShrink: 0 }}>
                            <div style={styles.smartBar}>
                                <button 
                                    onClick={() => setShowSmartOptions(showSmartOptions === 'gst' ? null : 'gst')}
                                    style={{ 
                                        ...styles.smartBtn, 
                                        background: showSmartOptions === 'gst' ? '#ECFDF5' : '#FFFFFF',
                                        color: '#10B981',
                                        borderColor: showSmartOptions === 'gst' ? '#10B981' : '#E2E8F0'
                                    }}
                                >
                                    <Percent size={13} /> GST
                                </button>
                                <button 
                                    onClick={() => setShowSmartOptions(showSmartOptions === 'discount' ? null : 'discount')}
                                    style={{ 
                                        ...styles.smartBtn, 
                                        background: showSmartOptions === 'discount' ? '#FFFBEB' : '#FFFFFF',
                                        color: '#F59E0B',
                                        borderColor: showSmartOptions === 'discount' ? '#F59E0B' : '#E2E8F0'
                                    }}
                                >
                                    <Tag size={13} /> Discount
                                </button>
                                <button 
                                    onClick={() => setIsConverted(!isConverted)}
                                    style={{ 
                                        ...styles.smartBtn, 
                                        background: isConverted ? '#F8FAFC' : '#FFFFFF',
                                        color: isConverted ? '#64748B' : '#475569',
                                        borderColor: isConverted ? '#94A3B8' : '#E2E8F0'
                                    }}
                                >
                                    <Globe size={13} /> {isConverted ? 'USD' : 'INR'}
                                </button>
                                <button 
                                    onClick={() => { setCompareMode(!compareMode); setSciMode(false); }}
                                    style={{ 
                                        ...styles.smartBtn, 
                                        background: compareMode ? '#EFF6FF' : '#FFFFFF',
                                        color: compareMode ? '#3B82F6' : '#475569',
                                        borderColor: compareMode ? '#3B82F6' : '#E2E8F0'
                                    }}
                                >
                                    <ArrowUpDown size={13} /> Compare
                                </button>
                            </div>

                            {/* Sub-menu row for smart options */}
                            <AnimatePresence>
                                {showSmartOptions && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ background: '#F8FAFC', padding: '8px 16px', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}
                                    >
                                        {showSmartOptions === 'gst' && (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[5, 12, 18, 28].map(rate => (
                                                    <button key={rate} onClick={() => applySmartPreset('gst', rate)} style={{ flex: 1, border: '1px solid #D1FAE5', background: 'white', padding: '6px 0', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: '#10B981', cursor: 'pointer' }}>
                                                        +{rate}%
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showSmartOptions === 'discount' && (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[5, 10, 20, 50].map(rate => (
                                                    <button key={rate} onClick={() => applySmartPreset('discount', rate)} style={{ flex: 1, border: '1px solid #FEF3C7', background: 'white', padding: '6px 0', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: '#F59E0B', cursor: 'pointer' }}>
                                                        -{rate}%
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Compare Panel */}
                            <AnimatePresence>
                                {compareMode && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #F0F4FF 100%)', padding: '10px 10px 8px 10px', borderBottom: '1px solid #E0E7FF', overflow: 'hidden' }}
                                    >
                                        {/* Panel header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.8px' }}>⚖️ Price Comparison</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {hasCompareData && (
                                                    <button onClick={cmpClearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '9px', color: '#EF4444', fontWeight: '800', padding: '2px 4px', textTransform: 'uppercase' }}>CLEAR ALL</button>
                                                )}
                                                {hasCompareData && (
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '20px',
                                                        background: compareWinner === '=' ? '#F1F5F9' : (compareWinner === 'A' ? 'linear-gradient(90deg,#ECFDF5,#D1FAE5)' : 'linear-gradient(90deg,#FEF2F2,#FEE2E2)'),
                                                        color: compareWinner === '=' ? '#64748B' : (compareWinner === 'A' ? '#059669' : '#DC2626'),
                                                        border: `1px solid ${compareWinner === '=' ? '#E2E8F0' : (compareWinner === 'A' ? '#A7F3D0' : '#FECACA')}`
                                                    }}>
                                                        {compareWinner === '=' ? 'Tied ⚖️' : compareWinner === 'A' ? 'A Wins ▲' : 'B Wins ▲'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comparison Table */}
                                        <div style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            {/* Table Header */}
                                            <div style={{ display: 'flex', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', fontWeight: '800', color: '#64748B' }}>
                                                <div style={{ flex: 1.8, minWidth: 0, textAlign: 'left' }}>Description</div>
                                                <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', color: '#3B82F6' }}>Side A</div>
                                                <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', color: '#8B5CF6' }}>Side B</div>
                                                <div style={{ width: '24px', flexShrink: 0 }}></div>
                                            </div>

                                            {/* Table Rows */}
                                            <div style={{ maxHeight: '110px', overflowY: 'auto', padding: '2px 0' }} className="custom-scrollbar">
                                                {cmpItems.length === 0 ? (
                                                    <div style={{ fontSize: '10px', color: '#CBD5E1', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                                                        No comparison items yet.<br/>Add description and values below.
                                                    </div>
                                                ) : cmpItems.map((item) => (
                                                    <div key={item.id} style={{ display: 'flex', padding: '5px 8px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', fontSize: '11px', fontWeight: '600', color: '#334155' }}>
                                                        <div style={{ flex: 1.8, minWidth: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '4px' }}>{item.desc}</div>
                                                        <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', fontFamily: 'monospace', color: '#3B82F6', fontWeight: '700' }}>₹{item.valA.toLocaleString('en-IN')}</div>
                                                        <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', fontFamily: 'monospace', color: '#8B5CF6', fontWeight: '700' }}>₹{item.valB.toLocaleString('en-IN')}</div>
                                                        <div style={{ width: '24px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                                            <button onClick={() => cmpRemoveItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: '12px', fontWeight: '800', padding: 0 }}
                                                                onMouseOver={ev => ev.currentTarget.style.color = '#EF4444'}
                                                                onMouseOut={ev => ev.currentTarget.style.color = '#CBD5E1'}
                                                            >×</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Totals Row */}
                                            {cmpItems.length > 0 && (
                                                <div style={{ display: 'flex', background: '#FAFAFE', borderTop: '1px dashed #E2E8F0', padding: '6px 8px', fontSize: '11px', fontWeight: '800', color: '#1E293B', alignItems: 'center' }}>
                                                    <div style={{ flex: 1.8, minWidth: 0, textAlign: 'left', color: '#64748B', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total</div>
                                                    <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', fontFamily: 'monospace', color: '#3B82F6', fontWeight: '900' }}>₹{leftTotal.toLocaleString('en-IN')}</div>
                                                    <div style={{ flex: 1.1, minWidth: 0, textAlign: 'right', fontFamily: 'monospace', color: '#8B5CF6', fontWeight: '900' }}>₹{rightTotal.toLocaleString('en-IN')}</div>
                                                    <div style={{ width: '24px', flexShrink: 0 }}></div>
                                                </div>
                                            )}

                                            {/* Input row */}
                                            <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={cmpInputDesc}
                                                    onChange={(ev) => setCmpInputDesc(ev.target.value)}
                                                    onKeyDown={cmpHandleKeyDown}
                                                    style={{ flex: 1.8, minWidth: 0, padding: '4px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: '600', color: '#0F172A', outline: 'none', background: 'white' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Val A"
                                                    value={cmpInputValA}
                                                    onChange={(ev) => setCmpInputValA(ev.target.value)}
                                                    onKeyDown={cmpHandleKeyDown}
                                                    style={{ flex: 1.1, minWidth: 0, padding: '4px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: '600', color: '#0F172A', outline: 'none', background: 'white', textAlign: 'right' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Val B"
                                                    value={cmpInputValB}
                                                    onChange={(ev) => setCmpInputValB(ev.target.value)}
                                                    onKeyDown={cmpHandleKeyDown}
                                                    style={{ flex: 1.1, minWidth: 0, padding: '4px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: '600', color: '#0F172A', outline: 'none', background: 'white', textAlign: 'right' }}
                                                />
                                                <button
                                                    onClick={cmpAddItem}
                                                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white', border: 'none', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(99,102,241,0.3)', flexShrink: 0 }}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* Summary pills */}
                                        {hasCompareData && (
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                                <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '4px 8px', fontSize: '9px', fontWeight: '700', color: '#475569', border: '1px solid #E0E7FF', textAlign: 'center', boxShadow: '0 1px 3px rgba(99,102,241,0.06)' }}>
                                                    Diff&nbsp;<span style={{ color: '#6366F1', fontWeight: '900' }}>₹{compareDiff.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '4px 8px', fontSize: '9px', fontWeight: '700', color: '#475569', border: '1px solid #E0E7FF', textAlign: 'center', boxShadow: '0 1px 3px rgba(99,102,241,0.06)' }}>
                                                    Ratio&nbsp;<span style={{ color: '#6366F1', fontWeight: '900' }}>{rightTotal ? (leftTotal / rightTotal).toFixed(2) : '-'}x</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        </div> {/* end of Middle Scrollable Section */}

                        {/* Scientific Mode Buttons */}
                        {sciMode && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', padding: '8px 16px 0 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                                {[
                                    { label: 'sin', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.sin(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'cos', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.cos(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'tan', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.tan(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'log', fn: () => { const v = parseFloat(activeInput); setActiveInput(v > 0 ? String(Math.round(Math.log10(v) * 1e10) / 1e10) : 'Err'); }},

                                    { label: 'asin', fn: () => { const v = parseFloat(activeInput); setActiveInput(v >= -1 && v <= 1 ? String(Math.round(Math.asin(v) * 180 / Math.PI * 1e8) / 1e8) : 'Err'); }},
                                    { label: 'acos', fn: () => { const v = parseFloat(activeInput); setActiveInput(v >= -1 && v <= 1 ? String(Math.round(Math.acos(v) * 180 / Math.PI * 1e8) / 1e8) : 'Err'); }},
                                    { label: 'atan', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.atan(v) * 180 / Math.PI * 1e8) / 1e8)); }},
                                    { label: 'ln', fn: () => { const v = parseFloat(activeInput); setActiveInput(v > 0 ? String(Math.round(Math.log(v) * 1e10) / 1e10) : 'Err'); }},

                                    { label: '√', fn: () => { const v = parseFloat(activeInput); setActiveInput(v >= 0 ? String(Math.round(Math.sqrt(v) * 1e10) / 1e10) : 'Err'); }},
                                    { label: 'x²', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(v * v)); }},
                                    { label: 'x³', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(v * v * v)); }},
                                    { label: '10ˣ', fn: () => { const v = parseFloat(activeInput); setActiveInput(Math.abs(v) < 100 ? String(Math.pow(10, v)) : 'Too Big'); }},

                                    { label: 'π', fn: () => setActiveInput(String(Math.PI.toFixed(8))) },
                                    { label: 'e', fn: () => setActiveInput(String(Math.E.toFixed(8))) },
                                    { label: '|x|', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.abs(v))); }},
                                    { label: '1/x', fn: () => { const v = parseFloat(activeInput); setActiveInput(v ? String(Math.round((1/v) * 1e10) / 1e10) : '0'); }},
                                ].map(({ label, fn }) => (
                                    <button key={label} onClick={fn} style={{ ...styles.keyBtn, height: '30px', backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '11px', fontWeight: '850', borderRadius: '6px', border: '1px solid #E0E7FF', transition: 'background-color 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#E0E7FF'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#EEF2FF'}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Standard Keypad */}
                        <div style={styles.grid}>
                            <button onClick={handleClearAll} style={{ ...styles.keyBtn, backgroundColor: '#FEF2F2', color: '#EF4444' }}><RotateCcw size={16} /></button>
                            <button onClick={handleDelete} style={{ ...styles.keyBtn, backgroundColor: '#F1F5F9', color: '#475569' }}><Delete size={16} /></button>
                            <button onClick={() => handleOperator('/')} style={{ ...styles.keyBtn, backgroundColor: '#ECFDF5', color: '#10B981' }}>/</button>
                            <button onClick={() => handleOperator('*')} style={{ ...styles.keyBtn, backgroundColor: '#ECFDF5', color: '#10B981' }}>x</button>

                            {[7, 8, 9].map(n => (
                                <button key={n} onClick={() => handleNumber(n)} style={{ ...styles.keyBtn, backgroundColor: '#F8FAFC', color: '#334155' }}>{n}</button>
                            ))}
                            <button onClick={() => handleOperator('-')} style={{ ...styles.keyBtn, backgroundColor: '#ECFDF5', color: '#10B981' }}>-</button>

                            {[4, 5, 6].map(n => (
                                <button key={n} onClick={() => handleNumber(n)} style={{ ...styles.keyBtn, backgroundColor: '#F8FAFC', color: '#334155' }}>{n}</button>
                            ))}
                            <button onClick={() => handleOperator('+')} style={{ ...styles.keyBtn, backgroundColor: '#ECFDF5', color: '#10B981' }}>+</button>

                            {[1, 2, 3].map(n => (
                                <button key={n} onClick={() => handleNumber(n)} style={{ ...styles.keyBtn, backgroundColor: '#F8FAFC', color: '#334155' }}>{n}</button>
                            ))}
                            {/* Equal commits typing to the tape */}
                            <button onClick={handleCalculate} style={{ ...styles.keyBtn, gridRow: 'span 2', height: 'auto', backgroundColor: '#10B981', color: 'white' }}>
                                =
                            </button>

                            {/* SCI button left of 0 */}
                            <button
                                onClick={() => { setSciMode(!sciMode); setCompareMode(false); }}
                                style={{ ...styles.keyBtn, backgroundColor: sciMode ? '#EEF2FF' : '#F1F5F9', color: sciMode ? '#4F46E5' : '#334155', fontSize: '12px', fontWeight: '800' }}
                            >
                                SCI
                            </button>
                            <button onClick={() => handleNumber(0)} style={{ ...styles.keyBtn, backgroundColor: '#F8FAFC', color: '#334155' }}>0</button>
                            <button onClick={handleDecimal} style={{ ...styles.keyBtn, backgroundColor: '#F8FAFC', color: '#334155' }}>.</button>
                        </div>

                        {/* Final Total Display */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                            padding: '10px 16px',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <div>
                                <span style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {isConverted ? 'Total (Simulated USD)' : 'Tape Running Total'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#10B981', margin: 0 }}>
                                        {isConverted ? '$' : '₹'}{
                                            (isConverted ? (finalTotal / CONVERSION_RATE) : finalTotal)
                                            .toLocaleString(isConverted ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        }
                                    </h2>
                                </div>
                            </div>
                            {isConverted && (
                                <div style={{ textAlign: 'right', opacity: 0.8 }}>
                                    <span style={{ fontSize: '9px', fontWeight: '700', color: '#94A3B8' }}>Base Value</span>
                                    <div style={{ fontSize: '11px', fontWeight: '800' }}>₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

