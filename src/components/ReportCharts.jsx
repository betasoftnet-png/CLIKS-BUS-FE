import React, { useState } from 'react';
import { useCurrency } from '../context';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

/**
 * Helper to process sales data into monthly buckets or top items.
 * Strictly enforces that future timelines (dates > now) are excluded for sales reports.
 */
export const processSalesData = (reportData, isSales = true) => {
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0 to 11

    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        // If sales, only show months up to current month (e.g. Jan-Nov)
        const visibleMonths = isSales ? allMonths.slice(0, currentMonthIdx + 1) : allMonths;
        return visibleMonths.map(m => ({ label: m, value: 0, count: 0 }));
    }

    // Check if the dataset is strictly for a past year (e.g. 2025)
    let isPastYearOnly = false;
    const detectedYears = new Set();

    reportData.forEach(item => {
        const dateStr = item.date || item.purchase_date || item.created_at || item.invoice_date || item.bill_date;
        if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) detectedYears.add(d.getFullYear());
        }
    });

    if (detectedYears.size > 0 && Array.from(detectedYears).every(y => y < currentYear)) {
        isPastYearOnly = true;
    }

    // For sales in the current year, do not include future months (e.g. December when currently in November)
    const visibleMonths = (isSales && !isPastYearOnly)
        ? allMonths.slice(0, currentMonthIdx + 1)
        : allMonths;

    const monthlyMap = {};
    visibleMonths.forEach(m => { monthlyMap[m] = { label: m, value: 0, count: 0 }; });

    let hasValidDate = false;
    reportData.forEach(item => {
        const dateStr = item.date || item.purchase_date || item.created_at || item.invoice_date || item.bill_date;
        const val = parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.quantity || 0))));

        if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                // STRICT CHECK: Future timelines cannot be included in sales reports
                if (isSales && d > now) return;

                const monthName = allMonths[d.getMonth()];
                if (monthlyMap[monthName]) {
                    monthlyMap[monthName].value += val;
                    monthlyMap[monthName].count += 1;
                    hasValidDate = true;
                }
            }
        }
    });

    if (!hasValidDate) {
        return reportData.slice(0, 12).map((item, idx) => {
            const rawName = String(item.name || item.product_name || item.supplier_name || item.customer || item.purchase_number || item.billNo || item.order_number || item.ledger || item.hsn || item.category || `Item ${idx + 1}`);
            const shortLabel = rawName.length > 14 ? rawName.slice(0, 12) + '...' : rawName;
            return {
                label: shortLabel,
                value: parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.stockVal || item.quantity || 0)))),
                count: 1
            };
        });
    }

    return Object.values(monthlyMap);
};

/**
 * Monthly Sales Bar Chart Component
 */
export const MonthlySalesBarChart = ({ 
    reportData, 
    title = 'Monthly Sales Performance', 
    subtitle = 'Monthly compilation of metric records and trends', 
    isSales = true,
    hideContainer = false 
}) => {
    const { formatCurrency } = useCurrency();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const chartData = processSalesData(reportData, isSales);
    const maxValue = Math.max(...chartData.map(d => d.value), 1000);
    const totalSales = Array.isArray(reportData) 
        ? reportData.reduce((sum, item) => {
            const dateStr = item.date || item.created_at || item.invoice_date;
            if (isSales && dateStr && new Date(dateStr) > new Date()) return sum;
            return sum + parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.stockVal || item.quantity || 0))));
        }, 0) 
        : 0;

    const svgWidth = 650;
    const svgHeight = 220;
    const padding = { top: 25, right: 20, bottom: 40, left: 55 };
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;

    const barWidth = Math.max(12, Math.min(36, (graphWidth / (chartData.length || 1)) * 0.6));
    const stepX = graphWidth / (chartData.length || 1);

    const chartBody = (
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
                                {val >= 10000000 ? `${(val / 10000000).toFixed(1)}Cr` : (val >= 100000 ? `${(val / 100000).toFixed(0)}L` : (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)))}
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
                                <g>
                                    <rect 
                                        x={Math.max(x + barWidth / 2 - 50, padding.left)} 
                                        y={Math.max(y - 26, padding.top - 15)} 
                                        width={100} 
                                        height={20} 
                                        rx={4} 
                                        fill="#0F172A" 
                                    />
                                    <text
                                        x={Math.max(x + barWidth / 2, padding.left + 50)}
                                        y={Math.max(y - 12, padding.top - 1)}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fontWeight="850"
                                        fill="#FFFFFF"
                                    >
                                        {formatCurrency(d.value)}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );

    if (hideContainer) return chartBody;

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
            {chartBody}
        </div>
    );
};

