import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, ShieldCheck, Calendar, PackageCheck, Layers } from 'lucide-react';

export default function BatchesExpiriesTab({
  batches = [],
  onSelectBatch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'perishable_only' | 'expiring_soon'

  // Determine if item is perishable / expiry-tracked
  const isItemPerishable = (item) => {
    if (item.has_expiry !== undefined) return Boolean(item.has_expiry);
    if (item.is_perishable !== undefined) return Boolean(item.is_perishable);
    if (item.expiry_date && item.expiry_date !== '2029-01-10' && item.expiry_date !== 'N/A') return true;
    return false;
  };

  const processedBatches = useMemo(() => {
    return batches.map(b => {
      const perishable = isItemPerishable(b);
      const expDate = perishable && b.expiry_date && b.expiry_date !== '2029-01-10' ? b.expiry_date : null;
      const mfgDate = perishable && b.manufacturing_date && b.manufacturing_date !== 'N/A' ? b.manufacturing_date : null;
      
      let daysLeft = null;
      if (expDate) {
        daysLeft = Math.ceil((new Date(expDate) - new Date()) / (1000 * 60 * 60 * 24));
      }

      return {
        ...b,
        is_perishable: perishable,
        has_expiry: perishable,
        resolved_expiry_date: expDate,
        resolved_mfg_date: mfgDate,
        days_left: daysLeft
      };
    });
  }, [batches]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = processedBatches.length;
    const perishable = processedBatches.filter(b => b.is_perishable);
    const expiringSoon = perishable.filter(b => b.days_left !== null && b.days_left <= 120);
    const nonPerishableCount = total - perishable.length;

    return {
      total,
      perishableCount: perishable.length,
      expiringSoonCount: expiringSoon.length,
      nonPerishableCount
    };
  }, [processedBatches]);

  // Filtering
  const filteredBatches = useMemo(() => {
    return processedBatches.filter(b => {
      // Filter tab
      if (filterMode === 'perishable_only' && !b.is_perishable) return false;
      if (filterMode === 'expiring_soon' && (!b.is_perishable || b.days_left === null || b.days_left > 120)) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = (b.batch_number || '').toLowerCase().includes(q);
        const nameMatch = (b.product_name || '').toLowerCase().includes(q);
        return numMatch || nameMatch;
      }
      return true;
    });
  }, [processedBatches, filterMode, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 lg:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Batch-Wise & Expiry Tracking (FIFO Engine)
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track shelf life, FIFO dispatch priority, and expiry compliance for perishable products. Non-perishable goods are cleanly isolated.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-2xl self-start sm:self-auto border border-gray-200/60">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Batches ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('perishable_only')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'perishable_only'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Perishable Only ({stats.perishableCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('expiring_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'expiring_soon'
                ? 'bg-rose-600 text-white shadow-xs font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Expiring Soon ({stats.expiringSoonCount})
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Total Batches</span>
            <span className="text-base font-black text-gray-900">{stats.total} Batches</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Perishable Goods</span>
            <span className="text-base font-black text-emerald-950">{stats.perishableCount} Tracked</span>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50/50 border border-rose-200/60 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">Expiring ≤ 120 Days</span>
            <span className="text-base font-black text-rose-950">{stats.expiringSoonCount} Batches</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Non-Perishable</span>
            <span className="text-base font-black text-slate-800">{stats.nonPerishableCount} Items</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by batch number or product description..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">Batch Number</th>
              <th className="py-3 px-4">Product Description</th>
              <th className="py-3 px-4">MFG Date</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Batch Qty</th>
              <th className="py-3 px-4">Days to Expiry / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/90 font-medium">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400 font-semibold">
                  No matching batches found.
                </td>
              </tr>
            ) : (
              filteredBatches.map((bat, idx) => {
                const isPerishable = bat.is_perishable;
                const hasExp = Boolean(isPerishable && bat.resolved_expiry_date);
                const days = bat.days_left;

                return (
                  <tr
                    key={bat.batch_number || idx}
                    onClick={() => onSelectBatch && onSelectBatch(bat)}
                    className="hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-black text-gray-900">
                      {bat.batch_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span>{bat.product_name}</span>
                        {!isPerishable && (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                            General
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {bat.resolved_mfg_date || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {hasExp ? (
                        <span className={days <= 120 ? 'text-rose-600 font-black' : 'text-gray-900'}>
                          {bat.resolved_expiry_date}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-500">
                          N/A (Non-Perishable)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-800">
                      {bat.batch_quantity ?? bat.current_stock ?? 0} pcs
                    </td>
                    <td className="py-3.5 px-4">
                      {hasExp ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                            days <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : days <= 120
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {days <= 0 ? 'EXPIRED' : `${days} Days Left`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 border border-gray-200/60 text-gray-400">
                          Not Applicable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
