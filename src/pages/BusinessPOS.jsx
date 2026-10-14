import React, { useState, useRef } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrency, useAuth } from '../context';
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
    ChevronUp,
    ChevronDown,
    Edit,
    Edit2,
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
    MoreVertical,
    Tag
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../services/inventoryService';
import { productsService } from '../services/productsService';
import { crmService } from '../services/crmService';
import { posService } from '../services/posService';
import { stockService } from '../services/stockService';
import { hsnService } from '../services/hsnService';
import { warehouseService } from '../services/warehouseService';
import { settingsService } from '../services/settingsService';
import { profileService } from '../services/profileService';
import '../App.css';
import { customConfirm, customPrompt } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';
import QuickRegisterItemModal from '../components/pos/QuickRegisterItemModal';

const POS_SESSION_STORAGE_KEY = 'cliks_pos_billing_session';

const getInitialPosSession = () => {
    try {
        const saved = sessionStorage.getItem(POS_SESSION_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('[POS Session Restore Error]:', e);
    }
    return null;
};

const BusinessPOS = () => {
    const { currency, formatCurrency } = useCurrency();
    const { selectedPlan, user } = useAuth();
    const isStarterPlan = (selectedPlan || user?.tier) === 'Starter Plan';
    const queryClient = useQueryClient();

    const initialPosSession = React.useMemo(() => getInitialPosSession(), []);

    const [cart, setCart] = useState(() => initialPosSession?.cart || []);
    const [colFilters, setColFilters] = React.useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(() => initialPosSession?.selectedCategory || 'All');
    const [selectedWarehouseIds, setSelectedWarehouseIds] = useState(() => initialPosSession?.selectedWarehouseIds || []);
    const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
    const warehouseDropdownRef = React.useRef(null);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const categoryDropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(event.target)) {
                setIsWarehouseDropdownOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleWarehouseSelection = (whId) => {
        const idStr = String(whId);
        setSelectedWarehouseIds(prev =>
            prev.includes(idStr)
                ? prev.filter(id => id !== idStr)
                : [...prev, idStr]
        );
    };

    const [customerName, setCustomerName] = useState(() => initialPosSession?.customerName || '');
    const [customerEmail, setCustomerEmail] = useState(() => initialPosSession?.customerEmail || '');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [selectedCustomerObj, setSelectedCustomerObj] = useState(() => initialPosSession?.selectedCustomerObj || null);

    // Panel Expand/Collapse State
    const [isCustomerSectionExpanded, setIsCustomerSectionExpanded] = useState(true);
    const [isTotalsSectionExpanded, setIsTotalsSectionExpanded] = useState(true);

    // Hold Cart State
    const [heldCarts, setHeldCarts] = useState(() => initialPosSession?.heldCarts || []);
    const [holdCounter, setHoldCounter] = useState(() => initialPosSession?.holdCounter || 1);
    const [activeHeldCartInfo, setActiveHeldCartInfo] = useState(() => initialPosSession?.activeHeldCartInfo || null);

    const [discountType, setDiscountType] = useState(() => initialPosSession?.discountType || 'percentage'); // 'percentage' | 'flat'
    const [discountVal, setDiscountVal] = useState(() => initialPosSession?.discountVal !== undefined ? initialPosSession.discountVal : 0);
    const [taxRate, setTaxRate] = useState(() => initialPosSession?.taxRate !== undefined ? initialPosSession.taxRate : 18); // Default GST
    const [paymentMode] = useState('Cash');
    const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(() => initialPosSession?.loyaltyPointsEarned || 0);
    const [loyaltyPointsRedeemed, setLoyaltyPointsRedeemed] = useState(() => initialPosSession?.loyaltyPointsRedeemed || 0);
    const [isPtsEarnedManuallyEdited, setIsPtsEarnedManuallyEdited] = useState(() => initialPosSession?.isPtsEarnedManuallyEdited || false);

    // Auto-save in-progress POS billing session to sessionStorage when navigating between modules
    React.useEffect(() => {
        try {
            const hasData = (cart && cart.length > 0) ||
                Boolean(customerName) ||
                Boolean(customerEmail) ||
                Boolean(selectedCustomerObj) ||
                (heldCarts && heldCarts.length > 0) ||
                discountVal > 0 ||
                loyaltyPointsEarned > 0 ||
                loyaltyPointsRedeemed > 0;

            if (hasData) {
                const sessionData = {
                    cart,
                    customerName,
                    customerEmail,
                    selectedCustomerObj,
                    heldCarts,
                    holdCounter,
                    activeHeldCartInfo,
                    discountType,
                    discountVal,
                    taxRate,
                    loyaltyPointsEarned,
                    loyaltyPointsRedeemed,
                    isPtsEarnedManuallyEdited,
                    selectedCategory,
                    selectedWarehouseIds
                };
                sessionStorage.setItem(POS_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            } else {
                sessionStorage.removeItem(POS_SESSION_STORAGE_KEY);
            }
        } catch (e) {
            console.error('[POS Session Save Error]:', e);
        }
    }, [
        cart,
        customerName,
        customerEmail,
        selectedCustomerObj,
        heldCarts,
        holdCounter,
        activeHeldCartInfo,
        discountType,
        discountVal,
        taxRate,
        loyaltyPointsEarned,
        loyaltyPointsRedeemed,
        isPtsEarnedManuallyEdited,
        selectedCategory,
        selectedWarehouseIds
    ]);

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
        hsn_code: '',
        isUnlimited: false
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

    // 1. Fetch Customers for CRM & Quick Search
    const { data: customers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            if (Array.isArray(res)) return res;
            const raw = res?.data?.data ?? res?.data ?? res?.customers ?? [];
            return Array.isArray(raw) ? raw : [];
        }
    });

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
        const existing = customers.find(c => {
            const p = String(c.phone_number || c.phone || c.contact || c.phonenumber || c.mobile || '').trim();
            return p && p === clean;
        });
        if (existing) {
            return `Already a customer with this number (${existing.name})`;
        }
        return '';
    };

    const validateCustomerEmail = (val) => {
        if (!val || !val.trim()) return '';
        const clean = val.trim().toLowerCase();
        if (!clean.endsWith('@bnxmail.com') || !/^[^\s@]+@bnxmail\.com$/.test(clean)) {
            return 'Email must use the @bnxmail.com domain (e.g. name@bnxmail.com).';
        }
        const existing = customers.find(c => {
            const em = String(c.email || '').trim().toLowerCase();
            return em && em === clean;
        });
        if (existing) {
            return `Already a customer with this email (${existing.name})`;
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
            alert(phoneErr || emailErr || gstinErr);
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
            const errMsg = err?.response?.data?.message || err?.response?.data?.error || err.message;
            alert(errMsg || 'Failed to register customer. Please try again.');
        } finally {
            setIsSavingCustomer(false);
        }
    };

    // Dynamic Master Settings (loyalty points, round-off, etc.)
    const { data: userSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const [realtimeConfig, setRealtimeConfig] = useState(null);
    const activeConfig = React.useMemo(() => {
        const serverCfg = userSettings?.data || userSettings || {};
        return {
            ...serverCfg,
            ...(realtimeConfig || {})
        };
    }, [userSettings, realtimeConfig]);

    // Profile query for business & shop defaults
    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: profileService.getProfile,
        refetchOnWindowFocus: false
    });
    const userProfile = React.useMemo(() => profileData?.data || profileData || {}, [profileData]);

    // Customization Org Profile state (synced with /customization and localStorage)
    const [customizationProfile, setCustomizationProfile] = useState(() => {
        try {
            const org = JSON.parse(localStorage.getItem('cliks_org_profile') || 'null');
            const cfg = JSON.parse(localStorage.getItem('cliks_business_config') || 'null');
            return { org: org || {}, cfg: cfg || {} };
        } catch (e) {
            return { org: {}, cfg: {} };
        }
    });

    React.useEffect(() => {
        const handleOrgUpdate = (e) => {
            try {
                const org = JSON.parse(localStorage.getItem('cliks_org_profile') || 'null');
                const cfg = JSON.parse(localStorage.getItem('cliks_business_config') || 'null');
                setCustomizationProfile({ org: org || {}, cfg: cfg || {} });
            } catch (err) {}
            if (e?.detail) {
                setRealtimeConfig(e.detail);
                queryClient.invalidateQueries({ queryKey: ['settings'] });
            }
        };
        window.addEventListener('cliksOrgProfileUpdated', handleOrgUpdate);
        window.addEventListener('cliksConfigUpdated', handleOrgUpdate);
        window.addEventListener('storage', handleOrgUpdate);
        return () => {
            window.removeEventListener('cliksOrgProfileUpdated', handleOrgUpdate);
            window.removeEventListener('cliksConfigUpdated', handleOrgUpdate);
            window.removeEventListener('storage', handleOrgUpdate);
        };
    }, [queryClient]);

    // Shop Profile sourced directly from /customization org profile (business name, phone, GSTIN reference, contact email)
    const resolvedShopDetails = React.useMemo(() => {
        const org = customizationProfile.org || {};
        const cfg = customizationProfile.cfg || {};

        const shopName =
            org.business_name ||
            cfg.companyName ||
            userProfile.business_name ||
            activeConfig.companyName ||
            activeConfig.pos_shop_name ||
            user?.business_name ||
            userProfile.name ||
            user?.name ||
            'Local Retail Store';

        const address =
            org.address ||
            cfg.registeredAddress ||
            userProfile.address ||
            activeConfig.registeredAddress ||
            activeConfig.pos_shop_address ||
            (org.city ? `${org.city}${org.pincode ? ` - ${org.pincode}` : ''}` : '') ||
            (cfg.city ? `${cfg.city}${cfg.pincode ? ` - ${cfg.pincode}` : ''}` : '') ||
            '';

        const phone =
            org.phone ||
            cfg.phone ||
            userProfile.phone ||
            activeConfig.phone ||
            activeConfig.pos_shop_phone ||
            user?.phone ||
            '';

        const email =
            org.email ||
            cfg.email ||
            userProfile.email ||
            activeConfig.email ||
            activeConfig.pos_shop_email ||
            user?.email ||
            '';

        const gstin =
            org.gstin ||
            cfg.gstinRef ||
            userProfile.gstin ||
            activeConfig.gstinRef ||
            activeConfig.pos_shop_gstin ||
            user?.gstin ||
            '';

        const tagline =
            cfg.pos_shop_tagline ||
            org.tagline ||
            activeConfig.pos_shop_tagline ||
            'Thank you for shopping with us! Visit again!';

        return { shopName, address, phone, email, gstin, tagline };
    }, [customizationProfile, activeConfig, userProfile, user]);

    // Live Warehouses database via useQuery
    const { data: dbWarehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses().catch(() => []),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    // 1. Fetch Unified Catalog (Combines Legacy Inventory + Standard Catalog Products + Stock Registry)
    const { data: inventory = [], isLoading: isInventoryLoading } = useQuery({
        queryKey: ['pos-catalog'],
        queryFn: async () => {
            try {
                const [invRes, prodRes, stockRes] = await Promise.all([
                    inventoryService.getInventory().catch(() => []),
                    productsService.getProducts().catch(() => []),
                    stockService.getStocks().catch(() => [])
                ]);

                // Format Legacy Inventory items
                const legacyItems = (invRes || []).map(i => {
                    const isItemUnlimited = Boolean(i.isUnlimited === true || i.is_unlimited === true || (parseFloat(i.quantity) >= 999000) || (parseFloat(i.stock) >= 999000) || (parseFloat(i.opening_stock) >= 999000));
                    return {
                        id: i.id,
                        name: i.name,
                        sku: i.sku,
                        barcode: i.barcode || i.sku || '',
                        hsn_code: i.hsn_code || i.hsnCode || i.hsn || i.hsn_sac || '',
                        hsnCode: i.hsn_code || i.hsnCode || i.hsn || i.hsn_sac || '',
                        unit: i.unit || i.primary_unit || 'PCS',
                        price: parseFloat(i.price) || 0,
                        quantity: isItemUnlimited ? 999999 : (parseFloat(i.quantity) || 0),
                        category: i.category || 'General',
                        warehouse_id: i.warehouse_id || i.location || 'Main Godown',
                        location: i.location || i.warehouse_id || 'Main Godown',
                        tax_percentage: i.tax_percentage !== undefined && i.tax_percentage !== null ? parseFloat(i.tax_percentage) : 0,
                        source: 'inventory',
                        isUnlimited: isItemUnlimited,
                        rawProduct: i
                    };
                });

                // Format Central Catalog Products
                const catalogItems = (prodRes || []).map(p => {
                    const isItemUnlimited = Boolean(p.isUnlimited === true || p.is_unlimited === true || (parseFloat(p.quantity) >= 999000) || (parseFloat(p.stock) >= 999000) || (parseFloat(p.opening_stock) >= 999000));
                    return {
                        id: p.id,
                        name: p.name || p.product_name,
                        sku: p.sku || p.barcode || p.hsn_code,
                        barcode: p.barcode || p.sku || '',
                        hsn_code: p.hsn_code || p.hsnCode || p.hsn || p.hsn_sac || '',
                        hsnCode: p.hsn_code || p.hsnCode || p.hsn || p.hsn_sac || '',
                        unit: p.unit || p.primary_unit || 'PCS',
                        price: parseFloat(p.selling_price) || parseFloat(p.price) || 0,
                        quantity: isItemUnlimited ? 999999 : (parseFloat(p.quantity) !== undefined && !isNaN(parseFloat(p.quantity)) ? parseFloat(p.quantity) : (parseFloat(p.stock) || 0)),
                        category: p.category || p.category_name || 'General',
                        warehouse_id: p.warehouse_id || p.location || 'Main Godown',
                        location: p.location || p.warehouse_id || 'Main Godown',
                        tax_percentage: p.tax_percentage !== undefined && p.tax_percentage !== null ? parseFloat(p.tax_percentage) : 0,
                        source: 'products',
                        isUnlimited: isItemUnlimited,
                        rawProduct: p
                    };
                });

                // Format Stock Registry items
                const stockItems = (stockRes || []).map(s => {
                    const isItemUnlimited = Boolean(s.isUnlimited === true || s.is_unlimited === true || (parseFloat(s.quantity) >= 999000) || (parseFloat(s.stock) >= 999000));
                    const sSkuLower = (s.sku || '').trim().toLowerCase();
                    const sNameLower = (s.name || '').trim().toLowerCase();

                    const matchedProd = (prodRes || []).find(p => {
                        const pSkuLower = (p.sku || '').trim().toLowerCase();
                        const pNameLower = (p.name || p.product_name || '').trim().toLowerCase();
                        return (sSkuLower && pSkuLower && sSkuLower === pSkuLower) ||
                            (sNameLower && pNameLower && sNameLower === pNameLower);
                    }) || {};

                    const matchedInv = (invRes || []).find(i => {
                        const iSkuLower = (i.sku || '').trim().toLowerCase();
                        const iNameLower = (i.name || '').trim().toLowerCase();
                        return (sSkuLower && iSkuLower && sSkuLower === iSkuLower) ||
                            (sNameLower && iNameLower && sNameLower === iNameLower);
                    }) || {};

                    const derivedHsn = s.hsn_code || s.hsnCode || s.hsn ||
                        matchedProd.hsn_code || matchedProd.hsnCode || matchedProd.hsn || matchedProd.hsn_sac ||
                        matchedInv.hsn_code || matchedInv.hsnCode || matchedInv.hsn || matchedInv.hsn_sac || '';

                    return {
                        id: s.id,
                        name: s.name,
                        sku: s.sku,
                        barcode: s.barcode || matchedProd.barcode || s.sku || '',
                        hsn_code: derivedHsn,
                        hsnCode: derivedHsn,
                        unit: s.unit || matchedProd.unit || 'PCS',
                        price: parseFloat(s.unit_price) || parseFloat(s.price) || parseFloat(matchedProd.selling_price) || 0,
                        quantity: isItemUnlimited ? 999999 : (parseFloat(s.quantity) || 0),
                        category: s.category || matchedProd.category || 'General',
                        warehouse_id: s.warehouse || s.location || 'Main Godown',
                        location: s.location || s.warehouse || 'Main Godown',
                        tax_percentage: s.tax_percentage !== undefined && s.tax_percentage !== null ? parseFloat(s.tax_percentage) : (matchedProd.tax_percentage !== undefined && matchedProd.tax_percentage !== null ? parseFloat(matchedProd.tax_percentage) : 0),
                        source: 'stock',
                        isUnlimited: isItemUnlimited,
                        rawProduct: s
                    };
                });

                // Aggregate items and propagate HSN codes across all items with same SKU or Name
                const allItems = [...catalogItems, ...legacyItems, ...stockItems];

                // Cross-item HSN propagation: if any item sharing the same SKU or Name has an HSN code, share it
                const hsnBySku = new Map();
                const hsnByName = new Map();
                allItems.forEach(item => {
                    const code = item.hsn_code || item.hsnCode;
                    if (code) {
                        if (item.sku) hsnBySku.set((item.sku).trim().toLowerCase(), code);
                        if (item.name) hsnByName.set((item.name).trim().toLowerCase(), code);
                    }
                });

                allItems.forEach(item => {
                    if (!item.hsn_code) {
                        const skuCode = item.sku ? hsnBySku.get((item.sku).trim().toLowerCase()) : null;
                        const nameCode = item.name ? hsnByName.get((item.name).trim().toLowerCase()) : null;
                        if (skuCode || nameCode) {
                            item.hsn_code = skuCode || nameCode;
                            item.hsnCode = skuCode || nameCode;
                        }
                    }
                });

                const uniqueMap = new Map();
                allItems.forEach(item => {
                    if (!item.name) return;
                    const skuPart = (item.sku || '').toLowerCase().trim();
                    const namePart = (item.name || '').toLowerCase().trim();
                    const whPart = (item.warehouse_id || item.location || '').toLowerCase().trim();
                    const idPart = item.id !== undefined && item.id !== null ? String(item.id) : '';

                    const key = skuPart
                        ? `${skuPart}_${whPart}`
                        : (idPart ? `${item.source}_${idPart}_${whPart}` : `${namePart}_${whPart}`);

                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    } else {
                        const existing = uniqueMap.get(key);
                        uniqueMap.set(key, {
                            ...existing,
                            tax_percentage: existing.tax_percentage !== undefined && existing.tax_percentage !== null ? existing.tax_percentage : (item.tax_percentage !== undefined && item.tax_percentage !== null ? item.tax_percentage : 0),
                            hsn_code: existing.hsn_code || item.hsn_code || '',
                            hsnCode: existing.hsnCode || item.hsnCode || '',
                            barcode: existing.barcode || item.barcode || '',
                            isUnlimited: Boolean(item.isUnlimited || existing.isUnlimited),
                            quantity: item.isUnlimited ? 999999 : (existing.quantity || item.quantity)
                        });
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


    // 4. Fetch Order History
    const { data: orderHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['pos-order-history'],
        queryFn: () => posService.getOrders({ limit: 50 }),
        enabled: showHistoryModal
    });

    // 4b. Fetch Customer Specific Order History
    const [isCustomerHistoryModalOpen, setIsCustomerHistoryModalOpen] = useState(false);
    const [customerHistoryModalCustomer, setCustomerHistoryModalCustomer] = useState(null);
    const [historyProductFilter, setHistoryProductFilter] = useState('');
    const [historyPosSearch, setHistoryPosSearch] = useState('');

    const { data: customerOrders = [], isLoading: isCustomerOrdersLoading } = useQuery({
        queryKey: ['customer-orders', customerHistoryModalCustomer?.id || customerHistoryModalCustomer?.customer_id, customerHistoryModalCustomer?.name, customerHistoryModalCustomer?.email],
        queryFn: async () => {
            if (!customerHistoryModalCustomer) return [];

            const targetId = customerHistoryModalCustomer.id || customerHistoryModalCustomer.customer_id || null;
            const targetEmail = (customerHistoryModalCustomer.email || '').toLowerCase().trim();
            const targetName = (customerHistoryModalCustomer.name || customerName || 'Walk-in Customer').toLowerCase().trim();

            const isWalkIn = targetName === 'walk-in customer' || targetName === 'walk-in' || targetName === 'walkin' || (!targetId && !targetEmail && (targetName.includes('walk') || targetName === ''));

            // Build request parameters for POS orders API
            const params = { limit: 100 };
            if (isWalkIn) {
                params.client_name = 'Walk-in Customer';
            } else if (targetId) {
                params.customer_id = targetId;
            } else if (targetName) {
                params.client_name = targetName;
            }

            let allOrders = await posService.getOrders(params);

            // Fallback fetch if specific filter returned empty
            if (allOrders.length === 0) {
                allOrders = await posService.getOrders({ limit: 100 });
            }

            // Filter strictly for this target customer
            return allOrders.filter(order => {
                const orderId = order.customer_id ? String(order.customer_id) : null;
                const orderEmail = (order.client_email || '').toLowerCase().trim();
                const orderName = (order.client_name || 'Walk-in Customer').toLowerCase().trim();

                if (isWalkIn) {
                    return orderName === 'walk-in customer' || orderName === 'walkin' || orderName === 'walk-in' || (!orderId && !orderEmail && (orderName.includes('walk') || orderName === ''));
                }

                if (targetId && orderId && String(targetId) === String(orderId)) return true;
                if (targetEmail && orderEmail && targetEmail === orderEmail) return true;
                if (targetName && orderName && targetName === orderName) return true;

                return false;
            });
        },
        enabled: isCustomerHistoryModalOpen && !!customerHistoryModalCustomer
    });

    const customerPurchasedProducts = React.useMemo(() => {
        const set = new Set();
        customerOrders.forEach(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            items.forEach(item => {
                const name = item.name || item.description;
                if (name && name.trim()) {
                    set.add(name.trim());
                }
            });
        });
        return Array.from(set).sort();
    }, [customerOrders]);

    const filteredCustomerOrders = React.useMemo(() => {
        return customerOrders.filter(order => {
            if (historyProductFilter && historyProductFilter !== 'All') {
                const items = Array.isArray(order.items) ? order.items : [];
                const hasProduct = items.some(item => {
                    const name = (item.name || item.description || '').trim().toLowerCase();
                    return name === historyProductFilter.trim().toLowerCase();
                });
                if (!hasProduct) return false;
            }

            if (historyPosSearch && historyPosSearch.trim()) {
                const searchLower = historyPosSearch.trim().toLowerCase();
                const orderNum = (order.invoice_number || `POS-${order.id}` || '').toLowerCase();
                const altId = String(order.id || '').toLowerCase();
                if (!orderNum.includes(searchLower) && !altId.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [customerOrders, historyProductFilter, historyPosSearch]);

    // 5. Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: posService.checkout,
        onSuccess: (data) => {
            const fallbackBilledBy = user?.name || user?.full_name || user?.business_name || user?.email || 'Cashier';
            setLastOrderData(data ? {
                shop_name: resolvedShopDetails.shopName,
                shop_address: resolvedShopDetails.address,
                shop_phone: resolvedShopDetails.phone,
                shop_email: resolvedShopDetails.email,
                shop_gstin: resolvedShopDetails.gstin,
                shop_tagline: resolvedShopDetails.tagline,
                ...data,
                billed_by: data.billed_by || fallbackBilledBy
            } : data);
            setShowReceiptModal(true);
            setIsCheckingOut(false);

            // Remove completed held cart from HELD CARTS list after successful payment
            if (activeHeldCartInfo) {
                setHeldCarts(prev => prev.filter(h => h.id !== activeHeldCartInfo.id));
            }

            // Extract exact updated loyalty balance returned from backend database
            const freshLtp = data?.updated_customer_loyalty_points !== undefined
                ? parseFloat(data.updated_customer_loyalty_points)
                : (data?.remaining_loyalty_points !== undefined
                    ? parseFloat(data.remaining_loyalty_points)
                    : (data?.final_loyalty_points !== undefined ? parseFloat(data.final_loyalty_points) : null));

            if (freshLtp !== null && !isNaN(freshLtp)) {
                if (selectedCustomerObj) {
                    setSelectedCustomerObj(prev => prev ? ({
                        ...prev,
                        loyalty_points: freshLtp,
                        points: freshLtp
                    }) : null);
                }

                // Immediately update queryClient cache for business-customers
                queryClient.setQueryData(['business-customers'], (oldData) => {
                    if (!Array.isArray(oldData)) return oldData;
                    const targetId = data?.customer_id || selectedCustomerObj?.id;
                    const targetEmail = (data?.client_email || selectedCustomerObj?.email || '').toLowerCase().trim();

                    return oldData.map(cust => {
                        const matchId = targetId && cust.id && String(cust.id) === String(targetId);
                        const matchEmail = targetEmail && cust.email && String(cust.email).toLowerCase().trim() === targetEmail;
                        if (matchId || matchEmail) {
                            return {
                                ...cust,
                                loyalty_points: freshLtp,
                                points: freshLtp
                            };
                        }
                        return cust;
                    });
                });
            }

            // Reset Cart
            try {
                sessionStorage.removeItem(POS_SESSION_STORAGE_KEY);
            } catch (e) { }
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setSelectedCustomerObj(null);
            setLoyaltyPointsEarned(0);
            setLoyaltyPointsRedeemed(0);
            setIsPtsEarnedManuallyEdited(false);
            setDiscountVal(0);
            setActiveHeldCartInfo(null);

            // Refetch to reflect updated inventory, customers & stats
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['stockStats'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.refetchQueries({ queryKey: ['returns'] });
            queryClient.refetchQueries({ queryKey: ['business-customers'] });
            queryClient.refetchQueries({ queryKey: ['customers'] });
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
        onSuccess: (resData, variables) => {
            const prod = resData?.data || resData || variables;
            const isItemUnlimited = Boolean(variables?.isUnlimited || prod?.isUnlimited || prod?.is_unlimited || variables?.openingStock === 999999);
            const stockVal = isItemUnlimited ? 999999 : (parseFloat(variables?.openingStock ?? variables?.quantity ?? prod?.quantity ?? prod?.stock ?? 0) || 0);

            const formattedProduct = {
                id: prod?.id || prod?.product_id || Date.now(),
                name: prod?.name || prod?.product_name || variables?.name,
                product_name: prod?.name || prod?.product_name || variables?.name,
                sku: prod?.sku || variables?.sku,
                barcode: prod?.barcode || variables?.barcode || prod?.sku || variables?.sku,
                unit: prod?.unit || prod?.primary_unit || variables?.unit || 'PCS',
                primary_unit: prod?.unit || prod?.primary_unit || variables?.unit || 'PCS',
                price: parseFloat(prod?.selling_price || prod?.price || variables?.selling_price || variables?.price || 0),
                selling_price: parseFloat(prod?.selling_price || prod?.price || variables?.selling_price || variables?.price || 0),
                quantity: stockVal,
                stock: stockVal,
                opening_stock: stockVal,
                openingStock: stockVal,
                category: prod?.category || prod?.category_name || variables?.category || 'General',
                category_name: prod?.category || prod?.category_name || variables?.category || 'General',
                warehouse_id: prod?.warehouse_id || variables?.warehouse_id || 'Main Godown',
                location: prod?.location || variables?.warehouse_id || 'Main Godown',
                tax_percentage: (prod?.tax_percentage !== undefined && prod?.tax_percentage !== null) ? parseFloat(prod.tax_percentage) : ((variables?.tax_percentage !== undefined && variables?.tax_percentage !== null) ? parseFloat(variables.tax_percentage) : 18),
                tax_rate: (prod?.tax_percentage !== undefined && prod?.tax_percentage !== null) ? parseFloat(prod.tax_percentage) : ((variables?.tax_percentage !== undefined && variables?.tax_percentage !== null) ? parseFloat(variables.tax_percentage) : 18),
                taxRate: (prod?.tax_percentage !== undefined && prod?.tax_percentage !== null) ? parseFloat(prod.tax_percentage) : ((variables?.tax_percentage !== undefined && variables?.tax_percentage !== null) ? parseFloat(variables.tax_percentage) : 18),
                gst_percentage: (prod?.tax_percentage !== undefined && prod?.tax_percentage !== null) ? parseFloat(prod.tax_percentage) : ((variables?.tax_percentage !== undefined && variables?.tax_percentage !== null) ? parseFloat(variables.tax_percentage) : 18),
                source: 'products',
                isUnlimited: isItemUnlimited,
                is_unlimited: isItemUnlimited,
                hsn_code: prod?.hsn_code || variables?.hsn_code || variables?.hsnCode || '',
                hsnCode: prod?.hsn_code || variables?.hsn_code || variables?.hsnCode || ''
            };

            queryClient.setQueryData(['pos-catalog'], (old = []) => {
                const list = Array.isArray(old) ? old : [];
                const exists = list.some(item => (formattedProduct.id && item.id === formattedProduct.id) || (formattedProduct.sku && item.sku === formattedProduct.sku));
                if (exists) {
                    return list.map(item => ((formattedProduct.id && item.id === formattedProduct.id) || (formattedProduct.sku && item.sku === formattedProduct.sku)) ? { ...item, ...formattedProduct } : item);
                }
                return [formattedProduct, ...list];
            });

            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });

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
            const cleanId = String(id).replace(/^(stk|prod|inv)[_-]/i, '').trim();
            if (source === 'inventory') {
                try {
                    return await inventoryService.deleteItem(cleanId);
                } catch (e) {
                    return await productsService.deleteProduct(cleanId);
                }
            } else {
                try {
                    return await productsService.deleteProduct(cleanId);
                } catch (e) {
                    return await inventoryService.deleteItem(cleanId);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
        },
        onError: (err) => {
            console.error('Error deleting product:', err);
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
        }
    });

    const handleOpenEditProduct = (prod) => {
        let resolvedHsn = prod.hsn_code || prod.hsnCode || prod.hsn || prod.hsn_sac || prod.rawProduct?.hsn_code || prod.rawProduct?.hsnCode || prod.rawProduct?.hsn || prod.rawProduct?.hsn_sac || '';
        if (!resolvedHsn) {
            const posCatalog = queryClient.getQueryData(['pos-catalog']) || [];
            const cachedProducts = queryClient.getQueryData(['products']) || [];
            const cachedInv = queryClient.getQueryData(['inventory']) || [];
            const cachedStocks = queryClient.getQueryData(['stocks']) || [];
            const allCached = [...posCatalog, ...cachedProducts, ...cachedInv, ...cachedStocks];

            const targetSku = (prod.sku || '').trim().toLowerCase();
            const targetName = (prod.name || '').trim().toLowerCase();
            const targetId = prod.id ? String(prod.id) : null;

            const match = allCached.find(p => {
                const code = p.hsn_code || p.hsnCode || p.hsn || p.hsn_sac || p.rawProduct?.hsn_code;
                if (!code) return false;
                const pSku = (p.sku || '').trim().toLowerCase();
                const pName = (p.name || p.product_name || '').trim().toLowerCase();
                const pId = p.id ? String(p.id) : null;
                return (targetSku && pSku && targetSku === pSku) ||
                    (targetName && pName && targetName === pName) ||
                    (targetId && pId && targetId === pId);
            });
            if (match) {
                resolvedHsn = match.hsn_code || match.hsnCode || match.hsn || match.hsn_sac || match.rawProduct?.hsn_code || '';
            }
        }

        const enrichedProd = {
            ...prod,
            hsn_code: resolvedHsn,
            hsnCode: resolvedHsn
        };

        setEditingProduct(enrichedProd);
        setNewProductData({
            name: prod.name || '',
            sku: prod.sku || '',
            category: prod.category || 'General',
            unit: prod.unit || 'PCS',
            selling_price: prod.price ? String(prod.price) : '',
            quantity: prod.quantity ? String(prod.quantity) : '',
            tax_percentage: (prod.tax_percentage !== undefined && prod.tax_percentage !== null) ? prod.tax_percentage : 18,
            hsn_code: resolvedHsn
        });
        setHsnQueryOverride('');
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
    const categories = React.useMemo(() => ['All', ...new Set(inventory.map(i => i.category).filter(Boolean))], [inventory]);

    const categoryCounts = React.useMemo(() => {
        const counts = { All: inventory.length };
        inventory.forEach(i => {
            if (i.category) {
                counts[i.category] = (counts[i.category] || 0) + 1;
            }
        });
        return counts;
    }, [inventory]);

    const filteredCategories = React.useMemo(() => {
        if (!categorySearchQuery.trim()) return categories;
        const q = categorySearchQuery.toLowerCase();
        return categories.filter(cat => cat.toLowerCase().includes(q));
    }, [categories, categorySearchQuery]);

    // Filtered Products Catalog
    const filteredProducts = inventory.filter(prod => {
        const lowerSearch = searchTerm.toLowerCase().trim();

        // Warehouse matching logic (Multi-select)
        let matchesWarehouse = true;
        if (selectedWarehouseIds.length > 0) {
            matchesWarehouse = selectedWarehouseIds.some(whId => {
                const selectedWh = dbWarehouses.find(w => String(w.id) === String(whId) || w.code === whId || w.name === whId);
                const targetId = String(whId).toLowerCase();
                const targetCode = (selectedWh?.code || `WH-0${whId}`).toLowerCase();
                const targetName = (selectedWh?.name || selectedWh?.warehouse_name || '').toLowerCase();

                const pWhId = String(prod.warehouse_id || '').toLowerCase();
                const pLoc = String(prod.location || '').toLowerCase();

                return (
                    pWhId === targetId ||
                    pWhId === targetCode ||
                    pWhId === targetName ||
                    pWhId === `wh-0${targetId}` ||
                    (targetName && pLoc.includes(targetName)) ||
                    (targetName && pWhId.includes(targetName)) ||
                    (selectedWh && (pWhId === String(selectedWh.id) || pLoc === selectedWh.name?.toLowerCase()))
                );
            });
        }

        const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;

        if (!lowerSearch) {
            return matchesCategory && matchesWarehouse;
        }

        const matchesSearch =
            (prod.name || '').toLowerCase().includes(lowerSearch) ||
            (prod.sku || '').toLowerCase().includes(lowerSearch) ||
            (prod.category || '').toLowerCase().includes(lowerSearch) ||
            (prod.price || 0).toString().includes(lowerSearch);

        return matchesSearch && matchesCategory && matchesWarehouse;
    });

    // Handlers
    const isDecimalUnit = (unit) => {
        const u = String(unit || 'PCS').toUpperCase();
        return ['KG', 'KGS', 'GRAM', 'GRAMS', 'G', 'LITRE', 'LITRES', 'L', 'ML'].includes(u);
    };

    const addToCart = (prod) => {
        const prodUnit = prod.unit || 'PCS';
        const isDec = isDecimalUnit(prodUnit);
        const isUnlimited = Boolean(prod.isUnlimited === true || prod.is_unlimited === true || (parseFloat(prod.quantity) >= 999000) || (parseFloat(prod.stock) >= 999000));

        const cartItem = cart.find(item => item.id === prod.id || (item.sku && prod.sku && item.sku === prod.sku));
        const currentCartQty = cartItem ? (parseFloat(cartItem.quantity) || 0) : 0;
        const availableStock = isUnlimited ? Infinity : ((parseFloat(prod.quantity) || 0) - currentCartQty);

        if (!isUnlimited && availableStock <= 0) {
            alert('This item is out of stock!');
            return;
        }

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === prod.id || (item.sku && prod.sku && item.sku === prod.sku));
            if (existing) {
                const addStep = isDec ? 0.25 : 1;
                const newQty = isDec
                    ? Math.round((existing.quantity + addStep) * 1000) / 1000
                    : existing.quantity + 1;

                if (!isUnlimited && newQty > prod.quantity) {
                    alert('Cannot add more than available stock!');
                    return prevCart;
                }

                return prevCart.map(item =>
                    (item.id === prod.id || (item.sku && prod.sku && item.sku === prod.sku))
                        ? { ...item, quantity: newQty, total: Math.round(newQty * (item.price || 0) * 100) / 100, isUnlimited }
                        : item
                );
            }
            const extractedTaxRate = parseFloat(prod.tax_percentage ?? prod.rawProduct?.tax_percentage ?? prod.rawProduct?.gst_percentage ?? prod.taxRate ?? prod.gst_percentage ?? prod.tax_rate ?? 0) || 0;
            return [...prevCart, {
                id: prod.id,
                name: prod.name,
                sku: prod.sku,
                price: prod.price || 0,
                quantity: 1,
                tax_rate: extractedTaxRate,
                unit: prodUnit,
                total: prod.price || 0,
                source: prod.source,
                isUnlimited: isUnlimited
            }];
        });
    };

    const updateCartQty = (id, delta) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === id);
            if (!existing) return prevCart;

            const invProd = inventory.find(p => p.id === id || (p.sku && existing.sku && p.sku === existing.sku));
            const isUnlimited = Boolean(existing.isUnlimited || invProd?.isUnlimited === true || invProd?.is_unlimited === true || (parseFloat(invProd?.quantity) >= 999000) || (parseFloat(invProd?.stock) >= 999000));
            const maxStock = isUnlimited ? Infinity : (invProd ? invProd.quantity : Infinity);
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

            if (!isUnlimited && newQty > maxStock) {
                alert('Cannot add more than available stock!');
                return prevCart;
            }

            const newTotal = Math.round(newQty * (existing.price || 0) * 100) / 100;
            return prevCart.map(item =>
                item.id === id
                    ? { ...item, quantity: newQty, total: newTotal, isUnlimited }
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

            const invProd = inventory.find(p => p.id === id || (p.sku && existing.sku && p.sku === existing.sku));
            const isUnlimited = Boolean(existing.isUnlimited || invProd?.isUnlimited === true || invProd?.is_unlimited === true || (parseFloat(invProd?.quantity) >= 999000) || (parseFloat(invProd?.stock) >= 999000));
            const maxStock = isUnlimited ? Infinity : (invProd ? invProd.quantity : Infinity);
            const isDec = isDecimalUnit(existing.unit);

            let parsed = parseFloat(rawVal);
            if (isNaN(parsed) || parsed <= 0) {
                return prevCart.map(item => item.id === id ? { ...item, quantity: rawVal, total: 0 } : item);
            }

            if (!isDec) {
                parsed = Math.floor(parsed);
            }

            if (!isUnlimited && parsed > maxStock) {
                alert('Cannot add more than available stock!');
                return prevCart;
            }

            const newTotal = Math.round(parsed * (existing.price || 0) * 100) / 100;
            return prevCart.map(item =>
                item.id === id
                    ? { ...item, quantity: parsed, total: newTotal, isUnlimited }
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

    const getCustomerLtp = (cust) => {
        if (!cust) return 0;
        const raw = cust.loyalty_points !== undefined && cust.loyalty_points !== null
            ? cust.loyalty_points
            : (cust.points !== undefined && cust.points !== null ? cust.points : 0);
        const val = parseFloat(raw);
        if (isNaN(val) || val <= 0) return 0;
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
    };

    // Auto-sync active selected customer with latest persisted backend data from customers query
    React.useEffect(() => {
        if (!selectedCustomerObj || !customers || customers.length === 0) return;
        const matched = customers.find(c => (c.id && selectedCustomerObj.id && String(c.id) === String(selectedCustomerObj.id)) || (c.email && selectedCustomerObj.email && String(c.email).toLowerCase().trim() === String(selectedCustomerObj.email).toLowerCase().trim()));
        if (matched) {
            const freshLtp = getCustomerLtp(matched);
            const curLtp = getCustomerLtp(selectedCustomerObj);
            if (freshLtp > curLtp || matched.name !== selectedCustomerObj.name || matched.email !== selectedCustomerObj.email) {
                setSelectedCustomerObj(matched);
            }
        }
    }, [customers, selectedCustomerObj]);

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

    const discountAmount = discountType === 'percentage'
        ? (subtotal * (parseFloat(discountVal) || 0) / 100)
        : (parseFloat(discountVal) || 0);

    const discountedTotal = Math.max(0, subtotal - discountAmount);
    const discountPercent = subtotal > 0 ? (discountAmount / subtotal) : 0;

    const calculatedTax = cart.reduce((acc, item) => {
        const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
        const discountedItemTotal = item.total * (1 - discountPercent);
        const itemTaxRate = parseFloat(item.tax_rate !== undefined && item.tax_rate !== null && !isNaN(parseFloat(item.tax_rate)) ? item.tax_rate : (catItem?.tax_percentage || 0)) || 0;
        return acc + (discountedItemTotal * (itemTaxRate / 100));
    }, 0);

    // Master Config for Loyalty (sourced directly from Backend API)
    const loyaltyEnabled = React.useMemo(() => {
        if (activeConfig?.loyaltyEnabled !== undefined) return Boolean(activeConfig.loyaltyEnabled);
        if (activeConfig?.loyalty !== undefined) return Boolean(activeConfig.loyalty);
        if (activeConfig?.loyalty_enabled !== undefined) return Boolean(activeConfig.loyalty_enabled && activeConfig.loyalty_enabled !== 0);
        return false;
    }, [activeConfig]);

    const ptsFor1Rs = activeConfig.loyaltyPointsPer1Rs !== undefined ? activeConfig.loyaltyPointsPer1Rs : 100;
    const rsPer1Point = activeConfig.loyaltyRsPer1Point !== undefined ? activeConfig.loyaltyRsPer1Point : 100;
    const maxClaimPct = activeConfig.loyaltyMaxClaimPercent !== undefined ? activeConfig.loyaltyMaxClaimPercent : 50;

    const availableCustomerPoints = selectedCustomerObj ? getCustomerLtp(selectedCustomerObj) : 0;
    const maxClaimablePoints = Math.floor(availableCustomerPoints * (maxClaimPct / 100));
    const maxPointsForBill = ptsFor1Rs > 0 ? Math.floor((discountedTotal + calculatedTax) * ptsFor1Rs) : 0;
    const maxRedeemablePoints = loyaltyEnabled ? Math.min(maxClaimablePoints, maxPointsForBill) : 0;

    const effectivePointsRedeemed = (loyaltyEnabled && selectedCustomerObj) ? Math.max(0, Math.min(maxRedeemablePoints, parseFloat(loyaltyPointsRedeemed) || 0)) : 0;
    const loyaltyDiscountAmount = (loyaltyEnabled && ptsFor1Rs > 0) ? (effectivePointsRedeemed / ptsFor1Rs) : 0;

    const totalBeforeRound = Math.max(0, discountedTotal + calculatedTax - loyaltyDiscountAmount);
    const finalTotal = activeConfig.roundOff !== false ? Math.max(0, Math.round(totalBeforeRound)) : Math.max(0, totalBeforeRound);
    const roundOff = finalTotal - totalBeforeRound;
    const hasValidCartItems = cart.some(item => (parseFloat(item.quantity) || 0) > 0);

    // Dynamic loyalty points earned based on bill value
    const autoEarnedPoints = (loyaltyEnabled && selectedCustomerObj && rsPer1Point > 0) ? Math.floor(finalTotal / rsPer1Point) : 0;
    const effectivePointsEarned = isPtsEarnedManuallyEdited ? (parseFloat(loyaltyPointsEarned) || 0) : autoEarnedPoints;

    React.useEffect(() => {
        if (!isPtsEarnedManuallyEdited) {
            setLoyaltyPointsEarned(autoEarnedPoints);
        }
    }, [autoEarnedPoints, isPtsEarnedManuallyEdited]);

    const handleCheckout = (mode) => {
        const validCartItems = cart.filter(item => (parseFloat(item.quantity) || 0) > 0);
        if (validCartItems.length === 0 || isCheckingOut) {
            alert('Cannot generate bill. Please enter a product quantity greater than 0.');
            return;
        }

        // Prevent selling more quantity than available stock (bypassed for unlimited products)
        for (const item of validCartItems) {
            const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
            const isUnlimited = Boolean(item.isUnlimited || catItem?.isUnlimited === true || catItem?.is_unlimited === true || (parseFloat(catItem?.quantity) >= 999000) || (parseFloat(catItem?.stock) >= 999000));
            if (isUnlimited) continue;
            const maxStock = catItem ? (parseFloat(catItem.quantity) || 0) : Infinity;
            const requestedQty = parseFloat(item.quantity) || 0;
            if (requestedQty > maxStock) {
                alert(`Cannot complete checkout!\n\nRequested quantity (${requestedQty} ${item.unit || 'PCS'}) for "${item.name}" exceeds available stock (${maxStock} ${item.unit || 'PCS'}).`);
                return;
            }
        }

        setIsCheckingOut(true);

        const ptsEarned = loyaltyEnabled ? effectivePointsEarned : 0;
        const ptsRedeemed = loyaltyEnabled ? effectivePointsRedeemed : 0;
        const existingPts = loyaltyEnabled ? availableCustomerPoints : 0;
        const remainingPts = loyaltyEnabled ? Math.max(0, existingPts - ptsRedeemed + ptsEarned) : existingPts;

        if (loyaltyEnabled && selectedCustomerObj?.id) {
            crmService.updateCustomer(selectedCustomerObj.id, {
                ...selectedCustomerObj,
                loyalty_points: remainingPts
            }).catch(e => console.error('Failed automatic loyalty update in POS:', e));
        }

        const billedByName = user?.username || user?.name || user?.full_name || user?.business_name || (user?.email ? user.email.split('@')[0] : 'Cashier');

        const payload = {
            customer_id: selectedCustomerObj?.id || null,
            client_name: customerName || 'Walk-in Customer',
            client_email: customerEmail || selectedCustomerObj?.email || null,
            client_phone: selectedCustomerObj?.phone_number || selectedCustomerObj?.phone || null,
            shop_name: resolvedShopDetails.shopName,
            shop_address: resolvedShopDetails.address,
            shop_phone: resolvedShopDetails.phone,
            shop_email: resolvedShopDetails.email,
            shop_gstin: resolvedShopDetails.gstin,
            shop_tagline: resolvedShopDetails.tagline,
            billed_by: billedByName,
            cashier_name: billedByName,
            existing_loyalty_points: loyaltyEnabled ? existingPts : 0,
            loyalty_points_earned: loyaltyEnabled ? ptsEarned : 0,
            loyaltyPointsEarned: loyaltyEnabled ? ptsEarned : 0,
            loyalty_points_redeemed: loyaltyEnabled ? ptsRedeemed : 0,
            loyaltyPointsRedeemed: loyaltyEnabled ? ptsRedeemed : 0,
            loyalty_discount_amount: loyaltyEnabled ? loyaltyDiscountAmount : 0,
            loyaltyDiscount: loyaltyEnabled ? loyaltyDiscountAmount : 0,
            remaining_loyalty_points: loyaltyEnabled ? remainingPts : 0,
            final_loyalty_points: loyaltyEnabled ? remainingPts : 0,
            amount: subtotal,
            tax_amount: calculatedTax,
            total_amount: finalTotal,
            paid_amount: finalTotal,
            due_amount: 0,
            discount_amount: discountAmount,
            round_off: roundOff,
            payment_mode: mode,
            items: validCartItems.map(item => ({
                id: item.id,
                name: item.name,
                description: item.name,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit,
                price: item.price,
                tax_rate: parseFloat(item.tax_rate) || 0,
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

    // Auto-sync any workspace modifications (items, customer, discount, tax) to active held cart
    React.useEffect(() => {
        if (!activeHeldCartInfo) return;
        setHeldCarts(prev => prev.map(h => {
            if (h.id === activeHeldCartInfo.id) {
                return {
                    ...h,
                    cart: [...cart],
                    customerName,
                    customerEmail,
                    selectedCustomerObj,
                    discountVal,
                    discountType,
                    taxRate,
                    loyaltyPointsEarned,
                    loyaltyPointsRedeemed,
                    isPtsEarnedManuallyEdited
                };
            }
            return h;
        }));
    }, [cart, customerName, customerEmail, selectedCustomerObj, discountVal, discountType, taxRate, loyaltyPointsEarned, loyaltyPointsRedeemed, isPtsEarnedManuallyEdited, activeHeldCartInfo]);

    const clearCart = async () => {
        if (cart.length === 0) return;
        if (await customConfirm('Are you sure you want to clear the current cart?')) {
            if (activeHeldCartInfo) {
                setHeldCarts(prev => prev.filter(h => h.id !== activeHeldCartInfo.id));
            }
            try {
                sessionStorage.removeItem(POS_SESSION_STORAGE_KEY);
            } catch (e) { }
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
            selectedCustomerObj,
            discountVal,
            discountType,
            taxRate,
            loyaltyPointsEarned,
            loyaltyPointsRedeemed,
            isPtsEarnedManuallyEdited
        };

        setHeldCarts(prev => [...prev.filter(h => h.id !== defaultId), cartEntry].sort((a, b) => a.displayId - b.displayId));

        if (!isEditingHeld) {
            setHoldCounter(prev => prev + 1);
        }

        // Reset workspace & active held cart tracker so user can start a new order
        setActiveHeldCartInfo(null);
        setCart([]);
        setCustomerName('');
        setCustomerEmail('');
        setSelectedCustomerObj(null);
        setDiscountVal(0);
        setLoyaltyPointsEarned(0);
        setLoyaltyPointsRedeemed(0);
        setIsPtsEarnedManuallyEdited(false);
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
                setCart([]);
                setCustomerName('');
                setCustomerEmail('');
                setSelectedCustomerObj(null);
                setDiscountVal(0);
                setLoyaltyPointsEarned(0);
                setLoyaltyPointsRedeemed(0);
                setIsPtsEarnedManuallyEdited(false);
            }
        }
    };

    const restoreCart = (holdId) => {
        // If clicking the currently active held cart, do nothing
        if (activeHeldCartInfo && activeHeldCartInfo.id === holdId) return;

        // 1. If active cart has items and is NOT a held cart yet, auto-hold it as a new held cart!
        if (cart.length > 0 && !activeHeldCartInfo) {
            const defaultDisplayId = holdCounter;
            const defaultId = Date.now();
            const autoName = customerName ? `Cart - ${customerName}` : `Cart #${defaultDisplayId}`;

            const newHeldEntry = {
                id: defaultId,
                displayId: defaultDisplayId,
                customName: autoName,
                cart: [...cart],
                customerName,
                customerEmail,
                selectedCustomerObj,
                discountVal,
                discountType,
                taxRate,
                loyaltyPointsEarned,
                loyaltyPointsRedeemed,
                isPtsEarnedManuallyEdited
            };

            setHeldCarts(prev => [...prev, newHeldEntry]);
            setHoldCounter(prev => prev + 1);
        }

        // 2. Find target held cart
        const held = heldCarts.find(h => h.id === holdId);
        if (!held) return;

        // 3. Load target held cart into active workspace
        setCart(held.cart || []);
        setCustomerName(held.customerName || '');
        setCustomerEmail(held.customerEmail || '');
        setSelectedCustomerObj(held.selectedCustomerObj || null);
        setDiscountVal(held.discountVal || 0);
        setDiscountType(held.discountType || 'percentage');
        setTaxRate(held.taxRate || 18);
        setLoyaltyPointsEarned(held.loyaltyPointsEarned || 0);
        setLoyaltyPointsRedeemed(held.loyaltyPointsRedeemed || 0);
        setIsPtsEarnedManuallyEdited(held.isPtsEarnedManuallyEdited || false);

        // 4. Set active held cart indicator
        setActiveHeldCartInfo({
            id: held.id,
            displayId: held.displayId,
            customName: held.customName
        });
    };

    const printReceipt = () => {
        window.print();
    };

    // Derive operator prefix and email identifier for POS terminal
    const userEmail = user?.email || user?.username || '';
    const isSubId = Boolean(user && (user.is_sub_id === true || user.role === 'sub_id' || user.role === 'SUB_ID'));

    let userPrefix = '';
    if (isSubId) {
        userPrefix = user?.prefix;
        if (!userPrefix && userEmail.includes('@')) {
            const localPart = userEmail.split('@')[0];
            if (localPart.includes('.')) {
                userPrefix = localPart.split('.')[0];
            }
        }
        if (!userPrefix) {
            userPrefix = user?.username || 'subid';
        }
    } else {
        // Main ID displays as owner
        userPrefix = 'owner';
    }
    const displayEmail = user?.email || user?.username || user?.name || 'Admin';

    return (
        <div style={{ display: 'flex', height: '100%', gap: '1rem', padding: '1rem', background: '#F1F5F9', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>

            {/* Left Side: Product Catalog */}
            <div style={{ flex: '0 0 calc(60% - 0.5rem)', width: 'calc(60% - 0.5rem)', minWidth: 0, background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>

                {/* Header: Search & Summary Widget */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>POS System</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Speed Checkout Terminal #1</p> */}
                                    <span style={{ fontSize: '0.7rem', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1px 6px', borderRadius: '4px', fontWeight: '750' }}>
                                        {userPrefix} : {displayEmail}
                                    </span>
                                </div>
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

                    {/* Top Filtering Row (Warehouse, Search, Categories) */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {/* Warehouse Filter Dropdown (With Multi-Select Checkboxes) */}
                        {!isStarterPlan && (
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={warehouseDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.45rem 0.9rem',
                                        borderRadius: '12px',
                                        border: '1.5px solid #000000',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        fontSize: '0.82rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        minWidth: '130px',
                                        height: '100%'
                                    }}
                                >
                                    <span>
                                        {selectedWarehouseIds.length === 0
                                            ? 'Warehouse'
                                            : selectedWarehouseIds.length === 1
                                                ? (dbWarehouses.find(w => String(w.id) === selectedWarehouseIds[0])?.name || dbWarehouses.find(w => String(w.id) === selectedWarehouseIds[0])?.warehouse_name || '1 Selected')
                                                : `Warehouse (${selectedWarehouseIds.length})`}
                                    </span>
                                    <ChevronDown size={14} style={{ color: '#0F172A', transition: 'transform 0.2s', transform: isWarehouseDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                </button>

                                {/* Dropdown Popover List */}
                                {isWarehouseDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        marginTop: '6px',
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '14px',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
                                        zIndex: 50,
                                        minWidth: '200px',
                                        maxWidth: '280px',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.4rem 0.4rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.2rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Select Warehouses</span>
                                            {selectedWarehouseIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedWarehouseIds([])}
                                                    style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        {dbWarehouses.length > 0 ? (
                                            dbWarehouses.map(wh => {
                                                const idStr = String(wh.id);
                                                const isChecked = selectedWarehouseIds.includes(idStr);
                                                const whName = wh.name || wh.warehouse_name || `Warehouse ${wh.code || wh.id}`;
                                                return (
                                                    <div
                                                        key={wh.id}
                                                        onClick={() => toggleWarehouseSelection(wh.id)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.4rem 0.6rem',
                                                            borderRadius: '8px',
                                                            background: isChecked ? '#ECFDF5' : 'transparent',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = '#F8FAFC'; }}
                                                        onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => { }} // Handled by container div click
                                                            style={{ width: '13px', height: '13px', accentColor: '#10B981', cursor: 'pointer', margin: 0 }}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? '800' : '600', color: isChecked ? '#047857' : '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {whName}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{ padding: '0.5rem', fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center' }}>
                                                No registered warehouses found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Search item name, category or barcode SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, transition: 'border-color 0.2s', height: '100%' }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>

                        {/* Category Dropdown (All Categories) */}
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={categoryDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    padding: '0.45rem 0.95rem',
                                    borderRadius: '12px',
                                    border: selectedCategory !== 'All' ? '1.5px solid #10B981' : '1.5px solid #000000',
                                    background: selectedCategory !== 'All' ? '#ECFDF5' : '#FFFFFF',
                                    color: selectedCategory !== 'All' ? '#047857' : '#0F172A',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    whiteSpace: 'nowrap',
                                    height: '100%',
                                    boxShadow: isCategoryDropdownOpen ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none'
                                }}
                                title="Filter Catalog by Category"
                            >
                                <Tag size={15} style={{ color: selectedCategory !== 'All' ? '#059669' : '#0F172A' }} />
                                <span>
                                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                                </span>
                                {selectedCategory !== 'All' && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategory('All');
                                        }}
                                        title="Reset to All Categories"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            background: 'rgba(5, 150, 105, 0.2)',
                                            marginLeft: '2px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={11} strokeWidth={2.5} />
                                    </span>
                                )}
                                <ChevronDown size={14} style={{ color: selectedCategory !== 'All' ? '#047857' : '#0F172A', transition: 'transform 0.2s', transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                            </button>

                            {/* Dropdown Popover List */}
                            {isCategoryDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '6px',
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '14px',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                    zIndex: 60,
                                    minWidth: '220px',
                                    maxWidth: '300px',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.4rem 0.4rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                            Select Category ({categories.length > 1 ? categories.length - 1 : 0})
                                        </span>
                                        {selectedCategory !== 'All' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory('All');
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                style={{ border: 'none', background: 'transparent', color: '#10B981', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                                            >
                                                Reset All
                                            </button>
                                        )}
                                    </div>

                                    {categories.length > 8 && (
                                        <div style={{ padding: '0.2rem 0.2rem 0.4rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Search categories..."
                                                value={categorySearchQuery}
                                                onChange={(e) => setCategorySearchQuery(e.target.value)}
                                                autoFocus
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E2E8F0',
                                                    fontSize: '0.78rem',
                                                    outline: 'none',
                                                    background: '#F8FAFC'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map(cat => {
                                                const isSelected = selectedCategory === cat;
                                                const count = categoryCounts[cat] ?? 0;
                                                return (
                                                    <div
                                                        key={cat}
                                                        onClick={() => {
                                                            setSelectedCategory(cat);
                                                            setIsCategoryDropdownOpen(false);
                                                            setCategorySearchQuery('');
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: isSelected ? '#ECFDF5' : 'transparent',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.15s ease'
                                                        }}
                                                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                                                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                                            {isSelected ? (
                                                                <Check size={14} color="#059669" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                                                            ) : (
                                                                <div style={{ width: 14, flexShrink: 0 }} />
                                                            )}
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: isSelected ? '800' : '600',
                                                                color: isSelected ? '#047857' : '#1E293B',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>
                                                                {cat === 'All' ? 'All Categories' : cat}
                                                            </span>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: '700',
                                                            padding: '1px 6px',
                                                            borderRadius: '10px',
                                                            background: isSelected ? '#D1FAE5' : '#F1F5F9',
                                                            color: isSelected ? '#047857' : '#64748B',
                                                            marginLeft: '6px',
                                                            flexShrink: 0
                                                        }}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{ padding: '0.6rem', fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center' }}>
                                                No categories match "{categorySearchQuery}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    const cartItem = cart.find(c => c.id === prod.id || (c.sku && prod.sku && c.sku === prod.sku));
                                    const cartQty = cartItem ? (parseFloat(cartItem.quantity) || 0) : 0;
                                    const isUnlimited = Boolean(prod.isUnlimited === true || prod.is_unlimited === true || (parseFloat(prod.quantity) >= 999000) || (parseFloat(prod.stock) >= 999000));
                                    const rawStock = parseFloat(prod.quantity) || 0;
                                    const isDec = isDecimalUnit(prod.unit);
                                    const displayStock = isUnlimited
                                        ? '∞'
                                        : (isDec
                                            ? Math.max(0, Math.round((rawStock - cartQty) * 1000) / 1000)
                                            : Math.max(0, Math.round(rawStock - cartQty)));

                                    const isOutOfStock = !isUnlimited && displayStock <= 0;
                                    const isLowStock = !isUnlimited && displayStock > 0 && displayStock < 10;

                                    return (
                                        <motion.div
                                            layout
                                            key={prod.id ? `prod_${prod.id}_${prod.sku}` : `${prod.source}_${prod.sku}`}
                                            whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => !isOutOfStock && addToCart(prod)}
                                            style={{
                                                background: '#FFFFFF',
                                                border: isUnlimited ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                                                borderRadius: '20px',
                                                padding: '1rem 1.1rem',
                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.6rem',
                                                position: 'relative',
                                                opacity: isOutOfStock ? 0.6 : 1,
                                                transition: 'all 0.2s ease',
                                                boxShadow: isUnlimited ? '0 4px 12px rgba(37, 99, 235, 0.06)' : '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            {/* Top Row: Visual Tag for Category + Three-Dot Menu */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{prod.category || 'General'}</span>

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
                                                        <MoreVertical size={16} />
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

                                            {/* Middle Row: Product Name + SKU on Left, "In Cart" Badge on Right */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '40px' }}>
                                                <div style={{ flex: 1, minWidth: 0, paddingRight: '0.4rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '850', color: '#0F172A', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h4>
                                                    {prod.sku && <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px', fontWeight: '500' }}>SKU: {prod.sku}</div>}
                                                </div>
                                                {cartQty > 0 && (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        color: '#FFFFFF',
                                                        background: '#FF5722',
                                                        padding: '0.35rem 0.65rem',
                                                        borderRadius: '10px',
                                                        whiteSpace: 'nowrap',
                                                        display: 'inline-block'
                                                    }}>
                                                        {cartQty} In Cart
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Row: Price / Unit on Left, Stock Badge on Right */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F8FAFC', gap: '0.3rem' }}>
                                                {(() => {
                                                    const cardPriceStr = formatCurrency(prod.price || 0);
                                                    const cardPriceFontSz = cardPriceStr.length > 14 ? '0.7rem' : (cardPriceStr.length > 11 ? '0.78rem' : '0.92rem');
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden', paddingRight: '0.2rem' }}>
                                                            <span style={{ fontSize: cardPriceFontSz, fontWeight: '900', color: '#0F172A', lineHeight: 1.1, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                                                                {cardPriceStr} <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>/</span>
                                                            </span>
                                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', marginTop: '2px' }}>
                                                                {prod.unit || 'PCS'} <span style={{ color: '#94A3B8', margin: '0 4px' }}>•</span> {prod.tax_percentage !== undefined ? prod.tax_percentage : 0}% GST
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                                {isUnlimited ? (
                                                    <span className="bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-lg px-2 py-0.5 font-black text-[11px]">
                                                        ♾ UP
                                                    </span>
                                                ) : (
                                                    <div style={{
                                                        padding: '0.4rem 0.65rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: '800',
                                                        lineHeight: 1.25,
                                                        textAlign: 'left',
                                                        flexShrink: 0,
                                                        background: isOutOfStock ? '#FEE2E2' : (isLowStock ? '#FFFBEB' : '#ECFDF5'),
                                                        color: isOutOfStock ? '#B91C1C' : (isLowStock ? '#B45309' : '#047857')
                                                    }}>
                                                        <div>{isOutOfStock ? 'OUT' : `${displayStock} ${prod.unit || 'PCS'}`}</div>
                                                        {!isOutOfStock && <div style={{ fontSize: '0.62rem', fontWeight: '700' }}>left</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Live Cart Workspace / Billing Box */}
            <div style={{ flex: '0 0 calc(40% - 0.5rem)', width: 'calc(40% - 0.5rem)', minWidth: 0, background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>

                {/* Customer Attachment Row */}
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #F1F5F9', background: '#FFF', flexShrink: 0 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {/* Customer Info Label */}
                        <span style={{ fontSize: '0.75rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Customer Info
                        </span>

                        {/* Search & Actions Bar in Same Line */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.35rem 0.55rem' }}>
                            <User size={15} color="#64748B" style={{ flexShrink: 0 }} />
                            <input
                                ref={customerInputRef}
                                type="text"
                                placeholder="Search customer (name, phone, email...)"
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', fontWeight: '650', color: '#1E293B', minWidth: '60px' }}
                            />
                            {customerName && (
                                <button
                                    type="button"
                                    onClick={() => { setCustomerName(''); setCustomerEmail(''); setSelectedCustomerObj(null); }}
                                    title="Clear customer"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: '#94A3B8', padding: '2px', flexShrink: 0 }}
                                >
                                    <X size={14} />
                                </button>
                            )}

                            {/* Dropdown toggle button for the list of already added customers */}
                            <button
                                type="button"
                                onClick={() => setIsCustomerDropdownOpen(prev => !prev)}
                                title={isCustomerDropdownOpen ? "Close customer list" : "Show registered customer list"}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '0.25rem 0.45rem',
                                    borderRadius: '6px',
                                    border: '1px solid #E2E8F0',
                                    background: isCustomerDropdownOpen ? '#E2E8F0' : '#FFFFFF',
                                    color: '#475569',
                                    fontSize: '0.72rem',
                                    fontWeight: '750',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                <span>List ({customers.length})</span>
                                <ChevronDown size={13} style={{ transform: isCustomerDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                            </button>

                            {/* Add Customer Button on Right Side */}
                            <button
                                type="button"
                                onClick={() => setIsAddCustomerModalOpen(true)}
                                title="Add New Customer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '0.3rem 0.55rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ECFDF5',
                                    color: '#047857',
                                    fontWeight: '750',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease',
                                    flexShrink: 0
                                }}
                            >
                                <UserPlus size={14} />
                                <span>Add</span>
                            </button>
                        </div>

                        {/* Dropdown autocomplete / list for Customers */}
                        {isCustomerDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '6px', zIndex: 30, boxShadow: '0 12px 28px -4px rgba(0,0,0,0.15)', maxHeight: '250px', overflowY: 'auto', padding: '0.25rem 0' }}>
                                <div style={{ padding: '0.4rem 0.85rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: '800', color: '#64748B' }}>
                                    <span>{customerName.trim() ? 'Matching Customers' : `Registered Customers (${customers.length})`}</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerDropdownOpen(false)}
                                        style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontWeight: '700', fontSize: '0.72rem' }}
                                    >
                                        Close
                                    </button>
                                </div>
                                {(() => {
                                    const query = customerName.toLowerCase().trim();
                                    const matches = query ? customers.filter(c => {
                                        const nameMatch = (c.name || c.customer_name || c.contact_person || c.business_name || '').toLowerCase().includes(query);
                                        const codeMatch = (c.code || c.customer_code || c.customer_id || '').toLowerCase().includes(query);
                                        const phoneMatch = String(c.phone_number || c.phone || c.contact || c.phonenumber || c.mobile || '').toLowerCase().includes(query);
                                        const emailMatch = (c.email || '').toLowerCase().includes(query);
                                        return nameMatch || codeMatch || phoneMatch || emailMatch;
                                    }) : customers;

                                    if (matches.length === 0) {
                                        return (
                                            <div style={{ padding: '0.85rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600' }}>
                                                No customer found
                                            </div>
                                        );
                                    }

                                    return matches.map(cust => (
                                        <div
                                            key={cust.id}
                                            onClick={() => {
                                                handleCustomerSelect(cust);
                                                setIsCustomerDropdownOpen(false);
                                            }}
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
                                            {loyaltyEnabled && (
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                        ⭐ Loyalty Points: {getCustomerLtp(cust)}
                                                    </span>
                                                </div>
                                            )}
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
                    </div>

                    {/* Selected Customer Details Banner */}
                    {selectedCustomerObj && (
                        <div style={{ marginTop: '0.6rem', padding: '0.65rem 0.85rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: '850', color: '#065F46', fontSize: '0.85rem' }}>
                                    Name: <strong>{selectedCustomerObj.name}</strong>
                                </span>
                                <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                <span style={{ color: '#047857', fontWeight: '700', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }} title={selectedCustomerObj.email}>
                                    {selectedCustomerObj.email || 'N/A'}
                                </span>
                                {loyaltyEnabled && (
                                    <>
                                        <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                        <span style={{ fontWeight: '850', color: '#B45309', background: '#FFFBEB', padding: '0.1rem 0.45rem', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            LTP: <strong>{getCustomerLtp(selectedCustomerObj)}</strong>
                                        </span>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                                {/* 1. Edit / Change Customer Icon Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (customerInputRef.current) {
                                            customerInputRef.current.focus();
                                            setIsCustomerDropdownOpen(true);
                                        }
                                    }}
                                    style={{ border: 'none', background: '#DCFCE7', color: '#15803D', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                                    title="Edit / Change Customer"
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BBF7D0'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DCFCE7'}
                                >
                                    <Edit2 size={14} />
                                </button>

                                {/* 2. Remove Customer Icon Button */}
                                <button
                                    type="button"
                                    onClick={() => { setCustomerName(''); setCustomerEmail(''); setSelectedCustomerObj(null); }}
                                    style={{ border: 'none', background: '#FEE2E2', color: '#EF4444', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                                    title="Remove Customer"
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FCA5A5'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                                >
                                    <Trash2 size={14} />
                                </button>

                                {/* 3. Order History Icon Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomerHistoryModalCustomer(selectedCustomerObj || { name: customerName || 'Walk-in Customer', email: customerEmail || '' });
                                        setIsCustomerHistoryModalOpen(true);
                                    }}
                                    style={{ border: 'none', background: '#EFF6FF', color: '#2563EB', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '750', transition: 'all 0.15s ease' }}
                                    title="View Customer Order History"
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                >
                                    <History size={14} />
                                    <span>History</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Held Carts Row */}
                {heldCarts.length > 0 && (
                    <div style={{ padding: '0.5rem 1.25rem', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309', alignSelf: 'center', marginRight: '0.5rem' }}>CARTS ({heldCarts.length}):</span>
                        {heldCarts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(hc => {
                            const isActive = activeHeldCartInfo && activeHeldCartInfo.id === hc.id;
                            return (
                                <div
                                    key={hc.id}
                                    style={{
                                        background: isActive ? '#DCFCE7' : '#FFFFFF',
                                        border: isActive ? '1px solid #86EFAC' : '1px solid #FCD34D',
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: isActive ? '#15803D' : '#92400E',
                                        whiteSpace: 'nowrap',
                                        boxShadow: isActive ? '0 2px 6px rgba(22, 163, 74, 0.15)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <span
                                        onClick={() => restoreCart(hc.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title="Click to view/edit this held cart"
                                    >
                                        {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />}
                                        {hc.customName || hc.customerName || `Cart #${hc.displayId}`} ({hc.cart.length} items)
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', borderLeft: isActive ? '1px solid #BBF7D0' : '1px solid #FEF3C7', paddingLeft: '6px' }}>
                                        <Edit
                                            size={12}
                                            style={{ cursor: 'pointer', color: isActive ? '#16A34A' : '#D97706' }}
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
                            );
                        })}
                    </div>
                )}

                {/* Cart Control Header Action Row */}
                <div style={{ padding: '0.65rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                        CART {cart.length > 0 ? `(${cart.length})` : ''}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={holdCart}
                            disabled={cart.length === 0}
                            style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                color: '#334155',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                opacity: cart.length === 0 ? 0.5 : 1
                            }}
                        >
                            Hold Cart
                        </button>

                        <button
                            type="button"
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#EF4444',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                opacity: cart.length === 0 ? 0.4 : 1,
                                padding: '0.25rem 0.5rem'
                            }}
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

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
                                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', paddingRight: '0.2rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                            {(() => {
                                                const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
                                                const itemTaxRate = parseFloat(item.tax_rate !== undefined && item.tax_rate !== null && !isNaN(parseFloat(item.tax_rate)) ? item.tax_rate : (catItem?.tax_percentage || 0)) || 0;
                                                const cartPriceStr = `${formatCurrency(item.price)} / ${item.unit || 'PCS'}`;
                                                const cartPriceFontSz = cartPriceStr.length > 22 ? '0.66rem' : '0.75rem';
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', fontSize: cartPriceFontSz, color: '#64748B', marginTop: '2px', wordBreak: 'break-word' }}>
                                                        <span>{cartPriceStr}</span>
                                                        <span style={{ color: '#94A3B8' }}>•</span>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            background: '#F0FDFA',
                                                            color: '#0F766E',
                                                            border: '1px solid #CCFBF1',
                                                            padding: '0.5px 5px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: '800'
                                                        }}>
                                                            {itemTaxRate}% GST
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Quantity Selectors */}
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '8px', padding: '2px', flexShrink: 0 }}>
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

                                        {(() => {
                                            const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
                                            const itemTaxRate = parseFloat(item.tax_rate !== undefined && item.tax_rate !== null && !isNaN(parseFloat(item.tax_rate)) ? item.tax_rate : (catItem?.tax_percentage || 0)) || 0;
                                            const discountedItemTotal = item.total * (1 - discountPercent);
                                            const itemGstAmt = discountedItemTotal * (itemTaxRate / 100);
                                            const totalStr = formatCurrency(item.total);
                                            const totalFontSz = totalStr.length > 14 ? '0.72rem' : (totalStr.length > 10 ? '0.78rem' : '0.85rem');
                                            return (
                                                <div style={{ flexShrink: 0, textAlign: 'right', paddingLeft: '0.2rem', minWidth: '70px' }}>
                                                    <span style={{ fontSize: totalFontSz, fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', display: 'block' }}>{totalStr}</span>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#0D9488', whiteSpace: 'nowrap', display: 'block', marginTop: '1px' }}>
                                                        +{formatCurrency(itemGstAmt)} GST
                                                    </span>
                                                </div>
                                            );
                                        })()}

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
                <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            Payment Summary {!isTotalsSectionExpanded && `(${formatCurrency(finalTotal)})`}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsTotalsSectionExpanded(prev => !prev)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', padding: '2px' }}
                            title={isTotalsSectionExpanded ? "Collapse Payment Summary" : "Expand Payment Summary"}
                        >
                            {isTotalsSectionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {isTotalsSectionExpanded && (
                        <>
                            {/* Two-Half Side-by-Side Compact Layout */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '0.55rem', alignItems: 'stretch' }}>

                                {/* FIRST HALF: Discount, Points Redeemed, Points Earned */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', justifyContent: 'space-between' }}>

                                    {/* Discount Row */}
                                    <div style={{ background: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Discount</span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setDiscountType('percentage')}
                                                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.62rem', fontWeight: discountType === 'percentage' ? '800' : '500', color: discountType === 'percentage' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}
                                                >
                                                    %
                                                </button>
                                                <span style={{ fontSize: '0.6rem', color: '#CBD5E1' }}>|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDiscountType('flat')}
                                                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.62rem', fontWeight: discountType === 'flat' ? '800' : '500', color: discountType === 'flat' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}
                                                >
                                                    Flat
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={discountVal || ''}
                                            onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                                            style={{ width: '100%', padding: '0.25rem 0.45rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: '750', outline: 'none' }}
                                        />
                                    </div>

                                    {/* Loyalty Points: Redeemed & Earned */}
                                    {loyaltyEnabled && (
                                        <div style={{ background: '#F0FDF4', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Tag size={10} /> Loyalty Pts
                                                </span>
                                                {selectedCustomerObj ? (
                                                    <span style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: '800' }}>
                                                        ⭐ {availableCustomerPoints} <span style={{ color: '#16A34A', fontWeight: '600' }}>({maxClaimPct}%)</span>
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.58rem', color: '#94A3B8', fontStyle: 'italic' }}>No customer</span>
                                                )}
                                            </div>

                                            {/* Points Redeemed Input + Max Button */}
                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    max={maxRedeemablePoints}
                                                    placeholder="Pts Redeem"
                                                    disabled={!selectedCustomerObj || maxRedeemablePoints <= 0}
                                                    value={loyaltyPointsRedeemed || ''}
                                                    onChange={(e) => {
                                                        if (!selectedCustomerObj) {
                                                            setLoyaltyPointsRedeemed(0);
                                                            return;
                                                        }
                                                        const rawVal = e.target.value;
                                                        let val = parseFloat(rawVal);
                                                        if (isNaN(val) || rawVal === '') val = 0;
                                                        if (val > maxRedeemablePoints) val = maxRedeemablePoints;
                                                        if (val < 0) val = 0;
                                                        setLoyaltyPointsRedeemed(val);
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                        padding: '0.25rem 0.45rem',
                                                        boxSizing: 'border-box',
                                                        borderRadius: '6px',
                                                        border: '1px solid #BBF7D0',
                                                        background: !selectedCustomerObj ? '#F8FAFC' : 'white',
                                                        fontSize: '0.78rem',
                                                        fontWeight: '750',
                                                        color: '#15803D',
                                                        outline: 'none',
                                                        opacity: (!selectedCustomerObj || maxRedeemablePoints <= 0) ? 0.6 : 1
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!selectedCustomerObj || maxRedeemablePoints <= 0) return;
                                                        setLoyaltyPointsRedeemed(maxRedeemablePoints);
                                                    }}
                                                    disabled={!selectedCustomerObj || maxRedeemablePoints <= 0}
                                                    style={{
                                                        padding: '0.25rem 0.45rem',
                                                        borderRadius: '6px',
                                                        background: '#16A34A',
                                                        color: 'white',
                                                        border: 'none',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        cursor: (!selectedCustomerObj || maxRedeemablePoints <= 0) ? 'not-allowed' : 'pointer',
                                                        opacity: (!selectedCustomerObj || maxRedeemablePoints <= 0) ? 0.5 : 1,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Max
                                                </button>
                                            </div>

                                            {/* Preview: Redeemed Value & Points Earned */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', fontWeight: '700' }}>
                                                <span style={{ color: '#166534' }}>
                                                    {effectivePointsRedeemed > 0 ? `-${formatCurrency(loyaltyDiscountAmount)}` : `${ptsFor1Rs} pts = ₹1`}
                                                </span>
                                                {selectedCustomerObj ? (
                                                    <span style={{ color: '#047857' }}>
                                                        Earn: +{effectivePointsEarned} pts
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#047857' }}>
                                                        ₹{rsPer1Point} = 1 pt
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECOND HALF: Subtotal, GST, Round Off, Payable Amount */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.45rem 0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        {/* Subtotal */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748B' }}>
                                            <span>Subtotal</span>
                                            <span style={{ fontWeight: '700', color: '#1E293B' }}>{formatCurrency(subtotal)}</span>
                                        </div>

                                        {/* Discount if any */}
                                        {discountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#EF4444', fontWeight: '600' }}>
                                                <span>Discount ({discountType === 'percentage' ? `${discountVal}%` : 'Flat'})</span>
                                                <span>-{formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}

                                        {/* Calculated GST */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748B' }}>
                                            <span>Calculated GST</span>
                                            <span style={{ fontWeight: '700', color: '#1E293B' }}>{formatCurrency(calculatedTax)}</span>
                                        </div>

                                        {/* Loyalty Discount if any */}
                                        {loyaltyEnabled && loyaltyDiscountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#DC2626', fontWeight: '600' }}>
                                                <span>Pts Discount</span>
                                                <span>-{formatCurrency(loyaltyDiscountAmount)}</span>
                                            </div>
                                        )}

                                        {/* Round Off */}
                                        {Math.abs(roundOff) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
                                                <span>Round Off</span>
                                                <span>{roundOff > 0 ? '+' : ''}{currency.symbol}{roundOff.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payable Amount Divider & Value */}
                                    <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '0.3rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.76rem', fontWeight: '850', color: '#0F172A', textTransform: 'uppercase' }}>Payable</span>
                                        {(() => {
                                            const finalStr = formatCurrency(finalTotal);
                                            const finalFontSz = finalStr.length > 14 ? '0.98rem' : (finalStr.length > 11 ? '1.12rem' : '1.25rem');
                                            return (
                                                <span style={{ fontSize: finalFontSz, fontWeight: '950', color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                                                    {finalStr}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                            </div>

                            {/* Checkout Payment Action Matrix */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '2px' }}>
                                <button
                                    disabled={!hasValidCartItems || isCheckingOut}
                                    onClick={() => handleCheckout('Cash')}
                                    style={{
                                        padding: '0.4rem 0.25rem',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        cursor: !hasValidCartItems ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        opacity: !hasValidCartItems ? 0.5 : 1,
                                        boxShadow: hasValidCartItems ? '0 3px 8px rgba(16, 185, 129, 0.2)' : 'none',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                    onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <DollarSign size={14} />
                                    Cash (F1)
                                </button>

                                <button
                                    disabled={!hasValidCartItems || isCheckingOut}
                                    onClick={() => handleCheckout('UPI')}
                                    style={{
                                        padding: '0.4rem 0.25rem',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        cursor: !hasValidCartItems ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        opacity: !hasValidCartItems ? 0.5 : 1,
                                        boxShadow: hasValidCartItems ? '0 3px 8px rgba(79, 70, 229, 0.2)' : 'none',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                    onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <Smartphone size={14} />
                                    UPI (F2)
                                </button>

                                <button
                                    disabled={!hasValidCartItems || isCheckingOut}
                                    onClick={() => handleCheckout('Card')}
                                    style={{
                                        padding: '0.4rem 0.25rem',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        cursor: !hasValidCartItems ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        opacity: !hasValidCartItems ? 0.5 : 1,
                                        boxShadow: hasValidCartItems ? '0 3px 8px rgba(245, 158, 11, 0.2)' : 'none',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                    onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <CreditCard size={14} />
                                    Card (F3)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* SUCCESS RECEIPT POPUP MODAL */}
            {showReceiptModal && lastOrderData && (
                <div className="pos-receipt-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div
                        className="pos-receipt-modal-content"
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
                            className="no-print"
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
                        <div className="no-print" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '1.25rem 1.5rem', color: 'white', textAlign: 'center', position: 'relative', borderRadius: '20px 20px 0 0' }}>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                <Check size={22} strokeWidth={3} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>Payment Successful!</h3>
                            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Order {lastOrderData?.invoice_number || ''} generated</p>

                        </div>

                        {/* Thermal Receipt Workspace (to print) */}
                        <div id="printable-pos-receipt" className="printable-pos-receipt" style={{ padding: '1.5rem', background: '#FFFFFF', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000', textAlign: 'center' }}>
                                {/* Shop / Store Name */}
                                <h4 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '1.25' }}>
                                    {lastOrderData?.shop_name || resolvedShopDetails.shopName}
                                </h4>

                                {/* Shop Address */}
                                {(lastOrderData?.shop_address || resolvedShopDetails.address) && (
                                    <p style={{ margin: '0 0 3px', fontSize: '0.72rem', lineHeight: '1.3', maxWidth: '270px', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                                        {lastOrderData?.shop_address || resolvedShopDetails.address}
                                    </p>
                                )}

                                {/* Shop Contact Details (Phone & Email) */}
                                {(lastOrderData?.shop_phone || resolvedShopDetails.phone || lastOrderData?.shop_email || resolvedShopDetails.email) && (
                                    <p style={{ margin: '1px 0 3px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        {(lastOrderData?.shop_phone || resolvedShopDetails.phone) && <span>Ph: {lastOrderData?.shop_phone || resolvedShopDetails.phone}</span>}
                                        {(lastOrderData?.shop_phone || resolvedShopDetails.phone) && (lastOrderData?.shop_email || resolvedShopDetails.email) && <span> | </span>}
                                        {(lastOrderData?.shop_email || resolvedShopDetails.email) && <span>{lastOrderData?.shop_email || resolvedShopDetails.email}</span>}
                                    </p>
                                )}

                                {/* GSTIN */}
                                {(lastOrderData?.shop_gstin || resolvedShopDetails.gstin) && (
                                    <p style={{ margin: '1px 0 4px', fontSize: '0.72rem', fontWeight: '700' }}>
                                        GSTIN: {lastOrderData?.shop_gstin || resolvedShopDetails.gstin}
                                    </p>
                                )}

                                <p style={{ margin: '2px 0 8px', fontSize: '0.75rem' }}>Receipt No: {lastOrderData?.invoice_number || 'N/A'}</p>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Date: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    <span>Time: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
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
                                    {loyaltyEnabled && (lastOrderData?.loyalty_discount_amount > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
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
                                {loyaltyEnabled && (lastOrderData?.existing_loyalty_points !== undefined || lastOrderData?.loyalty_points_earned > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
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
                                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                    {lastOrderData?.shop_tagline || resolvedShopDetails.tagline || `Thank you for shopping at ${lastOrderData?.shop_name || resolvedShopDetails.shopName}! Visit again!`}
                                </p>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="no-print" style={{ padding: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem', borderRadius: '0 0 20px 20px' }}>
                            <button
                                onClick={printReceipt}
                                className="no-print"
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
                                className="no-print"
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
                <QuickRegisterItemModal
                    isOpen={isAddProductModalOpen}
                    onClose={() => {
                        setIsAddProductModalOpen(false);
                        setEditingProduct(null);
                    }}
                    editingProduct={editingProduct}
                    currency={currency}
                    dbWarehouses={dbWarehouses}
                    existingCategories={categories.filter(c => c !== 'All')}
                />
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
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748B', flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(order.created_at).toLocaleString()}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {order.client_name}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> {order.payment_mode}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: '750' }}>Billed by: {order.billed_by || order.cashier_name || user?.name || 'Cashier'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{formatCurrency(order.total_amount || 0)}</span>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{order.items?.length || 0} items</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setLastOrderData({
                                                                    shop_name: order.shop_name || resolvedShopDetails.shopName,
                                                                    shop_address: order.shop_address || resolvedShopDetails.address,
                                                                    shop_phone: order.shop_phone || resolvedShopDetails.phone,
                                                                    shop_email: order.shop_email || resolvedShopDetails.email,
                                                                    shop_gstin: order.shop_gstin || resolvedShopDetails.gstin,
                                                                    shop_tagline: order.shop_tagline || resolvedShopDetails.tagline,
                                                                    ...order
                                                                });
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
                        {/* <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #F1F5F9', background: '#FFF', textAlign: 'right' }}>
                            <button 
                                onClick={() => setShowHistoryModal(false)}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                Close History
                            </button>
                        </div> */}
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

                        {/* Existing Customer Quick Selector Dropdown */}
                        {customers.length > 0 && (
                            <div style={{ background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.85rem' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                                    Already Registered Customers ({customers.length})
                                </label>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const found = customers.find(c => String(c.id) === e.target.value);
                                        if (found) {
                                            handleCustomerSelect(found);
                                            setIsAddCustomerModalOpen(false);
                                            setNewCustomerData({ name: '', phone_number: '', email: '', gstin: '', billing_address: '' });
                                            setCustomerErrors({ phone: '', email: '', gstin: '' });
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700', color: '#1E293B', background: 'white', outline: 'none' }}
                                >
                                    <option value="">-- Choose from already added customers --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.phone_number || c.phone ? `(${c.phone_number || c.phone})` : ''} {c.email ? `• ${c.email}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                                            const err = validateCustomerPhone(val);
                                            setCustomerErrors(prev => ({ ...prev, phone: err }));
                                            setTouchedCustomerFields(prev => ({ ...prev, phone: true }));
                                        }}
                                        onBlur={() => {
                                            setTouchedCustomerFields(prev => ({ ...prev, phone: true }));
                                            setCustomerErrors(prev => ({ ...prev, phone: validateCustomerPhone(newCustomerData.phone_number) }));
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: customerErrors.phone ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                        placeholder="9876543210"
                                    />
                                    {customerErrors.phone && (
                                        <div style={{ marginTop: '4px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#EF4444', fontWeight: '700' }}>
                                                {customerErrors.phone}
                                            </p>
                                            {(() => {
                                                const cleanP = (newCustomerData.phone_number || '').trim();
                                                const match = cleanP ? customers.find(c => String(c.phone_number || c.phone || c.contact || c.phonenumber || c.mobile || '').trim() === cleanP) : null;
                                                if (!match) return null;
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleCustomerSelect(match);
                                                            setIsAddCustomerModalOpen(false);
                                                            setNewCustomerData({ name: '', phone_number: '', email: '', gstin: '', billing_address: '' });
                                                            setCustomerErrors({ phone: '', email: '', gstin: '' });
                                                        }}
                                                        style={{ padding: '0.3rem 0.6rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        Select &quot;{match.name}&quot;
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Email Address (@bnxmail.com)</label>
                                    <input
                                        type="text"
                                        value={newCustomerData.email}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewCustomerData({ ...newCustomerData, email: val });
                                            const err = validateCustomerEmail(val);
                                            setCustomerErrors(prev => ({ ...prev, email: err }));
                                            setTouchedCustomerFields(prev => ({ ...prev, email: true }));
                                        }}
                                        onBlur={() => {
                                            setTouchedCustomerFields(prev => ({ ...prev, email: true }));
                                            setCustomerErrors(prev => ({ ...prev, email: validateCustomerEmail(newCustomerData.email) }));
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: customerErrors.email ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                        placeholder="customer@bnxmail.com"
                                    />
                                    {customerErrors.email && (
                                        <div style={{ marginTop: '4px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#EF4444', fontWeight: '700' }}>
                                                {customerErrors.email}
                                            </p>
                                            {(() => {
                                                const cleanE = (newCustomerData.email || '').trim().toLowerCase();
                                                const match = cleanE ? customers.find(c => String(c.email || '').trim().toLowerCase() === cleanE) : null;
                                                if (!match) return null;
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleCustomerSelect(match);
                                                            setIsAddCustomerModalOpen(false);
                                                            setNewCustomerData({ name: '', phone_number: '', email: '', gstin: '', billing_address: '' });
                                                            setCustomerErrors({ phone: '', email: '', gstin: '' });
                                                        }}
                                                        style={{ padding: '0.3rem 0.6rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        Select &quot;{match.name}&quot;
                                                    </button>
                                                );
                                            })()}
                                        </div>
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
            {/* Customer Order History Modal */}
            {isCustomerHistoryModalOpen && customerHistoryModalCustomer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem' }}>
                    <div style={{ background: '#FFFFFF', width: '100%', maxWidth: '680px', maxHeight: '85vh', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>Previous Orders</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                                        Customer: <strong style={{ color: '#047857' }}>{customerHistoryModalCustomer.name}</strong> ({customerHistoryModalCustomer.email || 'No email'})
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {/* Product Filter Dropdown */}
                                <select
                                    value={historyProductFilter}
                                    onChange={(e) => setHistoryProductFilter(e.target.value)}
                                    style={{
                                        padding: '0.4rem 0.6rem',
                                        borderRadius: '8px',
                                        border: '1px solid #CBD5E1',
                                        outline: 'none',
                                        fontSize: '0.78rem',
                                        color: '#1E293B',
                                        fontWeight: '600',
                                        background: '#F8FAFC',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">All Products</option>
                                    {customerPurchasedProducts.map((pName, idx) => (
                                        <option key={idx} value={pName}>{pName}</option>
                                    ))}
                                </select>

                                {/* POS Billing Number Search Input */}
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Search POS Number..."
                                        value={historyPosSearch}
                                        onChange={(e) => setHistoryPosSearch(e.target.value)}
                                        style={{
                                            padding: '0.4rem 0.6rem 0.4rem 1.8rem',
                                            borderRadius: '8px',
                                            border: '1px solid #CBD5E1',
                                            outline: 'none',
                                            fontSize: '0.78rem',
                                            color: '#1E293B',
                                            fontWeight: '500',
                                            background: '#F8FAFC',
                                            width: '140px'
                                        }}
                                    />
                                    <Search size={13} style={{ position: 'absolute', left: '0.5rem', color: '#94A3B8', pointerEvents: 'none' }} />
                                    {historyPosSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setHistoryPosSearch('')}
                                            style={{ position: 'absolute', right: '0.4rem', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: 0 }}
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setIsCustomerHistoryModalOpen(false); setCustomerHistoryModalCustomer(null); setHistoryProductFilter(''); setHistoryPosSearch(''); }}
                                    style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
                            {isCustomerOrdersLoading ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                                    <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 0.75rem auto' }} />
                                    <span>Loading order history...</span>
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                                    <ShoppingBag size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#64748B' }}>No previous orders found for this customer.</p>
                                </div>
                            ) : filteredCustomerOrders.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                                    <ShoppingBag size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#64748B' }}>No orders found matching the selected filter(s).</p>
                                    <button
                                        type="button"
                                        onClick={() => { setHistoryProductFilter(''); setHistoryPosSearch(''); }}
                                        style={{ marginTop: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#2563EB', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {filteredCustomerOrders.map(order => {
                                        const orderItems = Array.isArray(order.items) ? order.items : [];
                                        const orderDate = order.created_at || order.issue_date || order.date;
                                        const formattedDate = orderDate ? new Date(orderDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                                        const orderNum = order.invoice_number || `POS-${order.id}`;
                                        const paymentMode = order.payment_mode || 'Cash';
                                        const totalAmt = parseFloat(order.total_amount || order.amount) || 0;

                                        return (
                                            <div key={order.id || orderNum} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1rem', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.9rem', fontFamily: 'monospace' }}>#{orderNum}</span>
                                                        <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#047857', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>Paid</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                                                        📅 {formattedDate}
                                                    </div>
                                                </div>

                                                {/* Items List */}
                                                <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #F1F5F9', padding: '0.6rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Purchased Items ({orderItems.length})</span>
                                                    {orderItems.length > 0 ? (
                                                        orderItems.map((item, idx) => (
                                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#334155' }}>
                                                                <span><strong>{item.name || item.description}</strong> × {item.quantity || 1} {item.unit || 'PCS'}</span>
                                                                <span style={{ fontWeight: '700' }}>{formatCurrency(item.total || ((item.price || 0) * (item.quantity || 1)))}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>Details not available</span>
                                                    )}
                                                </div>

                                                {/* Bottom summary */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                                                        Payment Mode: <strong style={{ color: '#1E293B' }}>{paymentMode}</strong>
                                                    </span>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#059669' }}>
                                                        Total: {formatCurrency(totalAmt)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPOS;
