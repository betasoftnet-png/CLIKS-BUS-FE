import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Plus,
    Search,
    Filter,
    FileText,
    Users,
    Receipt,
    BarChart3,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertTriangle,
    IndianRupee,
    X,
    Trash2,
    Edit2,
    Download,
    Save,
    Calendar,
    User,
    Mail,
    MapPin,
    Phone,
    Briefcase,
    Layers,
    Loader2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesService, suppliersService, productsService, accountingService, settingsService } from '../services';
import { useCurrency } from '../context';
import FilterableTableHead from '../components/FilterableTableHead';
import { applyTableFilters } from '../utils/filterUtils';
import '../App.css';

const BusinessFinancePurchases = () => {
    const { currency, formatCurrency } = useCurrency();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [colFilters, setColFilters] = useState({});

    // Determine active tab from path
    const getTabFromPath = (path) => {
        if (path.includes('/new')) return 'new-purchase';
        if (path.includes('/register')) return 'register';
        if (path.includes('/vendors')) return 'vendors';
        if (path.includes('/bills')) return 'bills';
        if (path.includes('/reports')) return 'reports';
        if (path.includes('/details') || path.includes('/purchase-details')) return 'details';
        return 'register';
    };

    const activeTab = getTabFromPath(location.pathname);

    const handleTabChange = (tab) => {
        const pathMap = {
            'new-purchase': '/finance/purchases/new',
            'register': '/finance/purchases/register',
            'vendors': '/finance/purchases/vendors',
            'bills': '/finance/purchases/bills',
            'reports': '/finance/purchases/reports',
            'details': '/finance/purchases/details'
        };
        navigate(pathMap[tab]);
    };

    // --- Queries ---
    const { data: purchases = [], isLoading: isLoadingPurchases } = useQuery({
        queryKey: ['purchases', { doc_type: 'BILL' }],
        queryFn: () => purchasesService.getPurchases({ doc_type: 'BILL' })
    });

    const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: suppliersService.getSuppliers
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: productsService.getProducts
    });

    const { data: bankAccounts = [] } = useQuery({
        queryKey: ['bankAccounts'],
        queryFn: accountingService.getBankAccounts
    });

    // --- Mutations ---
    const createPurchaseMutation = useMutation({
        mutationFn: purchasesService.createPurchase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['balance-sheet'] });
            alert('Purchase Invoice successfully registered and synchronized with GSTR-2B.');
            handleTabChange('register');
        }
    });

    // --- Tab Renderers ---

    const renderNewPurchase = () => {
        return <NewPurchaseForm
            suppliers={suppliers}
            products={products}
            bankAccounts={bankAccounts}
            onSubmit={(data) => createPurchaseMutation.mutate(data)}
            isSubmitting={createPurchaseMutation.isPending}
            formatCurrency={formatCurrency}
            currency={currency}
        />;
    };

    const renderRegister = () => {
        const bills = purchases.filter(p => p.doc_type === 'BILL' || p.doc_type === 'GST');
        return (
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Purchase Register</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'white', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Download size={14} /> Export Register
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead
                            columns={[
                                { key: 'purchase_number', label: 'Bill No', placeholder: 'e.g. B-001' },
                                { key: 'supplier_name', label: 'Vendor', placeholder: 'Name' },
                                { key: 'purchase_date', label: 'Date', placeholder: 'YYYY-MM-DD' },
                                { key: 'grand_total', label: 'Amount', placeholder: 'e.g. 5000' },
                                { key: 'payment_status', label: 'Payment', placeholder: 'Status' },
                                { key: 'status', label: 'Doc Status', placeholder: 'Status' }
                            ]}
                            onFilterChange={setColFilters}
                        />
                        <tbody>
                            {bills.filter(item => applyTableFilters(item, colFilters)).map((bill) => (
                                <tr key={bill.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800', color: '#1B6B3A' }}>{bill.purchase_number}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <p style={{ fontWeight: '750', color: '#1E293B', margin: 0 }}>{bill.supplier_name}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>GSTIN: {bill.supplier_gstin || 'N/A'}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>{bill.purchase_date}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '900', color: '#1E293B' }}>{formatCurrency(bill.grand_total)}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '850',
                                            background: bill.payment_status === 'paid' ? '#DCFCE7' : '#FEE2E2',
                                            color: bill.payment_status === 'paid' ? '#15803D' : '#B91C1C'
                                        }}>
                                            {bill.payment_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '850',
                                            background: bill.status === 'Paid' || bill.status === 'Approved' ? '#EFF6FF' : '#FFFBEB',
                                            color: bill.status === 'Paid' || bill.status === 'Approved' ? '#1D4ED8' : '#B45309'
                                        }}>
                                            {bill.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderVendors = () => {
        return (
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Vendor Directory</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead
                            columns={[
                                { key: 'name', label: 'Vendor Name', placeholder: 'Name' },
                                { key: 'gstin', label: 'GSTIN', placeholder: 'GSTIN' },
                                { key: 'phone', label: 'Contact', placeholder: 'Phone' },
                                { key: 'city', label: 'Location', placeholder: 'City' },
                                { key: 'outstanding_balance', label: 'Payable Balance', placeholder: 'e.g. 5000' }
                            ]}
                            onFilterChange={setColFilters}
                        />
                        <tbody>
                            {suppliers.filter(item => applyTableFilters(item, colFilters)).map((vendor) => (
                                <tr key={vendor.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800', color: '#1E293B' }}>{vendor.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>{vendor.gstin || 'Unregistered'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748B' }}>{vendor.phone || vendor.email || 'N/A'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748B' }}>{vendor.city || 'N/A'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '900', color: vendor.outstanding_balance > 0 ? '#EF4444' : '#15803D' }}>
                                        {formatCurrency(vendor.outstanding_balance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderVendorBills = () => {
        const unpaidBills = purchases.filter(p => (p.doc_type === 'BILL' || p.doc_type === 'GST') && p.payment_status !== 'paid');
        return (
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Outstanding Vendor Bills (Accounts Payable)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead
                            columns={[
                                { key: 'purchase_number', label: 'Bill No', placeholder: 'e.g. B-001' },
                                { key: 'supplier_name', label: 'Vendor', placeholder: 'Name' },
                                { key: 'due_date', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
                                { key: 'grand_total', label: 'Total Amount', placeholder: 'e.g. 5000' },
                                { key: 'paid_amount', label: 'Paid', placeholder: 'e.g. 1000' },
                                { key: 'balance', label: 'Balance Due', placeholder: 'e.g. 4000' }
                            ]}
                            onFilterChange={setColFilters}
                        />
                        <tbody>
                            {unpaidBills.filter(item => applyTableFilters(item, colFilters)).map((bill) => {
                                const balance = (parseFloat(bill.grand_total) || 0) - (parseFloat(bill.paid_amount) || 0);
                                return (
                                    <tr key={bill.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '800', color: '#1B6B3A' }}>{bill.purchase_number}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '750', color: '#1E293B' }}>{bill.supplier_name}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#EF4444', fontWeight: '700' }}>{bill.due_date}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '800' }}>{formatCurrency(bill.grand_total)}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#15803D', fontWeight: '700' }}>{formatCurrency(bill.paid_amount)}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '950', color: '#B91C1C' }}>{formatCurrency(balance)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderReports = () => {
        const totalPurchases = purchases.reduce((acc, p) => acc + (parseFloat(p.grand_total) || 0), 0);
        const totalPaid = purchases.reduce((acc, p) => acc + (parseFloat(p.paid_amount) || 0), 0);
        const totalOutstanding = totalPurchases - totalPaid;
        const totalTax = purchases.reduce((acc, p) => acc + (parseFloat(p.total_tax) || 0), 0);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    {[
                        { label: 'Total Purchases', value: formatCurrency(totalPurchases), icon: ShoppingCart, color: '#1B6B3A', bg: '#DCF2E4' },
                        { label: 'Total Paid', value: formatCurrency(totalPaid), icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Accounts Payable', value: formatCurrency(totalOutstanding), icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                        { label: 'Input Tax Credit', value: formatCurrency(totalTax), icon: IndianRupee, color: '#3B82F6', bg: '#EFF6FF' }
                    ].map((stat, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E293B', margin: 0 }}>{stat.value}</h3>
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Placeholder */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexDirection: 'column', gap: '1rem' }}>
                    <BarChart3 size={48} style={{ opacity: 0.3 }} />
                    <p style={{ fontWeight: '600' }}>Purchase analytics and vendor wise spending charts will appear here.</p>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '1.5rem 2.5rem', background: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <ShoppingCart size={22} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Financial Purchases</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Manage vendor bills, accounts payable, and GST input tax reconciliation.</p>
                </div>
                {activeTab !== 'new-purchase' && (
                    <button
                        onClick={() => handleTabChange('new-purchase')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}
                    >
                        <Plus size={18} /> New Purchase Bill
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#F1F5F9', padding: '0.4rem', borderRadius: '16px', width: 'fit-content' }}>
                {[
                    { id: 'new-purchase', label: 'New Purchase', icon: Plus },
                    { id: 'register', label: 'Purchase Register', icon: Layers },
                    { id: 'vendors', label: 'Vendors', icon: Users },
                    { id: 'bills', label: 'Vendor Bills', icon: Receipt },
                    { id: 'details', label: 'Purchase Details', icon: ShoppingCart },
                    { id: 'reports', label: 'Reports', icon: BarChart3 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? '#1B6B3A' : '#64748B',
                            boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {activeTab === 'new-purchase' && renderNewPurchase()}
                {activeTab === 'register' && renderRegister()}
                {activeTab === 'vendors' && renderVendors()}
                {activeTab === 'bills' && renderVendorBills()}
                {activeTab === 'details' && renderPurchaseDetails()}
                {activeTab === 'reports' && renderReports()}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Sub-Components ---

const NewPurchaseForm = ({ suppliers, products, bankAccounts, onSubmit, isSubmitting, formatCurrency, currency }) => {
    const navigate = useNavigate();
    const [header, setHeader] = useState({
        purchase_number: `BILL-${Date.now().toString().slice(-6)}`,
        purchase_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        supplier_id: '',
        supplier_name: '',
        supplier_gstin: '',
        contact_number: '',
        email: '',
        billing_address: '',
        place_of_supply: 'Maharashtra',
        payment_mode: 'Cash',
        bank_account_id: '',
        shipping_charge: 0,
        purchase_type: 'GST'
    });

    const [items, setItems] = useState([
        { product_id: '', product_name: '', description: '', quantity: 1, primary_unit: 'pcs', purchase_price: 0, discount: 0, gst_percentage: 18 }
    ]);

    const handleAddItem = () => {
        setItems([...items, { product_id: '', product_name: '', description: '', quantity: 1, primary_unit: 'pcs', purchase_price: 0, discount: 0, gst_percentage: 18 }]);
    };

    const handleRemoveItem = (idx) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
    };

    const handleItemChange = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = val;

        if (field === 'product_id') {
            const prod = products.find(p => String(p.id) === String(val));
            if (prod) {
                newItems[idx].product_name = prod.name || prod.product_name;
                newItems[idx].purchase_price = parseFloat(prod.purchase_price || 0);
                newItems[idx].primary_unit = prod.primary_unit || 'pcs';
            }
        }
        setItems(newItems);
    };

    const totals = React.useMemo(() => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalGst = 0;

        items.forEach(item => {
            const base = (parseFloat(item.purchase_price) || 0) * (parseFloat(item.quantity) || 0);
            const disc = base * ((parseFloat(item.discount) || 0) / 100);
            const taxable = base - disc;
            const gst = taxable * ((parseFloat(item.gst_percentage) || 0) / 100);

            subtotal += base;
            totalDiscount += disc;
            totalGst += gst;
        });

        const grandTotal = subtotal - totalDiscount + totalGst + (parseFloat(header.shipping_charge) || 0);

        return {
            subtotal,
            totalDiscount,
            taxableValue: subtotal - totalDiscount,
            totalGst,
            grandTotal: Math.round(grandTotal)
        };
    }, [items, header.shipping_charge]);

    const handleHeaderChange = (field, val) => {
        let update = { [field]: val };
        if (field === 'supplier_id') {
            const supp = suppliers.find(s => String(s.id) === String(val));
            if (supp) {
                update.supplier_name = supp.name;
                update.supplier_gstin = supp.gstin || '';
                update.contact_number = supp.phone || '';
                update.email = supp.email || '';
                update.billing_address = supp.address || supp.city || '';
            }
        }
        setHeader({ ...header, ...update });
    };

    const handleSubmit = (e, statusOverride) => {
        if (e) e.preventDefault();
        const payload = {
            ...header,
            ...totals,
            doc_type: 'BILL',
            items: items.map(i => ({
                ...i,
                total: (parseFloat(i.purchase_price) * parseFloat(i.quantity)) * (1 - (parseFloat(i.discount) || 0) / 100) * (1 + (parseFloat(i.gst_percentage) || 0) / 100),
                tax_amount: (parseFloat(i.purchase_price) * parseFloat(i.quantity)) * (1 - (parseFloat(i.discount) || 0) / 100) * ((parseFloat(i.gst_percentage) || 0) / 100)
            })),
            paid_amount: header.payment_mode === 'Credit' ? 0 : totals.grandTotal,
            payment_status: header.payment_mode === 'Credit' ? 'pending' : 'paid',
            status: statusOverride || (header.payment_mode === 'Credit' ? 'Pending' : 'Paid')
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={(e) => handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Supplier Details Card */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}><User size={18} color="#1B6B3A" /> Supplier Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Vendor Name</label>
                        <select required value={header.supplier_id} onChange={(e) => handleHeaderChange('supplier_id', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700' }}>
                            <option value="">-- Choose Vendor --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.company ? `(${s.company})` : ''}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Vendor GSTIN</label>
                        <input type="text" value={header.supplier_gstin} onChange={(e) => handleHeaderChange('supplier_gstin', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="27AAAAA1111A1Z1" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Contact Number</label>
                        <input type="text" value={header.contact_number} onChange={(e) => handleHeaderChange('contact_number', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Email Address</label>
                        <input type="email" value={header.email} onChange={(e) => handleHeaderChange('email', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Billing Address</label>
                        <input type="text" value={header.billing_address} onChange={(e) => handleHeaderChange('billing_address', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Place of Supply (State)</label>
                        <input type="text" value={header.place_of_supply} onChange={(e) => handleHeaderChange('place_of_supply', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Bill Details Card */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Receipt size={18} color="#1B6B3A" /> Bill & Payment Metadata</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Invoice Number</label>
                        <input required type="text" value={header.purchase_number} onChange={(e) => handleHeaderChange('purchase_number', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '800' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Invoice Date</label>
                        <input required type="date" value={header.purchase_date} onChange={(e) => handleHeaderChange('purchase_date', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Due Date</label>
                        <input required type="date" value={header.due_date} onChange={(e) => handleHeaderChange('due_date', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Payment Type</label>
                        <select value={header.payment_mode} onChange={(e) => handleHeaderChange('payment_mode', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700' }}>
                            <option value="Cash">Cash</option>
                            <option value="Bank">Bank Transfer / UPI</option>
                            <option value="Credit">Credit (Post to Payables)</option>
                        </select>
                    </div>
                </div>
                {header.payment_mode === 'Bank' && (
                    <div style={{ maxWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Select Source Bank Account</label>
                        <select required value={header.bank_account_id} onChange={(e) => handleHeaderChange('bank_account_id', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                            <option value="">-- Choose Account --</option>
                            {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bank_name} ({formatCurrency(acc.balance)})</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Items Card */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Layers size={18} color="#1B6B3A" /> Purchase Items</h3>
                    <button type="button" onClick={handleAddItem} style={{ border: 'none', background: '#DCF2E4', color: '#1B6B3A', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Item Row</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Item Name / Description</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '80px' }}>Qty</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '80px' }}>Unit</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '120px' }}>Unit Price</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '80px' }}>Disc %</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '100px' }}>GST %</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right', width: '120px' }}>Total</th>
                                <th style={{ padding: '1rem 0.5rem', width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const base = (parseFloat(item.purchase_price) || 0) * (parseFloat(item.quantity) || 0);
                                const disc = base * ((parseFloat(item.discount) || 0) / 100);
                                const taxable = base - disc;
                                const gst = taxable * ((parseFloat(item.gst_percentage) || 0) / 100);
                                const rowTotal = taxable + gst;

                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <input list="products-list" value={item.product_name} onChange={(e) => {
                                                const val = e.target.value;
                                                const prod = products.find(p => p.name === val || p.product_name === val);
                                                if (prod) {
                                                    handleItemChange(idx, 'product_id', prod.id);
                                                } else {
                                                    handleItemChange(idx, 'product_name', val);
                                                }
                                            }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Type item name..." />
                                            <datalist id="products-list">
                                                {products.map(p => <option key={p.id} value={p.name || p.product_name} />)}
                                            </datalist>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <input type="text" value={item.primary_unit} onChange={(e) => handleItemChange(idx, 'primary_unit', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <input type="number" value={item.purchase_price} onChange={(e) => handleItemChange(idx, 'purchase_price', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <input type="number" value={item.discount} onChange={(e) => handleItemChange(idx, 'discount', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <select value={item.gst_percentage} onChange={(e) => handleItemChange(idx, 'gst_percentage', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white' }}>
                                                <option value="0">0%</option>
                                                <option value="5">5%</option>
                                                <option value="12">12%</option>
                                                <option value="18">18%</option>
                                                <option value="28">28%</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '750', color: '#1E293B' }}>
                                            {formatCurrency(rowTotal)}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <button type="button" onClick={() => handleRemoveItem(idx)} style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary & Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Shipping / Extra Charges</label>
                    <input type="number" value={header.shipping_charge} onChange={(e) => handleHeaderChange('shipping_charge', e.target.value)} style={{ width: '200px', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                </div>

                <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#EF4444', fontWeight: '600' }}>
                        <span>Total Discount:</span>
                        <span>- {formatCurrency(totals.totalDiscount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E293B', fontWeight: '600', padding: '0.5rem 0', borderTop: '1px dashed #E2E8F0' }}>
                        <span>Taxable Value:</span>
                        <span>{formatCurrency(totals.taxableValue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1B6B3A', fontWeight: '700' }}>
                        <span>Total GST (Input):</span>
                        <span>+ {formatCurrency(totals.totalGst)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: '#1B6B3A', fontWeight: '900', marginTop: '0.5rem', borderTop: '2px solid #DCF2E4', paddingTop: '1rem' }}>
                        <span>Grand Total:</span>
                        <span>{formatCurrency(totals.grandTotal)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'white', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" onClick={() => handleSubmit(null, 'Draft')} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Save Draft</button>
                        <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '1rem', borderRadius: '16px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            {isSubmitting ? 'Processing...' : 'Save Purchase Bill'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );

    // --- State & Render for Purchase Details view ---
    const [receiveDataFilter, setReceiveDataFilter] = useState('YES');

    const { data: merchantCards = [], isLoading: isLoadingMerchants } = useQuery({
        queryKey: ['customer-merchants', receiveDataFilter],
        queryFn: () => apiClient.get('/customer/merchants', { params: { receiveData: receiveDataFilter } }).then(res => res.data.data || res.data || [])
    });

    const renderPurchaseDetails = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header & Receive Data Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Customer Purchase Details</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>View synchronized purchase history, merchant cards, loyalty points, and invoice downloads.</p>
                </div>
                
                {/* Receive Data Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Receive Data</span>
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#E2E8F0', padding: '0.25rem', borderRadius: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setReceiveDataFilter('YES')}
                            style={{
                                padding: '0.35rem 1rem',
                                borderRadius: '6px',
                                fontWeight: '800',
                                fontSize: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: receiveDataFilter === 'YES' ? '#1B6B3A' : 'transparent',
                                color: receiveDataFilter === 'YES' ? 'white' : '#64748B',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            YES
                        </button>
                        <button
                            type="button"
                            onClick={() => setReceiveDataFilter('NO')}
                            style={{
                                padding: '0.35rem 1rem',
                                borderRadius: '6px',
                                fontWeight: '800',
                                fontSize: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: receiveDataFilter === 'NO' ? '#EF4444' : 'transparent',
                                color: receiveDataFilter === 'NO' ? 'white' : '#64748B',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            NO
                        </button>
                    </div>
                </div>
            </div>

            {/* Merchant Cards Grid */}
            {isLoadingMerchants ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: '#1B6B3A' }} />
                </div>
            ) : merchantCards.length === 0 ? (
                <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <ShoppingCart size={40} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1E293B' }}>
                        {receiveDataFilter === 'YES' ? 'No Synchronized Merchant History' : 'Synchronized History Hidden'}
                    </h4>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                        {receiveDataFilter === 'YES' ? 'Invoices generated for customer purchases will appear here.' : 'Select YES under "Receive Data" to display synchronized purchase history.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {merchantCards.map((merchant, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#DCF2E4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                                        {(merchant.merchant_name || 'M')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>{merchant.merchant_name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{merchant.merchant_email || 'Merchant Store'}</span>
                                    </div>
                                </div>
                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', background: '#ECFDF5', color: '#047857', fontSize: '0.7rem', fontWeight: '800' }}>
                                    ⭐ {merchant.net_points || merchant.points_earned || 0} pts
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                                <div>
                                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem', fontWeight: '700' }}>Purchases</span>
                                    <strong style={{ color: '#0F172A' }}>{merchant.purchases_count || 0} Invoices</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem', fontWeight: '700' }}>Total Spent</span>
                                    <strong style={{ color: '#1B6B3A' }}>{formatCurrency(merchant.total_spent || 0)}</strong>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    Merchant History
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BusinessFinancePurchases;
