import React, { useState } from 'react';

// Structured datasets for Modules 1 through 5
const STATUTORY_AUDIT_MODULES = {
  governance: {
    title: 'Module 1: Corporate Governance, Appointment & Pre-Audit Controls',
    description: 'Focuses on statutory auditor onboarding, legal tenure validity, rotation rules, and firm-level quality controls before audit field execution begins.',
    subTracks: [
      {
        id: '1.1',
        name: '1. Statutory Appointment & Tenure Registry',
        section: 'Section 139(1), Section 139(2)',
        rules: 'Rule 3 & Rule 4 of Companies (Audit & Auditors) Rules, 2014',
        caroClause: 'Sec 143(3)(a) (Proper appointment & books)',
        deliverable: 'Form ADT-1',
        objective: 'Validating Board/AGM resolutions, 5-year tenure limits, mandatory CA firm rotation (5/10-year caps), and ROC filing timelines.',
      },
      {
        id: '1.2',
        name: '2. Auditor Independence & Quality Review',
        section: 'Section 141(1), Section 141(3)',
        rules: 'ICAI SQC 1; ICAI Code of Ethics (Revised 2020)',
        caroClause: 'Sec 141(3) Disqualification Review',
        deliverable: 'Form ADT-1 (Eligibility Certificate)',
        objective: 'Ensuring no financial interest, indebtedness (> ₹5L), or relative relationships disqualify the signing auditor under Section 141.',
      },
      {
        id: '1.3',
        name: '3. Non-Audit Services Disallowance Audit',
        section: 'Section 144',
        rules: 'Code of Ethics Part-1; NFRA Disciplinary Guidelines',
        caroClause: 'Sec 143(3) Statutory Disclosures',
        deliverable: 'Section 144 Independence Attestation Memo',
        objective: 'Certifying that the CA firm renders no prohibited services (bookkeeping, internal audit, investment banking, or outsourced financial services) to the client or its holding/subsidiary entities.',
      },
      {
        id: '1.4',
        name: '4. Predecessor Auditor Resignation Review',
        section: 'Section 140(2), Section 140(3)',
        rules: 'Rule 8 of Companies (Audit & Auditors) Rules, 2014; SA 300',
        caroClause: 'CARO 2020 Clause 3(xviii)',
        deliverable: 'Form ADT-3 Review Dossier',
        objective: 'Inspecting reasons, reservations, or disputes stated by the outgoing predecessor auditor in their resignation filing before accepting engagement.',
      },
      {
        id: '1.5',
        name: '5. Statutory Engagement Contracting',
        section: 'Section 139',
        rules: 'ICAI SA 210 (Agreeing the Terms of Audit Engagements)',
        caroClause: 'Standard Audit Framework Acceptance',
        deliverable: 'Signed ICAI SA 210 Engagement Letter',
        objective: 'Formalizing the audit scope, objective, management responsibilities, applicable financial reporting framework, and audit fee structure.',
      },
    ],
  },
  asset_verification: {
    title: 'Module 2: Substantive Asset Verification & Title Due Diligence',
    description: 'Focuses on physical and documentary verification of the balance sheet’s non-current and working assets, title holdings, and regulatory prohibitions.',
    subTracks: [
      {
        id: '2.1',
        name: '1. Property, Plant & Immovable Assets Registry',
        section: 'Section 143(1)(a)',
        rules: 'Rule 3 of Companies (Accounts) Rules, 2014; Ind AS 16 / AS 10',
        caroClause: 'CARO 2020 Clause 3(i)(a), 3(i)(b), 3(i)(c)',
        deliverable: 'Schedule III PPE & Intangible Assets Schedule',
        objective: 'Auditing the Fixed Asset Register (FAR), physical count cycles, quantitative reconciliation, and confirming title deeds of all immovable properties stand strictly in the company’s legal name.',
      },
      {
        id: '2.2',
        name: '2. Benami Property & Regulatory Proceedings',
        section: 'Prohibition of Benami Property Transactions Act, 1988',
        rules: 'Section 2(8), Section 2(9)(D) of Benami Act; ICAI Guidance Note',
        caroClause: 'CARO 2020 Clause 3(i)(d)',
        deliverable: 'Benami Proceeding Disclosure Statement',
        objective: 'Verifying court proceedings or notices initiated against the company for holding Benami properties, confirming appropriate disclosure or liability provision in accounts.',
      },
      {
        id: '2.3',
        name: '3. Inventory Physical Count & Discrepancies',
        section: 'Section 143(1)',
        rules: 'ICAI SA 501 (Audit Evidence - Specific Considerations for Inventory)',
        caroClause: 'CARO 2020 Clause 3(ii)(a)',
        deliverable: 'Physical Stock Verification Sheet (SA 501)',
        objective: 'Assessing physical inventory verification procedures conducted by management and reporting material discrepancies exceeding 10% or more in aggregate for each class of stock.',
      },
      {
        id: '2.4',
        name: '4. Bank Stock & Book Debt Reconciliations',
        section: 'Section 179, Section 180(1)(c)',
        rules: 'RBI Master Directions on Working Capital; ICAI Guidance on Credit Facilities',
        caroClause: 'CARO 2020 Clause 3(ii)(b)',
        deliverable: 'Quarterly Stock vs Bank Return Variance Schedule',
        objective: 'Auditing quarterly stock and book-debt statements submitted to banks for sanctioned working-capital limits (> ₹5 Cr) against accounting ledgers, reporting all differences.',
      },
      {
        id: '2.5',
        name: '5. Capital Work-in-Progress (CWIP) & Impairment',
        section: 'Section 143(3)',
        rules: 'Schedule III (Division I & II); Ind AS 36 / AS 28 (Impairment)',
        caroClause: 'CARO 2020 Clause 3(i)(e)',
        deliverable: 'CWIP / Intangible Aging Schedule (<1, 1-2, 2-3, >3 yrs)',
        objective: 'Scrutinizing suspended capital projects, cost overruns against original approved budgets, completion timelines, and testing for asset impairment losses.',
      },
    ],
  },
  liabilities_solvency: {
    title: 'Module 3: Corporate Liabilities, Solvency & Liquidity Assurance',
    description: 'Focuses on verifying third-party debt covenants, public deposits, financial solvency risks, and statutory remittances.',
    subTracks: [
      {
        id: '3.1',
        name: '1. Public Deposit & Unsecured Loan Controls',
        section: 'Sections 73, 74, 75, 76',
        rules: 'Companies (Acceptance of Deposits) Rules, 2014; RBI Act NBFC Rules',
        caroClause: 'CARO 2020 Clause 3(v)',
        deliverable: 'Form DPT-3 Audit Review Copy',
        objective: 'Verifying compliance with credit-rating mandates, deposit repayment reserves, and confirming deemed deposits from directors/shareholders follow statutory limits.',
      },
      {
        id: '3.2',
        name: '2. Debt Repayment Defaults & Wilful Defaulter Scrutiny',
        section: 'Section 143(1)',
        rules: 'RBI Master Circular on Wilful Defaulters; Companies Act Sec 180',
        caroClause: 'CARO 2020 Clause 3(ix)(a), 3(ix)(b)',
        deliverable: 'Lender-Wise Default & Restructuring Table',
        objective: 'Auditing defaults in repayment of principal and interest to banks, financial institutions, or debenture holders, and verifying if the company was declared a Wilful Defaulter.',
      },
      {
        id: '3.3',
        name: '3. Fund Diversion & Short-Term Loan Utilization',
        section: 'Section 143(1)(a)',
        rules: 'ICAI Guidance Note on Audit of Borrowings; RBI End-Use Guidelines',
        caroClause: 'CARO 2020 Clause 3(ix)(c), 3(ix)(d), 3(ix)(e)',
        deliverable: 'End-Use of Borrowings Verification Report',
        objective: 'Proving term loans were utilized solely for sanctioned purposes and verifying that short-term loans were not funneled into long-term capital investments or subsidiary financing.',
      },
      {
        id: '3.4',
        name: '4. Undisputed & Litigated Statutory Dues',
        section: 'Section 143(3)',
        rules: "Employees' PF Act, ESI Act, CGST Act, Income Tax Act",
        caroClause: 'CARO 2020 Clause 3(vii)(a), 3(vii)(b)',
        deliverable: 'Statutory Dues Outstanding (>6 Months) Schedule',
        objective: 'Compiling undisputed statutory liabilities unpaid for more than 6 months from due date, along with disputed statutory demands pending before appellate authorities (CIT(A), ITAT, High Court).',
      },
      {
        id: '3.5',
        name: '5. Going Concern & 12-Month Solvency Assessment',
        section: 'Section 134(5)',
        rules: 'ICAI SA 570 (Revised) Going Concern; Schedule III Financial Ratios',
        caroClause: 'CARO 2020 Clause 3(xix)',
        deliverable: '12-Month Solvency Assessment Memo (SA 570)',
        objective: 'Evaluating financial ratios (Current, Debt-Equity, Debt Service Coverage), asset-liability realization schedules, and board plans to confirm operational capability for the next 12 months.',
      },
    ],
  },
  related_parties: {
    title: 'Module 4: Related Parties, Corporate Capital & Statutory Fraud',
    description: 'Focuses on detecting capital misallocations, director loans, undisclosed income, preferential issues, and white-collar fraud investigations.',
    subTracks: [
      {
        id: '4.1',
        name: '1. Preferential Issue & Private Placement Scrutiny',
        section: 'Section 42, Section 62',
        rules: 'Companies (Prospectus & Allotment of Securities) Rules, 2014',
        caroClause: 'CARO 2020 Clause 3(x)(a), 3(x)(b)',
        deliverable: 'Form PAS-3 / PAS-4 Compliance Review Memo',
        objective: 'Confirming equity/convertible funds raised via private placement complied with Section 42/62 rules and proceeds were used strictly for stated prospectus objectives.',
      },
      {
        id: '4.2',
        name: '2. Director Loans & Cross-Entity Investments',
        section: 'Section 185, Section 186',
        rules: 'Companies (Meetings of Board & its Powers) Rules, 2014',
        caroClause: 'CARO 2020 Clause 3(iv), Clause 3(iii)',
        deliverable: 'Sec 185 / 186 Loan & Guarantee Register (Form MBP-2)',
        objective: 'Auditing director loans, inter-corporate deposits, guarantees, and securities to ensure they fall within the 60% paid-up capital or 100% free reserves ceiling limits.',
      },
      {
        id: '4.3',
        name: '3. Related Party Contract Approvals',
        section: 'Section 177, Section 188',
        rules: 'Rule 15 of Companies (Meetings of Board) Rules; Ind AS 24 / AS 18',
        caroClause: 'CARO 2020 Clause 3(xiii)',
        deliverable: 'Form AOC-2 Compliance Verification Schedule',
        objective: "Verifying Audit Committee omnibus approvals, Board/Shareholder resolutions, arm's length pricing evidence, and related-party disclosure completeness.",
      },
      {
        id: '4.4',
        name: '4. Undisclosed Income & Search Surrenders',
        section: 'Section 143(3)',
        rules: 'Income Tax Act, 1961 (Search u/s 132 / Survey u/s 133A)',
        caroClause: 'CARO 2020 Clause 3(viii)',
        deliverable: 'Tax Surrendered Income Reconciliation Note',
        objective: 'Confirming that undisclosed or unrecorded income surrendered during income-tax search/survey assessments has been recorded in the books of accounts during the year.',
      },
      {
        id: '4.5',
        name: '5. Statutory Fraud Detection & MCA Reporting',
        section: 'Section 143(12), Section 447',
        rules: 'Rule 13 of Companies (Audit & Auditors) Rules, 2014; ICAI SA 240',
        caroClause: 'CARO 2020 Clause 3(xi)(a), 3(xi)(b), 3(xi)(c)',
        deliverable: 'Form ADT-4 (Whistleblower & Fraud Dossier to MCA)',
        objective: 'Investigating frauds by/on the company, evaluating whistleblower grievances, and executing mandatory reporting of frauds (≥ ₹1 Cr) to the Central Government within 60 days.',
      },
    ],
  },
  audit_opinion: {
    title: 'Module 5: Audit Opinion, Regulatory Closures & Archival',
    description: 'Focuses on final financial reporting, Internal Financial Controls (IFC) certification, CSR audit compliance, audit opinion formation, and tamper-proof archival.',
    subTracks: [
      {
        id: '5.1',
        name: '1. Internal Financial Controls over Reporting (ICFR)',
        section: 'Section 143(3)(i)',
        rules: 'ICAI Guidance Note on Audit of Internal Financial Controls',
        caroClause: "Annexure to Independent Auditor's Report (IFC Opinion)",
        deliverable: 'IFC Adequacy & Operating Effectiveness Report',
        objective: 'Testing design and operational effectiveness of enterprise IT general controls, financial authorization workflows, and segregation of duties (SoD).',
      },
      {
        id: '5.2',
        name: '2. Corporate Social Responsibility (CSR) Audit',
        section: 'Section 135',
        rules: 'Companies (CSR Policy) Rules, 2014; ICAI Technical Guidance Note',
        caroClause: 'CARO 2020 Clause 3(xx)(a), 3(xx)(b)',
        deliverable: 'Form CSR-1 / CSR-2 Working Paper Schedule',
        objective: 'Verifying calculation of 2% average net profits under Section 198, tracking unspent ongoing project funds transferred to Section 135(6) accounts within 30 days.',
      },
      {
        id: '5.3',
        name: '3. Management Representations & Subsequent Events',
        section: 'Section 143(2)',
        rules: 'ICAI SA 580 (Written Representations); ICAI SA 560 (Subsequent Events)',
        caroClause: 'General Substantive Review Procedures',
        deliverable: 'Signed Management Representation Letter (MRL)',
        objective: 'Obtaining written management attestations regarding full record disclosure, absence of unrecorded liabilities, and reviewing material financial events occurring after balance sheet date.',
      },
      {
        id: '5.4',
        name: '4. Independent Auditor’s Report Formulation',
        section: 'Section 143(2), Section 143(3)',
        rules: 'ICAI SA 700 (Unmodified), SA 705 (Modifications), SA 706 (Emphasis of Matter)',
        caroClause: 'Full Statutory Audit Sign-off',
        deliverable: 'Independent Auditor’s Report + Full CARO Annexure',
        objective: 'Drafting the formal audit opinion (Unqualified, Qualified, Adverse, or Disclaimer of Opinion) covering True & Fair view, Rule 11 statutory clauses, and CARO disclosures.',
      },
      {
        id: '5.5',
        name: '5. Digital Identity Attestation & 7-Year Lock',
        section: 'Section 128(5)',
        rules: 'Gazette No. 1-CA(7)/192/2019; ICAI Peer Review Board Rules',
        caroClause: 'ICAI Mandatory Document Tracking',
        deliverable: 'UDIN Registration Certificate + Sealed Archival Hash',
        objective: 'Generating the mandatory 18-digit Unique Document Identification Number (UDIN) on the ICAI portal, locking the audit file, and enforcing the statutory 7-year retention rule under Section 128(5).',
      },
    ],
  },
};

