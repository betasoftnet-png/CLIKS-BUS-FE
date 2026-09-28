import React from 'react';

export default function WarehouseStockRegistryTab({
  stocks = [],
  onSelectStock,
  formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold">
              <th className="py-3 px-4">Warehouse Facility</th>
              <th className="py-3 px-4">Product Description</th>
              <th className="py-3 px-4">Storage Zone</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Damaged Qty</th>
              <th className="py-3 px-4">In Transit</th>
              <th className="py-3 px-4">Sourcing Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((item, idx) => {
              const damagedCount =
                item.damaged_qty ??
                item.damaged_stock ??
                item.damagedQuantity ??
                item.damaged ??
                item.broken_stock ??
                0;

              return (
                <tr
                  key={item.wh_stock_id || item.id || idx}
                  onClick={() => onSelectStock && onSelectStock(item)}
                  className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-extrabold text-[#064E3B]">
                    {item.warehouse_name || item.warehouse || 'Main Facility'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">
                    {item.product_name || item.name || 'Stock Item'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-600">{item.zone || 'Standard Zone'}</span>
                      <span className="text-[10px] text-gray-400">
                        {item.rack_number || 'Rack A-1'} {item.shelf_number ? `| ${item.shelf_number}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                    {item.current_stock ?? item.quantity ?? 0} pcs
                  </td>

                  {/* ========================================================================= */}
                  {/* OPTION A: DYNAMIC DAMAGED QTY CELL                                        */}
                  {/* ========================================================================= */}
                  <td className="py-3.5 px-4 align-middle">
                    {(() => {
                      const count =
                        item.damaged_qty ??
                        item.damaged_stock ??
                        item.damagedQuantity ??
                        item.damaged ??
                        item.broken_stock ??
                        0;

                      return (
                        <span
                          className={`text-xs font-bold ${
                            count > 0 ? 'text-rose-600 font-black' : 'text-gray-400'
                          }`}
                        >
                          {count} pcs
                        </span>
                      );
                    })()}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-amber-600">
                    {item.in_transit_stock ?? item.in_transit ?? 0} pcs
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">
                    {formatCurrency(item.warehouse_stock_value || (item.current_stock * (item.unit_price || item.average_cost || 0)))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