/**
 * Monthly Sales Line / Area Trend Chart Component
 */
export const MonthlySalesLineChart = ({ 
    reportData, 
    title = 'Sales Trend Analysis', 
    subtitle = 'Smooth line progression and turnover trajectory', 
    isSales = true,
    hideContainer = false 
}) => {
    const { formatCurrency } = useCurrency();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const chartData = processSalesData(reportData, isSales);
    const maxValue = Math.max(...chartData.map(d => d.value), 1000);
    const totalSales = Array.isArray(reportData) 
        ? reportData.reduce((sum, item) => {
            const dateStr = item.date || item.created_at || item.invoice_date;
            if (isSales && dateStr && new Date(dateStr) > new Date()) return sum;
            return sum + parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.stockVal || item.quantity || 0))));
        }, 0) 
        : 0;

    const svgWidth = 650;
    const svgHeight = 220;
    const padding = { top: 25, right: 25, bottom: 40, left: 55 };
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;

    const n = chartData.length;
    const points = chartData.map((d, i) => {
        const x = padding.left + (n === 1 ? graphWidth / 2 : (i / (n - 1)) * graphWidth);
        const y = padding.top + graphHeight * (1 - (d.value / maxValue));
        return { x, y, data: d, index: i };
    });

    // Build SVG path strings
    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        const bottomY = padding.top + graphHeight;
        areaPath = `M ${points[0].x} ${bottomY} L ${points[0].x} ${points[0].y} ` +
            points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
            ` L ${points[points.length - 1].x} ${bottomY} Z`;
    }

    const chartBody = (
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '280px' }}>
                <defs>
                    <linearGradient id="salesLineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#BE185D" stopOpacity="0.03" />
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
                                {val >= 10000000 ? `${(val / 10000000).toFixed(1)}Cr` : (val >= 100000 ? `${(val / 100000).toFixed(0)}L` : (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)))}
                            </text>
                        </g>
                    );
                })}

                {/* Area under line */}
                {areaPath && (
                    <path d={areaPath} fill="url(#salesLineAreaGrad)" />
                )}

                {/* Trend Line */}
                {linePath && (
                    <path d={linePath} fill="none" stroke="#BE185D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Data Points and X labels */}
                {points.map((p, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                        <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
                            {/* Hover highlight halo */}
                            {isHovered && (
                                <circle cx={p.x} cy={p.y} r={10} fill="#FCE7F3" opacity={0.8} />
                            )}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? 6 : 4}
                                fill={isHovered ? '#BE185D' : '#FFFFFF'}
                                stroke="#BE185D"
                                strokeWidth={isHovered ? 3 : 2}
                                style={{ transition: 'all 0.2s ease' }}
                            />

                            {/* X Axis Label */}
                            <text
                                x={p.x}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight={isHovered ? '850' : '600'}
                                fill={isHovered ? '#BE185D' : '#64748B'}
                            >
                                {p.data.label}
                            </text>

                            {/* Tooltip on hover */}
                            {isHovered && (
                                <g>
                                    <rect 
                                        x={Math.max(p.x - 50, padding.left)} 
                                        y={Math.max(p.y - 30, padding.top - 18)} 
                                        width={100} 
                                        height={22} 
                                        rx={5} 
                                        fill="#0F172A" 
                                        boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                                    />
                                    <text
                                        x={Math.max(p.x, padding.left + 50)}
                                        y={Math.max(p.y - 15, padding.top - 3)}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fontWeight="850"
                                        fill="#FFFFFF"
                                    >
                                        {formatCurrency(p.data.value)}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );

    if (hideContainer) return chartBody;

    return (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={16} />
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
            {chartBody}
        </div>
    );
};

/**
 * Stock & Warehouse Pie / Donut Chart Component
 * Also supports Sales distribution by customer, item, or status.
 */
export const StockPieChart = ({ 
    reportData, 
    title = 'Distribution & Share Breakdown', 
    subtitle = 'Proportional valuation and contributor metrics', 
    isSales = false,
    hideContainer = false 
}) => {
    const { formatCurrency } = useCurrency();
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Determine types
    const isWarehouse = Array.isArray(reportData) && reportData.some(item => item.warehouse_name || item.warehouse_code || item.capacity_utilization !== undefined || (item.name && item.location && item.code && !item.sku && !item.selling_price));
    const isParty = Array.isArray(reportData) && reportData.some(item => item.outstanding_balance !== undefined || item.total_due !== undefined || item.total_spent !== undefined || (item.name && item.phone && !item.sku && !item.selling_price));
    const isTrialBalance = Array.isArray(reportData) && reportData.some(item => item.ledger && (item.debit !== undefined || item.credit !== undefined));
    const isProfitLoss = reportData && !Array.isArray(reportData) && reportData.gross_revenue !== undefined;
    const isBalanceSheet = reportData && !Array.isArray(reportData) && reportData.assets !== undefined && reportData.liabilities !== undefined;
    const isSalesData = isSales || (Array.isArray(reportData) && reportData.some(item => item.order_number || item.customer || item.grand_total));

    // Process data into categorical slices
    const processPieData = () => {
        const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F43F5E', '#14B8A6'];

        if (!reportData || (!Array.isArray(reportData) && !isProfitLoss && !isBalanceSheet) || (Array.isArray(reportData) && reportData.length === 0)) {
            return [
                { label: 'Active', value: 1, count: 0, color: '#10B981', displayVal: 'No Data' }
            ];
        }

        // SALES REPORT: Group sales by Customer or Product
        if (isSalesData && Array.isArray(reportData)) {
            const customerMap = {};
            let totalSalesVal = 0;
            const now = new Date();

            reportData.forEach(item => {
                const dateStr = item.date || item.created_at || item.invoice_date;
                if (dateStr && new Date(dateStr) > now) return; // Exclude future sales records

                const cust = item.customer || item.client || item.buyer_name || item.product_name || item.name || 'Walk-in Customer';
                const amt = parseFloat(item.grand_total || item.total_sales || item.revenue || item.total_amount || item.total || item.amount || 0);
                if (!customerMap[cust]) customerMap[cust] = 0;
                customerMap[cust] += amt;
                totalSalesVal += amt;
            });

            const sorted = Object.entries(customerMap).sort((a, b) => b[1] - a[1]);
            const top = sorted.slice(0, 6).map(([label, value], idx) => ({
                label,
                value: Math.max(value, 0.01),
                displayVal: `${totalSalesVal > 0 ? ((value / totalSalesVal) * 100).toFixed(1) : 0}% (${formatCurrency(value)})`,
                color: colors[idx % colors.length]
            }));

            const othersVal = sorted.slice(6).reduce((s, [, v]) => s + v, 0);
            if (othersVal > 0) {
                top.push({
                    label: 'Other Customers',
                    value: othersVal,
                    displayVal: `${totalSalesVal > 0 ? ((othersVal / totalSalesVal) * 100).toFixed(1) : 0}% (${formatCurrency(othersVal)})`,
                    color: '#94A3B8'
                });
            }

            return top.length > 0 ? top : [{ label: 'No Sales Data', value: 1, displayVal: '₹0', color: '#CBD5E1' }];
        }

        if (isProfitLoss) {
            const list = [
                { label: 'COGS', value: parseFloat(reportData.cost_of_goods || 0), displayVal: formatCurrency(reportData.cost_of_goods || 0), color: '#F43F5E' },
                { label: 'Overheads', value: parseFloat(reportData.overheads || 0), displayVal: formatCurrency(reportData.overheads || 0), color: '#F59E0B' },
                { label: 'Net Profit', value: Math.max(parseFloat(reportData.net_profit || 0), 0), displayVal: formatCurrency(reportData.net_profit || 0), color: '#10B981' }
            ].filter(x => x.value > 0);
            return list.length > 0 ? list : [{ label: 'Empty P&L', value: 1, displayVal: '₹0' }];
        }

        if (isBalanceSheet) {
            const list = [
                { label: 'Cash in Hand', value: parseFloat(reportData.assets.cash || 0), displayVal: formatCurrency(reportData.assets.cash || 0), color: '#10B981' },
                { label: 'Bank Balances', value: parseFloat(reportData.assets.bank || 0), displayVal: formatCurrency(reportData.assets.bank || 0), color: '#3B82F6' },
                { label: 'Inventory', value: parseFloat(reportData.assets.inventory || 0), displayVal: formatCurrency(reportData.assets.inventory || 0), color: '#8B5CF6' },
                { label: 'Accounts Receivable', value: parseFloat(reportData.assets.receivables || 0), displayVal: formatCurrency(reportData.assets.receivables || 0), color: '#14B8A6' },
                { label: 'Fixed Assets', value: parseFloat(reportData.assets.fixed_assets || 0), displayVal: formatCurrency(reportData.assets.fixed_assets || 0), color: '#F59E0B' }
            ].filter(x => x.value > 0);
            return list.length > 0 ? list : [{ label: 'No Assets', value: 1, displayVal: '₹0' }];
        }

        // Warehouse capacity
        if (isWarehouse) {
            const totalStock = reportData.reduce((sum, w) => sum + (parseFloat(w.total_quantity || 0)), 0);
            return reportData.map((w, idx) => {
                const qty = parseFloat(w.total_quantity || 0);
                const pct = totalStock > 0 ? ((qty / totalStock) * 100).toFixed(1) : 0;
                return {
                    label: w.warehouse_name || w.name || `Warehouse ${idx + 1}`,
                    value: qty > 0 ? qty : 1,
                    displayVal: `${pct}% Utilized (${qty} items)`,
                    color: colors[idx % colors.length]
                };
            });
        }

        if (isTrialBalance) {
            const list = reportData.filter(item => (item.debit || 0) > 0 || (item.credit || 0) > 0).map((item, i) => {
                const isDr = (item.debit || 0) > 0;
                const val = isDr ? item.debit : item.credit;
                return {
                    label: `${item.ledger} ${isDr ? '(DR)' : '(CR)'}`,
                    value: val,
                    displayVal: `₹${val.toLocaleString()}`,
                    color: isDr ? ['#3B82F6', '#10B981', '#06B6D4', '#6366F1'][i % 4] : ['#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899'][i % 4]
                };
            });
            return list.length > 0 ? list : [{ label: 'Empty Ledger', value: 1, displayVal: '₹0' }];
        }

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

        // Generic category grouping
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
            { label: 'Active', value: 1, count: 0, color: '#10B981', displayVal: '100%' }
        ];
    };

    const slices = processPieData();
    const totalVal = slices.reduce((sum, s) => sum + s.value, 0);

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

    const chartBody = (
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
                    <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                        {isSalesData ? 'Contributors' : (isWarehouse ? 'Warehouses' : (isParty ? 'Parties' : 'Segments'))}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                        {hoveredIndex !== null ? slices[hoveredIndex].label.slice(0, 10) : slices.length}
                    </span>
                </div>
            </div>

            {/* Chart Legend */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
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
                                padding: '0.45rem 0.6rem', borderRadius: '8px',
                                background: isHovered ? '#F8FAFC' : 'transparent',
                                border: isHovered ? '1px solid #E2E8F0' : '1px solid transparent',
                                cursor: 'pointer', transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
    );

    if (hideContainer) return chartBody;

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
            {chartBody}
        </div>
    );
};

/**
 * Universal Interactive Report Chart with Live Chart-Type Switching
 * Supports 📊 Bar Chart, 📈 Line Chart, and 🥧 Donut/Pie Chart on demand.
 */
export const UniversalReportChart = ({
    reportData,
    title = 'Report Analytics & Trends',
    subtitle = 'Comprehensive metric overview',
    defaultChartType = 'bar',
    isSales = false
}) => {
    const { formatCurrency } = useCurrency();
    const [chartType, setChartType] = useState(defaultChartType);

    const totalSales = Array.isArray(reportData) 
        ? reportData.reduce((sum, item) => {
            const dateStr = item.date || item.created_at || item.invoice_date;
            if (isSales && dateStr && new Date(dateStr) > new Date()) return sum;
            return sum + parseFloat(item.due_amount !== undefined ? item.due_amount : (item.paid_amount !== undefined ? item.paid_amount : ((item.inflow !== undefined || item.outflow !== undefined) ? (parseFloat(item.inflow || 0) + parseFloat(item.outflow || 0)) : (item.grand_total || item.total_sales || item.revenue || item.amount || item.total || item.total_amount || item.value || item.stockVal || item.quantity || 0))));
        }, 0) 
        : 0;

    return (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Header with Title and Dynamic Chart Selector Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {chartType === 'line' ? <TrendingUp size={16} /> : (chartType === 'pie' ? <PieChart size={16} /> : <BarChart3 size={16} />)}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                            {title}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '500' }}>{subtitle}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {totalSales > 0 && (
                        <div style={{ background: '#F8FAFC', padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: '850', color: '#BE185D', whiteSpace: 'nowrap' }}>
                            Total: {formatCurrency(totalSales)}
                        </div>
                    )}

                    {/* Interactive Chart Type Toggle: Bar, Line, Pie */}
                    <div style={{ display: 'flex', gap: '3px', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        {[
                            { id: 'bar', label: 'Bar', icon: BarChart3 },
                            { id: 'line', label: 'Line', icon: TrendingUp },
                            { id: 'pie', label: 'Pie', icon: PieChart }
                        ].map(t => {
                            const IconComponent = t.icon;
                            const isActive = chartType === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setChartType(t.id)}
                                    title={`Switch to ${t.label} Chart`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '0.3rem 0.55rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: isActive ? '#FFFFFF' : 'transparent',
                                        color: isActive ? '#BE185D' : '#64748B',
                                        fontWeight: '800',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <IconComponent size={13} />
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Dynamic Chart Body */}
            {chartType === 'bar' && (
                <MonthlySalesBarChart 
                    reportData={reportData} 
                    title={title} 
                    subtitle={subtitle} 
                    isSales={isSales} 
                    hideContainer={true} 
                />
            )}

            {chartType === 'line' && (
                <MonthlySalesLineChart 
                    reportData={reportData} 
                    title={title} 
                    subtitle={subtitle} 
                    isSales={isSales} 
                    hideContainer={true} 
                />
            )}

            {chartType === 'pie' && (
                <StockPieChart 
                    reportData={reportData} 
                    title={title} 
                    subtitle={subtitle} 
                    isSales={isSales} 
                    hideContainer={true} 
                />
            )}
        </div>
    );
};

export default UniversalReportChart;
