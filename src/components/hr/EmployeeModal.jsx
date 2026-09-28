import React, { useState, useMemo } from 'react';

export default function EmployeeProfileModal({ employee, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || employee?.first_name || '',
    lastName: employee?.lastName || employee?.last_name || '',
    dob: employee?.dob || employee?.date_of_birth || '',
    gender: employee?.gender || 'Male',
  });

  // 1. Calculate Yesterday's Date as max limit (blocks today & future dates)
  const maxDobDate = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }, []);

  // 2. Dynamic Age Calculator Helper
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    const today = new Date();

    if (isNaN(birthDate.getTime()) || birthDate >= today) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  }, [formData.dob]);

  const handleDobChange = (e) => {
    const selectedDate = e.target.value;
    const todayStr = new Date().toISOString().split('T')[0];

    // Reject today or future dates if manually entered
    if (selectedDate >= todayStr) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      dob: selectedDate,
    }));
  };

  if (isOpen === false) return null;

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* PERSONAL DETAILS SECTION                                              */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <span>👤</span> Personal Details
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* First Name & Last Name fields */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
            />
          </div>

          {/* DATE OF BIRTH FIELD WITH AGE INDICATOR */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Date of Birth
              </label>
              {calculatedAge !== null && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  Age: {calculatedAge} yrs
                </span>
              )}
            </div>
            <input
              type="date"
              max={maxDobDate}
              value={formData.dob}
              onChange={handleDobChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
export { EmployeeProfileModal };
