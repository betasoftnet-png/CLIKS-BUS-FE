# Cliks Business — Comprehensive Functional and Technical Architecture Report
**Document Version:** 2.4.0-PROD  
**Target Audience:** Executive Leadership, Engineering Management, Product Operations, and Compliance Auditors  
**System Scope:** `CLIKS-BUS-FE` (React 19, Vite, TanStack Query, React Router DOM 7) & `CLIKS-BE` (Node.js/Express, SQLite/PostgreSQL Dual-Engine)

---

## Executive Architecture & Design Foundations

Cliks Business is an enterprise-grade, multi-tenant ERP, financial cash flow, tax compliance, and commercial networking ecosystem tailored for modern enterprises, retailers, distributors, and certified accounting professionals.

### System Architecture Highlights
1. **Frontend Presentation & Layout Tier:** Built on React 19 and Vite with TanStack Query (`@tanstack/react-query`) for asynchronous server-state caching, Framer Motion for hardware-accelerated drawer transitions, and Tailwind Merge alongside custom CSS variables.
2. **Navigation State Derivation:** Application modes (`Books`, `Payments`, `Social`) are managed via browser URL path prefixing with synchronous `sessionStorage` fallback keys (`active_cliks_module`), ensuring persistent multi-tab state isolation.
3. **Optimistic UI Engine:** Critical mutations (invoice deletions, expense logging, payment voucher allocations) apply instant optimistic state updates before network responses settle, backed by selective query invalidations (`queryClient.invalidateQueries`).
4. **Resilient Document Access:** External documents, invoices, and payment receipts are served via direct asset resolvers and Google Docs Viewer iframes to eliminate Cross-Origin Resource Sharing (CORS) fetch blockers across sandboxed environments.
5. **Role-Based Access Control (RBAC):** Integrated client route guards (`ProtectedRoute.jsx`) and backend JWT authorization middlewares (`allowRoles`) partition capabilities across standard tenants, administrative operators (`admin`), platform sales representatives (`sales_agent`), and support agents (`support_agent`).

---

## 1. Top-Level Module Summary

The application is structured into four primary operational suites accessible via the global application topbar and responsive navigation shell:

| Suite Name | Primary Route | Business Capability & Domain Responsibility |
| :--- | :--- | :--- |
| **Books** | `/dashboard` | Complete ERP backbone: General ledger accounting, double-entry bookkeeping, GSTR-1/GSTR-3B tax compliance, sales invoicing, purchase orders, vendor billing, multi-godown inventory, POS retail checkout, barcode generation, staff payroll, and business intelligence reporting. |
| **Payments** | `/payments/transaction` | Comprehensive cash flow engine: Customer inward receivables, supplier outward disbursements, bank and cash register ledgers, segregation target wallets, Splitwise-style group bill splitting, debt simplification, and scheduled payment planning. |
| **Social** | `/social/betaclub` | Commercial networking and capital matrix: The Partner Launch Desk (BETA Club) for startup pitch discovery, founder fundraising studios, verified investor networks, and digital equity/trading contract vaults. |
| **Control & Utilities** | `/admin/*`, `/beta-launcher` | Administrative tenant matrix, system moderation, sales/support agent portals, audit logs, and docked workspace utilities (Calculator, Notes, Calendar, Contacts, Weather). |

---

## 2. Detailed Breakdown per Module & Sub-Section

```
├── BOOKS SUITE
│   ├── 2.1 Executive Dashboard
│   ├── 2.2 Sales Billing & Invoicing Center
│   ├── 2.3 Customers Master & CRM Suite
│   ├── 2.4 Sales Orders & Logistics Dispatch
│   ├── 2.5 Retail Point-of-Sale (POS) Engine
│   ├── 2.6 Purchases, Vendor Bills & Procurement Suite
│   ├── 2.7 Suppliers Master & Running Payables Suite
│   ├── 2.8 Inventory Products Catalog
│   ├── 2.9 Real-Time Stock & Batch Tracking
│   ├── 2.10 Multi-Warehouse Godown Management
│   ├── 2.11 Double-Entry Accounting, P&L & Balance Sheet
│   ├── 2.12 Business Expenses & Reimbursement Claims
│   ├── 2.13 GST & Tax Compliance Engine
│   ├── 2.14 FITTECH / FIN-PRO Auditor Workspace
│   ├── 2.15 Human Resources: Staff, Attendance & Payroll
│   └── 2.16 Business Intelligence & Analytics Reports
├── PAYMENTS SUITE
│   ├── 2.17 Payments & Cash Flow Engine (Transactions)
│   ├── 2.18 People Master & Lend/Borrow Rolodex
│   ├── 2.19 Segregation Target Wallets
│   ├── 2.20 Split & Collect (Group Expense & Debt Settlement)
│   └── 2.21 Payment Planner & Recurring Obligations
└── SOCIAL SUITE
    ├── 2.22 Partner Launch Desk (BETA Club Pitches & Capital Matrix)
    └── 2.23 Trading Docs & Equity Certificates
```

---

### 2.1 Executive Dashboard

#### Route & Purpose
- **Absolute Route:** `/dashboard` (default redirect from `/` and `/books`).
- **Core Business Objective:** Serves as the operational flight deck for business owners and financial controllers, providing real-time visibility into top-line revenue, net cash reserves, inventory health, and rapid-entry transactional launchpads.

#### Metrics & Summary Cards
1. **Total Invoiced Revenue:** Cumulative gross sales from finalized sales invoices.  
   *Calculation:* $\sum (\text{invoice.total\_amount})$.
2. **Net Cash & Bank Balance:** Aggregate liquid capital available across all verified bank accounts and cash in hand.  
   *Calculation:* $\sum (\text{bank\_account.current\_balance}) + \text{cash\_ledger.running\_balance}$.
3. **Pending Receivables:** Uncollected client dues from credit invoices.  
   *Calculation:* $\sum (\text{invoice.due\_amount}) \quad \forall \, \text{status} \in \{\text{Unpaid, Partially Paid, Overdue}\}$.
4. **Low Stock Warnings:** Total number of inventory SKUs whose current available quantity has breached the reorder threshold.  
   *Calculation:* $\text{Count}(i) \quad \forall \, i \in \text{Products} \mid \text{current\_stock}_i \le \text{reorder\_level}_i$.

#### Sub-Tabs & Filtering Controls
- **Date Range Presets:** Quick-filter toggle buttons (`Today`, `This Week`, `This Month`, `FY 2024-25`).
- **Custom Date Pickers:** Start and End Date inputs triggering real-time recalculations across backend aggregation endpoints without requiring full page reloads.

#### Action Buttons & Modals
- **Master Launchpad Shortcuts:** Interactive grid providing 1-click modals for `+ New Invoice`, `+ Add Product`, `+ Add Customer`, `+ Record Expense`, `+ Add Purchase Bill`, and `+ Quick POS`.
- **Shortcut Customizer Modal:** Allows tenants to pin, unpin, and reorder dashboard launcher tiles using browser-persisted localStorage configurations.

#### Data Table / Card Grid Actions
- **Recent Transactions Feed:** Displays the latest 10 transactional movements (Sales, Purchases, Payments, Expenses). Clicking any row directly routes to the corresponding entity drawer (`/sales/invoice`, `/finance/expenses`, or `/payments/transaction`).

---

### 2.2 Sales Billing & Invoicing Center

