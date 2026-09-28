import React, { useState } from 'react';
import { X, Calendar, Plus, Eye, User, Briefcase, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';

export function AttendanceSummarySection({ employee, onAttendanceUpdated }) {
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Construct attendance record without changing any API
      const record = {
        employee_id: employee?.id || employee?.employee_id || employee?.staff_id,
        date: attendanceDate,
        status,
        note,
      };

      // Notify parent/state to increment days present/leave taken and append to history
      if (onAttendanceUpdated) {
        onAttendanceUpdated(record);
      }
      setShowMarkModal(false);
      setNote('');
    } catch (err) {
      console.error('Failed to log attendance', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0fdf4]/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-700">📅</span>
          <h4 className="text-xs font-black text-emerald-950">
            Attendance &amp; Monthly Payout Summary
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* NEW: Mark Attendance Action */}
          <button
            type="button"
            onClick={() => setShowMarkModal(true)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>+</span>
            <span>Mark Attendance</span>
          </button>

          <button
            type="button"
            className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 rounded-xl text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
          >
            👁️ View All Records
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-emerald-100/80 text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 block">DAYS PRESENT</span>
          <span className="text-base font-black text-emerald-700">{employee?.daysPresent ?? employee?.days_present ?? 7}</span>
          <span className="text-[9px] text-gray-400 font-semibold block">This Month</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-emerald-100/80 text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 block">LEAVES TAKEN</span>
          <span className="text-base font-black text-rose-600">{employee?.leavesTaken ?? employee?.leaves_taken ?? 0}</span>
          <span className="text-[9px] text-gray-400 font-semibold block">This Month</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-emerald-100/80 text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 block">NET EST. PAYOUT</span>
          <span className="text-base font-black text-gray-900">₹{employee?.netPayout ?? employee?.net_payout ?? '3,000'}</span>
          <span className="text-[9px] text-gray-400 font-semibold block">After Deductions</span>
        </div>
      </div>

      {/* Inline Attendance Entry Dialog */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-3 relative animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h5 className="text-xs font-black text-gray-900">
                Log Attendance: {employee?.name || `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 'Staff Member'}
              </h5>
              <button
                type="button"
                onClick={() => setShowMarkModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                >
                  <option value="Present">Present (Full Day)</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">Approved Leave</option>
                  <option value="Absent">Unexcused Absent</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. On-site client meeting"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeProfileViewModal({
  isOpen,
  onClose,
  employee,
  onAttendanceUpdated
}) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {(employee.first_name || employee.name || 'E').charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                {employee.first_name} {employee.last_name || employee.name}
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                {employee.designation_name || employee.designation || 'Staff'} • {employee.department_name || employee.department || 'Operations'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Attendance & Monthly Payout Summary with Interactive Mark Attendance */}
          <AttendanceSummarySection
            employee={employee}
            onAttendanceUpdated={onAttendanceUpdated}
          />

          {/* Quick Details Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Employee ID</span>
              <span className="font-bold text-gray-900">{employee.employee_code || `CLK-00${employee.id || employee.employee_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Corporate Email</span>
              <span className="font-bold text-gray-900">{employee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Phone</span>
              <span className="font-bold text-gray-900">{employee.phone_number || employee.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Basic Base Salary</span>
              <span className="font-bold text-emerald-800">₹{employee.basic_salary?.toLocaleString?.('en-IN') || employee.salary || '35,000'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
