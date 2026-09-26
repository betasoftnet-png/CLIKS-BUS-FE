import React, { useState } from 'react';

// Structured datasets for Tax Audit Modules 1 to 5 (Tabs 6 through 10)
const TAX_AUDIT_MODULES = {
  applicability: {
    title: 'Module 1: Applicability, Accounting Policies & Profit Adjustments',
    description: 'Audits tax thresholds, books of account eligibility, compliance with the Income Computation and Disclosure Standards (ICDS), and conversions of capital assets into stock.',
    subTracks: [
      {
        id: '1.1',
        name: '1. Thresholds & Presumptive Exclusions',
        act: 'Section 44AB, Section 44AD, Section 44ADA',
        rules: 'Rule 6G(1)(a)/(b)',
        clause: 'Clauses 1 to 8, Clause 12',
        deliverable: 'Form 3CA / Form 3CB Audit Report',
        objective: 'Verifying whether turnover exceeds ₹1 Cr (or ₹10 Cr if cash transactions ≤ 5%) and evaluating opt-outs from presumptive schemes.',
      },
      {
        id: '1.2',
        name: '2. Books of Accounts & Storage Location',
        act: 'Section 44AA',
        rules: 'Rule 6F',
        clause: 'Clause 11(a)-(c)',
        deliverable: 'Books of Account Examination Sheet',
        objective: 'Auditing the list of books maintained (Cash Book, Journal, Ledgers), whether computer-generated or manual, and physical storage addresses.',
      },
      {
        id: '1.3',
        name: '3. Method of Accounting & ICDS Deviations',
        act: 'Section 145, Section 145A',
        rules: 'Rule 144; Notification No. S.O. 3079(E)',
        clause: 'Clause 13(a)-(f)',
        deliverable: 'ICDS I to X Reconciliation Schedule',
        objective: 'Scrutinizing mercantile vs. cash methods, valuation adjustments for tax (inclusive of taxes under Sec 145A), and deviations from 10 ICDS standards.',
      },
      {
        id: '1.4',
        name: '4. Stock Valuation & Inventory Deviations',
        act: 'Section 145A',
        rules: 'Rule 115; ICDS II (Valuation of Inventories)',
        clause: 'Clause 14(a)-(b)',
        deliverable: 'Closing Stock Valuation Variance Matrix',
        objective: 'Reporting methods used for valuing finished goods/raw materials and quantifying deviations from cost or net realizable value (NRV).',
      },
      {
        id: '1.5',
        name: '5. Capital Asset Conversion into Stock',
        act: 'Section 45(2)',
        rules: 'Rule 8',
        clause: 'Clause 15',
        deliverable: 'Capital Conversion & Fair Value Schedule',
        objective: 'Tracking fixed/capital assets converted into stock-in-trade, recording dates of acquisition, cost, and fair market value (FMV) on date of conversion.',
      },
    ],
  },
  disallowances: {
    title: 'Module 2: Statutory Business Disallowances & Cash Watchdogs',
    description: 'Focuses on identifying illegal, non-business, or restricted expenses that must be added back to P&L to determine correct taxable business income.',
    subTracks: [
      {
        id: '2.1',
        name: '1. Cash Expenditure Watchdog',
        act: 'Section 40A(3), Section 40A(3A)',
        rules: 'Rule 6DD',
        clause: 'Clause 21(d)(A) & (B)',
        deliverable: 'Sec 40A(3) Disallowance Ledger',
        objective: 'Aggregating payments exceeding ₹10,000/day (or ₹35,000 for transporters) made in cash and verifying genuine exemptions under Rule 6DD.',
      },
      {
        id: '2.2',
        name: '2. Withholding Tax Non-Compliance Disallowance',
        act: 'Section 40(a)(ia), Section 40(a)(i)',
        rules: 'Rule 30, Rule 31A',
        clause: 'Clause 21(b)',
        deliverable: '30% Expenditure Disallowance Statement',
        objective: 'Flagging 30% disallowance on resident vendor payments and 100% on non-resident payments where TDS was not deducted or deposited late.',
      },
      {
        id: '2.3',
        name: '3. Personal Expenses, Fines & Political Donations',
        act: 'Section 37(1), Section 40(a)(iib)',
        rules: 'Explanation 1, 2, 3 to Sec 37(1)',
        clause: 'Clause 21(a)',
        deliverable: 'Non-Business & Penal Expenses Matrix',
        objective: 'Adding back personal expenses, statutory fines/penalties for law violations, CSR expenditures, and corporate political advertisements.',
      },
      {
        id: '2.4',
        name: '4. Related Party Payments (Excessive / Unreasonable)',
        act: 'Section 40A(2)(b)',
        rules: '—',
        clause: 'Clause 23',
        deliverable: 'Related Party Payment Scrutiny Note',
        objective: 'Evaluating whether payments for goods/services made to directors, relatives, or substantial interest holders exceed prevailing open-market value.',
      },
      {
        id: '2.5',
        name: '5. Deemed Income & Prior Period Items',
        act: 'Section 41(1), Section 145',
        rules: '—',
        clause: 'Clause 24, Clause 27(b)',
        deliverable: 'Trading Liability Remission & Prior Item List',
        objective: 'Auditing remission/cessation of expired creditor liabilities and listing debits/credits pertaining to previous financial years.',
      },
    ],
  },
  msme_dues: {
    title: 'Module 3: MSME Protections, Deductions on Actual Payment & Statutory Dues',
    description: 'Audits expenses allowable only on actual discharge, delayed vendor settlements under the MSMED Act, and employee benefit remittances.',
    subTracks: [
      {
        id: '3.1',
        name: '1. MSME Timely Payment Enforcement',
        act: 'Section 43B(h)',
        rules: 'Section 15 & 16 of MSMED Act, 2006',
        clause: 'Clause 22, Clause 26',
        deliverable: 'MSME Overdue (>15/45 Days) Disallowance Tracker',
        objective: 'Tracking invoices from Micro/Small enterprises unpaid within 15 days (or 45 days under contract) to disallow the deduction until actual payment.',
      },
      {
        id: '3.2',
        name: '2. Deductions on Actual Payment Basis',
        act: 'Section 43B(a)-(g)',
        rules: '—',
        clause: 'Clause 26',
        deliverable: 'Sec 43B Payment Verification Ledger',
        objective: 'Verifying whether taxes, duties, cess, employee bonus, and bank loan interest were actually paid on or before the ITR filing due date.',
      },
      {
        id: '3.3',
        name: '3. Employee Welfare Funds (PF / ESI) Timing',
        act: 'Section 36(1)(va), Section 2(24)(x)',
        rules: "Employees' Provident Fund & ESI Schemes",
        clause: 'Clause 20(b)',
        deliverable: 'Statutory Dues Clock (PF/ESI Deposit Table)',
        objective: 'Auditing employee salary deductions for PF/ESI and flagging permanent disallowances if deposited even one day past the statutory monthly due date.',
      },
      {
        id: '3.4',
        name: '4. Tax Depreciation & Asset Blocks',
        act: 'Section 32, Section 50',
        rules: 'Rule 5',
        clause: 'Clause 18(a)-(e)',
        deliverable: 'Form 3CD Depreciation Schedule',
        objective: 'Computing block-wise depreciation, testing the <180-day half-rate rule on additions, and determining short-term capital gains on block wipeouts.',
      },
      {
        id: '3.5',
        name: '5. Special Deductions & Scientific Research',
        act: 'Section 33AB, 35, 35D',
        rules: 'Rule 5C, 5D, 6',
        clause: 'Clause 19',
        deliverable: 'Amortization of Preliminary Expenses Sheet',
        objective: 'Verifying amounts debited to P&L for scientific research, telecommunication licenses, or 1/5th amortizations of preliminary company incorporation expenses.',
      },
    ],
  },
  withholding_gst: {
    title: 'Module 4: Withholding Taxes, GST Expense Split & Cash Loans',
    description: 'Audits end-to-end TDS/TCS liabilities, the comprehensive GST expense breakdown under Clause 44, and unaccounted loan acceptances/repayments.',
    subTracks: [
      {
        id: '4.1',
        name: '1. TDS / TCS Master Compliance Verification',
        act: 'Chapter XVII-B (Sec 192 to 195, 194Q, 206C)',
        rules: 'Rule 30, Rule 31A',
        clause: 'Clause 34(a), (b), (c)',
        deliverable: 'Clause 34 Master Schedule (.XLSX)',
        objective: 'Reconciling expense accounts against TAN returns (Form 24Q, 26Q), tracing short-deductions, non-deductions, and late-deposit interest under Sec 201(1A).',
      },
      {
        id: '4.2',
        name: '2. Clause 44 GST Expense Breakdown',
        act: 'Section 44AB read with CGST Act, 2017',
        rules: 'Circular No. 10/2022; ICAI Tax Audit Guidance',
        clause: 'Clause 44',
        deliverable: 'Clause 44 Expenditure Bifurcation Matrix',
        objective: 'Splitting total annual expenditure between registered entities (exempt, composition, standard) and unregistered suppliers.',
      },
      {
        id: '4.3',
        name: '3. Unaccounted Cash Loans & Deposits',
        act: 'Section 269SS, Section 269ST',
        rules: 'Rule 47',
        clause: 'Clause 31(a)-(bb)',
        deliverable: 'Sec 269SS/ST Cash Receipt Register',
        objective: 'Scrutinizing loans, deposits, or transaction settlements exceeding ₹20,000 taken or accepted otherwise than by account-payee cheque/bank transfer.',
      },
      {
        id: '4.4',
        name: '4. Cash Loan Repayments & Advances',
        act: 'Section 269T',
        rules: 'Rule 47',
        clause: 'Clause 31(c)-(e)',
        deliverable: 'Sec 269T Repayment Ledger',
        objective: 'Auditing repayment of loans, deposits, or advances exceeding ₹20,000 to verify that funds were returned strictly through verified banking channels.',
      },
      {
        id: '4.5',
        name: '5. Dividend & Foreign Receipts',
        act: 'Section 115BBDA, Section 285A',
        rules: 'Rule 114DA',
        clause: 'Clause 36, Clause 41',
        deliverable: 'Dividend & International Transaction Memo',
        objective: 'Disclosing distributed dividends, tax deductions under Sec 194, and evaluating reporting on outbound remittances (Form 15CA/CB).',
      },
    ],
  },
  ratios_closures: {
    title: 'Module 5: Ratios, Tax Credits, Losses & e-Filing Closures',
    description: 'Validates analytical balance sheet ratios, tax-loss adjustments, deduction claims under Chapter VI-A, and final digital XML/JSON submission.',
    subTracks: [
      {
        id: '5.1',
        name: '1. Business Financial Ratio Analysis',
        act: 'Section 44AB',
        rules: 'ICAI Guidance Note on Tax Audit',
        clause: 'Clause 40',
        deliverable: 'Comparative Financial Ratio Statement',
        objective: 'Computing Gross Profit/Turnover, Net Profit/Turnover, Stock-in-Trade Turnover, and Material Consumed ratios compared against the previous financial year.',
      },
      {
        id: '5.2',
        name: '2. Brought-Forward Losses & Depreciation',
        act: 'Section 72, Section 73, Section 79',
        rules: '—',
        clause: 'Clause 32(a)-(e)',
        deliverable: 'Loss Set-off & Carry-Forward Matrix',
        objective: 'Auditing availability of business/speculation losses and checking change in shareholding (>51%) under Section 79 to restrict loss carry-forward.',
      },
      {
        id: '5.3',
        name: '3. Deductions under Chapter VI-A & 10AA',
        act: 'Section 80-IA, 80-IB, 80-IC, 80JJAA',
        rules: 'Rule 18BBB, 19AB',
        clause: 'Clause 33',
        deliverable: 'Chapter VI-A Statutory Eligibility Memo',
        objective: 'Certifying claims for profits from industrial undertakings, SEZ units (Sec 10AA), and new employee generation benefits under Section 80JJAA.',
      },
      {
        id: '5.4',
        name: '4. Minimum Alternate Tax (MAT) Scrutiny',
        act: 'Section 115JB',
        rules: 'Rule 40B; Form 29B',
        clause: 'Clause 37 (General Reporting)',
        deliverable: 'Book Profit & MAT Working Sheet',
        objective: 'Auditing book profit calculations, adjustments for non-taxable reserves, and generating certified Form 29B for corporate clients.',
      },
      {
        id: '5.5',
        name: '5. Tax Audit Final Sign-Off & e-Portal Filing',
        act: 'Section 288 (Authorized Representative)',
        rules: 'Rule 131; Notification No. 1/2021',
        clause: 'Final Sign-Off',
        deliverable: '1-Click Form 3CD JSON/XML + UDIN Certificate',
        objective: 'Compiling the complete 44-clause dataset into the official Income Tax e-filing JSON schema, validating hashes, and generating the mandatory UDIN.',
      },
    ],
  },
};

