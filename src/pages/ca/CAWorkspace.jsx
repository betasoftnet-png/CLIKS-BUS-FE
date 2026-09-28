import React, { useState } from 'react';
import StatutoryFinancialAuditSuite from '../../components/ca/StatutoryFinancialAuditSuite';
import TaxAuditForm3CDHub from '../../components/ca/TaxAuditForm3CDHub';
import { COMING_SOON_ROLES } from '../BusinessCA';

export default function CAWorkspace() {
  // Navigation tabs: 'home' | 'clients' | 'tasks' | 'teams' | 'time_tracking' | 'workpaper' | 'statutory_financial_auditor' | 'consult' | 'reports'
  const [activeNav, setActiveNav] = useState('statutory_financial_auditor');
  const [selectedRole, setSelectedRole] = useState('statutory_ca');

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 space-y-5">
      
      {/* 1. TOP HEADER: SIGNING PARTNER / AUDITOR VERIFICATION BANNER */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-gray-900">Signing Partner / Auditor</h2>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                VERIFICATION REQUIRED
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
              Verify ICAI membership &amp; COP to enable automated UDIN generation &amp; statutory e-filing.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>🛡️</span>
          <span>Verify ICAI Credentials</span>
        </button>
      </div>

      {/* 2. ROLE BADGES ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('statutory_ca');
            setActiveNav('statutory_financial_auditor');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            selectedRole === 'statutory_ca'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Statutory Financial Auditor (ICAI CA)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('tax_ca')}
          className="px-3 py-1.5 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Tax Auditor (ICAI CA)</span>
        </button>

        <button
          type="button"
          className="px-3 py-1.5 rounded-xl font-bold text-gray-400 bg-white border border-gray-200 opacity-60 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Internal Auditor (CIA / CA / CMA)</span>
        </button>

        <button
          type="button"
          className="px-3 py-1.5 rounded-xl font-bold text-gray-400 bg-white border border-gray-200 opacity-60 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Cost Auditor (ICMAI CMA)</span>
        </button>

        <button
          type="button"
          className="px-3 py-1.5 rounded-xl font-bold text-gray-400 bg-white border border-gray-200 opacity-60 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Secretarial Auditor (ICSI CS)</span>
        </button>
      </div>

      {/* 3. PRACTICE NAVIGATION BAR */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center gap-1 overflow-x-auto shadow-2xs text-xs font-bold text-gray-500">
        <button
          type="button"
          onClick={() => setActiveNav('home')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'home' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          🏠 Home
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('clients')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'clients' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          👥 Clients
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('tasks')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'tasks' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          ☑️ Tasks
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('teams')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'teams' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          👤 Teams
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('time_tracking')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'time_tracking' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          ⏱️ Time Tracking
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('workpaper')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'workpaper' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          📑 Workpaper
        </button>

        {/* ACTIVE NAVIGATION TAB */}
        <button
          type="button"
          onClick={() => setActiveNav('statutory_financial_auditor')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeNav === 'statutory_financial_auditor'
              ? 'bg-[#0e4b34] text-white shadow-2xs font-black'
              : 'hover:text-gray-800'
          }`}
        >
          <span>🏛️</span>
          <span>Statutory Financial Auditor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav('consult')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'consult' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          💬 Consult
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('reports')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'reports' ? 'bg-[#0e4b34] text-white' : 'hover:text-gray-800'
          }`}
        >
          📊 Reports
        </button>
      </div>

      {/* 4. DYNAMIC CONTENT AREA */}
      {activeNav === 'statutory_financial_auditor' ? (
        <StatutoryFinancialAuditSuite />
      ) : (
        /* Standard Default CA Home Dashboard (Image 2) */
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-gray-400 block">TOTAL PRACTICE CLIENTS</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">0</span>
              <span className="text-[10px] text-gray-400">Active Taxpayers Portal</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-gray-400 block">AWAITING CLIENT UPLOADS</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">0</span>
              <span className="text-[10px] text-gray-400">Outbound requests pending</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-gray-400 block">OPEN COMPLIANCE TASKS</span>
              <span className="text-xl font-black text-rose-600 mt-1 block">0</span>
              <span className="text-[10px] text-gray-400">Filing checklist items</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-gray-400 block">TIMESHEET RECORDS</span>
              <span className="text-xl font-black text-blue-600 mt-1 block">0</span>
              <span className="text-[10px] text-gray-400">Logged consulting blocks</span>
            </div>
          </div>
          {/* Quick Actions & Activity Stream ... */}
        </div>
      )}

    </div>
  );
}

export { CAWorkspace, StatutoryFinancialAuditSuite, TaxAuditForm3CDHub, COMING_SOON_ROLES };
