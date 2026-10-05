import React, { useState } from 'react';
import { apiClient } from '../../api/client';

export default function LodgeStaffClaimModal({ isOpen, onClose, onClaimSubmitted, staffList = [] }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [staffId, setStaffId] = useState('');
  const [description, setDescription] = useState('');
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimTime, setClaimTime] = useState('12:00');
  const [claimAmount, setClaimAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  // Manage receipts with unique IDs to prevent re-render loops
  const [receipts, setReceipts] = useState([
    { id: 1, refNo: '', file: null, fileName: '', filePreview: '' }
  ]);

  if (!isOpen) return null;

  // Add new receipt row handler
  const handleAddReceipt = () => {
    setReceipts((prev) => [
      ...prev,
      { id: Date.now(), refNo: '', file: null, fileName: '', filePreview: '' }
    ]);
  };

  // Remove receipt row handler
  const handleRemoveReceipt = (idToRemove) => {
    setReceipts((prev) => prev.filter((r) => r.id !== idToRemove));
  };

  // Update specific receipt reference or file
  const handleReceiptChange = (id, field, value) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmitClaim = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const effectiveStaffId = staffId || staffList[0]?.id || staffList[0]?.employee_id || '';
    if (!effectiveStaffId) {
      setErrorMessage('Please select a staff member.');
      return;
    }

    const parsedAmount = parseInt(claimAmount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Claim amount must be greater than 0.');
      return;
    }

    try {
      setLoading(true);

      const selectedStaff = staffList.find(
        (s) =>
          String(s.id) === String(effectiveStaffId) ||
          String(s.staff_id) === String(effectiveStaffId) ||
          String(s.employee_id) === String(effectiveStaffId)
      ) || staffList[0];

      let businessId = 1;
      try {
        const activeBusiness = JSON.parse(
          localStorage.getItem('active_business') || localStorage.getItem('business') || '{}'
        );
        businessId = activeBusiness.id || localStorage.getItem('business_id') || 1;
      } catch (err) {}

      const resolvedName = selectedStaff
        ? `${selectedStaff.firstName || selectedStaff.first_name || ''} ${selectedStaff.lastName || selectedStaff.last_name || ''}`.trim() ||
          selectedStaff.name ||
          'Employee'
        : 'Employee';

      const refNumbers = receipts.map((r) => r.refNo.trim()).filter(Boolean);
      const fileNames = receipts.map((r) => r.fileName.trim()).filter(Boolean);
      const combinedReceipts = Array.from(new Set([...refNumbers, ...fileNames])).join(', ');

      const payload = {
        employee_id: selectedStaff?.id || selectedStaff?.employee_id || effectiveStaffId,
        staff_id: selectedStaff?.id || selectedStaff?.staff_id || effectiveStaffId,
        staffId: selectedStaff?.id || selectedStaff?.staff_id || effectiveStaffId,
        employee_name: resolvedName,
        staff_name: resolvedName,
        employee_code: selectedStaff?.employee_code || selectedStaff?.employee_id || 'CLK-001',
        department: selectedStaff?.department_name || selectedStaff?.department || 'Operations',
        category: description || 'Travel / Conveyance',
        claim_type: description || 'Travel / Conveyance',
        travel_expense: description || 'Staff Reimbursement',
        amount: parsedAmount,
        claim_amount: parsedAmount,
        expense_date: claimDate,
        claim_date: claimDate,
        date: claimDate,
        time: claimTime || '12:00',
        notes: description || 'Staff reimbursement claim',
        description: description || 'Staff reimbursement claim',
        status: 'Pending',
        reimbursement_status: 'Pending Approval',
        receipt: combinedReceipts || 'Manual Submission',
        receipt_url: null,
        business_id: businessId,
      };

      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      let response;
      try {
        response = await apiClient.post('/expenses/reimburse', payload);
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Lodge claim failed');
      }

      if (response && (response.status === 200 || response.status === 201 || response.data?.success)) {
        if (onClaimSubmitted) {
          onClaimSubmitted(response.data?.data || payload);
        }
        onClose();
      } else {
        throw new Error(response?.data?.message || 'Lodge claim failed');
      }
    } catch (err) {
      console.error('Reimbursement submission error:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Lodge claim failed';
      setErrorMessage(`Failed to submit reimbursement claim: ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      {/* 
        CONTAINER FIX:
        1. max-h-[90vh] prevents extending beyond browser window
        2. flex flex-col with overflow-y-auto ensures smooth scrolling
      */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* STICKY / FIXED MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white rounded-t-3xl">
          <h3 className="text-base font-black text-gray-900 tracking-tight">
            Lodge Staff Claim
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* Employee Profile Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Employee Profile Name
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            >
              {staffList.length === 0 ? (
                <option value="">Santhosh A (Operations)</option>
              ) : (
                staffList.map((emp) => {
                  const val = emp.id || emp.staff_id || emp.employee_id;
                  const name = emp.firstName || emp.first_name || emp.name;
                  const last = emp.lastName || emp.last_name || '';
                  const dept = emp.department_name || emp.department || 'Operations';
                  return (
                    <option key={val} value={val}>
                      {name} {last} ({dept})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Out-of-pocket Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Out-of-pocket Description
            </label>
            <input
              type="text"
              placeholder="e.g. Travel, meals, team stationery..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Date
              </label>
              <input
                type="date"
                value={claimDate}
                onChange={(e) => setClaimDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Time
              </label>
              <input
                type="time"
                value={claimTime}
                onChange={(e) => setClaimTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* Claim Amount with Negative Floor Guard */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Claim Amount (INR) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={claimAmount}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\./g, '');
                if (parseInt(val, 10) <= 0 || val.startsWith('-')) {
                  setAmountError('Claim amount must be greater than 0.');
                } else {
                  setAmountError('');
                }
                setClaimAmount(val);
              }}
              className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none ${
                amountError ? 'border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-emerald-600'
              }`}
              required
            />
            {amountError && (
              <p className="mt-1 text-[11px] font-bold text-red-500">{amountError}</p>
            )}
          </div>

          {/* ================================================================= */}
          {/* DYNAMIC MULTIPLE RECEIPTS SECTION                                 */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-2">
            {receipts.map((rcpt, index) => (
              <div key={rcpt.id} className="p-3 bg-gray-50/80 border border-gray-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-500">
                    Receipt / Reference #{index + 1} (Optional)
                  </span>
                  {receipts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReceipt(rcpt.id)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove Set
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref No, Bank Txn ID, Receipt No."
                    value={rcpt.refNo}
                    onChange={(e) => handleReceiptChange(rcpt.id, 'refNo', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                  />
                  <label className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer shrink-0">
                    <span>📎</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleReceiptChange(rcpt.id, 'file', file);
                          handleReceiptChange(rcpt.id, 'fileName', file.name);
                        }
                      }}
                    />
                  </label>
                </div>

                {rcpt.fileName && (
                  <div className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-700 font-semibold truncate max-w-[200px]">
                      📄 {rcpt.fileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleReceiptChange(rcpt.id, 'file', null);
                        handleReceiptChange(rcpt.id, 'fileName', '');
                      }}
                      className="text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* + Add Another Receipt Button */}
            <button
              type="button"
              onClick={handleAddReceipt}
              className="w-full py-2 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add Another Receipt / Proof</span>
            </button>
          </div>
        </div>

        {/* STICKY / FIXED SUBMIT BUTTON FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={handleSubmitClaim}
            disabled={Boolean(amountError) || !claimAmount || loading}
            className="w-full py-3 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting Claim...' : 'Lodge Reimbursement Claim'}
          </button>
        </div>

      </div>
    </div>
  );
}
export { LodgeStaffClaimModal };
