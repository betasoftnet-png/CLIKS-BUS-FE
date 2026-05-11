import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, RotateCcw, Delete } from "lucide-react";

export function CalculatorPopover() {
    const [open, setOpen] = useState(false);
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");
    const popoverRef = useRef(null);

    // Close on click outside
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

    const handleNumber = (num) => {
        setDisplay(prev => (prev === "0" ? String(num) : prev + num));
    };

    const handleOperator = (op) => {
        setEquation(display + " " + op + " ");
        setDisplay("0");
    };

    const handleClear = () => {
        setDisplay("0");
        setEquation("");
    };

    const handleDelete = () => {
        if (display.length === 1) {
            setDisplay("0");
        } else {
            setDisplay(display.slice(0, -1));
        }
    };

    const handleDecimal = () => {
        if (!display.includes(".")) {
            setDisplay(display + ".");
        }
    };

    const handleCalculate = () => {
        if (!equation) return;
        try {
            const fullExp = equation + display;
            const sanitized = fullExp.replace(/[^-()\d/*+. ]/g, '');
            const result = Function('"use strict";return (' + sanitized + ')')();
            setEquation(fullExp + " =");
            setDisplay(String(result));
        } catch (e) {
            setDisplay("Error");
        }
    };

    const handleGST = (rate, mode) => {
        const current = parseFloat(display);
        if (isNaN(current) || current === 0) return;
        let result;
        if (mode === 'add') {
            result = current * (1 + rate / 100);
            setEquation(`${current} + ${rate}% GST`);
        } else {
            result = current / (1 + rate / 100);
            setEquation(`${current} w/o ${rate}% GST`);
        }
        setDisplay(String(Number(result.toFixed(2))));
    };

    const handleDiscount = (rate) => {
        const current = parseFloat(display);
        if (isNaN(current) || current === 0) return;
        const result = current * (1 - rate / 100);
        setEquation(`${current} - ${rate}% Disc`);
        setDisplay(String(Number(result.toFixed(2))));
    };

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
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
        },
        popover: {
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            zIndex: 1000,
            width: '320px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            padding: '16px',
        },
        displayArea: {
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'right',
            marginBottom: '12px',
            border: '1px solid #e2e8f0',
        },
        eqText: {
            fontSize: '12px',
            color: '#64748b',
            minHeight: '18px',
            wordBreak: 'break-all',
            marginBottom: '4px',
        },
        resultText: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        bizSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '14px',
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
        },
        bizRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        bizLabel: {
            fontSize: '10px',
            fontWeight: '800',
            color: '#475569',
            textTransform: 'uppercase',
            width: '35px',
            letterSpacing: '0.02em',
        },
        bizBtn: {
            flex: 1,
            padding: '4px 0',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: 'white',
            fontSize: '11px',
            fontWeight: '700',
            color: '#1e293b',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
        },
        btn: {
            height: '44px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
        },
        numBtn: {
            backgroundColor: '#f1f5f9',
            color: '#334155',
        },
        opBtn: {
            backgroundColor: '#eff6ff',
            color: '#2563eb',
        },
        actionBtn: {
            backgroundColor: '#fef2f2',
            color: '#ef4444',
        },
        eqBtn: {
            backgroundColor: '#135029',
            color: '#ffffff',
            gridColumn: 'span 2',
        }
    };

    const renderButton = (label, action, styleType) => {
        let style = { ...styles.btn };
        if (styleType === 'num') style = { ...style, ...styles.numBtn };
        else if (styleType === 'op') style = { ...style, ...styles.opBtn };
        else if (styleType === 'action') style = { ...style, ...styles.actionBtn };
        else if (styleType === 'eq') style = { ...style, ...styles.eqBtn };

        return (
            <button
                type="button"
                onClick={action}
                style={style}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                {label}
            </button>
        );
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
                onMouseEnter={(e) => {if(!open) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}}
                onMouseLeave={(e) => {if(!open) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}}
                title="Calculator"
            >
                <Calculator size={18} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={styles.popover}
                    >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                            <span style={{fontWeight: '700', fontSize: '14px', color: '#334155'}}>Quick Calc</span>
                            <button onClick={() => setOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}><X size={16} /></button>
                        </div>

                        <div style={styles.displayArea}>
                            <div style={styles.eqText}>{equation}</div>
                            <div style={styles.resultText}>{display}</div>
                        </div>

                        {/* Business Calc Extensions */}
                        <div style={styles.bizSection}>
                            <div style={styles.bizRow}>
                                <div style={styles.bizLabel}>+ GST</div>
                                {[5, 12, 18, 28].map(rate => (
                                    <button key={rate} onClick={() => handleGST(rate, 'add')} style={styles.bizBtn} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                        +{rate}%
                                    </button>
                                ))}
                            </div>
                            <div style={styles.bizRow}>
                                <div style={styles.bizLabel}>- GST</div>
                                {[5, 12, 18, 28].map(rate => (
                                    <button key={rate} onClick={() => handleGST(rate, 'remove')} style={styles.bizBtn} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                        -{rate}%
                                    </button>
                                ))}
                            </div>
                            <div style={styles.bizRow}>
                                <div style={styles.bizLabel}>Disc</div>
                                {[5, 10, 15, 20].map(pct => (
                                    <button key={pct} onClick={() => handleDiscount(pct)} style={{...styles.bizBtn, color: '#dc2626', borderColor: '#fee2e2'}} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                        -{pct}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.grid}>
                            {renderButton(<RotateCcw size={16} />, handleClear, 'action')}
                            {renderButton(<Delete size={16} />, handleDelete, 'action')}
                            {renderButton("%", () => setDisplay(String(parseFloat(display)/100)), 'op')}
                            {renderButton("/", () => handleOperator("/"), 'op')}

                            {renderButton("7", () => handleNumber(7), 'num')}
                            {renderButton("8", () => handleNumber(8), 'num')}
                            {renderButton("9", () => handleNumber(9), 'num')}
                            {renderButton("x", () => handleOperator("*"), 'op')}

                            {renderButton("4", () => handleNumber(4), 'num')}
                            {renderButton("5", () => handleNumber(5), 'num')}
                            {renderButton("6", () => handleNumber(6), 'num')}
                            {renderButton("-", () => handleOperator("-"), 'op')}

                            {renderButton("1", () => handleNumber(1), 'num')}
                            {renderButton("2", () => handleNumber(2), 'num')}
                            {renderButton("3", () => handleNumber(3), 'num')}
                            {renderButton("+", () => handleOperator("+"), 'op')}

                            {renderButton("0", () => handleNumber(0), 'num')}
                            {renderButton(".", handleDecimal, 'num')}
                            {renderButton("=", handleCalculate, 'eq')}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
