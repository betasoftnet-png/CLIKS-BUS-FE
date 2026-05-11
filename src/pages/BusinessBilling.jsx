import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    FileText, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    Download,
    Receipt,
    User,
    Mail,
    Calendar,
    IndianRupee,
    TrendingUp,
    Printer,
    Share2,
    History,
    Tag
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { inventoryService } from '../services/inventoryService';
import { crmService } from '../services/crmService';
import { paymentsStore } from '../lib/paymentsStore';
import '../App.css';

const BusinessBilling = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [selectedHistoryInvoice, setSelectedHistoryInvoice] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCustomerObject, setSelectedCustomerObject] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('standard'); // standard, modern, minimal

    const handleViewHistory = (invoice) => {
        setSelectedHistoryInvoice(invoice);
        setIsHistoryModalOpen(true);
    };

    const handlePrint = (invoice) => {
        setPrintData(invoice);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setPrintData(null);
        }, 500);
    };
    const bankAccounts = paymentsStore.getBankAccounts();
    const [formData, setFormData] = useState(() => ({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        client_name: '',
        client_email: '',
        client_gstin: '',
        billing_address: '',
        shipping_address: '',
        amount: 0,
        tax_amount: 0,
        total_amount: 0,
        paid_amount: 0,
        due_amount: 0,
        bank_account_id: '',
        discount_amount: 0,
        round_off: 0,
        status: 'Unpaid',
        due_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        invoice_type: 'GST', // GST, Non-GST, Proforma, Quotation, Return, CreditNote, DebitNote, Purchase
        tax_type: 'Exclusive', // Inclusive, Exclusive
        redeemed_points: 0,
        earned_points: 0,
        items: [{ 
            description: '', 
            quantity: 1, 
            price: 0, 
            tax_rate: 18, 
            unit: 'Pcs',
            hsn_code: '',
            discount_percent: 0,
            discount_amount: 0,
            total: 0 
        }]
    }));

    // Calculate totals when items change
    const calculateTotals = (items, taxType, currentFormData = {}) => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        
        items.forEach(item => {
            const qty = parseFloat(item.quantity) || 0;
            const prc = parseFloat(item.price) || 0;
            const discPct = parseFloat(item.discount_percent) || 0;
            const discAmt = parseFloat(item.discount_amount) || 0;
            const txRate = parseFloat(item.tax_rate) || 0;

            const basePrice = qty * prc;
            
            // Calculate Item Discount
            const itemDiscount = (basePrice * (discPct / 100)) + discAmt;
            const priceAfterDiscount = Math.max(0, basePrice - itemDiscount);
            
            let itemTax = 0;
            let itemFinalTotal = 0;

            if (taxType === 'Inclusive') {
                const taxableValue = priceAfterDiscount / (1 + txRate / 100);
                itemTax = priceAfterDiscount - taxableValue;
                itemFinalTotal = priceAfterDiscount;
                subtotal += parseFloat(taxableValue) || 0;
            } else {
                itemTax = priceAfterDiscount * (txRate / 100);
                itemFinalTotal = priceAfterDiscount + itemTax;
                subtotal += priceAfterDiscount;
            }

            totalTax += parseFloat(itemTax) || 0;
            totalDiscount += parseFloat(itemDiscount) || 0;
            item.total = parseFloat(itemFinalTotal) || 0;
        });

        const rawTotal = (parseFloat(subtotal) || 0) + (parseFloat(totalTax) || 0);
        const redeemedAmt = parseFloat(currentFormData.redeemed_points) || 0; // 1 pt = 1 Re
        const adjustedTotal = rawTotal - redeemedAmt;
        const roundedTotal = Math.max(0, Math.round(adjustedTotal));
        const roundOff = roundedTotal - adjustedTotal;
        
        // Rule: Earn 1 point per 100₹ of final bill
        const earnedPts = Math.max(0, Math.floor(roundedTotal / 100));

        return {
            amount: parseFloat(subtotal) || 0,
            tax_amount: parseFloat(totalTax) || 0,
            discount_amount: parseFloat(totalDiscount) || 0,
            total_amount: parseFloat(roundedTotal) || 0,
            round_off: parseFloat(roundOff) || 0,
            earned_points: parseInt(earnedPts) || 0
        };
    };

    const handleClientChange = (value) => {
        const selectedCustomer = customers.find(c => c.name === value);
        if (selectedCustomer) {
            setSelectedCustomerObject(selectedCustomer);
            setFormData({
                ...formData,
                client_name: selectedCustomer.name,
                client_email: selectedCustomer.email || '',
                client_gstin: selectedCustomer.gstin || '',
                billing_address: selectedCustomer.company || selectedCustomer.billing_address || '', 
                shipping_address: selectedCustomer.company || selectedCustomer.shipping_address || ''
            });
        } else {
            setSelectedCustomerObject(null);
            setFormData({ ...formData, client_name: value, redeemed_points: 0 });
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        
        if (field === 'description' && inventoryItems.length > 0) {
            // Check if the value matches an inventory item name
            const selectedInvItem = inventoryItems.find(i => i.name === value);
            if (selectedInvItem) {
                newItems[index] = {
                    ...newItems[index],
                    description: selectedInvItem.name,
                    inventory_id: selectedInvItem.id,
                    price: selectedInvItem.price || 0,
                    hsn_code: selectedInvItem.hsn_sac || '',
                    tax_rate: selectedInvItem.gst_rate || 18,
                    unit: selectedInvItem.unit || 'Pcs',
                    total: (newItems[index].quantity || 1) * (selectedInvItem.price || 0)
                };
            } else {
                newItems[index][field] = value;
                newItems[index].inventory_id = null;
            }
        } else {
            newItems[index][field] = value;
        }
        
        const totals = calculateTotals(newItems, formData.tax_type, formData);
        const paid = formData.payment_mode === 'Credit' ? 0 : totals.total_amount;
        setFormData({ 
            ...formData, 
            items: newItems, 
            ...totals,
            paid_amount: paid,
            due_amount: totals.total_amount - paid
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const totals = calculateTotals(newItems, formData.tax_type, formData);
        setFormData({ ...formData, items: newItems, ...totals });
    };

    // Queries
    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: billingService.getInvoices
    });

    const { data: inventoryItems = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryService.getInventory
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            return res.data || [];
        }
    });

    // Mutations
    const adjustStockMutation = useMutation({
        mutationFn: ({ id, amount }) => inventoryService.adjustStock(id, amount)
    });

    const createMutation = useMutation({
        mutationFn: billingService.createInvoice,
        onSuccess: () => {
            // Deduct stock for each item if it's a Sales Invoice
            if (formData.invoice_type === 'GST' || formData.invoice_type === 'Non-GST') {
                formData.items.forEach(item => {
                    if (item.inventory_id) {
                        adjustStockMutation.mutate({ 
                            id: item.inventory_id, 
                            amount: -item.quantity 
                        });
                    }
                });
            } else if (formData.invoice_type === 'Return') {
                // Add back stock for returns
                formData.items.forEach(item => {
                    if (item.inventory_id) {
                        adjustStockMutation.mutate({ 
                            id: item.inventory_id, 
                            amount: item.quantity 
                        });
                    }
                });
            }

            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => billingService.updateInvoice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: billingService.deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInvoice(null);
        setSelectedCustomerObject(null);
        setFormData({
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            client_name: '',
            client_email: '',
            client_gstin: '',
            billing_address: '',
            shipping_address: '',
            amount: 0,
            tax_amount: 0,
            total_amount: 0,
            paid_amount: 0,
            due_amount: 0,
            bank_account_id: '',
            discount_amount: 0,
            round_off: 0,
            status: 'Unpaid',
            due_date: new Date().toISOString().split('T')[0],
            payment_mode: 'Cash',
            invoice_type: 'GST',
            tax_type: 'Exclusive',
            redeemed_points: 0,
            earned_points: 0,
            items: [{ 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        const parsedItems = invoice.items ? (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items) : [];
        setFormData({
            invoice_number: invoice.invoice_number,
            client_name: invoice.client_name,
            client_email: invoice.client_email,
            client_gstin: invoice.client_gstin || '',
            billing_address: invoice.billing_address || '',
            shipping_address: invoice.shipping_address || '',
            amount: invoice.amount,
            tax_amount: invoice.tax_amount || 0,
            total_amount: invoice.total_amount || invoice.amount,
            paid_amount: invoice.paid_amount || invoice.total_amount || invoice.amount,
            due_amount: invoice.due_amount || (invoice.total_amount || invoice.amount) - (invoice.paid_amount || 0),
            bank_account_id: invoice.bank_account_id || '',
            discount_amount: invoice.discount_amount || 0,
            round_off: invoice.round_off || 0,
            status: invoice.status || 'Unpaid',
            due_date: invoice.due_date,
            payment_mode: invoice.payment_mode || 'Cash',
            invoice_type: invoice.invoice_type || 'GST',
            tax_type: invoice.tax_type || 'Exclusive',
            items: parsedItems.length > 0 ? parsedItems : [{ 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Derive Status Logic
        const total = parseFloat(formData.total_amount) || 0;
        const paid = parseFloat(formData.paid_amount) || 0;
        const due = total - paid;
        
        let calculatedStatus = 'Unpaid';
        if (paid === 0) {
            calculatedStatus = 'Unpaid';
        } else if (paid < total) {
            calculatedStatus = 'Partially Paid';
        } else {
            calculatedStatus = 'Paid';
        }

        // Extract payload and EXCLUDE loyalty points fields which don't exist on backend table schema
        // This prevents the 500 Internal Server error caused by extra unexpected columns
        const { redeemed_points, earned_points, ...filteredFormData } = formData;

        const payload = {
            ...filteredFormData,
            status: calculatedStatus,
            due_amount: due,
            items: JSON.stringify(formData.items)
        };

        if (editingInvoice) {
            updateMutation.mutate({ id: editingInvoice.id, data: payload });
        } else {
            // Create sales transaction inside paymentsStore
            if (paid > 0) {
                paymentsStore.addTransaction({
                    type: 'income',
                    reference_type: 'sales',
                    reference_id: formData.invoice_number,
                    bank_account_id: formData.bank_account_id || null,
                    amount: paid,
                    payment_method: formData.payment_mode.toLowerCase(),
                    notes: `Sales Payment received for Invoice ${formData.invoice_number}`
                });
            }
            // Update Customer Loyalty Points
            if (selectedCustomerObject) {
                const currentPts = selectedCustomerObject.loyalty_points || 0;
                const newPts = currentPts - (formData.redeemed_points || 0) + (formData.earned_points || 0);
                
                // Fire and forget update to CRM, success is handle seamlessly on invalidate query
                crmService.updateCustomer(selectedCustomerObject.id, {
                    ...selectedCustomerObject,
                    loyalty_points: newPts
                }).catch(e => console.error('Failed automatic loyalty increment:', e));
            }

            createMutation.mutate(payload);
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        (inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalInvoiced = invoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    const paidInvoiced = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    const pendingInvoiced = invoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);

    const handleSendReminder = (invoice) => {
        const message = `Hello ${invoice.client_name},\n\nThis is a friendly reminder regarding your invoice *${invoice.invoice_number}* for ₹*${(invoice.total_amount || invoice.amount).toLocaleString()}*.\n\nDue Date: ${invoice.due_date}\nStatus: ${invoice.status.toUpperCase()}\n\nPlease make the payment at your earliest convenience.\n\nThank you,\nCLIKS BUSINESS`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Receipt size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Billing Center</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage client invoices and accounts receivable.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.65rem 1rem', borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', 
                        fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                        boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                    }}
                >
                    <Plus size={15} />
                    Generate Invoice
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Invoiced', value: `₹${totalInvoiced.toLocaleString()}`, icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Paid Revenue', value: `₹${paidInvoiced.toLocaleString()}`, icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Outstanding Balance', value: `₹${pendingInvoiced.toLocaleString()}`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Clients', value: new Set(invoices.map(i => i.client_name)).size, icon: User, color: '#3B82F6', bg: '#EFF6FF' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Invoices List */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search client or invoice #..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem' }}
                        />
                    </div>
                    <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Filter size={16} />
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color="#BE185D" /></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice</th>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Client</th>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Due Date</th>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE185D' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#0F172A', fontSize: '0.85rem' }}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.85rem', marginBottom: '0.1rem', margin: 0 }}>{inv.client_name}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{inv.client_email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                                <Calendar size={12} />
                                                {inv.due_date}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A' }}>₹{inv.amount.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                background: inv.status === 'Paid' ? '#D1FAE5' : (inv.status === 'Unpaid' ? '#FEE2E2' : '#FEF3C7'),
                                                color: inv.status === 'Paid' ? '#065F46' : (inv.status === 'Unpaid' ? '#991B1B' : '#92400E'),
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>
                                                {inv.status === 'Paid' ? <CheckCircle2 size={10} /> : (inv.status === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />)}
                                                {inv.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                <button onClick={() => handleViewHistory(inv)} title="Invoice Audit Trail" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><History size={14} /></button>
                                                <button onClick={() => handleSendReminder(inv)} title="WhatsApp Reminder" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Share2 size={14} /></button>
                                                <button onClick={() => handlePrint(inv)} title="Print Invoice" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={14} /></button>
                                                <button onClick={() => handleEdit(inv)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #FEE2E2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '760px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Invoice #</label>
                                    <input readOnly type="text" value={formData.invoice_number} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Type</label>
                                    <select value={formData.invoice_type} onChange={(e) => setFormData({...formData, invoice_type: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem' }}>
                                        <option>GST</option>
                                        <option>Non-GST</option>
                                        <option>Proforma</option>
                                        <option>Quotation</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem' }}>
                                        <option>Draft</option>
                                        <option>Unpaid</option>
                                        <option>Paid</option>
                                        <option>Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        list="customer-suggestions"
                                        value={formData.client_name} 
                                        onChange={(e) => handleClientChange(e.target.value)} 
                                        style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} 
                                    />
                                    <datalist id="customer-suggestions">
                                        {customers.map(c => (
                                            <option key={c.id} value={c.name}>{c.company || 'Personal'}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client Email</label>
                                    <input required type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client GSTIN</label>
                                    <input type="text" value={formData.client_gstin} onChange={(e) => setFormData({...formData, client_gstin: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} placeholder="Optional" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Billing Address</label>
                                    <textarea value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '60px', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                    <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '60px', fontSize: '0.85rem' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Invoice Items</h3>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input 
                                                placeholder="Quick Scan / Barcode" 
                                                style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem', width: '160px' }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const barcode = e.target.value;
                                                        const item = inventoryItems.find(i => i.barcode === barcode || i.sku === barcode);
                                                        if (item) {
                                                            const newItem = {
                                                                description: item.name,
                                                                inventory_id: item.id,
                                                                quantity: 1,
                                                                price: item.price || 0,
                                                                tax_rate: item.gst_rate || 18,
                                                                unit: item.unit || 'Pcs',
                                                                hsn_code: item.hsn_sac || '',
                                                                discount_percent: 0,
                                                                discount_amount: 0,
                                                                total: item.price || 0
                                                            };
                                                            const newItems = [...formData.items, newItem].filter(it => it.description !== '');
                                                            const totals = calculateTotals(newItems, formData.tax_type, formData);
                                                            setFormData({ ...formData, items: newItems, ...totals });
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#BE185D', background: '#FCE7F3', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 70px 60px 70px 70px 70px 70px 30px', gap: '0.5rem', alignItems: 'end', padding: '0.6rem 0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>DESCRIPTION</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    list="inventory-suggestions"
                                                    value={item.description} 
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                                                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} 
                                                />
                                                <datalist id="inventory-suggestions">
                                                    {inventoryItems.map(inv => (
                                                        <option key={inv.id} value={inv.name}>{inv.sku} - Stock: {inv.quantity}</option>
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>HSN</label>
                                                <input type="text" value={item.hsn_code} onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>QTY</label>
                                                <input required type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>UNIT</label>
                                                <select value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8rem' }}>
                                                    <option>Pcs</option>
                                                    <option>Kg</option>
                                                    <option>Mtr</option>
                                                    <option>Box</option>
                                                    <option>Nos</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>PRICE (₹)</label>
                                                <input required type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>DISC %</label>
                                                <input type="number" value={item.discount_percent} onChange={(e) => handleItemChange(idx, 'discount_percent', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>GST %</label>
                                                <select value={item.tax_rate} onChange={(e) => handleItemChange(idx, 'tax_rate', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8rem' }}>
                                                    <option value={0}>0%</option>
                                                    <option value={5}>5%</option>
                                                    <option value={12}>12%</option>
                                                    <option value={18}>18%</option>
                                                    <option value={28}>28%</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => removeItem(idx)} style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer', paddingBottom: '0.4rem' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', padding: '1rem', background: '#EFF6FF', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Payment Mode</label>
                                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                            {['Cash', 'UPI', 'Bank', 'Credit'].map(mode => (
                                                <button 
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => {
                                                        const paid = mode === 'Credit' ? 0 : formData.total_amount;
                                                        setFormData({
                                                            ...formData, 
                                                            payment_mode: mode,
                                                            paid_amount: paid,
                                                            due_amount: formData.total_amount - paid
                                                        });
                                                    }}
                                                    style={{ 
                                                        flex: 1, padding: '0.5rem', borderRadius: '6px', 
                                                        border: 'none',
                                                        background: formData.payment_mode === mode ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' : 'white',
                                                        color: formData.payment_mode === mode ? 'white' : '#64748B',
                                                        fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                                                        boxShadow: formData.payment_mode === mode ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(formData.payment_mode === 'Bank' || formData.payment_mode === 'UPI') && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Bank Account</label>
                                            <select 
                                                required
                                                value={formData.bank_account_id}
                                                onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', fontSize: '0.8rem' }}
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {bankAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.bank_name} - ₹{acc.current_balance.toLocaleString()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Paid Amount (₹)</label>
                                            <input 
                                                type="number" 
                                                value={formData.paid_amount || 0} 
                                                onChange={(e) => {
                                                    const paid = parseFloat(e.target.value) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        paid_amount: paid,
                                                        due_amount: formData.total_amount - paid
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', fontSize: '0.8rem' }} 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Due Amount (₹)</label>
                                            <input 
                                                readOnly
                                                type="number" 
                                                value={(parseFloat(formData.total_amount) || 0) - (parseFloat(formData.paid_amount) || 0)} 
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: '#F8FAFC', color: '#64748B', fontSize: '0.8rem' }} 
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                                                <Tag size={12} /> Loyalty Points
                                            </label>
                                            {selectedCustomerObject && (
                                                <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700' }}>Available: {selectedCustomerObject.loyalty_points || 0}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input 
                                                type="number" 
                                                disabled={!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0}
                                                placeholder="Points to redeem"
                                                value={formData.redeemed_points || ''}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value) || 0;
                                                    const maxAvail = selectedCustomerObject ? (selectedCustomerObject.loyalty_points || 0) : 0;
                                                    if (val > maxAvail) val = maxAvail;
                                                    if (val < 0) val = 0;
                                                    
                                                    // Create temporary updated state to calc totals accurately
                                                    const tmp = { ...formData, redeemed_points: val };
                                                    const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                    setFormData({ ...tmp, ...newTotals });
                                                }}
                                                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0', background: 'white', fontSize: '0.8rem' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    if (!selectedCustomerObject) return;
                                                    const maxAvail = selectedCustomerObject.loyalty_points || 0;
                                                    const tmp = { ...formData, redeemed_points: maxAvail };
                                                    const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                    setFormData({ ...tmp, ...newTotals });
                                                }}
                                                disabled={!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0}
                                                style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#16A34A', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', opacity: (!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0) ? 0.5 : 1 }}
                                            >Use Max</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Due Date</label>
                                        <input required type="date" value={formData.due_date || new Date().toISOString().split('T')[0]} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', fontSize: '0.8rem' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Subtotal:</span>
                                        <span>₹ {formData.amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Total Discount:</span>
                                        <span style={{ color: '#EF4444' }}>- ₹ {formData.discount_amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>GST Amount:</span>
                                        <span>₹ {formData.tax_amount.toLocaleString()}</span>
                                    </div>
                                    {formData.redeemed_points > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '700', fontSize: '0.8rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Tag size={10} /> Points Redeemed:</span>
                                            <span>- ₹ {formData.redeemed_points.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Round Off:</span>
                                        <span>₹ {(parseFloat(formData.round_off) || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E3A8A', fontWeight: '900', fontSize: '1.25rem', marginTop: '0.3rem', borderTop: '1px dashed #DBEAFE', paddingTop: '0.4rem' }}>
                                        <span>Total:</span>
                                        <span>₹ {formData.total_amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', background: '#F0FDF4', border: '1px dashed #BBF7D0', padding: '0.3rem', borderRadius: '6px', marginTop: '0.2rem' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#15803D', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            🎉 Points to earn this bill: {formData.earned_points || 0} pts
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', flex: 1 }}>
                                    <FileText size={16} color="#64748B" />
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Print Template</label>
                                        <select 
                                            value={activeTemplate} 
                                            onChange={(e) => setActiveTemplate(e.target.value)}
                                            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0F172A', fontSize: '0.8rem', padding: 0, cursor: 'pointer' }}
                                        >
                                            <option value="standard">Standard (Pink)</option>
                                            <option value="modern">Modern Navy</option>
                                            <option value="minimal">Minimal Mono</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {createMutation.isLoading || updateMutation.isLoading ? <Loader2 className="animate-spin" /> : (editingInvoice ? 'Update Invoice' : 'Generate & Save Invoice')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Friendly Template */}
            {/* Print Friendly Template Rendering Station */}
            {isPrinting && printData && (
                <div id="invoice-print-area" className="print-only" style={{ padding: '40px', color: '#000', background: '#fff', minHeight: '100vh', boxSizing: 'border-box' }}>
                    
                    {/* Shared Sub-Component: Header Logic */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '30px',
                        paddingBottom: activeTemplate === 'modern' ? '20px' : '0',
                        borderBottom: activeTemplate === 'modern' ? '4px solid #1E3A8A' : 'none'
                    }}>
                        <div>
                            <h1 style={{ 
                                fontSize: '28px', 
                                fontWeight: '900', 
                                color: activeTemplate === 'modern' ? '#1E3A8A' : (activeTemplate === 'minimal' ? '#000' : '#BE185D'), 
                                marginBottom: '5px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                CLIKS BUSINESS
                            </h1>
                            <p style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>Tax Invoice / Bill of Supply</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ 
                                fontSize: '24px', 
                                fontWeight: '900', 
                                marginBottom: '4px', 
                                color: activeTemplate === 'minimal' ? '#000' : '#334155' 
                            }}>INVOICE</h2>
                            <p style={{ fontWeight: '800', fontSize: '14px' }}>#{printData.invoice_number}</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Date: {printData.due_date}</p>
                        </div>
                    </div>

                    {/* Address Info Block */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '40px', 
                        marginBottom: '30px',
                        background: activeTemplate === 'modern' ? '#F8FAFC' : 'transparent',
                        padding: activeTemplate === 'modern' ? '20px' : '0',
                        borderRadius: activeTemplate === 'modern' ? '8px' : '0'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Billed To:</h3>
                            <p style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{printData.client_name}</p>
                            <p style={{ fontSize: '13px', color: '#475569' }}>{printData.client_email}</p>
                            {printData.client_gstin && <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>GSTIN: {printData.client_gstin}</p>}
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Billing Address:</p>
                                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{printData.billing_address || 'N/A'}</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Shipping Details:</h3>
                            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{printData.shipping_address || 'N/A'}</p>
                            <div style={{ marginTop: '15px', display: 'inline-grid', gap: '4px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Mode:</span>
                                    <span style={{ fontWeight: '700' }}>{printData.payment_mode}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Status:</span>
                                    <span style={{ 
                                        fontWeight: '800', 
                                        color: printData.status === 'Paid' ? '#15803D' : '#B91C1C',
                                        textTransform: 'uppercase'
                                    }}>{printData.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px' }}>
                        <thead>
                            <tr style={{ 
                                background: activeTemplate === 'modern' ? '#1E3A8A' : (activeTemplate === 'minimal' ? '#F8FAFC' : '#FCE7F3'), 
                                color: activeTemplate === 'modern' ? '#FFF' : '#000',
                                borderBottom: activeTemplate === 'minimal' ? '2px solid #000' : 'none'
                            }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Item Description</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>HSN</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Qty</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Unit Price</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Discount</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>GST %</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(typeof printData.items === 'string' ? JSON.parse(printData.items) : printData.items).map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{item.description}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>{item.hsn_code || '-'}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>{item.quantity} <span style={{fontSize:'11px', fontWeight:'normal'}}>{item.unit}</span></td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>₹{item.price.toLocaleString()}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: item.discount_percent > 0 ? '#B91C1C' : '#475569' }}>
                                        {item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>{item.tax_rate}%</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer/Summary Section */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ 
                            width: '300px', 
                            background: activeTemplate === 'minimal' ? 'transparent' : '#F8FAFC', 
                            padding: '20px', 
                            borderRadius: '8px',
                            border: activeTemplate === 'minimal' ? '1px solid #E2E8F0' : 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                                <span style={{ color: '#64748B', fontWeight: '600' }}>Subtotal</span>
                                <span style={{ fontWeight: '800' }}>₹{printData.amount.toLocaleString()}</span>
                            </div>
                            {printData.discount_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B', fontWeight: '600' }}>Total Discount</span>
                                    <span style={{ fontWeight: '800', color: '#B91C1C' }}>- ₹{printData.discount_amount.toLocaleString()}</span>
                                </div>
                            )}
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                                <span style={{ color: '#64748B', fontWeight: '600' }}>Tax Amount (GST)</span>
                                <span style={{ fontWeight: '800' }}>₹{printData.tax_amount.toLocaleString()}</span>
                            </div>
                            {(printData.redeemed_points > 0) && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                                    <span style={{ color: '#16A34A', fontWeight: '800' }}>Points Redeemed</span>
                                    <span style={{ fontWeight: '800', color: '#16A34A' }}>- ₹{printData.redeemed_points.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                                <span style={{ color: '#64748B', fontWeight: '600' }}>Round Off</span>
                                <span style={{ fontWeight: '800' }}>₹{(parseFloat(printData.round_off) || 0).toFixed(2)}</span>
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                borderTop: `2px solid ${activeTemplate === 'modern' ? '#1E3A8A' : '#000'}`, 
                                paddingTop: '12px', 
                                marginTop: '12px', 
                                fontSize: '18px' 
                            }}>
                                <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>Total</span>
                                <span style={{ 
                                    fontWeight: '900', 
                                    color: activeTemplate === 'modern' ? '#1E3A8A' : (activeTemplate === 'minimal' ? '#000' : '#BE185D')
                                }}>
                                    ₹{printData.total_amount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div style={{ marginTop: '80px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Thank you for your business!</p>
                        <p style={{ fontSize: '11px', color: '#64748B' }}>This is a digitally generated invoice and does not require an authorized signature.</p>
                    </div>
                </div>
            )}

            {/* History Lifecycle Modal */}
            {isHistoryModalOpen && selectedHistoryInvoice && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Invoice History</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.1rem', margin: 0 }}>Audit trail for {selectedHistoryInvoice.invoice_number}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #E2E8F0' }}>
                                {/* Event 1 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: '#BE185D', border: '3px solid #FCE7F3' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Invoice Generated</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Invoice created successfully as {selectedHistoryInvoice.invoice_type || 'GST'} with base amount ₹{selectedHistoryInvoice.amount.toLocaleString()}.</p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:00 AM</span>
                                </div>
                                {/* Event 2 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: '#1D4ED8', border: '3px solid #EFF6FF' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Tax & Discounts Applied</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>GST of ₹{(selectedHistoryInvoice.tax_amount || 0).toLocaleString()} and Discount of ₹{(selectedHistoryInvoice.discount_amount || 0).toLocaleString()} were successfully processed.</p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:05 AM</span>
                                </div>
                                {/* Event 3 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: selectedHistoryInvoice.status === 'Paid' ? '#059669' : '#EF4444', border: selectedHistoryInvoice.status === 'Paid' ? '3px solid #D1FAE5' : '3px solid #FEE2E2' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Payment Status: {selectedHistoryInvoice.status.toUpperCase()}</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                                        {selectedHistoryInvoice.status === 'Paid' 
                                            ? `Full payment of ₹${selectedHistoryInvoice.total_amount ? selectedHistoryInvoice.total_amount.toLocaleString() : selectedHistoryInvoice.amount.toLocaleString()} received via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                            : `Awaiting pending payment of ₹${selectedHistoryInvoice.total_amount ? selectedHistoryInvoice.total_amount.toLocaleString() : selectedHistoryInvoice.amount.toLocaleString()} via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                        }
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:10 AM</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>Close Trail</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBilling;
