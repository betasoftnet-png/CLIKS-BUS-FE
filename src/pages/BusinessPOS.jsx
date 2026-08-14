import React, { useState, useRef } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '../context';
import { 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    User, 
    ShoppingBag, 
    CreditCard, 
    Smartphone, 
    DollarSign, 
    Filter, 
    Receipt, 
    ChevronRight,
    Edit,
    X,
    Check,
    Printer,
    TrendingUp,
    TrendingDown,
    Calendar,
    Sparkles,
    CircleAlert,
    History,
    Info,
    UserPlus,
    MoreVertical
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../services/inventoryService';
import { productsService } from '../services/productsService';
import { crmService } from '../services/crmService';
import { posService } from '../services/posService';
import { hsnService } from '../services/hsnService';
import '../App.css';
import { customConfirm, customPrompt } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';

const BusinessPOS = () => {
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [cart, setCart] = useState([]);
    const [colFilters, setColFilters] = React.useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
    
    // Hold Cart State
    const [heldCarts, setHeldCarts] = useState([]);
    const [holdCounter, setHoldCounter] = useState(1);
    const [activeHeldCartInfo, setActiveHeldCartInfo] = useState(null);
    
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'flat'
    const [discountVal, setDiscountVal] = useState(0);
    const [taxRate, setTaxRate] = useState(18); // Default GST
    const [paymentMode] = useState('Cash');
    const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);
    const [loyaltyPointsRedeemed, setLoyaltyPointsRedeemed] = useState(0);
    const [isPtsEarnedManuallyEdited, setIsPtsEarnedManuallyEdited] = useState(false);
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrderData, setLastOrderData] = useState(null);
    
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeProductMenuId, setActiveProductMenuId] = useState(null);
    const [isIncreaseStockModalOpen, setIsIncreaseStockModalOpen] = useState(false);
    const [isDecreaseStockModalOpen, setIsDecreaseStockModalOpen] = useState(false);
    const [stockTargetProduct, setStockTargetProduct] = useState(null);
    const [addedStockQty, setAddedStockQty] = useState('');
    const [decreasedStockQty, setDecreasedStockQty] = useState('');

    React.useEffect(() => {
        const handleGlobalClick = () => {
            setActiveProductMenuId(null);
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);



    const [newProductData, setNewProductData] = useState(() => ({
        name: '',
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        category: 'General',
        unit: 'PCS',
        selling_price: '',
        quantity: '',
        tax_percentage: 18,
        hsn_code: ''
    }));

    // HSN Intelligent Search State for Quick Register Item
    const [hsnSuggestions, setHsnSuggestions] = useState([]);
    const [isHsnLoading, setIsHsnLoading] = useState(false);
    const [showHsnDropdown, setShowHsnDropdown] = useState(false);
    const [hasSearchedHsn, setHasSearchedHsn] = useState(false);
    const [hsnQueryOverride, setHsnQueryOverride] = useState('');

    // HSN Info Description Popover State & Ref
    const [showHsnInfoPopover, setShowHsnInfoPopover] = useState(false);
    const [hsnInfoDescription, setHsnInfoDescription] = useState('');
    const [isHsnInfoLoading, setIsHsnInfoLoading] = useState(false);
    const hsnInfoRef = useRef(null);

    const fetchAndShowHsnDescription = async (codeToFetch) => {
        const code = (codeToFetch || newProductData.hsn_code || '').trim();
        if (!code) {
            setHsnInfoDescription('No HSN/SAC code entered.');
            setShowHsnInfoPopover(true);
            return;
        }

        const matchedSuggestion = hsnSuggestions.find(s => 
            String(s.hsnCode).trim() === code || 
            String(s.hsnCode).trim() === code.replace(/^0+/, '')
        );
        if (matchedSuggestion && matchedSuggestion.description) {
            setHsnInfoDescription(matchedSuggestion.description);
            setShowHsnInfoPopover(true);
            return;
        }

        setIsHsnInfoLoading(true);
        setShowHsnInfoPopover(true);
        try {
            const results = await hsnService.searchHSN(code);
            if (results && results.length > 0) {
                const exactMatch = results.find(r => 
                    String(r.hsnCode).trim() === code || 
                    String(r.hsnCode).trim() === code.replace(/^0+/, '')
                ) || results[0];
                setHsnInfoDescription(exactMatch.description || 'No HSN/SAC description available for this code.');
            } else {
                setHsnInfoDescription('No HSN/SAC description available for this code.');
            }
        } catch {
            setHsnInfoDescription('No HSN/SAC description available for this code.');
        } finally {
            setIsHsnInfoLoading(false);
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (hsnInfoRef.current && !hsnInfoRef.current.contains(event.target)) {
                setShowHsnInfoPopover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (!isAddProductModalOpen) {
            setShowHsnDropdown(false);
            setHsnSuggestions([]);
            setHsnQueryOverride('');
            setHasSearchedHsn(false);
            setShowHsnInfoPopover(false);
            return;
        }

        const query = (hsnQueryOverride || newProductData.name || '').trim();
        if (query.length < 2) {
            setHsnSuggestions([]);
            setShowHsnDropdown(false);
            setHasSearchedHsn(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsHsnLoading(true);
            setHasSearchedHsn(true);
            hsnService.searchHSN(query)
                .then(results => {
                    setHsnSuggestions(results || []);
                    setShowHsnDropdown(true);
                })
                .catch(() => {
                    setHsnSuggestions([]);
                })
                .finally(() => {
                    setIsHsnLoading(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [isAddProductModalOpen, newProductData.name, hsnQueryOverride]);
    
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyDate, setHistoryDate] = useState('');
    const [historyPaymentMode, setHistoryPaymentMode] = useState('All');
    const customerInputRef = useRef(null);

    // Add Customer State & Handler
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        phone_number: '',
        email: '',
        gstin: '',
        billing_address: ''
    });
    const [isSavingCustomer, setIsSavingCustomer] = useState(false);
    const [customerErrors, setCustomerErrors] = useState({ phone: '', email: '', gstin: '' });
    const [touchedCustomerFields, setTouchedCustomerFields] = useState({ phone: false, email: false, gstin: false });

    const validateCustomerPhone = (val) => {
        if (!val || !val.trim()) return '';
        const clean = val.trim();
        if (!/^\d{10}$/.test(clean)) {
            return 'Phone number must be exactly 10 digits.';
        }
        return '';
    };

    const validateCustomerEmail = (val) => {
        if (!val || !val.trim()) return '';
        const clean = val.trim().toLowerCase();
        if (!clean.endsWith('@bnxmail.com') || !/^[^\s@]+@bnxmail\.com$/.test(clean)) {
            return 'Email must use the @bnxmail.com domain.';
        }
        return '';
    };

    const validateCustomerGstin = (val) => {
        if (!val || !val.trim()) return '';
        const clean = val.trim().toUpperCase();
        if (clean.length !== 15 || !/^[0-9A-Z]{15}$/.test(clean)) {
            return 'GSTIN must be exactly 15 characters.';
        }
        return '';
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();

        const phoneErr = validateCustomerPhone(newCustomerData.phone_number);
        const emailErr = validateCustomerEmail(newCustomerData.email);
        const gstinErr = validateCustomerGstin(newCustomerData.gstin);

        setTouchedCustomerFields({ phone: true, email: true, gstin: true });
        setCustomerErrors({ phone: phoneErr, email: emailErr, gstin: gstinErr });

        if (!newCustomerData.name || !newCustomerData.name.trim()) {
            alert('Customer Name is required');
            return;
        }

        if (phoneErr || emailErr || gstinErr) {
            return;
        }

        setIsSavingCustomer(true);
        try {
            const res = await crmService.createCustomer({
                name: newCustomerData.name.trim(),
                phone_number: newCustomerData.phone_number?.trim() || '',
                email: newCustomerData.email?.trim() || '',
                gstin: newCustomerData.gstin?.trim() || '',
                billing_address: newCustomerData.billing_address?.trim() || ''
            });

            const createdCust = res?.data?.data || res?.data?.customer || res?.data || { name: newCustomerData.name, email: newCustomerData.email };
            
            // Refresh customer list
            await queryClient.invalidateQueries({ queryKey: ['business-customers'] });

            // Auto-assign created customer to POS cart
            setSelectedCustomerObj(createdCust);
            setCustomerName(createdCust.name || newCustomerData.name);
            setCustomerEmail(createdCust.email || newCustomerData.email || '');
            setIsCustomerDropdownOpen(false);

            // Reset form & close modal
            setNewCustomerData({ name: '', phone_number: '', email: '', gstin: '', billing_address: '' });
            setCustomerErrors({ phone: '', email: '', gstin: '' });
            setTouchedCustomerFields({ phone: false, email: false, gstin: false });
            setIsAddCustomerModalOpen(false);
            alert('New Customer registered and assigned successfully!');
        } catch (err) {
            console.error('Failed to create customer:', err);
            alert('Failed to register customer. Please try again.');
        } finally {
            setIsSavingCustomer(false);
        }
    };

    // 1. Fetch Unified Catalog (Combines Legacy Inventory + Standard Catalog Products)
    const { data: inventory = [], isLoading: isInventoryLoading } = useQuery({
        queryKey: ['pos-catalog'],
        queryFn: async () => {
            try {
                const [invRes, prodRes] = await Promise.all([
                    inventoryService.getInventory().catch(() => []),
                    productsService.getProducts().catch(() => [])
                ]);

                // Format Legacy Inventory items
                const legacyItems = (invRes || []).map(i => ({
                    id: i.id,
                    name: i.name,
                    sku: i.sku,
                    unit: i.unit || i.primary_unit || 'PCS',
                    price: parseFloat(i.price) || 0,
                    quantity: parseFloat(i.quantity) || 0,
                    category: i.category || 'General',
                    source: 'inventory'
                }));

                // Format Central Catalog Products
                const catalogItems = (prodRes || []).map(p => ({
                    id: p.id,
                    name: p.product_name || p.name,
                    sku: p.sku || p.hsn_code,
                    unit: p.unit || p.primary_unit || 'PCS',
                    price: parseFloat(p.selling_price) || parseFloat(p.price) || 0,
                    quantity: parseFloat(p.stock) || parseFloat(p.quantity) || 0,
                    category: p.category_name || p.category || 'General',
                    source: 'products'
                }));

                // Aggregate and de-duplicate by exact case-insensitive name
                const allItems = [...catalogItems, ...legacyItems];
                const uniqueMap = new Map();
                allItems.forEach(item => {
                    if (!item.name) return;
                    const key = item.name.toLowerCase().trim();
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    }
                });
                return Array.from(uniqueMap.values());
            } catch (err) {
                console.error('[POS Unified Fetch] Error aggregating catalog:', err);
                return [];
            }
        }
    });

    // 2. Fetch Today's Summary
    const { data: todaySummary, refetch: refetchSummary } = useQuery({
        queryKey: ['pos-summary'],
        queryFn: posService.getTodaySummary,
        refetchOnWindowFocus: true
    });

    // 3. Fetch Customers for Quick Search
    const { data: customers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            if (Array.isArray(res)) return res;
            const raw = res?.data?.data ?? res?.data ?? res?.customers ?? [];
            return Array.isArray(raw) ? raw : [];
        }
    });
    
    // 4. Fetch Order History
    const { data: orderHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['pos-order-history'],
        queryFn: () => posService.getOrders({ limit: 50 }),
        enabled: showHistoryModal
    });

    // 5. Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: posService.checkout,
        onSuccess: (data) => {
            setLastOrderData(data);
            setShowReceiptModal(true);
            setIsCheckingOut(false);
            // Reset Cart
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setLoyaltyPointsEarned(0);
            setLoyaltyPointsRedeemed(0);
            setIsPtsEarnedManuallyEdited(false);

            if (selectedCustomerObj) {
                const ptsEarned = parseFloat(loyaltyPointsEarned) || 0;
                const ptsRedeemed = parseFloat(loyaltyPointsRedeemed) || 0;
                const netPts = ptsEarned - ptsRedeemed;
                setSelectedCustomerObj(prev => prev ? ({
                    ...prev,
                    loyalty_points: Math.max(0, (prev.loyalty_points || prev.points || 0) + netPts),
                    points: Math.max(0, (prev.points || prev.loyalty_points || 0) + netPts)
                }) : null);
            }

            setDiscountVal(0);
            setActiveHeldCartInfo(null);
            
            // Refetch to reflect updated inventory, customers & stats
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['stockStats'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            refetchSummary();
        },
        onError: (error) => {
            console.error('Checkout failed:', error);
            const msg = error.response?.data?.message || 'Checkout failed. Please try again.';
            alert(msg);
            setIsCheckingOut(false);
        }
    });

    // 5. Quick Product Creation Mutation (Instant Catalog Injection)
    const createProductMutation = useMutation({
        mutationFn: (data) => productsService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            alert('New product added to POS catalog successfully!');
            setIsAddProductModalOpen(false);
            // Clean and re-initialize auto-form
            setNewProductData({
                name: '',
                sku: `SKU-${Date.now().toString().slice(-4)}`,
                category: 'General',
                unit: 'PCS',
                selling_price: '',
                quantity: '',
                tax_percentage: 18,
                hsn_code: ''
            });
            setHsnQueryOverride('');
            setHsnSuggestions([]);
            setShowHsnDropdown(false);
            setShowHsnInfoPopover(false);
        },
        onError: (err) => {
            console.error('Product addition error:', err);
            alert('Could not add product. Please check input fields.');
        }
    });

    // 6. Update Product Mutation
    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data, source }) => {
            if (source === 'inventory') {
                try {
                    return await inventoryService.updateItem(id, data);
                } catch (e) {
                    return await productsService.updateProduct(id, data);
                }
            } else {
                try {
                    return await productsService.updateProduct(id, data);
                } catch (e) {
                    return await inventoryService.updateItem(id, data);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setIsAddProductModalOpen(false);
            setEditingProduct(null);
            setNewProductData({
                name: '',
                sku: `SKU-${Date.now().toString().slice(-4)}`,
                category: 'General',
                selling_price: '',
                quantity: '',
                tax_percentage: 18,
                hsn_code: ''
            });
            setHsnQueryOverride('');
            setHsnSuggestions([]);
            setShowHsnDropdown(false);
            setShowHsnInfoPopover(false);
        },
        onError: (err) => {
            console.error('Error updating product:', err);
            alert('Could not update product. Please check input fields.');
        }
    });

    // 7. Increase Stock Mutation
    const increaseStockMutation = useMutation({
        mutationFn: async ({ id, newStock, source }) => {
            const payload = { name: stockTargetProduct?.name, stock: newStock, quantity: newStock };
            if (source === 'inventory') {
                try {
                    return await inventoryService.updateItem(id, payload);
                } catch (e) {
                    return await productsService.updateProduct(id, payload);
                }
            } else {
                try {
                    return await productsService.updateProduct(id, payload);
                } catch (e) {
                    return await inventoryService.updateItem(id, payload);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setIsIncreaseStockModalOpen(false);
            setStockTargetProduct(null);
            setAddedStockQty('');
        },
        onError: (err) => {
            console.error('Error updating stock:', err);
            alert('Failed to update stock quantity.');
        }
    });

    // 7b. Decrease Stock Mutation
    const decreaseStockMutation = useMutation({
        mutationFn: async ({ id, newStock, source }) => {
            const payload = { name: stockTargetProduct?.name, stock: newStock, quantity: newStock };
            if (source === 'inventory') {
                try {
                    return await inventoryService.updateItem(id, payload);
                } catch (e) {
                    return await productsService.updateProduct(id, payload);
                }
            } else {
                try {
                    return await productsService.updateProduct(id, payload);
                } catch (e) {
                    return await inventoryService.updateItem(id, payload);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setIsDecreaseStockModalOpen(false);
            setStockTargetProduct(null);
            setDecreasedStockQty('');
        },
        onError: (err) => {
            console.error('Error updating stock:', err);
            alert('Failed to update stock quantity.');
        }
    });

    // 8. Delete Product Mutation
    const deleteProductMutation = useMutation({
        mutationFn: async ({ id, source }) => {
            if (source === 'inventory') {
                try {
                    return await inventoryService.deleteItem(id);
                } catch (e) {
                    return await productsService.deleteProduct(id);
                }
            } else {
                try {
                    return await productsService.deleteProduct(id);
                } catch (e) {
                    return await inventoryService.deleteItem(id);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: (err) => {
            console.error('Error deleting product:', err);
            alert('Could not delete product.');
        }
    });

    const handleOpenEditProduct = (prod) => {
        setEditingProduct(prod);
        setNewProductData({
            name: prod.name || '',
            sku: prod.sku || '',
            category: prod.category || 'General',
            unit: prod.unit || 'PCS',
            selling_price: prod.price ? String(prod.price) : '',
            quantity: prod.quantity ? String(prod.quantity) : '',
            tax_percentage: prod.tax_percentage || 18,
            hsn_code: prod.hsn_code || ''
        });
        setHsnQueryOverride(prod.hsn_code || '');
        setIsAddProductModalOpen(true);
    };

    const handleOpenIncreaseStock = (prod) => {
        setStockTargetProduct(prod);
        setAddedStockQty('');
        setIsIncreaseStockModalOpen(true);
    };

    const handleOpenDecreaseStock = (prod) => {
        setStockTargetProduct(prod);
        setDecreasedStockQty('');
        setIsDecreaseStockModalOpen(true);
    };

    const handleDeleteProduct = (prod) => {
        if (window.confirm(`Delete Item?\n\nAre you sure you want to delete "${prod.name}"?`)) {
            deleteProductMutation.mutate({ id: prod.id, source: prod.source });
        }
    };

    // Derived Categories
    const categories = ['All', ...new Set(inventory.map(i => i.category).filter(Boolean))];

    // Filtered Products Catalog
    const filteredProducts = inventory.filter(prod => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        if (!lowerSearch) {
            return selectedCategory === 'All' || prod.category === selectedCategory;
        }

        const matchesSearch = 
            (prod.name || '').toLowerCase().includes(lowerSearch) ||
            (prod.sku || '').toLowerCase().includes(lowerSearch) ||
            (prod.category || '').toLowerCase().includes(lowerSearch) ||
            (prod.price || 0).toString().includes(lowerSearch);
        
        const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Handlers
    const isDecimalUnit = (unit) => {
        const u = String(unit || 'PCS').toUpperCase();
        return ['KG', 'KGS', 'GRAM', 'GRAMS', 'G', 'LITRE', 'LITRES', 'L', 'ML'].includes(u);
    };

    const addToCart = (prod) => {
        if (prod.quantity <= 0) {
            alert('This item is out of stock!');
            return;
        }

        const prodUnit = prod.unit || 'PCS';
        const isDec = isDecimalUnit(prodUnit);

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === prod.id);
            if (existing) {
                const addStep = isDec ? 0.25 : 1;
                const newQty = isDec 
                    ? Math.round((existing.quantity + addStep) * 1000) / 1000
                    : existing.quantity + 1;

                if (newQty > prod.quantity) {
                    alert('Cannot add more than available stock!');
                    return prevCart;
                }

                return prevCart.map(item =>
                    item.id === prod.id
                        ? { ...item, quantity: newQty, total: Math.round(newQty * (item.price || 0) * 100) / 100 }
                        : item
                );
            }
            return [...prevCart, {
                id: prod.id,
                name: prod.name,
                sku: prod.sku,
                price: prod.price || 0,
                quantity: 1,
                tax_rate: taxRate,
                unit: prodUnit,
                total: prod.price || 0,
                source: prod.source
            }];
        });
    };

    const updateCartQty = (id, delta) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === id);
            if (!existing) return prevCart;

            const invProd = inventory.find(p => p.id === id);
            const maxStock = invProd ? invProd.quantity : Infinity;
            const isDec = isDecimalUnit(existing.unit);

            let newQty = (parseFloat(existing.quantity) || 0) + delta;
            if (isDec) {
                newQty = Math.round(newQty * 1000) / 1000;
            } else {
                newQty = Math.round(newQty);
            }

            if (newQty <= 0) {
                return prevCart.filter(item => item.id !== id);
            }

            if (newQty > maxStock) {
                alert('Cannot add more than available stock!');
                return prevCart;
            }

            const newTotal = Math.round(newQty * (existing.price || 0) * 100) / 100;
            return prevCart.map(item =>
                item.id === id
                    ? { ...item, quantity: newQty, total: newTotal }
                    : item
            );
        });
    };

    const updateCartDirectQty = (id, rawVal) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === id);
            if (!existing) return prevCart;

            if (rawVal === '' || rawVal === undefined) {
                return prevCart.map(item => item.id === id ? { ...item, quantity: '', total: 0 } : item);
            }

            const invProd = inventory.find(p => p.id === id);
            const maxStock = invProd ? invProd.quantity : Infinity;
            const isDec = isDecimalUnit(existing.unit);

            let parsed = parseFloat(rawVal);
            if (isNaN(parsed) || parsed <= 0) {
                return prevCart.map(item => item.id === id ? { ...item, quantity: rawVal, total: 0 } : item);
            }

            if (!isDec) {
                parsed = Math.floor(parsed);
            }

            if (parsed > maxStock) {
                alert('Cannot add more than available stock!');
                return prevCart;
            }

            const newTotal = Math.round(parsed * (existing.price || 0) * 100) / 100;
            return prevCart.map(item =>
                item.id === id
                    ? { ...item, quantity: parsed, total: newTotal }
                    : item
            );
        });
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const handleCustomerSelect = (cust) => {
        setSelectedCustomerObj(cust);
        setCustomerName(cust.name);
        setCustomerEmail(cust.email || '');
        setIsCustomerDropdownOpen(false);
    };

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    
    const discountAmount = discountType === 'percentage' 
        ? (subtotal * (parseFloat(discountVal) || 0) / 100)
        : (parseFloat(discountVal) || 0);
    
    const discountedTotal = Math.max(0, subtotal - discountAmount);
    const calculatedTax = discountedTotal * (taxRate / 100);
    
    // Loyalty Point Redemption calculation: 1 loyalty point = ₹1 discount
    const availableCustomerPoints = selectedCustomerObj ? (parseFloat(selectedCustomerObj.loyalty_points || selectedCustomerObj.points) || 0) : 0;
    const maxRedeemablePoints = Math.min(availableCustomerPoints, Math.floor(discountedTotal + calculatedTax));
    const effectivePointsRedeemed = selectedCustomerObj ? Math.max(0, Math.min(maxRedeemablePoints, parseFloat(loyaltyPointsRedeemed) || 0)) : 0;
    const loyaltyDiscountAmount = effectivePointsRedeemed; // 1 pt = ₹1

    const totalBeforeRound = Math.max(0, discountedTotal + calculatedTax - loyaltyDiscountAmount);
    const finalTotal = Math.round(totalBeforeRound);
    const roundOff = finalTotal - totalBeforeRound;

    const handleCheckout = (mode) => {
        if (cart.length === 0) return;

        // Prevent selling more quantity than available stock
        for (const item of cart) {
            const catItem = inventory.find(p => p.id === item.id || (p.name && item.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim()));
            const maxStock = catItem ? (parseFloat(catItem.quantity) || 0) : Infinity;
            const requestedQty = parseFloat(item.quantity) || 0;
            if (requestedQty > maxStock) {
                alert(`Cannot complete checkout!\n\nRequested quantity (${requestedQty} ${item.unit || 'PCS'}) for "${item.name}" exceeds available stock (${maxStock} ${item.unit || 'PCS'}).`);
                return;
            }
        }

        setIsCheckingOut(true);
        
        const ptsEarned = parseFloat(loyaltyPointsEarned) || 0;
        const ptsRedeemed = effectivePointsRedeemed;
        const existingPts = availableCustomerPoints;
        const remainingPts = Math.max(0, existingPts - ptsRedeemed + ptsEarned);

        const payload = {
            customer_id: selectedCustomerObj?.id || null,
            client_name: customerName || 'Walk-in Customer',
            client_email: customerEmail || selectedCustomerObj?.email || null,
            client_phone: selectedCustomerObj?.phone_number || selectedCustomerObj?.phone || null,
            existing_loyalty_points: existingPts,
            loyalty_points_earned: ptsEarned,
            loyaltyPointsEarned: ptsEarned,
            loyalty_points_redeemed: ptsRedeemed,
            loyaltyPointsRedeemed: ptsRedeemed,
            loyalty_discount_amount: loyaltyDiscountAmount,
            loyaltyDiscount: loyaltyDiscountAmount,
            remaining_loyalty_points: remainingPts,
            final_loyalty_points: remainingPts,
            amount: subtotal,
            tax_amount: calculatedTax,
            total_amount: finalTotal,
            paid_amount: finalTotal,
            due_amount: 0,
            discount_amount: discountAmount,
            round_off: roundOff,
            payment_mode: mode,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                description: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                tax_rate: taxRate,
                total: item.total,
                source: item.source
            }))
        };

        checkoutMutation.mutate(payload);
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                if (cart.length > 0 && !isCheckingOut) {
                    handleCheckout('Cash');
                }
            } else if (e.key === 'F2') {
                e.preventDefault();
                if (cart.length > 0 && !isCheckingOut) {
                    handleCheckout('UPI');
                }
            } else if (e.key === 'F3') {
                e.preventDefault();
                if (cart.length > 0 && !isCheckingOut) {
                    handleCheckout('Card');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, isCheckingOut, inventory, customerName, customerEmail, selectedCustomerObj, loyaltyPointsEarned, loyaltyPointsRedeemed, discountVal, discountType, taxRate]);

    const clearCart = async () => {
        if (await customConfirm('Are you sure you want to clear the current cart?')) {
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setSelectedCustomerObj(null);
            setLoyaltyPointsEarned(0);
            setLoyaltyPointsRedeemed(0);
            setIsPtsEarnedManuallyEdited(false);
            setDiscountVal(0);
            setActiveHeldCartInfo(null);
        }
    };

    const holdCart = async () => {
        if (cart.length === 0) return;
        
        const isEditingHeld = Boolean(activeHeldCartInfo);
        const defaultDisplayId = isEditingHeld ? activeHeldCartInfo.displayId : holdCounter;
        const defaultId = isEditingHeld ? activeHeldCartInfo.id : Date.now();

        const suggestedName = customerName 
            ? `Cart - ${customerName}` 
            : (isEditingHeld && activeHeldCartInfo.customName 
                ? activeHeldCartInfo.customName 
                : `Cart #${defaultDisplayId}`);
        
        const customName = await customPrompt('Assign a name/label to identify this held cart:', suggestedName);
        
        if (customName === null) return;

        const cartEntry = {
            id: defaultId,
            displayId: defaultDisplayId,
            customName: customName.trim() || suggestedName,
            cart: [...cart],
            customerName,
            customerEmail,
            discountVal,
            discountType,
            taxRate
        };

        setHeldCarts(prev => [...prev.filter(h => h.id !== defaultId), cartEntry].sort((a, b) => a.displayId - b.displayId));

        if (!isEditingHeld) {
            setHoldCounter(prev => prev + 1);
        }

        // Reset workspace & active held cart tracker
        setActiveHeldCartInfo(null);
        setCart([]);
        setCustomerName('');
        setCustomerEmail('');
        setSelectedCustomerObj(null);
        setDiscountVal(0);
    };

    const renameHeldCart = async (holdId) => {
        const held = heldCarts.find(h => h.id === holdId);
        if (!held) return;
        const defaultName = held.customName || held.customerName || `Cart #${held.displayId}`;
        const newName = await customPrompt('Enter a new name/label for this held cart:', defaultName);
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            setHeldCarts(prev => prev.map(h => h.id === holdId ? { ...h, customName: trimmedName } : h));
            if (activeHeldCartInfo && activeHeldCartInfo.id === holdId) {
                setActiveHeldCartInfo(prev => prev ? { ...prev, customName: trimmedName } : null);
            }
        }
    };

    const deleteHeldCart = async (holdId) => {
        if (await customConfirm('Discard this held cart entirely?')) {
            setHeldCarts(prev => prev.filter(h => h.id !== holdId));
            if (activeHeldCartInfo && activeHeldCartInfo.id === holdId) {
                setActiveHeldCartInfo(null);
            }
        }
    };

    const restoreCart = async (holdId) => {
        if (cart.length > 0) {
            if (!await customConfirm('Current cart has items. Overwrite with held cart?')) return;
        }
        const held = heldCarts.find(h => h.id === holdId);
        if (!held) return;
        
        setCart(held.cart);
        setCustomerName(held.customerName || '');
        setCustomerEmail(held.customerEmail || '');
        setDiscountVal(held.discountVal || 0);
        setDiscountType(held.discountType || 'percentage');
        setTaxRate(held.taxRate || 18);
        
        // Track the restored held cart's identity
        setActiveHeldCartInfo({
            id: held.id,
            displayId: held.displayId,
            customName: held.customName
        });

        // Remove from held list while active in workspace
        setHeldCarts(prev => prev.filter(h => h.id !== holdId));
    };

    const printReceipt = () => {
        const printContents = document.getElementById('thermal-receipt-pane').innerHTML;
        document.body.innerHTML = `
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body { font-family: monospace; font-size: 12px; color: #000; background: #fff; margin: 0; padding: 15px; text-align: center; }
                        h2, h3, p { margin: 4px 0; }
                        hr { border: 0.5px dashed #000; margin: 8px 0; }
                        .receipt-table { width: 100%; border-collapse: collapse; text-align: left; }
                        .receipt-table td { padding: 2px 0; }
                        .text-right { text-align: right; }
                    </style>
                </head>
                <body>
                    ${printContents}
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `;
        window.print();
        window.location.reload(); // Reload back to app
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '1rem', padding: '1rem', background: '#F1F5F9', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Left Side: Product Catalog */}
            <div style={{ flex: '1 1 60%', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                
                {/* Header: Search & Summary Widget */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>Retail POS System</h1>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Speed Checkout Terminal #1</p>
                            </div>
                        </div>

                        {/* Simple Summary Badge & Add Product CTA */}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setIsAddProductModalOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    boxShadow: '0 4px 10px rgba(16,185,129,0.15)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Plus size={15} strokeWidth={3} /> Add Product
                            </button>

                            {todaySummary && (
                                <div style={{ display: 'flex', gap: '1.5rem', background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Today Orders</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#065F46' }}>{todaySummary.total_orders || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Total Sales</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#065F46' }}>{formatCurrency(todaySummary.total_sales || 0)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowHistoryModal(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: '#F8FAFC',
                                    color: '#64748B',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
                            >
                                <History size={15} strokeWidth={2.5} /> History
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search item name, category or barcode SKU..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>
                        
                        {/* Category Chips Container */}
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px', maxWidth: '50%' }}>
                            {categories.slice(0, 5).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        border: selectedCategory === cat ? '1px solid #10B981' : '1px solid #E2E8F0',
                                        background: selectedCategory === cat ? '#ECFDF5' : '#FFFFFF',
                                        color: selectedCategory === cat ? '#047857' : '#64748B',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#F8FAFC' }}>
                    {isInventoryLoading ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748B' }}>
                            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', marginBottom: '0.5rem' }}></div>
                            <span>Loading catalog matrix...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8', gap: '0.75rem' }}>
                            <ShoppingBag size={32} opacity={0.5} />
                            <span>No products matching selection</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                            <AnimatePresence>
                                {filteredProducts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(prod => {
                                    const isOutOfStock = (prod.quantity || 0) <= 0;
                                    const isLowStock = (prod.quantity || 0) > 0 && (prod.quantity || 0) < 10;
                                    
                                    return (
                                        <motion.div
                                            layout
                                            key={prod.id}
                                            whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => !isOutOfStock && addToCart(prod)}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '14px',
                                                padding: '0.85rem',
                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                position: 'relative',
                                                opacity: isOutOfStock ? 0.6 : 1,
                                                transition: 'border 0.2s'
                                            }}
                                        >
                                            {/* Top Row: Visual Tag for Category + Three-Dot Menu */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{prod.category || 'General'}</span>

                                                {/* Three-Dot Option Icon */}
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveProductMenuId(activeProductMenuId === prod.id ? null : prod.id);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            color: '#64748B',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'background 0.15s ease'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Options"
                                                    >
                                                        <MoreVertical size={15} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeProductMenuId === prod.id && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                right: 0,
                                                                marginTop: '4px',
                                                                background: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                borderRadius: '10px',
                                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
                                                                zIndex: 50,
                                                                minWidth: '150px',
                                                                padding: '0.35rem 0',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {/* 1. Edit Item */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveProductMenuId(null);
                                                                    handleOpenEditProduct(prod);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem 0.85rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '700',
                                                                    color: '#1E293B',
                                                                    transition: 'background 0.15s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <Edit size={14} color="#3B82F6" />
                                                                <span>Edit Item</span>
                                                            </button>

                                                            {/* 2. Increase Stock */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveProductMenuId(null);
                                                                    handleOpenIncreaseStock(prod);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem 0.85rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '700',
                                                                    color: '#1E293B',
                                                                    transition: 'background 0.15s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <TrendingUp size={14} color="#10B981" />
                                                                <span>Increase Stock</span>
                                                            </button>

                                                            {/* 3. Decrease Stock */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveProductMenuId(null);
                                                                    handleOpenDecreaseStock(prod);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem 0.85rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '700',
                                                                    color: '#1E293B',
                                                                    transition: 'background 0.15s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <TrendingDown size={14} color="#F59E0B" />
                                                                <span>Decrease Stock</span>
                                                            </button>

                                                            {/* Divider */}
                                                            <div style={{ height: '1px', background: '#F1F5F9', margin: '0.25rem 0' }} />

                                                            {/* 4. Delete Item */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveProductMenuId(null);
                                                                    handleDeleteProduct(prod);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem 0.85rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '700',
                                                                    color: '#EF4444',
                                                                    transition: 'background 0.15s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <Trash2 size={14} color="#EF4444" />
                                                                <span>Delete Item</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div style={{ height: '40px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h4>
                                                {prod.sku && <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>SKU: {prod.sku}</span>}
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                                                    {formatCurrency(prod.price || 0)} <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700' }}>/ {prod.unit || 'PCS'}</span>
                                                </span>
                                                <div style={{ 
                                                    padding: '0.15rem 0.4rem', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: '800',
                                                    background: isOutOfStock ? '#FEE2E2' : (isLowStock ? '#FFFBEB' : '#ECFDF5'),
                                                    color: isOutOfStock ? '#B91C1C' : (isLowStock ? '#B45309' : '#047857')
                                                }}>
                                                    {isOutOfStock ? 'OUT' : `${prod.quantity} ${prod.unit || 'PCS'} left`}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Live Cart Workspace */}
            <div style={{ flex: '1 1 40%', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                
                {/* Customer Attachment Row */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', background: '#FFF', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.4rem 0.75rem' }}>
                            <User size={16} color="#64748B" />
                            <input 
                                ref={customerInputRef}
                                type="text" 
                                placeholder="Assign Customer (e.g., Walk-in / Search CRM...)" 
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: '650', color: '#1E293B' }}
                            />
                            {customerName && (
                                <button 
                                    onClick={() => { setCustomerName(''); setCustomerEmail(''); setSelectedCustomerObj(null); }}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: '#94A3B8' }}
                                >
                                    <X size={14} />
                                </button>
                            )}

                            {/* Add Customer Button on Right Side */}
                            <button
                                type="button"
                                onClick={() => setIsAddCustomerModalOpen(true)}
                                title="Add New Customer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ECFDF5',
                                    color: '#047857',
                                    fontWeight: '750',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <UserPlus size={14} />
                                <span>Add Customer</span>
                            </button>
                        </div>

                        {/* Dropdown autocomplete for Customers */}
                        {isCustomerDropdownOpen && customerName.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '4px', zIndex: 30, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.12)', maxHeight: '220px', overflowY: 'auto', padding: '0.25rem 0' }}>
                                {(() => {
                                    const query = customerName.toLowerCase().trim();
                                    const matches = customers.filter(c => {
                                        const nameMatch = (c.name || c.customer_name || c.contact_person || c.business_name || '').toLowerCase().includes(query);
                                        const codeMatch = (c.code || c.customer_code || c.customer_id || '').toLowerCase().includes(query);
                                        const phoneMatch = String(c.phone_number || c.phone || c.contact || c.phonenumber || c.mobile || '').toLowerCase().includes(query);
                                        const emailMatch = (c.email || '').toLowerCase().includes(query);
                                        return nameMatch || codeMatch || phoneMatch || emailMatch;
                                    });

                                    if (matches.length === 0) {
                                        return (
                                            <div style={{ padding: '0.85rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600' }}>
                                                No customer found
                                            </div>
                                        );
                                    }

                                    return matches.slice(0, 6).map(cust => (
                                        <div
                                            key={cust.id}
                                            onClick={() => handleCustomerSelect(cust)}
                                            style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F8FAFC', transition: 'background 0.15s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ECFDF5'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', paddingRight: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>{cust.name}</span>
                                                    {(cust.code || cust.customer_code) && (
                                                        <span style={{ fontSize: '0.68rem', color: '#64748B', background: '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                                                            {cust.code || cust.customer_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: '#64748B', flexWrap: 'wrap' }}>
                                                    {(cust.phone_number || cust.phone) && <span>Phone: {cust.phone_number || cust.phone}</span>}
                                                    {cust.email && <span>Email: {cust.email}</span>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                    ⭐ Loyalty Points: {cust.loyalty_points || cust.points || 0}
                                                </span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                <div 
                                    onClick={() => setIsCustomerDropdownOpen(false)}
                                    style={{ padding: '0.4rem', textAlign: 'center', background: '#F8FAFC', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', cursor: 'pointer', fontWeight: '700' }}>
                                    Close List
                                </div>
                            </div>
                        )}

                        {/* Selected Customer Details Banner */}
                        {selectedCustomerObj && (
                            <div style={{ marginTop: '0.6rem', padding: '0.75rem 0.85rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Customer:</span>
                                        <span style={{ fontWeight: '850', color: '#065F46', fontSize: '0.9rem' }}>{selectedCustomerObj.name}</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => { setCustomerName(''); setCustomerEmail(''); setSelectedCustomerObj(null); }}
                                        style={{ border: 'none', background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '750' }}
                                        title="Change or Remove Customer"
                                    >
                                        Change / Remove
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', color: '#334155', fontWeight: '600', fontSize: '0.78rem', paddingTop: '4px', borderTop: '1px dashed #A7F3D0' }}>
                                    {(selectedCustomerObj.phone_number || selectedCustomerObj.phone) && <span>Phone: <strong>{selectedCustomerObj.phone_number || selectedCustomerObj.phone}</strong></span>}
                                    {selectedCustomerObj.email && <span>Email: <strong>{selectedCustomerObj.email}</strong></span>}
                                    <div style={{ marginLeft: 'auto', fontWeight: '850', color: '#B45309', background: '#FFFBEB', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '0.75rem' }}>
                                        Loyalty Points: <strong>{selectedCustomerObj.loyalty_points || selectedCustomerObj.points || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Held Carts Row */}
                {heldCarts.length > 0 && (
                    <div style={{ padding: '0.5rem 1.25rem', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309', alignSelf: 'center', marginRight: '0.5rem' }}>HELD CARTS:</span>
                        {heldCarts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(hc => (
                            <div
                                key={hc.id}
                                style={{ 
                                    background: '#FFFFFF', 
                                    border: '1px solid #FCD34D', 
                                    padding: '0.3rem 0.6rem', 
                                    borderRadius: '8px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    fontSize: '0.75rem', 
                                    fontWeight: '750', 
                                    color: '#92400E', 
                                    whiteSpace: 'nowrap' 
                                }}
                            >
                                <span 
                                    onClick={() => restoreCart(hc.id)}
                                    style={{ cursor: 'pointer' }}
                                    title="Click to restore cart"
                                >
                                    {hc.customName || hc.customerName || `Cart #${hc.displayId}`} ({hc.cart.length} items)
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', borderLeft: '1px solid #FEF3C7', paddingLeft: '6px' }}>
                                    <Edit 
                                        size={12} 
                                        style={{ cursor: 'pointer', color: '#D97706' }} 
                                        onClick={() => renameHeldCart(hc.id)} 
                                        title="Rename Cart"
                                    />
                                    <Trash2 
                                        size={12} 
                                        style={{ cursor: 'pointer', color: '#EF4444' }} 
                                        onClick={() => deleteHeldCart(hc.id)} 
                                        title="Discard Cart"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Live Cart Items Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8', gap: '0.75rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Receipt size={24} opacity={0.6} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Cart is Empty</span>
                            <span style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: '180px' }}>Select products from catalog to begin billing.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Cart List ({cart.length})</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={holdCart} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#334155', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Hold Cart</button>
                                    <button onClick={clearCart} style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Clear All</button>
                                </div>
                            </div>
                            
                            <AnimatePresence initial={false}>
                                {cart.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            background: '#FFFFFF',
                                            padding: '0.65rem 0',
                                            borderBottom: '1px solid #F8FAFC'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#1E293B' }}>{item.name}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                                <span>{formatCurrency(item.price)} / {item.unit || 'PCS'}</span>
                                            </div>
                                        </div>

                                        {/* Quantity Selectors */}
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '8px', padding: '2px' }}>
                                            <button 
                                                type="button"
                                                onClick={() => updateCartQty(item.id, isDecimalUnit(item.unit) ? -0.25 : -1)} 
                                                style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                            >
                                                <Minus size={13} />
                                            </button>
                                            
                                            <input 
                                                type="number"
                                                step={isDecimalUnit(item.unit) ? "any" : "1"}
                                                min="0.001"
                                                value={item.quantity}
                                                onChange={(e) => updateCartDirectQty(item.id, e.target.value)}
                                                style={{
                                                    width: isDecimalUnit(item.unit) ? '54px' : '32px',
                                                    textAlign: 'center',
                                                    fontSize: '0.82rem',
                                                    fontWeight: '800',
                                                    color: '#1E293B',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none'
                                                }}
                                            />
                                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', paddingRight: '4px' }}>
                                                {item.unit || 'PCS'}
                                            </span>

                                            <button 
                                                type="button"
                                                onClick={() => updateCartQty(item.id, isDecimalUnit(item.unit) ? 0.25 : 1)} 
                                                style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>

                                        <div style={{ width: '70px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{formatCurrency(item.total)}</span>
                                        </div>

                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', padding: '0.25rem', cursor: 'pointer', display: 'flex', opacity: 0.6 }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Dynamic Totals Panel footer */}
                <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                    
                    {/* Discount, Tax & Loyalty Points Quick adjustment Row */}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Discount</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setDiscountType('percentage')} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.65rem', fontWeight: discountType === 'percentage' ? '800' : '400', color: discountType === 'percentage' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}>%</button>
                                    <span style={{ fontSize: '0.65rem', color: '#E2E8F0' }}>|</span>
                                    <button onClick={() => setDiscountType('flat')} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.65rem', fontWeight: discountType === 'flat' ? '800' : '400', color: discountType === 'flat' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}>Flat</button>
                                </div>
                            </div>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={discountVal || ''}
                                onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                                style={{ width: '100%', padding: '0.4rem 0.75rem', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>GST Tax (%)</span>
                            <select 
                                value={taxRate}
                                onChange={(e) => setTaxRate(parseInt(e.target.value))}
                                style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '700', background: 'white', outline: 'none' }}>
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#DC2626', textTransform: 'uppercase', marginBottom: '2px' }}>Pts Redeemed</span>
                            <input 
                                type="number"
                                step="any"
                                min="0"
                                max={maxRedeemablePoints}
                                placeholder="0"
                                disabled={!selectedCustomerObj || availableCustomerPoints <= 0}
                                value={selectedCustomerObj ? (loyaltyPointsRedeemed || '') : ''}
                                onChange={(e) => {
                                    if (!selectedCustomerObj) {
                                        setLoyaltyPointsRedeemed(0);
                                        return;
                                    }
                                    const rawVal = parseFloat(e.target.value);
                                    if (isNaN(rawVal) || rawVal <= 0) {
                                        setLoyaltyPointsRedeemed(0);
                                        return;
                                    }
                                    if (rawVal > availableCustomerPoints) {
                                        alert(`Cannot redeem more than available balance (${availableCustomerPoints} pts)`);
                                        setLoyaltyPointsRedeemed(availableCustomerPoints);
                                    } else {
                                        setLoyaltyPointsRedeemed(rawVal);
                                    }
                                }}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.4rem 0.75rem', 
                                    boxSizing: 'border-box', 
                                    borderRadius: '8px', 
                                    border: '1px solid #FCA5A5', 
                                    background: !selectedCustomerObj ? '#F8FAFC' : '#FEF2F2', 
                                    fontSize: '0.85rem', 
                                    fontWeight: '800', 
                                    color: '#DC2626', 
                                    outline: 'none',
                                    opacity: !selectedCustomerObj ? 0.6 : 1 
                                }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', marginBottom: '2px' }}>Pts Earned</span>
                            <input 
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0"
                                value={loyaltyPointsEarned || ''}
                                onChange={(e) => {
                                    setLoyaltyPointsEarned(e.target.value);
                                    setIsPtsEarnedManuallyEdited(true);
                                }}
                                style={{ width: '100%', padding: '0.4rem 0.75rem', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #FCD34D', background: '#FFFBEB', fontSize: '0.85rem', fontWeight: '800', color: '#B45309', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Receipt Tally breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#EF4444', fontWeight: '500' }}>
                                <span>Discount ({discountType === 'percentage' ? `${discountVal}%` : 'Flat'})</span>
                                <span>- {formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                            <span>GST ({taxRate}%)</span>
                            <span>{formatCurrency(calculatedTax)}</span>
                        </div>
                        {loyaltyDiscountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#DC2626', fontWeight: '600' }}>
                                <span>Loyalty Discount ({effectivePointsRedeemed} pts)</span>
                                <span>- {formatCurrency(loyaltyDiscountAmount)}</span>
                            </div>
                        )}
                        {Math.abs(roundOff) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94A3B8' }}>
                                <span>Round Off</span>
                                <span>{roundOff > 0 ? '+' : ''}{currency.symbol}{roundOff.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Grand total Display */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>Payable Amount</span>
                        <span style={{ fontSize: '1.65rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.03em' }}>{formatCurrency(finalTotal)}</span>
                    </div>

                    {/* Checkout Payment Action Matrix */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('Cash')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <DollarSign size={18} />
                            Cash (F1)
                        </button>

                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('UPI')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <Smartphone size={18} />
                            UPI (F2)
                        </button>

                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('Card')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <CreditCard size={18} />
                            Card (F3)
                        </button>
                    </div>
                </div>
            </div>

            {/* SUCCESS RECEIPT POPUP MODAL */}
            {showReceiptModal && lastOrderData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'white',
                            width: '380px',
                            borderRadius: '20px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Close (X) Icon Button */}
                        <button
                            onClick={() => setShowReceiptModal(false)}
                            aria-label="Close receipt modal"
                            title="Close"
                            style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '-12px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 10,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F8FAFC';
                                e.currentTarget.style.color = '#0F172A';
                                e.currentTarget.style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FFFFFF';
                                e.currentTarget.style.color = '#334155';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>

                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '1.5rem', color: 'white', textAlign: 'center', position: 'relative', borderRadius: '20px 20px 0 0' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <Check size={24} strokeWidth={3} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>Payment Successful!</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Order {lastOrderData?.invoice_number || ''} generated</p>
                        </div>

                        {/* Thermal Receipt Workspace (to print) */}
                        <div id="thermal-receipt-pane" style={{ padding: '1.5rem', background: '#FFFFFF', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000' }}>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', textTransform: 'uppercase' }}>CLIKS BUSINESS POS</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem' }}>Phone: +91 98765 43210</p>
                                <p style={{ margin: '2px 0 8px', fontSize: '0.75rem' }}>Receipt No: {lastOrderData?.invoice_number || 'N/A'}</p>
                                
                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />
                                
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Date: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    <span>Time: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', marginBottom: '8px' }}>
                                    <span>Customer: {lastOrderData?.client_name || 'Walk-in Customer'}</span>
                                </div>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '4px 0 8px' }} />

                                {/* Items Table */}
                                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                                            <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                                            <th style={{ textAlign: 'right', padding: '4px 0' }}>RATE</th>
                                            <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {((lastOrderData?.items && (typeof lastOrderData.items === 'string' ? JSON.parse(lastOrderData.items) : lastOrderData.items)) || []).map((item, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '4px 0', maxWidth: '120px', overflow: 'hidden' }}>{item?.description || item?.name || 'Item'}</td>
                                                <td style={{ padding: '4px 0', textAlign: 'center' }}>{item?.quantity || 0} {item?.unit || 'PCS'}</td>
                                                <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{item?.price || item?.unit_price || 0}/{item?.unit || 'PCS'}</td>
                                                <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(item?.total || item?.amount || (item?.price && item?.quantity ? item.price * item.quantity : 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />

                                {/* Tally */}
                                <div style={{ width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>SUBTOTAL:</span>
                                        <span>{formatCurrency(lastOrderData?.amount || 0)}</span>
                                    </div>
                                    {lastOrderData?.discount_amount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>DISCOUNT:</span>
                                            <span>- {formatCurrency(lastOrderData.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>TAX (GST):</span>
                                        <span>{formatCurrency(lastOrderData?.tax_amount || 0)}</span>
                                    </div>
                                    {(lastOrderData?.loyalty_discount_amount > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                            <span>LOYALTY DISCOUNT:</span>
                                            <span>- {formatCurrency(lastOrderData?.loyalty_discount_amount || lastOrderData?.loyalty_points_redeemed || 0)}</span>
                                        </div>
                                    )}
                                    {Math.abs(lastOrderData?.round_off || 0) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>ROUND OFF:</span>
                                            <span>{lastOrderData.round_off > 0 ? '+' : ''}{formatCurrency(lastOrderData.round_off)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '4px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                        <span>GRAND TOTAL:</span>
                                        <span>{formatCurrency(lastOrderData?.total_amount || 0)}</span>
                                    </div>
                                </div>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '12px 0' }} />
                                
                                {/* Loyalty Points Summary on Receipt */}
                                {(lastOrderData?.existing_loyalty_points !== undefined || lastOrderData?.loyalty_points_earned > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
                                    <div style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left', marginBottom: '6px' }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: 'bold', textTransform: 'uppercase' }}>LOYALTY POINTS:</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Existing Points:</span>
                                            <span>{lastOrderData?.existing_loyalty_points ?? 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Points Redeemed:</span>
                                            <span>{lastOrderData?.loyalty_points_redeemed ?? 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Points Earned:</span>
                                            <span>{lastOrderData?.loyalty_points_earned ?? 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px', borderTop: '1px dotted #000', paddingTop: '2px' }}>
                                            <span>Remaining Points:</span>
                                            <span>{lastOrderData?.remaining_loyalty_points ?? lastOrderData?.final_loyalty_points ?? Math.max(0, (lastOrderData?.existing_loyalty_points || 0) - (lastOrderData?.loyalty_points_redeemed || 0) + (lastOrderData?.loyalty_points_earned || 0))}</span>
                                        </div>
                                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0 4px' }} />
                                    </div>
                                )}

                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>MODE: {(lastOrderData?.payment_mode || paymentMode || 'CASH').toUpperCase()}</p>
                                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>Thank you for your business!</p>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div style={{ padding: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem', borderRadius: '0 0 20px 20px' }}>
                            <button 
                                onClick={printReceipt}
                                style={{ 
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                    padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', 
                                    background: 'white', color: '#1E293B', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                                }}
                            >
                                <Printer size={16} /> Print
                            </button>
                            <button 
                                onClick={() => setShowReceiptModal(false)}
                                style={{ 
                                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', 
                                    background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                                }}
                            >
                                New Order
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* QUICK ADD PRODUCT MODAL (FOR POS CATALOG) */}
            {isAddProductModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', background: '#ECFDF5', color: '#10B981' }}>
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>{editingProduct ? 'Edit Product' : 'Quick Register Item'}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{editingProduct ? 'Update product details in POS catalog' : 'Instantly list new products in POS catalog'}</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsAddProductModalOpen(false); setEditingProduct(null); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const payload = {
                                name: newProductData.name,
                                product_name: newProductData.name,
                                sku: newProductData.sku || `SKU-${Date.now().toString().slice(-4)}`,
                                category: newProductData.category || 'General',
                                category_name: newProductData.category || 'General',
                                unit: newProductData.unit || 'PCS',
                                quantity: parseFloat(newProductData.quantity) || 0,
                                stock: parseFloat(newProductData.quantity) || 0,
                                purchase_price: parseFloat(newProductData.selling_price) * 0.7,
                                selling_price: parseFloat(newProductData.selling_price) || 0,
                                price: parseFloat(newProductData.selling_price) || 0,
                                tax_percentage: parseFloat(newProductData.tax_percentage) || 18,
                                hsn_code: newProductData.hsn_code || ''
                            };
                            if (editingProduct) {
                                updateProductMutation.mutate({ id: editingProduct.id, data: payload, source: editingProduct.source });
                            } else {
                                createProductMutation.mutate(payload);
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Item Name *</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newProductData.name} 
                                    onChange={(e) => setNewProductData({...newProductData, name: e.target.value})} 
                                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }} 
                                    placeholder="e.g. Tomato / Rice / Milk" 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Selling Price ({currency.symbol}) *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0.01"
                                        step="any"
                                        value={newProductData.selling_price} 
                                        onChange={(e) => setNewProductData({...newProductData, selling_price: e.target.value})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }} 
                                        placeholder="0.00" 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Unit *</label>
                                    <select 
                                        value={newProductData.unit || 'PCS'} 
                                        onChange={(e) => setNewProductData({...newProductData, unit: e.target.value})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                                    >
                                        <option value="PCS">PCS (Pieces)</option>
                                        <option value="GRAM">GRAM (g)</option>
                                        <option value="KG">KG (Kilogram)</option>
                                        <option value="LITRE">LITRE (L)</option>
                                        <option value="ML">ML (Millilitre)</option>
                                        <option value="DOZEN">DOZEN</option>
                                        <option value="BOX">BOX</option>
                                        <option value="PACK">PACK</option>
                                        <option value="QUANTITY">QUANTITY</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Opening Stock *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        value={newProductData.quantity} 
                                        onChange={(e) => setNewProductData({...newProductData, quantity: e.target.value})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }} 
                                        placeholder="Qty left" 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Category</label>
                                    <input 
                                        type="text" 
                                        value={newProductData.category} 
                                        onChange={(e) => setNewProductData({...newProductData, category: e.target.value})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }} 
                                        placeholder="General" 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Tax (GST %)</label>
                                    <select 
                                        value={newProductData.tax_percentage} 
                                        onChange={(e) => setNewProductData({...newProductData, tax_percentage: parseInt(e.target.value)})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                                    >
                                        <option value={0}>0% GST</option>
                                        <option value={5}>5% GST</option>
                                        <option value={12}>12% GST</option>
                                        <option value={18}>18% GST</option>
                                        <option value={28}>28% GST</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Barcode / SKU</label>
                                    <input 
                                        type="text" 
                                        value={newProductData.sku} 
                                        onChange={(e) => setNewProductData({...newProductData, sku: e.target.value})} 
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }} 
                                    />
                                </div>
                                <div style={{ position: 'relative' }} ref={hsnInfoRef}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>HSN / SAC Code</label>
                                        {isHsnLoading && <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '600' }}>Searching...</span>}
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            value={newProductData.hsn_code || ''} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setNewProductData(prev => ({ ...prev, hsn_code: val }));
                                                setHsnQueryOverride(val);
                                                setShowHsnInfoPopover(false);
                                            }} 
                                            onFocus={() => {
                                                if ((newProductData.hsn_code || newProductData.name) && ((newProductData.hsn_code || '').length >= 2 || (newProductData.name || '').length >= 2)) {
                                                    setShowHsnDropdown(true);
                                                }
                                            }}
                                            style={{ width: '100%', padding: '0.75rem', paddingRight: '2.25rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }} 
                                            placeholder="e.g. 1006" 
                                        />
                                        
                                        {/* Info ⓘ Icon inside input aligned to far right */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (showHsnInfoPopover) {
                                                    setShowHsnInfoPopover(false);
                                                } else {
                                                    fetchAndShowHsnDescription(newProductData.hsn_code);
                                                }
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                color: '#047857',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2px',
                                                borderRadius: '50%',
                                                zIndex: 10
                                            }}
                                            title="View HSN/SAC Description"
                                        >
                                            <Info size={16} color="#047857" />
                                        </button>

                                        {/* HSN Info Popover / Tooltip */}
                                        {showHsnInfoPopover && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '100%',
                                                right: 0,
                                                width: '280px',
                                                zIndex: 1300,
                                                marginBottom: '6px',
                                                background: '#1E293B',
                                                color: 'white',
                                                borderRadius: '14px',
                                                padding: '0.85rem 1rem',
                                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)',
                                                fontSize: '0.8rem',
                                                lineHeight: '1.4'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid #334155', paddingBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '0.75rem', color: '#38BDF8', textTransform: 'uppercase' }}>
                                                        HSN {newProductData.hsn_code ? newProductData.hsn_code : ''} Details
                                                    </span>
                                                    <button type="button" onClick={() => setShowHsnInfoPopover(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                {isHsnInfoLoading ? (
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Loading description...</div>
                                                ) : (
                                                    <div style={{ maxHeight: '140px', overflowY: 'auto', color: '#F1F5F9', wordBreak: 'break-word' }}>
                                                        {hsnInfoDescription || 'No HSN/SAC description available for this code.'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* HSN Suggestions Dropdown */}
                                    {showHsnDropdown && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '100%', 
                                            left: 0, 
                                            right: 0, 
                                            zIndex: 1300, 
                                            marginTop: '6px', 
                                            background: 'white', 
                                            borderRadius: '16px', 
                                            border: '1px solid #E2E8F0', 
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
                                            maxHeight: '200px', 
                                            overflowY: 'auto',
                                            padding: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderBottom: '1px solid #F1F5F9' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>HSN/SAC Suggestions</span>
                                                <button type="button" onClick={() => setShowHsnDropdown(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}><X size={14} /></button>
                                            </div>

                                            {isHsnLoading && (
                                                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>Searching master catalog...</div>
                                            )}

                                            {!isHsnLoading && hsnSuggestions.length === 0 && hasSearchedHsn && (
                                                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>No matching HSN found</div>
                                            )}

                                            {!isHsnLoading && hsnSuggestions.map((item, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => {
                                                        setNewProductData(prev => ({ ...prev, hsn_code: item.hsnCode }));
                                                        setShowHsnDropdown(false);
                                                        setHsnInfoDescription(item.description);
                                                    }}
                                                    style={{ 
                                                        padding: '0.6rem 0.75rem', 
                                                        borderRadius: '10px', 
                                                        cursor: 'pointer', 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        transition: 'background 0.15s ease',
                                                        borderBottom: idx < hsnSuggestions.length - 1 ? '1px solid #F8FAFC' : 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#ECFDF5'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ flex: 1, paddingRight: '0.5rem', overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: '850', fontSize: '0.85rem', color: '#047857' }}>{item.hsnCode}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        style={{ 
                                                            border: 'none', 
                                                            background: '#ECFDF5', 
                                                            color: '#047857', 
                                                            fontWeight: '700', 
                                                            fontSize: '0.75rem', 
                                                            padding: '0.35rem 0.65rem', 
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createProductMutation.isPending}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.85rem',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
                                    opacity: createProductMutation.isPending ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {createProductMutation.isPending ? 'Registering...' : 'Add to POS & List'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* POS ORDER HISTORY MODAL */}
            {showHistoryModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ background: 'white', width: '100%', maxWidth: '800px', height: '85vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B' }}>
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>POS Barcode History</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Recent transactions and scanned items</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowHistoryModal(false)} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div style={{ padding: '0.75rem 2rem', background: '#FFF', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search Invoice or Client..." 
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                                />
                            </div>
                            <input 
                                type="date" 
                                value={historyDate}
                                onChange={(e) => setHistoryDate(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B' }}
                            />
                            <select 
                                value={historyPaymentMode}
                                onChange={(e) => setHistoryPaymentMode(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B' }}
                            >
                                <option value="All">All Payments</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div>

                        {/* Modal Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', background: '#F8FAFC' }}>
                            {isHistoryLoading ? (
                                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748B' }}>
                                    <span>Loading archive...</span>
                                </div>
                            ) : orderHistory.filter(order => {
                                const matchesSearch = 
                                    (order.invoice_number || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                                    (order.client_name || '').toLowerCase().includes(historySearch.toLowerCase());
                                
                                const matchesDate = !historyDate || order.created_at.startsWith(historyDate);
                                const matchesMode = historyPaymentMode === 'All' || order.payment_mode === historyPaymentMode;
                                
                                return matchesSearch && matchesDate && matchesMode;
                            }).length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8', gap: '1rem' }}>
                                    <History size={48} opacity={0.2} />
                                    <span>No history records found</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {orderHistory
                                        .filter(order => {
                                            const matchesSearch = 
                                                (order.invoice_number || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                                                (order.client_name || '').toLowerCase().includes(historySearch.toLowerCase());
                                            
                                            const matchesDate = !historyDate || order.created_at.startsWith(historyDate);
                                            const matchesMode = historyPaymentMode === 'All' || order.payment_mode === historyPaymentMode;
                                            
                                            return matchesSearch && matchesDate && matchesMode;
                                        })
                                        .map(order => (
                                        <div 
                                            key={order.id}
                                            style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A' }}>{order.invoice_number}</span>
                                                        <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#ECFDF5', color: '#047857', fontSize: '0.65rem', fontWeight: '800' }}>PAID</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748B' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(order.created_at).toLocaleString()}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {order.client_name}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> {order.payment_mode}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{formatCurrency(order.total_amount || 0)}</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{order.items?.length || 0} items</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setLastOrderData(order);
                                                            setShowReceiptModal(true);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '0.45rem 0.85rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid #10B981',
                                                            background: '#ECFDF5',
                                                            color: '#047857',
                                                            fontWeight: '750',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#10B981';
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#ECFDF5';
                                                            e.currentTarget.style.color = '#047857';
                                                        }}
                                                    >
                                                        <Receipt size={14} /> Show Bill
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item list in history */}
                                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                                    <FilterableTableHead columns={[
        { key: 'item', label: 'Item', placeholder: 'Name/SKU' },
        { key: 'qty', label: 'Qty', placeholder: 'e.g. 2' },
        { key: 'amount', label: 'Amount', placeholder: 'e.g. 500' }
    ]} onFilterChange={setColFilters} />
                                                    <tbody>
                                                        {order.items?.map((item, idx) => (
                                                            <tr key={idx} style={{ color: '#1E293B' }}>
                                                                <td style={{ padding: '6px 0', fontWeight: '650' }}>
                                                                    {item.description}
                                                                    {item.sku && <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>[{item.sku}]</span>}
                                                                </td>
                                                                <td style={{ padding: '6px 0', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                                                                <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(item.price || 0)}</td>
                                                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.total || 0)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #F1F5F9', background: '#FFF', textAlign: 'right' }}>
                            <button 
                                onClick={() => setShowHistoryModal(false)}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                Close History
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* ADD CUSTOMER MODAL */}
            {isAddCustomerModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', background: '#ECFDF5', color: '#10B981' }}>
                                    <UserPlus size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>Add New Customer</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Create profile and assign to current order</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddCustomerModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Customer Name *</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newCustomerData.name} 
                                    onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })} 
                                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 650 }} 
                                    placeholder="e.g. John Doe / Acme Corp" 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={newCustomerData.phone_number} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewCustomerData({ ...newCustomerData, phone_number: val });
                                            if (touchedCustomerFields.phone) {
                                                setCustomerErrors(prev => ({ ...prev, phone: validateCustomerPhone(val) }));
                                            }
                                        }} 
                                        onBlur={() => {
                                            setTouchedCustomerFields(prev => ({ ...prev, phone: true }));
                                            setCustomerErrors(prev => ({ ...prev, phone: validateCustomerPhone(newCustomerData.phone_number) }));
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: customerErrors.phone ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }} 
                                        placeholder="9876543210" 
                                    />
                                    {customerErrors.phone && (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#EF4444', fontWeight: '700' }}>
                                            {customerErrors.phone}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Email Address</label>
                                    <input 
                                        type="text" 
                                        value={newCustomerData.email} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewCustomerData({ ...newCustomerData, email: val });
                                            if (touchedCustomerFields.email) {
                                                setCustomerErrors(prev => ({ ...prev, email: validateCustomerEmail(val) }));
                                            }
                                        }} 
                                        onBlur={() => {
                                            setTouchedCustomerFields(prev => ({ ...prev, email: true }));
                                            setCustomerErrors(prev => ({ ...prev, email: validateCustomerEmail(newCustomerData.email) }));
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: customerErrors.email ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }} 
                                        placeholder="customer@bnxmail.com" 
                                    />
                                    {customerErrors.email && (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#EF4444', fontWeight: '700' }}>
                                            {customerErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>GSTIN (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newCustomerData.gstin} 
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        setNewCustomerData({ ...newCustomerData, gstin: val });
                                        if (touchedCustomerFields.gstin) {
                                            setCustomerErrors(prev => ({ ...prev, gstin: validateCustomerGstin(val) }));
                                        }
                                    }} 
                                    onBlur={() => {
                                        setTouchedCustomerFields(prev => ({ ...prev, gstin: true }));
                                        setCustomerErrors(prev => ({ ...prev, gstin: validateCustomerGstin(newCustomerData.gstin) }));
                                    }}
                                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: customerErrors.gstin ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }} 
                                    placeholder="27AAAAA0000A1Z5" 
                                />
                                {customerErrors.gstin && (
                                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#EF4444', fontWeight: '700' }}>
                                        {customerErrors.gstin}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Billing Address</label>
                                <textarea 
                                    rows={2}
                                    value={newCustomerData.billing_address} 
                                    onChange={(e) => setNewCustomerData({ ...newCustomerData, billing_address: e.target.value })} 
                                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, resize: 'none' }} 
                                    placeholder="Street address, City, Pincode" 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddCustomerModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        background: 'white',
                                        color: '#64748B',
                                        fontWeight: '750',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingCustomer}
                                    style={{
                                        flex: 1.5,
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: '#10B981',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        opacity: isSavingCustomer ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <UserPlus size={16} />
                                    {isSavingCustomer ? 'Saving...' : 'Register & Assign'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* INCREASE STOCK MODAL */}
            {isIncreaseStockModalOpen && stockTargetProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Increase Stock</h3>
                            <button 
                                type="button" 
                                onClick={() => { setIsIncreaseStockModalOpen(false); setStockTargetProduct(null); }}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Product</div>
                                <div style={{ color: '#0F172A', fontWeight: '850', fontSize: '0.95rem' }}>{stockTargetProduct.name}</div>
                                <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px' }}>
                                    Current Stock: <strong style={{ color: '#047857' }}>{stockTargetProduct.quantity}</strong>
                                </div>
                            </div>

                            <label style={{ fontWeight: '750', color: '#334155', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                Quantity to Add *
                            </label>
                            <input 
                                type="number"
                                min="1"
                                placeholder="e.g. 20"
                                value={addedStockQty}
                                onChange={(e) => setAddedStockQty(e.target.value)}
                                style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', fontWeight: '700' }}
                                autoFocus
                            />

                            {addedStockQty && parseFloat(addedStockQty) > 0 && (
                                <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: '700', background: '#ECFDF5', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                                    New Stock: {stockTargetProduct.quantity} + {parseFloat(addedStockQty)} = <strong>{stockTargetProduct.quantity + parseFloat(addedStockQty)}</strong>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => { setIsIncreaseStockModalOpen(false); setStockTargetProduct(null); }}
                                style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={increaseStockMutation.isPending}
                                onClick={() => {
                                    const qtyToAdd = parseFloat(addedStockQty) || 0;
                                    if (qtyToAdd <= 0) {
                                        alert('Please enter a valid positive quantity to add.');
                                        return;
                                    }
                                    const newStock = stockTargetProduct.quantity + qtyToAdd;
                                    increaseStockMutation.mutate({
                                        id: stockTargetProduct.id,
                                        newStock,
                                        source: stockTargetProduct.source
                                    });
                                }}
                                style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none', background: '#10B981', color: '#FFF', fontWeight: '750', cursor: 'pointer', fontSize: '0.82rem', boxShadow: '0 2px 6px rgba(16,185,129,0.3)', opacity: increaseStockMutation.isPending ? 0.7 : 1 }}
                            >
                                {increaseStockMutation.isPending ? 'Updating...' : 'Add Stock'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* DECREASE STOCK MODAL */}
            {isDecreaseStockModalOpen && stockTargetProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Decrease Stock</h3>
                            <button 
                                type="button" 
                                onClick={() => { setIsDecreaseStockModalOpen(false); setStockTargetProduct(null); }}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Product</div>
                                <div style={{ color: '#0F172A', fontWeight: '850', fontSize: '0.95rem' }}>{stockTargetProduct.name}</div>
                                <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px' }}>
                                    Current Stock: <strong style={{ color: '#047857' }}>{stockTargetProduct.quantity} {stockTargetProduct.unit || 'PCS'}</strong>
                                </div>
                            </div>

                            <label style={{ fontWeight: '750', color: '#334155', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                Quantity to Decrease *
                            </label>
                            <input 
                                type="number"
                                min="0.001"
                                step="any"
                                placeholder="e.g. 5"
                                value={decreasedStockQty}
                                onChange={(e) => setDecreasedStockQty(e.target.value)}
                                style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', fontWeight: '700' }}
                                autoFocus
                            />

                            {decreasedStockQty && parseFloat(decreasedStockQty) > 0 && parseFloat(decreasedStockQty) <= stockTargetProduct.quantity && (
                                <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: '700', background: '#FFFBEB', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                                    New Stock: {stockTargetProduct.quantity} - {parseFloat(decreasedStockQty)} = <strong>{parseFloat((stockTargetProduct.quantity - parseFloat(decreasedStockQty)).toFixed(3))} {stockTargetProduct.unit || 'PCS'}</strong>
                                </div>
                            )}

                            {decreasedStockQty && parseFloat(decreasedStockQty) > stockTargetProduct.quantity && (
                                <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: '700', background: '#FEF2F2', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                                    Cannot decrease more than current stock ({stockTargetProduct.quantity} {stockTargetProduct.unit || 'PCS'}).
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => { setIsDecreaseStockModalOpen(false); setStockTargetProduct(null); }}
                                style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={decreaseStockMutation.isPending}
                                onClick={() => {
                                    const qtyToSub = parseFloat(decreasedStockQty) || 0;
                                    if (qtyToSub <= 0) {
                                        alert('Please enter a valid positive quantity to decrease.');
                                        return;
                                    }
                                    if (qtyToSub > stockTargetProduct.quantity) {
                                        alert(`Cannot decrease more stock than currently available!\n\nCurrent stock: ${stockTargetProduct.quantity} ${stockTargetProduct.unit || 'PCS'}\nEntered reduction: ${qtyToSub}`);
                                        return;
                                    }
                                    const newStock = parseFloat((stockTargetProduct.quantity - qtyToSub).toFixed(3));
                                    decreaseStockMutation.mutate({
                                        id: stockTargetProduct.id,
                                        newStock,
                                        source: stockTargetProduct.source
                                    });
                                }}
                                style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none', background: '#F59E0B', color: '#FFF', fontWeight: '750', cursor: 'pointer', fontSize: '0.82rem', boxShadow: '0 2px 6px rgba(245,158,11,0.3)', opacity: decreaseStockMutation.isPending ? 0.7 : 1 }}
                            >
                                {decreaseStockMutation.isPending ? 'Updating...' : 'Decrease Stock'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BusinessPOS;
