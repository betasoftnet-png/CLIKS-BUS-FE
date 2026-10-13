import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    BarChart3, 
    Download, 
    Calendar, 
    RefreshCw, 
    Layers, 
    ClipboardList, 
    Activity, 
    DollarSign, 
    ShieldAlert, 
    PackageCheck,
    Search,
    FileSpreadsheet
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const ManufacturingReports = () => {
    const { formatCurrency } = useCurrency();

    const [activeReport, setActiveReport] = useState('production-orders');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const REPORT_TABS = [
        { id: 'production-orders', label: '1. Production Orders', icon: ClipboardList },
        { id: 'material-consumption', label: '2. Material Consumption', icon: Activity },
        { id: 'material-usage', label: '3. Raw Material Usage', icon: Layers },
        { id: 'planned-vs-actual', label: '4. Planned vs Actual', icon: BarChart3 },
        { id: 'wastage-rejection', label: '5. Wastage & Rejections', icon: ShieldAlert },
        { id: 'bom-recipes', label: '6. BOM Recipes Directory', icon: Layers },
        { id: 'finished-goods', label: '7. Finished Goods Output', icon: PackageCheck },
        { id: 'production-cost', label: '8. Production Cost Analysis', icon: DollarSign }
    ];

    // Fetch Report Data
    const { data: reportResult, isLoading, refetch } = useQuery({
        queryKey: ['mfgReport', activeReport, startDate, endDate, statusFilter],
        queryFn: () => manufacturingService.getReports(activeReport, {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            status: statusFilter || undefined
        })
    });

    const rawData = reportResult?.data || [];

    // Filter by client search query
    const filteredData = rawData.filter(row => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return Object.values(row).some(val => 
            val && String(val).toLowerCase().includes(q)
        );
    });

    // Export to CSV
    const exportToCSV = () => {
        if (filteredData.length === 0) return alert('No data to export');
        const headers = Object.keys(filteredData[0]).filter(k => typeof filteredData[0][k] !== 'object');
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of filteredData) {
            const values = headers.map(h => {
                const val = row[h];
                const escaped = String(val !== undefined && val !== null ? val : '').replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#F3E8FF', borderRadius: '10px', color: '#7C3AED' }}>
                            <BarChart3 size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Manufacturing & Production Reports
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                        Audit trails, yield efficiency, input material consumption, and actual unit costing analytics.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={exportToCSV}
                        style={{
                            padding: '0.65rem 1.15rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                            color: '#334155',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <Download size={16} /> Export to CSV
                    </button>
                    <button
                        onClick={() => refetch()}
                        style={{
                            padding: '0.65rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#1B6B3A',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <RefreshCw size={16} /> Run Report
                    </button>
                </div>
            </div>

            {/* Report Selection Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                {REPORT_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeReport === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            style={{
                                padding: '0.65rem 1rem',
                                borderRadius: '10px',
                                border: isActive ? '1px solid #10B981' : '1px solid #E2E8F0',
                                background: isActive ? '#ECFDF5' : '#FFFFFF',
                                color: isActive ? '#065F46' : '#475569',
                                fontWeight: '750',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Icon size={16} color={isActive ? '#047857' : '#64748B'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '1rem', background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Filter rows in active report..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>From:</span>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>To:</span>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                </div>

                {activeReport === 'production-orders' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', background: '#FFF' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                )}
            </div>

            {/* Dynamic Report Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={30} className="spin" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <p>Generating report...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94A3B8' }}>
                        <FileSpreadsheet size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                        <h3 style={{ color: '#1E293B', fontWeight: '700', marginBottom: '0.25rem' }}>No data records found</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Try clearing date filters or creating production transactions.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {Object.keys(filteredData[0])
                                        .filter(k => typeof filteredData[0][k] !== 'object' && k !== 'bom_snapshot' && k !== 'items')
                                        .map((colKey, idx) => (
                                            <th key={idx} style={{ padding: '12px 14px' }}>
                                                {colKey.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, rowIdx) => (
                                    <tr key={rowIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        {Object.keys(filteredData[0])
                                            .filter(k => typeof filteredData[0][k] !== 'object' && k !== 'bom_snapshot' && k !== 'items')
                                            .map((colKey, colIdx) => {
                                                const val = row[colKey];
                                                const isCost = colKey.includes('cost') || colKey.includes('spend');
                                                return (
                                                    <td key={colIdx} style={{ padding: '12px 14px', color: '#334155', fontWeight: colIdx === 0 ? '700' : 'normal' }}>
                                                        {isCost && typeof val === 'number' ? formatCurrency(val) : String(val !== null && val !== undefined ? val : '-')}
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManufacturingReports;
