import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Layers, 
    Plus, 
    Search, 
    Trash2, 
    Copy, 
    Eye, 
    Calculator, 
    AlertCircle, 
    CheckCircle2, 
    X, 
    Edit, 
    Package, 
    RefreshCw, 
    Clock, 
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const BOMManagement = () => {
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

    const [selectedBom, setSelectedBom] = useState(null);

    // Form State for BOM Creation
    const [bomForm, setBomForm] = useState({
        name: '',
        bom_number: '',
        product_id: '',
        version: '1.0',
        output_quantity: 1,
        output_unit: 'pcs',
        expected_loss_percent: 0,
        labor_cost: 0,
        overhead_cost: 0,
        notes: '',
        components: [
            { component_product_id: '', quantity: 1, unit: 'pcs', waste_percent: 0, cost_per_unit: 0, notes: '' }
        ]
    });

    // Requirement Calculator state
    const [calcTargetQty, setCalcTargetQty] = useState(100);

    // Fetch BOMs
    const { data: boms = [], isLoading: isLoadingBoms } = useQuery({
        queryKey: ['boms', searchQuery, statusFilter],
        queryFn: () => manufacturingService.getBoms({
            q: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter
        })
    });

    // Fetch Products catalog for selection
    const { data: productsData = [] } = useQuery({
        queryKey: ['allProductsCatalog'],
        queryFn: () => manufacturingService.getProducts({ limit: 500 })
    });
    const products = Array.isArray(productsData) ? productsData : (productsData?.products || []);

    // Filter potential finished goods vs raw materials
    const finishedGoodsCandidates = products.filter(p => 
        p.item_role === 'finished_good' || p.item_role === 'semi_finished' || p.item_role === 'standard' || !p.item_role
    );
    const rawMaterialsCandidates = products.filter(p => 
        p.item_role === 'raw_material' || p.item_role === 'semi_finished' || p.item_role === 'standard' || !p.item_role
    );

    // Fetch Units
    const { data: standardUnits = [] } = useQuery({
        queryKey: ['standardUnits'],
        queryFn: () => manufacturingService.getUnits()
    });

    // Requirement Calculation query
    const { data: calcResult, isLoading: isCalculating, refetch: calculateRequirements } = useQuery({
        queryKey: ['bomRequirements', selectedBom?.id, calcTargetQty],
        queryFn: () => manufacturingService.calculateRequirements(selectedBom.id, calcTargetQty),
        enabled: !!selectedBom && isCalculatorModalOpen
    });

    // Create BOM Mutation
    const createBomMutation = useMutation({
        mutationFn: (data) => manufacturingService.createBom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boms'] });
            setIsCreateModalOpen(false);
            resetBomForm();
            alert('Bill of Materials (BOM) created successfully!');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to create BOM');
        }
    });

    // Duplicate BOM Mutation
    const duplicateBomMutation = useMutation({
        mutationFn: (id) => manufacturingService.duplicateBom(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boms'] });
            alert('BOM recipe cloned with new version tag!');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to duplicate BOM');
        }
    });

    // Delete BOM Mutation
    const deleteBomMutation = useMutation({
        mutationFn: (id) => manufacturingService.deleteBom(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boms'] });
            alert('BOM deleted/archived successfully');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to delete BOM');
        }
    });

    const resetBomForm = () => {
        setBomForm({
            name: '',
            bom_number: `BOM-${Date.now().toString().slice(-6)}`,
            product_id: '',
            version: '1.0',
            output_quantity: 1,
            output_unit: 'pcs',
            expected_loss_percent: 0,
            labor_cost: 0,
            overhead_cost: 0,
            notes: '',
            components: [
                { component_product_id: '', quantity: 1, unit: 'pcs', waste_percent: 0, cost_per_unit: 0, notes: '' }
            ]
        });
    };

    const handleAddComponentLine = () => {
        setBomForm(prev => ({
            ...prev,
            components: [
                ...prev.components,
                { component_product_id: '', quantity: 1, unit: 'pcs', waste_percent: 0, cost_per_unit: 0, notes: '' }
            ]
        }));
    };

    const handleRemoveComponentLine = (index) => {
        if (bomForm.components.length <= 1) {
            alert('A BOM requires at least one raw material component line.');
            return;
        }
        setBomForm(prev => ({
            ...prev,
            components: prev.components.filter((_, i) => i !== index)
        }));
    };

    const handleComponentChange = (index, field, value) => {
        setBomForm(prev => {
            const updated = [...prev.components];
            updated[index] = { ...updated[index], [field]: value };

            // Auto-fill price & unit if product changed
            if (field === 'component_product_id') {
                const prod = products.find(p => Number(p.id) === Number(value));
                if (prod) {
                    updated[index].cost_per_unit = prod.purchase_price || 0;
                    updated[index].unit = prod.unit || 'pcs';
                }
            }
            return { ...prev, components: updated };
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!bomForm.name.trim()) return alert('Please enter recipe/BOM name');
        if (!bomForm.product_id) return alert('Please select a finished product');

        for (const c of bomForm.components) {
            if (!c.component_product_id) return alert('All component lines must specify a raw material');
            if (Number(c.quantity) <= 0) return alert('Component quantities must be greater than 0');
        }

        createBomMutation.mutate(bomForm);
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '10px', color: '#1B6B3A' }}>
                            <Layers size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Bill of Materials (BOM) / Recipes
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                        Define raw material formulas, component quantities, scrap tolerances, and multi-level product assemblies.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetBomForm();
                        setIsCreateModalOpen(true);
                    }}
                    style={{
                        padding: '0.7rem 1.3rem',
                        border: 'none',
                        borderRadius: '10px',
                        background: '#1B6B3A',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)'
                    }}
                >
                    <Plus size={18} /> Create New Recipe (BOM)
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '1rem', background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text"
                        placeholder="Search by BOM name, recipe #, or finished product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.65rem 1rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: '#FFFFFF',
                        color: '#334155',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="draft">Draft Only</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* BOM Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {isLoadingBoms ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <p>Loading Bill of Materials directory...</p>
                    </div>
                ) : boms.length === 0 ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94A3B8' }}>
                        <Layers size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                        <h3 style={{ color: '#1E293B', fontWeight: '700', marginBottom: '0.25rem' }}>No Bill of Materials found</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Create a recipe to define how finished products are manufactured from raw materials.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '14px 16px' }}>BOM Number</th>
                                    <th style={{ padding: '14px 16px' }}>Recipe Name</th>
                                    <th style={{ padding: '14px 16px' }}>Finished Product</th>
                                    <th style={{ padding: '14px 16px' }}>Base Output</th>
                                    <th style={{ padding: '14px 16px' }}>Raw Materials</th>
                                    <th style={{ padding: '14px 16px' }}>Est. Unit Cost</th>
                                    <th style={{ padding: '14px 16px' }}>Version</th>
                                    <th style={{ padding: '14px 16px' }}>Status</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boms.map(bom => (
                                    <tr key={bom.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: '750', color: '#0F172A' }}>
                                            {bom.bom_number || `BOM-${bom.id}`}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: '700', color: '#1E293B' }}>{bom.name}</div>
                                            {bom.notes && <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{bom.notes}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: '600', color: '#334155' }}>{bom.product_name || 'N/A'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{bom.product_sku}</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                                            <b>{bom.output_quantity}</b> {bom.output_unit}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                                            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', fontWeight: '700', fontSize: '0.8rem' }}>
                                                {bom.component_count || 0} items
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16A34A' }}>
                                            {formatCurrency(bom.cost_per_unit || 0)}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#E2E8F0', color: '#475569', fontSize: '0.75rem', fontWeight: '700' }}>
                                                v{bom.version || '1.0'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                background: bom.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                                                color: bom.status === 'active' ? '#047857' : '#64748B'
                                            }}>
                                                {bom.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                {/* Calculate Requirements Button */}
                                                <button
                                                    title="Material Requirements Calculator"
                                                    onClick={() => {
                                                        setSelectedBom(bom);
                                                        setCalcTargetQty(100);
                                                        setIsCalculatorModalOpen(true);
                                                    }}
                                                    style={{ padding: '6px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700' }}
                                                >
                                                    <Calculator size={14} /> Calculate
                                                </button>

                                                {/* View Recipe */}
                                                <button
                                                    title="View Recipe Ingredients"
                                                    onClick={() => {
                                                        setSelectedBom(bom);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    style={{ padding: '6px', background: '#F1F5F9', border: 'none', borderRadius: '6px', color: '#475569', cursor: 'pointer' }}
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Duplicate Recipe */}
                                                <button
                                                    title="Duplicate / Create New Version"
                                                    onClick={() => {
                                                        if (confirm(`Clone recipe "${bom.name}" into a new version?`)) {
                                                            duplicateBomMutation.mutate(bom.id);
                                                        }
                                                    }}
                                                    style={{ padding: '6px', background: '#F1F5F9', border: 'none', borderRadius: '6px', color: '#0284C7', cursor: 'pointer' }}
                                                >
                                                    <Copy size={16} />
                                                </button>

                                                {/* Delete Recipe */}
                                                <button
                                                    title="Delete BOM"
                                                    onClick={() => {
                                                        if (confirm(`Delete BOM "${bom.name}"?`)) {
                                                            deleteBomMutation.mutate(bom.id);
                                                        }
                                                    }}
                                                    style={{ padding: '6px', background: '#FEF2F2', border: 'none', borderRadius: '6px', color: '#DC2626', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE BOM MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#064E3B', margin: 0 }}>Create Bill of Materials (Recipe)</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>Assign raw material components and unit proportions to manufacture a product</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Recipe Name *</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Veg Burger Standard Recipe" 
                                        value={bomForm.name} 
                                        onChange={(e) => setBomForm({ ...bomForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>BOM Number</label>
                                    <input 
                                        type="text" 
                                        value={bomForm.bom_number} 
                                        onChange={(e) => setBomForm({ ...bomForm, bom_number: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Finished or Semi-Finished Product *</label>
                                    <select
                                        value={bomForm.product_id}
                                        onChange={(e) => {
                                            const p = products.find(x => Number(x.id) === Number(e.target.value));
                                            setBomForm({
                                                ...bomForm,
                                                product_id: e.target.value,
                                                output_unit: p ? (p.unit || 'pcs') : bomForm.output_unit
                                            });
                                        }}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                                        required
                                    >
                                        <option value="">-- Select Product from Catalog --</option>
                                        {finishedGoodsCandidates.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.sku || 'No SKU'}) [{p.item_role || 'standard'}]</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Base Output Qty *</label>
                                    <input 
                                        type="number" 
                                        min="0.01" 
                                        step="any"
                                        value={bomForm.output_quantity} 
                                        onChange={(e) => setBomForm({ ...bomForm, output_quantity: parseFloat(e.target.value) || 1 })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Output Unit</label>
                                    <input 
                                        type="text" 
                                        value={bomForm.output_unit} 
                                        onChange={(e) => setBomForm({ ...bomForm, output_unit: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            {/* Additional Costs & Scrap */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Direct Labor (₹ per batch)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={bomForm.labor_cost}
                                        onChange={(e) => setBomForm({ ...bomForm, labor_cost: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Overhead (₹ per batch)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={bomForm.overhead_cost}
                                        onChange={(e) => setBomForm({ ...bomForm, overhead_cost: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Expected Process Loss (%)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={bomForm.expected_loss_percent}
                                        onChange={(e) => setBomForm({ ...bomForm, expected_loss_percent: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                                    />
                                </div>
                            </div>

                            {/* COMPONENT LINES TABLE */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>
                                        Raw Material Components Required
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={handleAddComponentLine}
                                        style={{ padding: '4px 10px', background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Plus size={14} /> Add Component
                                    </button>
                                </div>

                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left' }}>
                                            <tr>
                                                <th style={{ padding: '8px 10px', width: '35%' }}>Component (Raw Material)</th>
                                                <th style={{ padding: '8px 10px', width: '18%' }}>Quantity</th>
                                                <th style={{ padding: '8px 10px', width: '18%' }}>Unit</th>
                                                <th style={{ padding: '8px 10px', width: '20%' }}>Unit Cost (₹)</th>
                                                <th style={{ padding: '8px 10px', width: '9%', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bomForm.components.map((comp, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <select
                                                            value={comp.component_product_id}
                                                            onChange={(e) => handleComponentChange(idx, 'component_product_id', e.target.value)}
                                                            style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                            required
                                                        >
                                                            <option value="">-- Select Material --</option>
                                                            {rawMaterialsCandidates
                                                                .filter(p => Number(p.id) !== Number(bomForm.product_id)) // Prevent self selection
                                                                .map(p => (
                                                                    <option key={p.id} value={p.id}>
                                                                        {p.name} (Stock: {p.quantity} {p.unit})
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <input 
                                                            type="number"
                                                            step="any"
                                                            min="0.001"
                                                            value={comp.quantity}
                                                            onChange={(e) => handleComponentChange(idx, 'quantity', e.target.value)}
                                                            style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                            required
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <input 
                                                            type="text"
                                                            value={comp.unit}
                                                            onChange={(e) => handleComponentChange(idx, 'unit', e.target.value)}
                                                            placeholder="pcs, g, kg, ml..."
                                                            style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                            required
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <input 
                                                            type="number"
                                                            step="any"
                                                            value={comp.cost_per_unit}
                                                            onChange={(e) => handleComponentChange(idx, 'cost_per_unit', parseFloat(e.target.value) || 0)}
                                                            style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveComponentLine(idx)}
                                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createBomMutation.isPending}
                                    style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', background: '#1B6B3A', color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {createBomMutation.isPending ? 'Saving Recipe...' : 'Save Bill of Materials'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW BOM INGREDIENTS MODAL */}
            {isViewModalOpen && selectedBom && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#1B6B3A', textTransform: 'uppercase' }}>Recipe Details</span>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>{selectedBom.name}</h2>
                                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                    Output: <b>{selectedBom.output_quantity} {selectedBom.output_unit}</b> of {selectedBom.product_name}
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#1E293B', fontWeight: '800' }}>Components Formula Breakdown</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                                    <tr>
                                        <th style={{ padding: '8px 12px' }}>Material</th>
                                        <th style={{ padding: '8px 12px' }}>Quantity per Output</th>
                                        <th style={{ padding: '8px 12px' }}>Unit Cost</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedBom.items || []).map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: '600' }}>{item.component_name}</td>
                                            <td style={{ padding: '10px 12px' }}>{item.quantity} {item.unit}</td>
                                            <td style={{ padding: '10px 12px' }}>{formatCurrency(item.cost_per_unit || item.purchase_price || 0)}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                                                {formatCurrency((item.quantity || 0) * (item.cost_per_unit || item.purchase_price || 0))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cost Summary Box */}
                        <div style={{ padding: '1rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>Estimated Manufacturing Cost</div>
                                <div style={{ fontSize: '0.75rem', color: '#15803D' }}>Materials + Direct Labor + Overhead</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.35rem', fontWeight: '850', color: '#14532D' }}>
                                    {formatCurrency(selectedBom.total_cost || 0)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '700' }}>
                                    {formatCurrency(selectedBom.cost_per_unit || 0)} / {selectedBom.output_unit}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MATERIAL REQUIREMENTS & SHORTAGE CALCULATOR MODAL */}
            {isCalculatorModalOpen && selectedBom && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#0284C7', textTransform: 'uppercase' }}>Material Requirement Simulator</span>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>{selectedBom.name}</h2>
                                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                    Calculates raw material demand, unit conversions, and inventory shortages
                                </div>
                            </div>
                            <button onClick={() => setIsCalculatorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        {/* Target Quantity Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Enter Target Production Quantity ({selectedBom.output_unit || 'units'}):
                                </label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={calcTargetQty}
                                    onChange={(e) => setCalcTargetQty(Math.max(1, parseFloat(e.target.value) || 1))}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '750', color: '#1B6B3A' }}
                                />
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '300px' }}>
                                Formula: <i>Required = Component Qty × Target Qty / Base Output Qty</i>. Unit conversions applied automatically.
                            </div>
                        </div>

                        {/* Calculation Results Table */}
                        {isCalculating ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Calculating requirements...</div>
                        ) : calcResult ? (
                            <div>
                                {/* Status Banner */}
                                <div style={{
                                    padding: '0.9rem 1.2rem',
                                    borderRadius: '10px',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: calcResult.summary.can_produce ? '#ECFDF5' : '#FFFBEB',
                                    border: `1px solid ${calcResult.summary.can_produce ? '#A7F3D0' : '#FCD34D'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {calcResult.summary.can_produce ? (
                                            <CheckCircle2 size={22} color="#059669" />
                                        ) : (
                                            <AlertCircle size={22} color="#D97706" />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '800', color: calcResult.summary.can_produce ? '#065F46' : '#92400E', fontSize: '0.92rem' }}>
                                                {calcResult.summary.can_produce ? 'All Materials Available in Godown' : `${calcResult.summary.shortage_count} Material Shortage(s) Detected`}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: calcResult.summary.can_produce ? '#047857' : '#B45309' }}>
                                                {calcResult.summary.can_produce ? 'Stock is sufficient to release production immediately.' : 'Replenish or purchase shortage components before starting order.'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Estimated Batch Cost</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '850', color: '#1E293B' }}>{formatCurrency(calcResult.summary.grand_total_cost)}</div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                    <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                                        <tr>
                                            <th style={{ padding: '8px 10px' }}>Material</th>
                                            <th style={{ padding: '8px 10px' }}>Required Qty</th>
                                            <th style={{ padding: '8px 10px' }}>Godown Stock</th>
                                            <th style={{ padding: '8px 10px' }}>Shortage</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Est. Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calcResult.components.map((c, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', background: c.is_shortage ? '#FFFDF5' : 'transparent' }}>
                                                <td style={{ padding: '9px 10px', fontWeight: '600' }}>{c.component_name}</td>
                                                <td style={{ padding: '9px 10px', fontWeight: '750', color: '#0F172A' }}>
                                                    {c.planned_quantity} {c.bom_unit}
                                                </td>
                                                <td style={{ padding: '9px 10px', color: '#475569' }}>
                                                    {c.available_quantity} {c.stock_unit}
                                                </td>
                                                <td style={{ padding: '9px 10px' }}>
                                                    {c.is_shortage ? (
                                                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#FEE2E2', color: '#DC2626', fontWeight: '750', fontSize: '0.78rem' }}>
                                                            Short {c.shortage_quantity} {c.stock_unit}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#16A34A', fontWeight: '600' }}>Available</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: '700' }}>
                                                    {formatCurrency(c.total_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOMManagement;
