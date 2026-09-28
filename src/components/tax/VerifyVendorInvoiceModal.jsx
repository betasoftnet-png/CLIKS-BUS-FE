import React, { useState } from 'react';

export default function VerifyVendorInvoiceModal({
  isOpen,
  onClose,
  onSettleReconciliation,
  defaultGstin = '27AAAAA1111A1Z1',
  defaultVendor = 'Acme Hardwares',
}) {
  const [gstin] = useState(defaultGstin);
  const [vendorName] = useState(defaultVendor);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [gstRate, setGstRate] = useState('18% GST');
  const [matchStatus, setMatchStatus] = useState('PENDING');
  const [amountError, setAmountError] = useState('');

  if (!isOpen) return null;

  // 1. Block decimal point (.), minus (-), plus (+), and exponential (e) keys
  const handleKeyDown = (e) => {
    if (['.', 'Decimal', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // 2. Disallow float (0.01) values and validate whole positive integer (>= 1)
  const handleAmountChange = (e) => {
    const val = e.target.value;

    if (val === '') {
      setInvoiceAmount('');
      setAmountError('');
      return;
    }

    if (val.includes('.')) {
      setInvoiceAmount(val);
      setAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
      return;
    }

    const intVal = parseInt(val, 10);
    if (isNaN(intVal) || intVal < 1) {
      setInvoiceAmount(val);
      setAmountError('Invoice amount must be a whole positive number of at least ₹1.');
    } else {
      setInvoiceAmount(String(intVal));
      setAmountError('');
    }
  };

  const handleSettleReconciliation = (e) => {
    e.preventDefault();

    if (String(invoiceAmount).includes('.')) {
      setAmountError('Float / decimal amounts (e.g. 0.01) are not allowed.');
      return;
    }

    const parsedInt = parseInt(invoiceAmount, 10);
    if (isNaN(parsedInt) || parsedInt < 1) {
      setAmountError('Please enter a valid whole invoice total amount.');
      return;
    }

    const payload = {
      vendor_gstin: gstin,
      vendor_name: vendorName,
      invoice_amount: parsedInt,
      gst_rate: gstRate,
      reconciliation_status: matchStatus,
    };

    if (onSettleReconciliation) {
      onSettleReconciliation(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">
              Verify Vendor Invoice
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              GSTR-2B ITC RECONCILIATION
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSettleReconciliation} className="space-y-3.5">
          {/* Vendor GSTIN & Vendor Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Vendor GSTIN
              </label>
              <input
                type="text"
                value={gstin}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                value={vendorName}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* INVOICE TOTAL AMOUNT (NO FLOATS PERMITTED) */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Invoice Total Amount (INR) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5000"
              value={invoiceAmount}
              onKeyDown={handleKeyDown}
              onChange={handleAmountChange}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none ${
                amountError
                  ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-200 focus:border-blue-600'
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

          {/* GST Rate % & Match GSTR-2B */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                GST Rate %
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="18% GST">18% GST</option>
                <option value="12% GST">12% GST</option>
                <option value="5% GST">5% GST</option>
                <option value="28% GST">28% GST</option>
                <option value="0% GST">0% GST</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Match GSTR-2B
              </label>
              <select
                value={matchStatus}
                onChange={(e) => setMatchStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-emerald-700 font-bold focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="MATCHED">MATCHED</option>
                <option value="MISMATCHED">MISMATCHED</option>
              </select>
            </div>
          </div>

          {/* Settle Reconciliation Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={Boolean(amountError) || !invoiceAmount}
              className="w-full py-3 bg-[#1e40af] hover:bg-[#1d3bb0] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Settle Reconciliation Status
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