#### Route & Purpose
- **Absolute Route:** `/sales/invoice` (supported with deep link query: `?create=true`).
- **Core Business Objective:** End-to-end commercial revenue processing engine handling tax invoices, quotation estimates, proforma invoices, government e-Invoicing (IRN), e-Way logistics generation, and delivery challans.

#### Metrics & Summary Cards
1. **Total Invoiced:** Gross revenue represented by all issued commercial invoices.  
   *Calculation:* $\sum (\text{invoice.total\_amount})$.
2. **Paid Revenue:** Total collected liquid revenue from settled invoices.  
   *Calculation:* $\sum (\text{invoice.paid\_amount})$.
3. **Outstanding Balance:** Net accounts receivable pending collection.  
   *Calculation:* $\sum (\text{invoice.due\_amount}) \quad \forall \, \text{invoice.due\_amount} > 0$.
4. **Active Clients:** Distinct customer count billed within the selected financial period.  
   *Calculation:* $\text{Cardinality}(\{\text{invoice.client\_name}\})$.

#### Sub-Tabs & Filtering Controls
- **Main Functional Tabs:**
  - `Orders List`: Standard commercial invoices and finalized bills.
  - `Sales Returns (Customers)`: Credit notes and return sales vouchers.
  - `Warranty & Replacement Claims`: Defect inspections and replacement items.
  - `DELIVERY CHALLAN`: Logistics fulfillment sub-desk featuring 4 internal sub-views:
    1. *Shipments & Real-Time Status*
    2. *Delivery Challans*
    3. *Delivery Staff & Driver Performance*
    4. *Delivery Returns*
  - `e-Invoice`: Invoices authenticated via National Informatics Centre / Masters India with verified QR codes.
  - `e-Way Logistics`: Transport permits for shipments exceeding statutory distance and value limits.
- **Filtering Controls:** Status pills (`All`, `Paid`, `Unpaid`, `Overdue`), invoice type selector (`GST`, `Non-GST`, `Quotation`, `Proforma`), and client search.

