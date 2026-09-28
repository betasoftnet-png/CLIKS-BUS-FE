import React, { useState, useEffect } from 'react';

export default function RecordDepartmentSpendingModal({ 
  isOpen, 
  onClose, 
  onSaveSpending, 
  members = [],
  categoryName = 'new'
}) {
  const [categoryTeamName, setCategoryTeamName] = useState(categoryName);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccount, setPaymentAccount] = useState('UPI / Net Banking');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (categoryName) {
      setCategoryTeamName(categoryName);
    }
  }, [categoryName]);

  useEffect(() => {
    if (!isOpen) {
      setAmountSpent('');
      setDescription('');
      setSelectedEmployee('');
      setAmountError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Block decimal point (.), minus (-), plus (+), and exponent (e) keys
  const handleKeyDown = (e) => {
    if (['.', 'Decimal', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // 2. Validate input to allow only whole positive integers (>= 1)
  const handleAmountChange = (e) => {
    const val = e.target.value;

    if (val === '') {
      setAmountSpent('');
      setAmountError('');
      return;
    }

    if (val.includes('.')) {
      setAmountSpent(val);
      setAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setAmountSpent(val);
      setAmountError('Amount spent must be a positive whole integer of at least ₹1.');
    } else {
      setAmountSpent(String(num));
      setAmountError('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (String(amountSpent).includes('.')) {
      setAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
      return;
    }

    const intAmount = parseInt(amountSpent, 10);
    if (isNaN(intAmount) || intAmount < 1) {
      setAmountError('Please provide a valid whole amount of at least ₹1.');
      return;
    }

    const payload = {
      team_name: categoryTeamName,
      category_name: categoryTeamName,
      employee_id: selectedEmployee,
      amount: intAmount,
      amount_spent: intAmount,
      description,
      spending_date: date,
      date,
      payment_account: paymentAccount,
      payment_mode: paymentAccount,
    };

    if (onSaveSpending) {
      onSaveSpending(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900 tracking-tight">
            Record Department Spending
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Category / Team Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Category / Team Name
            </label>
            <input
              type="text"
              value={categoryTeamName}
              onChange={(e) => setCategoryTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              required
            />
          </div>

          {/* Select Employee */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Select Employee *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-pink-600"
              required
            >
              <option value="">-- Choose Member --</option>
              {members.length > 0 ? (
                members.map((m) => (
                  <option key={m.id || m.employee_id} value={m.id || m.employee_id}>
                    {m.name} ({m.id || m.employee_id})
                  </option>
                ))
              ) : (
                <option value="38">Santhosh A (38)</option>
              )}
            </select>
          </div>

          {/* =================================================================== */}
          {/* AMOUNT SPENT (₹) FIELD WITH INTEGER VALIDATION                      */}
          {/* =================================================================== */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Amount Spent (₹) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 1500"
              value={amountSpent}
              onKeyDown={handleKeyDown}
              onChange={handleAmountChange}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none ${
                amountError
                  ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-200 focus:border-pink-600'
              }`}
              required
            />
            {amountError && (
              <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                <span>⚠️</span>
                <span>{amountError}</span>
              </p>
            )}
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Office Stationery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              required
            />
          </div>

          {/* Select Payment Account */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Select Payment Account
            </label>
            <select
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            >
              <option value="UPI / Net Banking">UPI / Net Banking</option>
              <option value="Corporate Card">Corporate Card</option>
              <option value="Petty Cash">Petty Cash</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={Boolean(amountError) || !amountSpent}
              className="w-full py-3 bg-[#be185d] hover:bg-[#9d174d] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Spending
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export { RecordDepartmentSpendingModal };
