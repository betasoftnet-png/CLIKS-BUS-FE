import React, { useState } from 'react';
import LodgeStaffClaimModal from './LodgeStaffClaimModal';

export default function StaffReimbursements({ staffList = [], claims = [], onClaimSubmitted }) {
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">Staff Expense Reimbursements</h3>
          <p className="text-xs text-gray-500">Track and settle workforce expense claims.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsLodgeModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          + Lodge Staff Claim
        </button>
      </div>

      <LodgeStaffClaimModal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        staffList={staffList}
        onClaimSubmitted={(newClaim) => {
          if (onClaimSubmitted) onClaimSubmitted(newClaim);
          setIsLodgeModalOpen(false);
        }}
      />
    </div>
  );
}
export { StaffReimbursements };
