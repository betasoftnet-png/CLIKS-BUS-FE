import React, { useState, useEffect } from 'react';
import { 
    Receipt, 
    Search, 
    Trash2, 
    Plus, 
    ShoppingBag, 
    Eye, 
    X,
    FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSavedBillingRecords, LOCAL_STORAGE_KEY } from './SimpleBilling';

const BillingRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        setRecords(getSavedBillingRecords());
    }, []);

    const handleDeleteRecord = (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete bill #${id}?`)) {
            const updated = records.filter(r => r.id !== id);
            setRecords(updated);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            if (selectedRecord?.id === id) {
                setSelectedRecord(null);
            }
        }
    };

    const handleClearAll = () => {
        if (records.length === 0) return;
        if (window.confirm('Are you sure you want to clear ALL billing records? This action cannot be undone.')) {
            setRecords([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setSelectedRecord(null);
        }
    };

    const filteredRecords = records.filter(r => {
        const term = searchTerm.toLowerCase();
        const customerMatch = r.customerName?.toLowerCase().includes(term);
        const billIdMatch = r.id?.toLowerCase().includes(term);
        const productMatch = r.products?.some(p => p.name?.toLowerCase().includes(term));
        return customerMatch || billIdMatch || productMatch;
    });

    const grandTotalRevenue = records.reduce((sum, r) => sum + (parseFloat(r.grandTotal) || 0), 0);
    const grandTotalItemsSold = records.reduce((sum, r) => sum + (parseFloat(r.totalQuantity) || 0), 0);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', marginBottom: '0.25rem' }}>
                        <Receipt size={22} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billing Module</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        Billing Records
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                        View, search, and manage all your submitted customer bills.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        id="btn-create-new-bill"
                        onClick={() => navigate('/billing/simple')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1.25rem',
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={16} /> + Create New Bill
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {/* Card 1: Total Bills */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        <span>Total Bills Issued</span>
                        <Receipt size={18} style={{ color: '#1B6B3A' }} />
                    </div>
                    <div id="stat-total-bills" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '0.5rem' }}>
                        {records.length}
                    </div>
                </div>

                {/* Card 2: Total Items Sold */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        <span>Total Items Sold</span>
                        <ShoppingBag size={18} style={{ color: '#0284C7' }} />
                    </div>
                    <div id="stat-total-items" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '0.5rem' }}>
                        {grandTotalItemsSold}
                    </div>
                </div>

                {/* Card 3: Total Billing Revenue */}
                <div style={{
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid #BBF7D0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#166534', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        <span>Total Billing Revenue</span>
                        <FileSpreadsheet size={18} style={{ color: '#1B6B3A' }} />
                    </div>
                    <div id="stat-total-revenue" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1B6B3A', marginTop: '0.5rem' }}>
                        ₹{grandTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Filter & Table Section */}
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
            }}>
                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '280px',
                        maxWidth: '500px'
                    }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            id="input-search-records"
                            type="text"
                            placeholder="Search by customer name, bill ID, or product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.65rem 1rem 0.65rem 2.6rem',
                                borderRadius: '12px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                outline: 'none',
                                background: '#F8FAFC'
                            }}
                        />
                    </div>

                    {records.length > 0 && (
                        <button
                            id="btn-clear-all-records"
                            onClick={handleClearAll}
                            style={{
                                background: '#FEE2E2',
                                color: '#DC2626',
                                border: 'none',
                                padding: '0.55rem 1rem',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.825rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <Trash2 size={15} /> Clear All Records
                        </button>
                    )}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '0.85rem 1rem' }}>BILLING ORDER #</th>
                                <th style={{ padding: '0.85rem 1rem' }}>CUSTOMER NAME</th>
                                <th style={{ padding: '0.85rem 1rem' }}>DATE & TIME</th>
                                <th style={{ padding: '0.85rem 1rem' }}>PRODUCTS SUMMARY</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>TOTAL QUANTITY</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>GRAND TOTAL</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr 
                                    key={record.id}
                                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                >
                                    {/* Bill ID */}
                                    <td style={{ padding: '1rem', fontWeight: 800, color: '#1B6B3A' }}>
                                        #{record.id}
                                    </td>

                                    {/* Customer Name */}
                                    <td style={{ padding: '1rem', fontWeight: 700, color: '#0F172A' }}>
                                        {record.customerName}
                                    </td>

                                    {/* Date & Time */}
                                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.85rem' }}>
                                        {record.formattedDate}
                                    </td>

                                    {/* Products Summary */}
                                    <td style={{ padding: '1rem', color: '#334155' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {record.products?.slice(0, 2).map((p, idx) => (
                                                <span key={idx} style={{
                                                    background: '#F1F5F9',
                                                    color: '#334155',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600
                                                }}>
                                                    {p.name} ({p.quantity})
                                                </span>
                                            ))}
                                            {record.products?.length > 2 && (
                                                <span style={{
                                                    background: '#E2E8F0',
                                                    color: '#475569',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700
                                                }}>
                                                    +{record.products.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Total Quantity */}
                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                                        {record.totalQuantity}
                                    </td>

                                    {/* Grand Total */}
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: '#1B6B3A', fontSize: '0.95rem' }}>
                                        ₹{parseFloat(record.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                style={{
                                                    background: '#F0FDF4',
                                                    color: '#1B6B3A',
                                                    border: 'none',
                                                    padding: '0.4rem 0.65rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}
                                                title="View Bill Details"
                                            >
                                                <Eye size={15} /> Details
                                            </button>

                                            <button
                                                onClick={(e) => handleDeleteRecord(record.id, e)}
                                                style={{
                                                    background: '#FEE2E2',
                                                    color: '#EF4444',
                                                    border: 'none',
                                                    padding: '0.4rem 0.65rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title="Delete Bill"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3.5rem', textAlign: 'center', color: '#94A3B8' }}>
                                        <Receipt size={36} style={{ color: '#CBD5E1', marginBottom: '0.5rem' }} />
                                        <h4 style={{ margin: 0, fontWeight: 700, color: '#64748B' }}>No Billing Records Found</h4>
                                        <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.85rem' }}>
                                            {searchTerm ? 'No results matched your search query.' : 'You have not submitted any bills yet.'}
                                        </p>
                                        {!searchTerm && (
                                            <button
                                                onClick={() => navigate('/billing/simple')}
                                                style={{
                                                    background: '#1B6B3A',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    padding: '0.6rem 1.2rem',
                                                    borderRadius: '10px',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Create First Bill
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: View Bill Details */}
            {selectedRecord && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        maxWidth: '650px',
                        width: '100%',
                        padding: '2rem',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ background: '#F0FDF4', color: '#1B6B3A', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                                    #{selectedRecord.id}
                                </span>
                                <h2 style={{ margin: '0.4rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                                    Bill Details
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Customer & Timestamp Info */}
                        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 700 }}>Customer Name</span>
                                <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{selectedRecord.customerName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 700 }}>Date & Time</span>
                                <span style={{ color: '#475569', fontSize: '0.85rem' }}>{selectedRecord.formattedDate}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
                            Products List
                        </h4>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', color: '#64748B', fontWeight: 800, borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '0.6rem 0.85rem' }}>Product</th>
                                        <th style={{ padding: '0.6rem 0.85rem' }}>Selling Rate</th>
                                        <th style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '0.6rem 0.85rem', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRecord.products?.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                                            <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>₹{parseFloat(item.rate).toFixed(2)}</td>
                                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#1B6B3A' }}>
                                                ₹{parseFloat(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer Totals */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #F1F5F9', paddingTop: '1rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Total Items</span>
                                <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>{selectedRecord.totalQuantity}</strong>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Grand Total</span>
                                <strong style={{ fontSize: '1.4rem', color: '#1B6B3A', fontWeight: 900 }}>
                                    ₹{parseFloat(selectedRecord.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingRecords;
