import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
    FolderTree, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Layers, 
    Package, 
    Image as ImageIcon, 
    Upload, 
    Check, 
    X, 
    ChevronRight, 
    ExternalLink, 
    Sparkles, 
    Eye, 
    Tag,
    Coffee,
    Pizza,
    ShoppingBag,
    Apple,
    Smartphone,
    Shirt,
    Milk,
    Cookie,
    CheckSquare,
    Square
} from 'lucide-react';
import { productsService } from '../services/productsService';
import { storageService } from '../services/storageService';

// Curated high quality presets for common retail/food categories
const PRESET_ICONS = [
    { label: 'Snacks & Bites', icon: Cookie, color: '#F59E0B', bg: '#FEF3C7', defaultName: 'Snacks' },
    { label: 'Tea & Coffee', icon: Coffee, color: '#B45309', bg: '#FDE68A', defaultName: 'Tea & Coffee' },
    { label: 'Beverages', icon: Pizza, color: '#EF4444', bg: '#FEE2E2', defaultName: 'Beverages' },
    { label: 'Dairy & Milk', icon: Milk, color: '#3B82F6', bg: '#DBEAFE', defaultName: 'Dairy Products' },
    { label: 'Fresh Produce', icon: Apple, color: '#10B981', bg: '#D1FAE5', defaultName: 'Fresh Produce' },
    { label: 'Groceries', icon: ShoppingBag, color: '#8B5CF6', bg: '#EDE9FE', defaultName: 'Groceries' },
    { label: 'Electronics', icon: Smartphone, color: '#0284C7', bg: '#E0F2FE', defaultName: 'Electronics' },
    { label: 'Apparel', icon: Shirt, color: '#EC4899', bg: '#FCE7F3', defaultName: 'Apparel & Fashion' },
];

