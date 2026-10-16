import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, productsService } from '../services';
import { useCurrency, useAuth } from '../context';
import {
    Building, Plus, Search, MapPin, Phone, Mail, ArrowRightLeft,
    Package, CheckCircle2, AlertCircle, Edit3, Trash2, Store,
    X, RefreshCw, Layers, ShieldCheck, ChevronRight, BarChart3
} from 'lucide-react';
import '../App.css';

const BusinessBranches = () => {
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('branches'); // 'branches' | 'stock' | 'transfers'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranchForStock, setSelectedBranchForStock] = useState(null);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
    const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');

    // Form States
    const [branchForm, setBranchForm] = useState({
        name: '',
        code: '',
        invoice_prefix: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        gstin: '',
        is_main_branch: false
    });

    const [transferForm, setTransferForm] = useState({
        from_branch_id: '',
        to_branch_id: '',
        product_id: '',
        quantity: 1,
        notes: ''
    });

    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Queries
    const { data: branches = [], isLoading: isLoadingBranches, refetch: refetchBranches } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getBranches
    });

    const activeBranchesList = Array.isArray(branches) ? branches : (branches?.data || []);

    // Set default selected branch for stock tab
    useEffect(() => {
        if (activeBranchesList.length > 0 && !selectedBranchForStock) {
            const assigned = activeBranchesList.find(b => b.id === user?.branch_id) || activeBranchesList[0];
            setSelectedBranchForStock(assigned);
        }
    }, [activeBranchesList, user, selectedBranchForStock]);

    const { data: branchStock = [], isLoading: isLoadingStock, refetch: refetchStock } = useQuery({
        queryKey: ['branchStock', selectedBranchForStock?.id],
        queryFn: () => branchService.getBranchStock(selectedBranchForStock.id),
        enabled: !!selectedBranchForStock?.id
    });

    const { data: transfers = [], isLoading: isLoadingTransfers, refetch: refetchTransfers } = useQuery({
        queryKey: ['branchTransfers'],
        queryFn: branchService.getTransfers
    });

    // Mutations
    const createBranchMutation = useMutation({
        mutationFn: branchService.createBranch,
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            showToast('Showroom branch created successfully!');
            setIsCreateModalOpen(false);
            resetForm();
        },
        onError: (err) => showToast(err.message || 'Failed to create branch', 'error')
    });

    const updateBranchMutation = useMutation({
        mutationFn: ({ id, data }) => branchService.updateBranch(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            showToast('Branch updated successfully!');
            setEditingBranch(null);
            resetForm();
        },
        onError: (err) => showToast(err.message || 'Failed to update branch', 'error')
    });

    const deleteBranchMutation = useMutation({
        mutationFn: branchService.deleteBranch,
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            showToast('Branch removed successfully!');
        },
        onError: (err) => showToast(err.message || 'Failed to delete branch', 'error')
    });

    const transferMutation = useMutation({
        mutationFn: branchService.createTransfer,
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            queryClient.invalidateQueries(['branchStock']);
            queryClient.invalidateQueries(['branchTransfers']);
            showToast('Stock transferred successfully!');
            setIsTransferModalOpen(false);
            setTransferForm({ from_branch_id: '', to_branch_id: '', product_id: '', quantity: 1, notes: '' });
        },
        onError: (err) => showToast(err.message || 'Transfer failed', 'error')
    });

    const adjustStockMutation = useMutation({
        mutationFn: branchService.adjustBranchStock,
        onSuccess: () => {
            queryClient.invalidateQueries(['branchStock']);
            queryClient.invalidateQueries(['branches']);
            showToast('Branch stock updated!');
            setIsStockAdjustModalOpen(false);
        },
        onError: (err) => showToast(err.message || 'Failed to adjust stock', 'error')
    });

    const resetForm = () => {
        setBranchForm({
            name: '', code: '', invoice_prefix: '', address: '',
            city: '', state: '', pincode: '', phone: '', email: '', gstin: '', is_main_branch: false
        });
    };

    const handleSaveBranch = (e) => {
        e.preventDefault();
        if (editingBranch) {
            updateBranchMutation.mutate({ id: editingBranch.id, data: branchForm });
        } else {
            createBranchMutation.mutate(branchForm);
        }
    };

    const handleOpenEdit = (b) => {
        setEditingBranch(b);
        setBranchForm({
            name: b.name || '',
            code: b.code || '',
            invoice_prefix: b.invoice_prefix || '',
            address: b.address || '',
            city: b.city || '',
            state: b.state || '',
            pincode: b.pincode || '',
            phone: b.phone || '',
            email: b.email || '',
            gstin: b.gstin || '',
            is_main_branch: Boolean(b.is_main_branch)
        });
        setIsCreateModalOpen(true);
    };

    const handleExecuteTransfer = (e) => {
        e.preventDefault();
        if (!transferForm.from_branch_id || !transferForm.to_branch_id) {
            return showToast('Select both source and destination branches', 'error');
        }
        if (transferForm.from_branch_id === transferForm.to_branch_id) {
            return showToast('Source and destination cannot be the same', 'error');
        }
        if (!transferForm.product_id) {
            return showToast('Select a product to transfer', 'error');
        }

        const selectedProd = branchStock.find(p => String(p.id) === String(transferForm.product_id));
        const payload = {
            from_branch_id: parseInt(transferForm.from_branch_id),
            to_branch_id: parseInt(transferForm.to_branch_id),
            items: [{
                product_id: parseInt(transferForm.product_id),
                name: selectedProd?.name || 'Product',
                quantity: parseFloat(transferForm.quantity) || 1
            }],
            notes: transferForm.notes
        };

        transferMutation.mutate(payload);
    };

    const filteredBranches = activeBranchesList.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStock = Array.isArray(branchStock) ? branchStock.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div style={{ padding: '1.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
                    background: toast.type === 'error' ? '#EF4444' : '#10B981',
                    color: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontWeight: '600', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                            <Store size={22} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>
                                Showrooms & Multi-Branch
                            </h1>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                                Multi-outlet inventory control, showroom billing separation, and inter-branch stock transfers.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={() => {
                            setTransferForm(prev => ({
                                ...prev,
                                from_branch_id: activeBranchesList[0]?.id || '',
                                to_branch_id: activeBranchesList[1]?.id || ''
                            }));
                            setIsTransferModalOpen(true);
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0',
                            padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem',
                            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                    >
                        <ArrowRightLeft size={16} className="text-emerald-600" />
                        Transfer Stock
                    </button>

                    <button
                        onClick={() => {
                            setEditingBranch(null);
                            resetForm();
                            setIsCreateModalOpen(true);
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white', border: 'none', padding: '0.65rem 1.25rem',
                            borderRadius: '12px', fontWeight: '750', fontSize: '0.875rem',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                        }}
                    >
                        <Plus size={18} />
                        Add Showroom
                    </button>
                </div>
            </div>

            {/* KPI Metric Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Showrooms</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>
                        {activeBranchesList.length}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>Active retail branches</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Selected Branch</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '850', color: '#059669', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedBranchForStock?.name || 'Main Showroom'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>Code: {selectedBranchForStock?.code || 'MAIN'}</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Items in Branch</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>
                        {filteredStock.filter(s => s.branch_quantity > 0).length} / {filteredStock.length}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>Products stocked</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Inter-Branch Transfers</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>
                        {transfers.length}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>Completed movements</span>
                </div>
            </div>

            {/* Navigation Tabs & Search Bar */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setActiveTab('branches')}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'branches' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'branches' ? '#0F172A' : '#64748B',
                            boxShadow: activeTab === 'branches' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        Showrooms List ({activeBranchesList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'stock' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'stock' ? '#0F172A' : '#64748B',
                            boxShadow: activeTab === 'stock' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        Branch Stock Matrix
                    </button>
                    <button
                        onClick={() => setActiveTab('transfers')}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'transfers' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'transfers' ? '#0F172A' : '#64748B',
                            boxShadow: activeTab === 'transfers' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        Transfers Log ({transfers.length})
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1 1 300px', maxWidth: '400px' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder={activeTab === 'stock' ? "Search products in this branch..." : "Search showroom by name, code, city..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                                borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem',
                                outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* TAB 1: SHOWROOMS CARDS */}
            {activeTab === 'branches' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {isLoadingBranches ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading showrooms...</div>
                    ) : filteredBranches.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                            No showrooms match your search. Click "Add Showroom" to register a new outlet.
                        </div>
                    ) : (
                        filteredBranches.map(branch => (
                            <div
                                key={branch.id}
                                style={{
                                    background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
                                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)', position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: branch.is_main_branch ? '#ECFDF5' : '#F8FAFC',
                                            border: `1px solid ${branch.is_main_branch ? '#A7F3D0' : '#E2E8F0'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: branch.is_main_branch ? '#059669' : '#475569'
                                        }}>
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>{branch.name}</h3>
                                                {branch.is_main_branch === 1 && (
                                                    <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '6px', fontWeight: '800', border: '1px solid #A7F3D0' }}>
                                                        HQ / MAIN
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                                                Code: {branch.code} | Prefix: {branch.invoice_prefix || 'INV-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handleOpenEdit(branch)}
                                            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                                            title="Edit Showroom"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        {!branch.is_main_branch && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Deactivate branch "${branch.name}"?`)) {
                                                        deleteBranchMutation.mutate(branch.id);
                                                    }
                                                }}
                                                style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#EF4444' }}
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {branch.address ? `${branch.address}, ${branch.city || ''}` : 'Address not specified'}
                                        </span>
                                    </div>
                                    {branch.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                            <span>{branch.phone}</span>
                                        </div>
                                    )}
                                    {branch.gstin && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                                            <span>GSTIN: <strong>{branch.gstin}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', fontWeight: '600' }}>STOCK ITEMS</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>{branch.active_products_count || 0}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', fontWeight: '600' }}>TOTAL UNITS</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#10B981' }}>{branch.total_stock_quantity || 0}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedBranchForStock(branch);
                                            setActiveTab('stock');
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: '#F1F5F9', border: 'none', padding: '0.45rem 0.75rem',
                                            borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750', color: '#1E293B',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Stock <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB 2: BRANCH STOCK MATRIX */}
            {activeTab === 'stock' && (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    {/* Branch Selector Toolbar */}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Current Showroom:</span>
                            <select
                                value={selectedBranchForStock?.id || ''}
                                onChange={(e) => {
                                    const b = activeBranchesList.find(x => String(x.id) === e.target.value);
                                    if (b) setSelectedBranchForStock(b);
                                }}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0',
                                    fontWeight: '800', fontSize: '0.85rem', color: '#0F172A', background: '#FFFFFF',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                {activeBranchesList.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => refetchStock()}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '0.85rem 1.25rem' }}>Product Name</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>SKU / Barcode</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Selling Price</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Showroom Stock</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingStock ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading stock levels...</td>
                                    </tr>
                                ) : filteredStock.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                                            No products found for this branch. Create products under "Inventory → Products" to stock them here.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStock.map(p => {
                                        const qty = parseFloat(p.branch_quantity) || 0;
                                        const threshold = parseFloat(p.low_stock_threshold) || 5;
                                        const isLow = qty > 0 && qty <= threshold;
                                        const isOut = qty <= 0;

                                        return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>
                                                    {p.name}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>
                                                    {p.sku || p.barcode || '—'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                                                    <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                        {p.category || 'General'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#0F172A' }}>
                                                    {formatCurrency(p.selling_price || 0)}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '850', fontSize: '0.95rem', color: isOut ? '#EF4444' : (isLow ? '#F59E0B' : '#059669') }}>
                                                    {qty} {p.unit || 'PCS'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    {isOut ? (
                                                        <span style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                                            Out of Stock
                                                        </span>
                                                    ) : isLow ? (
                                                        <span style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                                            Available
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForAdjust(p);
                                                            setAdjustQty(String(qty));
                                                            setIsStockAdjustModalOpen(true);
                                                        }}
                                                        style={{
                                                            background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.4rem 0.75rem',
                                                            borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750', color: '#1E293B',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Adjust Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: INTER-BRANCH TRANSFERS */}
            {activeTab === 'transfers' && (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Transfer History Across Showrooms</span>
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                        >
                            <Plus size={15} /> New Transfer
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '0.85rem 1.25rem' }}>Transfer #</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Source Branch</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Destination</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Items Moved</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingTransfers ? (
                                    <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading transfer history...</td></tr>
                                ) : transfers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                                            No inter-branch transfers recorded yet. Click "New Transfer" to move stock between showrooms.
                                        </td>
                                    </tr>
                                ) : (
                                    transfers.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>
                                                {t.transfer_no || `TRF-${t.id}`}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#475569' }}>
                                                {t.from_branch_name} ({t.from_branch_code})
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#059669' }}>
                                                {t.to_branch_name} ({t.to_branch_code})
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                                                {t.items?.map((it, idx) => (
                                                    <span key={idx} style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '4px' }}>
                                                        {it.quantity}x {it.name}
                                                    </span>
                                                ))}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today'}
                                            </td>
                                            <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                                    {t.status?.toUpperCase() || 'COMPLETED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT BRANCH MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Store size={20} className="text-emerald-600" />
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>
                                    {editingBranch ? 'Edit Showroom Details' : 'Register New Showroom'}
                                </h2>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Showroom Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Tambaram Showroom"
                                    value={branchForm.name}
                                    onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Branch Code *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. SHW-TMB"
                                        value={branchForm.code}
                                        onChange={e => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Invoice Prefix
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TMB-"
                                        value={branchForm.invoice_prefix}
                                        onChange={e => setBranchForm({ ...branchForm, invoice_prefix: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Street / Commercial Complex"
                                    value={branchForm.address}
                                    onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chennai"
                                        value={branchForm.city}
                                        onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+91 98765 43210"
                                        value={branchForm.phone}
                                        onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Branch GSTIN (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 33AAAAA0000A1Z5"
                                    value={branchForm.gstin}
                                    onChange={e => setBranchForm({ ...branchForm, gstin: e.target.value.toUpperCase() })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
                                <input
                                    type="checkbox"
                                    id="is_main_branch"
                                    checked={branchForm.is_main_branch}
                                    onChange={e => setBranchForm({ ...branchForm, is_main_branch: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                                />
                                <label htmlFor="is_main_branch" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                                    Set as Primary / Main Showroom (HQ)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                                style={{
                                    width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white', border: 'none', padding: '0.85rem', borderRadius: '12px',
                                    fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                {editingBranch ? 'Save Showroom Changes' : 'Register Showroom'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* STOCK ADJUSTMENT MODAL */}
            {isStockAdjustModalOpen && selectedProductForAdjust && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                                Adjust Stock for Showroom
                            </h3>
                            <button onClick={() => setIsStockAdjustModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748B' }}>
                            Updating stock for <strong>{selectedProductForAdjust.name}</strong> at <strong>{selectedBranchForStock?.name}</strong>.
                        </p>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                Quantity Available
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={adjustQty}
                                onChange={e => setAdjustQty(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsStockAdjustModalOpen(false)}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    adjustStockMutation.mutate({
                                        branch_id: selectedBranchForStock.id,
                                        product_id: selectedProductForAdjust.id,
                                        quantity: parseFloat(adjustQty) || 0
                                    });
                                }}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#10B981', color: 'white', fontWeight: '750', cursor: 'pointer' }}
                            >
                                Save Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTER-BRANCH TRANSFER MODAL */}
            {isTransferModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowRightLeft size={20} className="text-emerald-600" />
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>
                                    Transfer Goods Across Showrooms
                                </h2>
                            </div>
                            <button onClick={() => setIsTransferModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Source Showroom (From)
                                    </label>
                                    <select
                                        required
                                        value={transferForm.from_branch_id}
                                        onChange={e => setTransferForm({ ...transferForm, from_branch_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Select Source</option>
                                        {activeBranchesList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Destination (To)
                                    </label>
                                    <select
                                        required
                                        value={transferForm.to_branch_id}
                                        onChange={e => setTransferForm({ ...transferForm, to_branch_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Select Destination</option>
                                        {activeBranchesList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Select Product
                                </label>
                                <select
                                    required
                                    value={transferForm.product_id}
                                    onChange={e => setTransferForm({ ...transferForm, product_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                >
                                    <option value="">Choose item to transfer...</option>
                                    {branchStock.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Available: {p.branch_quantity} {p.unit || 'PCS'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Transfer Quantity
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={transferForm.quantity}
                                    onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Transfer Notes / Reason
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Stock balancing for weekend sale"
                                    value={transferForm.notes}
                                    onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={transferMutation.isPending}
                                style={{
                                    width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white', border: 'none', padding: '0.85rem', borderRadius: '12px',
                                    fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                {transferMutation.isPending ? 'Executing Transfer...' : 'Confirm & Dispatch Transfer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BusinessBranches;
