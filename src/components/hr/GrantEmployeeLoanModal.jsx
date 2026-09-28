import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';

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

export default function GrantEmployeeLoanModal({
  isOpen,
  onClose,
  onLoanGranted,
  employees = [],
  currency = { symbol: '₹' }
}) {
  const [loanForm, setLoanForm] = useState({
    employee_name: '',
    loan_amount: '',
    emi_amount: '',
    deduction_months: '',
    salary_advance: ''
  });

  if (!isOpen) return null;

  const handleLoanAmountChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setLoanForm((prev) => ({ ...prev, loan_amount: '' }));
      return;
    }
    const cleanAmt = Math.max(0, parseFloat(raw) || 0);
    setLoanForm((prev) => {
      const emi = parseFloat(prev.emi_amount);
      const loan = parseFloat(cleanAmt);
      const months = loan > 0 && emi > 0 ? Math.ceil(loan / emi) : prev.deduction_months;
      return { ...prev, loan_amount: cleanAmt, deduction_months: months };
    });
  };

  const handleEmiChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setLoanForm((prev) => ({ ...prev, emi_amount: '' }));
      return;
    }
    const cleanEmi = Math.max(0, parseFloat(raw) || 0);
    setLoanForm((prev) => {
      const emi = parseFloat(cleanEmi);
      const loan = parseFloat(prev.loan_amount);
      const months = loan > 0 && emi > 0 ? Math.ceil(loan / emi) : prev.deduction_months;
      return { ...prev, emi_amount: cleanEmi, deduction_months: months };
    });
  };

  const handlePeriodChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setLoanForm((prev) => ({ ...prev, deduction_months: '' }));
      return;
    }
    const cleanMonths = Math.max(0, parseFloat(raw) || 0);
    const loanAmt = parseFloat(loanForm.loan_amount);
    if (cleanMonths > 0 && loanAmt > 0) {
      const emi = Math.round((loanAmt / cleanMonths) * 100) / 100;
      setLoanForm((prev) => ({ ...prev, emi_amount: String(emi), deduction_months: cleanMonths }));
    } else {
      setLoanForm((prev) => ({ ...prev, deduction_months: cleanMonths }));
    }
  };

  const handleSalaryAdvanceChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setLoanForm((prev) => ({ ...prev, salary_advance: '' }));
      return;
    }
    const cleanAdvance = Math.max(0, parseFloat(raw) || 0);
    setLoanForm((prev) => ({ ...prev, salary_advance: cleanAdvance }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoanGranted) {
      onLoanGranted(loanForm);
    }
    onClose();
  };

  const loanAmt = parseFloat(loanForm.loan_amount) || 0;
  const emiAmt = parseFloat(loanForm.emi_amount) || 0;
  const computedMonths = loanAmt > 0 && emiAmt > 0 ? Math.ceil(loanAmt / emiAmt) : 0;
  const fullMonths = loanAmt > 0 && emiAmt > 0 ? Math.floor(loanAmt / emiAmt) : 0;
  const remainder = loanAmt > 0 && emiAmt > 0 ? Math.round((loanAmt - fullMonths * emiAmt) * 100) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <h3 className="text-base font-black text-[#064E3B] tracking-tight">
              Grant Employee Loan
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
          {/* Employee Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Employee Name *
            </label>
            <select
              required
              value={loanForm.employee_name}
              onChange={(e) => setLoanForm((prev) => ({ ...prev, employee_name: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((r) => {
                const id = r.id || r.employee_id || r._id;
                const name = r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim();
                const dept = r.department || r.department_name || 'Staff';
                return (
                  <option key={id} value={name}>
                    {name} ({dept})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Loan Amount & Monthly EMI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Loan Amount ({currency.symbol}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="e.g. 20000"
                value={loanForm.loan_amount}
                onKeyDown={preventNegativeKeys}
                onChange={handleLoanAmountChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Monthly EMI ({currency.symbol}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="e.g. 2000"
                value={loanForm.emi_amount}
                onKeyDown={preventNegativeKeys}
                onChange={handleEmiChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Loan Deduction Period */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Loan Deduction Period (Months)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 10"
              value={
                loanForm.deduction_months !== undefined && loanForm.deduction_months !== ''
                  ? loanForm.deduction_months
                  : (loanAmt > 0 && emiAmt > 0 ? computedMonths : '')
              }
              onKeyDown={preventNegativeKeys}
              onChange={handlePeriodChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            />
            {loanAmt > 0 && emiAmt > 0 && (
              <span className="text-[11px] text-emerald-800 font-bold mt-1 block">
                {remainder > 0
                  ? `🗓️ Deduction Period: ${fullMonths} cycles @ ${currency.symbol}${emiAmt} + final cycle @ ${currency.symbol}${remainder} (${computedMonths} Months total)`
                  : `🗓️ Deduction Period: ${computedMonths} cycles @ ${currency.symbol}${emiAmt}/month (${computedMonths} Months total)`}
              </span>
            )}
          </div>

          {/* Immediate Salary Advance */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Immediate Salary Advance ({currency.symbol})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 5000"
              value={loanForm.salary_advance}
              onKeyDown={preventNegativeKeys}
              onChange={handleSalaryAdvanceChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center cursor-pointer"
            >
              Settle Granted Loan Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
