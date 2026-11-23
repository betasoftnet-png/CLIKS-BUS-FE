// Cliks Business — Complete 5-Tier Subscription Feature Allocation Matrix
// Master dataset accurately reflecting the official Subscription Allocation Document

export const FULL_SUBSCRIPTION_MATRIX = [
    {
        category: '1. Core Subscription & Limits',
        id: 'core',
        icon: 'Layers',
        features: [
            { name: "Sub ID's Roles", micro: '❌ Locked', starter: "2 ID's", standard: "5 ID's", growth: "10 ID's", elite: "20 ID's" },
            { name: "Internal Showrooms / Godowns (Owned)", micro: "1 branch", starter: "1 branch", standard: "2 branch", growth: "5 branch", elite: "15 branch" },
            { name: "External Franchise / Partner Branches", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "Upto 2 External", elite: "Upto 10 External" },
            { name: "Sales Invoice Limit", micro: "1,000", starter: "5,000", standard: "10,000", growth: "25,000", elite: "100,000" },
            { name: "Bill Limit", micro: "1,000", starter: "5,000", standard: "10,000", growth: "25,000", elite: "100,000" },
            { name: "Active Stock SKUs", micro: "1,000", starter: "5,000", standard: "10,000", growth: "50,000", elite: "Unlimited" },
            { name: "Cloud Storage Tracker", micro: "1 GB", starter: "5 GB", standard: "10 GB", growth: "20 GB", elite: "50 GB" },
            { name: "Auto-Backup", micro: "❌ Locked", starter: "Monthly", standard: "Weekly", growth: "Daily", elite: "Daily" }
        ]
    },
    {
        category: '2. GST API & Compliance',
        id: 'gst',
        icon: 'FileCheck',
        features: [
            { name: "Live E-Invoicing (IRN/QR)", micro: "❌ Excluded (0/day)", starter: "Up to 5/day (150/mo)", standard: "Up to 10/day (300/mo)", growth: "Up to 20/day (600/mo)", elite: "Up to 30/day (900/mo)" },
            { name: "Live E-Way Bills", micro: "❌ Excluded (0/day)", starter: "Up to 2/day (60/mo)", standard: "Up to 3/day (90/mo)", growth: "Up to 5/day (150/mo)", elite: "Up to 10/day (300/mo)" },
            { name: "GSTIN Validation API", micro: "❌ Excluded", starter: "1/day", standard: "2/day", growth: "3/day", elite: "5/day" },
            { name: "GST Tax Summary & Day Book", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "GSTR Reports (1, 2B, 3B)", micro: "❌ Locked", starter: "Offline CSV/PDF", standard: "GSTR-1 & 3B Reports", growth: "GSTR-1, 2B, 3B + IMS", elite: "Full GSTR + JSON Export" }
        ]
    },
    {
        category: '3. Dashboard & Accounting',
        id: 'accounting',
        icon: 'BarChart3',
        features: [
            { name: "Business Overview Dashboard", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Quick Action Center", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Multi-Showroom Toggle", micro: "❌ Locked", starter: "❌ Locked", standard: "Yes (2 Branches)", growth: "Yes (5 Branches)", elite: "Yes (10 Branches)" },
            { name: "P&L & Balance Sheet", micro: "❌ Locked", starter: "P&L Only", standard: "Full Statements", growth: "Full Statements", elite: "Full + Branch Level" },
            { name: "Receivables & Payables", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Expense Breakdown", micro: "❌ Locked", starter: "Basic Groups", standard: "Full Breakdown", growth: "Full Breakdown", elite: "Sub-accounts & Cost Centers" },
            { name: "Cash & Bank Ledger", micro: "❌ Locked", starter: "Bank Statement CSV", standard: "Bank Rec (BRS)", growth: "BRS Rules", elite: "Multi-Bank + Auto-Rules" },
            { name: "Audit Center", micro: "❌ Locked", starter: "❌ Locked", standard: "Basic Auditor Role", growth: "Transaction Locking", elite: "Full Activity Audit Log" },
            { name: "Custom Chart of Accounts", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Item-wise Expenses", micro: "Basic", starter: "Basic", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Dashboard Customization", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "Yes", elite: "Yes" },
            { name: "Advanced Voucher Audit & Voucher Modification History", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "5 limit/day", elite: "15 limit/day" },
            { name: "Sales & Revenue Reports Download (8)", micro: "3 Reports", starter: "5 Reports", standard: "6 Reports", growth: "8 Reports", elite: "8 Reports" },
            { name: "Purchase Reports Download (6)", micro: "2 Reports", starter: "3 Reports", standard: "4 Reports", growth: "6 Reports", elite: "6 Reports" },
            { name: "Stock & Inventory Reports Download (6)", micro: "2 Reports", starter: "3 Reports", standard: "4 Reports", growth: "5 Reports", elite: "6 Reports" },
            { name: "CRM & Parties Reports Download (5)", micro: "2 Reports", starter: "3 Reports", standard: "4 Reports", growth: "5 Reports", elite: "5 Reports" },
            { name: "Finance & Tax Reports Download (17)", micro: "3 Reports", starter: "5 Reports", standard: "8 Reports", growth: "13 Reports", elite: "17 Reports" }
        ]
    },
    {
        category: '4. Purchases & Suppliers',
        id: 'purchases',
        icon: 'ShoppingBag',
        features: [
            { name: "Purchases Hub Dashboard", micro: "Full Dashboard", starter: "Full Dashboard", standard: "Full Dashboard", growth: "Full Dashboard", elite: "Full Dashboard" },
            { name: "Request Stock", micro: "❌ Locked", starter: "❌ Locked", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Purchase Orders (PO)", micro: "Basic POs", starter: "Basic POs", standard: "Full POs", growth: "POs + Landed Cost", elite: "POs + Custom Workflows" },
            { name: "Purchase Bills & Invoices", micro: "Basic", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes + Vendor Portal" },
            { name: "Purchase Returns", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Supplier Directory", micro: "Basic", starter: "Basic", standard: "Advance + Credit terms", growth: "Advance", elite: "Advance + Multi-Currency" },
            { name: "Advance Payments Tracker", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Landed Cost Allocation", micro: "❌ Locked", starter: "❌ Locked", standard: "Basic", growth: "Advanced", elite: "Multi-Currency Landed Cost" },
            { name: "Voucher Scan", micro: "❌ Locked", starter: "❌ Locked", standard: "10 scans", growth: "50 scans", elite: "200 scans" }
        ]
    },
    {
        category: '5. Sales & Billing Center',
        id: 'sales',
        icon: 'Receipt',
        features: [
            { name: "Billing Center Dashboard", micro: "Full Dashboard", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Generate Invoice", micro: "Fixed Basic Templates", starter: "Cust. Templates", standard: "Advanced Templates", growth: "Advanced Templates", elite: "Unlimited White-label" },
            { name: "Sales Orders List", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Sales Returns", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Delivery Challan", micro: "❌ Locked", starter: "❌ Locked", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Loyalty Points Tracker", micro: "❌ Locked", starter: "❌ Locked", standard: "Basic Tracking", growth: "Auto-Redemption", elite: "Advanced Loyalty Rules" },
            { name: "Customer CRM Directory", micro: "100 Customers", starter: "1,000 Customers", standard: "5,000 Customers", growth: "15,000 Customers", elite: "25,000 Customers" },
            { name: "Multi-Series Invoice Numbering", micro: "❌ Locked", starter: "Single Prefix", standard: "2 Prefixes", growth: "5 Prefixes", elite: "Unlimited Custom Series" },
            { name: "Remove Branding / White-Label", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "Yes", elite: "Full White-Label" },
            { name: "Marketing Campaigns", micro: "5 limit/day", starter: "10 limit/day", standard: "15 limit/day", growth: "20 limit/day", elite: "40 limit/day" }
        ]
    },
    {
        category: '6. Products & Inventory',
        id: 'inventory',
        icon: 'Package',
        features: [
            { name: "Stock Valuation Dashboard", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Low Stock SKU Alerts", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Categories & Subcategories", micro: "Basic", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Bulk Import (CSV)", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Product Master Management", micro: "Basic Profiles", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Godown / Warehouse Mapping", micro: "❌ Locked", starter: "❌ Locked", standard: "1 Godowns", growth: "5 Godowns", elite: "10 Godowns" },
            { name: "Price Lists", micro: "❌ Locked", starter: "❌ Locked", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Batch, Expiry & Serial Tracking", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "Basic Batching", elite: "Full Batch/Expiry/Serial" },
            { name: "FMCG Distribution", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" }
        ]
    },
    {
        category: '7. POS (Point of Sale)',
        id: 'pos',
        icon: 'Store',
        features: [
            { name: "POS Checkout Interface", micro: "Basic PDF Only", starter: "1 Counter (Thermal)", standard: "2 Counters", growth: "5 Counters + Basic Kiosk Mode", elite: "15 Counters + Customizable Kiosk Mode" },
            { name: "Batch, Expiry & Serial Tracking in POS", micro: "❌ Locked", starter: "Basic Support", standard: "Yes", growth: "Yes", elite: "Yes + Mobile App Scanning" },
            { name: "Sold by Weight Toggle", micro: "Basic", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes + Weigh Scale Sync" },
            { name: "Hold / Clear Cart", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Payment Split", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Thermal Receipt Printing", micro: "❌ PDF Only", starter: "1 Format", standard: "2 Formats", growth: "Custom Layouts", elite: "Custom Layouts + Logo" },
            { name: "Simple Billing", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" }
        ]
    },
    {
        category: '8. HR, Staff & Payroll',
        id: 'hr',
        icon: 'Users',
        features: [
            { name: "HR & Employees Database", micro: "❌ Locked", starter: "Basic (2 Staff)", standard: "Basic (5 Staff)", growth: "Advanced (25 Staff)", elite: "Elite (100 Staff)" },
            { name: "Active Headcount & Payroll", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Leaves & Shifts Rosters", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Staff Reimbursements", micro: "❌ Locked", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Automated Payroll Processing", micro: "❌ Locked", starter: "❌ Locked", standard: "Yes", growth: "Yes", elite: "Full Sync to Accounts" }
        ]
    },
    {
        category: '9. Payments & Escrow',
        id: 'payments',
        icon: 'Wallet',
        features: [
            { name: "People Network & Escrow", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "To Receive / To Pay Dashboard", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Financial Groups", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Global Ledger", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Repayment Alerts", micro: "Yes", starter: "Yes", standard: "Basic Alerts", growth: "Custom Alerts", elite: "Custom SMS/Email" },
            { name: "Contact Classification", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Net Exposure Tracking", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Payments & Cash Flow Engine", micro: "Manual", starter: "Basic", standard: "Full", growth: "Full", elite: "Full" },
            { name: "Outstanding Receivables Tracker", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Combined Balances View", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Efficiency Rate Metric", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Total Inward & Outward Flow", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Log Transaction (Inward/Outward)", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Segregation Goals", micro: "Upto 5 Goals", starter: "Upto 10 Goals", standard: "Upto 20 Goals", growth: "Upto 30 Goals", elite: "Yes (Unlimited)" },
            { name: "Total Isolated Funds Tracker", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Splitwise & Collect", micro: "Upto 5 splits", starter: "Upto 10 splits", standard: "Upto 20 splits", growth: "Upto 30 splits", elite: "Yes (Unlimited)" },
            { name: "Group Expense Tickets", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Members & Balances Tracking", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Invite Member & Admin Rights", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Payment Planner", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Automated Reminders", micro: "❌ Locked", starter: "❌ Locked", standard: "10 limit", growth: "20 limit/day", elite: "40 limit/day" },
            { name: "Payment Reminders", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Import Bank and Credit Card Statements", micro: "Yes", starter: "Yes", standard: "Yes", growth: "Yes", elite: "Yes" },
            { name: "Late Fees", micro: "❌ Locked", starter: "❌ Locked", standard: "❌ Locked", growth: "Yes", elite: "Yes" }
        ]
    }
];

export const CLIKS_OPTIONAL_ADDONS = [
    { name: "Extra Sub IDs", pricingMonth: "₹199 / user / mo", pricingYear: "₹2,388 / user / yr", desc: "Add more user logins with custom role permissions (Billing, Stock, Accountant)" },
    { name: "Extra Branches", pricingMonth: "₹399 / branch / mo", pricingYear: "₹4,788 / branch / yr", desc: "Expand to additional showrooms with isolated stock & consolidated HQ reports" },
    { name: "Cloud Storage", pricingMonth: "₹149 / mo (50 GB)", pricingYear: "₹1,788 / yr", desc: "Additional 50 GB secure cloud storage for receipts, invoices & documents" },
    { name: "E-Way Bill Packs", pricingMonth: "₹299 / pack (500 APIs)", pricingYear: "₹299 / pack (500 APIs)", desc: "On-demand credit packs for NIC live E-Way Bill generation" },
    { name: "Sales E-Invoice", pricingMonth: "₹299 / pack (500 APIs)", pricingYear: "₹299 / pack (500 APIs)", desc: "On-demand credit packs for government IRP portal E-Invoicing (IRN & QR)" },
    { name: "Priority Support", pricingMonth: "₹799 / mo", pricingYear: "₹9,588 / yr", desc: "Dedicated support queue with prioritized ticketing and fast response SLA" },
    { name: "Advanced Analytics", pricingMonth: "₹599 / mo", pricingYear: "₹7,188 / yr", desc: "AI-powered cohort analytics, cashflow forecasts, and margin intelligence" },
    { name: "Custom Domain Portals", pricingMonth: "₹999 / mo", pricingYear: "₹11,988 / yr", desc: "Run your customer billing and supplier portal on your own company domain" },
    { name: "Employees (HR Headcount)", pricingMonth: "₹60 / employee / mo", pricingYear: "₹720 / employee / yr", desc: "Scale employee database and automated payroll processing capacity" }
];

export const ZOHO_CLIKS_COMPARISON = [
    { name: "Expense Claim (user)", zohoPrice: "₹1,788 / user / yr", cliksBenefit: "Staff reimbursements & claims are native in Cliks HR & Payroll at ₹0 extra cost; extra logins are full-access Sub IDs (₹199/mo)." },
    { name: "Billpay", zohoPrice: "₹35,988 / yr", cliksBenefit: "Core vendor management, POs, bills, and payment logs are native in Cliks at ₹0 extra fee vs Zoho's ₹35,988/yr add-on." },
    { name: "Users", zohoPrice: "₹1,800 / user / yr", cliksBenefit: "Cliks offers Extra Sub IDs at ₹199/user/mo with granular role permissions (Billing, POS, Stock) without annual lock-in." },
    { name: "Location / Branch", zohoPrice: "₹7,200 / location / yr", cliksBenefit: "Cliks Extra Branches are ₹399/mo (~₹4,788/yr, 33% cheaper) with stock isolation, branch toggle, and custom prefixes." },
    { name: "API (call)", zohoPrice: "₹9,990 / yr", cliksBenefit: "Cliks avoids annual API lock-ins; compliance APIs use flexible on-demand credit packs (₹299 for 500 E-Way Bill calls)." },
    { name: "Document AutoScan (scans)", zohoPrice: "₹5,028 / yr", cliksBenefit: "Cliks provides 50 GB Cloud Storage (₹149/mo) for digital bills without charging steep per-scan OCR fees (~₹8.38/scan in Zoho)." },
    { name: "SMS Credits", zohoPrice: "₹75 / credit pack", cliksBenefit: "Cliks leverages official WhatsApp Business API (₹499/mo) for invoice PDFs and alerts with 95%+ open rates over SMS." }
];
