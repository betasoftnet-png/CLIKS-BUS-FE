import React, { useState } from 'react';

export default function CreateEWayBillModal({
  isOpen = true,
  onClose,
  onGenerateEwayBill,
  loading = false,
  sender = {
    legal_name: 'Welton Consignor',
    gstin: '05AAAPG7885R002',
    location: 'Dehradun',
    state_code: '05',
    state: 'Uttarakhand',
    pincode: '248001'
  },
  invoiceOptions = [],
}) {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [productName, setProductName] = useState('');
  const [hsnCode, setHsnCode] = useState('7214');
  const [unit, setUnit] = useState('PCS');
  const [quantity, setQuantity] = useState(1);
  const [taxableValue, setTaxableValue] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportMode, setTransportMode] = useState('Road');
  const [transportCompanyName, setTransportCompanyName] = useState('M/S UTTARAYAN CO-OPERATIVE FOR RENEWABLE ENERGY');
  const [transporterGstin, setTransporterGstin] = useState('05AAAAU6537D1ZO');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [distance, setDistance] = useState('');
  const [dispatchLocation, setDispatchLocation] = useState(sender.location || 'Dehradun');

  if (!isOpen) return null;

  const handleInvoiceSelect = (invId) => {
    setSelectedInvoice(invId);
    if (!invId) return;
    const inv = invoiceOptions.find((i) => String(i.id) === String(invId));
    if (inv) {
      setInvoiceNumber(inv.invoice_number || '');
      setInvoiceDate(inv.created_at ? inv.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
      if (Array.isArray(inv.items) && inv.items.length > 0) {
        setProductName(inv.items.map((i) => i.description || i.product_name).join(', '));
        setHsnCode(inv.items.map((i) => i.hsn_code || i.hsn).filter(Boolean)[0] || '7214');
        setQuantity(inv.items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0) || 1);
        setUnit(inv.items[0]?.unit || 'PCS');
        setTaxableValue(inv.taxable_value || inv.taxable_amount || inv.items.reduce((sum, i) => sum + (parseFloat(i.price || 0) * parseFloat(i.quantity || 0)), 0));
        setGstRate(inv.items[0]?.tax_rate || inv.gst_percentage || '18');
      } else {
        setTaxableValue(inv.total_amount || inv.amount || '');
      }
    }
  };

  const handleGenerateEwayBill = (e) => {
    if (e) e.preventDefault();
    const payload = {
      selectedInvoice,
      productName,
      hsnCode,
      unit,
      quantity: Number(quantity) || 1,
      taxableValue: parseFloat(taxableValue) || 0,
      gstRate: parseFloat(gstRate) || 18,
      invoiceNumber,
      invoiceDate,
      transportMode,
      transportCompanyName,
      transporterGstin,
      vehicleNumber,
      distance: Number(distance) || 0,
      dispatchLocation,
    };
    if (onGenerateEwayBill) {
      onGenerateEwayBill(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">

      {/* 
        HORIZONTAL SIZING FIX:
        Upgraded from `max-w-md` to `max-w-3xl sm:max-w-4xl w-full`
        Provides horizontal space, avoids vertical clutter, and keeps fields easily accessible.
      */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl sm:max-w-4xl w-full max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">
              Create Government e-Way Bill
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold">
              Generate logistics movement consignment notes &amp; Part-A/Part-B slip
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

          {/* TOP ROW: CONSIGNOR / SENDER (FROM) & AUTO-FILL LINKAGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* CONSIGNOR / SENDER CARD */}
            <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                CONSIGNOR / SENDER (FROM)
              </span>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-gray-900">
                  Legal Name: <span className="font-normal text-gray-700">{sender.legal_name || 'Welton Consignor'}</span>
                </p>
                <p className="font-bold text-gray-900">
                  GSTIN: <span className="font-mono text-emerald-700 font-bold">{sender.gstin || '05AAAPG7885R002'}</span>
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Dispatch From: {sender.location || 'Dehradun'} ({sender.state_code || '05'} - {sender.state || 'Uttarakhand'}) - {sender.pincode || '248001'}
                </p>
              </div>
            </div>

            {/* AUTO-FILL FROM SALES INVOICE (OPTIONAL) */}
            <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3 flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 w-fit">
                AUTO-FILL FROM SALES INVOICE (OPTIONAL)
              </span>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Select Sales Invoice
                </label>
                <select
                  value={selectedInvoice}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="">-- Select Sales Invoice --</option>
                  {invoiceOptions.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} ({inv.client_name || inv.customer_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* GOODS DETAILS SECTION (WIDE GRID) */}
          <div className="p-5 bg-gray-50/60 border border-gray-200/80 rounded-2xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 block">
              GOODS DETAILS (MANUAL ENTRY)
            </span>

            {/* Product Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Steel Rods"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                required
              />
            </div>

            {/* 4-Column Grid: HSN/SAC, Unit, Quantity, Taxable Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  HSN/SAC Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7214"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  required
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
                  <option value="PCS">PCS</option>
                  <option value="BOX">BOX</option>
                  <option value="KGS">KGS</option>
                  <option value="TON">TON</option>
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
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Taxable Value (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50000"
                  value={taxableValue}
                  onChange={(e) => setTaxableValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* GST Rate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  GST Rate (%)
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
            </div>
          </div>

          {/* INVOICE & LOGISTICS DETAILS (SIDE-BY-SIDE 2-COLUMN GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                placeholder="INV-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Transport Mode *
              </label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              >
                <option value="Road">Road</option>
                <option value="Rail">Rail</option>
                <option value="Air">Air</option>
                <option value="Ship">Ship</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Transport Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. M/S UTTARAYAN CO-OPERATIVE"
                value={transportCompanyName}
                onChange={(e) => setTransportCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Transporter GSTIN *
              </label>
              <input
                type="text"
                placeholder="05AAAAU6537D1Z0"
                value={transporterGstin}
                onChange={(e) => setTransporterGstin(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-semibold text-gray-800 uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                placeholder="MH-02-EH-9081"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-semibold text-gray-800 uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Distance (KMs) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 150"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Dispatch Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai warehouse"
                value={dispatchLocation}
                onChange={(e) => setDispatchLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Fixed Footer Submit Action */}
        <div className="px-7 py-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={handleGenerateEwayBill}
            disabled={loading}
            className="w-full py-3.5 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Generating e-Way Bill...' : 'Generate Official e-Way Bill'}
          </button>
        </div>

      </div>
    </div>
  );
}
