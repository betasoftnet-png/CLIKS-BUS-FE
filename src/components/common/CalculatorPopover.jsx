import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calculator, X, RotateCcw, Delete, Share2, Trash2, 
    Tag, Globe, Plus, Percent, Hash, Check, ArrowUpDown
} from "lucide-react";

export function CalculatorPopover() {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef(null);
    const tapeEndRef = useRef(null);
    const idCounter = useRef(0);

    // Core State for BETA Calculator
    const [tape, setTape] = useState([]); // { id, type: 'base' | '+' | '-' | '*' | '/' | 'gst' | 'discount', value, label }
    const [activeInput, setActiveInput] = useState("0");
    const [activeOp, setActiveOp] = useState(null); // The pending operator for the active line
    const [activeLabel, setActiveLabel] = useState("");

    // Smart Bar UI States
    const [showSmartOptions, setShowSmartOptions] = useState(null); // 'gst' | 'discount' | 'label' | null
    const [isConverted, setIsConverted] = useState(false); // INR to USD Toggle
    const [compareMode, setCompareMode] = useState(false); // Side-by-side Compare Mode
    const [sciMode, setSciMode] = useState(false); // Scientific Calculator Mode

    // Compare Mode dual-tape state
    const [cmpLeft, setCmpLeft] = useState({ entries: [], input: '' });  // { entries: [{id, val}], input: string }
    const [cmpRight, setCmpRight] = useState({ entries: [], input: '' });
    const cmpIdRef = useRef(0);

    // Helpers for compare tape
    const cmpTotal = (entries) => entries.reduce((s, e) => s + e.val, 0);

    const cmpAddEntry = (side) => {
        const setter = side === 'L' ? setCmpLeft : setCmpRight;
        setter(prev => {
            const val = parseFloat(prev.input);
            if (isNaN(val)) return prev;
            return { entries: [...prev.entries, { id: cmpIdRef.current++, val }], input: '' };
        });
    };

    const cmpRemoveEntry = (side, id) => {
        const setter = side === 'L' ? setCmpLeft : setCmpRight;
        setter(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
    };

    const cmpClear = (side) => {
        const setter = side === 'L' ? setCmpLeft : setCmpRight;
        setter({ entries: [], input: '' });
    };

    const cmpHandleKeyDown = (e, side) => {
        if (e.key === 'Enter' || e.key === '+') {
            e.preventDefault();
            cmpAddEntry(side);
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
        // Pressing equals commits the final typed number
        if (parseFloat(activeInput) !== 0 || activeInput !== "0") {
            commitActiveToTape(null);
        }
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

        let text = "🧮 BETA Calculator \n";
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
            width: '360px',
            maxHeight: '750px',
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
            padding: '16px 20px',
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
            maxHeight: '220px',
            minHeight: '140px',
            overflowY: 'auto',
            padding: '16px',
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
            padding: '14px 20px',
            background: 'linear-gradient(to right, #F8FAFC, #F1F5F9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '70px',
            borderBottom: '1px solid #E2E8F0',
            flexShrink: 0
        },
        smartBar: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
            gap: '8px'
        },
        smartBtn: {
            flex: 1,
            padding: '8px 0',
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
            gap: '8px',
            padding: '16px',
            background: '#FFFFFF',
            flexShrink: 0
        },
        keyBtn: {
            height: '48px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
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
                title="BETA Calculator"
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
                                <span>BETA CALCULATOR</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
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

                        {/* Requirement 1: The Live Tape History list */}
                        <div style={styles.tapeArea} className="custom-scrollbar">
                            {steps.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94A3B8', padding: '20px' }}>
                                    <RotateCcw size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Start typing below to record Tape</span>
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
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569' }}>{activeOp || (tape.length === 0 ? "" : "+")}</span>
                                <span style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                                    {activeInput}
                                </span>
                            </div>
                        </div>

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
                                {compareMode && (() => {
                                    const leftTotal = cmpTotal(cmpLeft.entries);
                                    const rightTotal = cmpTotal(cmpRight.entries);
                                    const hasData = cmpLeft.entries.length > 0 || cmpRight.entries.length > 0;
                                    const diff = Math.abs(leftTotal - rightTotal);
                                    const winner = leftTotal > rightTotal ? 'A' : leftTotal < rightTotal ? 'B' : '=';

                                    // Shared mini tape column renderer
                                    const TapeCol = ({ side, state, setState }) => (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '900', color: side === 'L' ? '#2563EB' : '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                                                Side {side === 'L' ? 'A' : 'B'}
                                            </div>

                                            {/* Entries tape */}
                                            <div style={{ minHeight: '60px', maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {state.entries.length === 0 ? (
                                                    <div style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', padding: '4px 0' }}>e.g. 8 + 3 + 9</div>
                                                ) : state.entries.map((e, idx) => (
                                                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '5px', padding: '3px 6px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>{idx === 0 ? '' : '+'} {e.val.toLocaleString('en-IN')}</span>
                                                        <button onClick={() => cmpRemoveEntry(side, e.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', padding: '0', lineHeight: 1, fontSize: '12px', fontWeight: '900' }}>×</button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Divider + total */}
                                            {state.entries.length > 0 && (
                                                <div style={{ borderTop: '1.5px dashed ' + (side === 'L' ? '#BFDBFE' : '#DDD6FE'), paddingTop: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: side === 'L' ? '#1D4ED8' : '#7C3AED' }}>Total</span>
                                                    <span style={{ fontSize: '13px', fontWeight: '900', color: side === 'L' ? '#1D4ED8' : '#7C3AED' }}>₹{cmpTotal(state.entries).toLocaleString('en-IN')}</span>
                                                </div>
                                            )}

                                            {/* Input + Add */}
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={state.input}
                                                    onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                                                    onKeyDown={(e) => cmpHandleKeyDown(e, side)}
                                                    style={{ flex: 1, padding: '5px 8px', borderRadius: '7px', border: '1px solid ' + (side === 'L' ? '#BFDBFE' : '#DDD6FE'), fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none', background: 'white' }}
                                                />
                                                <button
                                                    onClick={() => cmpAddEntry(side)}
                                                    style={{ background: side === 'L' ? '#2563EB' : '#7C3AED', color: 'white', border: 'none', borderRadius: '7px', padding: '0 10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
                                                >+</button>
                                            </div>
                                            <button onClick={() => cmpClear(side)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '9px', color: '#94A3B8', fontWeight: '700', textAlign: 'left', padding: 0 }}>Clear</button>
                                        </div>
                                    );

                                    return (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ background: '#F0F9FF', padding: '12px 14px 10px 14px', borderBottom: '1px solid #BFDBFE', overflow: 'hidden' }}
                                        >
                                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#2563EB', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>⚖️ Side-by-Side Compare</div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <TapeCol side="L" state={cmpLeft} setState={setCmpLeft} />

                                                {/* VS Divider */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', flexShrink: 0, paddingTop: '22px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748B' }}>VS</span>
                                                    {hasData && (
                                                        <span style={{
                                                            fontSize: '12px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px',
                                                            background: winner === '=' ? '#F1F5F9' : (winner === 'A' ? '#ECFDF5' : '#FEF2F2'),
                                                            color: winner === '=' ? '#64748B' : (winner === 'A' ? '#059669' : '#DC2626')
                                                        }}>
                                                            {winner === '=' ? '=' : winner === 'A' ? 'A▲' : 'B▲'}
                                                        </span>
                                                    )}
                                                </div>

                                                <TapeCol side="R" state={cmpRight} setState={setCmpRight} />
                                            </div>

                                            {/* Summary bar */}
                                            {hasData && (
                                                <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                                                    <div style={{ flex: 1, background: 'white', borderRadius: '6px', padding: '5px 8px', fontSize: '10px', fontWeight: '700', color: '#475569', border: '1px solid #BFDBFE', textAlign: 'center' }}>
                                                        Diff&nbsp;<span style={{ color: '#3B82F6', fontWeight: '900' }}>₹{diff.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div style={{ flex: 1, background: 'white', borderRadius: '6px', padding: '5px 8px', fontSize: '10px', fontWeight: '700', color: '#475569', border: '1px solid #BFDBFE', textAlign: 'center' }}>
                                                        Ratio&nbsp;<span style={{ color: '#3B82F6', fontWeight: '900' }}>{rightTotal ? (leftTotal / rightTotal).toFixed(2) : '-'}x</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </div>

                        {/* Scientific Mode Buttons */}
                        {sciMode && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', padding: '8px 16px 0 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                                {[
                                    { label: 'sin', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.sin(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'cos', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.cos(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'tan', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.tan(v * Math.PI / 180) * 1e10) / 1e10)); }},
                                    { label: 'log', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.log10(v) * 1e10) / 1e10)); }},
                                    { label: '√', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(Math.round(Math.sqrt(v) * 1e10) / 1e10)); }},
                                    { label: 'x²', fn: () => { const v = parseFloat(activeInput); setActiveInput(String(v * v)); }},
                                    { label: 'π', fn: () => setActiveInput(String(Math.PI.toFixed(8))) },
                                    { label: '1/x', fn: () => { const v = parseFloat(activeInput); setActiveInput(v ? String(Math.round((1/v) * 1e10) / 1e10) : '0'); }},
                                ].map(({ label, fn }) => (
                                    <button key={label} onClick={fn} style={{ ...styles.keyBtn, height: '36px', backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: '800', borderRadius: '8px' }}>
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
                            padding: '16px 20px',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <div>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {isConverted ? 'Total (Simulated USD)' : 'Tape Running Total'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', color: '#10B981', margin: 0 }}>
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
                                    <div style={{ fontSize: '12px', fontWeight: '800' }}>₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
