import React, { useState, useEffect } from 'react';

export default function AddRecurringSubscriptionModal({ 
  isOpen, 
  onClose, 
  onCreateSubscription,
  initialData = null 
}) {
  const [subscriptionName, setSubscriptionName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoPost, setAutoPost] = useState('Active (Auto-Create)');
  const [status, setStatus] = useState('Active');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (initialData) {
      setSubscriptionName(initialData.subscription_name || '');
      setVendorName(initialData.vendor_name || initialData.payee_name || '');
      setCategory(initialData.category || initialData.category_name || 'Rent');
      setAmount(initialData.amount || initialData.expense_amount ? String(parseInt(initialData.amount || initialData.expense_amount, 10)) : '');
      setFrequency(initialData.frequency || initialData.recurring_type || 'Monthly');
      setNextDueDate(initialData.next_due_date || new Date().toISOString().split('T')[0]);
      setAutoPost(initialData.auto_post || (initialData.auto_create === 'Active' ? 'Active (Auto-Create)' : 'Manual Review'));
      setStatus(initialData.status || initialData.recurring_status || 'Active');
      setAmountError('');
    } else {
      setSubscriptionName('');
      setVendorName('');
      setCategory('Rent');
      setAmount('');
      setFrequency('Monthly');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setAutoPost('Active (Auto-Create)');
      setStatus('Active');
      setAmountError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // 1. Block decimal point '.', negative signs '-', '+', and 'e' at keystroke level
  const handleKeyDown = (e) => {
    if (e.key === '.' || e.key === 'Decimal' || e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // 2. Validate amount to allow only whole positive integers (no floats / decimals)
  const handleAmountChange = (e) => {
    const val = e.target.value;

    if (val === '') {
      setAmount('');
      setAmountError('');
      return;
    }

    // Check if user pasted a decimal value or <= 0
    if (val.includes('.')) {
      setAmount(val);
      setAmountError('Decimal / float amounts are not allowed. Please enter a whole amount.');
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setAmount(val);
      setAmountError('Amount must be a whole number of at least ₹1.');
    } else {
      setAmount(String(num));
      setAmountError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (String(amount).includes('.')) {
      setAmountError('Decimal / float amounts are not allowed.');
      return;
    }

    const intAmount = parseInt(amount, 10);
    if (isNaN(intAmount) || intAmount < 1) {
      setAmountError('Please enter a valid whole amount of at least ₹1.');
      return;
    }

    const payload = {
      subscription_name: subscriptionName,
      vendor_name: vendorName,
      payee_name: vendorName,
      category,
      category_name: category,
      amount: intAmount,
      expense_amount: intAmount,
      frequency,
      recurring_type: frequency,
      next_due_date: nextDueDate,
      auto_post: autoPost,
      auto_create: autoPost.includes('Auto') ? 'Active' : 'Inactive',
      status,
      recurring_status: status,
    };

    if (onCreateSubscription) {
      onCreateSubscription(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900 tracking-tight">
            {initialData ? 'Edit Recurring Subscription' : 'Add Recurring Subscription'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Subscription Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Subscription Name
            </label>
            <input
              type="text"
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              placeholder="e.g. AWS Cloud Server"
              required
            />
          </div>

          {/* Vendor Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              placeholder="e.g. Amazon Web Services"
              required
            />
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="Rent">Rent</option>
                <option value="Software / SaaS">Software / SaaS</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Legal & Professional">Legal & Professional</option>
                <option value="Advertising">Advertising</option>
              </select>
            </div>

            {/* WHOLE INTEGER AMOUNT (NO FLOATS ALLOWED) */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Amount (INR) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5000"
                value={amount}
                onKeyDown={handleKeyDown}
                onChange={handleAmountChange}
                className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none ${
                  amountError
                    ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                    : 'border-gray-200 focus:border-blue-600'
                }`}
                required
              />
            </div>
          </div>

          {amountError && (
            <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>{amountError}</span>
            </p>
          )}

          {/* Frequency & Next Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Auto-Post & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Auto-Post
              </label>
              <select
                value={autoPost}
                onChange={(e) => setAutoPost(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="Active (Auto-Create)">Active (Auto-Create)</option>
                <option value="Manual Review">Manual Review</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={Boolean(amountError) || !amount}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? 'Update Subscription' : 'Create Subscription'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export { AddRecurringSubscriptionModal };
