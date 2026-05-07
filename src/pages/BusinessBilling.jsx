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
    History
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
    const [bankAccounts, setBankAccounts] = useState(() => paymentsStore.getBankAccounts());
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
    const calculateTotals = (items, taxType) => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        
        items.forEach(item => {
            const basePrice = item.quantity * item.price;
            
            // Calculate Item Discount
            const itemDiscount = (basePrice * (item.discount_percent / 100)) + (item.discount_amount || 0);
            const priceAfterDiscount = basePrice - itemDiscount;
            
            let itemTax = 0;
            let itemFinalTotal = 0;

            if (taxType === 'Inclusive') {
                // Price = FinalPrice / (1 + TaxRate/100)
                const taxableValue = priceAfterDiscount / (1 + item.tax_rate / 100);
                itemTax = priceAfterDiscount - taxableValue;
                itemFinalTotal = priceAfterDiscount;
                subtotal += taxableValue;
            } else {
                itemTax = priceAfterDiscount * (item.tax_rate / 100);
                itemFinalTotal = priceAfterDiscount + itemTax;
                subtotal += priceAfterDiscount;
            }

            totalTax += itemTax;
            totalDiscount += itemDiscount;
            item.total = itemFinalTotal;
        });

        const rawTotal = subtotal + totalTax;
        const roundedTotal = Math.round(rawTotal);
        const roundOff = roundedTotal - rawTotal;

        return {
            amount: subtotal,
            tax_amount: totalTax,
            discount_amount: totalDiscount,
            total_amount: roundedTotal,
            round_off: roundOff
        };
    };

    const handleClientChange = (value) => {
        const selectedCustomer = customers.find(c => c.name === value);
        if (selectedCustomer) {
            setFormData({
                ...formData,
                client_name: selectedCustomer.name,
                client_email: selectedCustomer.email || '',
                client_gstin: selectedCustomer.gstin || '',
                billing_address: selectedCustomer.company || '', // Fallback or if there's an address field
                shipping_address: selectedCustomer.company || ''
            });
        } else {
            setFormData({ ...formData, client_name: value });
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
        
        const totals = calculateTotals(newItems, formData.tax_type);
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
        const totals = calculateTotals(newItems, formData.tax_type);
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
        onSuccess: (data) => {
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

        const payload = {
            ...formData,
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
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Receipt size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Billing Center</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage client invoices and accounts receivable.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={20} />
                    Generate Invoice
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Invoiced', value: `₹${totalInvoiced.toLocaleString()}`, icon: TrendingUp, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Paid Revenue', value: `₹${paidInvoiced.toLocaleString()}`, icon: CheckCircle2, color: '#0D9488', bg: '#F0FDFA' },
                    { label: 'Outstanding Balance', value: `₹${pendingInvoiced.toLocaleString()}`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Clients', value: new Set(invoices.map(i => i.client_name)).size, icon: User, color: '#064E3B', bg: '#ECFDF5' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Invoices List */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search client or invoice #..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                        />
                    </div>
                    <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Filter size={20} />
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#1B6B3A" /></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Client</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Due Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#1E293B' }}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{inv.client_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{inv.client_email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
                                                <Calendar size={14} />
                                                {inv.due_date}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#064E3B' }}>₹{inv.amount.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                background: inv.status === 'Paid' ? '#F0FDF4' : (inv.status === 'Unpaid' ? '#FEF2F2' : '#FFFBEB'),
                                                color: inv.status === 'Paid' ? '#15803D' : (inv.status === 'Unpaid' ? '#B91C1C' : '#B45309'),
                                                fontSize: '0.8rem', fontWeight: '800'
                                            }}>
                                                {inv.status === 'Paid' ? <CheckCircle2 size={12} /> : (inv.status === 'Overdue' ? <AlertTriangle size={12} /> : <Clock size={12} />)}
                                                {inv.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={() => handleViewHistory(inv)} title="Invoice Audit Trail" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><History size={16} /></button>
                                                <button onClick={() => handleSendReminder(inv)} title="WhatsApp Reminder" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #DCF2E4', background: 'white', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Share2 size={16} /></button>
                                                <button onClick={() => handlePrint(inv)} title="Print Invoice" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={16} /></button>
                                                <button onClick={() => handleEdit(inv)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '800px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Invoice #</label>
                                    <input readOnly type="text" value={formData.invoice_number} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Type</label>
                                    <select value={formData.invoice_type} onChange={(e) => setFormData({...formData, invoice_type: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option>GST</option>
                                        <option>Non-GST</option>
                                        <option>Proforma</option>
                                        <option>Quotation</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option>Draft</option>
                                        <option>Unpaid</option>
                                        <option>Paid</option>
                                        <option>Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Client Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        list="customer-suggestions"
                                        value={formData.client_name} 
                                        onChange={(e) => handleClientChange(e.target.value)} 
                                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }} 
                                    />
                                    <datalist id="customer-suggestions">
                                        {customers.map(c => (
                                            <option key={c.id} value={c.name}>{c.company || 'Personal'}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Client Email</label>
                                    <input required type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Client GSTIN</label>
                                    <input type="text" value={formData.client_gstin} onChange={(e) => setFormData({...formData, client_gstin: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }} placeholder="Optional" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Billing Address</label>
                                    <textarea value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '80px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                    <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '80px' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#064E3B' }}>Invoice Items</h3>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input 
                                                placeholder="Quick Scan / Barcode" 
                                                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem', width: '200px' }}
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
                                                            const totals = calculateTotals(newItems, formData.tax_type);
                                                            setFormData({ ...formData, items: newItems, ...totals });
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1B6B3A', background: '#F0FDF4', border: '1px solid #DCF2E4', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 80px 80px 100px 100px 40px', gap: '0.75rem', alignItems: 'end', padding: '1rem', background: '#F8FAFC', borderRadius: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>DESCRIPTION</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    list="inventory-suggestions"
                                                    value={item.description} 
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} 
                                                />
                                                <datalist id="inventory-suggestions">
                                                    {inventoryItems.map(inv => (
                                                        <option key={inv.id} value={inv.name}>{inv.sku} - Stock: {inv.quantity}</option>
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>HSN</label>
                                                <input type="text" value={item.hsn_code} onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>QTY</label>
                                                <input required type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>UNIT</label>
                                                <select value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                                                    <option>Pcs</option>
                                                    <option>Kg</option>
                                                    <option>Mtr</option>
                                                    <option>Box</option>
                                                    <option>Nos</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>PRICE (₹)</label>
                                                <input required type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>DISC %</label>
                                                <input type="number" value={item.discount_percent} onChange={(e) => handleItemChange(idx, 'discount_percent', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem' }}>GST %</label>
                                                <select value={item.tax_rate} onChange={(e) => handleItemChange(idx, 'tax_rate', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                                                    <option value={0}>0%</option>
                                                    <option value={5}>5%</option>
                                                    <option value={12}>12%</option>
                                                    <option value={18}>18%</option>
                                                    <option value={28}>28%</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => removeItem(idx)} style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer', paddingBottom: '1rem' }}><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', padding: '1.5rem', background: '#F0FDF4', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Payment Mode</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
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
                                                        flex: 1, padding: '0.75rem', borderRadius: '12px', 
                                                        border: formData.payment_mode === mode ? '2px solid #1B6B3A' : '1px solid #DCF2E4',
                                                        background: formData.payment_mode === mode ? '#1B6B3A' : 'white',
                                                        color: formData.payment_mode === mode ? 'white' : '#1B6B3A',
                                                        fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Select Bank Account Dropdown (Conditionally Rendered) */}
                                    {(formData.payment_mode === 'Bank' || formData.payment_mode === 'UPI') && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Select Bank Account</label>
                                            <select 
                                                required
                                                value={formData.bank_account_id}
                                                onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #DCF2E4', background: 'white' }}
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {bankAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.bank_name} - ₹{acc.current_balance.toLocaleString()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Paid Amount Input & Due Amount Indicator */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Paid Amount (₹)</label>
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
                                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #DCF2E4' }} 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Due Amount (₹)</label>
                                            <input 
                                                readonly
                                                type="number" 
                                                value={formData.total_amount - (formData.paid_amount || 0)} 
                                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #DCF2E4', background: '#F8FAFC', color: '#64748B' }} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Due Date</label>
                                        <input required type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #DCF2E4' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600' }}>
                                        <span>Subtotal:</span>
                                        <span>₹ {formData.amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600' }}>
                                        <span>Total Discount:</span>
                                        <span style={{ color: '#EF4444' }}>- ₹ {formData.discount_amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600' }}>
                                        <span>GST Amount:</span>
                                        <span>₹ {formData.tax_amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600' }}>
                                        <span>Round Off:</span>
                                        <span>₹ {formData.round_off.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#064E3B', fontWeight: '900', fontSize: '1.5rem', marginTop: '0.5rem', borderTop: '1px dashed #1B6B3A', paddingTop: '0.5rem' }}>
                                        <span>Total:</span>
                                        <span>₹ {formData.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.25rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                {createMutation.isLoading || updateMutation.isLoading ? <Loader2 className="animate-spin" /> : (editingInvoice ? 'Update Invoice' : 'Generate & Save Invoice')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Friendly Template (Hidden by default, shown via CSS @media print) */}
            {isPrinting && printData && (
                <div id="invoice-print-area" className="print-only" style={{ padding: '40px', color: '#000', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1B6B3A', marginBottom: '10px' }}>CLIKS BUSINESS</h1>
                            <p style={{ fontSize: '14px', color: '#444' }}>Tax Invoice / Bill of Supply</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '5px' }}>INVOICE</h2>
                            <p style={{ fontWeight: '700' }}>#{printData.invoice_number}</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>Date: {printData.due_date}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Billed To:</h3>
                            <p style={{ fontSize: '18px', fontWeight: '800', marginBottom: '5px' }}>{printData.client_name}</p>
                            <p style={{ fontSize: '14px' }}>{printData.client_email}</p>
                            {printData.client_gstin && <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '5px' }}>GSTIN: {printData.client_gstin}</p>}
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>Billing Address:</p>
                                <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{printData.billing_address || 'N/A'}</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Shipping Details:</h3>
                            <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{printData.shipping_address || 'N/A'}</p>
                            <div style={{ marginTop: '15px' }}>
                                <p style={{ fontSize: '14px' }}>Mode: {printData.payment_mode}</p>
                                <p style={{ fontSize: '14px' }}>Status: {printData.status}</p>
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#F0FDF4', borderBottom: '2px solid #1B6B3A' }}>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '800' }}>DESCRIPTION</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: '800' }}>HSN</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: '800' }}>QTY</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', fontWeight: '800' }}>PRICE</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', fontWeight: '800' }}>DISC</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', fontWeight: '800' }}>GST%</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', fontWeight: '800' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(typeof printData.items === 'string' ? JSON.parse(printData.items) : printData.items).map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #EEE' }}>
                                    <td style={{ padding: '15px', fontSize: '14px' }}>{item.description}</td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px' }}>{item.hsn_code || '-'}</td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px' }}>{item.quantity} {item.unit}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px' }}>₹{item.price.toLocaleString()}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px' }}>₹{(item.discount_amount || (item.quantity * item.price * (item.discount_percent / 100))).toLocaleString()}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px' }}>{item.tax_rate}%</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Subtotal</span>
                                <span style={{ fontWeight: '700' }}>₹{printData.amount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Total Discount</span>
                                <span style={{ fontWeight: '700', color: '#EF4444' }}>- ₹{printData.discount_amount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Tax (GST)</span>
                                <span style={{ fontWeight: '700' }}>₹{printData.tax_amount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Round Off</span>
                                <span style={{ fontWeight: '700' }}>₹{printData.round_off.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '10px', marginTop: '10px' }}>
                                <span style={{ fontSize: '18px', fontWeight: '900' }}>Grand Total</span>
                                <span style={{ fontSize: '18px', fontWeight: '900', color: '#1B6B3A' }}>₹{printData.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '100px', borderTop: '1px solid #EEE', paddingTop: '20px', textAlign: 'center' }}>
                                                        <p style={{ fontSize: '12px', color: '#999' }}>This is a computer generated invoice and does not require a physical signature.</p>
                                                        <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Thank you for your business!</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* History Lifecycle Modal */}
                                            {isHistoryModalOpen && selectedHistoryInvoice && (
                                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                                                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                                        <div style={{ padding: '1.75rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', fontFamily: "'Inter', sans-serif" }}>Invoice History</h3>
                                                                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem', fontFamily: "'Inter', sans-serif" }}>Audit trail for {selectedHistoryInvoice.invoice_number}</p>
                                                            </div>
                                                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
                                                        </div>
                                                        <div style={{ padding: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #E2E8F0' }}>
                                                                {/* Event 1 */}
                                                                <div style={{ position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', left: '-1.95rem', top: '0.25rem', width: '14px', height: '14px', borderRadius: '50%', background: '#1B6B3A', border: '4px solid #F0FDF4' }}></div>
                                                                    <h4 style={{ fontWeight: '750', fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Invoice Generated</h4>
                                                                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>Invoice created successfully as {selectedHistoryInvoice.invoice_type || 'GST'} with base amount ₹{selectedHistoryInvoice.amount.toLocaleString()}.</p>
                                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '0.35rem', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>May 06, 2026 at 10:00 AM</span>
                                                                </div>
                                                                {/* Event 2 */}
                                                                <div style={{ position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', left: '-1.95rem', top: '0.25rem', width: '14px', height: '14px', borderRadius: '50%', background: '#0D9488', border: '4px solid #F0FDFA' }}></div>
                                                                    <h4 style={{ fontWeight: '750', fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Tax & Discounts Applied</h4>
                                                                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>GST of ₹{(selectedHistoryInvoice.tax_amount || 0).toLocaleString()} and Discount of ₹{(selectedHistoryInvoice.discount_amount || 0).toLocaleString()} were successfully processed.</p>
                                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '0.35rem', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>May 06, 2026 at 10:05 AM</span>
                                                                </div>
                                                                {/* Event 3 */}
                                                                <div style={{ position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', left: '-1.95rem', top: '0.25rem', width: '14px', height: '14px', borderRadius: '50%', background: selectedHistoryInvoice.status === 'Paid' ? '#1B6B3A' : '#EF4444', border: selectedHistoryInvoice.status === 'Paid' ? '4px solid #F0FDF4' : '4px solid #FEF2F2' }}></div>
                                                                    <h4 style={{ fontWeight: '750', fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Payment Status: {selectedHistoryInvoice.status.toUpperCase()}</h4>
                                                                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                                                                        {selectedHistoryInvoice.status === 'Paid' 
                                                                            ? `Full payment of ₹${selectedHistoryInvoice.total_amount ? selectedHistoryInvoice.total_amount.toLocaleString() : selectedHistoryInvoice.amount.toLocaleString()} received via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                                                            : `Awaiting pending payment of ₹${selectedHistoryInvoice.total_amount ? selectedHistoryInvoice.total_amount.toLocaleString() : selectedHistoryInvoice.amount.toLocaleString()} via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                                                        }
                                                                    </p>
                                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '0.35rem', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>May 06, 2026 at 10:10 AM</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#064E3B', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Close Trail</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
        </div>
    );
};

export default BusinessBilling;
