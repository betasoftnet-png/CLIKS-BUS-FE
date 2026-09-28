import React from 'react';
import BusinessBilling from '../BusinessBilling';
import GenerateEInvoiceModal from '../../components/sales/GenerateEInvoiceModal';
import CreateEWayBillModal from '../../components/sales/CreateEWayBillModal';
import EditInvoiceModal from '../../components/sales/EditInvoiceModal';
import InvoicePrintPreview from './InvoicePrintPreview';
import GeneralInvoiceTemplate from '../../components/sales/templates/GeneralInvoiceTemplate';

export const InvoiceMetaSummary = ({ invoice = {} }) => (
  <div className="invoice-meta-summary flex items-center justify-between text-xs font-semibold py-2 px-1 text-gray-700">
    <div>
      <span>Tax Invoice Ref: </span>
      <span className="font-bold text-gray-900">{invoice?.invoice_number}</span>
    </div>
    
    {/* TOTAL NUMBER OF ITEMS PURCHASED DISPLAYED OUTSIDE THE GRID & THERMAL RECEIPT */}
    <div className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-xs font-bold text-gray-900">
      Total Number of Items Purchased: <span className="font-black text-black">{invoice?.items?.length || 0}</span>
    </div>
  </div>
);

const SalesInvoice = (props) => {
  return <BusinessBilling {...props} />;
};

export default SalesInvoice;
export { 
  BusinessBilling, 
  GenerateEInvoiceModal, 
  CreateEWayBillModal, 
  EditInvoiceModal, 
  InvoicePrintPreview,
  GeneralInvoiceTemplate 
};



