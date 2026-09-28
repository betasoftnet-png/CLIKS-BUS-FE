import React, { useState } from 'react';
import { Award, Star, TrendingUp, CheckCircle, Search, Filter } from 'lucide-react';

export default function StaffAppraisals({
  employees = [],
  onAppraisalSaved,
  currency = { symbol: '₹' }
}) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [rating, setRating] = useState('4.5');
  const [targetScore, setTargetScore] = useState('90');
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    try {
      setLoading(true);
      const payload = {
        employee_id: selectedEmpId,
        performance_rating: parseFloat(rating),
        target_score: parseFloat(targetScore),
        feedback,
        date: new Date().toISOString().split('T')[0]
      };

      if (onAppraisalSaved) {
        onAppraisalSaved(payload);
      }
      setFeedback('');
      alert('Appraisal review recorded successfully.');
    } catch (err) {
      console.error('Failed to save appraisal', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const name = (emp.name || fullName).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-emerald-700" />
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Top Performers</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-950">
            {employees.filter(e => (parseFloat(e.performance_rating) || 0) >= 4.5).length}
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Rating 4.5+ across teams</p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Avg Target Score</span>
          </div>
          <h3 className="text-2xl font-black text-blue-950">
            {employees.length > 0 
              ? Math.round(employees.reduce((acc, e) => acc + (parseFloat(e.target_score) || 90), 0) / employees.length) 
              : 90}%
          </h3>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">Quarterly KPI completion</p>
        </div>

        <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-purple-700" />
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Reviews Settled</span>
          </div>
          <h3 className="text-2xl font-black text-purple-950">
            {employees.length}
          </h3>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">Active staff appraised</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appraisal Form */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> File Performance Review
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Select Employee *
              </label>
              <select
                required
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="">-- Choose Staff Member --</option>
                {employees.map((emp) => {
                  const id = emp.id || emp.employee_id;
                  const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                  const dept = emp.department_name || emp.department || 'Operations';
                  return (
                    <option key={id} value={id}>
                      {name} ({dept})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Appraisal Rating (1.0 - 5.0)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  KPI Target Score %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Executive Feedback & Notes
              </label>
              <textarea
                rows="3"
                placeholder="Key deliverables, strengths, growth areas..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedEmpId}
              className="w-full py-3 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recording...' : 'Settle Appraisal Score'}
            </button>
          </form>
        </div>

        {/* Staff Performance Scores Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-gray-900 tracking-tight">
              Staff Performance & Ratings
            </h4>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Target Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => {
                  const id = emp.id || emp.employee_id;
                  const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                  const dept = emp.department_name || emp.department || 'Operations';
                  const score = parseFloat(emp.performance_rating) || 4.5;
                  const target = parseFloat(emp.target_score) || 92;

                  return (
                    <tr key={id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {name.charAt(0)}
                        </div>
                        <span>{name}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{dept}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                          ⭐ {score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, target)}%` }}
                            />
                          </div>
                          <span>{target}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Reviewed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
