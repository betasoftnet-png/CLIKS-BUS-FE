import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, productsService } from '../services';
import { useCurrency, useAuth } from '../context';
import {
    Building, Plus, Search, MapPin, Phone, Mail, ArrowRightLeft,
    Package, CheckCircle2, AlertCircle, Edit3, Trash2, Store,
    X, RefreshCw, Layers, ShieldCheck, ChevronRight, BarChart3,
    UserPlus, Users, AlertTriangle, Zap, RotateCcw, Box, ArrowDownLeft,
    Tag, Percent, Award, CreditCard, Clock, Check, XCircle, History, Sparkles, DollarSign, Gift, FileText, ArrowUpRight
} from 'lucide-react';
import '../App.css';

const BusinessBranches = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();

    const isOwner = !user?.is_sub_id && user?.role !== 'sub_id' && user?.role !== 'SUB_ID';

    // Strictly Owner Only - immediately redirect managers and staff
    if (user && !isOwner) {
        return <Navigate to="/dashboard" replace />;
    }

    const [activeTab, setActiveTab] = useState('branches'); // 'branches' | 'stock' | 'low_stock' | 'transfers'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranchForStock, setSelectedBranchForStock] = useState(null);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
    const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');

    // Low stock selections for batch auto-requisition
    const [selectedLowStockIds, setSelectedLowStockIds] = useState([]);

    // Showroom Manager prompt after showroom creation
    const [newlyCreatedBranch, setNewlyCreatedBranch] = useState(null);
    const [isManagerPromptModalOpen, setIsManagerPromptModalOpen] = useState(false);

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

    const [returnForm, setReturnForm] = useState({
        from_branch_id: '',
        to_branch_id: '',
        product_id: '',
        quantity: 1,
        return_reason: 'Damaged Goods / Packaging Defect',
        notes: ''
    });

    // Sales & Customer Module States
    const [promoBranchFilter, setPromoBranchFilter] = useState('');
    const [promoStatusFilter, setPromoStatusFilter] = useState('');
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [rejectingPromo, setRejectingPromo] = useState(null);
    const [rejectionReasonText, setRejectionReasonText] = useState('');
    const [promoForm, setPromoForm] = useState({
        branch_id: '',
        title: '',
        promotion_type: 'PERCENTAGE',
        discount_value: '',
        applies_to: 'ALL_PRODUCTS',
        target_id: '',
        target_name: '',
        min_order_amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        reason: ''
    });

    const [isIssueCreditModalOpen, setIsIssueCreditModalOpen] = useState(false);
    const [creditForm, setCreditForm] = useState({
        customer_id: '',
        branch_id: '',
        amount: '',
        transaction_type: 'STORE_CREDIT_ISSUED',
        reason: 'Customer Return / Exchange Note',
        notes: ''
    });

    const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
    const [isCustomerHistoryModalOpen, setIsCustomerHistoryModalOpen] = useState(false);

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

    // Advanced Inventory: Low-stock query & replenishment intelligence
    const { data: lowStockResponse, isLoading: isLoadingLowStock, refetch: refetchLowStock } = useQuery({
        queryKey: ['branchLowStock', selectedBranchForStock?.id],
        queryFn: () => branchService.getBranchLowStock(selectedBranchForStock.id),
        enabled: !!selectedBranchForStock?.id
    });

    const lowStockData = lowStockResponse?.data || lowStockResponse || {};
    const lowStockItems = Array.isArray(lowStockData?.items) ? lowStockData.items : [];
    const lowStockSummary = lowStockData?.summary || { total_low_stock_items: 0, out_of_stock_count: 0, fulfillable_from_main_count: 0 };
    const mainBranchInfo = lowStockData?.main_branch;

    // Sales & Customer Queries
    const { data: promotionsResponse = [], isLoading: isLoadingPromotions, refetch: refetchPromotions } = useQuery({
        queryKey: ['branchPromotions', promoBranchFilter, promoStatusFilter],
        queryFn: () => branchService.getShowroomPromotions({
            branch_id: promoBranchFilter || undefined,
            status: promoStatusFilter || undefined
        })
    });
    const promotionsList = Array.isArray(promotionsResponse) ? promotionsResponse : (promotionsResponse?.data || []);

    const { data: crossBranchCustomersResponse = [], isLoading: isLoadingCrossCustomers, refetch: refetchCrossCustomers } = useQuery({
        queryKey: ['crossBranchCustomers', selectedBranchForStock?.id],
        queryFn: () => branchService.getCrossBranchCustomers({
            branch_id: selectedBranchForStock?.id || undefined
        })
    });
    const crossCustomersList = Array.isArray(crossBranchCustomersResponse) ? crossBranchCustomersResponse : (crossBranchCustomersResponse?.data || []);

    const { data: customerHistory = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['customerHistory', selectedCustomerForHistory?.id],
        queryFn: () => branchService.getCustomerCrossBranchHistory(selectedCustomerForHistory?.id),
        enabled: !!selectedCustomerForHistory?.id && isCustomerHistoryModalOpen
    });
    const customerHistoryList = Array.isArray(customerHistory) ? customerHistory : (customerHistory?.data || []);

    const { data: allProductsData = [] } = useQuery({
        queryKey: ['allProductsForPromos'],
        queryFn: productsService.getProducts,
        staleTime: 60000
    });
    const allProductsList = Array.isArray(allProductsData) ? allProductsData : (allProductsData?.data || []);

    // Mutations
    const createBranchMutation = useMutation({
        mutationFn: branchService.createBranch,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['branches']);
            showToast('Showroom branch created successfully!');
            setIsCreateModalOpen(false);

            // Extract newly created branch info
            const created = (data && (data.data || data.id)) ? (data.data || data) : { name: variables?.name };
            const branchId = created?.id || data?.id || null;
            const branchName = created?.name || variables?.name || 'New Showroom';

            resetForm();
            setNewlyCreatedBranch({ id: branchId, name: branchName, code: created?.code || variables?.code });
            setIsManagerPromptModalOpen(true);
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
            queryClient.invalidateQueries(['branchLowStock']);
            showToast('Stock transferred successfully!');
            setIsTransferModalOpen(false);
            setTransferForm({ from_branch_id: '', to_branch_id: '', product_id: '', quantity: 1, notes: '' });
        },
        onError: (err) => showToast(err.message || 'Transfer failed', 'error')
    });

    // Advanced Inventory Mutation: Reverse Transfer (Return damaged/dead stock to Main Warehouse)
    const reverseTransferMutation = useMutation({
        mutationFn: branchService.createReverseTransfer,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['branches']);
            queryClient.invalidateQueries(['branchStock']);
            queryClient.invalidateQueries(['branchTransfers']);
            queryClient.invalidateQueries(['branchLowStock']);
            showToast(data?.message || 'Reverse return to Main Showroom processed!');
            setIsReturnModalOpen(false);
            setReturnForm({
                from_branch_id: '',
                to_branch_id: '',
                product_id: '',
                quantity: 1,
                return_reason: 'Damaged Goods / Packaging Defect',
                notes: ''
            });
        },
        onError: (err) => showToast(err.message || 'Reverse return failed', 'error')
    });

    // Advanced Inventory Mutation: 1-Click Auto Requisition from Main Showroom
    const autoRequisitionMutation = useMutation({
        mutationFn: ({ branchId, items }) => branchService.createAutoRequisition(branchId, { items }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['branchLowStock']);
            queryClient.invalidateQueries(['branchStock']);
            queryClient.invalidateQueries(['purchases']);
            showToast(data?.message || '1-Click Auto-Requisition drafted to Main Showroom!');
            setSelectedLowStockIds([]);
        },
        onError: (err) => showToast(err.message || 'Failed to generate requisition', 'error')
    });

    const adjustStockMutation = useMutation({
        mutationFn: branchService.adjustBranchStock,
        onSuccess: () => {
            queryClient.invalidateQueries(['branchStock']);
            queryClient.invalidateQueries(['branches']);
            queryClient.invalidateQueries(['branchLowStock']);
            showToast('Branch stock updated!');
            setIsStockAdjustModalOpen(false);
        },
        onError: (err) => showToast(err.message || 'Failed to adjust stock', 'error')
    });

    // Sales & Customer Mutations
    const requestPromoMutation = useMutation({
        mutationFn: branchService.requestShowroomPromotion,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['branchPromotions']);
            showToast(data?.message || 'Showroom promotion submitted!');
            setIsPromoModalOpen(false);
            setPromoForm({
                branch_id: '',
                title: '',
                promotion_type: 'PERCENTAGE',
                discount_value: '',
                applies_to: 'ALL_PRODUCTS',
                target_id: '',
                target_name: '',
                min_order_amount: 0,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                reason: ''
            });
        },
        onError: (err) => showToast(err.message || 'Failed to submit promotion request', 'error')
    });

    const updatePromoStatusMutation = useMutation({
        mutationFn: ({ id, status, rejection_reason }) => branchService.updateShowroomPromotionStatus(id, { status, rejection_reason }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['branchPromotions']);
            showToast(data?.message || 'Promotion status updated!');
            setRejectingPromo(null);
            setRejectionReasonText('');
        },
        onError: (err) => showToast(err.message || 'Failed to update promotion', 'error')
    });

    const deletePromoMutation = useMutation({
        mutationFn: branchService.deleteShowroomPromotion,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['branchPromotions']);
            showToast(data?.message || 'Promotion deleted');
        },
        onError: (err) => showToast(err.message || 'Failed to delete promotion', 'error')
    });

    const issueCreditMutation = useMutation({
        mutationFn: ({ customerId, payload }) => branchService.issueCrossBranchStoreCredit(customerId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['crossBranchCustomers']);
            queryClient.invalidateQueries(['business-customers']);
            if (selectedCustomerForHistory?.id) {
                queryClient.invalidateQueries(['customerHistory', selectedCustomerForHistory.id]);
            }
            showToast(data?.message || 'Store credit issued successfully!');
            setIsIssueCreditModalOpen(false);
            setCreditForm({
                customer_id: '',
                branch_id: '',
                amount: '',
                transaction_type: 'STORE_CREDIT_ISSUED',
                reason: 'Customer Return / Exchange Note',
                notes: ''
            });
        },
        onError: (err) => showToast(err.message || 'Failed to issue store credit', 'error')
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

    const handleExecuteReturn = (e) => {
        e.preventDefault();
        if (!returnForm.from_branch_id) {
            return showToast('Select source showroom for return', 'error');
        }
        if (!returnForm.product_id) {
            return showToast('Select an item to return', 'error');
        }

        const selectedProd = branchStock.find(p => String(p.id) === String(returnForm.product_id));
        const payload = {
            from_branch_id: parseInt(returnForm.from_branch_id),
            to_branch_id: returnForm.to_branch_id ? parseInt(returnForm.to_branch_id) : undefined,
            items: [{
                product_id: parseInt(returnForm.product_id),
                name: selectedProd?.name || 'Product',
                quantity: parseFloat(returnForm.quantity) || 1
            }],
            return_reason: returnForm.return_reason,
            notes: returnForm.notes
        };

        reverseTransferMutation.mutate(payload);
    };

    const handle1ClickAutoRequisition = (singleItem = null) => {
        if (!selectedBranchForStock?.id) return;
        if (selectedBranchForStock?.is_main_branch) {
            return showToast('Main Showroom is the central warehouse and cannot draft requisition to itself', 'error');
        }

        let itemsPayload = null;
        if (singleItem) {
            itemsPayload = [{
                product_id: singleItem.product_id || singleItem.id,
                quantity: singleItem.suggested_reorder_qty,
                unit_price: singleItem.purchase_price
            }];
        } else if (selectedLowStockIds.length > 0) {
            itemsPayload = lowStockItems
                .filter(it => selectedLowStockIds.includes(it.id))
                .map(it => ({
                    product_id: it.id,
                    quantity: it.suggested_reorder_qty,
                    unit_price: it.purchase_price
                }));
        }

        autoRequisitionMutation.mutate({
            branchId: selectedBranchForStock.id,
            items: itemsPayload
        });
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
                        onClick={() => navigate('/manage-subids')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0',
                            padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem',
                            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        title="Manage Sub-IDs and Showroom Managers"
                    >
                        <Users size={16} className="text-emerald-600" />
                        Showroom Managers
                    </button>

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
                            const nonMain = activeBranchesList.find(b => !b.is_main_branch) || activeBranchesList[0];
                            const main = activeBranchesList.find(b => b.is_main_branch) || activeBranchesList[0];
                            setReturnForm(prev => ({
                                ...prev,
                                from_branch_id: selectedBranchForStock && !selectedBranchForStock.is_main_branch ? selectedBranchForStock.id : (nonMain?.id || ''),
                                to_branch_id: main?.id || ''
                            }));
                            setIsReturnModalOpen(true);
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3',
                            padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: '750', fontSize: '0.875rem',
                            cursor: 'pointer', boxShadow: '0 1px 3px rgba(225, 29, 72, 0.08)'
                        }}
                    >
                        <RotateCcw size={16} />
                        Return Goods to Main
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
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

                <div 
                    onClick={() => setActiveTab('low_stock')}
                    style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: lowStockSummary.total_low_stock_items > 0 ? '1px solid #FCD34D' : '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: lowStockSummary.total_low_stock_items > 0 ? '#D97706' : '#64748B', textTransform: 'uppercase' }}>Low Stock Alerts</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '850', color: lowStockSummary.total_low_stock_items > 0 ? '#D97706' : '#0F172A', marginTop: '4px' }}>
                                {lowStockSummary.total_low_stock_items}
                            </div>
                        </div>
                        {lowStockSummary.total_low_stock_items > 0 && (
                            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                {lowStockSummary.out_of_stock_count} critical
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '600' }}>Click to auto-replenish →</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Transfers & Returns</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>
                        {transfers.length}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>Log movements</span>
                </div>
            </div>

            {/* Navigation Tabs & Search Bar */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
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
                        onClick={() => setActiveTab('low_stock')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'low_stock' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'low_stock' ? '#7C3AED' : '#64748B',
                            boxShadow: activeTab === 'low_stock' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        <Zap size={15} color={activeTab === 'low_stock' ? '#7C3AED' : '#94A3B8'} />
                        Low Stock & Auto-Reorder
                        {lowStockItems.length > 0 && (
                            <span style={{
                                background: activeTab === 'low_stock' ? '#EDE9FE' : '#FEF3C7',
                                color: activeTab === 'low_stock' ? '#7C3AED' : '#D97706',
                                padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800'
                            }}>
                                {lowStockItems.length}
                            </span>
                        )}
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
                        Transfers & Returns Log ({transfers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('promotions')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'promotions' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'promotions' ? '#059669' : '#64748B',
                            boxShadow: activeTab === 'promotions' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        <Tag size={15} color={activeTab === 'promotions' ? '#059669' : '#94A3B8'} />
                        Showroom Promos & Discounts
                        {promotionsList.filter(p => p.status === 'PENDING_APPROVAL').length > 0 && (
                            <span style={{
                                background: '#FEF3C7',
                                color: '#D97706',
                                padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800'
                            }}>
                                {promotionsList.filter(p => p.status === 'PENDING_APPROVAL').length} Pending
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('loyalty_credit')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                            fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            background: activeTab === 'loyalty_credit' ? '#FFFFFF' : 'transparent',
                            color: activeTab === 'loyalty_credit' ? '#2563EB' : '#64748B',
                            boxShadow: activeTab === 'loyalty_credit' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        <Users size={15} color={activeTab === 'loyalty_credit' ? '#2563EB' : '#94A3B8'} />
                        Cross-Branch Loyalty & Credit
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

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => navigate('/manage-subids', {
                                                state: {
                                                    branchId: branch.id,
                                                    branchName: branch.name,
                                                    autoCreate: true
                                                }
                                            })}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.45rem 0.75rem',
                                                borderRadius: '8px', fontSize: '0.75rem', fontWeight: '750', color: '#065F46',
                                                cursor: 'pointer'
                                            }}
                                            title={`Add Manager or Sub-ID for ${branch.name}`}
                                        >
                                            <UserPlus size={14} /> Add Manager
                                        </button>

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

            {/* TAB: LOW STOCK ALERTS & 1-CLICK AUTO-REORDER */}
            {activeTab === 'low_stock' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Branch Selector Toolbar & 1-Click Action Bar */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>
                                        Showroom Stock Depletion & Automated Replenishment
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                        Identifies branch inventory at or below threshold and calculates suggested indent requisitions from Main Showroom.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#475569' }}>Showroom:</span>
                                    <select
                                        value={selectedBranchForStock?.id || ''}
                                        onChange={(e) => {
                                            const b = activeBranchesList.find(x => String(x.id) === e.target.value);
                                            if (b) setSelectedBranchForStock(b);
                                        }}
                                        style={{
                                            padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0',
                                            fontWeight: '800', fontSize: '0.85rem', color: '#0F172A', background: '#FFFFFF',
                                            outline: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        {activeBranchesList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} {b.is_main_branch ? '⭐ (Main Central)' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={() => refetchLowStock()}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                                >
                                    <RefreshCw size={14} /> Refresh
                                </button>

                                <button
                                    disabled={lowStockItems.length === 0 || autoRequisitionMutation.isPending || selectedBranchForStock?.is_main_branch}
                                    onClick={() => handle1ClickAutoRequisition()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: lowStockItems.length === 0 || selectedBranchForStock?.is_main_branch ? '#CBD5E1' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                                        color: 'white', border: 'none', padding: '0.6rem 1.25rem',
                                        borderRadius: '10px', fontWeight: '800', fontSize: '0.875rem',
                                        cursor: lowStockItems.length === 0 || selectedBranchForStock?.is_main_branch ? 'not-allowed' : 'pointer',
                                        boxShadow: lowStockItems.length === 0 || selectedBranchForStock?.is_main_branch ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)'
                                    }}
                                >
                                    <Zap size={16} />
                                    {autoRequisitionMutation.isPending ? 'Drafting Requisition...' : `⚡ 1-Click Auto-Indent (${selectedLowStockIds.length > 0 ? selectedLowStockIds.length : lowStockItems.length} Items)`}
                                </button>
                            </div>
                        </div>

                        {selectedBranchForStock?.is_main_branch && (
                            <div style={{ marginTop: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontSize: '0.825rem' }}>
                                <AlertCircle size={16} />
                                <span>
                                    <strong>Note:</strong> <strong>{selectedBranchForStock.name}</strong> is designated as the Main Central Warehouse. It fulfills stock requests sent by retail showrooms. Switch to a retail branch above to view its low-stock alerts and draft replenishment requisitions.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 3 Metric Cards for Low Stock Intelligence */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Shortages</span>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#D97706', marginTop: '4px' }}>
                                        {lowStockSummary.total_low_stock_items}
                                    </div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={18} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>Products at or below threshold</span>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Critical Out-of-Stock</span>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#EF4444', marginTop: '4px' }}>
                                        {lowStockSummary.out_of_stock_count}
                                    </div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertCircle size={18} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '600' }}>Zero items remaining on shelf</span>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Main Showroom Ready</span>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#059669', marginTop: '4px' }}>
                                        {lowStockSummary.fulfillable_from_main_count} / {lowStockSummary.total_low_stock_items}
                                    </div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>Available for immediate dispatch</span>
                        </div>
                    </div>

                    {/* Low Stock Table */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={lowStockItems.length > 0 && selectedLowStockIds.length === lowStockItems.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedLowStockIds(lowStockItems.map(it => it.id));
                                        } else {
                                            setSelectedLowStockIds([]);
                                        }
                                    }}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                                    {selectedLowStockIds.length > 0 ? `${selectedLowStockIds.length} items selected for reorder` : 'Items Requiring Replenishment'}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                Central Warehouse: <strong>{mainBranchInfo?.name || 'Main Showroom'}</strong>
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '0.85rem 0.75rem', width: '40px', textAlign: 'center' }}></th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Product Details</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Current Showroom Stock</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Threshold</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Main Warehouse Stock</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Suggested Reorder</th>
                                        <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Replenish Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingLowStock ? (
                                        <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Analyzing showroom stock levels...</td></tr>
                                    ) : lowStockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#059669' }}>
                                                <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                                                <strong>All items well-stocked!</strong> No products are below threshold at this showroom.
                                            </td>
                                        </tr>
                                    ) : (
                                        lowStockItems.map(item => {
                                            const isSelected = selectedLowStockIds.includes(item.id);
                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: isSelected ? '#FAF5FF' : 'transparent' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedLowStockIds(prev => [...prev, item.id]);
                                                                } else {
                                                                    setSelectedLowStockIds(prev => prev.filter(x => x !== item.id));
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontWeight: '750', color: '#0F172A' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                            <span>SKU: {item.sku || '—'}</span>
                                                            <span>•</span>
                                                            <span>Category: {item.category || 'General'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontWeight: '850', fontSize: '0.95rem', color: item.urgency === 'CRITICAL_OUT_OF_STOCK' ? '#EF4444' : '#D97706' }}>
                                                                {item.current_quantity} {item.unit}
                                                            </span>
                                                            <span style={{
                                                                background: item.urgency === 'CRITICAL_OUT_OF_STOCK' ? '#FEF2F2' : '#FFFBEB',
                                                                color: item.urgency === 'CRITICAL_OUT_OF_STOCK' ? '#EF4444' : '#D97706',
                                                                border: `1px solid ${item.urgency === 'CRITICAL_OUT_OF_STOCK' ? '#FEE2E2' : '#FEF3C7'}`,
                                                                padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800'
                                                            }}>
                                                                {item.urgency === 'CRITICAL_OUT_OF_STOCK' ? 'OUT OF STOCK' : 'LOW STOCK'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: '600' }}>
                                                        {item.low_stock_threshold} {item.unit}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontWeight: '750', color: item.can_fulfill_from_main ? '#059669' : '#DC2626' }}>
                                                                {item.main_showroom_stock} {item.unit}
                                                            </span>
                                                            <span style={{
                                                                background: item.can_fulfill_from_main ? '#ECFDF5' : '#FEF2F2',
                                                                color: item.can_fulfill_from_main ? '#059669' : '#DC2626',
                                                                padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700'
                                                            }}>
                                                                {item.can_fulfill_from_main ? 'Sufficient' : 'Shortage at Main'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '3px 8px', borderRadius: '6px', fontWeight: '850', fontSize: '0.85rem' }}>
                                                            +{item.suggested_reorder_qty} {item.unit}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                        <button
                                                            disabled={selectedBranchForStock?.is_main_branch || autoRequisitionMutation.isPending}
                                                            onClick={() => handle1ClickAutoRequisition(item)}
                                                            style={{
                                                                background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#6D28D9',
                                                                padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                                                                cursor: selectedBranchForStock?.is_main_branch ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            Indent Now
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
                </div>
            )}

            {/* TAB: INTER-BRANCH TRANSFERS & REVERSE RETURNS */}
            {activeTab === 'transfers' && (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A' }}>Showroom Stock Movements & Return Logistics</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>Audit trail of forward branch transfers and damaged/dead stock returned to Main Warehouse.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    const nonMain = activeBranchesList.find(b => !b.is_main_branch) || activeBranchesList[0];
                                    const main = activeBranchesList.find(b => b.is_main_branch) || activeBranchesList[0];
                                    setReturnForm(prev => ({
                                        ...prev,
                                        from_branch_id: selectedBranchForStock && !selectedBranchForStock.is_main_branch ? selectedBranchForStock.id : (nonMain?.id || ''),
                                        to_branch_id: main?.id || ''
                                    }));
                                    setIsReturnModalOpen(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                            >
                                <RotateCcw size={14} /> Return Damaged / Dead Stock
                            </button>
                            <button
                                onClick={() => setIsTransferModalOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer' }}
                            >
                                <Plus size={15} /> New Transfer
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '0.85rem 1.25rem' }}>Transfer # & Type</th>
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
                                    transfers.map(t => {
                                        const isReverse = t.transfer_type === 'RETURN_TO_MAIN';
                                        return (
                                            <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '0.85rem 1.25rem' }}>
                                                    <div style={{ fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>
                                                        {t.transfer_no || `TRF-${t.id}`}
                                                    </div>
                                                    {isReverse ? (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <span style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                                                                REVERSE RETURN
                                                            </span>
                                                            <div style={{ fontSize: '0.72rem', color: '#9F1239', marginTop: '2px', fontWeight: '600' }}>
                                                                {t.return_reason || 'Damaged / Dead Stock'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                                                            FORWARD TRANSFER
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#475569' }}>
                                                    {t.from_branch_name} ({t.from_branch_code})
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: isReverse ? '#BE123C' : '#059669' }}>
                                                    {t.to_branch_name} ({t.to_branch_code})
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                                                    {t.items?.map((it, idx) => (
                                                        <span key={idx} style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '4px', display: 'inline-block', marginBottom: '2px' }}>
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
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: SHOWROOM-SPECIFIC PRICING & LOCAL PROMOTIONS */}
            {activeTab === 'promotions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Header Banner & Controls */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ maxWidth: '650px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                    LOCAL PRICING & PROMOTIONS
                                </span>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>
                                    Showroom-Specific Pricing & Festive Discounts
                                </h2>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.45 }}>
                                Standard products sell at base price, but specific showrooms can offer custom pricing, festive cuts, or regional tier discounts. 
                                Requested discounts require Main Branch / Owner approval and apply <strong>strictly in that showroom only</strong>.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    setPromoForm({
                                        branch_id: selectedBranchForStock?.id || activeBranchesList[0]?.id || '',
                                        title: '',
                                        promotion_type: 'PERCENTAGE',
                                        discount_value: '',
                                        applies_to: 'ALL_PRODUCTS',
                                        target_id: '',
                                        target_name: '',
                                        min_order_amount: 0,
                                        start_date: new Date().toISOString().split('T')[0],
                                        end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                                        reason: ''
                                    });
                                    setIsPromoModalOpen(true);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white', border: 'none', padding: '0.65rem 1.25rem',
                                    borderRadius: '12px', fontWeight: '750', fontSize: '0.875rem',
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                <Plus size={16} />
                                Request Local Discount
                            </button>
                        </div>
                    </div>

                    {/* Filter Pills Bar */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Store size={15} className="text-slate-500" />
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Showroom:</span>
                                <select
                                    value={promoBranchFilter}
                                    onChange={(e) => setPromoBranchFilter(e.target.value)}
                                    style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '600', color: '#0F172A', background: '#F8FAFC', outline: 'none' }}
                                >
                                    <option value="">All Showrooms</option>
                                    {activeBranchesList.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.code || 'BR'})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Status:</span>
                                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                                    {[
                                        { id: '', label: 'All' },
                                        { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
                                        { id: 'APPROVED', label: 'Approved / Active' },
                                        { id: 'REJECTED', label: 'Rejected' }
                                    ].map(st => (
                                        <button
                                            key={st.id}
                                            onClick={() => setPromoStatusFilter(st.id)}
                                            style={{
                                                padding: '3px 10px', borderRadius: '6px', border: 'none',
                                                fontSize: '0.75rem', fontWeight: '750', cursor: 'pointer',
                                                background: promoStatusFilter === st.id ? '#FFFFFF' : 'transparent',
                                                color: promoStatusFilter === st.id ? '#0F172A' : '#64748B',
                                                boxShadow: promoStatusFilter === st.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                                            }}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                            {promotionsList.length} promotion{promotionsList.length === 1 ? '' : 's'} recorded
                        </span>
                    </div>

                    {/* Promotions Table */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '0.85rem 1rem' }}>Showroom</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Promotion Details</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Discount / Price Override</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Applicable Scope</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Validity & Limits</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                        <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Owner Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPromotions ? (
                                        <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading showroom promotions...</td></tr>
                                    ) : promotionsList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                    <Tag size={24} />
                                                </div>
                                                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>No Showroom Promotions Found</div>
                                                <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1rem' }}>
                                                    Showroom managers can request festive discounts or local showroom pricing overrides tailored for regional competition.
                                                </p>
                                                <button
                                                    onClick={() => setIsPromoModalOpen(true)}
                                                    style={{
                                                        background: '#10B981', color: 'white', border: 'none', padding: '0.55rem 1.1rem',
                                                        borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    + Request First Promotion
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        promotionsList.map(p => {
                                            const isPending = p.status === 'PENDING_APPROVAL';
                                            const isApproved = p.status === 'APPROVED' || p.status === 'ACTIVE';
                                            const isRejected = p.status === 'REJECTED';
                                            const isExpired = p.status === 'EXPIRED';

                                            return (
                                                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', background: isPending ? '#FFFBEB' : 'transparent' }}>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', fontWeight: '800', fontSize: '0.75rem' }}>
                                                                <Store size={16} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', color: '#0F172A' }}>{p.branch_name}</div>
                                                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Showroom ID: #{p.branch_id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{p.title}</div>
                                                        {p.reason && (
                                                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>
                                                                "{p.reason}"
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>
                                                            Requested by: <strong>{p.requested_by || 'Showroom Staff'}</strong>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', color: '#047857', padding: '4px 8px', borderRadius: '8px', fontWeight: '850', fontSize: '0.875rem' }}>
                                                            {p.promotion_type === 'PERCENTAGE' && `${p.discount_value}% OFF`}
                                                            {p.promotion_type === 'FLAT_AMOUNT' && `${formatCurrency(p.discount_value)} FLAT OFF`}
                                                            {p.promotion_type === 'CUSTOM_PRICE' && `Fixed Price: ${formatCurrency(p.discount_value)}`}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            {p.applies_to === 'ALL_PRODUCTS' && '🌐 All Products'}
                                                            {p.applies_to === 'CATEGORY' && `📁 Category: ${p.target_name || 'Selected'}`}
                                                            {p.applies_to === 'SPECIFIC_PRODUCT' && `📦 Product: ${p.target_name || 'Selected'}`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: '600' }}>
                                                            {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Now'} - {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing'}
                                                        </div>
                                                        {p.min_order_amount > 0 && (
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                                                                Min Bill: {formatCurrency(p.min_order_amount)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        {isPending && (
                                                            <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <Clock size={12} /> Pending Approval
                                                            </span>
                                                        )}
                                                        {isApproved && (
                                                            <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <CheckCircle2 size={12} /> Active in Showroom
                                                            </span>
                                                        )}
                                                        {isRejected && (
                                                            <div>
                                                                <span style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECDD3', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                    <XCircle size={12} /> Rejected
                                                                </span>
                                                                {p.rejection_reason && (
                                                                    <div style={{ fontSize: '0.7rem', color: '#DC2626', marginTop: '2px' }} title={p.rejection_reason}>
                                                                        {p.rejection_reason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {isExpired && (
                                                            <span style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                                                                Expired
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                            {isPending && isOwner && (
                                                                <>
                                                                    <button
                                                                        disabled={updatePromoStatusMutation.isPending}
                                                                        onClick={() => updatePromoStatusMutation.mutate({ id: p.id, status: 'APPROVED' })}
                                                                        style={{
                                                                            background: '#059669', color: 'white', border: 'none',
                                                                            padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800',
                                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                                                        }}
                                                                        title="Approve promotion for this showroom"
                                                                    >
                                                                        <Check size={12} /> Approve
                                                                    </button>
                                                                    <button
                                                                        disabled={updatePromoStatusMutation.isPending}
                                                                        onClick={() => {
                                                                            setRejectingPromo(p);
                                                                            setRejectionReasonText('');
                                                                        }}
                                                                        style={{
                                                                            background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3',
                                                                            padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800',
                                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                                                        }}
                                                                        title="Reject promotion request"
                                                                    >
                                                                        <X size={12} /> Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {isApproved && isOwner && (
                                                                <button
                                                                    onClick={() => updatePromoStatusMutation.mutate({ id: p.id, status: 'PAUSED' })}
                                                                    style={{
                                                                        background: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1',
                                                                        padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Pause
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Delete this showroom promotion?')) {
                                                                        deletePromoMutation.mutate(p.id);
                                                                    }
                                                                }}
                                                                style={{
                                                                    background: 'transparent', color: '#94A3B8', border: 'none',
                                                                    padding: '4px', cursor: 'pointer', borderRadius: '4px'
                                                                }}
                                                                title="Delete promotion"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: UNIFIED CUSTOMER LOYALTY & CROSS-BRANCH STORE CREDIT */}
            {activeTab === 'loyalty_credit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Header Banner & Controls */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ maxWidth: '650px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                    CROSS-BRANCH RETAIL NETWORK
                                </span>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>
                                    Unified Customer Loyalty & Cross-Branch Store Credit
                                </h2>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.45 }}>
                                A customer registered at Showroom A can purchase, earn & redeem loyalty points, or redeem store credit notes at Showroom B. 
                                Product returns and credit exchanges can be honored at any branch across your retail chain seamlessly.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    setCreditForm({
                                        customer_id: crossCustomersList[0]?.id || '',
                                        branch_id: selectedBranchForStock?.id || activeBranchesList[0]?.id || '',
                                        amount: '',
                                        transaction_type: 'STORE_CREDIT_ISSUED',
                                        reason: 'Customer Return / Exchange Note',
                                        notes: ''
                                    });
                                    setIsIssueCreditModalOpen(true);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    color: 'white', border: 'none', padding: '0.65rem 1.25rem',
                                    borderRadius: '12px', fontWeight: '750', fontSize: '0.875rem',
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                                }}
                            >
                                <Plus size={16} />
                                Issue Store Credit Note
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards for Loyalty & Credit */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Unified Retail Customers</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0F172A', marginTop: '4px' }}>
                                {crossCustomersList.length}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: '600' }}>Active in multi-branch system</span>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Cross-Branch Store Credit</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#059669', marginTop: '4px' }}>
                                {formatCurrency(crossCustomersList.reduce((acc, c) => acc + (parseFloat(c.store_credit) || 0), 0))}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>Honorable at any showroom</span>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Unified Loyalty Points Pool</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '850', color: '#7C3AED', marginTop: '4px' }}>
                                {crossCustomersList.reduce((acc, c) => acc + (parseInt(c.loyalty_points) || 0), 0).toLocaleString()} pts
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: '600' }}>Redeemable across all counters</span>
                        </div>
                    </div>

                    {/* Customers Registry Table */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Cross-Branch Customer Registry & Balances</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Search customer above to filter list</span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '0.85rem 1rem' }}>Customer Profile</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Origin Showroom</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Cross-Branch Store Credit</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Unified Loyalty Points</th>
                                        <th style={{ padding: '0.85rem 1rem' }}>Cross-Branch Actions</th>
                                        <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>History Ledger</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingCrossCustomers ? (
                                        <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading customer balances...</td></tr>
                                    ) : crossCustomersList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                                                No customers registered yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        crossCustomersList
                                            .filter(c => 
                                                c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                c.phone?.includes(searchTerm) ||
                                                c.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(cust => (
                                                <tr key={cust.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{cust.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                            <span>{cust.phone || cust.phone_number || 'No phone'}</span>
                                                            {cust.email && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{cust.email}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '750', color: '#334155' }}>
                                                            <Store size={14} className="text-emerald-600" />
                                                            {cust.branch_name || 'Main Showroom'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontWeight: '850', fontSize: '0.95rem', color: (cust.store_credit > 0) ? '#059669' : '#64748B' }}>
                                                                {formatCurrency(cust.store_credit || 0)}
                                                            </span>
                                                            {(cust.store_credit > 0) && (
                                                                <span style={{ background: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                                                                    Active Credit
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: '#FAF5FF', color: '#7C3AED', border: '1px solid #E9D5FF', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem' }}>
                                                            {cust.loyalty_points || 0} pts
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                setCreditForm({
                                                                    customer_id: cust.id,
                                                                    branch_id: selectedBranchForStock?.id || activeBranchesList[0]?.id || '',
                                                                    amount: '',
                                                                    transaction_type: 'STORE_CREDIT_ISSUED',
                                                                    reason: 'Customer Return / Exchange Note',
                                                                    notes: ''
                                                                });
                                                                setIsIssueCreditModalOpen(true);
                                                            }}
                                                            style={{
                                                                background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                                                                padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '750',
                                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                            }}
                                                        >
                                                            <Plus size={13} /> Issue Credit / Return
                                                        </button>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCustomerForHistory(cust);
                                                                setIsCustomerHistoryModalOpen(true);
                                                            }}
                                                            style={{
                                                                background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1',
                                                                padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '750',
                                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                            }}
                                                        >
                                                            <History size={14} /> Audit Trail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

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

            {/* REVERSE TRANSFER MODAL: RETURN DAMAGED / DEAD STOCK TO MAIN WAREHOUSE */}
            {isReturnModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RotateCcw size={18} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>
                                        Return Goods to Main Warehouse
                                    </h2>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                                        Reverse inventory transfer for damaged, dead, or consolidated showroom stock.
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsReturnModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteReturn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Origin Showroom (Returning From) *
                                    </label>
                                    <select
                                        required
                                        value={returnForm.from_branch_id}
                                        onChange={e => setReturnForm({ ...returnForm, from_branch_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Select Showroom</option>
                                        {activeBranchesList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Destination (Central Hub)
                                    </label>
                                    <div style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A', fontWeight: '800', boxSizing: 'border-box' }}>
                                        {mainBranchInfo?.name || 'Main Showroom'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Return Classification / Reason *
                                </label>
                                <select
                                    required
                                    value={returnForm.return_reason}
                                    onChange={e => setReturnForm({ ...returnForm, return_reason: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', background: '#FFF' }}
                                >
                                    <option value="Damaged Goods / Packaging Defect">⚠️ Damaged Goods / Packaging Defect</option>
                                    <option value="Dead Stock / Slow Moving Inventory">⏳ Dead Stock / Slow Moving Inventory</option>
                                    <option value="Near Expiry / Expired Batch">📅 Near Expiry / Expired Batch</option>
                                    <option value="Showroom Consolidation">🏬 Showroom Stock Consolidation</option>
                                    <option value="Customer Return / Warranty Claim">🔄 Customer Return / Warranty Claim</option>
                                    <option value="Other">📝 Other Logistics Return</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Product to Return *
                                </label>
                                <select
                                    required
                                    value={returnForm.product_id}
                                    onChange={e => setReturnForm({ ...returnForm, product_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                >
                                    <option value="">Select item from branch...</option>
                                    {branchStock.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (In Branch: {p.branch_quantity} {p.unit || 'PCS'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Return Quantity *
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={returnForm.quantity}
                                    onChange={e => setReturnForm({ ...returnForm, quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Inspection Notes / Reason Details
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Scratched screen during transit, unbox defect"
                                    value={returnForm.notes}
                                    onChange={e => setReturnForm({ ...returnForm, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={reverseTransferMutation.isPending}
                                style={{
                                    width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                                    color: 'white', border: 'none', padding: '0.85rem', borderRadius: '12px',
                                    fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
                                }}
                            >
                                {reverseTransferMutation.isPending ? 'Processing Return...' : 'Confirm & Dispatch Return to Main Showroom'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: PROMPT TO ADD SHOWROOM MANAGER AFTER CREATING BRANCH */}
            {isManagerPromptModalOpen && newlyCreatedBranch && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '8px solid #F0FDF4' }}>
                            <CheckCircle2 size={36} />
                        </div>

                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: '850', color: '#0F172A' }}>
                            Showroom Added Successfully!
                        </h2>

                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem', margin: '1rem 0 1.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Showroom Name</span>
                            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                                {newlyCreatedBranch.name}
                            </div>
                            {newlyCreatedBranch.code && (
                                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>
                                    Code: {newlyCreatedBranch.code}
                                </span>
                            )}
                        </div>

                        <p style={{ margin: '0 0 1.75rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                            Would you like to create and assign a <strong>Showroom Manager (Sub-ID)</strong> for this showroom now? The manager will be locked to this branch's stock and POS sales counters.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    setIsManagerPromptModalOpen(false);
                                    navigate('/manage-subids', {
                                        state: {
                                            branchId: newlyCreatedBranch.id,
                                            branchName: newlyCreatedBranch.name,
                                            autoCreate: true
                                        }
                                    });
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    width: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white', border: 'none', padding: '0.85rem', borderRadius: '12px',
                                    fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                <UserPlus size={18} />
                                Create Showroom Manager Now
                            </button>

                            <button
                                onClick={() => setIsManagerPromptModalOpen(false)}
                                style={{
                                    width: '100%', background: '#F1F5F9', color: '#475569',
                                    border: 'none', padding: '0.75rem', borderRadius: '12px',
                                    fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer'
                                }}
                            >
                                I'll Add Manager Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: REQUEST SHOWROOM-SPECIFIC PROMOTION */}
            {isPromoModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>
                                        Request Showroom Promotion
                                    </h2>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Local showroom discounts require Main Branch approval</span>
                                </div>
                            </div>
                            <button onClick={() => setIsPromoModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!promoForm.branch_id) {
                                return showToast('Please select a target showroom', 'error');
                            }
                            if (!promoForm.discount_value || parseFloat(promoForm.discount_value) <= 0) {
                                return showToast('Please enter a valid discount value', 'error');
                            }
                            requestPromoMutation.mutate(promoForm);
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Target Showroom *
                                </label>
                                <select
                                    required
                                    value={promoForm.branch_id}
                                    onChange={e => {
                                        const b = activeBranchesList.find(x => String(x.id) === String(e.target.value));
                                        setPromoForm({ ...promoForm, branch_id: e.target.value, branch_name: b?.name || '' });
                                    }}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                >
                                    <option value="">Select Showroom Branch</option>
                                    {activeBranchesList.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.code || 'BR'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Promotion Campaign Title *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Diwali Festive Rush 10%, Metro Tier-1 Markdown"
                                    value={promoForm.title}
                                    onChange={e => setPromoForm({ ...promoForm, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Discount Type *
                                    </label>
                                    <select
                                        value={promoForm.promotion_type}
                                        onChange={e => setPromoForm({ ...promoForm, promotion_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                    >
                                        <option value="PERCENTAGE">Percentage (% Off)</option>
                                        <option value="FLAT_AMOUNT">Flat Amount Off ({formatCurrency(0).replace(/\d/g, '').trim()})</option>
                                        <option value="CUSTOM_PRICE">Custom Price Override</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        {promoForm.promotion_type === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount / Selling Amount *'}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder={promoForm.promotion_type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 200'}
                                        value={promoForm.discount_value}
                                        onChange={e => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Applicable Scope *
                                    </label>
                                    <select
                                        value={promoForm.applies_to}
                                        onChange={e => setPromoForm({ ...promoForm, applies_to: e.target.value, target_id: '', target_name: '' })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                    >
                                        <option value="ALL_PRODUCTS">Entire Showroom Catalog</option>
                                        <option value="CATEGORY">Specific Category</option>
                                        <option value="SPECIFIC_PRODUCT">Specific Product</option>
                                    </select>
                                </div>

                                <div>
                                    {promoForm.applies_to === 'ALL_PRODUCTS' && (
                                        <>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                Minimum Bill Amount
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="e.g. 500"
                                                value={promoForm.min_order_amount}
                                                onChange={e => setPromoForm({ ...promoForm, min_order_amount: parseFloat(e.target.value) || 0 })}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </>
                                    )}

                                    {promoForm.applies_to === 'CATEGORY' && (
                                        <>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                Category Name *
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Electronics, Festive Sweets"
                                                value={promoForm.target_name}
                                                onChange={e => setPromoForm({ ...promoForm, target_name: e.target.value })}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                        </>
                                    )}

                                    {promoForm.applies_to === 'SPECIFIC_PRODUCT' && (
                                        <>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                Target Product *
                                            </label>
                                            <select
                                                required
                                                value={promoForm.target_id}
                                                onChange={e => {
                                                    const prod = allProductsList.find(p => String(p.id) === String(e.target.value));
                                                    setPromoForm({
                                                        ...promoForm,
                                                        target_id: e.target.value,
                                                        target_name: prod?.name || ''
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                            >
                                                <option value="">Choose Product</option>
                                                {allProductsList.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.sku || 'SKU'})</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Start Date *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={promoForm.start_date}
                                        onChange={e => setPromoForm({ ...promoForm, start_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        End Date *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={promoForm.end_date}
                                        onChange={e => setPromoForm({ ...promoForm, end_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Business Justification & Local Market Reason *
                                </label>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder="Explain why this showroom requires this discount (e.g. Higher rent tier metro clearance, nearby competitor discount match, regional festival rush)"
                                    value={promoForm.reason}
                                    onChange={e => setPromoForm({ ...promoForm, reason: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                                💡 <strong>Strict Showroom Isolation:</strong> Once approved by the Main Branch, this discount will automatically be active and strictly applied only at the selected showroom's POS counter.
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsPromoModalOpen(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={requestPromoMutation.isPending}
                                    style={{
                                        flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: 'white', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                    }}
                                >
                                    {requestPromoMutation.isPending ? 'Submitting...' : 'Submit Promotion Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: REJECT PROMOTION DIALOG */}
            {rejectingPromo && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <XCircle size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>Reject Promotion Request</h3>
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{rejectingPromo.title} ({rejectingPromo.branch_name})</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                            Provide feedback to the showroom manager detailing why this promotion request cannot be approved:
                        </p>

                        <textarea
                            rows="3"
                            placeholder="e.g. Requested 25% discount exceeds showroom gross margin threshold"
                            value={rejectionReasonText}
                            onChange={(e) => setRejectionReasonText(e.target.value)}
                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem' }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setRejectingPromo(null)}
                                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={updatePromoStatusMutation.isPending}
                                onClick={() => {
                                    updatePromoStatusMutation.mutate({
                                        id: rejectingPromo.id,
                                        status: 'REJECTED',
                                        rejection_reason: rejectionReasonText || 'Declined by main branch management'
                                    });
                                }}
                                style={{
                                    flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none',
                                    background: '#DC2626', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ISSUE CROSS-BRANCH STORE CREDIT */}
            {isIssueCreditModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>
                                        Issue Store Credit Note
                                    </h2>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Usable across all showroom branches</span>
                                </div>
                            </div>
                            <button onClick={() => setIsIssueCreditModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!creditForm.customer_id) {
                                return showToast('Please select a customer', 'error');
                            }
                            if (!creditForm.amount || parseFloat(creditForm.amount) <= 0) {
                                return showToast('Please enter a valid credit amount', 'error');
                            }
                            issueCreditMutation.mutate({ customerId: creditForm.customer_id, payload: creditForm });
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Select Customer *
                                </label>
                                <select
                                    required
                                    value={creditForm.customer_id}
                                    onChange={e => setCreditForm({ ...creditForm, customer_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                >
                                    <option value="">Choose Customer</option>
                                    {crossCustomersList.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.phone || c.email || 'No contact'}) — Registered at {c.branch_name || 'Main'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Credit Amount *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="e.g. 500"
                                        value={creditForm.amount}
                                        onChange={e => setCreditForm({ ...creditForm, amount: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                        Issuing Showroom *
                                    </label>
                                    <select
                                        value={creditForm.branch_id}
                                        onChange={e => setCreditForm({ ...creditForm, branch_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                    >
                                        {activeBranchesList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Reason for Store Credit *
                                </label>
                                <select
                                    value={creditForm.reason}
                                    onChange={e => setCreditForm({ ...creditForm, reason: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', outline: 'none' }}
                                >
                                    <option value="Customer Return / Exchange Note">Customer Return / Exchange Note</option>
                                    <option value="Product Defect Allowance">Product Defect Allowance</option>
                                    <option value="Goodwill Voucher">Goodwill Voucher</option>
                                    <option value="Price Difference Match">Price Difference Match</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Notes & Reference Invoice (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Return of 1x Blue Shirt from Invoice #INV-1049"
                                    value={creditForm.notes}
                                    onChange={e => setCreditForm({ ...creditForm, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '10px', padding: '0.75rem', fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.4 }}>
                                🔄 <strong>Omni-Channel Store Credit:</strong> This amount is instantly added to the customer's balance and can be redeemed at checkout in any showroom across the chain.
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsIssueCreditModalOpen(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={issueCreditMutation.isPending}
                                    style={{
                                        flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                        color: 'white', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                                    }}
                                >
                                    {issueCreditMutation.isPending ? 'Issuing...' : 'Issue Store Credit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CUSTOMER CROSS-BRANCH AUDIT TRAIL LEDGER */}
            {isCustomerHistoryModalOpen && selectedCustomerForHistory && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '750px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <History size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>
                                        Cross-Branch Activity Ledger
                                    </h2>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                        {selectedCustomerForHistory.name} • Registered at <strong>{selectedCustomerForHistory.branch_name || 'Main Showroom'}</strong>
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsCustomerHistoryModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Customer Balance Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Available Store Credit</span>
                                <div style={{ fontSize: '1.4rem', fontWeight: '850', color: '#059669', marginTop: '2px' }}>
                                    {formatCurrency(selectedCustomerForHistory.store_credit || 0)}
                                </div>
                            </div>
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Loyalty Points</span>
                                <div style={{ fontSize: '1.4rem', fontWeight: '850', color: '#7C3AED', marginTop: '2px' }}>
                                    {selectedCustomerForHistory.loyalty_points || 0} pts
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Transaction Type</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Branches Involved</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Impact</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Invoice / Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingHistory ? (
                                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Fetching ledger entries...</td></tr>
                                    ) : customerHistoryList.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                                                No cross-branch store credit or loyalty events recorded yet for this customer.
                                            </td>
                                        </tr>
                                    ) : (
                                        customerHistoryList.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#64748B' }}>
                                                    {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800',
                                                        background: item.transaction_type.includes('REDEEMED') ? '#FEF2F2' : '#ECFDF5',
                                                        color: item.transaction_type.includes('REDEEMED') ? '#DC2626' : '#059669',
                                                        border: `1px solid ${item.transaction_type.includes('REDEEMED') ? '#FECDD3' : '#A7F3D0'}`
                                                    }}>
                                                        {item.transaction_type.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: '700' }}>
                                                        {item.source_branch_name || 'Main'} → <strong>{item.transacting_branch_name || 'Branch'}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: '850' }}>
                                                    {item.amount > 0 && (
                                                        <span style={{ color: item.transaction_type.includes('REDEEMED') ? '#DC2626' : '#059669' }}>
                                                            {item.transaction_type.includes('REDEEMED') ? '-' : '+'}{formatCurrency(item.amount)}
                                                        </span>
                                                    )}
                                                    {item.points > 0 && (
                                                        <span style={{ color: '#7C3AED', marginLeft: item.amount > 0 ? '6px' : '0' }}>
                                                            {item.transaction_type.includes('REDEEMED') ? '-' : '+'}{item.points} pts
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#64748B' }}>
                                                    <div>{item.notes || '—'}</div>
                                                    {item.reference_invoice_no && (
                                                        <span style={{ color: '#2563EB', fontWeight: '700' }}>Inv: {item.reference_invoice_no}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                            <button
                                onClick={() => setIsCustomerHistoryModalOpen(false)}
                                style={{
                                    background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1',
                                    padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                Close Ledger
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BusinessBranches;

