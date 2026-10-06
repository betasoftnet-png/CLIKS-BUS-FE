import React, { useState } from 'react';
import { useCurrency } from '../context';
import { BarChart3, PieChart, TrendingUp, Package, Building2, DollarSign } from 'lucide-react';

/**
 * Monthly Sales Bar Chart Component
 * Visualizes sales performance over monthly intervals or orders data.
 */
export const MonthlySalesBarChart = ({ reportData, title = 'Monthly Sales Performance', subtitle = 'Monthly compilation of metric records and trends' }) => {
    const { formatCurrency } = useCurrency();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Process data to derive monthly or aggregated buckets
    const processSalesData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
            return months.map(m => ({ label: m, value: 0, count: 0 }));
        }

        const monthlyMap = {};
        months.forEach(m => { monthlyMap[m] = { label: m, value: 0, count: 0 }; });

        let hasValidDate = false;
        reportData.forEach(item => {
            const dateStr = item.date || item.purchase_date || item.created_at || item.invoice_date || item.bill_date;
            const val = parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.quantity || 0))));

            if (dateStr) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    const monthName = months[d.getMonth()];
                    monthlyMap[monthName].value += val;
                    monthlyMap[monthName].count += 1;
                    hasValidDate = true;
                }
            }
        });

        if (!hasValidDate) {
            return reportData.slice(0, 12).map((item, idx) => ({
                label: String(item.name || item.product_name || item.supplier_name || item.customer || item.purchase_number || item.billNo || item.order_number || item.ledger || item.hsn || item.category || `Item ${idx + 1}`).slice(0, 8),
                value: parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.stockVal || item.quantity || 0)))),
                count: 1
            }));
        }

        return Object.values(monthlyMap);
    };

    const chartData = processSalesData();
    const maxValue = Math.max(...chartData.map(d => d.value), 1000);
    const totalSales = chartData.reduce((sum, d) => sum + d.value, 0);

    const svgWidth = 650;
    const svgHeight = 220;
    const padding = { top: 25, right: 20, bottom: 40, left: 55 };
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;

    const barWidth = Math.max(12, Math.min(36, (graphWidth / chartData.length) * 0.6));
    const stepX = graphWidth / chartData.length;

    return (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={16} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{title}</h4>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>{subtitle}</span>
                    </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: '850', color: '#BE185D' }}>
                    Total: {formatCurrency(totalSales)}
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '280px' }}>
                    <defs>
                        <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#BE185D" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="salesBarHover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F43F5E" stopOpacity="1" />
                            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
                        </linearGradient>
                    </defs>

                    {/* Y Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                        const y = padding.top + graphHeight * (1 - pct);
                        const val = maxValue * pct;
                        return (
                            <g key={i}>
                                <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1" />
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fontWeight="600" fill="#94A3B8">
                                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars */}
                    {chartData.map((d, idx) => {
                        const barH = (d.value / maxValue) * graphHeight;
                        const x = padding.left + idx * stepX + (stepX - barWidth) / 2;
                        const y = padding.top + graphHeight - barH;
                        const isHovered = hoveredIdx === idx;

                        return (
                            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(barH, 3)}
                                    rx={4}
                                    fill={isHovered ? 'url(#salesBarHover)' : 'url(#salesBarGradient)'}
                                    style={{ transition: 'all 0.2s ease' }}
                                />
                                {/* X Axis Label */}
                                <text
                                    x={x + barWidth / 2}
                                    y={svgHeight - 12}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight={isHovered ? '800' : '600'}
                                    fill={isHovered ? '#BE185D' : '#64748B'}
                                >
                                    {d.label}
                                </text>

                                {/* Value callout on hover */}
                                {isHovered && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={Math.max(y - 6, padding.top - 5)}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="850"
                                        fill="#BE185D"
                                    >
                                        {formatCurrency(d.value)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

/**
 * Stock & Warehouse Pie / Donut Chart Component
 * Visualizes stock breakdown by category, warehouse allocation, or stock status.
 */
export const StockPieChart = ({ reportData, title = 'Stock & Warehouse Accordance', subtitle = 'Stock valuation distribution & warehouse placement' }) => {
    const { formatCurrency } = useCurrency();
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Determine types
    const isWarehouse = Array.isArray(reportData) && reportData.some(item => item.warehouse_name || item.warehouse_code || item.capacity_utilization !== undefined || (item.name && item.location && item.code && !item.sku && !item.selling_price));
    const isParty = Array.isArray(reportData) && reportData.some(item => item.outstanding_balance !== undefined || item.total_due !== undefined || item.total_spent !== undefined || (item.name && item.phone && !item.sku && !item.selling_price));

    // Process data into categorical slices
    const processStockData = () => {
        const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E'];

        if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
            return [
                { label: 'In Stock', value: 0, count: 0, color: '#10B981', displayVal: '0 units' },
                { label: 'Low Stock', value: 0, count: 0, color: '#F59E0B', displayVal: '0 units' },
                { label: 'Out of Stock', value: 0, count: 0, color: '#EF4444', displayVal: '0 units' }
            ];
        }

        // Check if report is warehouse capacity (id 15)
        if (isWarehouse) {
            const totalStock = reportData.reduce((sum, w) => sum + (parseFloat(w.total_quantity || 0)), 0);
            return reportData.map((w, idx) => {
                const qty = parseFloat(w.total_quantity || 0);
                const pct = totalStock > 0 ? ((qty / totalStock) * 100).toFixed(1) : 0;
                return {
                    label: w.warehouse_name || w.name || `Warehouse ${idx + 1}`,
                    value: qty > 0 ? qty : 1, // SVG needs non-zero to render slice
                    displayVal: `${pct}% Utilized (${qty} items)`,
                    color: colors[idx % colors.length]
                };
            });
        }

        // Check if report contains aging data
        const isAging = reportData.some(item => item.aging_current !== undefined || item.aging_30_60 !== undefined);
        if (isAging) {
            const sumCurrent = reportData.reduce((sum, p) => sum + (parseFloat(p.aging_current) || 0), 0);
            const sum30 = reportData.reduce((sum, p) => sum + (parseFloat(p.aging_30_60) || 0), 0);
            const sum60 = reportData.reduce((sum, p) => sum + (parseFloat(p.aging_60_plus) || 0), 0);
            const totalAging = sumCurrent + sum30 + sum60;

            if (totalAging === 0) {
                return [{ label: 'No Overdue', value: 1, displayVal: '₹0.00 Overdue', color: '#10B981' }];
            }

            const slices = [];
            if (sumCurrent > 0) slices.push({ label: 'Current (0-30 Days)', value: sumCurrent, displayVal: `${((sumCurrent/totalAging)*100).toFixed(1)}% (₹${sumCurrent.toFixed(2)})`, color: '#10B981' });
            if (sum30 > 0) slices.push({ label: '30-60 Days', value: sum30, displayVal: `${((sum30/totalAging)*100).toFixed(1)}% (₹${sum30.toFixed(2)})`, color: '#F59E0B' });
            if (sum60 > 0) slices.push({ label: '60+ Days', value: sum60, displayVal: `${((sum60/totalAging)*100).toFixed(1)}% (₹${sum60.toFixed(2)})`, color: '#EF4444' });
            return slices;
        }

        // Check if report contains scorecard data
        const isScorecard = reportData.some(item => item.scorecard && item.scorecard.total_orders !== undefined);
        if (isScorecard) {
            const totalOrders = reportData.reduce((sum, p) => sum + (p.scorecard.total_orders || 0), 0);
            const filtered = reportData.filter(p => p.scorecard.total_orders > 0);
            if (filtered.length === 0) {
                return [{ label: 'No Orders', value: 1, displayVal: '0 orders', color: '#64748B' }];
            }

            return filtered
                .sort((a, b) => b.scorecard.total_orders - a.scorecard.total_orders)
                .slice(0, 8)
                .map((p, idx) => {
                    const ord = p.scorecard.total_orders;
                    const pct = totalOrders > 0 ? ((ord / totalOrders) * 100).toFixed(1) : 0;
                    return {
                        label: p.name || p.company_name || `Supplier ${idx + 1}`,
                        value: ord,
                        displayVal: `${pct}% (${ord} orders)`,
                        color: colors[idx % colors.length]
                    };
                });
        }

        // Check if report is a party (customer/supplier)
        if (isParty) {
            const totalBal = reportData.reduce((sum, p) => sum + Math.abs(parseFloat(p.outstanding_balance || p.total_due || 0)), 0);
            const filtered = reportData.filter(p => Math.abs(parseFloat(p.outstanding_balance || p.total_due || 0)) > 0);
            
            if (filtered.length === 0) {
                return [{ label: 'Fully Settled', value: 1, displayVal: '₹0.00 Outstanding', color: '#10B981' }];
            }

            return filtered
                .sort((a, b) => Math.abs(parseFloat(b.outstanding_balance || b.total_due || 0)) - Math.abs(parseFloat(a.outstanding_balance || a.total_due || 0)))
                .slice(0, 8)
                .map((p, idx) => {
                    const rawBal = parseFloat(p.outstanding_balance || p.total_due || 0);
                    const bal = Math.abs(rawBal);
                    const pct = totalBal > 0 ? ((bal / totalBal) * 100).toFixed(1) : 0;
                    return {
                        label: p.name || p.company_name || `Party ${idx + 1}`,
                        value: bal,
                        displayVal: `${pct}% (₹${bal.toFixed(2)}${rawBal < 0 ? ' Adv' : ''})`,
                        color: rawBal < 0 ? '#10B981' : colors[idx % colors.length]
                    };
                });
        }

        // Group by category or stock status for generic products
        const catMap = {};

        reportData.forEach(item => {
            const cat = item.category || item.product_name || item.name || item.stock_status || item.location || 'General';
            const qty = parseFloat(item.quantity || item.stock_quantity || item.items || 1);
            const price = parseFloat(item.unit_price || item.selling_price || item.purchase_price || item.stockVal || 0);
            const val = qty * (price > 0 ? price : 1);

            if (!catMap[cat]) {
                catMap[cat] = { label: cat, value: 0, count: 0 };
            }
            catMap[cat].value += val;
            catMap[cat].count += qty;
        });

        const list = Object.values(catMap).map((c, i) => ({
            ...c,
            color: colors[i % colors.length]
        }));

        return list.length > 0 ? list.slice(0, 8) : [
            { label: 'In Stock', value: 0, count: 0, color: '#10B981', displayVal: '0 units' },
            { label: 'Low Stock', value: 0, count: 0, color: '#F59E0B', displayVal: '0 units' },
            { label: 'Out of Stock', value: 0, count: 0, color: '#EF4444', displayVal: '0 units' }
        ];
    };

    const slices = processStockData();
    const totalVal = slices.reduce((sum, s) => sum + s.value, 0);

    // SVG Donut Calculations
    const size = 180;
    const center = size / 2;
    const radius = 65;
    const strokeWidth = 24;

    let cumulativeAngle = 0;

    const getCoordinatesForAngle = (angle) => {
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: center + radius * Math.cos(rad),
            y: center + radius * Math.sin(rad)
        };
    };

    return (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PieChart size={16} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{title}</h4>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>{subtitle}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {/* SVG Donut Chart */}
                <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {slices.map((slice, idx) => {
                            const pct = totalVal > 0 ? slice.value / totalVal : 1 / slices.length;
                            const angle = pct * 360;
                            const startAngle = cumulativeAngle;
                            const endAngle = cumulativeAngle + angle;
                            cumulativeAngle += angle;

                            const start = getCoordinatesForAngle(startAngle);
                            const end = getCoordinatesForAngle(endAngle);
                            const largeArcFlag = angle > 180 ? 1 : 0;

                            const pathData = [
                                `M ${start.x} ${start.y}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
                            ].join(' ');

                            const isHovered = hoveredIndex === idx;

                            return (
                                <path
                                    key={idx}
                                    d={pathData}
                                    fill="none"
                                    stroke={slice.color}
                                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    style={{
                                        transition: 'all 0.25s ease',
                                        cursor: 'pointer',
                                        opacity: hoveredIndex === null || isHovered ? 1 : 0.6
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Donut Center Summary */}
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                    }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>{isWarehouse ? 'Warehouses' : (isAging ? 'Buckets' : (isScorecard ? 'Suppliers' : (isParty ? 'Parties' : 'Total SKUs')))}</span>
                        <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>
                            {hoveredIndex !== null ? slices[hoveredIndex].label.slice(0, 10) : (isAging ? slices.length : reportData.length)}
                        </span>
                    </div>
                </div>

                {/* Chart Legend */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
                    {slices.map((s, idx) => {
                        const pct = totalVal > 0 ? ((s.value / totalVal) * 100).toFixed(1) : (100 / slices.length).toFixed(1);
                        const isHovered = hoveredIndex === idx;

                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                                    padding: '0.5rem 0.65rem', borderRadius: '8px',
                                    background: isHovered ? '#F8FAFC' : 'transparent',
                                    border: isHovered ? '1px solid #E2E8F0' : '1px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.label}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>
                                        {s.displayVal || `${pct}% (${s.count ? s.count + ' units' : formatCurrency(s.value)})`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MonthlySalesBarChart;