#### Action Buttons & Modals
1. **`+ Generate Invoice`:**
   - **Trigger:** Launches the Invoice Creator Modal with split-screen real-time PDF template preview.
   - **Form Fields & Validations:**
     - Invoice Type (`GST`, `Non-GST`, `Quotation`, `Proforma`).
     - Customer Identification: Select existing from CRM dropdown or enter manual client details.
     - Buyer GSTIN: Strict 15-character alphanumeric validation (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`). Auto-populates state and Place of Supply code.
     - Line Items Array: Description, HSN Code (min 4-8 digits), Quantity ($\ge 1$), Unit Price ($> 0$), Discount (Percentage or Flat), Tax Rate (`0%`, `5%`, `12%`, `18%`, `28%`).
     - Payment Terms (`Due on Receipt`, `Net 15`, `Net 30`, `Net 60`).
     - Loyalty Points: Option to redeem available customer reward credits.
   - **Submission Workflow:** Sends payload to `POST /billing/invoices`. On HTTP 200/201, invalidates query keys `['invoices']`, `['salesInvoices']`, `['dashboardSummary']`, closes modal, and renders instant success alert without reloading.
2. **`+ Generate e-Invoice (IRN)`:**
   - **Trigger:** Launches NIC e-Invoice Authentication Modal or executes row-level IRN action.
   - **Workflow:** Validates B2B GSTIN, Place of Supply, item HSN, and taxable values. Calls compliance microservice. On response, stores `AckNo`, `AckDt`, `Irn`, and `SignedQRCode`. Updates status to `IRN Active` and embeds cryptographic QR code on printed invoice.
3. **`+ Generate e-Way Bill`:**
   - **Trigger:** Launches e-Way Logistics Modal.
   - **Form Fields & Validations:** Reference invoice ID, Transporter Name, Transporter GSTIN, Transport Mode (`Road`, `Rail`, `Air`, `Ship`), Vehicle Number (e.g., `MH-12-QB-8821`), Distance in Kilometers ($> 0$).
   - **Submission Workflow:** Calls GST logistics gateway; returns statutory 12-digit e-Way Bill Number and validity timestamp.
4. **`Dispatch Shipment` (Delivery Challan View):**
   - **Trigger:** Launches Challan Generation & Dispatch Modal.
   - **Form Fields & Validations:** Linked Invoice, Driver Assignment, Delivery Staff ID, Shipping Address, Package Weight, OTP verification code.
5. **`Templates` Modal:**
   - **Trigger:** Opens Theme & Customization Selector.
   - **Choices:** `standard`, `premium_corporate`, `modern`, `minimal`. Dynamically updates all invoice print viewports.

#### Data Table / Card Grid Actions
- **View:** Opens full-screen digital invoice viewer with line items, tax breakdowns, and bank remittance info.
- **Edit:** Reopens draft or unpaid invoice inside the editor for revisions.
- **Print:** Triggers direct browser print rendering the active template without third-party dialogs.
- **Share:** Generates pre-formatted WhatsApp and email payment collection links.
- **Generate IRN:** Re-triggers government e-invoicing if not previously completed.
- **Delete:** Validates cancellation eligibility and optimistically removes record via `deleteInvoiceMutation`.

---

### 2.3 Customers Master & CRM Suite

#### Route & Purpose
- **Absolute Route:** `/sales/customers` (supported with deep link query: `?create=true`).
- **Core Business Objective:** Enterprise client relationship directory, customer credit ledger tracking, loyalty rewards governance, and automated communication.

#### Metrics & Summary Cards
1. **Total Receivables:** Net uncollected balance owed across all registered customers.  
   *Calculation:* $\sum (\text{customer.outstanding\_balance}) \quad \forall \, \text{outstanding\_balance} > 0$.
2. **Total Invoiced:** Gross commercial volume billed to all registered customers.  
   *Calculation:* $\sum (\text{customer.total\_invoiced})$.
3. **Total Received:** Cumulative collections logged against customer profiles.  
   *Calculation:* $\sum (\text{customer.total\_received})$.
4. **Active Customers:** Count of customer accounts with active trading status.  
   *Calculation:* $\text{Count}(\text{customers}) \quad \forall \, \text{status} = \text{'active'}$.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `Clients`: Master customer rolodex with demographic, contact, and credit details.
  - `Ledger`: Customer account statement showing invoices (debits) and payments (credits).
  - `Loyalty & Rewards`: Accumulated reward points, tier progression (Silver, Gold, Platinum), and redemption history.
- **Filters:** Text search by name/phone/company, Country Dial Code filter (supporting 20+ global formats), and Status toggles (`Active`, `Inactive`).

#### Action Buttons & Modals
1. **`+ Add Customer`:**
   - **Trigger:** Opens Customer Registration Drawer.
   - **Form Fields & Validations:** Client Name (mandatory), Company Name, Phone Number (country-specific digit validation: exactly 10 digits for India `+91`), Email Address (format validation), GSTIN (optional, 15-char regex), Billing/Shipping Address, Credit Limit ($> 0$), Opening Balance.
   - **Submission:** Submits to `POST /customers`. Optimistically invalidates `['customers']` query.
2. **`Share Ledger via WhatsApp`:**
   - **Trigger:** Row action generating customized WhatsApp message containing outstanding statement balance and direct payment link.

#### Data Table / Card Grid Actions
- **View Ledger:** Displays chronological debit/credit ledger with running balances.
- **Edit:** Opens customer profile for metadata updates.
- **Delete:** Triggers soft delete with confirmation; cascades warnings if outstanding dues exist.

---

### 2.4 Sales Orders & Logistics Dispatch

#### Route & Purpose
- **Absolute Route:** `/sales/orders` and `/sales/delivery`.
- **Core Business Objective:** Order capture, proforma conversion, inventory reservation, packing slip management, and last-mile dispatch coordination.

#### Metrics & Summary Cards
1. **Pending Orders:** Total sales orders awaiting fulfillment or dispatch.
2. **Shipped Today:** Count of parcels handed over to logistics carriers in the current 24-hour cycle.
3. **Delivery Success Rate:** Percentage of delivered orders versus total dispatched orders.
4. **Average Fulfillment Time:** Mean elapsed hours between order placement and customer delivery.

#### Action Buttons & Modals
- **`+ New Sales Order`:** Form capturing buyer items, advance payments, delivery dates, and warehouse allocation.
- **`Convert to Invoice`:** 1-click conversion turning confirmed sales orders into formal tax invoices.
- **`Dispatch Shipment`:** Assigns delivery drivers, generates OTP delivery codes, and prints packing slips.

---

### 2.5 Retail Point-of-Sale (POS) Engine

#### Route & Purpose
- **Absolute Route:** `/pos` (aliased from `/sales/pos`).
- **Core Business Objective:** High-throughput barcode counter billing interface designed for retail desks, cashiers, and store counters.

#### Metrics & Summary Cards
1. **Counter Sales (Today):** Gross cash and digital collections processed on the active terminal.
2. **Transactions Count:** Total completed checkout slips for the day.
3. **Average Ticket Size:** Average monetary value per POS checkout.
4. **Active Terminal Register:** Name and opening cash float of the currently assigned till.

#### Sub-Tabs & Filtering Controls
- **Category Filter Pills:** Rapid product filtering (`All`, `Groceries`, `Beverages`, `Stationery`, etc.).
- **Warehouse Location Selector:** Multi-godown dropdown determining which inventory stock pool is depleted upon checkout.

#### Action Buttons & Modals
1. **Instant Barcode Search:** Autofocus text input listening for hardware USB/Bluetooth barcode scanners. Immediately increments cart line items on SKU match.
2. **Checkout & Pay Modal:**
   - **Trigger:** Clicking `Pay Now` on active cart.
   - **Form Fields:** Payment Mode split (`Cash`, `UPI QR`, `Credit Card`, `Customer Credit`), Cash Tendered with change return calculation, Customer Phone lookup for loyalty redemption.
   - **Submission Workflow:** Submits transaction, generates thermal POS receipt, decrements warehouse stock, and resets cart in under 300ms.
3. **Receipt Thermal Print:** Direct raw formatting optimized for 80mm and 58mm POS thermal printers.

---

### 2.6 Purchases, Vendor Bills & Procurement Suite

#### Route & Purpose
- **Absolute Route:** `/purchases/purchases` (supports query params: `?create=true&tab=purchase-orders` or `?type=BILL&tab=purchase-bills`).
- **Core Business Objective:** Procurement lifecycle management covering supplier Purchase Orders (PO), inward inventory receipts, vendor bill entry, and purchase debit notes (returns).

#### Metrics & Summary Cards
1. **Total Purchases Outlay:** Gross value of all inward procurement bills.  
   *Calculation:* $\sum (\text{bill.total\_amount})$.
2. **Bills Pending Settlement:** Accounts payable dues owed to suppliers.  
   *Calculation:* $\sum (\text{bill.due\_amount})$.
3. **Active Purchase Orders:** Count of open POs awaiting vendor fulfillment.  
   *Calculation:* $\text{Count}(\text{PO}) \quad \forall \, \text{status} \in \{\text{'Pending'}, \text{'Confirmed'}\}$.
4. **Eligible Input Tax Credit (ITC):** Claimable GST embedded in purchase bills.  
   *Calculation:* $\sum (\text{bill.cgst\_amount} + \text{bill.sgst\_amount} + \text{bill.igst\_amount})$.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `purchase-orders`: Outward Purchase Orders issued to suppliers.
  - `purchase-bills`: Inward vendor bills logged into accounts payable.
  - `purchase-returns`: Purchase returns and supplier debit notes.
  - `reports`: Supplier purchase summaries and category procurement charts.

#### Action Buttons & Modals
1. **`+ Create Purchase Order`:**
   - **Trigger:** Opens Purchase Order Builder Modal.
   - **Form Fields:** Supplier selection, Expected Delivery Date, Delivery Warehouse, Line Items (SKU, Qty, Unit Cost, Tax Rate).
2. **`Receive Stock` (Inward Verification):**
   - **Trigger:** Action on open PO or bill.
   - **Modal:** Allows item-by-item quantity verification and assigns incoming stock to target godown (`Main Godown`, `Retail Shelf`, `Secondary Warehouse`). Updates inventory on confirmation.
3. **`Supplier B2B Confirmation Portal`:**
   - **Trigger:** Row action generating vendor confirmation view link where external suppliers review and confirm PO line item availability.
4. **`Supplier Chat`:**
   - **Trigger:** Opens real-time in-app negotiation and messaging drawer with the selected vendor.

---

### 2.7 Suppliers Master & Running Payables Suite

#### Route & Purpose
- **Absolute Route:** `/purchases/suppliers` (aliased from `/finance/purchases/vendors`).
- **Core Business Objective:** Central supplier ledger management, running accounts payable balance tracking, vendor compliance validation (GSTIN/MSME), and automated settlement reminders.

#### Metrics & Summary Cards
1. **Outstanding Payables:** Cumulative trade liabilities owed across all vendors.  
   *Calculation:* $\sum (\text{supplier.outstanding\_balance}) \quad \forall \, \text{outstanding\_balance} > 0$.
2. **Advance Supplier Outflows:** Prepayments and credit balances with vendors.  
   *Calculation:* $\sum |\text{supplier.outstanding\_balance}| \quad \forall \, \text{outstanding\_balance} < 0$.
3. **Total Procured Value:** Lifetime procurement volume across the supplier base.  
   *Calculation:* $\sum (\text{supplier.total\_purchased})$.
4. **Registered Suppliers:** Total supplier master accounts enrolled.  
   *Calculation:* $\text{Count}(\text{suppliers})$.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `list`: Suppliers Master Base (demographics, GSTIN, credit limits, status).
  - `ledger`: Running Ledger Statements (chronological purchases, payments, contra entries).
  - `reports`: Payables Aging & Reminders (aging buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days).
- **Filters:** Search by company/contact/GSTIN, Type (`All`, `Local`, `Import`), Status (`All`, `Active`, `Inactive`), and Sorting (Newest, Name, Highest Payable, Highest Credit Limit).

#### Action Buttons & Modals
1. **`+ Register New Supplier`:**
   - **Trigger:** Opens Supplier Onboarding Modal.
   - **Form Fields & Validations:**
     - Supplier Code (auto-generated `SUP-XXXX`).
     - Supplier Name & Company Name (mandatory).
     - Contact Phone (10 digits).
     - Email: Requires valid email format (enforces `@bnxmail.com` where integrated with platform mail).
     - GSTIN: 15-character input with live API lookup (`complianceService.verifyGstin`) that auto-fills registered trade name, PAN, state, and address.
     - Credit Limit, Payment Terms (`Net 15`, `Net 30`, `Net 60`), Opening Balance.
     - Remittance Details: Bank Account Number, IFSC Code, UPI ID.
   - **Submission:** Calls `suppliersService.createSupplier`. Invalidates `['suppliers']`.
2. **`Pay Now` / `Log Outward Payment`:**
   - **Trigger:** Row action or header button.
   - **Form Fields:** Amount to Pay ($> 0$), Payment Mode (`UPI`, `Bank Transfer`, `Cheque`, `Cash`), Reference/UTR Number, Date.
   - **Submission:** Submits to `POST /payments/pay`. Optimistically decrements supplier payable balance and refreshes accounting ledgers.
3. **`Schedule Payment Reminder` Modal:**
   - **Trigger:** Sets up automated WhatsApp/Email reminders for pending liabilities.
4. **`Document Vault` Modal:**
   - **Trigger:** Uploads and previews vendor MSME certificates, GST proofs, and signed agreements.
5. **`Bulk Import CSV` Modal:**
   - **Trigger:** 3-step CSV wizard (Upload file $\rightarrow$ Map columns $\rightarrow$ Preview & commit).

#### Data Table / Card Grid Actions
- **Pay:** Launches outward payment modal with pre-filled running balance.
- **Statement / Ledger:** Generates formatted print statement showing debits, credits, and final balance.
- **WhatsApp Share:** Dispatches formatted ledger summary to supplier's phone number.
- **Edit:** Modifies supplier metadata.
- **Delete:** Deletes supplier record via `customConfirm`, with safety checks for outstanding balances.

---

### 2.8 Inventory Products Catalog

#### Route & Purpose
- **Absolute Route:** `/inventory/products` (supports query param: `?create=true`).
- **Core Business Objective:** Master catalog governing products, services, raw materials, SKUs, tax categorizations, pricing tiers, and reorder levels.

#### Metrics & Summary Cards
1. **Total Products Count:** Total unique active SKUs in the catalog.
2. **Low Stock Items:** Products requiring urgent replenishment.
3. **Total Stock Valuation:** Asset value of inventory based on cost price.  
   *Calculation:* $\sum (\text{product.cost\_price} \times \text{product.current\_stock})$.
4. **Active Warehouses:** Number of godown locations holding inventory.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `list`: Master Products & Services Catalog.
  - `movement`: Real-time stock movement ledger (Inward purchases vs Outward sales).
  - `reports`: Valuation reports, ABC analysis, and slow-moving items.
- **Filters:** Category selector (`All`, `Electronics`, `Apparel`, etc.), Stock Status (`All`, `Low Stock`, `In Stock`), and SKU search.

#### Action Buttons & Modals
1. **`+ Add Product`:**
   - **Trigger:** Opens Product Creation Drawer.
   - **Form Fields & Validations:** Product Name, SKU / Item Code, Category, Unit of Measurement (`Pcs`, `Kg`, `Box`, `Mtr`, `Nos`), HSN/SAC Code (auto-complete supported), Cost Price ($\ge 0$), Selling Price ($> 0$), Tax/GST Rate (`0%`, `5%`, `12%`, `18%`, `28%`), Minimum Reorder Level, Initial Stock & Assigned Warehouse.
   - **Submission:** Calls `productsService.createProduct`. Invalidates `['products']`.
2. **`Bulk Import CSV`:**
   - **Trigger:** CSV batch importer supporting thousands of product rows with automated column mapping.
3. **`Quick Stock Adjust`:**
   - **Trigger:** Modal allowing inventory managers to record ad-hoc stock additions or write-offs (breakage, shrinkage, expired goods) with reason notes.

---

### 2.9 Real-Time Stock & Batch Tracking

#### Route & Purpose
- **Absolute Route:** `/inventory/stock`.
- **Core Business Objective:** Real-time stock level monitoring across storage locations, batch number tracking, expiry date auditing, and godown transfers.

#### Metrics & Summary Cards
1. **Total Units on Hand:** Total individual units in stock across all facilities.
2. **Low Stock Critical Warnings:** Count of items at or below safety stock.
3. **Damaged / Quarantined Stock:** Units flagged during return or warranty inspection.
4. **Total Inventory Capital:** Current book value of stored inventory.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `registry`: Real-time product stock levels per facility.
  - `movement`: Chronological inward and outward stock transaction audit.
  - `warehouse`: Cross-godown stock distribution matrix.
  - `batch`: Batch numbers, manufacturing dates, and expiry monitoring.

#### Action Buttons & Modals
- **`Transfer Stock Between Warehouses`:**
  - **Form Fields:** Source Godown, Destination Godown, Product SKU, Transfer Quantity, Vehicle/Transfer Note.
  - **Validation:** Transfer quantity cannot exceed available stock in the source godown.
- **`Stock Adjustment`:** Records inventory audit reconciliations against physical cycle counts.

---

### 2.10 Multi-Warehouse Godown Management

#### Route & Purpose
- **Absolute Route:** `/inventory/warehouse` (Feature-gated: requires Growth Plan or higher).
- **Core Business Objective:** Multi-site logistics control managing main godowns, regional fulfillment centers, store shelves, and quarantined/damaged goods storage.

#### Key Capabilities
- Create and manage physical godowns with location addresses and manager contacts.
- Inter-warehouse stock transfers with transfer slip generation.
- Dedicated quarantine warehouse mapping for customer returns undergoing warranty inspection.

---

### 2.11 Double-Entry Accounting, P&L & Balance Sheet

#### Route & Purpose
- **Absolute Route:** `/finance/accounting` (Feature-gated: requires Starter Plan or higher).
- **Core Business Objective:** Enterprise general ledger, chart of accounts, trial balances, double-entry financial journals, Profit & Loss statements, and Balance Sheet reporting.

#### Metrics & Summary Cards
1. **Gross Revenue:** Total operating income from sales and services.  
   *Calculation:* Derived from income entries and sales invoices within the accounting period.
2. **Total Expenses:** Cumulative operating, procurement, payroll, and administrative costs.  
   *Calculation:* $\sum (\text{expense.amount}) + \sum (\text{ledger.debit}) \quad \forall \, \text{category} = \text{'Expense'}$.
3. **Net Profit:** Operational net profit before and after tax.  
   *Calculation:* $\text{Gross Revenue} - \text{Total Expenses}$.
4. **GST Payable:** Net indirect tax liability owed to the government.  
   *Calculation:* $\text{Output GST Collected} - \text{Eligible Input Tax Credit (ITC)}$.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `p&l`: Profit & Loss Statement (revenue groups: Sales, Services, Other Income; expense groups: Rent, Utilities, Salaries, Marketing, COGS, Travel, Subscriptions).
  - `balance-sheet`: Statement of Financial Position:
    - *Assets:* Cash in Hand, Bank Balances, Inventory Value, Accounts Receivable, Fixed Assets.
    - *Liabilities & Equity:* Accounts Payable, GST Payable, Bank Loans, Owner's Equity.
  - `receivables`: Aging receivables and payables dashboard with party ledger drilldown.
  - `expenses`: Category-wise expense distribution and operational vouchers.
  - `cash-bank`: Bank account registers, reconciliation statuses, and contra transfers.
  - `gst`: Direct summary of outward sales, inward purchases, and net tax liability.
  - `ledger`: Chronological Day Book journal with debit and credit postings.

#### Action Buttons & Modals
1. **`+ Record Entry` (Journal Voucher Modal):**
   - **Voucher Types:** `income`, `credit_sale`, `customer_payment`, `expense`, `credit_purchase`, `supplier_payment`, `bank_deposit`, `bank_withdrawal`.
   - **Form Fields:** Date, Amount ($> 0$), Category, Payment Mode, Linked Customer/Supplier, Linked Invoice/Bill No, Description/Notes.
   - **Validation:** Enforces mandatory party selection for credit entries; prevents zero or negative amounts.
   - **Submission:** Calls `accountingService.recordEntry`. Triggers multi-ledger invalidation (`['profitLoss']`, `['balanceSheet']`, `['ledger']`, `['invoices']`).
2. **`Bank Statement Reconciliation` Modal:**
   - **Trigger:** Allows uploading bank statement CSV/Excel files to match recorded book transactions against actual cleared bank debits/credits.
3. **`FIN-PRO Audit Export`:**
   - **Trigger:** Exports full general ledger for statutory auditor review in standard `.xlsx` or `.csv` formats.
4. **`Configure Balance Sheet` Modal:**
   - **Trigger:** Customizes visibility of specific asset/liability line items based on business structure.

---

### 2.12 Business Expenses & Reimbursement Claims

#### Route & Purpose
- **Absolute Route:** `/finance/expenses` (supports query params: `?create=true` or `?claim=true`).
- **Core Business Objective:** Operational expenditure tracking, departmental spending budgets, recurring standing orders, and staff expense reimbursement claims.

#### Metrics & Summary Cards
1. **Monthly Outflows:** Total operational spending logged in the current calendar month.
2. **Input Tax Credits:** Embedded GST claimable on business purchases (office supplies, software, travel).
3. **Top Outflow Category:** Category accounting for the largest percentage of total monthly spending.
4. **Pending Claims:** Unapproved employee reimbursement claims awaiting manager review.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `registry`: Primary operational expense vouchers log.
  - `recurring`: Scheduled repeating debits (Rent, SaaS subscriptions, utility bills).
  - `budget`: Departmental spending caps with visual progress bars showing budget consumption.
  - `claims`: Employee reimbursement claims submitted for approval.
- **Filters:** Category dropdown (`Rent`, `Marketing`, `Utilities`, `Payroll`, etc.), Payment Mode, Date pickers, Column filters.

#### Action Buttons & Modals
1. **`+ Add Expense`:**
   - **Form Fields:** Expense Category, Amount ($> 0$), Date, Payee/Vendor, Payment Mode (`Cash in Hand`, `HDFC Bank`, `UPI`, etc.), Tax Rate (for ITC claiming), Receipt Attachment upload, Notes.
2. **`+ Set Department Budget`:**
   - **Form Fields:** Category Name, Monthly Spending Limit ($> 0$), Notification Threshold percentage (e.g., alert at 80%).
3. **`+ File Reimbursement Claim`:**
   - **Form Fields:** Staff Member selection, Expense Title, Amount, Bill Date, Scanned Receipt File.
4. **`Pay Claim`:**
   - **Trigger:** Approves and disburses an employee claim, automatically generating a payment voucher in the cash/bank ledger.

---

### 2.13 GST & Tax Compliance Engine

#### Route & Purpose
- **Absolute Route:** `/finance/gst` (supports query params: `?tab=gstr1`, `?tab=gstr2`, `?tab=gstr3b`, `?tab=gstr9`).
- **Core Business Objective:** Statutory Indian GST compliance engine handling outward sales returns (GSTR-1), purchase ITC reconciliations (GSTR-2B), monthly liability settlements (GSTR-3B), and annual audit preparation (GSTR-9).

#### Metrics & Summary Cards
- **When viewing GSTR-1 (Sales):**
  1. *Total Taxable Sales:* Cumulative base value of taxable supplies.
  2. *Total Output GST:* Total tax collected ($\text{CGST} + \text{SGST} + \text{IGST}$).
  3. *Total IGST:* Inter-state integrated tax collected.
  4. *Total CGST + SGST:* Intra-state central and state tax collected.
  5. *B2B Invoices:* Count of registered business invoices with valid GSTINs.
  6. *B2C Invoices:* Count of unregistered retail invoices.
  7. *Export Invoices:* Count of export supplies (with or without LUT).
  8. *Total Count:* Total sales vouchers included in the filing return.
- **When viewing GSTR-3B / General Compliance:**
  1. *Total Output GST Collected:* Gross tax liability from outward supplies.
  2. *Eligible ITC (Claimed GSTR-2B):* Verified input tax credit on vendor purchases.
  3. *Net GST Payable Liability:* Net tax payable after offsetting eligible ITC:  
     $$\text{Net Tax} = \max(0, \, \text{Output GST} - \text{Eligible ITC})$$
  4. *Cumulative Taxable Sales:* Aggregate commercial supply volume.

#### Sub-Tabs & Filtering Controls
- **Filing Return Tabs:**
  - `gstr1`: Outward supplies breakdown (B2B, B2C Large, B2C Small, Exports, Credit/Debit Notes).
  - `gstr2`: Inward purchases and automated GSTR-2B reconciliation against supplier portal filings.
  - `gstr3b`: Monthly summary return showing net tax payable across IGST, CGST, and SGST buckets.
  - `gstr9`: Consolidated annual return metrics with year-over-year reconciliation comparisons.
- **Filters:** Financial Year selector (`2024-25`, `2025-26`), Month/Quarter toggle, Invoice search, and Column-level filters.

#### Action Buttons & Modals
1. **`+ Generate e-Invoice`:** Creates authenticated invoice with IRN and signed QR code.
2. **`+ Generate e-Way Bill`:** Creates transit permit with vehicle and transporter details.
3. **`Reconcile GSTR-2B Entry`:**
   - **Form Fields:** Vendor GSTIN, Invoice Number, Purchase Amount, Tax Rate, Match Status (`Matched`, `Mismatch in Tax`, `Missing in Portal`).
   - **Workflow:** Updates reconciliation flags in purchase ledger to prevent claiming ineligible ITC.
4. **`Export JSON / Excel for Portal Upload`:**
   - Generates government-compliant JSON payloads for direct upload to the GST Common Portal (`gst.gov.in`).

---

### 2.14 FITTECH / FIN-PRO Auditor Workspace

#### Route & Purpose
- **Absolute Routes:** `/ca` (`mode="personal"`) and `/finance/fittech` (`mode="business"`).
- **Core Business Objective:** Professional chartered accountant and compliance auditor hub providing ICAI COP verification, automated audit rule checking, statutory working papers, corporate resolution vaults, and practice management tools.

#### Key Capabilities & Sub-Desks
1. **ICAI Professional Credential Gate:**
   - Captures and verifies CA Membership Number, Certificate of Practice (COP) status, Associate/Fellow designation (ACA/FCA), and regional council affiliation.
2. **Auditor Practice Desks:**
   - *Statutory Financial Auditor (ICAI CA):* Balance sheet disclosures, CARO 2020 checklists, and accounting standard compliance.
   - *Tax Auditor (ICAI CA):* Section 44AB Form 3CD compliance, depreciation allowances, and TDS reconciliations.
   - *Internal Auditor (CIA / CA / CMA):* Internal financial controls (IFC) testing and risk matrix audits.
   - *Cost Auditor (ICMAI CMA):* Manufacturing cost statements and inventory valuation verification.
   - *Secretarial Auditor (ICSI CS):* Companies Act 2013 secretarial compliance, director disclosures, and board resolution tracking.
   - *Forensic Auditor (ICAI FAFD / CFE):* Anomaly detection algorithms scanning expenses for duplicate bill submissions, round-number patterns, and unusual vendor disbursements.
3. **Corporate Resolutions Vault:**
   - Template library and signed repository for Board Resolutions, AGM Minutes, and Banking Mandates.

---

### 2.15 Human Resources: Staff, Attendance & Payroll

#### Route & Purpose
- **Absolute Routes:** `/hr/staff`, `/hr/attendance`, `/hr/payroll` (Feature-gated: requires Starter Plan or higher).
- **Core Business Objective:** Workforce onboarding, shift attendance monitoring, overtime tracking, salary slip computation, and statutory labor compliance (PF, ESI, TDS).

#### Metrics & Summary Cards
1. **Total Active Employees:** Count of active workforce members.
2. **Monthly Payroll Liability:** Gross salary obligations for the current pay cycle.
3. **Present Today:** Daily employee attendance rate.
4. **Pending Leave Requests:** Staff leave applications awaiting manager approval.

#### Sub-Tabs & Filtering Controls
- **Staffing (`/hr/staff`):** `Active Staff`, `Departments`, `KYC & Documents Vault`.
- **Attendance (`/hr/attendance`):** `Daily Register`, `Monthly Timesheets`, `Leave Approvals`.
- **Payroll (`/hr/payroll`):** `Salary Processing`, `Disbursement Slips`, `Statutory Dues (PF/ESI)`.

#### Action Buttons & Modals
1. **`+ Onboard Employee`:**
   - **Form Fields:** Employee Code, First & Last Name, Designation, Department, Date of Joining, Contact Phone, Official Email, Emergency Contact, PAN, Aadhaar Number, Bank Account Info, Basic Pay, HRA, Allowances, PF/ESI Opt-in.
2. **`Mark Daily Attendance`:**
   - Modal logging daily status (`Present`, `Absent`, `Half-day`, `Paid Leave`) with shift arrival/departure times.
3. **`Run Monthly Payroll`:**
   - Computes salary deductions based on attendance records, generates itemized salary slips, and creates corresponding wage disbursement vouchers in the accounting ledger.

---

### 2.16 Business Intelligence & Analytics Reports

#### Route & Purpose
- **Absolute Route:** `/reports` (aliased from `/sales/reports`).
- **Core Business Objective:** Multi-dimensional business intelligence engine offering sales trends, customer profitability analysis, inventory movement velocity, and procurement cost auditing.

#### Key Capabilities
- **Report Categories:**
  - *Sales Reports:* Gross revenue, sales by SKU, sales by customer, regional distribution, returned orders.
  - *Financial Reports:* Multi-period P&L comparisons, cash flow statements, tax liability summaries.
  - *Inventory Reports:* Stock aging analysis, fast vs slow-moving items, shrinkage reports.
  - *Procurement Reports:* Spend by vendor, purchase price variance, payment lead times.
- **Export Capabilities:** 1-click downloads to Microsoft Excel (`.xlsx`) and Comma-Separated Values (`.csv`).

---

### 2.17 Payments & Cash Flow Engine (Transactions)

#### Route & Purpose
- **Absolute Route:** `/payments/transaction` (aliased from `/payments`).
- **Core Business Objective:** Central cash flow clearinghouse managing customer invoice collections, supplier debt payments, internal contra bank transfers, and overdue payment reminder templates.

#### Metrics & Summary Cards
1. **Outstanding Receivables:** Cumulative overdue funds awaiting collection.  
   *Calculation:* $\sum (\text{overdue.pending\_amount})$.
2. **Daily Collections:** Liquid funds collected on the current business day.  
   *Calculation:* $\sum (\text{receivable.paid\_amount}) \quad \forall \, \text{payment\_date} = \text{Today}$.
3. **Combined Balances:** Total liquid capital across all bank accounts and cash drawers.  
   *Calculation:* $\sum (\text{bank\_account.current\_balance})$.
4. **Efficiency Rate:** Collection recovery benchmark rate.  
   *Value:* Standard baseline $94.2\%$.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `receivables`: Customer Receivables (Inward customer payment vouchers).
  - `payables`: Supplier Payables (Outward vendor payment vouchers).
  - `bank`: Bank & Cash Registers (Multi-account balances and contra transfers).
  - `reminders`: Overdue Collections & Reminders (Aging invoices with WhatsApp reminder triggers).
- **Filters:** Global quick-search input with expand/collapse animation, column-level filters on Voucher ID, Date, Party, and Status.

#### Action Buttons & Modals
1. **`Pay Supplier` Modal:**
   - **Trigger:** Header button opening vendor disbursement modal.
   - **Form Fields & Validations:**
     - Supplier selection: Dropdown populated from `suppliersList`, automatically displaying the vendor's running balance.
     - Linked Purchase Bill Reference (e.g., `BILL-77091`).
     - Original Due Amount: Non-negative numerical value.
     - Payment Amount: Strictly positive number ($> 0$). Automatically clamped so $\text{Payment Amount} \le \text{Original Due Amount}$.
     - Payment Mode (`Bank Transfer`, `Cash`, `UPI`, `Cheque`).
     - Reference / Cheque Number.
   - **Submission Workflow:** Sends payload to `POST /payments/pay`. Validates response status (treating codes 200–299 as success). Optimistically updates `supplierPayables` state, refetches reports in the background, and closes modal without page refresh.
2. **`Receive Payment` Modal:**
   - **Trigger:** Header button opening customer collection modal.
   - **Form Fields:** Customer Name, Linked Invoice ID, Total Original Amount, Amount Received ($> 0$ and $\le \text{Total Amount}$), Payment Mode, Transaction Reference.
   - **Submission Workflow:** Calls `paymentService.receivePayment`. Invalidates payment and accounting queries.
3. **`Transfer Funds` (Internal Contra Transfer Modal):**
   - **Trigger:** Located within the `bank` sub-tab.
   - **Form Fields & Validations:** Source Account (`from_acc_id`), Destination Account (`to_acc_id`), Transfer Amount ($> 0$).
   - **Validation Rules:** Source and destination accounts cannot be identical. Transfer amount cannot exceed available balance in the source account.

---

### 2.18 People Master & Lend/Borrow Rolodex

#### Route & Purpose
- **Absolute Route:** `/payments/people` (redirects from `/payments/wallet` and `/payments/rewards`).
- **Core Business Objective:** Contact rolodex and personal/business informal credit tracker managing lent funds, borrowed capital, maturity dates, and repayment reminders.

#### Metrics & Summary Cards
1. **Total You'll Get:** Aggregate lent capital pending collection.  
   *Calculation:* $\sum (\text{person.net\_balance}) \quad \forall \, \text{net\_balance} > 0$.
2. **Total You'll Give:** Aggregate borrowed capital pending repayment.  
   *Calculation:* $\sum |\text{person.net\_balance}| \quad \forall \, \text{net\_balance} < 0$.
3. **Active Network:** Total enrolled contacts.  
   *Calculation:* $\text{Count}(\text{people})$.
4. **Reminders Due:** Count of upcoming settlement maturities.

#### Sub-Tabs & Filtering Controls
- **Sub-Tabs:**
  - `contacts`: Directory of enrolled partners, friends, contractors, and affiliates.
  - `transactions`: Chronological ledger of lent and borrowed capital movements.
  - `reminders`: Settlement reminders with scheduled maturity dates.
- **Filters:** Group filter (`All`, `Friend`, `Colleague`, `Family`, `Business Partner`), Status filter (`Active`, `Archived`), and Name search.

#### Action Buttons & Modals
1. **`+ Enrol Contact`:**
   - **Fields:** Full Name, Role/Category, Phone Number (10 digits), Email, Company, Relationship, Opening Balance.
2. **`Record Transaction` (Lend / Borrow Modal):**
   - **Fields:** Person selection, Transaction Type (`lent` vs `borrowed`), Amount ($> 0$), Date, Purpose/Notes.
   - **Validation:** Enforces positive numerical values; updates person's net balance on save.
3. **`Share Reminder via WhatsApp`:**
   - Generates pre-filled WhatsApp message detailing balance owed and settlement date.

---

### 2.19 Segregation Target Wallets

#### Route & Purpose
- **Absolute Route:** `/payments/segregation`.
- **Core Business Objective:** Target-based fund isolation engine allowing businesses to segregate operating capital into protected buckets for specific future outlays (e.g., quarterly advance tax, equipment purchases, office expansion).

#### Metrics & Summary Cards
1. **Target Wallets Active:** Number of active, uncompleted purpose wallets.  
   *Calculation:* $\text{Count}(\text{wallets}) \quad \forall \, \text{status} \ne \text{'completed'}$.
2. **Total Isolated Funds:** Cumulative money locked inside purpose wallets.  
   *Calculation:* $\sum (\text{wallet.current\_amount})$.
3. **Goal Completion Target:** Aggregate target funding required across all wallets.  
   *Calculation:* $\sum (\text{wallet.target\_amount})$.
4. **Target Accomplishment:** Overall funding progress percentage:  
   $$\text{Progress} = \left\lfloor \frac{\text{Total Isolated Funds}}{\text{Goal Completion Target}} \times 100 \right\rfloor \%$$

#### Action Buttons & Modals
1. **`+ Setup Purpose Wallet`:**
   - **Form Fields & Validations:**
     - Wallet Name (mandatory).
     - Target Goal Amount: Must be greater than zero ($> 0$).
     - Target Rationale / Description.
   - **Submission:** Submits to `goalWalletService.createWallet`. Automatically updates wallet grid.
2. **`Allocate Funds` (`+ Add Money`):**
   - **Trigger:** Modal on active wallet card.
   - **Validation:** Amount must be strictly greater than zero ($> 0$).
   - **Workflow:** Increments `current_amount` and advances the visual progress bar.
3. **`Claim Funds`:**
   - **Trigger:** Unlocks when $\text{current\_amount} \ge \text{target\_amount}$.
   - **Workflow:** Marks wallet as completed, releasing locked funds back into general operational accounts.
4. **`View History / Ledger`:**
   - Displays all historical allocations and timestamps for the selected wallet.

---

### 2.20 Split & Collect (Group Expense & Debt Settlement)

#### Route & Purpose
- **Absolute Route:** `/payments/split-collect`.
- **Core Business Objective:** Collaborative group expense management and debt simplification engine for shared projects, partner expenses, and multi-vendor procurement.

#### Metrics & Summary Cards
- **Per-Group Metrics:**
  1. *Total Group Outlay:* Total expenditure incurred by the group, strictly excluding debt settlement transactions:  
     $$\text{Outlay} = \sum (\text{expense.amount}) \quad \forall \, \text{expense.isSettlement} \ne \text{true}$$
  2. *Your Net Balance:* Positive value (you are owed money by the group) or negative value (you owe money to the group).
  3. *Simplified Debts:* Minimal cash transfer transactions computed using greedy debt simplification algorithms to settle all group obligations in the fewest possible payments.

#### Action Buttons & Modals
1. **`+ Create Group`:**
   - **Form Fields:** Group Title, Currency (`INR`, `USD`, `EUR`, `GBP`), Description, Participants List (minimum of 2 participants required).
2. **`+ Add Expense`:**
   - **Form Fields & Validations:** Expense Title, Total Amount ($> 0$), Paid By (member dropdown), Date, Scanned Receipt Upload (Multipart Form), Split Type (`equal` vs `custom`).
   - **Custom Split Validation:** When `custom` is chosen, individual participant share inputs are rendered. Enforces non-negative values and requires:  
     $$\sum (\text{shares}_i) = \text{Total Expense Amount} \quad (\pm 0.10 \text{ tolerance})$$
3. **`Settle Debt` (Full Instant Settlement):**
   - **Trigger:** One-click settlement button on any simplified debt item (`X owes Y ₹Z`).
   - **Workflow:** Immediately generates a balancing transaction of type `SETTLEMENT`, clearing the debt without manual calculation.
4. **`Custom Pay` Modal:**
   - **Trigger:** Button on debt card allowing partial or itemized debt payment.
   - **Form Fields:** Expense Selector (dropdown listing specific eligible expenses paid by the creditor), Payment Amount (defaults to debtor's exact share of that item, but editable).
   - **Naming Convention:** Automatically records the settlement transaction as:  
     $$\text{"Settlement for [Expense Title]: [From] paid [To]"}$$
5. **Direct Document Preview Actions:**
   - **Mechanism:** Document URLs are resolved through utility functions (`resolveFileUrl`, `isPdfFile`). PDFs are loaded directly inside Google Docs Viewer iframes (`docs.google.com/viewer?url=...`), while images render in sanitized modal overlays, avoiding CORS download failures.

---

### 2.21 Payment Planner & Recurring Obligations

#### Route & Purpose
- **Absolute Route:** `/payments/plan` (aliased from `/payments/planner`).
- **Core Business Objective:** Future cash flow scheduling, loan EMI tracking, recurring vendor contract payments, and receivable collection forecasting.

#### Metrics & Summary Cards
1. **Total Scheduled:** Total number of scheduled obligations on the calendar.  
   *Calculation:* $\text{Count}(\text{plans})$.
2. **Total Sended:** Aggregate outward payment obligations scheduled for future transfer.  
   *Calculation:* $\sum (\text{plan.amount}) \quad \forall \, \text{plan.type} = \text{'SEND'}$.
3. **Total Received:** Aggregate expected incoming collections.  
   *Calculation:* $\sum (\text{plan.amount}) \quad \forall \, \text{plan.type} = \text{'RECEIVE'}$.
4. **Pending Task:** Count of planned schedules awaiting completion or settlement.  
   *Calculation:* $\text{Count}(\text{plans}) \quad \forall \, \text{status} \ne \text{'COMPLETED'}$.

#### Sub-Tabs & Filtering Controls
- **Pill Filter Controls:**
  - `All`: Displays all scheduled items regardless of flow direction.
  - `Send`: Filters schedules where payment direction is `SEND`, `OUTWARD`, or `flow === 'out'`.
  - `Receive`: Filters schedules where payment direction is `RECEIVE`, `INWARD`, or `flow === 'in'`.
- **Search Bar:** Real-time text filter scanning plan title, description, and beneficiary name.

#### Action Buttons & Modals
1. **`Schedule Payment` Modal:**
   - **Form Fields & Validations:**
     - Beneficiary / Payer: Selected from enrolled People contacts, or created via nested quick-enroll modal.
     - Schedule Name / Title (mandatory).
     - Amount: Numerical value strictly greater than zero ($> 0$).
     - Due Date: Date picker formatted as `YYYY-MM-DD`.
     - Transaction Type: Toggle between `SEND` (outward payment) and `RECEIVE` (incoming collection).
     - Category (`General`, `Supplier`, `Salary`, `Rent`, `EMI`, `Tax`).
     - Description / Notes.
   - **Submission:** Calls `plannedPaymentsService.createPayment`. Optimistically invalidates `['planned-payments']` query.
2. **Row Actions:**
   - **Mark as Paid / Settled:** Calls `markAsPaid` mutation, immediately moving the schedule to completed status.
   - **Delete Schedule:** Permanently removes planned item after custom confirmation.

---

### 2.22 Partner Launch Desk (BETA Club Pitches & Capital Matrix)

#### Route & Purpose
- **Absolute Route:** `/social/betaclub` (redirects from `/social/meetup` and `/social/investors`).
- **Core Business Objective:** Venture capital and commercial syndication network connecting startup founders, accredited angel investors, and enterprise partners.

#### Sub-Tabs & Views
- `directory`: Pitch Directory & Venture Capital Matrix (filterable by sector: FinTech, SaaS, Healthcare, AI, Consumer).
- `studio`: Founder Launch Studio where entrepreneurs submit pitch decks, traction metrics, and equity term sheets.
- `admin`: Curator Moderation Desk for reviewing and approving investor applications and founder pitch submissions.

#### Metrics & Action Modals
- **Metrics:** Total Verified Pitches, Investor Connections Initiated, Total Funding Sought.
- **Modals:** Pitch Submission Wizard, Investor Due Diligence Request Modal, Founder Direct Connect Drawer.

---

### 2.23 Trading Docs & Equity Certificates

#### Route & Purpose
- **Absolute Route:** `/social/trading`.
- **Core Business Objective:** Formal document vault for equity trading agreements, investment term sheets, share purchase agreements (SPA), and compliance certificates.

#### Key Capabilities
- Digital storage and indexing of investment agreements.
- SHA-256 document hashing verifying document integrity for legal discovery.
- Print and PDF download triggers for corporate secretarial compliance.

---

## 3. Platform Administration & Role-Based Portals

```
├── ROLE-BASED ACCESS CONTROL (RBAC)
│   ├── 3.1 Super Admin Control Center (/admin/*)
│   ├── 3.2 Platform Sales Representative Portal (/sales-portal/*)
│   └── 3.3 Customer Support Desk (/support-portal/*)
```

### 3.1 Super Admin Control Center (`/admin/*`)
- **Route Guard:** Requires verified `role="admin"` session.
- **Sub-Routes & Pages:**
  - `/admin/dashboard`: Platform-wide gross transaction volume (GTV), tenant registration velocity, and active user counters.
  - `/admin/users`: Tenant Matrix for viewing, suspending, or impersonating tenant accounts (`impersonateLogin`, which flushes local query caches to prevent data leakage).
  - `/admin/sales`: Platform subscription revenue, subscription tier upgrades, and commission calculations.
  - `/admin/sales-team`: Internal platform marketing and sales agent quotas.
  - `/admin/sales-leads`: Customer lead pipelines and enterprise sales conversion tracking.
  - `/admin/support-team`: Support agent performance, open ticket assignments, and resolution SLAs.
  - `/admin/moderation`: Moderation queue for public posts, BETA Club startup pitches, and marketplace items.
  - `/admin/logs`: Immutable system audit trail capturing IP addresses, administrative overrides, and security events.
  - `/admin/settings`: Global platform engine overrides, feature flag toggles, and payment gateway credentials.

### 3.2 Platform Sales Representative Portal (`/sales-portal/*`)
- **Route Guard:** Requires verified `role="sales_agent"` session.
- **Key Views:**
  - `/sales-portal/dashboard`: Personal sales performance metrics, earned commissions, and quota attainment.
  - `/sales-portal/leads`: Lead tracking dashboard for recording prospect discovery notes, scheduling demos, and converting leads into paying tenants.

### 3.3 Customer Support Desk (`/support-portal/*`)
- **Route Guard:** Requires verified `role="support_agent"` session.
- **Key Views:**
  - `/support-portal/dashboard`: Incoming support ticket queue, user issue categorization, priority levels, and resolution status toggling.
  - `/support-portal/faq`: Knowledge base registry and customer FAQ management.

---

## 4. Docked Panel Utilities & Shared Application State

All main application layouts (`MainLayout.jsx`) include a slide-out docked utility tray accessible from the global topbar:

| Utility Name | Component | Functional Description |
| :--- | :--- | :--- |
| **Financial Calculator** | `CalcPopover` | Inline multi-memory calculator supporting tax percentages, discounts, and rapid balance sums. |
| **Beta Products Launcher**| `ProductLauncher` | Drawer for switching between Cliks ecosystem utilities (BNXmail, Bit-Tool, B2Auth, Lens, Translator). |
| **Calendar & Agenda** | `CalendarPanel` | Business calendar for scheduling customer follow-ups, tax filing due dates, and board meetings. |
| **Global Rolodex** | `ContactPanel` | Global business address book synchronized with platform contacts. |
| **Quick Notes** | `NotesPanel` | Ephemeral scratchpad for drafting meeting notes, terms, and billing reminders. |
| **Weather Forecast** | `WeatherPanel` | Real-time weather and climate forecasts for logistics planning and field dispatches. |
| **System Audit Panel** | `AuditPanel` | Slide-out tray displaying real-time security events and login sessions for the active tenant. |
| **Storage Usage Modal** | `storageService` | Visual bar chart breaking down the tenant's 1.00 GB storage allocation across Audit files (40%), Invoices/Bills (25%), Expense Scans (15%), HR/Payroll (10%), and Media (10%). |
| **Notification Center** | `NotificationDropdown` | Real-time alerts for overdue customer invoices, low-stock warnings, and payment receipts. |

---

## 5. Technical Validation, Error Handling & Data Integrity Rules

```
INPUT SUBMISSION
  │
  ├── 1. Client-side Sanitization (trim, numeric conversion, uppercase GSTIN/PAN)
  ├── 2. Schema Validation (validates phone digits, email format, positive amounts)
  ├── 3. Clamping Logic (Payment Amount cannot exceed Original Due Amount)
  ├── 4. Optimistic UI Update (immediate state repainting before network returns)
  ├── 5. HTTP Response Code Check (200-299 status code verification)
  │     ├── Success ──> Query Cache Invalidation (queryClient.invalidateQueries)
  │     └── Failure ──> Revert optimistic update & display modal alert
  └── 6. Audit Trail Logging (writes action to system audit log)
```

1. **Numerical Input Sanitization:**
   - Numerical currency inputs across billing, expenses, and payments strip invalid non-numeric characters and reject negative values or zero ($x \le 0$) where positive amounts are required.
2. **Payment Amount Clamping:**
   - On outward supplier payments (`handleSaveSupplierPayment`) and custom debt settlements (`handleCustomPaySubmit`), the entered payment amount is automatically validated and clamped against the running due balance:
     $$\text{Paid Amount} = \min(\text{Entered Amount}, \, \text{Outstanding Balance})$$
3. **HTTP Status Code Verification:**
   - Service calls treat any status code in the $200 \le \text{status} \le 299$ range as a complete success. The UI avoids displaying false failure alerts on standard `200 OK` or `201 Created` responses.
4. **CORS-Free Document Rendering:**
   - File viewing functions (`resolveFileUrl`, `openAttachmentInNewTab`, `getSafePdfUrl`) normalize all file paths to absolute URLs and wrap PDF assets in Google Docs Viewer endpoints. This eliminates cross-origin iframe security blocks during administrative review.
5. **Dual-Database Query Translation:**
   - The backend query layer (`CLIKS-BE/db/connection.js`) intercepts SQL queries at runtime, translating SQLite parameter markers (`?`) and date functions (`strftime`) into PostgreSQL-compliant syntax (`$1`, `TO_CHAR`) for seamless transition between development and production environments.
