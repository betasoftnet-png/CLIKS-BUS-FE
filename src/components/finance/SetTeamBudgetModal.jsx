import React, { useState, useMemo, useEffect } from 'react';

export default function SetTeamBudgetModal({
  isOpen,
  onClose,
  onSettleBudget,
  initialMembers = [{ id: '38', name: 'Santhosh A', spent: 0 }],
  initialData = null,
}) {
  const [teamName, setTeamName] = useState('new');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [members, setMembers] = useState(initialMembers);
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTeamName(initialData.team_name || initialData.category_name || 'new');
      setMonthlyBudget(
        initialData.monthly_budget || initialData.budget_limit
          ? String(parseInt(initialData.monthly_budget || initialData.budget_limit, 10))
          : ''
      );
      let parsedMembers = [];
      if (initialData.members || initialData.team_members) {
        const raw = initialData.members || initialData.team_members;
        parsedMembers = typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
      if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
        setMembers(
          parsedMembers.map((m) => ({
            id: m.id || m.employee_id || 'EMP',
            name: m.name || 'Member',
            spent: Math.max(0, Math.abs(Number(m.spent) || 0)),
          }))
        );
      } else {
        setMembers(initialMembers);
      }
      setBudgetError('');
    } else {
      setTeamName('new');
      setMonthlyBudget('');
      setMembers(initialMembers);
      setBudgetError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // 1. Block negative sign (-), decimal point (.), and exponential (e) keys
  const handleKeyDown = (e) => {
    if (['-', '+', '.', 'e', 'E', 'Decimal'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // 2. Validate input to allow only whole positive integers (>= 1)
  const handleBudgetChange = (e) => {
    const val = e.target.value;

    if (val === '') {
      setMonthlyBudget('');
      setBudgetError('');
      return;
    }

    if (val.includes('.') || val.includes('-')) {
      setBudgetError('Decimal fractions and negative budgets are not allowed.');
      return;
    }

    const intVal = parseInt(val, 10);
    if (isNaN(intVal) || intVal < 1) {
      setMonthlyBudget(val);
      setBudgetError('Budget must be a whole positive number of at least ₹1.');
    } else {
      setMonthlyBudget(String(intVal));
      setBudgetError('');
    }
  };

  // 3. Guaranteed non-negative, whole-number employee budget share
  const memberBudgetShare = useMemo(() => {
    const total = parseInt(monthlyBudget, 10);
    if (isNaN(total) || total <= 0 || members.length === 0) return 0;
    return Math.floor(total / members.length);
  }, [monthlyBudget, members]);

  const handleSettleBudget = (e) => {
    e.preventDefault();

    const numericBudget = parseInt(monthlyBudget, 10);
    if (isNaN(numericBudget) || numericBudget < 1 || String(monthlyBudget).includes('.')) {
      setBudgetError('Please provide a valid whole positive budget target.');
      return;
    }

    const sanitizedMembers = members.map((m) => ({
      ...m,
      employee_id: m.id || m.employee_id,
      spent: Math.max(0, Math.abs(Number(m.spent) || 0)), // Ensure spent values never render or submit negative
    }));

    const payload = {
      team_name: teamName,
      category_name: teamName,
      monthly_budget: numericBudget,
      budget_limit: String(numericBudget),
      member_budget_share: memberBudgetShare,
      members: sanitizedMembers,
      team_members: sanitizedMembers,
    };

    if (onSettleBudget) {
      onSettleBudget(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900 tracking-tight">
            {initialData ? 'Edit Team Budget' : 'Set Team Budget'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSettleBudget} className="space-y-4">
          {/* Team / Department Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Team / Department Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
              required
            />
          </div>

          {/* Monthly Budget (INR) */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Monthly Budget (INR) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 50000"
              value={monthlyBudget}
              onKeyDown={handleKeyDown}
              onChange={handleBudgetChange}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none ${
                budgetError
                  ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-200 focus:border-purple-600'
              }`}
              required
            />
            {budgetError && (
              <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                <span>⚠️</span>
                <span>{budgetError}</span>
              </p>
            )}
          </div>

          {/* Team Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Team Members ({members.length})
              </span>
              <button
                type="button"
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                + Add Member
              </button>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
                  <tr>
                    <th className="py-2 px-3">Employee ID</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Spent</th>
                    <th className="py-2 px-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((mem) => {
                    // Normalize spent values to absolute positive numbers
                    const sanitizedSpent = Math.max(0, Math.abs(Number(mem.spent) || 0));
                    return (
                      <tr key={mem.id} className="font-semibold text-gray-700">
                        <td className="py-2.5 px-3">{mem.id}</td>
                        <td className="py-2.5 px-3">{mem.name}</td>
                        <td className="py-2.5 px-3 text-gray-600">₹{sanitizedSpent}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setMembers(members.filter((m) => m.id !== mem.id))}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EMPLOYEE BUDGET SHARE CARD */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">
                EMPLOYEE BUDGET SHARE
              </span>
              <span className="text-xs font-black text-purple-800">
                ₹{memberBudgetShare.toLocaleString('en-IN')}/member
              </span>
            </div>

            {members.map((mem) => (
              <div
                key={mem.id}
                className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-purple-50 text-gray-700"
              >
                <span className="font-semibold">
                  {mem.name} ({mem.id})
                </span>
                <span className="font-bold text-gray-900">
                  ₹{memberBudgetShare.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Settle Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={Boolean(budgetError) || !monthlyBudget}
              className="w-full py-3 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Settle Budget Target
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export { SetTeamBudgetModal };
