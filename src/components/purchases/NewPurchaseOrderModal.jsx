import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPurchaseOrderModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Handler for "+ Create Product" click
  const handleGoToCreateProduct = () => {
    // 1. Close current PO modal
    if (onClose) onClose();

    // 2. Navigate to Inventory Products session with modal query param / state
    navigate('/inventory/products?create=true', {
      state: { openCreateModal: true }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-6 relative max-h-[92vh] overflow-y-auto">
        
        {/* =================================================================== */}
        {/* ITEMIZED PRODUCTS HEADER ROW                                        */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📄</span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-700">
              Itemized Products
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* + CREATE PRODUCT BUTTON: NAVIGATES & OPENS INVENTORY POPUP */}
            <button
              type="button"
              onClick={handleGoToCreateProduct}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>+</span>
              <span>Create Product</span>
            </button>

            {/* + Add Row Button */}
            <button
              type="button"
              onClick={() => {}}
              className="px-3.5 py-1.5 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>+</span>
              <span>Add Row</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TABLE WITHOUT INLINE + CREATE PRODUCT LINK                         */}
        {/* =================================================================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">
                <th className="py-2 px-2 w-[28%]">Product Name</th>
                <th className="py-2 px-2 w-[12%]">SKU</th>
                <th className="py-2 px-2 w-[14%]">Purchase Cost (₹)</th>
                <th className="py-2 px-2 w-[10%]">Qty</th>
                <th className="py-2 px-2 w-[12%]">Discount %</th>
                <th className="py-2 px-2 w-[14%]">GST %</th>
                <th className="py-2 px-2 w-[10%] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Product item rows */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { NewPurchaseOrderModal };
