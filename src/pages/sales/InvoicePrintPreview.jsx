import React from 'react';
import { InvoicePrintTemplate } from '../../components/invoice/InvoicePrintTemplate';

export const InvoicePrintPreview = ({ invoice = {}, data, ...props }) => {
  const activeInvoice = invoice && Object.keys(invoice).length > 0 ? invoice : (data || {});
  const items = typeof activeInvoice.items === 'string' 
    ? (() => { try { return JSON.parse(activeInvoice.items || '[]'); } catch { return []; } })()
    : (activeInvoice.items || []);
  const safeInvoice = { ...activeInvoice, items };

  return (
    <div className="invoice-print-preview-container w-full">
      <div className="invoice-meta-summary flex items-center justify-between text-xs font-semibold py-2 px-1 text-gray-700">
        <div>
          <span>Tax Invoice Ref: </span>
          <span className="font-bold text-gray-900">{safeInvoice.invoice_number}</span>
        </div>
        
        {/* TOTAL NUMBER OF ITEMS PURCHASED DISPLAYED OUTSIDE THE GRID & THERMAL RECEIPT */}
        <div className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-xs font-bold text-gray-900">
          Total Number of Items Purchased: <span className="font-black text-black">{safeInvoice.items?.length || 0}</span>
        </div>
      </div>

      <InvoicePrintTemplate invoice={safeInvoice} data={safeInvoice} {...props} />
    </div>
  );
};

export default InvoicePrintPreview;
