import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';

export default function GSTR3BTab({ dbGstr3b, formatCurrency, onFileGstr3b }) {
  const format = formatCurrency || ((val) => `₹${Number(val || 0).toLocaleString('en-IN')}`);

  return (
    <div id="invoice-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
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
  );
}
