import React, { useMemo } from 'react';

export default function EditInvoiceModal({
  isOpen,
  onClose,
  items = [],
  setItems,
  onUpdateInvoice,
}) {
  if (!isOpen) return null;

  // 1. Calculate dynamic totals over ALL items (whether 4 or 20+)
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, it) => {
      const qty = parseFloat(it.quantity || it.qty || 0);
      const price = parseFloat(it.price || it.unit_price || 0);
      return acc + (qty * price);
    }, 0);

    const discount = 0;
    const gstAmount = subtotal * 0.18; // 18% standard GST
    const roundOff = 0;
    const grandTotal = Math.round(subtotal + gstAmount - discount);

    return {
      subtotal,
      discount,
      gstAmount,
      roundOff,
      grandTotal,
    };
  }, [items]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: '', hsn: '', qty: 1, unit: 'Pcs', price: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Edit Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>👁️</span>
              <span>Live Preview Mode</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1">

          {/* INVOICE ITEMS HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-gray-900">
                Invoice Items ({items.length})
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick Scan / Barcode"
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 w-48 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-xs font-black transition-colors flex items-center gap-1"
            >
              <span>+</span>
              <span>Add Item</span>
            </button>
          </div>

          {/* =================================================================== */}
          {/* SCROLLABLE ITEMS CONTAINER (Accommodates 15+ items without cutoff)   */}
          {/* =================================================================== */}
          <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50/80 border border-gray-200/70 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-3"
              >
                {/* Description */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                    DESCRIPTION
                  </label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                </div>

                {/* HSN */}
                <div className="w-24">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                    HSN
                  </label>
                  <input
                    type="text"
                    value={item.hsn || item.hsn_code || ''}
                    onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                    placeholder="HSN"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                </div>

                {/* QTY */}
                <div className="w-16">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                    QTY
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty ?? item.quantity ?? 1}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 text-center focus:outline-none"
                  />
                </div>

                {/* UNIT */}
                <div className="w-20">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                    UNIT
                  </label>
                  <select
                    value={item.unit || 'Pcs'}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kgs">Kgs</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>

                {/* PRICE (₹) */}
                <div className="w-28">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">
                    PRICE (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.price ?? ''}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                </div>

                {/* DELETE ROW */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="mt-3.5 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* =================================================================== */}
          {/* PAYMENT & SUMMARY CARD (Guaranteed Visible Totals)                   */}
          {/* =================================================================== */}
          <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Payment mode & Loyalty */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  PAYMENT MODE
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-4 py-2 bg-[#6d28d9] text-white rounded-xl text-xs font-bold">
                    Cash
                  </button>
                  <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold">
                    UPI
                  </button>
                  <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold">
                    Bank
                  </button>
                  <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold">
                    Credit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    PAID AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={totals.grandTotal}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    DUE AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={0}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                  />
                </div>
              </div>

              {/* Loyalty Card */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  LOYALTY POINTS
                </span>
                <p className="text-xs font-bold text-emerald-900">
                  ⭐ Available Points: 10475
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Redeem Points"
                    className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Use Max
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Bill Totals */}
            <div className="flex flex-col justify-between space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">
                    ₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Discount:</span>
                  <span className="font-bold text-red-600">- ₹0</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST Amount:</span>
                  <span className="font-bold text-gray-900">
                    ₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Round Off:</span>
                  <span className="font-bold text-gray-900">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-blue-200/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-gray-900">Total:</span>
                  <span className="text-xl font-black text-blue-900">
                    ₹{totals.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-2 p-2 bg-emerald-50 rounded-xl text-center text-xs font-bold text-emerald-800">
                  🎉 Points to earn this bill: {totals.grandTotal} pts
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={onUpdateInvoice}
            className="w-full py-3.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center cursor-pointer"
          >
            Update Invoice
          </button>
        </div>

      </div>
    </div>
  );
}
