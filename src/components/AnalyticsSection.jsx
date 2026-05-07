import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { formatCurrency } from '../lib/formatCurrency';

const AnalyticsSection = () => {
    return (
        <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: '32px',
            width: '100%'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Finance Analytics</h2>
                    <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '4px 0 0 0' }}>Income vs Expense comparison</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#4B5563',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}>
                        <Calendar size={16} /> Yearly
                    </button>
                    <button style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#4B5563',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="chart-container" style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden' }}>
                <InteractiveBarChart />
            </div>
        </section>
    );
};

const InteractiveBarChart = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Mock Data matching the visual style (Dark Income, Light Expense)
    const data = [
        { month: 'Jan', income: 600, expense: 500 },
        { month: 'Feb', income: 750, expense: 450 },
        { month: 'Mar', income: 800, expense: 400 },
        { month: 'Apr', income: 890, expense: 760 },
        { month: 'May', income: 950, expense: 490 },
        { month: 'Jun', income: 800, expense: 510 },
        { month: 'Jul', income: 900, expense: 580 },
        { month: 'Aug', income: 990, expense: 600 },
        { month: 'Sep', income: 810, expense: 480 },
        { month: 'Oct', income: 780, expense: 540 },
        { month: 'Nov', income: 680, expense: 600 },
        { month: 'Dec', income: 900, expense: 650 },
    ];

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const maxValue = 1000; // Y-axis max
    const ySteps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    const barWidth = 12; // Width of individual bar
    const groupGap = 4; // Gap between income and expense bars
    const itemWidth = graphWidth / data.length; // Width allocated for each month

    // Helper to calculate bar height
    const getBarHeight = (value) => (value / maxValue) * graphHeight;
    const getY = (value) => height - padding.bottom - getBarHeight(value);

    // Hover Tooltip Position (Centered over the group)
    const getTooltipX = (index) => padding.left + (index * itemWidth) + (itemWidth / 2);

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredIndex(null)}
        >
            {/* Grid Lines & Y-Axis Labels */}
            {ySteps.map((val, i) => {
                const y = getY(val);
                return (
                    <g key={`grid-${i}`}>
                        {/* Dot visual for 0 line is solid, others dotted if needed. Reference image uses light solid/dotted lines. */}
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke={val === 0 ? "#E5E7EB" : "#F3F4F6"}
                            strokeWidth="1"
                            strokeDasharray={val === 0 ? "0" : "4 4"}
                        />
                        <text
                            x={padding.left - 10}
                            y={y + 4}
                            fontSize="11"
                            fill="#9CA3AF"
                            textAnchor="end"
                            fontFamily="sans-serif"
                        >
                            ₹{val}
                        </text>
                    </g>
                );
            })}

            {/* Bars and X-Axis Labels */}
            {data.map((item, i) => {
                const groupX = padding.left + (i * itemWidth); // Start x of the group slot
                const centerX = groupX + (itemWidth / 2);

                // Income Bar (Left)
                const incomeHeight = getBarHeight(item.income);
                const incomeY = getY(item.income);
                const incomeX = centerX - barWidth - (groupGap / 2);

                // Expense Bar (Right)
                const expenseHeight = getBarHeight(item.expense);
                const expenseY = getY(item.expense);
                const expenseX = centerX + (groupGap / 2);

                const isHovered = hoveredIndex === i;

                return (
                    <g key={`group-${i}`}>
                        {/* Invisible Hover Rect for easier targeting */}
                        <rect
                            x={groupX}
                            y={padding.top}
                            width={itemWidth}
                            height={graphHeight}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                        />

                        {/* Income Bar (Dark) */}
                        <rect
                            x={incomeX}
                            y={incomeY}
                            width={barWidth}
                            height={incomeHeight}
                            rx="4" // Rounded top corners
                            ry="4"
                            fill="#1E293B" // Dark Slate
                            opacity={isHovered ? 0.8 : 1}
                            style={{ transition: 'opacity 0.2s' }}
                            pointerEvents="none" // Let hover pass to the group rect
                        />

                        {/* Expense Bar (Light) */}
                        <rect
                            x={expenseX}
                            y={expenseY}
                            width={barWidth}
                            height={expenseHeight}
                            rx="4"
                            ry="4"
                            fill="#E2E8F0" // Light Slate
                            opacity={isHovered ? 0.8 : 1}
                            style={{ transition: 'opacity 0.2s' }}
                            pointerEvents="none"
                        />

                        {/* X-Axis Label */}
                        <text
                            x={centerX}
                            y={height - 10}
                            fontSize="11"
                            fill="#9CA3AF"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                        >
                            {item.month}
                        </text>
                    </g>
                );
            })}

            {/* Tooltip */}
            {hoveredIndex !== null && (
                <g transform={`translate(${getTooltipX(hoveredIndex)}, ${height / 2 - 50})`}>
                    {/* Tooltip Background */}
                    <rect
                        x="-60"
                        y="-40"
                        width="120"
                        height="70"
                        rx="8"
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
                    />

                    {/* Tooltip Content */}
                    <text
                        x="0"
                        y="-20"
                        textAnchor="middle"
                        fontWeight="bold"
                        fontSize="13"
                        fill="#1F2937"
                        fontFamily="sans-serif"
                    >
                        {data[hoveredIndex].month}
                    </text>

                    {/* Income Row */}
                    <circle cx="-35" cy="0" r="4" fill="#1E293B" />
                    <text x="-25" y="4" fontSize="11" fill="#4B5563" textAnchor="start" fontFamily="sans-serif">
                        Inc: {formatCurrency(data[hoveredIndex].income)}
                    </text>

                    {/* Expense Row */}
                    <circle cx="-35" cy="18" r="4" fill="#E2E8F0" />
                    <text x="-25" y="22" fontSize="11" fill="#4B5563" textAnchor="start" fontFamily="sans-serif">
                        Exp: {formatCurrency(data[hoveredIndex].expense)}
                    </text>
                </g>
            )}
        </svg>
    );
};

export default AnalyticsSection;