const PRESET_IMAGES = [
    { label: 'Snacks Tray', url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80' },
    { label: 'Tea Cup', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80' },
    { label: 'Coffee Beans', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80' },
    { label: 'Cold Drinks', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
    { label: 'Bakery & Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
    { label: 'Biscuits & Cookies', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80' },
    { label: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
    { label: 'Dairy & Cheese', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80' }
];

// Client-side image compressor: ensures uploaded covers are compact (~25KB)
// preventing network timeouts, large payloads, or 413 errors on save
const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.82) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
};

const BusinessCategories = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterParentId, setFilterParentId] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'tree'

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [bannerMessage, setBannerMessage] = useState(null);

    // Inline View Category Products state (stays in Categories tab without navigating away)
    const [viewingCategoryProducts, setViewingCategoryProducts] = useState(null);
    const [categoryProductSearch, setCategoryProductSearch] = useState('');
    const [expandedGroupIds, setExpandedGroupIds] = useState({});

    const toggleGroupExpand = (groupId) => {
        setExpandedGroupIds(prev => ({
            ...prev,
            [groupId]: prev[groupId] === false ? true : false
        }));
    };

    // Form data state
    const [formData, setFormData] = useState({
        category_name: '',
        parent_id: '',
        description: '',
        image_url: '',
        is_active: 1
    });

    // Fetch categories query
    const { 
        data: categoriesData, 
        isLoading, 
        isError,
        refetch 
    } = useQuery({
        queryKey: ['product_categories'],
        queryFn: () => productsService.getCategories(),
        staleTime: 0
    });

    // Fetch products list to enable assigning uncategorized & parent products during category creation
    const { data: rawProducts = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts(),
        staleTime: 1000 * 60 * 2
    });

    const productsList = useMemo(() => {
        if (Array.isArray(rawProducts)) return rawProducts;
        if (rawProducts?.products && Array.isArray(rawProducts.products)) return rawProducts.products;
        if (rawProducts?.items && Array.isArray(rawProducts.items)) return rawProducts.items;
        if (rawProducts?.data && Array.isArray(rawProducts.data)) return rawProducts.data;
        return [];
    }, [rawProducts]);

    // Product assignment state inside category modal
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [productSearchQuery, setProductSearchQuery] = useState('');

    // All categories list from API
    const allCategories = useMemo(() => {
        if (!categoriesData) return [];
        return categoriesData.categories || [];
    }, [categoriesData]);

    // Subcategories list (categories that have a parent_id)
    const subgroups = useMemo(() => {
        if (!categoriesData) return [];
        return categoriesData.subgroups || allCategories.filter(c => !!c.parent_id);
    }, [categoriesData, allCategories]);

    // Extract top-level groups and attach matched subcategories robustly
    const groups = useMemo(() => {
        if (!categoriesData) return [];
        const rawGroups = categoriesData.groups || allCategories.filter(c => !c.parent_id);

        return rawGroups.map(g => {
            const gId = Number(g.id);
            const gName = (g.category_name || '').trim().toLowerCase();

            // Match subcategories by parent_id OR parent_name
            const existingSubs = Array.isArray(g.subcategories) ? g.subcategories : [];
            const matchedFromSubs = subgroups.filter(sg => {
                const pId = sg.parent_id !== null && sg.parent_id !== undefined ? Number(sg.parent_id) : null;
                const pName = (sg.parent_name || '').trim().toLowerCase();
                return (pId !== null && pId === gId) || (pName && pName === gName);
            });

            // Deduplicate subcategories by ID
            const map = new Map();
            [...existingSubs, ...matchedFromSubs].forEach(sc => {
                const k = sc.id ? Number(sc.id) : (sc.category_name || Math.random());
                map.set(k, sc);
            });

            return {
                ...g,
                subcategories: Array.from(map.values())
            };
        });
    }, [categoriesData, allCategories, subgroups]);

    // Filter products for the inline "View Category Products" modal (stays in Categories tab)
    const categoryMatchedProducts = useMemo(() => {
        if (!viewingCategoryProducts) return [];
        const targetId = Number(viewingCategoryProducts.id);
        const targetName = (viewingCategoryProducts.category_name || '').trim().toLowerCase();
        const isSub = Boolean(viewingCategoryProducts.parent_id);

        const list = productsList.filter(p => {
            if (isSub) {
                return (
                    p.subgroup_id === targetId ||
                    p.category?.toLowerCase() === targetName ||
                    p.category?.toLowerCase().endsWith(` > ${targetName}`)
                );
            } else {
                return (
                    (p.group_id === targetId && (!p.subgroup_id || p.subgroup_id === 0)) ||
                    p.category?.toLowerCase() === targetName ||
                    p.category?.toLowerCase().startsWith(`${targetName} >`)
                );
            }
        });

        if (!categoryProductSearch.trim()) return list;
        const q = categoryProductSearch.toLowerCase().trim();
        return list.filter(p => 
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q)
        );
    }, [viewingCategoryProducts, productsList, categoryProductSearch]);

    // Helper: detect if a product has no category (uncategorized)
    const isUncategorized = (p) => {
        if (!p) return false;
        const cat = (p.category || '').trim().toLowerCase();
        const hasNoGroupId = !p.group_id || p.group_id === 0;
        const hasNoSubgroupId = !p.subgroup_id || p.subgroup_id === 0;
        if (!hasNoGroupId || !hasNoSubgroupId) return false;
        return !cat || cat === 'uncategorized' || cat === 'none' || cat === 'general' || cat === 'no category' || cat === '-';
    };

    const isSubcategoryMode = Boolean(formData.parent_id);
    const selectedParentId = formData.parent_id ? Number(formData.parent_id) : null;
    const selectedParentGroup = useMemo(() => {
        if (!selectedParentId) return null;
        return groups.find(g => Number(g.id) === selectedParentId) || null;
    }, [groups, selectedParentId]);

    // Filter eligible products for the modal:
    // 1. Top-Level Main Category: ONLY products with no category
    // 2. Subcategory: products in the selected parent category + products with no category
    const eligibleProducts = useMemo(() => {
        if (!productsList || !Array.isArray(productsList)) return [];

        return productsList.filter(p => {
            // If editing, always keep products currently assigned to this category visible & selectable
            if (editingCategory) {
                if (isSubcategoryMode) {
                    if (p.subgroup_id === editingCategory.id) return true;
                } else {
                    if (p.group_id === editingCategory.id && (!p.subgroup_id || p.subgroup_id === 0)) return true;
                    if (p.category && p.category.toLowerCase() === editingCategory.category_name?.toLowerCase()) return true;
                }
            }

            if (isSubcategoryMode) {
                // In Subcategory mode:
                // 1. Products that were added to the parent category previously
                const inParentCategory = (
                    p.group_id === selectedParentId ||
                    (selectedParentGroup && (
                        p.category?.toLowerCase() === selectedParentGroup.category_name?.toLowerCase() ||
                        p.category?.toLowerCase().startsWith(selectedParentGroup.category_name?.toLowerCase() + ' >')
                    ))
                );
                if (inParentCategory) return true;

                // 2. Products with NO category
                if (isUncategorized(p)) return true;

                return false;
            } else {
                // In Top-Level Main Category mode:
                // ONLY products with NO category can be displayed!
                return isUncategorized(p);
            }
        });
    }, [productsList, isSubcategoryMode, selectedParentId, selectedParentGroup, editingCategory]);

    const filteredEligibleProducts = useMemo(() => {
        if (!productSearchQuery.trim()) return eligibleProducts;
        const q = productSearchQuery.toLowerCase().trim();
        return eligibleProducts.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.barcode || '').toLowerCase().includes(q)
        );
    }, [eligibleProducts, productSearchQuery]);

    const handleToggleProduct = (id) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredEligibleProducts.map(p => p.id);
        const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedProductIds.includes(id));
        if (allSelected) {
            setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    // Create / Update mutation
    const saveCategoryMutation = useMutation({
        mutationFn: async (payload) => {
            if (editingCategory?.id) {
                return await productsService.updateCategory(editingCategory.id, payload);
            } else {
                return await productsService.createCategory(payload);
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['product_categories'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            setIsModalOpen(false);
            setEditingCategory(null);
            setSelectedProductIds([]);
            setProductSearchQuery('');
            showBanner(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
        },
        onError: (err) => {
            const msg = err.response?.data?.message || err.message || 'Operation failed';
            showBanner(msg, 'error');
        }
    });

    // Delete mutation with instant optimistic UI update
    const deleteCategoryMutation = useMutation({
        mutationFn: async (id) => {
            return await productsService.deleteCategory(id);
        },
        onMutate: async (deletedId) => {
            // Cancel outgoing queries so background fetches don't overwrite optimistic delete
            await queryClient.cancelQueries({ queryKey: ['product_categories'] });

            // Snapshot previous cache state
            const previousData = queryClient.getQueryData(['product_categories']);

            // Optimistically remove from query cache immediately (0ms delay)
            queryClient.setQueryData(['product_categories'], (old) => {
                if (!old) return old;
                const idNum = Number(deletedId);

                const filterItems = (list) => (list || []).filter(item => Number(item.id) !== idNum);

                const updatedGroups = (old.groups || [])
                    .filter(g => Number(g.id) !== idNum)
                    .map(g => ({
                        ...g,
                        subcategories: filterItems(g.subcategories)
                    }));

                return {
                    ...old,
                    categories: filterItems(old.categories),
                    groups: updatedGroups,
                    subgroups: filterItems(old.subgroups)
                };
            });

            setDeleteConfirmId(null);
            return { previousData };
        },
        onError: (err, deletedId, context) => {
            // Rollback on server error
            if (context?.previousData) {
                queryClient.setQueryData(['product_categories'], context.previousData);
            }
            const msg = err.response?.data?.message || err.message || 'Failed to remove category';
            showBanner(msg, 'error');
            setDeleteConfirmId(null);
        },
        onSuccess: () => {
            showBanner('Category removed successfully', 'success');
        },
        onSettled: () => {
            // Re-sync with server state
            queryClient.invalidateQueries({ queryKey: ['product_categories'], refetchType: 'all' });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
        }
    });

    // Seed starter categories mutation
    const seedStarterMutation = useMutation({
        mutationFn: async () => {
            // 1. Create Snacks
            const snacks = await productsService.createCategory({
                category_name: 'Snacks',
                description: 'Quick bites, savory refreshments, and hot & cold beverages',
                image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
                is_active: 1
            });

            const snacksId = snacks?.id || snacks?.data?.id;

            if (snacksId) {
                // Subcategories of Snacks: Tea, Coffee, Biscuits, Chips
                await productsService.createCategory({
                    category_name: 'Tea',
                    parent_id: snacksId,
                    description: 'Black, Green, Herbal & Milk Tea selections',
                    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'
                });

                await productsService.createCategory({
                    category_name: 'Coffee',
                    parent_id: snacksId,
                    description: 'Espresso, Cappuccino, Filter coffee & brews',
                    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80'
                });

                await productsService.createCategory({
                    category_name: 'Biscuits & Cookies',
                    parent_id: snacksId,
                    description: 'Crunchy cookies, tea biscuits and bakery treats',
                    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80'
                });
            }

            // 2. Create Groceries
            const groceries = await productsService.createCategory({
                category_name: 'Groceries',
                description: 'Daily household food staples, grains, and pantry goods',
                image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
                is_active: 1
            });

            const grocId = groceries?.id || groceries?.data?.id;
            if (grocId) {
                await productsService.createCategory({
                    category_name: 'Dairy & Eggs',
                    parent_id: grocId,
                    description: 'Fresh milk, curd, cheese and farm eggs',
                    image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80'
                });
            }

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product_categories'] });
            showBanner('Starter categories (Snacks > Tea, Coffee, etc.) created successfully!', 'success');
        },
        onError: (err) => {
            showBanner(err.response?.data?.message || 'Failed to seed categories', 'error');
        }
    });

    const showBanner = (text, type = 'info') => {
        setBannerMessage({ text, type });
        setTimeout(() => setBannerMessage(null), 4000);
    };

    // Modal openers
    const handleOpenCreateModal = (preselectedParentId = '') => {
        saveCategoryMutation.reset();
        setEditingCategory(null);
        setSelectedProductIds([]);
        setProductSearchQuery('');
        setShowUrlInput(false);
        setFormData({
            category_name: '',
            parent_id: preselectedParentId ? String(preselectedParentId) : '',
            description: '',
            image_url: '',
            is_active: 1
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cat) => {
        saveCategoryMutation.reset();
        setEditingCategory(cat);
        setProductSearchQuery('');
        const isExternalUrl = cat.image_url && cat.image_url.startsWith('http') && !cat.image_url.includes('/cdn/') && !cat.image_url.includes('/storage/');
        setShowUrlInput(Boolean(isExternalUrl));
        const parentId = cat.parent_id ? Number(cat.parent_id) : null;
        
        // Find existing assigned products to pre-populate selection
        const currentAssigned = productsList.filter(p => {
            if (parentId) {
                // Subcategory
                return p.subgroup_id === cat.id || 
                       p.category === cat.category_name || 
                       (p.category && p.category.endsWith(` > ${cat.category_name}`));
            } else {
                // Main category
                return (p.group_id === cat.id && (!p.subgroup_id || p.subgroup_id === 0)) ||
                       p.category === cat.category_name;
            }
        }).map(p => p.id);

        setSelectedProductIds(currentAssigned);
        setFormData({
            category_name: cat.category_name || '',
            parent_id: cat.parent_id ? String(cat.parent_id) : '',
            description: cat.description || '',
            image_url: cat.image_url || '',
            is_active: cat.is_active !== undefined ? cat.is_active : 1
        });
        setIsModalOpen(true);
    };

    // Image Upload handler
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be under 10MB');
            return;
        }

        try {
            setIsUploadingImage(true);

            // Compress client-side to light, high-quality JPEG (~20KB)
            // Stored directly as data URI to guarantee 100% instant rendering on all devices,
            // complete portability, and zero reliance on unconfigured external CDN domains.
            const compressed = await compressImage(file, 600, 600, 0.82);
            if (compressed) {
                setFormData(prev => ({ ...prev, image_url: compressed }));
                setShowUrlInput(false);
            }
        } catch (err) {
            console.error('[Category Modal] Image upload error:', err);
            alert('Failed to process image. Please try another image.');
        } finally {
            setIsUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.category_name.trim()) {
            alert('Category name is required.');
            return;
        }

        const payload = {
            category_name: formData.category_name.trim(),
            parent_id: formData.parent_id ? Number(formData.parent_id) : null,
            description: formData.description?.trim() || null,
            image_url: formData.image_url?.trim() || null,
            is_active: Number(formData.is_active),
            product_ids: selectedProductIds
        };

        saveCategoryMutation.mutate(payload);
    };

    // Filter logic
    const filteredGroups = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return groups.filter(g => {
            const matchesParentFilter = filterParentId === 'all' || String(g.id) === filterParentId;
            if (!matchesParentFilter) return false;

            if (!query) return true;

            const nameMatches = g.category_name?.toLowerCase().includes(query);
            const descMatches = g.description?.toLowerCase().includes(query);
            const subMatches = g.subcategories?.some(sc => sc.category_name?.toLowerCase().includes(query));

            return nameMatches || descMatches || subMatches;
        });
    }, [groups, searchQuery, filterParentId]);

    const totalSubcategoriesCount = subgroups.length;
    const totalCategoriesCount = groups.length;
    const totalProductsCount = useMemo(() => {
        if (productsList && productsList.length > 0) return productsList.length;
        return groups.reduce((sum, c) => sum + (Number(c.product_count) || 0), 0);
    }, [productsList, groups]);

    return (
        <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F172A' }}>
            {/* Banner Notification */}
            {bannerMessage && (
                <div style={{
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    background: bannerMessage.type === 'error' ? '#FEF2F2' : '#ECFDF5',
                    border: `1px solid ${bannerMessage.type === 'error' ? '#FCA5A5' : '#6EE7B7'}`,
                    color: bannerMessage.type === 'error' ? '#991B1B' : '#065F46',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <span>{bannerMessage.text}</span>
                    <button onClick={() => setBannerMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
                </div>
            )}

            {/* Top Header & Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E8F5E9', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FolderTree size={22} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0, color: '#0F172A' }}>
                                Product Categories & Subcategories
                            </h1>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.86rem', color: '#64748B', fontWeight: '500' }}>
                                Organize your catalog into parent categories (e.g. <b>Snacks</b>) and nested subcategories (e.g. <b>Tea, Coffee</b>) with cover images.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {totalCategoriesCount === 0 && (
                        <button
                            type="button"
                            onClick={() => seedStarterMutation.mutate()}
                            disabled={seedStarterMutation.isPending}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.65rem 1.1rem',
                                borderRadius: '12px',
                                background: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                color: '#334155',
                                fontWeight: '750',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title="Load example hierarchy: Snacks > Tea, Coffee, etc."
                        >
                            <Sparkles size={16} color="#F59E0B" />
                            {seedStarterMutation.isPending ? 'Generating...' : 'Load Example Categories'}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => handleOpenCreateModal()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '12px',
                            background: '#1B6B3A',
                            border: 'none',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(27, 107, 58, 0.25)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={18} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* KPI Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.1rem 1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderTree size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Main Categories</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>{totalCategoriesCount}</div>
                    </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.1rem 1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subcategories</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>{totalSubcategoriesCount}</div>
                    </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.1rem 1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Catalog Products</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>{totalProductsCount}</div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search categories (e.g. Snacks, Coffee, Tea)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                                borderRadius: '10px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={filterParentId}
                        onChange={(e) => setFilterParentId(e.target.value)}
                        style={{
                            padding: '0.55rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#475569',
                            outline: 'none',
                            background: '#F8FAFC'
                        }}
                    >
                        <option value="all">All Main Categories</option>
                        {groups.map(g => (
                            <option key={g.id || g.category_name} value={String(g.id)}>
                                {g.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: viewMode === 'grid' ? '#1B6B3A' : '#FFFFFF',
                            color: viewMode === 'grid' ? '#FFFFFF' : '#64748B',
                            fontWeight: '750',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                        }}
                    >
                        Card Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('tree')}
                        style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: viewMode === 'tree' ? '#1B6B3A' : '#FFFFFF',
                            color: viewMode === 'tree' ? '#FFFFFF' : '#64748B',
                            fontWeight: '750',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                        }}
                    >
                        Tree View
                    </button>
                </div>
            </div>

            {/* Content Loading & Error States */}
            {isLoading && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
                    <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#1B6B3A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '0.75rem', fontWeight: '600' }}>Loading category taxonomy...</p>
                </div>
            )}

            {isError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '2rem', borderRadius: '16px', textAlign: 'center', color: '#991B1B' }}>
                    <p style={{ fontWeight: '750', fontSize: '1rem', margin: 0 }}>Failed to fetch categories</p>
                    <button onClick={() => refetch()} style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#991B1B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Try Again</button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredGroups.length === 0 && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px dashed #CBD5E1', padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#E8F5E9', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <FolderTree size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                        {searchQuery ? 'No categories matched your search' : 'No Categories Created Yet'}
                    </h3>
                    <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5' }}>
                        {searchQuery 
                            ? `Try clearing your search query "${searchQuery}" or search for another term.`
                            : 'Set up your category hierarchy to organize products effortlessly. Add main categories like "Snacks" and subcategories like "Tea" and "Coffee".'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => handleOpenCreateModal()}
                            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            + Create First Category
                        </button>
                        <button
                            type="button"
                            onClick={() => seedStarterMutation.mutate()}
                            disabled={seedStarterMutation.isPending}
                            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Load Starter Hierarchy
                        </button>
                    </div>
                </div>
            )}

            {/* Category Groups View */}
            {!isLoading && !isError && filteredGroups.length > 0 && viewMode === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {filteredGroups.map(group => {
                        const subcats = group.subcategories || [];
                        const isInactive = group.is_active === 0;

                        return (
                            <div 
                                key={group.id || group.category_name}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    opacity: isInactive ? 0.7 : 1
                                }}
                            >
                                {/* Cover Image Banner */}
                                <div style={{ position: 'relative', width: '100%', height: '140px', background: 'linear-gradient(135deg, #1B6B3A 0%, #0F3D20 100%)', overflow: 'hidden' }}>
                                    {group.image_url && !group.image_url.includes('beta-softnet.com') ? (
                                        <img 
                                            src={group.image_url} 
                                            alt={group.category_name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', opacity: 0.85 }}>
                                            <FolderTree size={48} />
                                        </div>
                                    )}

                                    {/* Overlay status chip */}
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                                        <span style={{ 
                                            padding: '0.2rem 0.55rem', 
                                            borderRadius: '6px', 
                                            fontSize: '0.72rem', 
                                            fontWeight: '800', 
                                            background: isInactive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(22, 163, 74, 0.9)', 
                                            color: '#FFFFFF',
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            {isInactive ? 'Inactive' : 'Main Category'}
                                        </span>
                                    </div>

                                    {/* Quick Actions overlay */}
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(group);
                                            }}
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.95)',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                color: '#0F172A',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                                fontSize: '0.74rem',
                                                fontWeight: '800'
                                            }}
                                            title="Edit Category Name & Picture"
                                        >
                                            <Edit2 size={13} color="#1B6B3A" /> Edit Name / Photo
                                        </button>
                                        {deleteConfirmId === (group.id || group.category_name) ? (
                                            <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '2px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                                                <button
                                                    type="button"
                                                    disabled={deleteCategoryMutation.isPending && deleteCategoryMutation.variables === group.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (group.id) {
                                                            deleteCategoryMutation.mutate(group.id);
                                                        } else {
                                                            showBanner('Cannot delete category without ID', 'error');
                                                        }
                                                    }}
                                                    style={{ 
                                                        border: 'none', 
                                                        background: '#EF4444', 
                                                        color: 'white', 
                                                        padding: '3px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.72rem', 
                                                        fontWeight: '800', 
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '3px'
                                                    }}
                                                >
                                                    {deleteCategoryMutation.isPending && deleteCategoryMutation.variables === group.id ? 'Deleting...' : 'Del?'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmId(null);
                                                    }}
                                                    style={{ border: 'none', background: '#E2E8F0', color: '#475569', padding: '3px 6px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmId(group.id || group.category_name);
                                                }}
                                                style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                                                title="Delete Category"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Body Information */}
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                                            {group.category_name}
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => setViewingCategoryProducts(group)}
                                            style={{ border: 'none', background: '#F0FDF4', color: '#1B6B3A', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #DCFCE7', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            title="Click to view products in this category"
                                        >
                                            <Package size={12} />
                                            {group.product_count || 0} Products
                                        </button>
                                    </div>

                                    {group.description && (
                                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0.85rem', lineHeight: '1.4' }}>
                                            {group.description}
                                        </p>
                                    )}

                                    {/* Subcategories Section */}
                                    <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Subcategories ({subcats.length})
                                            </span>
                                            {group.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCreateModal(group.id)}
                                                    style={{ 
                                                        border: 'none', 
                                                        background: 'transparent', 
                                                        color: '#1B6B3A', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: '800', 
                                                        cursor: 'pointer', 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '3px' 
                                                    }}
                                                >
                                                    <Plus size={12} /> Add Subcategory
                                                </button>
                                            )}
                                        </div>

                                        {subcats.length === 0 ? (
                                            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem' }}>
                                                No subcategories yet. (e.g. For snacks: add <b>Tea</b> or <b>Coffee</b>)
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                {subcats.map(sc => (
                                                    <div 
                                                        key={sc.id || sc.category_name}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: '#F8FAFC',
                                                            border: '1px solid #F1F5F9'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                                            {sc.image_url ? (
                                                                <img 
                                                                    src={sc.image_url} 
                                                                    alt={sc.category_name} 
                                                                    style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} 
                                                                />
                                                            ) : (
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.7rem' }}>
                                                                    🏷️
                                                                </div>
                                                            )}
                                                            <div style={{ minWidth: 0 }}>
                                                                <span style={{ fontSize: '0.82rem', fontWeight: '750', color: '#1E293B', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                    {sc.category_name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', shrink: 0 }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingCategoryProducts(sc)}
                                                                style={{ border: 'none', fontSize: '0.7rem', fontWeight: '700', color: '#1B6B3A', background: '#F0FDF4', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #DCFCE7', cursor: 'pointer' }}
                                                                title="Click to view products in this subcategory"
                                                            >
                                                                {sc.product_count || 0} items
                                                            </button>
                                                            {sc.id && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenEditModal(sc)}
                                                                        style={{ border: 'none', background: 'transparent', color: '#64748B', padding: '2px', cursor: 'pointer' }}
                                                                        title="Edit Subcategory"
                                                                    >
                                                                        <Edit2 size={12} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (window.confirm(`Delete subcategory "${sc.category_name}"?`)) {
                                                                                deleteCategoryMutation.mutate(sc.id);
                                                                            }
                                                                        }}
                                                                        style={{ border: 'none', background: 'transparent', color: '#EF4444', padding: '2px', cursor: 'pointer' }}
                                                                        title="Delete Subcategory"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Button: View Products & Quick Edit */}
                                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(group)}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                color: '#1B6B3A',
                                                fontSize: '0.76rem',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <Edit2 size={12} /> Edit Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewingCategoryProducts(group)}
                                            style={{
                                                border: 'none',
                                                background: '#F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.76rem',
                                                fontWeight: '800',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            title="View products in this category without leaving the page"
                                        >
                                            <Package size={13} color="#1B6B3A" /> View Products ({group.product_count || 0})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tree View Mode */}
            {!isLoading && !isError && filteredGroups.length > 0 && viewMode === 'tree' && (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 190px', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>
                        <div>Category Hierarchy</div>
                        <div>Type</div>
                        <div>Linked Products</div>
                        <div>Status</div>
                        <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredGroups.map(group => {
                            const subcats = group.subcategories || [];
                            const hasSubs = subcats.length > 0;
                            const isExpanded = expandedGroupIds[group.id] !== false; // expanded by default

                            return (
                                <React.Fragment key={group.id || group.category_name}>
                                    {/* Main Group Row */}
                                    <div style={{
                                        padding: '0.85rem 1.25rem',
                                        borderBottom: '1px solid #F1F5F9',
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr 190px',
                                        alignItems: 'center',
                                        background: '#FFFFFF'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            {hasSubs ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroupExpand(group.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#64748B' }}
                                                    title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                                                >
                                                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                                </button>
                                            ) : (
                                                <div style={{ width: '16px' }} />
                                            )}

                                            {group.image_url && !group.image_url.includes('beta-softnet.com') ? (
                                                <img src={group.image_url} alt={group.category_name} style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#E8F5E9', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FolderTree size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>{group.category_name}</span>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: '750', padding: '0.12rem 0.45rem', borderRadius: '6px', background: hasSubs ? '#DCFCE7' : '#F1F5F9', color: hasSubs ? '#166534' : '#64748B' }}>
                                                        {hasSubs ? `🌱 ${subcats.length} subcategories` : '0 subcategories'}
                                                    </span>
                                                </div>
                                                {group.description && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{group.description}</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', background: '#ECFDF5', color: '#065F46' }}>
                                                Main Category
                                            </span>
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setViewingCategoryProducts(group)}
                                                style={{ border: 'none', background: 'none', padding: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                                title="View products in this category"
                                            >
                                                <span>{group.product_count || 0} products</span>
                                                <ExternalLink size={11} />
                                            </button>
                                        </div>

                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '750', color: group.is_active === 0 ? '#EF4444' : '#16A34A' }}>
                                                ● {group.is_active === 0 ? 'Inactive' : 'Active'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => handleOpenCreateModal(group.id)} 
                                                title="Add Subcategory" 
                                                style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1px solid #DCFCE7', background: '#F0FDF4', color: '#1B6B3A', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                            >
                                                <Plus size={12} /> Sub
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleOpenEditModal(group)} 
                                                title="Edit Category Name & Picture" 
                                                style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >
                                                <Edit2 size={12} color="#1B6B3A" /> Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { 
                                                    if (window.confirm(`Delete "${group.category_name}"?`)) {
                                                        if (group.id) deleteCategoryMutation.mutate(group.id);
                                                    }
                                                }} 
                                                title="Delete Category" 
                                                style={{ padding: '0.35rem 0.5rem', borderRadius: '7px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nested Subcategories Rows */}
                                    {isExpanded && subcats.map(sc => (
                                        <div 
                                            key={sc.id || sc.category_name}
                                            style={{
                                                padding: '0.65rem 1.25rem 0.65rem 3.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr 190px',
                                                alignItems: 'center',
                                                background: '#F8FAFC'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>↳</span>
                                                {sc.image_url && !sc.image_url.includes('beta-softnet.com') ? (
                                                    <img src={sc.image_url} alt={sc.category_name} style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                        🏷️
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#334155' }}>
                                                    {sc.category_name}
                                                </span>
                                            </div>

                                            <div>
                                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '750', background: '#EFF6FF', color: '#1D4ED8' }}>
                                                    Subcategory
                                                </span>
                                            </div>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingCategoryProducts(sc)}
                                                    style={{ border: 'none', background: 'none', padding: 0, fontSize: '0.8rem', fontWeight: '700', color: '#1B6B3A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                                    title="View products in this subcategory"
                                                >
                                                    <span>{sc.product_count || 0} products</span>
                                                    <ExternalLink size={10} />
                                                </button>
                                            </div>

                                            <div>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: sc.is_active === 0 ? '#EF4444' : '#16A34A' }}>
                                                    ● {sc.is_active === 0 ? 'Inactive' : 'Active'}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleOpenEditModal(sc)} 
                                                    title="Edit Subcategory Name & Picture" 
                                                    style={{ padding: '0.3rem 0.65rem', borderRadius: '7px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Edit2 size={11} color="#1B6B3A" /> Edit
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => { 
                                                        if (window.confirm(`Delete subcategory "${sc.category_name}"?`)) {
                                                            if (sc.id) deleteCategoryMutation.mutate(sc.id);
                                                        }
                                                    }} 
                                                    title="Delete Subcategory" 
                                                    style={{ padding: '0.3rem 0.45rem', borderRadius: '7px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create / Edit Category Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '660px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Edit2 size={18} color="#1B6B3A" />
                                    {editingCategory ? 'Edit Category Name & Picture' : 'Create New Category'}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                                    {editingCategory 
                                        ? `Update "${editingCategory.category_name}" details, cover picture, and hierarchy`
                                        : (formData.parent_id ? 'Configuring as a nested Subcategory' : 'Configuring as a top-level Main Category')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Hierarchy Level: Parent Category Selection */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.4rem' }}>
                                    Hierarchy Level
                                </label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '0.88rem',
                                        fontWeight: '600',
                                        color: '#0F172A',
                                        outline: 'none',
                                        background: '#FFFFFF'
                                    }}
                                >
                                    <option value="">Top-Level Main Category (No Parent)</option>
                                    <optgroup label="Or select a Parent Category to make this a Subcategory:">
                                        {groups.filter(g => !editingCategory || g.id !== editingCategory.id).map(g => (
                                            <option key={g.id || g.category_name} value={String(g.id)}>
                                                ↳ Subcategory of: {g.category_name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                    {formData.parent_id 
                                        ? '✨ This item will appear under the selected category (e.g. Tea or Coffee under Snacks).'
                                        : '✨ Top-level category (e.g. Snacks, Beverages, Groceries).'}
                                </p>
                            </div>

                            {/* Category Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.4rem' }}>
                                    {formData.parent_id ? 'Subcategory Name *' : 'Category Name *'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={formData.parent_id ? "e.g. Tea, Coffee, Biscuits, Chips" : "e.g. Snacks, Beverages, Groceries"}
                                    value={formData.category_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Category Image Options */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                        Category Cover Image
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowUrlInput(prev => !prev)}
                                        style={{ background: 'none', border: 'none', color: '#1B6B3A', fontSize: '0.74rem', fontWeight: '750', cursor: 'pointer', padding: 0 }}
                                    >
                                        {showUrlInput ? '← Switch to Upload Image' : '🔗 Paste Web Image URL instead'}
                                    </button>
                                </div>

                                {/* Image Preview & Input Card */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.85rem',
                                    alignItems: 'center',
                                    padding: '0.75rem 0.9rem',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    marginBottom: '0.65rem'
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                                    }}>
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={26} color="#94A3B8" />
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {showUrlInput ? (
                                            <div>
                                                <input
                                                    type="url"
                                                    placeholder="Paste Image URL (https://...)"
                                                    value={formData.image_url?.startsWith('data:') ? '' : formData.image_url}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.55rem 0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '0.82rem',
                                                        outline: 'none',
                                                        background: '#FFFFFF'
                                                    }}
                                                />
                                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748B' }}>
                                                    Enter any direct image link from Unsplash, CDN, or web hosting.
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                {formData.image_url ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                background: '#DCFCE7',
                                                                color: '#166534',
                                                                fontSize: '0.72rem',
                                                                fontWeight: '800',
                                                                padding: '0.15rem 0.5rem',
                                                                borderRadius: '6px'
                                                            }}>
                                                                <Check size={12} /> Cover Picture Attached
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                            <label style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                padding: '0.3rem 0.65rem',
                                                                borderRadius: '6px',
                                                                background: '#FFFFFF',
                                                                border: '1px solid #CBD5E1',
                                                                color: '#334155',
                                                                fontSize: '0.72rem',
                                                                fontWeight: '750',
                                                                cursor: 'pointer'
                                                            }}>
                                                                <Upload size={12} />
                                                                <span>{isUploadingImage ? 'Uploading...' : 'Replace Picture'}</span>
                                                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                                            </label>

                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.72rem', fontWeight: '750', cursor: 'pointer' }}
                                                            >
                                                                Remove Picture
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                        <label style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.45rem 0.85rem',
                                                            borderRadius: '8px',
                                                            background: '#1B6B3A',
                                                            color: '#FFFFFF',
                                                            fontSize: '0.78rem',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 4px rgba(27, 107, 58, 0.2)'
                                                        }}>
                                                            <Upload size={14} />
                                                            <span>{isUploadingImage ? 'Processing...' : 'Upload Image File'}</span>
                                                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                                        </label>
                                                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>PNG, JPG or WebP</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preset Image Quick-Picks */}
                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.65rem 0.85rem', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                                        Quick Sample Images
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                        {PRESET_IMAGES.map((preset, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        image_url: preset.url,
                                                        category_name: prev.category_name ? prev.category_name : preset.label.split(' ')[0]
                                                    }));
                                                }}
                                                style={{
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '8px',
                                                    border: formData.image_url === preset.url ? '1px solid #1B6B3A' : '1px solid #E2E8F0',
                                                    background: formData.image_url === preset.url ? '#F0FDF4' : '#FFFFFF',
                                                    cursor: 'pointer',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    color: '#334155'
                                                }}
                                            >
                                                <img src={preset.url} alt="" style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} />
                                                <span>{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.4rem' }}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief note or summary about this category..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Category Status Toggle */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.85rem 1rem',
                                background: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>Category Status</span>
                                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Enable or disable this category across your catalog</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#E2E8F0',
                                    padding: '3px',
                                    borderRadius: '10px',
                                    gap: '3px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_active: 1 }))}
                                        style={{
                                            padding: '0.4rem 0.95rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: formData.is_active === 1 ? '#166534' : 'transparent',
                                            color: formData.is_active === 1 ? '#FFFFFF' : '#475569',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            boxShadow: formData.is_active === 1 ? '0 2px 6px rgba(22, 101, 52, 0.3)' : 'none',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: formData.is_active === 1 ? '#86EFAC' : '#94A3B8' }} />
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_active: 0 }))}
                                        style={{
                                            padding: '0.4rem 0.95rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: formData.is_active === 0 ? '#DC2626' : 'transparent',
                                            color: formData.is_active === 0 ? '#FFFFFF' : '#475569',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            boxShadow: formData.is_active === 0 ? '0 2px 6px rgba(220, 38, 38, 0.3)' : 'none',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: formData.is_active === 0 ? '#FCA5A5' : '#94A3B8' }} />
                                        Inactive
                                    </button>
                                </div>
                            </div>

                            {/* Product Assignment Section */}
                            <div style={{
                                background: '#F8FAFC',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                padding: '1.1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={16} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.86rem', fontWeight: '850', color: '#0F172A', display: 'block' }}>
                                                {isSubcategoryMode ? 'Assign / Reassign Products to this Subcategory' : 'Assign Products to this Category'}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                                {isSubcategoryMode
                                                    ? `Select products from "${selectedParentGroup?.category_name || 'parent'}" or uncategorized items to place in this subcategory.`
                                                    : 'Only products with no category are shown here for safe assignment.'}
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: '800',
                                        padding: '0.2rem 0.65rem',
                                        borderRadius: '20px',
                                        background: selectedProductIds.length > 0 ? '#1B6B3A' : '#E2E8F0',
                                        color: selectedProductIds.length > 0 ? '#FFFFFF' : '#64748B'
                                    }}>
                                        {selectedProductIds.length} Selected
                                    </span>
                                </div>

                                {/* Filter & Select All toolbar */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Filter products by name, SKU..."
                                            value={productSearchQuery}
                                            onChange={(e) => setProductSearchQuery(e.target.value)}
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                padding: '0.45rem 0.75rem 0.45rem 2rem',
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1',
                                                fontSize: '0.78rem',
                                                background: '#FFFFFF',
                                                outline: 'none'
                                            }}
                                        />
                                        {productSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setProductSearchQuery('')}
                                                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '11px' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {filteredEligibleProducts.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllFiltered}
                                            style={{
                                                padding: '0.45rem 0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1',
                                                background: '#FFFFFF',
                                                color: '#334155',
                                                fontSize: '0.75rem',
                                                fontWeight: '750',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {filteredEligibleProducts.every(p => selectedProductIds.includes(p.id)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>

                                {/* Scrollable List */}
                                <div style={{
                                    maxHeight: '220px',
                                    overflowY: 'auto',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '10px',
                                    background: '#FFFFFF'
                                }}>
                                    {isLoadingProducts ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                                            Loading products catalog...
                                        </div>
                                    ) : filteredEligibleProducts.length === 0 ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '750', color: '#64748B' }}>
                                                {productSearchQuery ? 'No matching products found' : 'No eligible products to display'}
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>
                                                {isSubcategoryMode
                                                    ? `Only products in "${selectedParentGroup?.category_name || 'parent'}" or uncategorized items can be assigned.`
                                                    : 'Only products with no category are shown. All your current products already have categories.'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredEligibleProducts.map(p => {
                                            const isChecked = selectedProductIds.includes(p.id);
                                            const isCurrentlyAssigned = editingCategory && (
                                                isSubcategoryMode
                                                    ? p.subgroup_id === editingCategory.id
                                                    : (p.group_id === editingCategory.id || p.category?.toLowerCase() === editingCategory.category_name?.toLowerCase())
                                            );
                                            const inParent = isSubcategoryMode && (
                                                p.group_id === selectedParentId ||
                                                (selectedParentGroup && (
                                                    p.category?.toLowerCase() === selectedParentGroup.category_name?.toLowerCase() ||
                                                    p.category?.toLowerCase().startsWith(selectedParentGroup.category_name?.toLowerCase() + ' >')
                                                ))
                                            );

                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => handleToggleProduct(p.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '0.6rem 0.85rem',
                                                        borderBottom: '1px solid #F1F5F9',
                                                        cursor: 'pointer',
                                                        background: isChecked ? '#F0FDF4' : '#FFFFFF',
                                                        transition: 'background 0.15s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {}} // toggled by row click
                                                            style={{ accentColor: '#1B6B3A', cursor: 'pointer', width: '16px', height: '16px' }}
                                                        />
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {p.name || p.product_name}
                                                                </span>
                                                                {p.sku && (
                                                                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>
                                                                        ({p.sku})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.1rem' }}>
                                                                Price: ₹{parseFloat(p.selling_price || p.price || 0).toLocaleString()} • Stock: {p.quantity ?? p.stock ?? 0} {p.unit || p.primary_unit || 'pcs'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ shrink: 0, marginLeft: '0.5rem' }}>
                                                        {isCurrentlyAssigned ? (
                                                            <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#DCFCE7', color: '#166534' }}>
                                                                Assigned
                                                            </span>
                                                        ) : inParent ? (
                                                            <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#DBEAFE', color: '#1E40AF' }}>
                                                                ↳ In {selectedParentGroup?.category_name}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.68rem', fontWeight: '750', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#F1F5F9', color: '#64748B' }}>
                                                                Uncategorized
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Inline error if save fails */}
                            {saveCategoryMutation.isError && (
                                <div style={{
                                    padding: '0.65rem 0.9rem',
                                    borderRadius: '10px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FCA5A5',
                                    color: '#991B1B',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>⚠️ {saveCategoryMutation.error?.response?.data?.message || saveCategoryMutation.error?.message || 'Failed to save category. Please try again.'}</span>
                                    <button
                                        type="button"
                                        onClick={() => saveCategoryMutation.reset()}
                                        style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '800' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        color: '#475569',
                                        fontWeight: '750',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saveCategoryMutation.isPending}
                                    style={{
                                        padding: '0.65rem 1.5rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#1B6B3A',
                                        color: '#FFFFFF',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)'
                                    }}
                                >
                                    {saveCategoryMutation.isPending ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inline Category Products Viewer Modal (stays within Categories tab) */}
            {viewingCategoryProducts && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E8F5E9', border: '1px solid #DCFCE7', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {viewingCategoryProducts.image_url && !viewingCategoryProducts.image_url.includes('beta-softnet.com') ? (
                                        <img src={viewingCategoryProducts.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FolderTree size={22} color="#1B6B3A" />
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                                            {viewingCategoryProducts.category_name}
                                        </h2>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.15rem 0.55rem', borderRadius: '6px', background: viewingCategoryProducts.parent_id ? '#EFF6FF' : '#DCFCE7', color: viewingCategoryProducts.parent_id ? '#1D4ED8' : '#166534' }}>
                                            {viewingCategoryProducts.parent_id ? 'Subcategory' : 'Main Category'}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                        {categoryMatchedProducts.length} products assigned to this category
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => { setViewingCategoryProducts(null); setCategoryProductSearch(''); }}
                                style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '800' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search Bar within Category */}
                        <div style={{ padding: '0.85rem 1.75rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
                                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Search products in this category..."
                                    value={categoryProductSearch}
                                    onChange={(e) => setCategoryProductSearch(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: '#FFFFFF' }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = viewingCategoryProducts;
                                    setViewingCategoryProducts(null);
                                    handleOpenEditModal(target);
                                }}
                                style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#1B6B3A', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Edit2 size={12} /> Manage Category / Assign
                            </button>
                        </div>

                        {/* Products List Table */}
                        <div style={{ padding: '1rem 1.75rem', overflowY: 'auto', flex: 1 }}>
                            {categoryMatchedProducts.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                                    <Package size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
                                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: '800', color: '#334155' }}>
                                        {categoryProductSearch ? 'No matching products in this category' : 'No products in this category yet'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                                        {categoryProductSearch ? 'Try clearing or changing your search query' : 'Use "Manage Category / Assign" to link products to this category.'}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.65rem 1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>
                                        <div>Product Name</div>
                                        <div>SKU / Barcode</div>
                                        <div>Price</div>
                                        <div style={{ textAlign: 'right' }}>Stock Status</div>
                                    </div>
                                    {categoryMatchedProducts.map((p, idx) => {
                                        const isOut = p.stock_quantity !== undefined && p.stock_quantity <= 0;
                                        return (
                                            <div key={p.id || idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.65rem 1rem', borderBottom: idx < categoryMatchedProducts.length - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'center', fontSize: '0.82rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                                        ) : (
                                                            <Package size={14} color="#64748B" />
                                                        )}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <span style={{ fontWeight: '800', color: '#0F172A', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                            {p.name}
                                                        </span>
                                                        {p.brand && <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{p.brand}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#64748B', fontWeight: '600', fontSize: '0.78rem' }}>
                                                    {p.sku || p.barcode || p.item_code || '-'}
                                                </div>
                                                <div style={{ fontWeight: '800', color: '#0F172A' }}>
                                                    ₹{(Number(p.selling_price) || Number(p.price) || 0).toLocaleString()}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '750',
                                                        background: isOut ? '#FEF2F2' : '#F0FDF4',
                                                        color: isOut ? '#DC2626' : '#166534',
                                                        border: `1px solid ${isOut ? '#FCA5A5' : '#BBF7D0'}`
                                                    }}>
                                                        {isOut ? 'Out of stock' : `${p.stock_quantity ?? p.stock ?? 'In Stock'} in stock`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
                            <button
                                type="button"
                                onClick={() => { setViewingCategoryProducts(null); setCategoryProductSearch(''); }}
                                style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCategories;
