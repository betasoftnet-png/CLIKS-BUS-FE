import React from 'react';
import { Truck } from 'lucide-react';

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
                    {(() => {
                      const coords = [];
                      if (item.rack_number && item.rack_number !== 'N/A' && item.rack_number !== 'In Transit') {
                        coords.push(`Rack ${item.rack_number.replace(/^Rack\s*/i, '')}`);
                      } else if (item.rack_number === 'In Transit') {
                        coords.push('In Transit');
                      }
                      if (item.shelf_number && item.shelf_number !== 'N/A') {
                        coords.push(`Shelf ${item.shelf_number.replace(/^Shelf\s*/i, '')}`);
                      }
                      if (item.bin_number && item.bin_number !== 'N/A') {
                        coords.push(`Bin ${item.bin_number.replace(/^Bin\s*/i, '')}`);
                      }
                      const displayZone = item.zone && item.zone !== 'N/A' ? item.zone : (coords.length > 0 ? 'Zone A' : 'Standard Zone');

                      return (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-600">{displayZone}</span>
                          <span className="text-[10px] text-gray-400">
                            {coords.length > 0 ? coords.join(' | ') : 'Open Floor / Unassigned'}
                          </span>
                        </div>
                      );
                    })()}
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

                  <td className="py-3.5 px-4 align-middle">
                    {(() => {
                      const inTransitQty = item.in_transit_stock ?? item.in_transit ?? 0;
                      return inTransitQty > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          {inTransitQty} pcs
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          0 pcs
                        </span>
                      );
                    })()}
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
