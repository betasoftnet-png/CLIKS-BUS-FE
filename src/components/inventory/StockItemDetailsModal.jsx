import React from 'react';

export default function StockItemDetailsModal({ isOpen, onClose, item, onEditStock }) {
  if (!isOpen || !item) return null;

  // Extract actual movements or fallback to structured chronological events from the item record
  const movementLogs = Array.isArray(item.movement_history) && item.movement_history.length > 0
    ? item.movement_history
    : Array.isArray(item.stock_movements) && item.stock_movements.length > 0
    ? item.stock_movements
    : [
        // Real movement fallback based on the item's actual attributes
        ...(item.last_restocked_at ? [{
          id: 'restock',
          type: 'Restock / Purchase',
          qty: `+${item.last_restock_qty ?? item.current_qty ?? item.current_stock ?? item.quantity ?? 0} pcs received`,
          date: item.last_restocked_at?.split('T')[0] || item.created_at?.split('T')[0] || 'Recently',
          bg: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
        }] : []),
        ...(item.last_dispatched_at ? [{
          id: 'dispatch',
          type: 'Sale / Dispatch',
          qty: `-${item.last_dispatch_qty ?? 0} pcs dispatched`,
          date: item.last_dispatched_at?.split('T')[0] || 'N/A',
          bg: 'bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
        }] : []),
        ...(item.last_adjusted_at ? [{
          id: 'adjustment',
          type: 'Stock Adjustment',
          qty: `${item.last_adjustment_notes || 'Physical audit reconciliation'}`,
          date: item.last_adjusted_at?.split('T')[0] || 'N/A',
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
        }] : []),
        {
          id: 'current',
          type: 'Current Stock Level',
          qty: `${item.current_qty ?? item.current_stock ?? item.quantity ?? 0} pcs on hand`,
          date: 'Today',
          bg: 'bg-purple-50/60 border-purple-200',
          dot: 'bg-purple-400',
        },
      ];

  const getStyleForType = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('restock') || lower.includes('in') || lower.includes('purchase')) {
      return { bg: 'bg-emerald-50/70 border-emerald-200', dot: 'bg-emerald-500' };
    }
    if (lower.includes('dispatch') || lower.includes('sale') || lower.includes('out')) {
      return { bg: 'bg-rose-50/70 border-rose-200', dot: 'bg-rose-500' };
    }
    if (lower.includes('transit') || lower.includes('transfer')) {
      return { bg: 'bg-amber-50/70 border-amber-200', dot: 'bg-amber-500' };
    }
    if (lower.includes('adjustment') || lower.includes('audit')) {
      return { bg: 'bg-blue-50/70 border-blue-200', dot: 'bg-blue-500' };
    }
    return { bg: 'bg-purple-50/60 border-purple-200', dot: 'bg-purple-400' };
  };

  const resolvedName = item.name || item.product_name || 'PlayStation 5';
  const resolvedSku = item.sku || item.product_id || item.product_code || 'PS5';
  const resolvedLocation = item.location || (item.warehouse_name ? `${item.warehouse_name} ${item.rack_number ? `(${item.rack_number})` : ''}`.trim() : 'Main Godown (Rack A-1)');
  const resolvedQty = item.current_qty ?? item.current_stock ?? item.quantity ?? 25;
  const resolvedPrice = item.unit_price ?? item.average_cost ?? item.price ?? 45000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#0e4b34] tracking-tight">
            Stock Item Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Item Info Header */}
        <div>
          <h4 className="text-sm font-black text-gray-900">{resolvedName}</h4>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
            SKU: {resolvedSku} <span className="mx-1 text-gray-300">|</span> Location: {resolvedLocation}
          </p>
        </div>

        {/* Current Qty & Unit Price Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 text-center">
            <span className="text-xl font-black text-gray-900 block">
              {resolvedQty}
            </span>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              CURRENT QTY ({item.unit || 'pcs'})
            </span>
          </div>

          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 text-center">
            <span className="text-xl font-black text-emerald-600 block">
              ₹{Number(resolvedPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              UNIT PRICE
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* DYNAMIC MOVEMENT HISTORY                                            */}
        {/* =================================================================== */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-700">
            <span>📋</span>
            <span>MOVEMENT HISTORY</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
            {movementLogs.map((log, idx) => {
              const styling = log.bg ? log : getStyleForType(log.type || log.action);
              const label = log.type || log.action || 'Stock Movement';
              const description = log.qty || log.description || (log.quantity ? `${log.quantity > 0 ? '+' : ''}${log.quantity} pcs` : '');
              const movementDate = log.date || log.created_at?.split('T')[0] || log.timestamp?.split('T')[0] || 'Today';

              return (
                <div
                  key={log.id || idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${styling.bg}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${styling.dot}`} />
                    <div>
                      <h5 className="text-xs font-black text-gray-900">{label}</h5>
                      <p className="text-[10px] text-gray-500 font-semibold">{description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">
                    {movementDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onEditStock) onEditStock(item);
          }}
          className="w-full py-3 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>✏️</span>
          <span>Edit Quantity / Adjust Stock</span>
        </button>

      </div>
    </div>
  );
}
export { StockItemDetailsModal };
