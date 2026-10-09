import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';

export default function GSTR3BTab({ dbGstr3b, formatCurrency, onFileGstr3b }) {
  const format = formatCurrency || ((val) => `₹${Number(val || 0).toLocaleString('en-IN')}`);

  return (
    <div id="invoice-print-area">
      {/* SCREEN DASHBOARD UI */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
        {dbGstr3b && typeof dbGstr3b.outward_taxable !== 'undefined' ? (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#F3E8FF', color: '#6B21A8', fontWeight: '850', fontSize: '0.75rem' }}>GSTR-3B COMPLIANCE</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> Status: Verified
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#0F172A', margin: '0.4rem 0 0.2rem 0' }}>Self-Declared Summary Return (Monthly)</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', margin: 0 }}>Aggregate outward liabilities set off against eligible input tax credits.</p>
              </div>
              <button 
                className="no-print"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(109,40,217,0.2)' }}
              >
                <FileText size={15} /> Download Report
              </button>
            </div>

            {/* Return Grid Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ border: '1px solid #F3E8FF', background: '#FAF5FF', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ color: '#6B21A8', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Outward Taxable Supplies (Sales)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Taxable Value:</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.outward_taxable || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Integrated Tax (IGST):</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.outward_igst || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Central Tax (CGST):</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.outward_cgst || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>State Tax (SGST):</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.outward_sgst || 0)}</span></div>
                  <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #E9D5FF', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: '#6B21A8', fontWeight: '800' }}>Total Liability:</span><span style={{ fontSize: '1rem', fontWeight: '900', color: '#6B21A8' }}>{format(dbGstr3b?.total_output_tax || 0)}</span></div>
                </div>
              </div>

              <div style={{ border: '1px solid #DCFCE7', background: '#F0FDF4', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Eligible Input Tax Credit (ITC)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible IGST Available:</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.eligible_itc_igst || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible Central Tax (CGST):</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.eligible_itc_cgst || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible State Tax (SGST):</span><span style={{ fontWeight: '800' }}>{format(dbGstr3b?.eligible_itc_sgst || 0)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Ineligible/Blocked Credit:</span><span style={{ fontWeight: '800' }}>{format(0)}</span></div>
                  <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #BBF7D0', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: '800' }}>Total Claimable ITC:</span><span style={{ fontSize: '1rem', fontWeight: '900', color: '#15803D' }}>{format(dbGstr3b?.total_eligible_itc || 0)}</span></div>
                </div>
              </div>
            </div>

            {/* Consolidated Liabilities Box */}
            <div style={{ padding: '1.25rem', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <h4 style={{ color: '#991B1B', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Final Net Tax Liability Payable (Cash Outflow)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Net IGST Payable', val: dbGstr3b?.net_payable_igst || 0 },
                  { label: 'Net CGST Payable', val: dbGstr3b?.net_payable_cgst || 0 },
                  { label: 'Net SGST Payable', val: dbGstr3b?.net_payable_sgst || 0 }
                ].map((card, ix) => (
                  <div key={ix} style={{ background: 'white', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>{card.label}</p>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: '#991B1B' }}>{format(card.val)}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            Aggregating return summaries... If the service is temporarily unavailable, please verify connection.
          </div>
        )}
      </div>

      {/* FORMAL GSTR-3B PRINT DOCUMENT */}
      {dbGstr3b && (
        <div className="print-only w-full bg-white text-black font-sans p-8 print:p-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black tracking-widest uppercase mb-1">FORM GSTR-3B</h1>
            <p className="text-sm font-bold m-0">[See Rule 61(5)]</p>
          </div>
          
          <div className="mb-6 flex justify-between text-sm font-bold">
            <div>
              <p>1. GSTIN: _______________________</p>
              <p className="mt-2">2. Legal name of the registered person: _______________________</p>
            </div>
            <div className="text-right">
              <p>Financial Year: ___________</p>
              <p className="mt-2">Month: ____________</p>
            </div>
          </div>
          
          <h3 className="font-bold bg-gray-200 p-2 border border-black mb-0 text-sm">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</h3>
          <table className="w-full border-collapse border border-black text-xs mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left w-1/3">Nature of Supplies</th>
                <th className="border border-black p-2">Total Taxable Value</th>
                <th className="border border-black p-2">Integrated Tax</th>
                <th className="border border-black p-2">Central Tax</th>
                <th className="border border-black p-2">State/UT Tax</th>
                <th className="border border-black p-2">Cess</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_taxable)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_igst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_cgst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_sgst)}</td>
                <td className="border border-black p-2 text-right">{format(0)}</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="font-bold bg-gray-200 p-2 border border-black mb-0 text-sm">4. Eligible ITC</h3>
          <table className="w-full border-collapse border border-black text-xs mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left w-1/3">Details</th>
                <th className="border border-black p-2">Integrated Tax</th>
                <th className="border border-black p-2">Central Tax</th>
                <th className="border border-black p-2">State/UT Tax</th>
                <th className="border border-black p-2">Cess</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">(A) ITC Available (whether in full or part)</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_igst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_cgst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_sgst)}</td>
                <td className="border border-black p-2 text-right">{format(0)}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-bold bg-gray-200 p-2 border border-black mb-0 text-sm">6.1 Payment of tax</h3>
          <table className="w-full border-collapse border border-black text-xs mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left w-1/3">Description</th>
                <th className="border border-black p-2">Tax Payable</th>
                <th className="border border-black p-2">Tax Paid through ITC</th>
                <th className="border border-black p-2">Tax Paid in Cash</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">Integrated Tax</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_igst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_igst)}</td>
                <td className="border border-black p-2 text-right font-bold">{format(dbGstr3b?.net_payable_igst)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Central Tax</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_cgst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_cgst)}</td>
                <td className="border border-black p-2 text-right font-bold">{format(dbGstr3b?.net_payable_cgst)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">State/UT Tax</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.outward_sgst)}</td>
                <td className="border border-black p-2 text-right">{format(dbGstr3b?.eligible_itc_sgst)}</td>
                <td className="border border-black p-2 text-right font-bold">{format(dbGstr3b?.net_payable_sgst)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="mt-8 text-sm">
            <p className="font-bold mb-2">Verification:</p>
            <p className="leading-relaxed">I hereby solemnly affirm and declare that the information given herein above is true and correct to the best of my knowledge and belief and nothing has been concealed therefrom.</p>
            <div className="mt-12 flex justify-between">
                <div>
                  <p>Place: _________________</p>
                  <p className="mt-4">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p>Signature: ______________________</p>
                  <p className="mt-4">Name of Authorized Signatory</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
