import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

// Blocks minus sign (-), plus sign (+), and exponential 'e' from keydown
export const preventNegativeKeys = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
};

// Sanitizes positive numbers on paste or manual change
export const sanitizePositiveInput = (setter) => (e) => {
  const val = e.target.value;
  if (val === '') {
    setter('');
    return;
  }
  const cleanVal = Math.max(0, parseFloat(val) || 0);
  setter(cleanVal);
};

export default function ProcessMonthlyPayrollModal({
  isOpen,
  onClose,
  onProcessSubmitted,
  employees = [],
  currency = { symbol: '₹' }
}) {
  const [payForm, setPayForm] = useState({
    employee_name: '',
    employee_id: '',
    basic_salary: '',
    hra_amount: '',
    special_allowance: '',
    bonus_amount: '',
    apply_pf: true,
    esi_deduction: '',
    tds_deduction: ''
  });

  if (!isOpen) return null;

  const handleFieldChange = (field) => (e) => {
    const val = e.target.value;
    if (val === '') {
      setPayForm((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const cleanVal = Math.max(0, parseFloat(val) || 0);
    setPayForm((prev) => ({ ...prev, [field]: cleanVal }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onProcessSubmitted) {
      onProcessSubmitted(payForm);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 className="text-base font-black text-[#064E3B] tracking-tight">
              Process Monthly Payroll
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Select Employee */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Select Employee *
            </label>
            <select
              required
              value={payForm.employee_name}
              onChange={(e) => {
                const selName = e.target.value;
                const sel = employees.find(
                  (s) => (s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()) === selName
                );
                setPayForm((prev) => ({
                  ...prev,
                  employee_name: selName,
                  employee_id: sel ? (sel.id || sel.employee_id) : '',
                  basic_salary: sel && (sel.salary || sel.basic_salary) ? (sel.salary || sel.basic_salary) : prev.basic_salary
                }));
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            >
              <option value="">-- Select Staff Member --</option>
              {employees.map((s) => {
                const id = s.id || s.employee_id || s._id;
                const name = s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
                const dept = s.department || s.department_name || 'Staff';
                return (
                  <option key={id} value={name}>
                    {name} ({dept})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Basic Base Salary & HRA Allowance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Basic Base Salary ({currency.symbol}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="e.g. 50000"
                value={payForm.basic_salary}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('basic_salary')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                HRA Allowance ({currency.symbol})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 5000"
                value={payForm.hra_amount}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('hra_amount')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Special Allowance & Bonus / Incentives */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Special Allowance
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 2000"
                value={payForm.special_allowance}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('special_allowance')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Bonus / Incentives
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 3000"
                value={payForm.bonus_amount}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('bonus_amount')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Statutory Deductions */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payForm.apply_pf}
                  onChange={(e) => setPayForm((prev) => ({ ...prev, apply_pf: e.target.checked }))}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <span>Deduct 12% PF</span>
              </label>
              <span className="text-[10px] text-gray-500 mt-1">
                {payForm.apply_pf
                  ? `Est: ${currency.symbol}${Math.round((parseFloat(payForm.basic_salary) || 0) * 0.12)}`
                  : 'PF Exempt'}
              </span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                ESI Deduction
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 325"
                value={payForm.esi_deduction}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('esi_deduction')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Estimated TDS
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 100"
                value={payForm.tds_deduction}
                onKeyDown={preventNegativeKeys}
                onChange={handleFieldChange('tds_deduction')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center cursor-pointer"
            >
              Confirm & Process Month Payout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
