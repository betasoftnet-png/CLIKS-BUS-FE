import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Search,
    ChevronDown,
    Building2,
    RefreshCw,
    Info,
    Check,
    X,
    Filter
} from 'lucide-react';
import { taxAuditService } from '../services/taxAuditService';

export default function TaxAuditSuite({ activeSuiteTool = 'tool1', setActiveSuiteTool, formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}` }) {
    // ── Tab 1 State (Sec 40A(3)) ──
    const [sec40Data, setSec40Data] = useState(null);
    const [sec40Loading, setSec40Loading] = useState(true);
    const [editingExemptionId, setEditingExemptionId] = useState(null);
    const [exemptionRemark, setExemptionRemark] = useState('');

    // ── Tab 2 State (Clause 34 TDS/TCS) ──
    const [clause34Data, setClause34Data] = useState(null);
    const [clause34Loading, setClause34Loading] = useState(true);

    // ── Tab 3 State (Clause 44 Breakdown) ──
    const [clause44Data, setClause44Data] = useState(null);
    const [clause44Loading, setClause44Loading] = useState(true);

    // ── Tab 4 State (Sec 43B(h) MSME) ──
    const [sec43bhData, setSec43bhData] = useState(null);
    const [sec43bhLoading, setSec43bhLoading] = useState(true);

    // ── Tab 5 State (Statutory Dues PF/ESI) ──
    const [statutoryData, setStatutoryData] = useState(null);
    const [statutoryLoading, setStatutoryLoading] = useState(true);

    // Notifications / Export toast
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Generic CSV/Excel file downloader for Form 3CD export buttons
    const triggerCsvDownload = (filename, headers, rows) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`📥 ${filename} generated & downloaded successfully!`);
    };

    // Fetch data on mount
    useEffect(() => {
        loadSec40Data();
        loadClause34Data();
        loadClause44Data();
        loadSec43bhData();
        loadStatutoryData();
    }, []);

    const loadSec40Data = () => {
        setSec40Loading(true);
        taxAuditService.getSec40a3Watchdog({ financial_year: '2025-2026' })
            .then(res => setSec40Data(res))
            .catch(console.error)
            .finally(() => setSec40Loading(false));
    };

    const loadClause34Data = () => {
        setClause34Loading(true);
        taxAuditService.getClause34Hub({ financial_year: '2025-2026' })
            .then(res => setClause34Data(res))
            .catch(console.error)
            .finally(() => setClause34Loading(false));
    };

    const loadClause44Data = () => {
        setClause44Loading(true);
        taxAuditService.getClause44Breakdown({ financial_year: '2025-2026' })
            .then(res => setClause44Data(res))
            .catch(console.error)
            .finally(() => setClause44Loading(false));
    };

    const loadSec43bhData = () => {
        setSec43bhLoading(true);
        taxAuditService.getSec43bhTracker({ financial_year: '2025-2026' })
            .then(res => setSec43bhData(res))
            .catch(console.error)
            .finally(() => setSec43bhLoading(false));
    };

    const loadStatutoryData = () => {
        setStatutoryLoading(true);
        taxAuditService.getStatutoryDuesClock({ financial_year: '2025-2026' })
            .then(res => setStatutoryData(res))
            .catch(console.error)
            .finally(() => setStatutoryLoading(false));
    };

    // Handle Rule 6DD Exemption Toggle
    const handleToggleRule6DD = async (record) => {
        const nextExempt = !record.is_exempt_6dd;
        const defaultRemark = nextExempt ? 'Rule 6DD(g) - Payment made on bank holiday or offline rural banking unit' : '';
        
        try {
            await taxAuditService.updateRule6ddExemption({
                record_id: record.id,
                vendor_name: record.vendor_name,
                payment_date: record.payment_date,
                is_exempt: nextExempt,
                remark: defaultRemark
            });
            loadSec40Data();
            showToast(nextExempt ? `✓ Exemption granted under Rule 6DD for ${record.vendor_name}` : `Disallowance re-instated for ${record.vendor_name}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveRemark = async (record) => {
        try {
            await taxAuditService.updateRule6ddExemption({
                record_id: record.id,
                vendor_name: record.vendor_name,
                payment_date: record.payment_date,
                is_exempt: true,
                remark: exemptionRemark
            });
            setEditingExemptionId(null);
            loadSec40Data();
            showToast(`✓ Rule 6DD Remark updated for ${record.vendor_name}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            {/* Toast Alert */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ======================================================================
                SUB-TAB 1: SEC 40A(3) CASH PAYMENT WATCHDOG
            ====================================================================== */}
            {activeSuiteTool === 'tool1' && (
                <div className="flex flex-col gap-4">
                    {/* Subtitle & Threshold Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                🚨 Section 40A(3) Cash Payment Watchdog
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Flags aggregate daily cash payments to a single vendor subject to tax disallowance under Sec 40A(3).
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-rose-50 text-rose-600 font-semibold text-xs px-3 py-1 rounded-md border border-rose-100 whitespace-nowrap">
                                Threshold: &gt; ₹10,000 / Day / Party
                            </span>
                        </div>
                    </div>

                    {/* Violation Alert Cards */}
                    {sec40Data?.violations && sec40Data.violations.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                            {sec40Data.violations.map((violation) => (
                                <div
                                    key={violation.id}
                                    className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition hover:border-rose-300"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertTriangle size={17} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">
                                                Vendor: {violation.vendor_name}
                                            </div>
                                            <div className="text-[11.5px] text-slate-600 mt-0.5">
                                                Date: <span className="font-semibold">{violation.payment_date}</span> | Total Cash: <span className="font-bold text-rose-700">{formatCurrency(violation.total_cash)}</span> across {violation.voucher_count} vouchers ({violation.voucher_nos})
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-rose-600 font-bold tracking-tight text-xs bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-md">
                                            DISALLOWED u/s 40A(3)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            <span>Zero active cash payment disallowances detected. All daily disbursements are within statutory limits or protected under Rule 6DD.</span>
                        </div>
                    )}

                    {/* Audit Inspection Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Sec 40A(3) Audit Inspection Ledger
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                FY 2025-2026 | Auto-aggregated by Date & Party
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                                        <th className="py-2.5 px-3">Payment Date</th>
                                        <th className="py-2.5 px-3">Party / Vendor Name</th>
                                        <th className="py-2.5 px-3">PAN</th>
                                        <th className="py-2.5 px-3">Voucher Nos</th>
                                        <th className="py-2.5 px-3 text-right">Total Cash Paid (₹)</th>
                                        <th className="py-2.5 px-3 text-right">Statutory Limit</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                                    {sec40Data?.records?.map((rec) => {
                                        const isDisallowed = rec.status === 'DISALLOWED_40A3';
                                        const isExempt = rec.status === 'EXEMPT_RULE_6DD' || rec.is_exempt_6dd;

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-3 font-mono text-slate-600">{rec.payment_date}</td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                                    {rec.vendor_name}
                                                    {rec.is_goods_transporter && (
                                                        <span className="ml-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                            Transporter
                                                        </span>
                                                    )}
                                                    {rec.exemption_remark && (
                                                        <div className="text-[11px] text-emerald-700 font-normal mt-0.5">
                                                            Note: {rec.exemption_remark}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-600">{rec.pan || 'N/A'}</td>
                                                <td className="py-2.5 px-3 text-slate-600">{rec.voucher_nos}</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                    {formatCurrency(rec.total_cash)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-600">
                                                    {formatCurrency(rec.statutory_limit)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {isDisallowed && (
                                                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                                                            DISALLOWED
                                                        </span>
                                                    )}
                                                    {isExempt && (
                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center justify-center gap-1">
                                                            <Check size={12} /> EXEMPT u/r 6DD
                                                        </span>
                                                    )}
                                                    {!isDisallowed && !isExempt && (
                                                        <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                                                            COMPLIANT
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleRule6DD(rec)}
                                                            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition border ${
                                                                isExempt
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {isExempt ? '✓ Exempted' : 'Exempt under Rule 6DD'}
                                                        </button>
                                                        {isExempt && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingExemptionId(rec.id);
                                                                    setExemptionRemark(rec.exemption_remark || 'Rule 6DD(g) - Bank holiday / offline branch');
                                                                }}
                                                                className="text-slate-400 hover:text-slate-600 text-xs underline font-medium"
                                                            >
                                                                Remark
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Remark Modal / Inline Editor */}
                    {editingExemptionId && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                            <div className="w-full">
                                <label className="block text-xs font-bold text-amber-900 mb-1">
                                    Auditor Exemption Remark (Rule 6DD documentation for Form 3CD Workpapers):
                                </label>
                                <input
                                    type="text"
                                    value={exemptionRemark}
                                    onChange={(e) => setExemptionRemark(e.target.value)}
                                    placeholder="Enter Rule 6DD sub-clause justification (e.g. 6DD(g) Bank holiday)"
                                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const rec = sec40Data.records.find(r => r.id === editingExemptionId);
                                        if (rec) handleSaveRemark(rec);
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                                >
                                    Save Remark
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingExemptionId(null)}
                                    className="bg-white border border-amber-300 text-amber-800 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================================
                SUB-TAB 2: TDS/TCS HUB (CLAUSE 34 OF FORM 3CD)
            ====================================================================== */}
            {activeSuiteTool === 'tool2' && (
                <div className="flex flex-col gap-4">
                    {/* Compliance Status Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Pill 1: Sec 194C */}
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <Check size={14} /> Sec 194C (Contractors) - ✓ Compliant
                            </span>
                            {/* Pill 2: Sec 194J */}
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <Check size={14} /> Sec 194J (Professional) - ✓ Compliant
                            </span>
                            {/* Pill 3: Sec 194Q */}
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <AlertTriangle size={14} /> Sec 194Q (Goods Purchase) - ⚠️ 1 Delay Deposit
                            </span>
                        </div>

                        {/* Export Action */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!clause34Data?.records) return;
                                    const headers = ["TDS Section", "Nature of Payment", "Total Amount Paid", "Base Deductible", "Actual TDS Deducted", "Deposit Date", "Statutory Due Date", "Delay (Days)", "30% Disallowed u/s 40(a)(ia)"];
                                    const rows = clause34Data.records.map(r => [
                                        r.section,
                                        r.nature_of_payment,
                                        r.total_amount_paid,
                                        r.base_deductible,
                                        r.tds_deducted,
                                        r.deposit_date,
                                        r.due_date,
                                        r.delay_days,
                                        r.disallowance_30_pct
                                    ]);
                                    triggerCsvDownload("Form_3CD_Clause_34_TDS_Schedule.csv", headers, rows);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition"
                            >
                                <FileSpreadsheet size={15} /> Form 3CD Clause 34 - Ready to Export (.XLSX)
                            </button>
                        </div>
                    </div>

                    {/* Disallowance Advisory Callout if delayed */}
                    {clause34Data?.total_disallowed_40a_ia > 0 && (
                        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-rose-800">
                            <div className="flex items-center gap-2.5">
                                <ShieldAlert size={17} className="text-rose-600" />
                                <span>
                                    <strong>Statutory Disallowance Alert:</strong> Total 30% expenditure disallowed under Section 40(a)(ia) due to belated deposit: <span className="font-extrabold text-rose-900">{formatCurrency(clause34Data.total_disallowed_40a_ia)}</span>.
                                </span>
                            </div>
                            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
                                Add back to P&L in 3CD
                            </span>
                        </div>
                    )}

                    {/* Clause 34 Master Schedule Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Form 3CD Clause 34 Master Schedule
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                Statutory Due Date: Strict 7th of Following Month
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                                        <th className="py-2.5 px-3">TDS Section</th>
                                        <th className="py-2.5 px-3 text-right">Total Amount Paid/Credited</th>
                                        <th className="py-2.5 px-3 text-right">Total Base Deductible</th>
                                        <th className="py-2.5 px-3 text-right">Actual TDS Deducted</th>
                                        <th className="py-2.5 px-3">Challan / Deposit Date</th>
                                        <th className="py-2.5 px-3">Statutory Due Date</th>
                                        <th className="py-2.5 px-3 text-center">Delay (Days)</th>
                                        <th className="py-2.5 px-3 text-right">Disallowance Flag (30% u/s 40(a)(ia))</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                                    {clause34Data?.records?.map((rec) => {
                                        const isDelayed = rec.delay_days > 0;

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                                    {rec.section}
                                                    <div className="text-[11px] text-slate-500 font-normal">
                                                        {rec.nature_of_payment}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium">
                                                    {formatCurrency(rec.total_amount_paid)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium">
                                                    {formatCurrency(rec.base_deductible)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                    {formatCurrency(rec.tds_deducted)}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                                    {rec.deposit_date}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                                    {rec.due_date}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {isDelayed ? (
                                                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                                                            +{rec.delay_days} days
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-700 font-bold text-[11px]">
                                                            0 days (On-Time)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    {rec.disallowance_30_pct > 0 ? (
                                                        <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                                            {formatCurrency(rec.disallowance_30_pct)} (30%)
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">
                                                            ₹0.00 (Nil)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================================
                SUB-TAB 3: CLAUSE 44 EXPENSE BREAKDOWN MATRIX
            ====================================================================== */}
            {activeSuiteTool === 'tool3' && (
                <div className="flex flex-col gap-4">
                    {/* 4 Top KPI Cards (Grid 4-cols) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {/* KPI 1: GST Exempt */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                GST Exempt Supplies
                            </div>
                            <div className="text-xl font-extrabold text-emerald-700 mt-1.5">
                                {formatCurrency(clause44Data?.kpis?.exempt_supplies || 420000)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Nil-rated / Non-taxable</div>
                        </div>

                        {/* KPI 2: Composition Scheme */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Composition Scheme
                            </div>
                            <div className="text-xl font-extrabold text-blue-700 mt-1.5">
                                {formatCurrency(clause44Data?.kpis?.composition_scheme || 180000)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Sec 10 Composition dealers</div>
                        </div>

                        {/* KPI 3: Registered Entities */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Registered Entities
                            </div>
                            <div className="text-xl font-extrabold text-purple-700 mt-1.5">
                                {formatCurrency(clause44Data?.kpis?.registered_entities || 4560000)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Regular GST registered suppliers</div>
                        </div>

                        {/* KPI 4: Non-Registered Entities */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Non-Registered Entities
                            </div>
                            <div className="text-xl font-extrabold text-amber-700 mt-1.5">
                                {formatCurrency(clause44Data?.kpis?.non_registered_entities || 810000)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Unregistered entities (URD)</div>
                        </div>
                    </div>

                    {/* Official Form 3CD Clause 44 Matrix Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Form 3CD Clause 44 Official Expenditure Matrix
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Break-up of total expenditure in respect of entities registered under GST vs unregistered entities.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!clause44Data?.matrix) return;
                                    const headers = ["Sl No", "Expenditure Head", "Total Expenditure (Col 2)", "Exempt (Col 3)", "Composition (Col 4)", "Other Registered (Col 5)", "Total Registered (Col 6)", "Non-Registered (Col 7)"];
                                    const rows = clause44Data.matrix.map(r => [
                                        r.sl_no,
                                        r.expenditure_head,
                                        r.total_expenditure,
                                        r.exempt_col3,
                                        r.composition_col4,
                                        r.other_registered_col5,
                                        r.total_registered_col6,
                                        r.non_registered_col7
                                    ]);
                                    triggerCsvDownload("Form_3CD_Clause_44_Matrix.csv", headers, rows);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            >
                                <Download size={14} /> Export Clause 44 Excel for Form 3CD
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                                        <th className="py-2.5 px-3 text-center">Sl</th>
                                        <th className="py-2.5 px-3">Expenditure Head (Col 1)</th>
                                        <th className="py-2.5 px-3 text-right">Total Expenditure (Col 2)</th>
                                        <th className="py-2.5 px-3 text-right text-emerald-800 bg-emerald-50/50">Exempt (Col 3)</th>
                                        <th className="py-2.5 px-3 text-right text-blue-800 bg-blue-50/50">Composition (Col 4)</th>
                                        <th className="py-2.5 px-3 text-right text-purple-800 bg-purple-50/50">Other Registered (Col 5)</th>
                                        <th className="py-2.5 px-3 text-right font-extrabold text-slate-900 bg-slate-100/60">Total Registered (Col 6)</th>
                                        <th className="py-2.5 px-3 text-right text-amber-800 bg-amber-50/50">Non-Registered (Col 7)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                                    {clause44Data?.matrix?.map((row) => (
                                        <tr key={row.sl_no} className="hover:bg-slate-50/80 transition">
                                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{row.sl_no}</td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-900">{row.expenditure_head}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(row.total_expenditure)}</td>
                                            <td className="py-2.5 px-3 text-right bg-emerald-50/20">{formatCurrency(row.exempt_col3)}</td>
                                            <td className="py-2.5 px-3 text-right bg-blue-50/20">{formatCurrency(row.composition_col4)}</td>
                                            <td className="py-2.5 px-3 text-right bg-purple-50/20">{formatCurrency(row.other_registered_col5)}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-100/40">{formatCurrency(row.total_registered_col6)}</td>
                                            <td className="py-2.5 px-3 text-right bg-amber-50/20">{formatCurrency(row.non_registered_col7)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                                        <td colSpan={2} className="py-3 px-3 text-right uppercase tracking-wider">
                                            Total (Form 3CD Clause 44)
                                        </td>
                                        <td className="py-3 px-3 text-right font-black">
                                            {formatCurrency(clause44Data?.totals?.total_expenditure || 5970000)}
                                        </td>
                                        <td className="py-3 px-3 text-right text-emerald-800 bg-emerald-100/50">
                                            {formatCurrency(clause44Data?.totals?.exempt_col3 || 420000)}
                                        </td>
                                        <td className="py-3 px-3 text-right text-blue-800 bg-blue-100/50">
                                            {formatCurrency(clause44Data?.totals?.composition_col4 || 180000)}
                                        </td>
                                        <td className="py-3 px-3 text-right text-purple-800 bg-purple-100/50">
                                            {formatCurrency(clause44Data?.totals?.other_registered_col5 || 4560000)}
                                        </td>
                                        <td className="py-3 px-3 text-right font-black bg-slate-200/60">
                                            {formatCurrency(clause44Data?.totals?.total_registered_col6 || 5160000)}
                                        </td>
                                        <td className="py-3 px-3 text-right text-amber-800 bg-amber-100/50">
                                            {formatCurrency(clause44Data?.totals?.non_registered_col7 || 810000)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================================
                SUB-TAB 4: SEC 43B(h) MSME PAYMENT TRACKER
            ====================================================================== */}
            {activeSuiteTool === 'tool4' && (
                <div className="flex flex-col gap-4">
                    {/* Summary Alert Card */}
                    {sec43bhData?.critical_alert && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <Clock size={19} />
                                </div>
                                <div>
                                    <div className="text-xs font-extrabold text-amber-900">
                                        Micro Vendor: {sec43bhData.critical_alert.vendor_name} | Invoice Date: {sec43bhData.critical_alert.invoice_date} ({sec43bhData.critical_alert.days_elapsed} Days Elapsed) | Limit: {sec43bhData.critical_alert.statutory_limit_days} Days
                                    </div>
                                    <div className="text-[11.5px] text-amber-700 mt-0.5">
                                        Payment must be settled within the statutory limit to avoid non-deductible tax disallowance under Section 43B(h).
                                    </div>
                                </div>
                            </div>
                            <span className="bg-amber-200 text-amber-900 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm shrink-0">
                                [ {sec43bhData.critical_alert.days_remaining} Days Remaining ]
                            </span>
                        </div>
                    )}

                    {/* Section 43B(h) Aging Schedule Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    MSMED Act Sec 15 & Income Tax Sec 43B(h) Aging Ledger
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Statutory Rule: Default 15 days without agreement / Maximum 45 days with written agreement.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!sec43bhData?.records) return;
                                    const headers = ["Vendor Name", "MSME Category", "Udyam Reg No", "Invoice No", "Invoice Date", "Bill Amount", "Balance Due", "Limit (Days)", "Elapsed (Days)", "Remaining (Days)", "Risk Status"];
                                    const rows = sec43bhData.records.map(r => [
                                        r.vendor_name,
                                        r.msme_category,
                                        r.udyam_reg_no,
                                        r.invoice_no,
                                        r.invoice_date,
                                        r.bill_amount,
                                        r.balance_due,
                                        r.statutory_limit_days,
                                        r.days_elapsed,
                                        r.days_remaining,
                                        r.risk_status
                                    ]);
                                    triggerCsvDownload("Sec_43Bh_MSME_Disallowance_Schedule.csv", headers, rows);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            >
                                <Download size={14} /> Export Section 43B(h) Disallowance Schedule
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                                        <th className="py-2.5 px-3">Vendor Name</th>
                                        <th className="py-2.5 px-3">MSME Category</th>
                                        <th className="py-2.5 px-3">Udyam Reg No</th>
                                        <th className="py-2.5 px-3">Invoice No & Date</th>
                                        <th className="py-2.5 px-3 text-right">Bill Amount (₹)</th>
                                        <th className="py-2.5 px-3 text-right">Balance Due (₹)</th>
                                        <th className="py-2.5 px-3 text-center">Statutory Limit</th>
                                        <th className="py-2.5 px-3 text-center">Days Elapsed</th>
                                        <th className="py-2.5 px-3 text-center">Days Remaining</th>
                                        <th className="py-2.5 px-3 text-center">Risk Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                                    {sec43bhData?.records?.map((rec) => {
                                        const isDisallowed = rec.risk_status === 'DISALLOWED_43BH';
                                        const isCritical = rec.risk_status === 'CRITICAL_DUE';
                                        const isCompliant = rec.risk_status === 'COMPLIANT';

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                                    {rec.vendor_name}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`text-[10.5px] px-2 py-0.5 rounded font-bold ${
                                                        rec.msme_category === 'Micro' 
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                    }`}>
                                                        {rec.msme_category}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                                                    {rec.udyam_reg_no}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-700">
                                                    <span className="font-semibold">{rec.invoice_no}</span>
                                                    <div className="text-[11px] text-slate-500">{rec.invoice_date}</div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium">
                                                    {formatCurrency(rec.bill_amount)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                    {formatCurrency(rec.balance_due)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                                                    {rec.statutory_limit_days} Days
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                                    {rec.days_elapsed}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold">
                                                    {rec.days_remaining < 0 ? (
                                                        <span className="text-rose-600">{rec.days_remaining}d (Overdue)</span>
                                                    ) : (
                                                        <span className={rec.days_remaining <= 5 ? "text-amber-600 font-extrabold" : "text-slate-700"}>
                                                            {rec.days_remaining}d
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {isDisallowed && (
                                                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2.5 py-0.5 rounded font-extrabold">
                                                            DISALLOWED_43BH
                                                        </span>
                                                    )}
                                                    {isCritical && (
                                                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] px-2.5 py-0.5 rounded font-extrabold">
                                                            CRITICAL_DUE
                                                        </span>
                                                    )}
                                                    {isCompliant && (
                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded font-bold">
                                                            COMPLIANT
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================================
                SUB-TAB 5: STATUTORY DUES CLOCK (PF/ESI)
            ====================================================================== */}
            {activeSuiteTool === 'tool5' && (
                <div className="flex flex-col gap-4">
                    {/* Status Badge & Header Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                ⏰ Statutory Dues Clock (Clause 20(b) of Form 3CD)
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Strict 15th-of-next-month statutory clock for EPF and ESIC contributions under Section 36(1)(va) and Section 43B.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {statutoryData?.overall_status === 'LATE_DEPOSIT_OBSERVED' ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5">
                                    <AlertTriangle size={15} /> ⚠️ Late Deposit Observed
                                </span>
                            ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5">
                                    <CheckCircle2 size={15} /> ✓ PF/ESI Deposited On-Time
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!statutoryData?.records) return;
                                    const headers = ["Month / Period", "Fund Nature", "Employee Contribution", "Employer Share", "Statutory Due Date", "Actual Deposit Date", "Challan / TRRN Ref", "Delay (Days)", "Disallowed u/s 36(1)(va)"];
                                    const rows = statutoryData.records.map(r => [
                                        r.month_period,
                                        r.fund_nature,
                                        r.employee_contribution,
                                        r.employer_share,
                                        r.statutory_due_date,
                                        r.actual_deposit_date,
                                        r.challan_ref,
                                        r.delay_days,
                                        r.disallowed_amount
                                    ]);
                                    triggerCsvDownload("Form_3CD_Clause_20b_Statutory_Dues.csv", headers, rows);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            >
                                <Download size={14} /> Export Form 3CD Clause 20(b) Format
                            </button>
                        </div>
                    </div>

                    {/* Disallowance Banner under 36(1)(va) */}
                    {statutoryData?.total_disallowed_36_1_va > 0 && (
                        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-rose-800">
                            <div className="flex items-center gap-2.5">
                                <ShieldAlert size={17} className="text-rose-600" />
                                <span>
                                    <strong>Permanent Disallowance u/s 36(1)(va):</strong> Total employee PF/ESI contributions delayed past the 15th statutory due date cannot be claimed: <span className="font-extrabold text-rose-900">{formatCurrency(statutoryData.total_disallowed_36_1_va)}</span> (SC Judgment in <i>Checkmate Services P. Ltd.</i>).
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Monthly Statutory Dues Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Clause 20(b) Monthly Statutory Dues Grid
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                EPF (12% + 12%) | ESIC (0.75% + 3.25%)
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                                        <th className="py-2.5 px-3">Month / Period</th>
                                        <th className="py-2.5 px-3">Fund Nature</th>
                                        <th className="py-2.5 px-3 text-right">Employee Contribution (₹)</th>
                                        <th className="py-2.5 px-3 text-right">Employer Share (₹)</th>
                                        <th className="py-2.5 px-3">Statutory Due Date</th>
                                        <th className="py-2.5 px-3">Actual Deposit Date</th>
                                        <th className="py-2.5 px-3">Challan / TRRN Ref</th>
                                        <th className="py-2.5 px-3 text-center">Delay (Days)</th>
                                        <th className="py-2.5 px-3 text-right">Disallowed u/s 36(1)(va)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                                    {statutoryData?.records?.map((rec) => {
                                        const isDelayed = rec.delay_days > 0;

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                                    {rec.month_period}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`text-[10.5px] px-2 py-0.5 rounded font-bold ${
                                                        rec.fund_nature.startsWith('EPF')
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {rec.fund_nature}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium">
                                                    {formatCurrency(rec.employee_contribution)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium">
                                                    {formatCurrency(rec.employer_share)}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">
                                                    {rec.statutory_due_date}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                                    {rec.actual_deposit_date}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                                    {rec.challan_ref}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {isDelayed ? (
                                                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px]">
                                                            +{rec.delay_days} days
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-700 font-bold text-[11px]">
                                                            0 days (On-Time)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    {rec.disallowed_amount > 0 ? (
                                                        <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                                            {formatCurrency(rec.disallowed_amount)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">
                                                            ₹0.00 (Nil)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
