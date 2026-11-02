import React from 'react';
import { 
    BookOpen, Calculator, Users, Coins, X, Search, Sliders, Calendar, Contact, 
    Keyboard, Languages, Scan, ShieldCheck, CloudSun, Newspaper, Edit, Plus, 
    Minus, Check, ChevronRight, SlidersHorizontal, Palette, Bell, User, Lock, Info,
    LayoutDashboard, PercentCircle, Receipt, Package, Layers, TrendingUp, BarChart3,
    UsersRound, LineChart, FileText, ShoppingCart, MapPin, Truck, Monitor, Barcode,
    HelpCircle, Gift, Target, Split, Wallet, CreditCard,
    StickyNote, Briefcase, Tag, Clock, CheckCircle2, AlertCircle, AlertTriangle, 
    ArrowDownRight, ArrowUpRight, Landmark
} from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth, useLanguage } from '../context';
import { apiClient } from '../api/client';
import logoPng from '../assets/cliks6.png'; // Final branding
import accessKitPng from '../assets/ACCESS_KIT.png';
import { motion, AnimatePresence } from 'framer-motion';

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';
import ProductLauncher from './ProductLauncher';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { caService } from '../services/caService';
import BranchSelector from './BranchSelector';

const staticPages = [
    // ══════════════════════════════════════════════════════════════════
    // 1. PRIMARY WORKSPACES & MODULES
    // ══════════════════════════════════════════════════════════════════
    { name: 'Books', path: '/dashboard', module: 'Books', type: 'Module', desc: 'Enterprise ERP, Invoicing, Inventory & Accounts', icon: 'BookOpen', rank: 1, synonyms: ['books', 'erp', 'business', 'company', 'workspace'] },
    { name: 'Payments', path: '/payments/people', module: 'Payments', type: 'Module', desc: 'Cash Flow Engine, Escrow, P2P Ledger & Wallets', icon: 'CreditCard', rank: 1, synonyms: ['payments', 'finance', 'billing', 'upi', 'cash flow', 'escrow', 'money'] },
    { name: 'Social', path: '/social/betaclub', module: 'Social', type: 'Module', desc: 'Founder Community, Pitches & Trading Documents', icon: 'Users', rank: 1, synonyms: ['social', 'network', 'chat', 'feed', 'pitches', 'community'] },
    { name: 'Beta Products (Access Kit)', path: '/beta-launcher', module: 'Access Kit', type: 'Module', desc: 'Floating Utilities, Productivity & Financial Tools', icon: 'Sliders', rank: 1, synonyms: ['beta products', 'access kit', 'launcher', 'apps', 'utilities', 'sidebar tools'] },

    // ══════════════════════════════════════════════════════════════════
    // 2. BOOKS SUBMODULES & MAIN HUBS
    // ══════════════════════════════════════════════════════════════════
    { name: 'Dashboard', path: '/dashboard', module: 'Books', type: 'Page', desc: 'Live business performance, net cash flow & metrics', icon: 'LayoutDashboard', rank: 2, synonyms: ['dashboard', 'home', 'overview', 'matrix', 'analytics', 'summary'] },
    { name: 'Sales Hub', path: '/sales/invoice', module: 'Sales', type: 'Page', desc: 'Sales Invoices, Orders, Challans & CRM', icon: 'Receipt', rank: 2, synonyms: ['sales', 'sell', 'orders', 'sa', 'billing', 'invoices'] },
    { name: 'Point of Sale (POS)', path: '/pos', module: 'POS', type: 'Page', desc: 'Retail point of sale billing counter & barcode checkout', icon: 'Monitor', rank: 2, synonyms: ['pos', 'pos billing', 'point of sale', 'counter', 'checkout', 'register', 'retail counter', 'quick bill'] },
    { name: 'Purchases Hub', path: '/purchases/purchases', module: 'Purchases', type: 'Page', desc: 'Vendor bills, Purchase Orders & Supplier ledgers', icon: 'ShoppingCart', rank: 2, synonyms: ['purchases', 'buy', 'suppliers', 'vendors', 'procurement', 'po'] },
    { name: 'Inventory & Stock Hub', path: '/inventory/products', module: 'Inventory', type: 'Page', desc: 'Products catalog, stock tracking & warehouses', icon: 'Layers', rank: 2, synonyms: ['inventory', 'stock', 'warehouse', 'godown', 'items', 'catalog', 'sku'] },
    { name: 'Finance & Accounts Hub', path: '/finance/accounting', module: 'Finance', type: 'Page', desc: 'Financial accounts, Daybook, P&L & Balance Sheet', icon: 'Calculator', rank: 2, synonyms: ['finance', 'accounting', 'accounts', 'money', 'capital', 'ledger'] },
    { name: 'HR & Payroll Hub', path: '/hr/staff', module: 'HR', type: 'Page', desc: 'Staff directory, daily attendance & salary payslips', icon: 'UsersRound', rank: 2, synonyms: ['hr', 'staff', 'payroll', 'salary', 'attendance', 'employees', 'human resources'] },
    { name: 'GST & Compliance Hub', path: '/finance/gst', module: 'Compliance', type: 'Page', desc: 'GST filing returns (GSTR-1, 3B, ITC) & Tax summary', icon: 'PercentCircle', rank: 2, synonyms: ['gst', 'tax', 'gstr', 'compliance', 'filing', 'itc', 'taxes'] },
    { name: 'FIN-PRO CA Audit Suite', path: '/ca', module: 'Audit', type: 'Page', desc: 'Chartered Accountant portal, Section 43B(h) MSME & Tax Audit', icon: 'ShieldCheck', rank: 2, synonyms: ['finpro', 'fin-pro', 'ca', 'audit', 'chartered accountant', 'auditor', 'tax audit'] },
    { name: 'Business Reports', path: '/reports', module: 'Reports', type: 'Page', desc: 'Financial performance charts, sales analytics & graphs', icon: 'BarChart3', rank: 2, synonyms: ['reports', 'analytics', 'charts', 'graphs', 'performance', 'sales report'] },

    // ══════════════════════════════════════════════════════════════════
    // 3. POS BILLING & COUNTER FEATURES
    // ══════════════════════════════════════════════════════════════════
    { name: 'POS Billing Counter', path: '/pos', module: 'POS', type: 'Feature', desc: 'Fast retail counter, barcode scanning & cart checkout', icon: 'Monitor', rank: 3, synonyms: ['pos counter', 'retail bill', 'scan checkout', 'barcode billing', 'cash counter'] },
    { name: 'POS Order History & Held Carts', path: '/pos?tab=history', module: 'POS', type: 'Internal Feature', desc: 'Recall held carts, review past POS orders & print slips', icon: 'Clock', rank: 3, synonyms: ['held carts', 'hold cart', 'recall order', 'held transactions', 'pos history', 'recall bills'] },
    { name: 'Quick Register Item (POS)', path: '/pos?action=add-product', module: 'POS', type: 'Action', desc: 'Instantly register a new product without leaving the POS counter', icon: 'Plus', rank: 3, synonyms: ['quick register item', 'add item in pos', 'quick product', 'fast register', 'add item pos'] },
    { name: 'Split Payment (Multi-Tender POS)', path: '/pos?feature=split-payment', module: 'POS', type: 'Internal Feature', desc: 'Split checkout across Cash, UPI, Card, Store Credit & Loyalty Points', icon: 'Split', rank: 3, synonyms: ['split payment pos', 'multi tender', 'mixed payment', 'partial cash upi', 'split bill pos'] },
    { name: 'Customer Loyalty Points (POS)', path: '/pos?feature=loyalty', module: 'POS', type: 'Internal Feature', desc: 'Redeem and earn customer reward loyalty points at checkout', icon: 'Gift', rank: 3, synonyms: ['loyalty points pos', 'redeem points', 'earn loyalty', 'customer points claim'] },
    { name: 'Store Credit & Balance (POS)', path: '/pos?feature=store-credit', module: 'POS', type: 'Internal Feature', desc: 'Apply customer advance balance or store credit towards bills', icon: 'Wallet', rank: 3, synonyms: ['store credit', 'customer balance', 'advance credit', 'credit balance pos'] },
    { name: 'Product Info & Sales Analytics (POS)', path: '/pos?feature=product-info', module: 'POS', type: 'Internal Feature', desc: 'View Stock, Rack Location, Expiry, Warranty & Customer buyers breakdown', icon: 'Info', rank: 3, synonyms: ['product info pos', 'expiry info', 'rack location', 'warranty info', 'batch tracking pos', 'product analytics'] },
    { name: 'Thermal Slip & Receipt Print', path: '/pos?feature=print', module: 'POS', type: 'Feature', desc: 'Print 80mm thermal receipt slip, A4 GST invoice or download PDF', icon: 'Receipt', rank: 3, synonyms: ['thermal print', '80mm receipt', 'slip print', 'thermal slip', 'print bill'] },

    // ══════════════════════════════════════════════════════════════════
    // 4. SIMPLE BILLING & ARCHIVE
    // ══════════════════════════════════════════════════════════════════
    { name: 'Simple Billing', path: '/billing/simple', module: 'Billing', type: 'Page', desc: 'Rapid bill generator with dynamic on-the-fly line items', icon: 'Receipt', rank: 3, synonyms: ['simple billing', 'quick bill', 'fast bill', 'cash memo', 'dynamic items bill'] },
    { name: 'Billing Records Archive', path: '/billing/records', module: 'Billing', type: 'Page', desc: 'History of submitted simple bills, customer revenue & prints', icon: 'FileText', rank: 3, synonyms: ['billing records', 'past bills', 'bills history', 'receipt archive', 'simple billing records'] },

    // ══════════════════════════════════════════════════════════════════
    // 5. SALES, INVOICING & CRM
    // ══════════════════════════════════════════════════════════════════
    { name: 'Sales Invoices', path: '/sales/invoice', module: 'Sales', type: 'Page', desc: 'GST compliant sales tax invoices, drafting & dispatch', icon: 'Receipt', rank: 3, synonyms: ['sales invoice', 'tax invoice', 'gst invoice', 'customer bills', 'invoicing'] },
    { name: 'Generate Sales Invoice', path: '/sales/invoice?create=true', module: 'Sales', type: 'Action', desc: 'Create a brand new GST tax invoice for a customer', icon: 'Plus', rank: 3, synonyms: ['generate invoice', 'new invoice', 'create invoice', 'add invoice', 'bill client'] },
    { name: 'Sales Orders', path: '/sales/orders', module: 'Sales', type: 'Page', desc: 'Manage customer sales orders, fulfillment & delivery status', icon: 'TrendingUp', rank: 3, synonyms: ['sales orders', 'so', 'customer orders', 'order booking', 'order fulfillment'] },
    { name: 'Sales Returns & Credit Notes', path: '/sales/returns', module: 'Sales', type: 'Page', desc: 'Record returned goods, refund vouchers & credit notes', icon: 'ArrowDownRight', rank: 3, synonyms: ['sales return', 'credit note', 'credit notes', 'refund', 'goods return'] },
    { name: 'Customers & CRM Directory', path: '/sales/customers', module: 'Sales', type: 'Page', desc: 'Client directory, outstanding balances, GSTINs & ledger', icon: 'Users', rank: 3, synonyms: ['customers', 'crm', 'clients', 'buyer directory', 'customer list', 'client ledger'] },
    { name: 'Add New Customer', path: '/sales/customers?create=true', module: 'Sales', type: 'Action', desc: 'Register a new customer profile with GSTIN and billing address', icon: 'Plus', rank: 3, synonyms: ['add customer', 'new customer', 'create customer', 'onboard customer'] },
    { name: 'Customer Loyalty Program Rules', path: '/sales/loyalty', module: 'Sales', type: 'Internal Feature', desc: 'Set points earn rate, claim limits & customer tier perks', icon: 'Gift', rank: 3, synonyms: ['loyalty program', 'loyalty rules', 'points setting', 'cashback policy'] },
    { name: 'Delivery Challan (Dispatch)', path: '/sales/delivery', module: 'Sales', type: 'Page', desc: 'Goods transport delivery challan, shipping dispatch & tracking', icon: 'Truck', rank: 3, synonyms: ['delivery challan', 'dispatch challan', 'dc', 'goods shipment', 'delivery'] },
    { name: 'E-Way Bill Integration', path: '/sales/invoice?tab=eway', module: 'Sales', type: 'Internal Feature', desc: 'Generate NIC E-Way bills for consignment goods transport', icon: 'Truck', rank: 3, synonyms: ['eway bill', 'e-way', 'transporter challan', 'eway generation', 'nic eway'] },
    { name: 'E-Invoicing (IRN & QR)', path: '/sales/invoice?tab=einvoice', module: 'Sales', type: 'Internal Feature', desc: 'B2B electronic invoicing with official IRN & QR verification', icon: 'CheckCircle2', rank: 3, synonyms: ['einvoice', 'e-invoicing', 'irn', 'qr code invoice', 'b2b e-invoice'] },
    { name: 'Invoice Templates & Customizer', path: '/settings?tab=invoice-template', module: 'Sales', type: 'Internal Feature', desc: 'Customize invoice layout, logos, thermal vs modern templates', icon: 'SlidersHorizontal', rank: 3, synonyms: ['invoice template', 'invoice customizer', 'invoice design', 'thermal format', 'invoice theme'] },

    // ══════════════════════════════════════════════════════════════════
    // 6. PURCHASES, ORDERS & VENDORS
    // ══════════════════════════════════════════════════════════════════
    { name: 'Purchase Invoices (Bills)', path: '/purchases/purchases', module: 'Purchases', type: 'Page', desc: 'Vendor bills, inward supplies, expenses & payment status', icon: 'ShoppingCart', rank: 3, synonyms: ['purchase invoice', 'purchase bills', 'vendor bills', 'inward bills', 'procurement'] },
    { name: 'Record Purchase Bill', path: '/purchases/purchases?create=true&type=BILL&tab=purchase-bills', module: 'Purchases', type: 'Action', desc: 'Log a new purchase bill from a vendor or supplier', icon: 'Plus', rank: 3, synonyms: ['record purchase bill', 'new purchase bill', 'add purchase bill', 'log vendor bill'] },
    { name: 'Purchase Orders (PO)', path: '/purchases/purchases?tab=purchase-orders', module: 'Purchases', type: 'Internal Feature', desc: 'Draft and issue purchase orders to suppliers for items', icon: 'ShoppingCart', rank: 3, synonyms: ['purchase orders', 'po', 'vendor orders', 'issue po', 'create po'] },
    { name: 'Purchase Returns & Debit Notes', path: '/purchases/returns', module: 'Purchases', type: 'Page', desc: 'Return defective stock to suppliers and issue debit notes', icon: 'ArrowDownRight', rank: 3, synonyms: ['purchase return', 'debit note', 'debit notes', 'return to supplier', 'dn'] },
    { name: 'Suppliers & Vendor Directory', path: '/purchases/suppliers', module: 'Purchases', type: 'Page', desc: 'Supplier database, payables, bank details & procurement history', icon: 'UsersRound', rank: 3, synonyms: ['suppliers', 'vendors', 'sellers', 'supplier directory', 'payee ledger'] },
    { name: 'Add New Supplier', path: '/purchases/suppliers?create=true', module: 'Purchases', type: 'Action', desc: 'Register a new vendor or supplier with GSTIN and address', icon: 'Plus', rank: 3, synonyms: ['add supplier', 'new vendor', 'create supplier', 'onboard supplier'] },
    { name: 'Goods Inward Transit Log (GRN)', path: '/purchases/purchases?tab=transit', module: 'Purchases', type: 'Internal Feature', desc: 'Track goods inward in-transit, gate receiving & GRN slips', icon: 'Truck', rank: 3, synonyms: ['goods inward', 'grn', 'transit log', 'gate receipt', 'receiving log'] },

    // ══════════════════════════════════════════════════════════════════
    // 7. INVENTORY, STOCK, WAREHOUSE & BARCODES
    // ══════════════════════════════════════════════════════════════════
    { name: 'Products & Services Catalog', path: '/inventory/products', module: 'Inventory', type: 'Page', desc: 'Manage product items, SKUs, sales/purchase prices & units', icon: 'Package', rank: 3, synonyms: ['products', 'items', 'catalog', 'sku', 'price list', 'services catalog'] },
    { name: 'Add New Product / Service', path: '/inventory/products?create=true', module: 'Inventory', type: 'Action', desc: 'Add a new product or service item to your master catalog', icon: 'Plus', rank: 3, synonyms: ['add product', 'new product', 'create item', 'add sku', 'register product'] },
    { name: 'Stock Levels & Inventory Valuation', path: '/inventory/stock', module: 'Inventory', type: 'Page', desc: 'Real-time stock quantities, FIFO valuation & inventory health', icon: 'Layers', rank: 3, synonyms: ['stock levels', 'inventory valuation', 'quantity', 'stock in hand', 'stock status'] },
    { name: 'Stock Adjustment (+/- Correction)', path: '/inventory/stock?action=adjust', module: 'Inventory', type: 'Action', desc: 'Increase or decrease physical stock count with adjustment reason', icon: 'SlidersHorizontal', rank: 3, synonyms: ['adjust stock', 'stock adjustment', 'stock correction', 'damage stock', 'reconcile stock'] },
    { name: 'Stock Movement History Log', path: '/inventory/stock?tab=history', module: 'Inventory', type: 'Internal Feature', desc: 'Detailed audit log of all stock increases, deductions & sales', icon: 'Clock', rank: 3, synonyms: ['stock history', 'stock movement log', 'inventory audit', 'inward outward history'] },
    { name: 'Low Stock & Reorder Alerts', path: '/inventory/stock?filter=low-stock', module: 'Inventory', type: 'Internal Feature', desc: 'Review items that have fallen below low-stock thresholds', icon: 'AlertCircle', rank: 3, synonyms: ['low stock alerts', 'reorder threshold', 'out of stock items', 'stock warning'] },
    { name: 'Warehouse & Godowns Registry', path: '/inventory/warehouse', module: 'Inventory', type: 'Page', desc: 'Multi-godown management, branch warehouses & depot tracking', icon: 'MapPin', rank: 3, synonyms: ['warehouse', 'godown', 'storage location', 'depot', 'multi godowns'] },
    { name: 'Add Warehouse / Godown', path: '/inventory/warehouse?create=true', module: 'Inventory', type: 'Action', desc: 'Register a new storage godown or branch warehouse facility', icon: 'Plus', rank: 3, synonyms: ['add warehouse', 'new godown', 'create warehouse', 'add storage'] },
    { name: 'Rack, Shelf & Bin Location Tracking', path: '/inventory/warehouse?tab=racks', module: 'Inventory', type: 'Internal Feature', desc: 'Assign products to specific aisles, racks, shelves and bins', icon: 'MapPin', rank: 3, synonyms: ['rack location', 'shelf number', 'bin number', 'godown rack', 'aisle shelf'] },
    { name: 'Batch & Expiry Date Management', path: '/inventory/products?filter=perishable', module: 'Inventory', type: 'Internal Feature', desc: 'Track manufacturing batches, perishable expiration & lot codes', icon: 'Clock', rank: 3, synonyms: ['batch tracking', 'expiry date', 'perishable products', 'lot number', 'manufacturing date'] },
    { name: 'Product Categories & Taxonomy', path: '/inventory/categories', module: 'Inventory', type: 'Page', desc: 'Group products into hierarchy categories and tax segments', icon: 'Tag', rank: 3, synonyms: ['categories', 'product categories', 'taxonomy', 'item groups'] },
    { name: 'Barcode Generator & Label Printing', path: '/barcode', module: 'Inventory', type: 'Page', desc: 'Generate EAN-13, UPC & Code-128 barcodes and print sticker sheets', icon: 'Barcode', rank: 3, synonyms: ['barcode generator', 'barcode label', 'print barcode', 'ean upc code', 'barcode stickers'] },

    // ══════════════════════════════════════════════════════════════════
    // 8. FINANCE, ACCOUNTS & EXPENSES
    // ══════════════════════════════════════════════════════════════════
    { name: 'Accounting & Day Book', path: '/finance/accounting', module: 'Finance', type: 'Page', desc: 'Financial double-entry transactions, day book & cash summary', icon: 'Calculator', rank: 3, synonyms: ['accounting', 'daybook', 'day book', 'financial ledger', 'cash book'] },
    { name: 'Profit & Loss Statement (P&L)', path: '/finance/accounting?tab=p&l', module: 'Finance', type: 'Internal Feature', desc: 'Income statement, revenue, gross profit, operating costs & net margin', icon: 'TrendingUp', rank: 3, synonyms: ['profit and loss', 'p&l', 'income statement', 'gross profit', 'net profit', 'margins'] },
    { name: 'Balance Sheet', path: '/finance/accounting?tab=balance-sheet', module: 'Finance', type: 'Internal Feature', desc: 'Statement of assets, liabilities, owner equity & financial standing', icon: 'Landmark', rank: 3, synonyms: ['balance sheet', 'assets liabilities', 'equity', 'financial position'] },
    { name: 'Trial Balance', path: '/finance/accounting?tab=trial-balance', module: 'Finance', type: 'Internal Feature', desc: 'Debit and credit balance verification for all ledger accounts', icon: 'FileCheck', rank: 3, synonyms: ['trial balance', 'debit credit check', 'ledger verification'] },
    { name: 'General Ledger & Accounts', path: '/finance/accounting?tab=ledger', module: 'Finance', type: 'Internal Feature', desc: 'Comprehensive chart of accounts, party ledgers & account statements', icon: 'BookOpen', rank: 3, synonyms: ['general ledger', 'chart of accounts', 'account heads', 'ledger statement'] },
    { name: 'Cash Flow Statement', path: '/finance/accounting?tab=cash-flow', module: 'Finance', type: 'Internal Feature', desc: 'Operating, investing and financing cash inflows and outflows', icon: 'Coins', rank: 3, synonyms: ['cash flow statement', 'inflows outflows', 'cash movement', 'liquidity'] },
    { name: 'Bank Statement Reconciliation', path: '/finance/accounting?tab=reconciliation', module: 'Finance', type: 'Internal Feature', desc: 'Upload bank statement CSV/Excel, match ledger entries & auto-reconcile', icon: 'Landmark', rank: 3, synonyms: ['bank reconciliation', 'statement upload', 'reconcile bank', 'csv statement import', 'bank statement'] },
    { name: 'Expenses Tracker & Log', path: '/finance/expenses', module: 'Finance', type: 'Page', desc: 'Business expenses log, category breakdown & receipt attachments', icon: 'TrendingUp', rank: 3, synonyms: ['expenses', 'expense tracker', 'operating expenses', 'spend log', 'costs'] },
    { name: 'Add Expense (Log Spend)', path: '/finance/expenses?create=true', module: 'Finance', type: 'Action', desc: 'Record a new business expense, vendor spend or operational cost', icon: 'Plus', rank: 3, synonyms: ['add expense', 'log expense', 'record spend', 'new expense', 'pay cost'] },
    { name: 'Add Income (Record Revenue)', path: '/finance/accounting?tab=income', module: 'Finance', type: 'Action', desc: 'Log non-invoice income, consulting revenue or interest earned', icon: 'Plus', rank: 3, synonyms: ['add income', 'record income', 'log revenue', 'new income', 'earned revenue'] },
    { name: 'Financial Plan & Budget Allocation', path: '/finance/plan', module: 'Finance', type: 'Page', desc: 'Set company budgets, track department caps & spending forecasts', icon: 'Target', rank: 3, synonyms: ['financial plan', 'budget', 'budget allocation', 'capital planning', 'spending limit'] },
    { name: 'Financial Compare (Periods)', path: '/finance/compare', module: 'Finance', type: 'Page', desc: 'Compare monthly and quarterly performance metrics across time', icon: 'BarChart3', rank: 3, synonyms: ['financial compare', 'quarterly compare', 'monthly comparison', 'period compare'] },
    { name: 'Tax Deductions (80C, 80D)', path: '/books/tax-deductions', module: 'Finance', type: 'Page', desc: 'Tax exemption deductions, investment proofs & regime comparison', icon: 'PercentCircle', rank: 3, synonyms: ['tax deductions', 'section 80c', 'section 80d', 'tax saving', 'old vs new regime'] },

    // ══════════════════════════════════════════════════════════════════
    // 9. GST & COMPLIANCE PORTAL
    // ══════════════════════════════════════════════════════════════════
    { name: 'GST Summary & Computation', path: '/finance/gst', module: 'Compliance', type: 'Page', desc: 'Consolidated GST output tax liability, ITC balance & net payable', icon: 'PercentCircle', rank: 3, synonyms: ['gst summary', 'gst computation', 'gst liability', 'tax payable', 'goods and services tax'] },
    { name: 'GSTR-1 Outward Supplies Filing', path: '/finance/gst?tab=gstr1', module: 'Compliance', type: 'Internal Feature', desc: 'GSTR-1 B2B invoices, B2C sales summary & HSN-wise report', icon: 'PercentCircle', rank: 3, synonyms: ['gstr1', 'gstr-1', 'sales gst return', 'b2b sales return', 'outward supplies'] },
    { name: 'GSTR-3B Summary & Tax Offset', path: '/finance/gst?tab=gstr3b', module: 'Compliance', type: 'Internal Feature', desc: 'Monthly GSTR-3B return summary, input credit offset & challan info', icon: 'PercentCircle', rank: 3, synonyms: ['gstr3b', 'gstr-3b', 'monthly gst return', 'tax offset', 'gstr 3b'] },
    { name: 'Input Tax Credit (ITC / GSTR-2A/2B)', path: '/finance/gst?tab=gstr2', module: 'Compliance', type: 'Internal Feature', desc: 'Reconcile purchase invoice ITC against auto-drafted GSTR-2B data', icon: 'CheckCircle2', rank: 3, synonyms: ['itc summary', 'input tax credit', 'gstr-2b', 'gstr-2a', 'itc claim', 'itc reconciliation'] },
    { name: 'HSN / SAC Code Master Search', path: '/inventory/products?tab=hsn', module: 'Compliance', type: 'Internal Feature', desc: 'Search Indian GST HSN and SAC codes with applicable GST tax slabs', icon: 'Search', rank: 3, synonyms: ['hsn search', 'sac search', 'hsn code', 'sac code', 'gst tax slab', 'hsn master'] },

    // ══════════════════════════════════════════════════════════════════
    // 10. CA AUDIT & FIN-PRO HUB
    // ══════════════════════════════════════════════════════════════════
    { name: 'FIN-PRO Chartered Accountant Hub', path: '/ca', module: 'Audit', type: 'Page', desc: 'Secure portal for external CA auditors to review books & compliance', icon: 'ShieldCheck', rank: 3, synonyms: ['ca hub', 'finpro hub', 'chartered accountant portal', 'auditor access', 'ca practice suite'] },
    { name: 'Section 43B(h) MSME 45-Day Audit Suite', path: '/ca?tab=sec43bh', module: 'Audit', type: 'Internal Feature', desc: 'Critical MSME 45-day vendor payment deadline alerts & overdue penalties', icon: 'AlertTriangle', rank: 3, synonyms: ['section 43b(h)', 'sec 43bh', 'msme audit', '45 day rule', 'msme overdue alerts', 'msme compliance', 'disallowance under 43bh'] },
    { name: 'Tax Audit Form 3CD Compliance Suite', path: '/ca?tab=tax-audit', module: 'Audit', type: 'Internal Feature', desc: 'ICAI compliant Tax Audit verification, clause checklist & reporting', icon: 'FileCheck', rank: 3, synonyms: ['tax audit suite', 'form 3cd', 'icai tax audit', 'audit clauses', 'tax auditor report'] },
    { name: 'Bank Statement Auditor Verification', path: '/ca?tab=bank-audit', module: 'Audit', type: 'Internal Feature', desc: 'Auditor review and verification stamp for reconciled bank accounts', icon: 'Landmark', rank: 3, synonyms: ['bank audit', 'auditor bank review', 'statement verification'] },

    // ══════════════════════════════════════════════════════════════════
    // 11. HR, STAFF & PAYROLL
    // ══════════════════════════════════════════════════════════════════
    { name: 'Staff & Employee Directory', path: '/hr/staff', module: 'HR', type: 'Page', desc: 'Staff members, designations, department allocation & contact info', icon: 'UsersRound', rank: 3, synonyms: ['staff directory', 'employees', 'worker list', 'team list', 'human resources'] },
    { name: 'Add New Staff / Employee', path: '/hr/staff?create=true', module: 'HR', type: 'Action', desc: 'Onboard a new employee with salary structure and shift details', icon: 'Plus', rank: 3, synonyms: ['add staff', 'new employee', 'onboard staff', 'add worker', 'create employee'] },
    { name: 'Attendance Tracker & Shifts', path: '/hr/attendance', module: 'HR', type: 'Page', desc: 'Track employee daily attendance, shift logs, present/absent & overtime', icon: 'Calendar', rank: 3, synonyms: ['attendance', 'shift tracker', 'check in check out', 'present absent', 'biometric attendance'] },
    { name: 'Payroll & Salary Processing', path: '/hr/payroll', module: 'HR', type: 'Page', desc: 'Calculate monthly wages, statutory deductions (PF/ESI) & net payout', icon: 'FileText', rank: 3, synonyms: ['payroll', 'salary calculation', 'wages', 'net pay', 'monthly payroll'] },
    { name: 'Employee Payslip Generation', path: '/hr/payroll?tab=payslips', module: 'HR', type: 'Internal Feature', desc: 'Generate and download official PDF salary payslips for staff', icon: 'Receipt', rank: 3, synonyms: ['payslip', 'salary slip', 'payslip download', 'staff payslips'] },
    { name: 'Permission Manager (Sub-IDs & RBAC)', path: '/manage-subids', module: 'HR', type: 'Page', desc: 'Configure role-based permissions, sub-user logins & access rules', icon: 'Lock', rank: 3, synonyms: ['permissions', 'sub-ids', 'subids', 'manage subids', 'role access', 'rbac', 'access control', 'staff permissions'] },

    // ══════════════════════════════════════════════════════════════════
    // 12. PAYMENTS & CASH FLOW ENGINE
    // ══════════════════════════════════════════════════════════════════
    { name: 'People Network & Escrow', path: '/payments/people', module: 'Payments', type: 'Page', desc: 'P2P relationships, friendly loans, advances & payment escrow', icon: 'Users', rank: 3, synonyms: ['people network', 'escrow', 'p2p ledger', 'parties', 'advances', 'friendly loans'] },
    { name: 'Add People Contact', path: '/payments/people?action=add-contact', module: 'Payments', type: 'Action', desc: 'Add customer, vendor or personal peer contact to your People network', icon: 'Plus', rank: 3, synonyms: ['add people contact', 'new contact', 'add party', 'new person', 'add peer'] },
    { name: 'Add Transaction (Log Money Entry)', path: '/payments/people?action=log-transaction', module: 'Payments', type: 'Action', desc: 'Record a money entry, transfer, payment, expense or income note', icon: 'Plus', rank: 3, synonyms: ['add transaction', 'log transaction', 'money entry', 'record transfer', 'note payment', 'income or expense note'] },
    { name: 'Outstanding Receivables & Payables', path: '/payments/people?tab=ledger', module: 'Payments', type: 'Internal Feature', desc: 'Consolidated tracking of money owed to you and money you owe others', icon: 'CreditCard', rank: 3, synonyms: ['outstanding receivables', 'outstanding payables', 'due money', 'pending settlements', 'debt ledger'] },
    { name: 'P2P Advances & Friendly Loans', path: '/payments/people?tab=advances', module: 'Payments', type: 'Internal Feature', desc: 'Record peer advances, friendly zero-interest loans and payment dues', icon: 'Users', rank: 3, synonyms: ['advances', 'friendly loans', 'personal loan note', 'peer advance'] },
    { name: 'Repayment Alerts & Ledger Notes', path: '/payments/people?tab=alerts', module: 'Payments', type: 'Internal Feature', desc: 'Automated repayment reminder alerts and ledger settlement notes', icon: 'Bell', rank: 3, synonyms: ['repayment alerts', 'due reminders', 'collection alerts', 'payment reminders'] },
    { name: 'Purpose Wallets & Segregation', path: '/payments/segregation', module: 'Payments', type: 'Page', desc: 'Segregate funds into designated target wallets and goal reserves', icon: 'Target', rank: 3, synonyms: ['segregation', 'purpose wallets', 'target savings', 'fund allocation', 'envelopes', 'goal wallets'] },
    { name: 'Split & Collect (Group Expense Sharing)', path: '/payments/split-collect', module: 'Payments', type: 'Page', desc: 'Split bills, dining, travel or office expenses across multiple members', icon: 'Split', rank: 3, synonyms: ['split and collect', 'split expense', 'group bill', 'share bill', 'split payment', 'settle expense'] },
    { name: 'Financial Planner & Scheduled Reminders', path: '/payments/plan', module: 'Payments', type: 'Page', desc: 'Schedule future recurring payments, subscriptions & EMI reminders', icon: 'Calendar', rank: 3, synonyms: ['planner', 'scheduled payments', 'recurring reminders', 'emi planner', 'calendar plan'] },
    { name: 'Rewards & Offers', path: '/payments/rewards-offers', module: 'Payments', type: 'Page', desc: 'Available cashback offers, reward points balances and partner perks', icon: 'Gift', rank: 3, synonyms: ['rewards', 'offers', 'cashback', 'reward points', 'perks'] },

    // ══════════════════════════════════════════════════════════════════
    // 13. SOCIAL & FOUNDER COMMUNITY
    // ══════════════════════════════════════════════════════════════════
    { name: 'BETA Club Social Feed & Pitches', path: '/social/betaclub', module: 'Social', type: 'Page', desc: 'Founder community feed, venture pitches, updates & networking', icon: 'UsersRound', rank: 3, synonyms: ['beta club', 'social feed', 'pitches', 'startups', 'founders', 'venture pitch'] },
    { name: 'Trading Docs & Share Agreements', path: '/social/trading', module: 'Social', type: 'Page', desc: 'Company shares, legal contracts & trading documentation repository', icon: 'LineChart', rank: 3, synonyms: ['trading docs', 'contracts', 'shares', 'trading agreement', 'legal docs'] },

    // ══════════════════════════════════════════════════════════════════
    // 14. ACCESS KIT & PRODUCTIVITY UTILITIES
    // ══════════════════════════════════════════════════════════════════
    { name: 'Access Kit Products Launcher', path: '/beta-launcher', module: 'Access Kit', type: 'Tool', desc: 'All floating sidebar tools, calculators and productivity widgets', icon: 'Sliders', rank: 3, synonyms: ['access kit', 'beta products', 'launcher', 'utilities', 'sidebar tools'] },
    { name: 'Calculator Utility (GST & Math)', path: '/calculator', module: 'Access Kit', type: 'Tool', desc: 'Financial calculation tool for GST add/deduct, margins and percentages', icon: 'Calculator', rank: 3, synonyms: ['calculator', 'calc', 'gst calculator', 'margin calculator', 'math'] },
    { name: 'Business Calendar', path: '/calendar', module: 'Access Kit', type: 'Tool', desc: 'Interactive calendar for business appointments, filing due dates & events', icon: 'Calendar', rank: 3, synonyms: ['calendar', 'events', 'schedules', 'tax deadlines', 'appointments'] },
    { name: 'Contact Card (Digital vCard / QR)', path: '/contact', module: 'Access Kit', type: 'Tool', desc: 'Create and share digital business cards with QR code & vCard export', icon: 'Contact', rank: 3, synonyms: ['contact card', 'vcard', 'digital business card', 'visiting card', 'qr contact'] },
    { name: 'Beta Trust Credential Vault', path: '/beta-trust', module: 'Access Kit', type: 'Tool', desc: 'Encrypted personal vault for passwords, portal PINs and confidential keys', icon: 'ShieldCheck', rank: 3, synonyms: ['beta trust', 'vault', 'passwords', 'secrets', 'credentials', 'password manager'] },
    { name: 'Weather Forecast', path: '/weather', module: 'Access Kit', type: 'Tool', desc: 'Real-time local climate weather reports and multi-day forecasts', icon: 'CloudSun', rank: 3, synonyms: ['weather', 'climate', 'temperature', 'forecast'] },
    { name: 'Business News & Market Feed', path: '/news', module: 'Access Kit', type: 'Tool', desc: 'Curated financial headlines, market updates and commercial news', icon: 'Newspaper', rank: 3, synonyms: ['news', 'feed', 'headlines', 'market news', 'business updates'] },
    { name: 'Language Translator', path: '/translator', module: 'Access Kit', type: 'Tool', desc: 'Translate business communication into regional Indian and global languages', icon: 'Languages', rank: 3, synonyms: ['translator', 'translation', 'multilingual', 'languages', 'hindi english translation'] },
    { name: 'Camera Lens & OCR Reader', path: '/lens', module: 'Access Kit', type: 'Tool', desc: 'Scan receipts, extract text and digits from images using computer vision', icon: 'Scan', rank: 3, synonyms: ['lens', 'ocr', 'camera scanner', 'extract text', 'scan receipt'] },
    { name: 'Onscreen Virtual Keyboard', path: '/keyboard', module: 'Access Kit', type: 'Tool', desc: 'Safe onscreen keyboard for entering sensitive credentials securely', icon: 'Keyboard', rank: 3, synonyms: ['keyboard', 'virtual keyboard', 'onscreen keyboard', 'typing'] },
    { name: 'Refer & Earn Program', path: '/referral', module: 'Access Kit', type: 'Tool', desc: 'Share your referral code, invite businesses and earn reward points', icon: 'Gift', rank: 3, synonyms: ['refer and earn', 'referral', 'invite friends', 'earn points', 'referral code'] },

    // ══════════════════════════════════════════════════════════════════
    // 15. SYSTEM, PROFILE & SETTINGS
    // ══════════════════════════════════════════════════════════════════
    { name: 'Company Profile & Business Info', path: '/profile', module: 'Settings', type: 'Page', desc: 'Business legal name, GSTIN, registered address, logo & contact info', icon: 'User', rank: 3, synonyms: ['profile', 'company profile', 'business details', 'gstin update', 'company info'] },
    { name: 'Application Settings', path: '/settings', module: 'Settings', type: 'Page', desc: 'General preferences, invoice numbers, tax defaults & system configurations', icon: 'Sliders', rank: 3, synonyms: ['settings', 'preferences', 'configuration', 'system setup'] },
    { name: 'Subscription Plans & Tiers', path: '/subscription', module: 'Settings', type: 'Page', desc: 'Manage your active plan (Free, Starter, Growth, Elite, Solo) & renewal', icon: 'CreditCard', rank: 3, synonyms: ['subscription', 'plans', 'upgrade plan', 'license tier', 'pricing', 'renew plan'] },
    { name: 'Branch Selector', path: '/settings?tab=branches', module: 'Settings', type: 'Internal Feature', desc: 'Switch between registered business branches and sub-locations', icon: 'MapPin', rank: 3, synonyms: ['branch selector', 'switch branch', 'multi branch', 'locations'] },
    { name: 'Appearance & Theme (Dark Mode)', path: '/settings?tab=appearance', module: 'Settings', type: 'Internal Feature', desc: 'Switch between light and dark modes, customize accent colors', icon: 'Palette', rank: 3, synonyms: ['dark mode', 'theme', 'appearance', 'light mode', 'colors'] },
    { name: 'Help Center & FAQs', path: '/faq', module: 'Support', type: 'Page', desc: 'Frequently asked questions, user manuals, video guides & support desk', icon: 'HelpCircle', rank: 3, synonyms: ['help', 'faq', 'support', 'documentation', 'guide', 'ticket'] }
];

