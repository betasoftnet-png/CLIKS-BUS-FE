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
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#9CA3AF' }}>
              <th style={{ padding: '12px 0', textAlign: 'left', width: '45%' }}>DESCRIPTION</th>
              <th style={{ padding: '12px 0', textAlign: 'center', width: '15%' }}>QTY</th>
              <th style={{ padding: '12px 0', textAlign: 'right', width: '20%', paddingRight: '8px' }}>UNIT PRICE</th>
              <th style={{ padding: '12px 0', textAlign: 'right', width: '20%' }}>TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '12px', color: '#374151' }}>
            {items.map((item, index) => {
              const qty = Number(item.quantity || item.qty || 1);
              const rate = Number(item.unit_price || item.price || item.rate || 0);
              const lineTotal = item.total !== undefined ? Number(item.total) : qty * rate;

              return (
                <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px 8px 16px 0', textAlign: 'left', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    <p style={{ fontWeight: '700', color: '#111827', margin: 0 }}>{item.product_name || item.description || item.name}</p>
                    {(item.hsn || item.hsn_code) && (
                      <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '500', margin: '4px 0 0 0' }}>HSN CODE: {item.hsn || item.hsn_code}</p>
                    )}
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center', fontWeight: '700', color: '#1F2937' }}>
                    {qty}
                  </td>
                  <td style={{ padding: '16px 8px 16px 0', textAlign: 'right', fontWeight: '500', color: '#374151' }}>
                    ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '900', color: '#111827' }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #F3F4F6', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontWeight: '500' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: '700', color: '#1F2937' }}>
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontWeight: '500' }}>
            <span>GST ({taxRate}%):</span>
            <span style={{ fontWeight: '700', color: '#1F2937' }}>
              ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#111827', borderTop: '2px solid #111827', paddingTop: '8px', marginTop: '4px' }}>
            <span>TOTAL AMOUNT:</span>
            <span style={{ color: '#172554' }}>
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
