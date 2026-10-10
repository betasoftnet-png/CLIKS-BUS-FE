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
    <div className="max-w-5xl mx-auto p-10 bg-white font-sans text-gray-800 space-y-10 print:p-6 print:max-w-full print:w-full w-full">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-black text-gray-800 shadow-sm">
            {(inv?.company_name || inv?.business_name || 'V').charAt(0)}
          </div>
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {inv?.company_name || inv?.business_name || 'VINCENT1182003'}
              </h1>
              <span className="text-2xl font-black tracking-widest text-gray-300">
                INVOICE
              </span>
            </div>
            <p className="text-sm text-gray-500 font-bold mt-1">Global Solutions Enterprise</p>
            <div className="mt-3 text-[13px] text-gray-500 space-y-1">
              <p>GSTIN: <span className="font-bold text-gray-800">{inv?.gstin || 'N/A'}</span></p>
              <p>EMAIL: <span className="font-bold text-gray-800">{inv?.email || 'vincent1182003@bnxmail.com'}</span></p>
            </div>
          </div>
        </div>

        <div className="text-right space-y-3">
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-600 shadow-sm">
            INVOICE NO. <span className="font-black text-gray-900 ml-2 text-base">{inv?.invoice_number || 'INV-107141'}</span>
          </div>
          <p className="text-sm text-gray-500 font-semibold pt-1">
            DATE ISSUED: <span className="font-black text-gray-900 ml-2">{inv?.date || inv?.due_date || '2026-09-10'}</span>
          </p>
        </div>
      </div>

      {/* BILL RECIPIENT & PAYMENT METRICS */}
      <div className="flex justify-between items-start gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <div className="flex-1">
          <span className="text-xs font-black uppercase text-gray-400 tracking-widest block mb-2">
            BILL RECIPIENT
          </span>
          <h2 className="text-xl font-black text-gray-900 mb-1">
            {inv?.customer_name || inv?.client_name || 'Santhosh'}
          </h2>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {inv?.customer_business || inv?.billing_address || 'Santhosh Retailers'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl text-center w-32 shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              PAYMENT MODE
            </span>
            <p className="text-sm font-black text-blue-700">{inv?.payment_mode || 'Cash'}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">Terms: Net 30</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl text-center w-32 shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              CURRENCY
            </span>
            <p className="text-sm font-black text-blue-700">INR (₹)</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">Indian Rupee</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4-COLUMN ITEMS TABLE WITH PROPER RIGHT ALIGNMENT                    */}
      {/* =================================================================== */}
      <div className="w-full">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs font-black text-gray-400 uppercase tracking-wider">
              <th className="py-4 text-left" style={{ width: '45%' }}>DESCRIPTION</th>
              <th className="py-4 text-center" style={{ width: '15%' }}>QTY</th>
              <th className="py-4 text-right pr-2" style={{ width: '20%' }}>UNIT PRICE</th>
              <th className="py-4 text-right" style={{ width: '20%' }}>TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {items.map((item, index) => {
              const qty = Number(item.quantity || item.qty || 1);
              const rate = Number(item.unit_price || item.price || item.rate || 0);
              const lineTotal = item.total !== undefined ? Number(item.total) : qty * rate;

              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 pr-4 text-left break-words">
                    <p className="font-bold text-gray-900 text-base m-0">{item.product_name || item.description || item.name}</p>
                    {(item.hsn || item.hsn_code) && (
                      <p className="text-xs text-gray-400 font-semibold mt-1">HSN CODE: {item.hsn || item.hsn_code}</p>
                    )}
                  </td>
                  <td className="py-5 text-center font-bold text-gray-800 text-base">
                    {qty}
                  </td>
                  <td className="py-5 pr-2 text-right font-semibold text-gray-600">
                    ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-5 text-right font-black text-gray-900 text-base">
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
      <div className="flex justify-end pt-6 border-t-2 border-gray-100 w-full" style={{ pageBreakInside: 'avoid' }}>
        <div className="w-80 flex flex-col gap-4 text-sm bg-gray-50/50 p-6 rounded-2xl border border-gray-100 print:bg-gray-50 print:border-gray-200">
          <div className="flex justify-between text-gray-500 font-semibold items-center">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-800 text-base">
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-gray-500 font-semibold items-center">
            <span>GST ({taxRate}%):</span>
            <span className="font-bold text-gray-800 text-base">
              ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg font-black text-gray-900 border-t-2 border-gray-300 pt-4 mt-1">
            <span>TOTAL AMOUNT:</span>
            <span className="text-blue-900 text-xl">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
