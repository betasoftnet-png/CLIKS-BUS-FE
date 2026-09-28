import React, { useState } from 'react';

export default function GenerateEInvoiceModal({
  isOpen = true,
  onClose,
  onGenerateInvoice,
  loading = false,
  sender = {
    legal_name: 'Welton Consignor',
    gstin: '05AAAPG7885R002',
    state: '05 - Uttarakhand',
    address: 'Dehradun Central Road, Dehradun - 248001',
  },
  customerList = [],
}) {
  const [customerSource, setCustomerSource] = useState('existing');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('09');
  const [productName, setProductName] = useState('');
  const [hsnCode, setHsnCode] = useState('1001');
  const [unit, setUnit] = useState('BOX');
  const [quantity, setQuantity] = useState(1);
  const [invoiceType, setInvoiceType] = useState('B2B');
  const [taxableValue, setTaxableValue] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [reverseCharge, setReverseCharge] = useState('No');

  if (!isOpen) return null;

  // Determine Inter-State (IGST) vs Intra-State (CGST + SGST)
  const senderStateCode = (sender?.gstin || '05').substring(0, 2);
  const receiverStateCode = (placeOfSupply || customerGstin || '09').substring(0, 2);
  const isInterState = senderStateCode !== receiverStateCode;

  const numTaxable = parseFloat(taxableValue) || 0;
  const numRate = parseFloat(gstRate) || 0;
  const taxAmount = (numTaxable * numRate) / 100;
  const totalInvoiceAmount = numTaxable + taxAmount;

  const handleGenerateInvoice = (e) => {
    if (e) e.preventDefault();
    const payload = {
      customerSource,
      customerName: customerSource === 'existing' ? selectedCustomer : customerName,
      customerGstin,
      placeOfSupply,
      productName,
      hsnCode,
      unit,
      quantity: Number(quantity) || 1,
      invoiceType,
      taxableValue: numTaxable,
      gstRate: numRate,
      reverseCharge,
      taxAmount,
      totalInvoiceAmount,
      isInterState,
    };
    if (onGenerateInvoice) {
      onGenerateInvoice(payload);
    }
  };

  return (
    /* Modal Backdrop Container */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      
      {/* 
        CONTAINER SIZING FIX:
        Changed from `max-w-md` to `max-w-3xl sm:max-w-4xl w-full`
        Enables horizontal breathing room, neat two-column grids, and clean vertical rhythm.
      */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl sm:max-w-4xl w-full max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">
              Generate GST e-Invoice
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold">
              Authenticate B2B invoices and generate IRN &amp; Signed QR Code via IRP
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-7 overflow-y-auto space-y-5 flex-1">

          {/* 2-COLUMN SECTION: SENDER (FROM) & RECEIVER (TO) SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* SENDER (FROM) CARD */}
            <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                SENDER (FROM)
              </span>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-gray-900">
                  Company Name: <span className="font-normal text-gray-700">{sender.legal_name || 'Welton Consignor'}</span>
                </p>
                <p className="font-bold text-gray-900">
                  GSTIN: <span className="font-mono text-emerald-700 font-bold">{sender.gstin || '05AAAPG7885R002'}</span>
                </p>
                <p className="font-bold text-gray-900">
                  State: <span className="font-normal text-gray-700">{sender.state || '05 - Uttarakhand'}</span>
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Address: {sender.address || 'Dehradun Central Road, Dehradun - 248001'}
                </p>
              </div>
            </div>

            {/* RECEIVER (TO) CARD */}
            <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  RECEIVER (TO)
                </span>
                {/* Customer Source Radio */}
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="customerSource"
                      checked={customerSource === 'existing'}
                      onChange={() => setCustomerSource('existing')}
                      className="text-blue-600"
                    />
                    Existing Customer
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="customerSource"
                      checked={customerSource === 'manual'}
                      onChange={() => setCustomerSource('manual')}
                      className="text-blue-600"
                    />
                    Manual Entry
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Customer Name *
                </label>
                {customerSource === 'existing' ? (
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  >
                    <option value="">Select Customer</option>
                    {customerList.length > 0 ? (
                      customerList.map((cust, i) => (
                        <option key={i} value={typeof cust === 'string' ? cust : (cust.name || cust.client_name)}>
                          {typeof cust === 'string' ? cust : (cust.name || cust.client_name)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Sathish Traders">Sathish Traders</option>
                        <option value="Acme Hardwares">Acme Hardwares</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter customer legal name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Customer GSTIN *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09AAAPG7885R002"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-semibold text-gray-800 uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    State / Place of Supply *
                  </label>
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  >
                    <option value="09">09 - Uttar Pradesh</option>
                    <option value="05">05 - Uttarakhand</option>
                    <option value="33">33 - Tamil Nadu</option>
                    <option value="27">27 - Maharashtra</option>
                    <option value="29">29 - Karnataka</option>
                    <option value="07">07 - Delhi</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* LINE ITEM & BILLING PARTICULARS (WIDE GRID) */}
          <div className="p-4 bg-gray-50/60 border border-gray-200/80 rounded-2xl space-y-4">
            
            {/* Row 1: Product Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Product Name / Description *
              </label>
              <input
                type="text"
                placeholder="Select or enter Product Name / Description"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            {/* Row 2: 3 Columns for HSN/SAC, Unit, and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  HSN/SAC Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1001"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Unit *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                >
                  <option value="BOX">BOX</option>
                  <option value="PCS">PCS</option>
                  <option value="KGS">KGS</option>
                  <option value="NOS">NOS</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: 4 Columns for Invoice Type, Taxable Value, GST Rate, and Reverse Charge */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Invoice Type
                </label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                >
                  <option value="B2B">B2B</option>
                  <option value="SEZWP">SEZWP</option>
                  <option value="EXPWP">EXPWP</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Taxable Value (Before GST) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="0.00"
                  value={taxableValue}
                  onChange={(e) => setTaxableValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  GST %
                </label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                >
                  <option value="18">18%</option>
                  <option value="12">12%</option>
                  <option value="5">5%</option>
                  <option value="28">28%</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Reverse Charge
                </label>
                <select
                  value={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

          </div>

          {/* HORIZONTAL TAX SUMMARY RIBBON */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block">
                TAX TYPE DETERMINED
              </span>
              <span className="font-bold text-purple-700 text-sm">
                {isInterState ? 'INTER-STATE (IGST)' : 'INTRA-STATE (CGST + SGST)'}
              </span>
            </div>

            <div className="flex items-center gap-6">
              {isInterState ? (
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">IGST ({gstRate}%)</span>
                  <span className="font-bold text-gray-800">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">CGST ({parseFloat(gstRate) / 2}%)</span>
                    <span className="font-bold text-gray-800">₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">SGST ({parseFloat(gstRate) / 2}%)</span>
                    <span className="font-bold text-gray-800">₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              <div className="border-l border-purple-200 pl-6">
                <span className="text-[10px] text-purple-900 font-black uppercase block">TOTAL INVOICE AMOUNT</span>
                <span className="text-base font-black text-purple-950">₹{totalInvoiceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Fixed Footer Submit Button */}
        <div className="px-7 py-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={loading}
            className="w-full py-3.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating with NIC...' : 'Generate / Authenticate e-Invoice'}
          </button>
        </div>

      </div>
    </div>
  );
}