export default function TaxAuditForm3CDHub() {
  // Active Tab state: 'sec40a3' | 'tds_hub' | 'clause44' | 'msme_tracker' | 'statutory_dues' | 'applicability' | 'disallowances' | 'msme_dues' | 'withholding_gst' | 'ratios_closures'
  const [activeTaxTab, setActiveTaxTab] = useState('sec40a3');

  const activeTaxModuleData = TAX_AUDIT_MODULES[activeTaxTab];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold">📄</span>
            <h2 className="text-base font-black text-gray-900 tracking-tight">
              Tax Audit &amp; Form 3CD Hub
            </h2>
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[10px] font-black uppercase tracking-wider">
              SEC 44AB TAX AUDIT
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Verify compliance under Section 44AB and auto-populate Form 3CD.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10px] font-black text-amber-800">
              <span>⚡</span>
              <span>Core Deliverable: 1-Click Form 3CD Data Extractor (Clauses 21, 34, 44, Sec 43B(h))</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10 TABS IN A SINGLE HORIZONTALLY SCROLLABLE ROW                           */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 overflow-x-auto text-xs whitespace-nowrap">
        {/* Tab 1 */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('sec40a3')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'sec40a3'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Sec 40A(3) Cash Payment Watchdog
        </button>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('tds_hub')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'tds_hub'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          TDS/TCS Hub (Clause 34)
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('clause44')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'clause44'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Clause 44 Expense Breakdown
        </button>

        {/* Tab 4 */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('msme_tracker')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'msme_tracker'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Sec 43B(h) MSME Payment Tracker
        </button>

        {/* Tab 5 */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('statutory_dues')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'statutory_dues'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Statutory Dues Clock (PF/ESI)
        </button>

        {/* Tab 6 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('applicability')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'applicability'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Applicability, Accounting Policies &amp; Profit Adjustments
        </button>

        {/* Tab 7 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('disallowances')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'disallowances'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Statutory Business Disallowances &amp; Cash Watchdogs
        </button>

        {/* Tab 8 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('msme_dues')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'msme_dues'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          MSME Protections, Deductions on Actual Payment &amp; Statutory Dues
        </button>

        {/* Tab 9 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('withholding_gst')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'withholding_gst'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Withholding Taxes, GST Expense Split &amp; Cash Loans
        </button>

        {/* Tab 10 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveTaxTab('ratios_closures')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeTaxTab === 'ratios_closures'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Ratios, Tax Credits, Losses &amp; e-Filing Closures
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT PANELS                                                       */}
      {/* ========================================================================= */}

      {/* Existing Tabs 1–5 Content */}
      {activeTaxTab === 'sec40a3' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">
              Section 40A(3) Cash Payment Watchdog
            </h3>
            <span className="text-xs text-gray-500">Threshold: &gt; ₹10,000 / Day / Party</span>
          </div>
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs text-rose-800 font-semibold flex items-center justify-between">
            <span>Vendor: Balaji Heavy Roadways | Date: 2026-08-18 | Total Cash: ₹38,200 across 1 vouchers</span>
            <span className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-black text-[10px]">DISALLOWED u/s 40A(3)</span>
          </div>
        </div>
      )}

      {activeTaxTab === 'tds_hub' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          TDS/TCS Hub (Clause 34) Reconciliation Loaded.
        </div>
      )}

      {activeTaxTab === 'clause44' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Clause 44 Expense Breakdown Matrix Loaded.
        </div>
      )}

      {activeTaxTab === 'msme_tracker' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Sec 43B(h) MSME Payment Tracker Loaded.
        </div>
      )}

      {activeTaxTab === 'statutory_dues' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Statutory Dues Clock (PF/ESI) Loaded.
        </div>
      )}

      {/* Render Structured Section Tables for Tax Modules 1 to 5 (Tabs 6 to 10) */}
      {activeTaxModuleData && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
            <h3 className="text-sm font-black text-gray-900">{activeTaxModuleData.title}</h3>
            <p className="text-xs text-gray-600 font-medium">{activeTaxModuleData.description}</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-2xs">
            <table className="w-full text-left border-collapse table-fixed text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-[20%]">Sub-Track</th>
                  <th className="py-3 px-3 w-[15%]">Income Tax Act, 1961</th>
                  <th className="py-3 px-3 w-[20%]">Income Tax Rules, 1962</th>
                  <th className="py-3 px-3 w-[15%]">Form 3CD Clause</th>
                  <th className="py-3 px-3 w-[12%]">Statutory Deliverable / Schedule</th>
                  <th className="py-3 px-3 w-[18%]">Core Audit Verification Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTaxModuleData.subTracks.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900 align-top">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 font-semibold text-amber-700 align-top">
                      {row.act}
                    </td>
                    <td className="py-3 px-3 text-gray-600 align-top">
                      {row.rules}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-800 align-top">
                      {row.clause}
                    </td>
                    <td className="py-3 px-3 align-top">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px]">
                        {row.deliverable}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 align-top leading-relaxed">
                      {row.objective}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