export default function StatutoryFinancialAuditSuite() {
  // Active Tab state: 'rule11' | 'smart_vouching' | 'fixed_asset' | 'bank_brs' | 'governance' | 'asset_verification' | 'liabilities_solvency' | 'related_parties' | 'audit_opinion'
  const [activeSuiteTab, setActiveSuiteTab] = useState('rule11');

  const activeModuleData = STATUTORY_AUDIT_MODULES[activeSuiteTab];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold">📄</span>
            <h2 className="text-base font-black text-gray-900 tracking-tight">
              Statutory Financial Audit Suite
            </h2>
            <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
              ICAI CA STANDARD
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Prove a 'true and fair view' under Section 143 of the Companies Act and Indian Accounting Standards (Ind AS).
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10px] font-black text-amber-800">
              <span>📦</span>
              <span>Core Deliverable: Rule 11(g) Audit Trail Certificate &amp; Statutory Filing Dossier</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9 TABS IN A SINGLE RESPONSIVE / HORIZONTALLY SCROLLABLE ROW              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 overflow-x-auto text-xs whitespace-nowrap">
        {/* Tab 1 */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('rule11')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'rule11'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Rule 11(g) Vault &amp; Certificate
        </button>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('smart_vouching')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'smart_vouching'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Smart Vouching &amp; Sampler
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('fixed_asset')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'fixed_asset'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Fixed Asset &amp; Depreciation
        </button>

        {/* Tab 4 */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('bank_brs')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'bank_brs'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Direct Bank BRS Engine
        </button>

        {/* ❌ REMOVED: SA 230 Working Paper Packager */}

        {/* Tab 5 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('governance')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'governance'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Corporate Governance, Appointment &amp; Pre-Audit Controls
        </button>

        {/* Tab 6 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('asset_verification')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'asset_verification'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Substantive Asset Verification &amp; Title Due Diligence
        </button>

        {/* Tab 7 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('liabilities_solvency')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'liabilities_solvency'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Corporate Liabilities, Solvency &amp; Liquidity Assurance
        </button>

        {/* Tab 8 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('related_parties')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'related_parties'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Related Parties, Corporate Capital &amp; Statutory Fraud
        </button>

        {/* Tab 9 (NEW) */}
        <button
          type="button"
          onClick={() => setActiveSuiteTab('audit_opinion')}
          className={`px-3 py-2 rounded-xl font-bold transition-all ${
            activeSuiteTab === 'audit_opinion'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Audit Opinion, Regulatory Closures &amp; Archival
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT PANELS                                                       */}
      {/* ========================================================================= */}

      {/* Existing Tabs 1–4 Content */}
      {activeSuiteTab === 'rule11' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">
              Immutable Rule 11(g) Audit-Log Vault &amp; Certificate
            </h3>
            <button type="button" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs">
              ↓ 1-Click Rule 11(g) Report (.PDF)
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-xs text-gray-600 space-y-1">
            <p className="text-emerald-700 font-bold">[SYSTEM STATUS] Rule 11(g) Audit Logging: ACTIVE &amp; IMMUTABLE (Zero Downtime / Zero Tampering)</p>
            <p>• 2026-09-09 14:22:01 | User: accounts@bnxmail.com | Table: vouchers | Action: UPDATE | Field: amount | old: ₹45,000 → new: ₹50,000</p>
            <p>• 2026-09-09 11:15:40 | User: admin@bnxmail.com | Table: ledger_entries | Action: CREATE | Record ID: #8912 | Status: Verified</p>
          </div>
        </div>
      )}

      {activeSuiteTab === 'smart_vouching' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Smart Vouching &amp; Sampler Engine Loaded.
        </div>
      )}

      {activeSuiteTab === 'fixed_asset' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Fixed Asset &amp; Depreciation Register Loaded.
        </div>
      )}

      {activeSuiteTab === 'bank_brs' && (
        <div className="p-8 text-center text-xs text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-gray-100">
          Direct Bank BRS Engine Loaded.
        </div>
      )}

      {/* Render Structured Section Tables for Modules 1 to 5 (Tabs 5 to 9) */}
      {activeModuleData && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
            <h3 className="text-sm font-black text-gray-900">{activeModuleData.title}</h3>
            <p className="text-xs text-gray-600 font-medium">{activeModuleData.description}</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-2xs">
            <table className="w-full text-left border-collapse table-fixed text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-[20%]">Sub-Track</th>
                  <th className="py-3 px-3 w-[15%]">Section (Companies Act, 2013)</th>
                  <th className="py-3 px-3 w-[20%]">Mandatory Rules &amp; Standards</th>
                  <th className="py-3 px-3 w-[15%]">CARO 2020 / Audit Clause</th>
                  <th className="py-3 px-3 w-[12%]">Statutory Deliverable / Form</th>
                  <th className="py-3 px-3 w-[18%]">Core Audit Verification Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeModuleData.subTracks.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900 align-top">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 font-semibold text-blue-700 align-top">
                      {row.section}
                    </td>
                    <td className="py-3 px-3 text-gray-600 align-top">
                      {row.rules}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-800 align-top">
                      {row.caroClause}
                    </td>
                    <td className="py-3 px-3 align-top">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10px]">
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
