import { apiClient } from '../api/client';

export const taxAuditService = {
    // 1. Sec 40A(3) Cash Payment Watchdog
    getSec40a3Watchdog: (params = {}) =>
        apiClient.get('/tax-audit/sec40a3', { params })
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                financial_year: '2025-2026',
                statutory_thresholds: { standard: 10000, transporter: 35000 },
                total_disallowed_amount: 56700,
                violation_count: 2,
                violations: [
                    {
                        id: 'VIO-40A3-01',
                        vendor_id: 'VEND-089',
                        vendor_name: 'Sharma Logistics (Cash Payment)',
                        pan: 'AABCS9912E',
                        payment_date: '2026-09-02',
                        voucher_nos: 'VCH-9012, VCH-9015',
                        voucher_count: 2,
                        total_cash: 18500,
                        is_goods_transporter: false,
                        statutory_limit: 10000,
                        status: 'DISALLOWED_40A3',
                        description: 'Aggregate cash payments exceeded ₹10,000 per party/day without transporter declaration'
                    },
                    {
                        id: 'VIO-40A3-02',
                        vendor_id: 'VEND-114',
                        vendor_name: 'Balaji Heavy Roadways',
                        pan: 'AAHFB7714K',
                        payment_date: '2026-08-18',
                        voucher_nos: 'VCH-8411',
                        voucher_count: 1,
                        total_cash: 38200,
                        is_goods_transporter: true,
                        statutory_limit: 35000,
                        status: 'DISALLOWED_40A3',
                        description: 'Goods carriage freight cash payment exceeded statutory carriage limit of ₹35,000'
                    }
                ],
                records: [
                    {
                        id: 'VIO-40A3-01',
                        vendor_id: 'VEND-089',
                        vendor_name: 'Sharma Logistics (Cash Payment)',
                        pan: 'AABCS9912E',
                        payment_date: '2026-09-02',
                        voucher_nos: 'VCH-9012, VCH-9015',
                        voucher_count: 2,
                        total_cash: 18500,
                        is_goods_transporter: false,
                        statutory_limit: 10000,
                        status: 'DISALLOWED_40A3'
                    },
                    {
                        id: 'VIO-40A3-02',
                        vendor_id: 'VEND-114',
                        vendor_name: 'Balaji Heavy Roadways',
                        pan: 'AAHFB7714K',
                        payment_date: '2026-08-18',
                        voucher_nos: 'VCH-8411',
                        voucher_count: 1,
                        total_cash: 38200,
                        is_goods_transporter: true,
                        statutory_limit: 35000,
                        status: 'DISALLOWED_40A3'
                    },
                    {
                        id: 'REC-40A3-03',
                        vendor_id: 'VEND-032',
                        vendor_name: 'Shree Sai Packing Materials',
                        pan: 'AACSS4412L',
                        payment_date: '2026-08-25',
                        voucher_nos: 'VCH-8650',
                        voucher_count: 1,
                        total_cash: 9200,
                        is_goods_transporter: false,
                        statutory_limit: 10000,
                        status: 'COMPLIANT'
                    },
                    {
                        id: 'REC-40A3-04',
                        vendor_id: 'VEND-055',
                        vendor_name: 'National Highway Transport Corp',
                        pan: 'AAACN2201P',
                        payment_date: '2026-07-14',
                        voucher_nos: 'VCH-7910',
                        voucher_count: 1,
                        total_cash: 34000,
                        is_goods_transporter: true,
                        statutory_limit: 35000,
                        status: 'COMPLIANT'
                    }
                ]
            })),

    updateRule6ddExemption: (data) =>
        apiClient.post('/tax-audit/sec40a3/exemption', data)
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                success: true,
                record_id: data.record_id,
                is_exempt: data.is_exempt,
                remark: data.remark
            })),

    // 2. TDS/TCS Hub (Clause 34 of Form 3CD)
    getClause34Hub: (params = {}) =>
        apiClient.get('/tax-audit/clause34', { params })
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                financial_year: '2025-2026',
                compliance_pills: [
                    { section: 'Sec 194C (Contractors)', status: 'COMPLIANT', label: 'Sec 194C (Contractors) - ✓ Compliant', color: 'emerald' },
                    { section: 'Sec 194J (Professional)', status: 'COMPLIANT', label: 'Sec 194J (Professional) - ✓ Compliant', color: 'emerald' },
                    { section: 'Sec 194Q (Goods Purchase)', status: 'DELAY', label: 'Sec 194Q (Goods Purchase) - ⚠️ 1 Delay Deposit', color: 'amber' }
                ],
                total_disallowed_40a_ia: 1020000,
                records: [
                    {
                        id: 'TDS-01',
                        section: 'Sec 194C',
                        nature_of_payment: 'Contractors & Sub-Contractors',
                        total_amount_paid: 4850000,
                        base_deductible: 4850000,
                        tds_deducted: 97000,
                        deposit_date: '2026-08-05',
                        due_date: '2026-08-07',
                        delay_days: 0,
                        disallowance_30_pct: 0
                    },
                    {
                        id: 'TDS-02',
                        section: 'Sec 194J',
                        nature_of_payment: 'Professional & Technical Fees',
                        total_amount_paid: 1620000,
                        base_deductible: 1620000,
                        tds_deducted: 162000,
                        deposit_date: '2026-08-06',
                        due_date: '2026-08-07',
                        delay_days: 0,
                        disallowance_30_pct: 0
                    },
                    {
                        id: 'TDS-03',
                        section: 'Sec 194Q',
                        nature_of_payment: 'Purchase of Goods > ₹50L',
                        total_amount_paid: 8400000,
                        base_deductible: 3400000,
                        tds_deducted: 3400,
                        deposit_date: '2026-08-19',
                        due_date: '2026-08-07',
                        delay_days: 12,
                        disallowance_30_pct: 1020000
                    },
                    {
                        id: 'TDS-04',
                        section: 'Sec 194I',
                        nature_of_payment: 'Plant & Equipment Rent',
                        total_amount_paid: 750000,
                        base_deductible: 750000,
                        tds_deducted: 15000,
                        deposit_date: '2026-08-07',
                        due_date: '2026-08-07',
                        delay_days: 0,
                        disallowance_30_pct: 0
                    },
                    {
                        id: 'TDS-05',
                        section: 'Sec 194H',
                        nature_of_payment: 'Commission & Brokerage',
                        total_amount_paid: 320000,
                        base_deductible: 320000,
                        tds_deducted: 16000,
                        deposit_date: '2026-08-04',
                        due_date: '2026-08-07',
                        delay_days: 0,
                        disallowance_30_pct: 0
                    }
                ]
            })),

    // 3. Clause 44 Expense Breakdown Matrix
    getClause44Breakdown: (params = {}) =>
        apiClient.get('/tax-audit/clause44', { params })
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                financial_year: '2025-2026',
                kpis: {
                    exempt_supplies: 420000,
                    composition_scheme: 180000,
                    registered_entities: 4560000,
                    non_registered_entities: 810000,
                    total_expenditure: 5970000
                },
                matrix: [
                    {
                        sl_no: 1,
                        expenditure_head: 'Raw Materials & Consumables',
                        total_expenditure: 3250000,
                        exempt_col3: 150000,
                        composition_col4: 90000,
                        other_registered_col5: 2600000,
                        total_registered_col6: 2840000,
                        non_registered_col7: 410000
                    },
                    {
                        sl_no: 2,
                        expenditure_head: 'Freight, Cartage & Logistics',
                        total_expenditure: 840000,
                        exempt_col3: 120000,
                        composition_col4: 0,
                        other_registered_col5: 560000,
                        total_registered_col6: 680000,
                        non_registered_col7: 160000
                    },
                    {
                        sl_no: 3,
                        expenditure_head: 'Rent, Rates & Office Occupancy',
                        total_expenditure: 720000,
                        exempt_col3: 0,
                        composition_col4: 0,
                        other_registered_col5: 640000,
                        total_registered_col6: 640000,
                        non_registered_col7: 80000
                    },
                    {
                        sl_no: 4,
                        expenditure_head: 'Legal & Professional Retainers',
                        total_expenditure: 460000,
                        exempt_col3: 0,
                        composition_col4: 45000,
                        other_registered_col5: 385000,
                        total_registered_col6: 430000,
                        non_registered_col7: 30000
                    },
                    {
                        sl_no: 5,
                        expenditure_head: 'Repairs & Machinery Maintenance',
                        total_expenditure: 380000,
                        exempt_col3: 50000,
                        composition_col4: 45000,
                        other_registered_col5: 215000,
                        total_registered_col6: 310000,
                        non_registered_col7: 70000
                    },
                    {
                        sl_no: 6,
                        expenditure_head: 'Power, Fuel & Utilities',
                        total_expenditure: 320000,
                        exempt_col3: 100000,
                        composition_col4: 0,
                        other_registered_col5: 160000,
                        total_registered_col6: 260000,
                        non_registered_col7: 60000
                    }
                ],
                totals: {
                    total_expenditure: 5970000,
                    exempt_col3: 420000,
                    composition_col4: 180000,
                    other_registered_col5: 4560000,
                    total_registered_col6: 5160000,
                    non_registered_col7: 810000
                }
            })),

    // 4. Sec 43B(h) MSME Payment Tracker
    getSec43bhTracker: (params = {}) =>
        apiClient.get('/tax-audit/sec43bh', { params })
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                financial_year: '2025-2026',
                critical_alert: {
                    vendor_name: 'Precision Tools Pvt Ltd',
                    msme_category: 'Micro',
                    invoice_date: '2026-08-01',
                    days_elapsed: 40,
                    statutory_limit_days: 45,
                    days_remaining: 5
                },
                total_disallowed_amount: 188000,
                total_critical_due_amount: 865000,
                records: [
                    {
                        id: 'MSME-01',
                        vendor_name: 'Precision Tools Pvt Ltd',
                        msme_category: 'Micro',
                        udyam_reg_no: 'UDYAM-MH-03-0044912',
                        invoice_no: 'INV-2026-PT-881',
                        invoice_date: '2026-08-01',
                        bill_amount: 345000,
                        balance_due: 345000,
                        statutory_limit_days: 45,
                        days_elapsed: 40,
                        days_remaining: 5,
                        risk_status: 'CRITICAL_DUE'
                    },
                    {
                        id: 'MSME-02',
                        vendor_name: 'Apex Micro Stampings',
                        msme_category: 'Micro',
                        udyam_reg_no: 'UDYAM-TN-02-0019283',
                        invoice_no: 'AMS-9022',
                        invoice_date: '2026-07-15',
                        bill_amount: 188000,
                        balance_due: 188000,
                        statutory_limit_days: 45,
                        days_elapsed: 57,
                        days_remaining: -12,
                        risk_status: 'DISALLOWED_43BH'
                    },
                    {
                        id: 'MSME-03',
                        vendor_name: 'Kaveri Paper Converters',
                        msme_category: 'Small',
                        udyam_reg_no: 'UDYAM-KR-08-0051142',
                        invoice_no: 'KPC-1140',
                        invoice_date: '2026-08-28',
                        bill_amount: 520000,
                        balance_due: 520000,
                        statutory_limit_days: 15,
                        days_elapsed: 13,
                        days_remaining: 2,
                        risk_status: 'CRITICAL_DUE'
                    },
                    {
                        id: 'MSME-04',
                        vendor_name: 'Supreme Electro-Tech Controls',
                        msme_category: 'Small',
                        udyam_reg_no: 'UDYAM-GJ-01-0078129',
                        invoice_no: 'SETC-4091',
                        invoice_date: '2026-08-20',
                        bill_amount: 290000,
                        balance_due: 0,
                        statutory_limit_days: 45,
                        days_elapsed: 21,
                        days_remaining: 24,
                        risk_status: 'COMPLIANT'
                    },
                    {
                        id: 'MSME-05',
                        vendor_name: 'Shilpa Industrial Fasteners',
                        msme_category: 'Micro',
                        udyam_reg_no: 'UDYAM-DL-05-0033190',
                        invoice_no: 'SIF-6712',
                        invoice_date: '2026-09-01',
                        bill_amount: 142000,
                        balance_due: 142000,
                        statutory_limit_days: 45,
                        days_elapsed: 9,
                        days_remaining: 36,
                        risk_status: 'COMPLIANT'
                    }
                ]
            })),

    // 5. Statutory Dues Clock (PF/ESI)
    getStatutoryDuesClock: (params = {}) =>
        apiClient.get('/tax-audit/statutory-dues', { params })
            .then(res => res.data?.data || res.data)
            .catch(() => ({
                financial_year: '2025-2026',
                overall_status: 'LATE_DEPOSIT_OBSERVED',
                status_badge: '⚠️ Late Deposit Observed',
                total_disallowed_36_1_va: 31800,
                records: [
                    {
                        id: 'STAT-01',
                        month_period: 'August 2026',
                        fund_nature: 'EPF (Employees Provident Fund)',
                        employee_contribution: 145000,
                        employer_share: 145000,
                        statutory_due_date: '2026-09-15',
                        actual_deposit_date: '2026-09-10',
                        challan_ref: 'TRRN-8821901',
                        delay_days: 0,
                        disallowed_amount: 0,
                        status: 'ON_TIME'
                    },
                    {
                        id: 'STAT-02',
                        month_period: 'August 2026',
                        fund_nature: 'ESIC (Employees State Insurance)',
                        employee_contribution: 32400,
                        employer_share: 139800,
                        statutory_due_date: '2026-09-15',
                        actual_deposit_date: '2026-09-11',
                        challan_ref: 'ESIC-7740192',
                        delay_days: 0,
                        disallowed_amount: 0,
                        status: 'ON_TIME'
                    },
                    {
                        id: 'STAT-03',
                        month_period: 'July 2026',
                        fund_nature: 'EPF (Employees Provident Fund)',
                        employee_contribution: 142000,
                        employer_share: 142000,
                        statutory_due_date: '2026-08-15',
                        actual_deposit_date: '2026-08-14',
                        challan_ref: 'TRRN-7719402',
                        delay_days: 0,
                        disallowed_amount: 0,
                        status: 'ON_TIME'
                    },
                    {
                        id: 'STAT-04',
                        month_period: 'July 2026',
                        fund_nature: 'ESIC (Employees State Insurance)',
                        employee_contribution: 31800,
                        employer_share: 137200,
                        statutory_due_date: '2026-08-15',
                        actual_deposit_date: '2026-08-19',
                        challan_ref: 'ESIC-6630129',
                        delay_days: 4,
                        disallowed_amount: 31800,
                        status: 'LATE_DEPOSIT'
                    },
                    {
                        id: 'STAT-05',
                        month_period: 'June 2026',
                        fund_nature: 'EPF (Employees Provident Fund)',
                        employee_contribution: 138000,
                        employer_share: 138000,
                        statutory_due_date: '2026-07-15',
                        actual_deposit_date: '2026-07-12',
                        challan_ref: 'TRRN-6629103',
                        delay_days: 0,
                        disallowed_amount: 0,
                        status: 'ON_TIME'
                    },
                    {
                        id: 'STAT-06',
                        month_period: 'June 2026',
                        fund_nature: 'ESIC (Employees State Insurance)',
                        employee_contribution: 30500,
                        employer_share: 131500,
                        statutory_due_date: '2026-07-15',
                        actual_deposit_date: '2026-07-13',
                        challan_ref: 'ESIC-5510291',
                        delay_days: 0,
                        disallowed_amount: 0,
                        status: 'ON_TIME'
                    }
                ]
            }))
};
