import React from 'react';

export default function GeneralInvoiceTemplate({ invoice, data }) {
  const inv = invoice || data || {};
  const rawItems = inv?.items || [];
  const items = typeof rawItems === 'string' 
    ? (() => { try { return JSON.parse(rawItems); } catch { return []; } })() 
    : rawItems;
  
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity || item.qty || 1);
    const rate = Number(item.unit_price || item.price || item.rate || 0);
    return acc + qty * rate;
  }, 0);

  const taxRate = Number(inv?.tax_rate || (inv?.tax_amount && subtotal > 0 ? (inv.tax_amount / subtotal) * 100 : 18));
  const taxAmount = inv?.tax_amount !== undefined ? Number(inv.tax_amount) : (subtotal * taxRate) / 100;
  const grandTotal = inv?.total_amount !== undefined ? Number(inv.total_amount) : (subtotal + taxAmount);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-gray-800 space-y-8 print:p-4 print:max-w-full">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl font-black text-gray-700">
            {(inv?.company_name || inv?.business_name || 'V').charAt(0)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-black tracking-tight text-gray-900">
                {inv?.company_name || inv?.business_name || 'VINCENT1182003'}
              </h1>
              <span className="text-xl font-black tracking-widest text-gray-400">
                INVOICE
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Global Solutions Enterprise</p>
            <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
              <p>GSTIN: <span className="font-bold text-gray-700">{inv?.gstin || 'N/A'}</span></p>
              <p>EMAIL: <span className="text-gray-700">{inv?.email || 'vincent1182003@bnxmail.com'}</span></p>
            </div>
          </div>
        </div>

        <div className="text-right space-y-2">
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-4 py-1.5 text-xs font-bold text-gray-800">
            INVOICE NO. <span className="font-black text-black ml-1">{inv?.invoice_number || 'INV-107141'}</span>
          </div>
          <p className="text-xs text-gray-500">
            DATE ISSUED: <span className="font-bold text-gray-800 ml-1">{inv?.date || inv?.due_date || '2026-09-10'}</span>
          </p>
        </div>
      </div>

      {/* BILL RECIPIENT & PAYMENT METRICS */}
      <div className="flex justify-between items-start gap-6">
        <div>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
            BILL RECIPIENT
          </span>
          <h2 className="text-base font-black text-gray-900">
            {inv?.customer_name || inv?.client_name || 'Santhosh'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {inv?.customer_business || inv?.billing_address || 'Santhosh Retailers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-center w-24">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              PAYMENT MODE
            </span>
            <p className="text-xs font-black text-blue-700">{inv?.payment_mode || 'Cash'}</p>
            <p className="text-[9px] text-gray-400">Terms: Net 30</p>
          </div>

          <div className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-center w-24">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              CURRENCY
            </span>
            <p className="text-xs font-black text-blue-700">INR (₹)</p>
            <p className="text-[9px] text-gray-400">Indian Rupee</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4-COLUMN ITEMS TABLE WITH PROPER RIGHT ALIGNMENT                    */}
      {/* =================================================================== */}
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 text-[10px] font-black uppercase text-gray-400">
              <th className="py-3 text-left w-1/2">DESCRIPTION</th>
              <th className="py-3 text-center w-1/12">QTY</th>
              <th className="py-3 text-right w-1/5">UNIT PRICE</th>
              <th className="py-3 text-right w-1/5">TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {items.map((item, index) => {
              const qty = Number(item.quantity || item.qty || 1);
              const rate = Number(item.unit_price || item.price || item.rate || 0);
              const lineTotal = item.total !== undefined ? Number(item.total) : qty * rate;

              return (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  {/* Description & HSN */}
                  <td className="py-4 pr-3 text-left">
                    <p className="font-bold text-gray-900">{item.product_name || item.description || item.name}</p>
                    {(item.hsn || item.hsn_code) && (
                      <p className="text-[10px] text-gray-400 font-medium">HSN CODE: {item.hsn || item.hsn_code}</p>
                    )}
                  </td>

                  {/* QTY */}
                  <td className="py-4 text-center font-bold text-gray-800">
                    {qty}
                  </td>

                  {/* Unit Price */}
                  <td className="py-4 text-right font-medium text-gray-700">
                    ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* TOTAL AMOUNT (PROPERLY ALIGNED & UNCLIPPED) */}
                  <td className="py-4 text-right font-black text-gray-900">
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =================================================================== */}
      {/* TOTAL BILL SUMMARY (PROPER RIGHT ALIGNMENT)                         */}
      {/* =================================================================== */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <div className="w-72 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-800">
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-gray-500 font-medium">
            <span>GST ({taxRate}%):</span>
            <span className="font-bold text-gray-800">
              ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-sm font-black text-gray-900 border-t-2 border-gray-900 pt-2">
            <span>TOTAL AMOUNT:</span>
            <span className="text-base text-blue-950 font-black">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