const iconMap = {
    LayoutDashboard,
    BookOpen,
    CreditCard,
    Users,
    Calculator,
    PercentCircle,
    Receipt,
    User,
    Package,
    Layers,
    TrendingUp,
    BarChart3,
    UsersRound,
    LineChart,
    Sliders,
    FileText,
    ShoppingCart,
    MapPin,
    Truck,
    Monitor,
    Barcode,
    HelpCircle,
    Gift,
    Target,
    Split,
    Wallet,
    Tag,
    Clock,
    ShieldCheck,
    CloudSun,
    Newspaper,
    Languages,
    Scan,
    Keyboard,
    Contact,
    Calendar,
    Plus,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    SlidersHorizontal,
    Palette,
    Bell,
    Lock,
    Info,
    Landmark,
    Coins,
    Briefcase,
    StickyNote
};

const Topbar = ({ onToggleSidebar, isSidebarOpen, activePanel, setActivePanel }) => {
    const { logout, user, selectedPlan } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Reward points state synced with localStorage
    const [rewardPoints, setRewardPoints] = React.useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1000; // default 1000 Pts
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('cliks_reward_points');
            setRewardPoints(saved ? parseInt(saved, 10) : 1000);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // ICAI Verification / FIN-PRO Status Query
    const token = typeof window !== 'undefined' ? (localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token')) : null;
    const { data: icaiVerification } = useQuery({
        queryKey: ['icaiVerification'],
        queryFn: async () => {
            try {
                return await caService.getIcaiVerification();
            } catch (e) {
                return null;
            }
        },
        enabled: Boolean(token),
        staleTime: 30000,
        refetchInterval: (query) => {
            // Once verified, avoid polling; otherwise poll every 15s to detect admin approval in real-time
            const status = query.state.data?.status;
            return status === 'VERIFIED' ? false : 15000;
        },
        refetchOnWindowFocus: true
    });

    const isFinProVerified = React.useMemo(() => {
        const vStatus = icaiVerification?.status || user?.ca_verification_status;
        const isVer = icaiVerification?.isVerified === true || user?.is_finpro_verified === true || user?.is_ca === 1 || user?.role === 'ca';
        const isLocalVerified = typeof window !== 'undefined' && localStorage.getItem('cliks_finpro_verified') === 'true';
        return vStatus === 'VERIFIED' || isVer || (isLocalVerified && vStatus !== 'REJECTED');
    }, [icaiVerification, user]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        if (icaiVerification?.status === 'VERIFIED' || icaiVerification?.isVerified) {
            localStorage.setItem('cliks_finpro_verified', 'true');
        } else if (icaiVerification?.status === 'REJECTED') {
            localStorage.removeItem('cliks_finpro_verified');
        }
    }, [icaiVerification]);

    const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [activeResultIdx, setActiveResultIdx] = React.useState(0);
    const searchContainerRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchExpanded(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setActiveResultIdx(0);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            setActiveResultIdx(0);
            try {
                const queryRaw = searchQuery.toLowerCase().trim();
                const queryWords = queryRaw.split(/\s+/).filter(Boolean);

                const matchedPages = staticPages.map(p => {
                    let score = 0;
                    const nameLower = p.name.toLowerCase();
                    const moduleLower = p.module.toLowerCase();
                    const descLower = (p.desc || '').toLowerCase();
                    const typeLower = (p.type || '').toLowerCase();
                    const synonyms = (p.synonyms || []).map(s => s.toLowerCase());

                    // Exact match
                    if (nameLower === queryRaw) score += 120;
                    else if (nameLower.startsWith(queryRaw)) score += 90;
                    else if (nameLower.includes(queryRaw)) score += 70;

                    // Module / Type match
                    if (moduleLower === queryRaw) score += 80;
                    else if (moduleLower.includes(queryRaw)) score += 50;
                    if (typeLower.includes(queryRaw)) score += 40;

                    // Synonym matches
                    for (const syn of synonyms) {
                        if (syn === queryRaw) { score += 100; break; }
                        if (syn.startsWith(queryRaw)) { score += 75; break; }
                        if (syn.includes(queryRaw)) { score += 55; break; }
                    }

                    // Description match
                    if (descLower.includes(queryRaw)) score += 35;

                    // Multi-word partial matching
                    if (queryWords.length > 1) {
                        const allWordsFound = queryWords.every(word => 
                            nameLower.includes(word) ||
                            moduleLower.includes(word) ||
                            descLower.includes(word) ||
                            synonyms.some(s => s.includes(word))
                        );
                        if (allWordsFound) score += 60;
                    }

                    return {
                        ...p,
                        score,
                        isStatic: true
                    };
                }).filter(p => p.score > 0);

                let dbResults = [];
                try {
                    const response = await apiClient.get(`/search/global?q=${encodeURIComponent(searchQuery)}`);
                    dbResults = response.data?.data || response.data || [];
                } catch (apiErr) {
                    console.warn('Backend search API failed, using static pages only:', apiErr.message);
                }

                const formattedDbResults = dbResults.map(item => ({
                    ...item,
                    score: 45
                }));

                const combined = [...matchedPages, ...formattedDbResults];
                combined.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    const rankA = a.rank !== undefined ? a.rank : 99;
                    const rankB = b.rank !== undefined ? b.rank : 99;
                    return rankA - rankB;
                });

                setSearchResults(combined);
            } catch (err) {
                console.error('Global search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const {
        notifications,
        unreadCount,
        markAllRead: handleMarkAllNotificationsRead,
        setNotifications
    } = useNotifications(30000);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false);
    const [isEditingAccess, setIsEditingAccess] = React.useState(false);
    const [isAccessPopoverOpen, setIsAccessPopoverOpen] = React.useState(false);
    
    const isLauncherActive = activePanel === 'Beta Products';
    const isCalcActive = activePanel === 'Calculator';
    const [pinnedTools, setPinnedTools] = React.useState(() => {
        const saved = localStorage.getItem('cliks_pinned_tools');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const filtered = parsed.filter(t => t !== 'Beta Trust' && t !== 'Weather');
                    if (filtered.length > 0) return filtered;
                }
            } catch (e) {
                console.error(e);
            }
        }
        return ['Calendar', 'Calculator', 'Contact', 'Notes'];
    });

    React.useEffect(() => {
        localStorage.setItem('cliks_pinned_tools', JSON.stringify(pinnedTools));
    }, [pinnedTools]);

    const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Push main content aside when right toolbar or drawer panels are opened
    React.useEffect(() => {
        const appBody = document.querySelector('.app-body');
        if (!appBody) return;

        const updatePadding = () => {
            appBody.style.transition = 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            let paddingRight = 0;
            const isDesktop = window.innerWidth > 768;

            if (isDesktop) {
                if (isRightSidebarOpen) {
                    paddingRight = 64; // Toolbar always takes 64px
                } else {
                    paddingRight = 0; // Toolbar hidden by default
                }
            } else {
                paddingRight = 0; // Overlays on mobile
            }
            appBody.style.paddingRight = `${paddingRight}px`;
        };

        updatePadding();
        window.addEventListener('resize', updatePadding);
        return () => window.removeEventListener('resize', updatePadding);
    }, [isRightSidebarOpen]);

    // Rigid Mode Derivation for Admin & Sales desks to omit redundant consumer modules
    const isAdminOrSales = 
        ['admin', 'sales'].includes(user?.role) || 
        location.pathname.includes('/admin/') || 
        location.pathname.includes('/sales-portal/');

    const handleNavigation = (path) => {
        if (selectedPlan === 'Free Plan' && path !== '/dashboard' && path !== '/ca') {
            alert('You are on the Free Plan! Please subscribe to unlock full access to this feature.');
            navigate('/subscription');
        } else {
            navigate(path);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Synchronous Persistent Module Derivation
    let activeModule = sessionStorage.getItem('active_cliks_module') || 'books';
    if (location.pathname.startsWith('/social/')) {
        activeModule = 'social';
        sessionStorage.setItem('active_cliks_module', 'social');
    } else if (location.pathname.startsWith('/payments/')) {
        activeModule = 'payments';
        sessionStorage.setItem('active_cliks_module', 'payments');
    } else if (
        !location.pathname.includes('/admin/') &&
        !['/settings', '/faq', '/subscription', '/profile', '/referral'].some(p => location.pathname.startsWith(p)) &&
        location.pathname !== '/'
    ) {
        activeModule = 'books';
        sessionStorage.setItem('active_cliks_module', 'books');
    }

    const isSocialActive = activeModule === 'social';
    const isFinanceActive = activeModule === 'payments';

    const navItems = [
        { name: t('books', 'Books'), url: '/books', icon: BookOpen },
        { name: t('payments', 'Payments'), url: '/payments/people', icon: Calculator },
        { name: t('social', 'Social'), url: '/social', icon: Users },
    ];

    return (
        <header className="topbar" style={{ paddingLeft: '1.5rem', paddingRight: '64px' }}>
            {/* Left: Branding / App Switcher & Showroom Selector */}
            <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                    className="logo-area"
                    onClick={onToggleSidebar}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle Sidebar"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onToggleSidebar();
                        }
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    title="Toggle Sidebar"
                >
                    <div className="brand-logo-small" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Cliks<span className="logo-business-text"> Business</span>
                    </span>
                </div>

                {/* Showroom / Multi-Branch Switcher */}
                <BranchSelector />
            </div>

            {/* Hamburger Button (Mobile) - Now toggles Sidebar! */}
            <button
                className={`hamburger ${isSidebarOpen ? 'active' : ''}`}
                onClick={onToggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Center: Navigation (New Lamp Style) - Hidden for Platform Control / Sales Representative desks */}
            {!isAdminOrSales && (
                <div className="top-nav-links">
                <div className="top-nav-lamp-container">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = 
                            (item.url === '/books' && (location.pathname === '/books' || location.pathname === '/dashboard' || location.pathname.startsWith('/finance') || location.pathname.startsWith('/sales') || location.pathname.startsWith('/inventory') || location.pathname.startsWith('/purchases') || location.pathname.startsWith('/hr') || location.pathname.startsWith('/billing') || location.pathname === '/pos' || location.pathname === '/reports' || location.pathname === '/barcode' || location.pathname === '/customization' || location.pathname === '/subscription')) ||
                            (item.url === '/payments/people' && (location.pathname === '/payments' || location.pathname.startsWith('/payments'))) ||
                            (item.url === '/social' && (location.pathname === '/social' || location.pathname.startsWith('/social')));

                        return (
                            <NavLink
                                key={item.name}
                                to={item.url}
                                aria-label={item.name}
                                className={({ isActive }) => `top-nav-link ${isActive || isItemActive ? 'active' : ''}`}
                                style={({ isActive }) => {
                                    const active = isActive || isItemActive;
                                    return {
                                        background: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                                    };
                                }}
                                onMouseEnter={(e) => {
                                    if (!isItemActive) e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isItemActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} />
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
            )}

            {/* Right Group (Audit + Profile) */}
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '0' }}>
                {/* Search circular button */}
                {(() => {
                    const searchInputRef = React.useRef(null);
                    React.useEffect(() => {
                        if (isSearchExpanded) {
                            searchInputRef.current?.focus();
                        }
                    }, [isSearchExpanded]);

                    const handleSelectResult = (item) => {
                        if (!item) return;
                        let pathWithQuery = item.path;
                        if (item.state?.invoiceNumber) {
                            pathWithQuery += `?q=${encodeURIComponent(item.state.invoiceNumber)}`;
                        } else if (item.state?.customerName) {
                            pathWithQuery += `?q=${encodeURIComponent(item.state.customerName)}`;
                        } else if (item.state?.productName) {
                            pathWithQuery += `?q=${encodeURIComponent(item.state.productName)}`;
                        } else if (item.state?.warehouseName) {
                            pathWithQuery += `?q=${encodeURIComponent(item.state.warehouseName)}`;
                        }
                        
                        if (item.path.startsWith('/social/')) {
                            sessionStorage.setItem('active_cliks_module', 'social');
                        } else if (item.path.startsWith('/payments/')) {
                            sessionStorage.setItem('active_cliks_module', 'payments');
                        } else {
                            sessionStorage.setItem('active_cliks_module', 'books');
                        }
                        navigate(pathWithQuery);
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                    };

                    const getCategoryTheme = (mod, type) => {
                        const m = (mod || '').toLowerCase();
                        const t = (type || '').toLowerCase();
                        if (m === 'pos' || t.includes('pos')) return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', pillBg: '#EDE9FE', pillText: '#6D28D9' };
                        if (m === 'sales' || t.includes('invoice') || t.includes('challan')) return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', pillBg: '#DBEAFE', pillText: '#1D4ED8' };
                        if (m === 'purchases' || t.includes('supplier')) return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', pillBg: '#FEF3C7', pillText: '#B45309' };
                        if (m === 'inventory' || t.includes('product') || t.includes('warehouse') || t.includes('stock')) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', pillBg: '#D1FAE5', pillText: '#047857' };
                        if (m === 'finance' || t.includes('accounting') || t.includes('expenses')) return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', pillBg: '#DCFCE7', pillText: '#15803D' };
                        if (m === 'hr' || t.includes('staff')) return { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4', pillBg: '#CCFBF1', pillText: '#0F766E' };
                        if (m === 'compliance' || m === 'audit' || t.includes('tax') || t.includes('gst')) return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', pillBg: '#FFE4E6', pillText: '#BE123C' };
                        if (m === 'payments' || t.includes('people')) return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0', pillBg: '#D1FAE5', pillText: '#047857' };
                        if (m === 'access kit') return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', pillBg: '#F1F5F9', pillText: '#334155' };
                        return { bg: '#F8FAFC', text: '#3B82F6', border: '#E2E8F0', pillBg: '#F1F5F9', pillText: '#1D4ED8' };
                    };

                    return (
                        <div ref={searchContainerRef} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            {isSearchExpanded ? (
                                <div className="topbar-search-input-box" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                                    borderRadius: '999px',
                                    padding: '6px 14px',
                                    width: 'clamp(220px, 22vw, 320px)',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <Search size={15} color="#FFFFFF" style={{ opacity: 0.9, flexShrink: 0 }} />
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        placeholder="Search all features, tools, records..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setIsSearchExpanded(false);
                                                setSearchQuery('');
                                            } else if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                setActiveResultIdx(prev => Math.min(prev + 1, searchResults.length - 1));
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                setActiveResultIdx(prev => Math.max(prev - 1, 0));
                                            } else if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (searchResults[activeResultIdx]) {
                                                    handleSelectResult(searchResults[activeResultIdx]);
                                                }
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '12.5px',
                                            width: '100%',
                                            fontWeight: '600',
                                            padding: 0
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <X size={13} color="rgba(255,255,255,0.7)" />
                                        </button>
                                    )}

                                    {searchQuery.trim() && (
                                        <div 
                                            onMouseDown={(e) => e.preventDefault()}
                                            style={{
                                                position: 'absolute',
                                                top: '42px',
                                                right: '0',
                                                width: 'clamp(340px, 35vw, 450px)',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '16px',
                                                boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.06)',
                                                zIndex: 9999,
                                                maxHeight: '460px',
                                                overflowY: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {/* Results count header bar */}
                                            <div style={{
                                                padding: '9px 14px',
                                                background: '#F8FAFC',
                                                borderBottom: '1px solid #F1F5F9',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 2,
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155' }}>
                                                    {isSearching ? 'Searching across all features...' : `${searchResults.length} ${searchResults.length === 1 ? 'Feature & Result' : 'Features & Results'} found`}
                                                </span>
                                                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>
                                                    ↑↓ to navigate • ↵ open • ESC close
                                                </span>
                                            </div>

                                            <div style={{ padding: '4px 0', flex: 1, overflowY: 'auto' }}>
                                                {isSearching ? (
                                                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                                                        <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 8px auto' }}></div>
                                                        Searching all features & records...
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map((item, index) => {
                                                        const IconComponent = iconMap[item.icon] || Info;
                                                        const theme = getCategoryTheme(item.module, item.type);
                                                        const isSelected = index === activeResultIdx;

                                                        return (
                                                            <div 
                                                                key={index}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onMouseEnter={() => setActiveResultIdx(index)}
                                                                onClick={() => handleSelectResult(item)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '11px',
                                                                    padding: '9px 14px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: index < searchResults.length - 1 ? '1px solid #F8FAFC' : 'none',
                                                                    backgroundColor: isSelected ? '#F0F9FF' : 'transparent',
                                                                    borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                                                                    transition: 'all 0.12s ease'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '8px',
                                                                    backgroundColor: theme.bg,
                                                                    color: theme.text,
                                                                    border: `1px solid ${theme.border}`,
                                                                    flexShrink: 0
                                                                }}>
                                                                    <IconComponent size={15} />
                                                                </div>
                                                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                                                        <span style={{ fontSize: '9.5px', fontWeight: '850', color: theme.pillText, background: theme.pillBg, padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                                            {item.module || item.type || 'FEATURE'}
                                                                        </span>
                                                                        {item.type && item.type !== item.module && (
                                                                            <span style={{ fontSize: '9px', fontWeight: '750', color: '#64748B', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                                                                                {item.type}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: '12.5px', fontWeight: '750', color: isSelected ? '#1D4ED8' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {item.name}
                                                                    </div>
                                                                    {item.desc && (
                                                                        <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px', fontWeight: '500' }}>
                                                                            {item.desc}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <ChevronRight size={14} color="#2563EB" style={{ flexShrink: 0, opacity: 0.8 }} />
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                            No matching features found
                                                        </div>
                                                        <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                                                            Try searching for billing, pos, stock, gst, expenses, payroll, or customers
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchExpanded(true)}
                                    title="Search all features & records"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        cursor: 'pointer',
                                        color: '#FFFFFF',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                >
                                    <Search size={18} />
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Notification Bell Button */}
                <div style={{ position: 'relative' }}>
                    <NotificationBell
                        unreadCount={unreadCount}
                        isOpen={isNotificationOpen}
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '11px',
                            backgroundColor: isNotificationOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    />
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                        notifications={notifications}
                        unreadCount={unreadCount}
                        onMarkAllRead={handleMarkAllNotificationsRead}
                    />
                </div>

                {/* FIN-PRO Header Button (Displayed after Admin verifies requested user's ICAI details) */}
                {isFinProVerified && (
                    <button
                        onClick={() => handleNavigation('/ca')}
                        title="FIN-PRO Audit & Practice Hub"
                        className="topbar-finpro-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            height: '36px',
                            borderRadius: '999px',
                            backgroundColor: location.pathname.startsWith('/ca') ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)',
                            border: location.pathname.startsWith('/ca') ? '1.5px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: '750',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            whiteSpace: 'nowrap',
                            boxShadow: location.pathname.startsWith('/ca') ? '0 0 14px rgba(96, 165, 250, 0.45)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = location.pathname.startsWith('/ca') ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <Briefcase size={16} color={location.pathname.startsWith('/ca') ? '#93C5FD' : '#FFFFFF'} style={{ flexShrink: 0 }} />
                        <span className="topbar-finpro-text">FIN-PRO</span>
                        <span className="topbar-finpro-badge" style={{
                            fontSize: '9.5px',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            letterSpacing: '0.4px',
                            marginLeft: '2px'
                        }}>
                            VERIFIED
                        </span>
                    </button>
                )}

                <ProfileDropdown
                    onAccount={() => navigate('/profile')}
                    onSettings={() => navigate('/settings')}
                    onFAQ={() => navigate('/faq')}
                    onLogout={handleLogout}
                />

                {/* Vertical Divider */}
                <div style={{ 
                    width: '1px', 
                    height: '28px', 
                    minHeight: '28px',
                    maxHeight: '28px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)', 
                    marginLeft: '-6px',
                    marginRight: '0px',
                    alignSelf: 'center',
                    flexShrink: 0
                }} />
            </div>

            {/* Sliding Drawer Panels */}
            <AnimatePresence>

                {/* Fixed Right Toolbar */}
                {isRightSidebarOpen && (
                    <motion.div
                        key="right-toolbar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        style={{
                            position: 'fixed',
                            top: '64px',
                            right: 0,
                            height: 'calc(100vh - 64px)',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2005,
                            width: '64px',
                            fontFamily: "'Inter', sans-serif",
                            borderLeft: '1px solid #99DBC3'
                        }}
                    >
                        {/* Toolbar Body Container */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '20px',
                            paddingTop: '8px'
                        }}>
                            {/* Scrollable Tool List */}
                            <div className="access-tools-scroll" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1,
                                overflowY: 'auto',
                                width: '100%',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none'
                            }}>
                                <style>{`
                                    .access-tools-scroll::-webkit-scrollbar { display: none; }
                                `}</style>

                                {/* Blue B Logo Button */}
                                <button
                                    onClick={() => {
                                        setActivePanel(activePanel === 'Beta Products' ? null : 'Beta Products');
                                    }}
                                    title="Beta Products Launcher"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '12px',
                                        backgroundColor: isLauncherActive ? '#DCF2E4' : '#FFFFFF',
                                        border: isLauncherActive ? '1.5px solid #1B6B3A' : '1.5px solid #CBD5E1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = isLauncherActive ? '#1B6B3A' : '#94A3B8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = isLauncherActive ? '#1B6B3A' : '#CBD5E1';
                                    }}
                                >
                                    <img src="/beta_logo.png" alt="Beta Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                </button>

                                {/* Horizontal Separator */}
                                <div style={{ width: '38px', height: '1px', backgroundColor: '#E2E8F0', margin: '-4px 0', opacity: 0.8, flexShrink: 0 }} />

                                {/* Dynamic tools mapping */}
                                {(() => {
                                    const getToolPath = (name) => '/' + name.toLowerCase().replace('contact', 'contact').replace('beta trust', 'beta-trust');

                                    const allAvailableTools = [
                                        { name: 'Calendar', icon: Calendar, color: '#F59E0B', bg: '#FEF3C7', action: () => setActivePanel(activePanel === 'Calendar' ? null : 'Calendar') },
                                        { name: 'Calculator', icon: Calculator, color: '#10B981', bg: '#ECFDF5', action: () => setActivePanel(activePanel === 'Calculator' ? null : 'Calculator') },
                                        { name: 'Contact', icon: Contact, color: '#3B82F6', bg: '#EFF6FF', action: () => setActivePanel(activePanel === 'Contact' ? null : 'Contact') },
                                        { name: 'Keyboard', icon: Keyboard, color: '#8B5CF6', bg: '#F5F3FF', action: () => setActivePanel(activePanel === 'Keyboard' ? null : 'Keyboard') },
                                        { name: 'Notes', icon: StickyNote, color: '#EC4899', bg: '#FDF2F8', action: () => setActivePanel(activePanel === 'Notes' ? null : 'Notes') }
                                    ];

                                    const toggleToolPin = (toolName) => {
                                        setPinnedTools(prev => {
                                            if (prev.includes(toolName)) {
                                                if (prev.length === 1) return prev; // Keep at least one tool
                                                return prev.filter(name => name !== toolName);
                                            } else {
                                                return [...prev, toolName];
                                            }
                                        });
                                    };

                                    if (isEditingAccess) {
                                        return (
                                            <>
                                                <div style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', textAlign: 'center' }}>Edit Pins</div>
                                                {allAvailableTools.map((tool, idx) => {
                                                    const Icon = tool.icon;
                                                    const isPinned = pinnedTools.includes(tool.name);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => toggleToolPin(tool.name)}
                                                            title={`${isPinned ? 'Unpin' : 'Pin'} ${tool.name}`}
                                                            style={{
                                                                width: '38px', height: '38px', borderRadius: '12px',
                                                                backgroundColor: isPinned ? tool.bg : '#F8FAFC',
                                                                border: isPinned ? `2px solid ${tool.color}` : '1.5px dashed #CBD5E1',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: isPinned ? tool.color : '#94A3B8',
                                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                                outline: 'none', flexShrink: 0,
                                                                position: 'relative',
                                                                opacity: isPinned ? 1 : 0.6
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            <Icon size={18} />
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setIsEditingAccess(false)}
                                                    title="Done Editing"
                                                    style={{
                                                        width: '38px', height: '38px', borderRadius: '12px',
                                                        backgroundColor: '#10B981', border: 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s ease',
                                                        outline: 'none', flexShrink: 0,
                                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                                        marginTop: '4px'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </>
                                        );
                                    }

                                    // Normal Mode: Show only pinned tools
                                    const visibleTools = allAvailableTools.filter(t => pinnedTools.includes(t.name));

                                    return (
                                        <>
                                            {visibleTools.map((tool, idx) => {
                                                const Icon = tool.icon;
                                                const isActive = location.pathname === getToolPath(tool.name);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={tool.action}
                                                        title={tool.name}
                                                        style={{
                                                            width: '38px', height: '38px', borderRadius: '12px',
                                                            backgroundColor: isActive ? '#DCF2E4' : tool.bg,
                                                            border: isActive ? `2px solid ${tool.color}` : 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: tool.color, cursor: 'pointer', transition: 'all 0.2s ease',
                                                            outline: 'none', flexShrink: 0
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <Icon size={18} />
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setIsEditingAccess(true)}
                                                title="Add/Edit Icons"
                                                style={{
                                                    width: '38px', height: '38px', borderRadius: '12px',
                                                    backgroundColor: 'transparent', border: '1.5px dashed #CBD5E1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease',
                                                    outline: 'none', flexShrink: 0
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Bottom Area: Edit & Settings */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                paddingTop: '16px',
                                width: '100%',
                                flexShrink: 0
                            }}>
                                {/* Horizontal Separator */}
                                <div style={{ width: '24px', height: '1px', backgroundColor: '#E2E8F0', margin: '0 0 4px 0', opacity: 0.8, flexShrink: 0 }} />

                                <button
                                    onClick={() => setIsEditingAccess(!isEditingAccess)}
                                    title="Edit Access Kit"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    title="Settings / Customization"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Sliders size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Always Visible Top-Right Toolbar Toggle Button */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '64px',
                height: '64px',
                backgroundColor: '#135029',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button
                    onClick={() => {
                        if (isRightSidebarOpen) {
                            setIsRightSidebarOpen(false);
                            if (setActivePanel) setActivePanel(null);
                        } else {
                            setIsRightSidebarOpen(true);
                        }
                    }}
                    title={isRightSidebarOpen ? "Close Toolbar" : "Open Toolbar"}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '11px',
                        backgroundColor: isRightSidebarOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Sliders size={18} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
