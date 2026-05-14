import React, { useState, useEffect } from 'react';
import { 
    Receipt, 
    TrendingUp, 
    DollarSign, 
    ShieldAlert, 
    Search, 
    ArrowRightLeft, 
    Calendar, 
    Activity,
    AlertTriangle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import '../../App.css';

const AdminSales = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [totals, setTotals] = useState({
        count: 0,
        total_volume: 0,
        total_collected: 0,
        total_tax: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminService.getGlobalSalesData();
            if (res && res.data) {
                setInvoices(res.data.invoices || []);
                setTotals(res.data.totals || { count: 0, total_volume: 0, total_collected: 0, total_tax: 0 });
            }
        } catch (err) {
            console.error("Failed to load global sales:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculation derived for Reconciliation Dashboard
    const unpaidVolume = totals.total_volume - totals.total_collected;
    const driftPercentage = totals.total_volume > 0 
        ? Math.round((unpaidVolume / totals.total_volume) * 100) 
        : 0;

    const filteredInvoices = invoices
        .filter(inv => {
            if (statusFilter === 'ALL') return true;
            return (inv.status || '').toUpperCase() === statusFilter.toUpperCase();
        })
        .filter(inv => {
            const query = searchQuery.toLowerCase();
            return (
                (inv.invoice_number || '').toLowerCase().includes(query) ||
                (inv.client_name || '').toLowerCase().includes(query) ||
                (inv.business_name || '').toLowerCase().includes(query) ||
                (inv.username || '').toLowerCase().includes(query)
            );
        });

    const getStatusStyle = (status) => {
        const clean = (status || '').toUpperCase();
        switch(clean) {
            case 'PAID':
                return { bg: '#DCF2E4', color: '#1B6B3A', icon: <CheckCircle size={12} /> };
            case 'PARTIALLY PAID':
                return { bg: '#FEF3C7', color: '#D97706', icon: <Activity size={12} /> };
            case 'CANCELLED':
                return { bg: '#FEE2E2', color: '#DC2626', icon: <AlertTriangle size={12} /> };
            case 'DRAFT':
            default:
                return { bg: '#F3F4F6', color: '#4B5563', icon: <Calendar size={12} /> };
        }
    };

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Dashboard Header */}
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>FINANCE OPS</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Platform Sales Control</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Global aggregated invoicing logs, tax reconciliation, and tenant receivables monitoring.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={fetchData}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Stream
                    </button>
                </div>
            </div>

            {/* Analytics Snapshot Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Stat 1: Global Invoiced */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', color: '#4F46E5', opacity: 0.04 }}>
                        <DollarSign size={100} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748B', fontWeight: 750, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Invoiced</span>
                        <div style={{ background: '#EEF2FF', color: '#4F46E5', padding: '6px', borderRadius: '10px' }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                        ₹{Number(totals.total_volume).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Aggregated across {totals.count} invoices</p>
                </div>

                {/* Stat 2: Collected Revenues */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', color: '#10B981', opacity: 0.04 }}>
                        <ArrowRightLeft size={100} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748B', fontWeight: 750, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Collected</span>
                        <div style={{ background: '#ECFDF5', color: '#10B981', padding: '6px', borderRadius: '10px' }}>
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                        ₹{Number(totals.total_collected).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>{Math.round((totals.total_collected / (totals.total_volume || 1)) * 100)}% Settlement Efficiency</p>
                </div>

                {/* Stat 3: Platform Tax Pool */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', color: '#F59E0B', opacity: 0.04 }}>
                        <ShieldAlert size={100} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748B', fontWeight: 750, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Collected Tax</span>
                        <div style={{ background: '#FFFBEB', color: '#F59E0B', padding: '6px', borderRadius: '10px' }}>
                            <Receipt size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                        ₹{Number(totals.total_tax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Central tax matrix holding vector</p>
                </div>

                {/* Stat 4: Reconciliation Drift (Roadmap Module 4!) */}
                <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '20px', padding: '1.5rem', border: 'none', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)', position: 'relative', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#94A3B8', fontWeight: 750, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receivables Drift</span>
                        <span style={{ background: driftPercentage > 30 ? '#EF4444' : '#3B82F6', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900 }}>
                            {driftPercentage}% Drift
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
                        ₹{Number(unpaidVolume).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Outstanding tenant balances requiring settlement</p>
                </div>
            </div>

            {/* Live Invoices Registry Explorer */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                
                {/* Filter Toolbar */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                        <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', flex: 1, position: 'relative', margin: 0, maxWidth: '400px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search Invoices, Businesses, or Clients..." 
                                className="dashboard-search-input"
                                style={{ background: 'transparent', width: '100%', paddingLeft: '36px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', background: '#F8FAFC', outline: 'none' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIALLY PAID">Partially Paid</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 750 }}>Showing {filteredInvoices.length} records</span>
                </div>

                {/* Responsive Matrix Grid Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Invoice #</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Source Tenant</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>End Client</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Invoice Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Collected Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Total Gross</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: '#4F46E5' }} />
                                        Streaming platform sales dataset...
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                                        No business invoices found matching filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => {
                                    const statusConf = getStatusStyle(invoice.status);
                                    return (
                                        <tr key={invoice.id} className="table-row-hover" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                                                {invoice.invoice_number || `INV-${invoice.id}`}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 750, color: '#1E293B', fontSize: '0.85rem' }}>
                                                    {invoice.business_name || 'Personal Client'}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                                                    @{invoice.username}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                                                {invoice.client_name || 'Walk-in Client'}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                                                {new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '4px', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 800, 
                                                    background: statusConf.bg, 
                                                    color: statusConf.color 
                                                }}>
                                                    {statusConf.icon} {invoice.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 750, color: '#0F172A', fontSize: '0.85rem' }}>
                                                ₹{Number(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 900, color: '#0F172A', fontSize: '0.85rem' }}>
                                                ₹{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover {
                    background: #F8FAFC !important;
                }
            `}</style>
        </div>
    );
};

export default AdminSales;
