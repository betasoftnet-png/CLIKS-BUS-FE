import React, { useState, useRef } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrency, useAuth, useBranch } from '../context';
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
    Tag,
    Building,
    Store,
    ArrowDownAZ,
    ArrowDownZA,
    Barcode,
    SlidersHorizontal,
    Wallet,
    Settings,
    Monitor,
    Lock,
    Unlock,
    Bell,
    KeyRound,
    ShieldCheck,
    Package,
    ShoppingCart
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
import { branchService } from '../services/branchService';
import { loyaltyService } from '../services/loyaltyService';
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
    const [productSort, setProductSort] = useState(() => initialPosSession?.productSort || 'default');
    const [searchTarget, setSearchTarget] = useState(() => initialPosSession?.searchTarget || 'all');
    const [alphabetLetterFilter, setAlphabetLetterFilter] = useState(() => initialPosSession?.alphabetLetterFilter || '');
    const [isSortFilterDropdownOpen, setIsSortFilterDropdownOpen] = useState(false);
    const sortFilterDropdownRef = React.useRef(null);
    const [isCreditMode, setIsCreditMode] = useState(false);
    const [creditReceivedAmount, setCreditReceivedAmount] = useState('');
    const [gstType, setGstType] = useState('intra'); // 'intra' (CGST+SGST) | 'inter' (IGST)

    // Multi-Branch Showroom Context for POS
    const { data: posBranchesData = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getBranches,
        refetchOnWindowFocus: false
    });
    const posBranches = Array.isArray(posBranchesData) ? posBranchesData : (posBranchesData?.data || []);
    const { activeBranchId } = useBranch();
    const [selectedPosBranch, setSelectedPosBranch] = useState(null);

    React.useEffect(() => {
        if (posBranches.length > 0) {
            if (user?.is_sub_id && (user?.branch_id || user?.branchId)) {
                const assigned = posBranches.find(b => b.id === (user?.branch_id || user?.branchId));
                if (assigned) setSelectedPosBranch(assigned);
            } else if (activeBranchId) {
                const active = posBranches.find(b => b.id === activeBranchId);
                if (active) setSelectedPosBranch(active);
            } else if (!selectedPosBranch) {
                const def = posBranches.find(b => b.is_main_branch) || posBranches[0];
                setSelectedPosBranch(def);
            }
        }
    }, [posBranches, user, activeBranchId]);

    // Active Showroom Promotions for Current Counter
    const { data: activeShowroomPromos = [] } = useQuery({
        queryKey: ['activeShowroomPromos', selectedPosBranch?.id],
        queryFn: () => branchService.getActiveBranchPromotions(selectedPosBranch.id),
        enabled: !!selectedPosBranch?.id,
        refetchOnWindowFocus: false
    });
    const activePromosList = Array.isArray(activeShowroomPromos) ? activeShowroomPromos : (activeShowroomPromos?.data || []);
    const [appliedShowroomPromo, setAppliedShowroomPromo] = useState(null);
    const [storeCreditToRedeem, setStoreCreditToRedeem] = useState('');

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(event.target)) {
                setIsWarehouseDropdownOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
            if (sortFilterDropdownRef.current && !sortFilterDropdownRef.current.contains(event.target)) {
                setIsSortFilterDropdownOpen(false);
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
                loyaltyPointsRedeemed > 0 ||
                productSort !== 'default' ||
                searchTarget !== 'all' ||
                Boolean(alphabetLetterFilter);

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
                    selectedWarehouseIds,
                    productSort,
                    searchTarget,
                    alphabetLetterFilter
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
        selectedWarehouseIds,
        productSort,
        searchTarget,
        alphabetLetterFilter
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

    // Dedicated Loyalty Program Settings (sourced directly from Backend API: business_loyalty_settings)
    const { data: loyaltyProgramSettings } = useQuery({
        queryKey: ['loyalty-program-settings'],
        queryFn: loyaltyService.getProgramSettings,
        refetchOnWindowFocus: false
    });

    // Mutation to persist print preferences and loyalty controls directly to backend database
    const updateLoyaltySettingsMutation = useMutation({
        mutationFn: (payload) => loyaltyService.updateProgramSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-program-settings'] });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });

    // Business Owner Print Preferences for Receipts (sourced directly from backend database without localStorage)
    const [localPrintShowLoyalty, setLocalPrintShowLoyalty] = useState(null);
    const [localPrintShowCredit, setLocalPrintShowCredit] = useState(null);
    const [localPrintShowGst, setLocalPrintShowGst] = useState(null);
    const [localReceiptPrinterSize, setLocalReceiptPrinterSize] = useState(null);

    const printShowLoyalty = localPrintShowLoyalty !== null
        ? localPrintShowLoyalty
        : Boolean(loyaltyProgramSettings?.print_show_loyalty ?? loyaltyProgramSettings?.printShowLoyalty ?? activeConfig?.print_show_loyalty ?? false);

    const printShowCredit = localPrintShowCredit !== null
        ? localPrintShowCredit
        : Boolean(loyaltyProgramSettings?.print_show_credit ?? loyaltyProgramSettings?.printShowCredit ?? activeConfig?.print_show_credit ?? false);

    const printShowGst = localPrintShowGst !== null
        ? localPrintShowGst
        : Boolean(loyaltyProgramSettings?.print_show_gst ?? loyaltyProgramSettings?.printShowGst ?? activeConfig?.print_show_gst ?? true);

    const receiptPrinterSize = localReceiptPrinterSize !== null
        ? localReceiptPrinterSize
        : String(loyaltyProgramSettings?.receipt_printer_size || loyaltyProgramSettings?.receiptPrinterSize || activeConfig?.receipt_printer_size || activeConfig?.receiptPrinterSize || '3inch').toLowerCase();

    // Kiosk & Credit Settings
    const [localPosKioskPin, setLocalPosKioskPin] = useState(null);
    const [localPosKioskEnabled, setLocalPosKioskEnabled] = useState(null);
    const [localPosAllowCredit, setLocalPosAllowCredit] = useState(null);

    const posKioskPin = localPosKioskPin !== null
        ? localPosKioskPin
        : String(loyaltyProgramSettings?.pos_kiosk_pin || loyaltyProgramSettings?.posKioskPin || activeConfig?.pos_kiosk_pin || activeConfig?.posKioskPin || '1234');

    const posKioskEnabled = localPosKioskEnabled !== null
        ? localPosKioskEnabled
        : Boolean(loyaltyProgramSettings?.pos_kiosk_enabled ?? loyaltyProgramSettings?.posKioskEnabled ?? activeConfig?.pos_kiosk_enabled ?? true);

    const posAllowCredit = localPosAllowCredit !== null
        ? localPosAllowCredit
        : Boolean(loyaltyProgramSettings?.pos_allow_credit ?? loyaltyProgramSettings?.posAllowCredit ?? activeConfig?.pos_allow_credit ?? true);

    // Modal & Kiosk Display States
    const [showPosSettingsModal, setShowPosSettingsModal] = useState(false);
    const [posSettingsTab, setPosSettingsTab] = useState('print'); // 'print' | 'credit' | 'kiosk'
    const [isCustomerViewActive, setIsCustomerViewActive] = useState(false);
    const [kioskPinUnlockModalOpen, setKioskPinUnlockModalOpen] = useState(false);
    const [kioskPinInput, setKioskPinInput] = useState('');
    const [kioskPinError, setKioskPinError] = useState('');
    const [kioskOrderNotification, setKioskOrderNotification] = useState(null);
    const [kioskCategoryFilter, setKioskCategoryFilter] = useState('ALL');
    const [kioskSearchQuery, setKioskSearchQuery] = useState('');
    const [kioskCart, setKioskCart] = useState([]);
    const [kioskCustomerName, setKioskCustomerName] = useState('');
    const [kioskCustomerPhone, setKioskCustomerPhone] = useState('');
    const [kioskOrderSuccessInfo, setKioskOrderSuccessInfo] = useState(null);
    const [mobileActiveTab, setMobileActiveTab] = useState('catalog'); // 'catalog' | 'cart'

    const playKioskOrderChime = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const audioCtx = new AudioContextClass();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
            osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.22); // D6
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.7);
        } catch (e) {
            // Audio context silently handled
        }
    };

    const [posSettingsSaveStatus, setPosSettingsSaveStatus] = useState(null); // 'saving' | 'saved' | 'error' | null
    const [showKioskPinMask, setShowKioskPinMask] = useState(false);

    const handleSavePosSettings = async (overrides = {}) => {
        setPosSettingsSaveStatus('saving');
        const payload = {
            print_show_loyalty: overrides.print_show_loyalty !== undefined ? overrides.print_show_loyalty : printShowLoyalty,
            print_show_credit: overrides.print_show_credit !== undefined ? overrides.print_show_credit : printShowCredit,
            print_show_gst: overrides.print_show_gst !== undefined ? overrides.print_show_gst : printShowGst,
            receipt_printer_size: overrides.receipt_printer_size !== undefined ? overrides.receipt_printer_size : receiptPrinterSize,
            pos_kiosk_pin: overrides.pos_kiosk_pin !== undefined ? overrides.pos_kiosk_pin : posKioskPin,
            pos_kiosk_enabled: overrides.pos_kiosk_enabled !== undefined ? overrides.pos_kiosk_enabled : posKioskEnabled,
            pos_allow_credit: overrides.pos_allow_credit !== undefined ? overrides.pos_allow_credit : posAllowCredit
        };

        try {
            await updateLoyaltySettingsMutation.mutateAsync(payload);
            setPosSettingsSaveStatus('saved');
            setTimeout(() => setPosSettingsSaveStatus(null), 2500);
        } catch (err) {
            console.error('[POS Settings Save Error]', err);
            setPosSettingsSaveStatus('error');
            setTimeout(() => setPosSettingsSaveStatus(null), 3000);
        }
    };

    const handleKioskAddToCart = (prod) => {
        const prodUnit = prod.unit || 'PCS';
        const isUnlimited = Boolean(prod.isUnlimited === true || prod.is_unlimited === true || (parseFloat(prod.quantity) >= 999000) || (parseFloat(prod.stock) >= 999000));
        const extractedTaxRate = parseFloat(prod.tax_percentage ?? prod.rawProduct?.tax_percentage ?? prod.rawProduct?.gst_percentage ?? prod.taxRate ?? prod.gst_percentage ?? prod.tax_rate ?? 0) || 0;
        const price = parseFloat(prod.price || prod.sale_price || 0) || 0;

        setKioskCart(prev => {
            const existing = prev.find(item => item.id === prod.id);
            if (existing) {
                const newQty = existing.quantity + 1;
                if (!isUnlimited && newQty > (parseFloat(prod.quantity) || 0)) {
                    alert('Cannot add more than available store stock!');
                    return prev;
                }
                return prev.map(item => item.id === prod.id ? { ...item, quantity: newQty, total: Math.round(newQty * price * 100) / 100 } : item);
            }
            return [...prev, {
                id: prod.id,
                name: prod.name,
                sku: prod.sku,
                price: price,
                quantity: 1,
                tax_rate: extractedTaxRate,
                unit: prodUnit,
                total: price,
                source: prod.source,
                isUnlimited: isUnlimited,
                rawProduct: prod.rawProduct || prod
            }];
        });
    };

    const handleKioskUpdateQty = (itemId, delta) => {
        setKioskCart(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null;
                    if (!item.isUnlimited && delta > 0) {
                        const originalProd = inventory.find(p => p.id === itemId);
                        if (originalProd && newQty > (parseFloat(originalProd.quantity) || 0)) {
                            alert('Cannot add more than available store stock!');
                            return item;
                        }
                    }
                    return { ...item, quantity: newQty, total: Math.round(newQty * item.price * 100) / 100 };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const handleKioskSubmitOrder = () => {
        if (!kioskCart || kioskCart.length === 0) {
            alert('Your order is empty. Please add items before placing order.');
            return;
        }

        const kioskOrderNum = Math.floor(1000 + Math.random() * 9000);
        const orderIdStr = `K-${kioskOrderNum}`;
        const totalAmount = kioskCart.reduce((acc, it) => acc + (it.total || ((it.price || 0) * (it.quantity || 1))), 0);
        const itemsCount = kioskCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        const newHeldCart = {
            id: Date.now(),
            displayId: kioskOrderNum,
            customName: `Kiosk #${orderIdStr} - ${kioskCustomerName || 'In-Store Guest'}`,
            cart: [...kioskCart],
            customerName: kioskCustomerName || 'In-Store Customer',
            customerEmail: kioskCustomerPhone || '',
            selectedCustomerObj: null,
            discountVal: 0,
            discountType: 'percentage',
            taxRate: 18,
            loyaltyPointsEarned: 0,
            loyaltyPointsRedeemed: 0,
            isPtsEarnedManuallyEdited: false,
            isKioskOrder: true,
            total: totalAmount
        };

        // Push to POS Cashier's held carts list
        setHeldCarts(prev => [newHeldCart, ...prev]);

        // Push real-time notification to Cashier
        setKioskOrderNotification({
            orderId: orderIdStr,
            heldCartId: newHeldCart.id,
            customerName: kioskCustomerName || 'In-Store Guest',
            customerPhone: kioskCustomerPhone,
            itemCount: itemsCount,
            total: totalAmount
        });

        // Play pleasant chime
        playKioskOrderChime();

        // Show customer success screen
        setKioskOrderSuccessInfo({
            orderId: orderIdStr,
            total: totalAmount,
            itemsCount: itemsCount,
            customerName: kioskCustomerName
        });

        // Reset customer form
        setKioskCart([]);
        setKioskCustomerName('');
        setKioskCustomerPhone('');
    };

    const handleKioskPinUnlockSubmit = () => {
        const correctPin = String(posKioskPin || '1234').trim();
        if (String(kioskPinInput).trim() === correctPin) {
            setIsCustomerViewActive(false);
            setKioskPinUnlockModalOpen(false);
            setKioskPinInput('');
            setKioskPinError('');
        } else {
            setKioskPinError('Incorrect PIN code. Please enter the correct staff security PIN.');
        }
    };

    const PRINTER_CONFIGS = {
        '2inch': {
            label: '2" (58mm)',
            widthMm: '58mm',
            modalWidth: '320px',
            cssWidth: '240px',
            fontSize: '0.69rem',
            tableFontSize: '0.67rem',
            desc: 'Mini 58mm Thermal Printer'
        },
        '3inch': {
            label: '3" (80mm)',
            widthMm: '80mm',
            modalWidth: '390px',
            cssWidth: '320px',
            fontSize: '0.75rem',
            tableFontSize: '0.74rem',
            desc: 'Standard 80mm POS Printer'
        },
        '4inch': {
            label: '4" (100mm)',
            widthMm: '100mm',
            modalWidth: '470px',
            cssWidth: '400px',
            fontSize: '0.82rem',
            tableFontSize: '0.80rem',
            desc: 'Wide 100mm Thermal Printer'
        }
    };
    const activePrinterConfig = PRINTER_CONFIGS[receiptPrinterSize] || PRINTER_CONFIGS['3inch'];

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

        const branchFullAddress = selectedPosBranch ? (
            [selectedPosBranch.address, selectedPosBranch.city, selectedPosBranch.state, selectedPosBranch.pincode].filter(Boolean).join(', ') || selectedPosBranch.address
        ) : null;

        const shopName =
            selectedPosBranch?.name ||
            user?.branch_name ||
            user?.branchName ||
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
            branchFullAddress ||
            selectedPosBranch?.address ||
            org.address ||
            cfg.registeredAddress ||
            userProfile.address ||
            activeConfig.registeredAddress ||
            activeConfig.pos_shop_address ||
            user?.address ||
            (org.city ? `${org.city}${org.pincode ? ` - ${org.pincode}` : ''}` : '') ||
            (cfg.city ? `${cfg.city}${cfg.pincode ? ` - ${cfg.pincode}` : ''}` : '') ||
            'Commercial Center, Main Road';

        const phone =
            selectedPosBranch?.phone ||
            org.phone ||
            cfg.phone ||
            userProfile.phone ||
            activeConfig.phone ||
            activeConfig.pos_shop_phone ||
            user?.phone ||
            '';

        const email =
            selectedPosBranch?.email ||
            org.email ||
            cfg.email ||
            userProfile.email ||
            activeConfig.email ||
            activeConfig.pos_shop_email ||
            user?.email ||
            '';

        const gstin =
            selectedPosBranch?.gstin ||
            org.gstin ||
            cfg.gstinRef ||
            userProfile.gstin ||
            userProfile.gstinRef ||
            activeConfig.gstinRef ||
            activeConfig.pos_shop_gstin ||
            user?.gstin ||
            user?.gstinRef ||
            '33AAAAA0000A1Z5';

        const tagline =
            cfg.pos_shop_tagline ||
            org.tagline ||
            activeConfig.pos_shop_tagline ||
            'Thank you for shopping with us! Visit again!';

        return { 
            shopName, 
            address, 
            phone, 
            email, 
            gstin, 
            tagline,
            branchId: selectedPosBranch?.id,
            branchName: selectedPosBranch?.name
        };
    }, [customizationProfile, activeConfig, userProfile, user, selectedPosBranch]);

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
                discount_amount: data?.discount_amount !== undefined ? data.discount_amount : totalDiscountAmount,
                discount: data?.discount_amount !== undefined ? data.discount_amount : totalDiscountAmount,
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
            setAppliedShowroomPromo(null);
            setStoreCreditToRedeem('');
            setActiveHeldCartInfo(null);
            setIsCreditMode(false);
            setCreditReceivedAmount('');

            // Refetch to reflect updated inventory, customers & stats
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            queryClient.invalidateQueries({ queryKey: ['crossBranchCustomers'] });
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

    // Filtered & Sorted Products Catalog
    const filteredProducts = React.useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();

        const filtered = inventory.filter(prod => {
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

            // Alphabet Letter Filter (e.g. from A-Z jump bar)
            let matchesLetter = true;
            if (alphabetLetterFilter) {
                const prodName = (prod.name || '').trim();
                if (alphabetLetterFilter === '#') {
                    matchesLetter = !prodName || !/^[A-Za-z]/i.test(prodName);
                } else {
                    matchesLetter = prodName.toUpperCase().startsWith(alphabetLetterFilter.toUpperCase());
                }
            }

            if (!matchesCategory || !matchesWarehouse || !matchesLetter) {
                return false;
            }

            if (!lowerSearch) {
                return true;
            }

            // Search Target matching: 'all' | 'alphabet' | 'code'
            if (searchTarget === 'alphabet') {
                return (prod.name || '').toLowerCase().includes(lowerSearch);
            }
            if (searchTarget === 'code') {
                return (
                    (prod.sku || '').toLowerCase().includes(lowerSearch) ||
                    (prod.barcode || '').toLowerCase().includes(lowerSearch) ||
                    (prod.hsn_code || '').toLowerCase().includes(lowerSearch) ||
                    String(prod.id || '').toLowerCase().includes(lowerSearch)
                );
            }

            return (
                (prod.name || '').toLowerCase().includes(lowerSearch) ||
                (prod.sku || '').toLowerCase().includes(lowerSearch) ||
                (prod.barcode || '').toLowerCase().includes(lowerSearch) ||
                (prod.category || '').toLowerCase().includes(lowerSearch) ||
                (prod.price || 0).toString().includes(lowerSearch)
            );
        });

        // Sorting: 'alphabet_asc' | 'alphabet_desc' | 'code_asc' | 'code_desc' | 'default'
        if (productSort === 'alphabet_asc') {
            return filtered.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true }));
        }
        if (productSort === 'alphabet_desc') {
            return filtered.slice().sort((a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base', numeric: true }));
        }
        if (productSort === 'code_asc') {
            return filtered.slice().sort((a, b) => {
                const codeA = (a.sku || a.barcode || a.hsn_code || String(a.id || '')).trim();
                const codeB = (b.sku || b.barcode || b.hsn_code || String(b.id || '')).trim();
                return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
            });
        }
        if (productSort === 'code_desc') {
            return filtered.slice().sort((a, b) => {
                const codeA = (a.sku || a.barcode || a.hsn_code || String(a.id || '')).trim();
                const codeB = (b.sku || b.barcode || b.hsn_code || String(b.id || '')).trim();
                return codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
            });
        }

        return filtered;
    }, [inventory, searchTerm, searchTarget, selectedWarehouseIds, dbWarehouses, selectedCategory, alphabetLetterFilter, productSort]);

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
            const freshCredit = parseFloat(matched.credit_held ?? matched.outstanding_balance ?? matched.due_balance ?? 0);
            const curCredit = parseFloat(selectedCustomerObj.credit_held ?? selectedCustomerObj.outstanding_balance ?? selectedCustomerObj.due_balance ?? 0);
            if (freshLtp !== curLtp || freshCredit !== curCredit || matched.name !== selectedCustomerObj.name || matched.email !== selectedCustomerObj.email) {
                setSelectedCustomerObj(prev => ({
                    ...(prev || {}),
                    ...matched,
                    credit_held: freshCredit,
                    outstanding_balance: freshCredit,
                    due_balance: freshCredit
                }));
            }
        }
    }, [customers, selectedCustomerObj]);

    // Live loyalty and credit balance check directly from backend database when customer identifier/email changes
    React.useEffect(() => {
        const queryTerm = customerEmail || (selectedCustomerObj?.email || selectedCustomerObj?.phone_number || '');
        if (!queryTerm || !String(queryTerm).trim()) return;

        const timer = setTimeout(() => {
            crmService.lookupCustomerByEmail(queryTerm).then(res => {
                if (res && res.exists) {
                    const backendLtp = parseFloat(res.loyalty_points || 0) || 0;
                    const backendCredit = parseFloat(res.credit_held ?? res.outstanding_balance ?? res.due_balance ?? 0);
                    setSelectedCustomerObj(prev => {
                        const curLtp = prev ? getCustomerLtp(prev) : 0;
                        const curCredit = parseFloat(prev?.credit_held ?? prev?.outstanding_balance ?? prev?.due_balance ?? 0);
                        if (!prev || curLtp !== backendLtp || backendCredit !== curCredit) {
                            return {
                                ...(prev || {}),
                                id: res.user_id || prev?.id,
                                email: res.email || prev?.email,
                                phone_number: res.phone || prev?.phone_number || prev?.phone,
                                name: res.customer_name || prev?.name || customerName,
                                loyalty_points: backendLtp,
                                credit_held: backendCredit,
                                outstanding_balance: backendCredit,
                                due_balance: backendCredit,
                                store_credit: res.store_credit !== undefined ? res.store_credit : (prev?.store_credit || 0),
                                credit_limit: res.credit_limit !== undefined ? res.credit_limit : (prev?.credit_limit || 0)
                            };
                        }
                        return prev;
                    });
                }
            }).catch(() => {});
        }, 250);

        return () => clearTimeout(timer);
    }, [customerEmail, selectedCustomerObj?.id]);

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

    const discountAmount = discountType === 'percentage'
        ? (subtotal * (parseFloat(discountVal) || 0) / 100)
        : (parseFloat(discountVal) || 0);

    // Showroom-Specific Promotion Discount (Strictly for this branch showroom)
    const showroomPromoDiscount = React.useMemo(() => {
        if (!appliedShowroomPromo || subtotal <= 0) return 0;
        if (appliedShowroomPromo.min_order_amount > 0 && subtotal < appliedShowroomPromo.min_order_amount) return 0;

        const val = parseFloat(appliedShowroomPromo.discount_value) || 0;
        if (appliedShowroomPromo.promotion_type === 'PERCENTAGE') {
            if (appliedShowroomPromo.applies_to === 'ALL_PRODUCTS') {
                return (subtotal * val) / 100;
            } else if (appliedShowroomPromo.applies_to === 'CATEGORY') {
                const catTotal = cart.reduce((acc, it) => {
                    const catItem = inventory.find(p => p.id === it.id || (p.sku && it.sku && p.sku === it.sku));
                    return (catItem?.category?.toLowerCase() === appliedShowroomPromo.target_name?.toLowerCase()) ? acc + it.total : acc;
                }, 0);
                return (catTotal * val) / 100;
            } else if (appliedShowroomPromo.applies_to === 'SPECIFIC_PRODUCT') {
                const prodTotal = cart.reduce((acc, it) => {
                    return (String(it.id) === String(appliedShowroomPromo.target_id)) ? acc + it.total : acc;
                }, 0);
                return (prodTotal * val) / 100;
            }
            return (subtotal * val) / 100;
        } else if (appliedShowroomPromo.promotion_type === 'FLAT_AMOUNT') {
            return Math.min(subtotal, val);
        } else if (appliedShowroomPromo.promotion_type === 'CUSTOM_PRICE') {
            return Math.min(subtotal, val);
        }
        return 0;
    }, [appliedShowroomPromo, subtotal, cart, inventory]);

    const totalDiscountAmount = discountAmount + showroomPromoDiscount;
    const discountedTotal = Math.max(0, subtotal - totalDiscountAmount);
    const discountPercent = subtotal > 0 ? (totalDiscountAmount / subtotal) : 0;

    const calculatedTax = cart.reduce((acc, item) => {
        const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
        const discountedItemTotal = item.total * (1 - discountPercent);
        const itemTaxRate = parseFloat(item.tax_rate !== undefined && item.tax_rate !== null && !isNaN(parseFloat(item.tax_rate)) ? item.tax_rate : (catItem?.tax_percentage || 0)) || 0;
        return acc + (discountedItemTotal * (itemTaxRate / 100));
    }, 0);

    // Master Config for Loyalty (sourced directly from Backend API: business_loyalty_settings & users.settings)
    const loyaltyEnabled = React.useMemo(() => {
        if (loyaltyProgramSettings?.loyaltyEnabled !== undefined) return Boolean(loyaltyProgramSettings.loyaltyEnabled);
        if (loyaltyProgramSettings?.loyalty !== undefined) return Boolean(loyaltyProgramSettings.loyalty);
        if (activeConfig?.loyaltyEnabled !== undefined) return Boolean(activeConfig.loyaltyEnabled);
        if (activeConfig?.loyalty !== undefined) return Boolean(activeConfig.loyalty);
        if (activeConfig?.loyalty_enabled !== undefined) return Boolean(activeConfig.loyalty_enabled && activeConfig.loyalty_enabled !== 0);
        return false;
    }, [loyaltyProgramSettings, activeConfig]);

    const ptsFor1Rs = loyaltyProgramSettings?.loyaltyPointsPer1Rs !== undefined ? loyaltyProgramSettings.loyaltyPointsPer1Rs : (activeConfig.loyaltyPointsPer1Rs !== undefined ? activeConfig.loyaltyPointsPer1Rs : 100);
    const rsPer1Point = loyaltyProgramSettings?.loyaltyRsPer1Point !== undefined ? loyaltyProgramSettings.loyaltyRsPer1Point : (activeConfig.loyaltyRsPer1Point !== undefined ? activeConfig.loyaltyRsPer1Point : 100);
    const maxClaimPct = loyaltyProgramSettings?.loyaltyMaxClaimPercent !== undefined ? loyaltyProgramSettings.loyaltyMaxClaimPercent : (activeConfig.loyaltyMaxClaimPercent !== undefined ? activeConfig.loyaltyMaxClaimPercent : 50);

    const availableCustomerPoints = selectedCustomerObj ? getCustomerLtp(selectedCustomerObj) : 0;
    const maxClaimablePoints = Math.floor(availableCustomerPoints * (maxClaimPct / 100));
    const maxPointsForBill = ptsFor1Rs > 0 ? Math.floor((discountedTotal + calculatedTax) * ptsFor1Rs) : 0;
    const maxRedeemablePoints = loyaltyEnabled ? Math.min(maxClaimablePoints, maxPointsForBill) : 0;

    const effectivePointsRedeemed = (loyaltyEnabled && selectedCustomerObj) ? Math.max(0, Math.min(maxRedeemablePoints, parseFloat(loyaltyPointsRedeemed) || 0)) : 0;
    const loyaltyDiscountAmount = (loyaltyEnabled && ptsFor1Rs > 0) ? (effectivePointsRedeemed / ptsFor1Rs) : 0;

    // Cross-Branch Store Credit Redemption calculation
    const availableStoreCredit = selectedCustomerObj ? (parseFloat(selectedCustomerObj.store_credit) || 0) : 0;
    const maxRedeemableCredit = Math.min(availableStoreCredit, Math.max(0, discountedTotal + calculatedTax - loyaltyDiscountAmount));
    const effectiveStoreCreditRedeemed = selectedCustomerObj ? Math.max(0, Math.min(maxRedeemableCredit, parseFloat(storeCreditToRedeem) || 0)) : 0;

    const totalBeforeRound = Math.max(0, discountedTotal + calculatedTax - loyaltyDiscountAmount - effectiveStoreCreditRedeemed);
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

    const handleCheckout = (mode, customReceived = null) => {
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

        const isCredit = mode === 'Credit';
        const received = isCredit
            ? (customReceived !== null ? parseFloat(customReceived) : (parseFloat(creditReceivedAmount) || 0))
            : finalTotal;
        const due = isCredit ? Math.max(0, finalTotal - received) : 0;

        const cgst = gstType === 'intra' ? (calculatedTax / 2) : 0;
        const sgst = gstType === 'intra' ? (calculatedTax / 2) : 0;
        const igst = gstType === 'inter' ? calculatedTax : 0;

        const payload = {
            customer_id: selectedCustomerObj?.id || null,
            client_name: customerName || 'Walk-in Customer',
            client_email: customerEmail || selectedCustomerObj?.email || null,
            client_phone: selectedCustomerObj?.phone_number || selectedCustomerObj?.phone || null,
            branch_id: selectedPosBranch?.id || user?.branch_id || user?.branchId || undefined,
            shop_name: selectedPosBranch?.name || user?.branch_name || user?.branchName || resolvedShopDetails?.shopName,
            shop_address: resolvedShopDetails?.address || selectedPosBranch?.address,
            shop_phone: selectedPosBranch?.phone || resolvedShopDetails?.phone,
            shop_email: selectedPosBranch?.email || resolvedShopDetails?.email,
            shop_gstin: selectedPosBranch?.gstin || resolvedShopDetails?.gstin,
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
            gst_type: gstType,
            cgst_amount: cgst,
            sgst_amount: sgst,
            igst_amount: igst,
            total_amount: finalTotal,
            paid_amount: received,
            due_amount: due,
            discount_amount: totalDiscountAmount,
            store_credit_redeemed: effectiveStoreCreditRedeemed,
            showroom_promo_id: appliedShowroomPromo?.id || null,
            showroom_promo_name: appliedShowroomPromo?.title || null,
            showroom_promo_discount: showroomPromoDiscount,
            round_off: roundOff,
            payment_mode: mode,
            items: validCartItems.map(item => {
                const catItem = inventory.find(p => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
                const itemTaxRate = parseFloat(item.tax_rate !== undefined && item.tax_rate !== null && !isNaN(parseFloat(item.tax_rate)) ? item.tax_rate : (catItem?.tax_percentage || 0)) || 0;
                const itemTotal = parseFloat(item.total) || (parseFloat(item.price || 0) * (parseFloat(item.quantity) || 1));
                const itemTaxAmount = itemTotal * (itemTaxRate / 100);
                return {
                    id: item.id,
                    name: item.name,
                    description: item.name,
                    quantity: parseFloat(item.quantity) || 0,
                    unit: item.unit || 'PCS',
                    price: parseFloat(item.price) || 0,
                    tax_rate: itemTaxRate,
                    gst_rate: itemTaxRate,
                    tax_amount: itemTaxAmount,
                    gst_amount: itemTaxAmount,
                    hsn: item.hsn || catItem?.hsn || catItem?.hsn_code || '',
                    total: itemTotal,
                    source: item.source
                };
            })
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
        <div className="pos-billing-layout">

            {/* Mobile View Switcher Tab Bar (Visible on mobile/tablet <= 992px) */}
            <div className="pos-mobile-nav">
                <button
                    type="button"
                    className={`pos-mobile-nav-btn ${mobileActiveTab === 'catalog' ? 'active' : ''}`}
                    onClick={() => setMobileActiveTab('catalog')}
                >
                    <ShoppingBag size={16} />
                    <span>Catalog ({filteredProducts.length})</span>
                </button>
                <button
                    type="button"
                    className={`pos-mobile-nav-btn ${mobileActiveTab === 'cart' ? 'active' : ''}`}
                    onClick={() => setMobileActiveTab('cart')}
                >
                    <Receipt size={16} />
                    <span>Cart ({cart.reduce((s, it) => s + (it.quantity || 1), 0)})</span>
                    {cart.length > 0 && (
                        <span style={{ background: mobileActiveTab === 'cart' ? 'rgba(0,0,0,0.18)' : '#ECFDF5', color: mobileActiveTab === 'cart' ? '#FFF' : '#047857', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '850', marginLeft: '2px' }}>
                            {formatCurrency(finalTotal)}
                        </span>
                    )}
                </button>
            </div>

            {/* Left Side: Product Catalog */}
            <div className={`pos-left-catalog ${mobileActiveTab === 'cart' ? 'pos-mobile-hidden' : ''}`}>

                {/* Header: Search & Summary Widget */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                    <div className="pos-header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexShrink: 0 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', flexShrink: 0 }}>
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>POS System</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                    {/* Showroom Branch Indicator or Switcher (No User ID displayed here) */}
                                    {(user?.is_sub_id && (user?.branch_name || user?.branchName)) ? (
                                        <span style={{ fontSize: '0.74rem', color: '#065F46', background: '#D1FAE5', border: '1px solid #6EE7B7', padding: '1px 8px', borderRadius: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                            <Building size={12} className="text-emerald-600" />
                                            {user?.branch_name || user?.branchName}
                                        </span>
                                    ) : posBranches.length > 1 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1px 8px', borderRadius: '6px' }}>
                                            <Building size={12} className="text-emerald-600" />
                                            <select
                                                value={selectedPosBranch?.id || ''}
                                                onChange={(e) => {
                                                    const found = posBranches.find(b => String(b.id) === e.target.value);
                                                    if (found) setSelectedPosBranch(found);
                                                }}
                                                style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0F172A', background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
                                            >
                                                {posBranches.map(b => (
                                                    <option key={b.id} value={b.id}>📍 {b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.74rem', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1px 8px', borderRadius: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                            <Building size={12} className="text-emerald-600" />
                                            {selectedPosBranch?.name || posBranches[0]?.name || user?.branch_name || user?.branchName || 'Main Branch'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons on the same row */}
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
                            <button
                                onClick={() => setIsAddProductModalOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    height: '36px',
                                    padding: '0 0.8rem',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    boxShadow: '0 4px 10px rgba(16,185,129,0.15)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Plus size={15} strokeWidth={3} /> Add Product
                            </button>

                            {todaySummary && (
                                <div 
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        background: '#ECFDF5', 
                                        border: '1px solid #A7F3D0', 
                                        padding: '0.2rem 0.65rem', 
                                        borderRadius: '10px', 
                                        height: '36px', 
                                        boxSizing: 'border-box',
                                        flexShrink: 0,
                                        cursor: 'default'
                                    }} 
                                    title={`Today Orders: ${todaySummary.total_orders || 0} • Total Sales: ${formatCurrency(todaySummary.total_sales || 0)}`}
                                >
                                    <span style={{ fontSize: '0.52rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase', lineHeight: 1 }}>Today Orders</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#065F46', lineHeight: 1.2 }}>{todaySummary.total_orders || 0}</span>
                                </div>
                            )}

                            {/* POS History Icon Button */}
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                title="POS Order History"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    background: '#F8FAFC',
                                    color: '#64748B',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
                            >
                                <History size={17} strokeWidth={2.2} />
                            </button>

                            {/* POS Settings Icon Button (Print, Credit, Kiosk, etc.) */}
                            <button
                                onClick={() => setShowPosSettingsModal(true)}
                                title="POS Settings: Print, Credit, Customer View, Kiosk PIN"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    background: '#F8FAFC',
                                    color: '#334155',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155'; }}
                            >
                                <Settings size={17} strokeWidth={2.2} />
                            </button>

                            {/* Customer View / Self-Order Kiosk Mode Button */}
                            <button
                                onClick={() => {
                                    setIsCustomerViewActive(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                                    color: 'white',
                                    border: 'none',
                                    height: '36px',
                                    padding: '0 0.75rem',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title="Open In-Store Customer Self-Order Kiosk"
                            >
                                <Monitor size={15} strokeWidth={2.5} /> Kiosk
                            </button>
                        </div>
                    </div>

                    {/* Top Filtering Row (Warehouse, Search, Categories) */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

                        {/* Category Dropdown (All Categories) - Placed BEFORE Search Bar */}
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
                                    left: 0,
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

                        {/* Search Box */}
                        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '140px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder={
                                    searchTarget === 'alphabet'
                                        ? "Search by product name (Alphabet wise)..."
                                        : searchTarget === 'code'
                                            ? "Search by barcode SKU or code..."
                                            : "Search item name, category or barcode SKU..."
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 2.2rem 0.75rem 2.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, transition: 'border-color 0.2s', height: '100%' }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(148, 163, 184, 0.2)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748B'
                                    }}
                                    title="Clear search"
                                >
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>

                        {/* Product Filter & Sort / List Dropdown (Icon Only) */}
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={sortFilterDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsSortFilterDropdownOpen(!isSortFilterDropdownOpen)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.55rem',
                                    minWidth: '40px',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    border: (productSort !== 'default' || searchTarget !== 'all') ? '1.5px solid #10B981' : '1.5px solid #000000',
                                    background: (productSort !== 'default' || searchTarget !== 'all') ? '#ECFDF5' : '#FFFFFF',
                                    color: (productSort !== 'default' || searchTarget !== 'all') ? '#047857' : '#0F172A',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSortFilterDropdownOpen ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                                    position: 'relative'
                                }}
                                title={
                                    productSort === 'alphabet_asc'
                                        ? 'List: Alphabet (A-Z)'
                                        : productSort === 'alphabet_desc'
                                            ? 'List: Alphabet (Z-A)'
                                            : productSort === 'code_asc'
                                                ? 'List: Code Wise (Asc)'
                                                : productSort === 'code_desc'
                                                    ? 'List: Code Wise (Desc)'
                                                    : 'List Options (Alphabet / Code Filter)'
                                }
                            >
                                {productSort === 'alphabet_asc' ? (
                                    <ArrowDownAZ size={17} style={{ color: '#059669' }} />
                                ) : productSort === 'alphabet_desc' ? (
                                    <ArrowDownZA size={17} style={{ color: '#059669' }} />
                                ) : productSort === 'code_asc' || productSort === 'code_desc' ? (
                                    <Barcode size={17} style={{ color: '#059669' }} />
                                ) : (
                                    <SlidersHorizontal size={17} style={{ color: searchTarget !== 'all' ? '#059669' : '#0F172A' }} />
                                )}

                                {(productSort !== 'default' || searchTarget !== 'all' || alphabetLetterFilter) && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: '#10B981'
                                    }} />
                                )}
                            </button>

                            {/* Dropdown Popover */}
                            {isSortFilterDropdownOpen && (
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
                                    minWidth: '270px',
                                    maxWidth: '320px',
                                    padding: '0.65rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.65rem'
                                }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.4rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            Product List Filter & Sort
                                        </span>
                                        {(productSort !== 'default' || searchTarget !== 'all' || alphabetLetterFilter) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSort('default');
                                                    setSearchTarget('all');
                                                    setAlphabetLetterFilter('');
                                                }}
                                                style={{ border: 'none', background: 'transparent', color: '#10B981', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                                            >
                                                Reset Default
                                            </button>
                                        )}
                                    </div>

                                    {/* View List By: Alphabet or Code */}
                                    <div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
                                            View Product List In:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {/* Alphabet Wise (A to Z) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSort(productSort === 'alphabet_asc' ? 'default' : 'alphabet_asc');
                                                    if (productSort !== 'alphabet_asc') setAlphabetLetterFilter('');
                                                    setIsSortFilterDropdownOpen(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0.65rem',
                                                    borderRadius: '8px',
                                                    background: productSort === 'alphabet_asc' ? '#ECFDF5' : '#F8FAFC',
                                                    border: productSort === 'alphabet_asc' ? '1px solid #A7F3D0' : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <ArrowDownAZ size={16} color={productSort === 'alphabet_asc' ? '#059669' : '#475569'} />
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: productSort === 'alphabet_asc' ? '800' : '600', color: productSort === 'alphabet_asc' ? '#047857' : '#1E293B' }}>
                                                            Alphabet Wise (A → Z)
                                                        </div>
                                                        <div style={{ fontSize: '0.67rem', color: '#64748B' }}>Sort items by name A to Z</div>
                                                    </div>
                                                </div>
                                                {productSort === 'alphabet_asc' && <Check size={15} color="#059669" strokeWidth={2.5} />}
                                            </button>

                                            {/* Alphabet Wise (Z to A) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSort(productSort === 'alphabet_desc' ? 'default' : 'alphabet_desc');
                                                    if (productSort !== 'alphabet_desc') setAlphabetLetterFilter('');
                                                    setIsSortFilterDropdownOpen(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0.65rem',
                                                    borderRadius: '8px',
                                                    background: productSort === 'alphabet_desc' ? '#ECFDF5' : '#F8FAFC',
                                                    border: productSort === 'alphabet_desc' ? '1px solid #A7F3D0' : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <ArrowDownZA size={16} color={productSort === 'alphabet_desc' ? '#059669' : '#475569'} />
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: productSort === 'alphabet_desc' ? '800' : '600', color: productSort === 'alphabet_desc' ? '#047857' : '#1E293B' }}>
                                                            Alphabet Wise (Z → A)
                                                        </div>
                                                        <div style={{ fontSize: '0.67rem', color: '#64748B' }}>Sort items by name Z to A</div>
                                                    </div>
                                                </div>
                                                {productSort === 'alphabet_desc' && <Check size={15} color="#059669" strokeWidth={2.5} />}
                                            </button>

                                            {/* Code Wise (0 to 9, A to Z) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSort(productSort === 'code_asc' ? 'default' : 'code_asc');
                                                    setAlphabetLetterFilter('');
                                                    setIsSortFilterDropdownOpen(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0.65rem',
                                                    borderRadius: '8px',
                                                    background: productSort === 'code_asc' ? '#ECFDF5' : '#F8FAFC',
                                                    border: productSort === 'code_asc' ? '1px solid #A7F3D0' : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Barcode size={16} color={productSort === 'code_asc' ? '#059669' : '#475569'} />
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: productSort === 'code_asc' ? '800' : '600', color: productSort === 'code_asc' ? '#047857' : '#1E293B' }}>
                                                            Code Wise (0 → 9 / A → Z)
                                                        </div>
                                                        <div style={{ fontSize: '0.67rem', color: '#64748B' }}>Sort by SKU / Barcode / Code</div>
                                                    </div>
                                                </div>
                                                {productSort === 'code_asc' && <Check size={15} color="#059669" strokeWidth={2.5} />}
                                            </button>

                                            {/* Code Wise (Descending) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSort(productSort === 'code_desc' ? 'default' : 'code_desc');
                                                    setAlphabetLetterFilter('');
                                                    setIsSortFilterDropdownOpen(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0.65rem',
                                                    borderRadius: '8px',
                                                    background: productSort === 'code_desc' ? '#ECFDF5' : '#F8FAFC',
                                                    border: productSort === 'code_desc' ? '1px solid #A7F3D0' : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Barcode size={16} color={productSort === 'code_desc' ? '#059669' : '#475569'} />
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: productSort === 'code_desc' ? '800' : '600', color: productSort === 'code_desc' ? '#047857' : '#1E293B' }}>
                                                            Code Wise (9 → 0 / Z → A)
                                                        </div>
                                                        <div style={{ fontSize: '0.67rem', color: '#64748B' }}>Reverse code sequence</div>
                                                    </div>
                                                </div>
                                                {productSort === 'code_desc' && <Check size={15} color="#059669" strokeWidth={2.5} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section 2: Search Query Field Filter */}
                                    <div style={{ paddingTop: '0.35rem', borderTop: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
                                            Search In Field:
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                                            {[
                                                { id: 'all', label: 'All Fields' },
                                                { id: 'alphabet', label: 'Name (A-Z)' },
                                                { id: 'code', label: 'Code / SKU' }
                                            ].map(opt => {
                                                const isSelected = searchTarget === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchTarget(opt.id);
                                                            setIsSortFilterDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: '0.35rem 0.25rem',
                                                            borderRadius: '6px',
                                                            border: isSelected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                                            background: isSelected ? '#ECFDF5' : '#FFFFFF',
                                                            color: isSelected ? '#047857' : '#475569',
                                                            fontSize: '0.72rem',
                                                            fontWeight: isSelected ? '800' : '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Alphabet Letter Jump Strip (When Alphabet Wise or Name Search is Active) */}
                    {(productSort === 'alphabet_asc' || productSort === 'alphabet_desc' || searchTarget === 'alphabet') && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            overflowX: 'auto',
                            padding: '0.3rem 0.4rem',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', paddingLeft: '4px', whiteSpace: 'nowrap' }}>
                                Jump To:
                            </span>
                            {['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'].map(letter => {
                                const isSelected = (!alphabetLetterFilter && letter === 'All') || (alphabetLetterFilter === letter);
                                return (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => setAlphabetLetterFilter(letter === 'All' ? '' : letter)}
                                        style={{
                                            minWidth: '22px',
                                            height: '22px',
                                            padding: '0 4px',
                                            borderRadius: '5px',
                                            border: isSelected ? '1px solid #10B981' : '1px solid transparent',
                                            background: isSelected ? '#10B981' : 'transparent',
                                            color: isSelected ? '#FFFFFF' : '#475569',
                                            fontSize: '0.7rem',
                                            fontWeight: isSelected ? '800' : '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s ease',
                                            flexShrink: 0
                                        }}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Active Filter Indicator Bar */}
                    {(productSort !== 'default' || searchTarget !== 'all' || alphabetLetterFilter) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.6rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.72rem', color: '#065F46', fontWeight: '600', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '800' }}>Active Filter:</span>
                                {productSort === 'alphabet_asc' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>🔤 Alphabet (A-Z)</span>}
                                {productSort === 'alphabet_desc' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>🔤 Alphabet (Z-A)</span>}
                                {productSort === 'code_asc' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>🏷️ Code Wise (Asc)</span>}
                                {productSort === 'code_desc' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>🏷️ Code Wise (Desc)</span>}
                                {alphabetLetterFilter && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>Letter: "{alphabetLetterFilter}"</span>}
                                {searchTarget === 'alphabet' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>Search: Name Only</span>}
                                {searchTarget === 'code' && <span style={{ background: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>Search: Code/SKU Only</span>}
                                <span style={{ color: '#047857' }}>({filteredProducts.length} items found)</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setProductSort('default');
                                    setSearchTarget('all');
                                    setAlphabetLetterFilter('');
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#047857', fontWeight: '800', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}
                            >
                                Reset All
                            </button>
                        </div>
                    )}
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
            <div className={`pos-right-cart ${mobileActiveTab === 'catalog' ? 'pos-mobile-hidden' : ''}`}>

                {/* Customer Attachment Row */}
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #F1F5F9', background: '#FFF', flexShrink: 0 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        {/* Mobile Back to Catalog Button */}
                        <button
                            type="button"
                            className="pos-mobile-back-btn"
                            onClick={() => setMobileActiveTab('catalog')}
                            style={{
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                borderRadius: '8px',
                                padding: '0.25rem 0.6rem',
                                color: '#047857',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                            title="Back to Product Catalog"
                        >
                            ← Catalog
                        </button>

                        {/* Customer Info Label */}
                        <span style={{ fontSize: '0.75rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Customer Info
                        </span>

                        {/* Search & Actions Bar in Same Line */}
                        <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.35rem 0.55rem' }}>
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
                                                {/* Customer Credit Held in Dropdown */}
                                                {(() => {
                                                    const custCredit = parseFloat(cust.credit_held ?? cust.outstanding_balance ?? cust.due_balance ?? 0);
                                                    const custStoreCredit = parseFloat(cust.store_credit ?? 0);
                                                    return (
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                                                            {custCredit > 0 ? (
                                                                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', padding: '1px 5px', borderRadius: '4px' }}>
                                                                    💳 Credit Held: {formatCurrency(custCredit)}
                                                                </span>
                                                            ) : (
                                                                <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                                                                    💳 Credit: {formatCurrency(0)}
                                                                </span>
                                                            )}
                                                            {custStoreCredit > 0 && (
                                                                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1px 5px', borderRadius: '4px' }}>
                                                                    🎁 Store Credit: {formatCurrency(custStoreCredit)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            {loyaltyEnabled && (
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                        ⭐ LTP: {getCustomerLtp(cust)}
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
                        <div style={{ marginTop: '0.6rem', padding: '0.65rem 0.85rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '850', color: '#065F46', fontSize: '0.85rem' }}>
                                    Name: <strong>{selectedCustomerObj.name}</strong>
                                </span>
                                <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                <span style={{ color: '#047857', fontWeight: '700', fontSize: '0.8rem' }} title={selectedCustomerObj.email}>
                                    {selectedCustomerObj.email || selectedCustomerObj.phone_number || 'N/A'}
                                </span>
                                {loyaltyEnabled && (
                                    <>
                                        <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                        <span style={{ fontWeight: '850', color: '#B45309', background: '#FFFBEB', padding: '0.1rem 0.45rem', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            ⭐ LTP: <strong>{getCustomerLtp(selectedCustomerObj)}</strong>
                                        </span>
                                    </>
                                )}
                                <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.1rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                                    🏪 {selectedCustomerObj.branch_name || 'Main Showroom'}
                                </span>

                                {/* Outstanding Credit Held by this Customer */}
                                {(() => {
                                    const creditHeld = parseFloat(selectedCustomerObj.credit_held ?? selectedCustomerObj.outstanding_balance ?? selectedCustomerObj.due_balance ?? 0);
                                    const storeCredit = parseFloat(selectedCustomerObj.store_credit ?? 0);
                                    const creditLimit = parseFloat(selectedCustomerObj.credit_limit ?? 0);
                                    return (
                                        <>
                                            <span style={{ color: '#A7F3D0', fontWeight: '400' }}>|</span>
                                            {creditHeld > 0 ? (
                                                <span style={{ background: '#FEF2F2', color: '#991B1B', border: '1.5px solid #F87171', padding: '0.12rem 0.5rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '900', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px', boxShadow: '0 1px 3px rgba(239,68,68,0.1)' }}>
                                                    💳 Credit Held: {formatCurrency(creditHeld)}
                                                    {creditLimit > 0 && <span style={{ color: '#B91C1C', fontSize: '0.67rem', fontWeight: '700' }}>(Limit: {formatCurrency(creditLimit)})</span>}
                                                </span>
                                            ) : (
                                                <span style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', padding: '0.12rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    💳 Credit Held: {formatCurrency(0)}
                                                </span>
                                            )}
                                            {storeCredit > 0 && (
                                                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1.5px solid #93C5FD', padding: '0.12rem 0.5rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '900', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    🎁 Store Credit: {formatCurrency(storeCredit)}
                                                </span>
                                            )}
                                        </>
                                    );
                                })()}
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

                {/* Kiosk Order Real-time Notification Banner */}
                {kioskOrderNotification && (
                    <div style={{
                        padding: '0.65rem 1.25rem',
                        background: 'linear-gradient(90deg, #EFF6FF, #DBEAFE)',
                        borderBottom: '2px solid #3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 10px rgba(59, 130, 246, 0.15)',
                        animation: 'fadeIn 0.25s ease-in-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#2563EB', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}>
                                <Bell size={16} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>New In-Store Customer Order Received!</span>
                                    <span style={{ fontSize: '0.72rem', background: '#1D4ED8', color: '#fff', padding: '1px 8px', borderRadius: '12px', fontWeight: '800' }}>
                                        {kioskOrderNotification.orderId}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#2563EB', fontWeight: '600', marginTop: '1px' }}>
                                    Customer: <strong>{kioskOrderNotification.customerName || 'In-Store Guest'}</strong> {kioskOrderNotification.customerPhone ? `(${kioskOrderNotification.customerPhone})` : ''} • {kioskOrderNotification.itemCount} item(s) • Total: <strong>{formatCurrency(kioskOrderNotification.total || 0)}</strong>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <button
                                onClick={() => {
                                    restoreCart(kioskOrderNotification.heldCartId);
                                    setKioskOrderNotification(null);
                                }}
                                style={{
                                    background: '#2563EB',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.45rem 0.95rem',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
                                }}
                            >
                                <ShoppingCart size={13} /> Open in POS Cart
                            </button>
                            <button
                                onClick={() => setKioskOrderNotification(null)}
                                style={{
                                    background: '#fff',
                                    color: '#64748B',
                                    border: '1px solid #CBD5E1',
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.76rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

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
                                        background: hc.isKioskOrder ? (isActive ? '#EFF6FF' : '#F0FDF4') : (isActive ? '#DCFCE7' : '#FFFFFF'),
                                        border: hc.isKioskOrder ? (isActive ? '1.5px solid #3B82F6' : '1.5px solid #60A5FA') : (isActive ? '1px solid #86EFAC' : '1px solid #FCD34D'),
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: hc.isKioskOrder ? '#1D4ED8' : (isActive ? '#15803D' : '#92400E'),
                                        whiteSpace: 'nowrap',
                                        boxShadow: isActive ? '0 2px 6px rgba(22, 163, 74, 0.15)' : (hc.isKioskOrder ? '0 1px 4px rgba(59,130,246,0.15)' : 'none'),
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {hc.isKioskOrder && (
                                        <span style={{ background: '#2563EB', color: '#FFFFFF', padding: '1px 5px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '900', letterSpacing: '0.02em' }}>
                                            KIOSK
                                        </span>
                                    )}
                                    <span
                                        onClick={() => restoreCart(hc.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title="Click to view/edit this held cart"
                                    >
                                        {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hc.isKioskOrder ? '#2563EB' : '#16A34A', display: 'inline-block' }} />}
                                        {hc.customName || hc.customerName || `Cart #${hc.displayId}`} ({hc.cart?.length || 0} items)
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

                                    {/* Showroom-Specific Promotion */}
                                    {activePromosList.length > 0 && (
                                        <div style={{ background: '#F0FDF4', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Sparkles size={10} /> Showroom Promo
                                                </span>
                                                <span style={{ fontSize: '0.62rem', color: '#047857', fontWeight: '800' }}>
                                                    {activePromosList.length} Active
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                <select
                                                    value={appliedShowroomPromo?.id || ''}
                                                    onChange={(e) => {
                                                        const promo = activePromosList.find(p => String(p.id) === String(e.target.value));
                                                        setAppliedShowroomPromo(promo || null);
                                                    }}
                                                    style={{
                                                        flex: 1, minWidth: 0, padding: '0.25rem 0.45rem', boxSizing: 'border-box',
                                                        borderRadius: '6px', border: '1px solid #86EFAC', background: 'white',
                                                        fontSize: '0.75rem', fontWeight: '750', color: '#166534', outline: 'none'
                                                    }}
                                                >
                                                    <option value="">No Showroom Promo</option>
                                                    {activePromosList.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.title} ({p.promotion_type === 'PERCENTAGE' ? `${p.discount_value}% OFF` : `${formatCurrency(p.discount_value)} OFF`})
                                                        </option>
                                                    ))}
                                                </select>
                                                {appliedShowroomPromo && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setAppliedShowroomPromo(null)}
                                                        style={{ padding: '0.25rem 0.45rem', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', border: 'none', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            {showroomPromoDiscount > 0 && (
                                                <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#15803D', textAlign: 'right' }}>
                                                    Promo Savings: -{formatCurrency(showroomPromoDiscount)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Cross-Branch Store Credit */}
                                    {selectedCustomerObj && parseFloat(selectedCustomerObj.store_credit) > 0 && (
                                        <div style={{ background: '#EFF6FF', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Wallet size={10} /> Store Credit
                                                </span>
                                                <span style={{ fontSize: '0.62rem', color: '#1E40AF', fontWeight: '800' }}>
                                                    Avail: {formatCurrency(availableStoreCredit)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    max={maxRedeemableCredit}
                                                    placeholder="Credit To Use"
                                                    value={storeCreditToRedeem || ''}
                                                    onChange={(e) => {
                                                        let val = parseFloat(e.target.value) || 0;
                                                        if (val > maxRedeemableCredit) val = maxRedeemableCredit;
                                                        if (val < 0) val = 0;
                                                        setStoreCreditToRedeem(val);
                                                    }}
                                                    style={{
                                                        flex: 1, minWidth: 0, padding: '0.25rem 0.45rem', boxSizing: 'border-box',
                                                        borderRadius: '6px', border: '1px solid #93C5FD', background: 'white',
                                                        fontSize: '0.75rem', fontWeight: '750', color: '#1D4ED8', outline: 'none'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setStoreCreditToRedeem(maxRedeemableCredit)}
                                                    disabled={maxRedeemableCredit <= 0}
                                                    style={{
                                                        padding: '0.25rem 0.45rem', borderRadius: '6px', background: '#2563EB',
                                                        color: 'white', border: 'none', fontSize: '0.65rem', fontWeight: '800',
                                                        cursor: maxRedeemableCredit <= 0 ? 'not-allowed' : 'pointer',
                                                        opacity: maxRedeemableCredit <= 0 ? 0.5 : 1, whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Max
                                                </button>
                                            </div>
                                            {effectiveStoreCreditRedeemed > 0 && (
                                                <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#1D4ED8', textAlign: 'right' }}>
                                                    Credit Redeemed: -{formatCurrency(effectiveStoreCreditRedeemed)}
                                                </div>
                                            )}
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

                                        {/* Calculated GST with 3 Types (CGST, SGST, IGST) breakdown */}
                                        <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0.3rem 0.4rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569' }}>GST Breakdown</span>
                                                <div style={{ display: 'flex', gap: '2px', background: '#E2E8F0', padding: '1px', borderRadius: '4px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGstType('intra')}
                                                        style={{ border: 'none', background: gstType === 'intra' ? '#10B981' : 'transparent', color: gstType === 'intra' ? '#FFFFFF' : '#64748B', borderRadius: '3px', padding: '1px 5px', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer' }}
                                                        title="Intra-State (CGST 50% + SGST 50%)"
                                                    >
                                                        CGST+SGST
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGstType('inter')}
                                                        style={{ border: 'none', background: gstType === 'inter' ? '#10B981' : 'transparent', color: gstType === 'inter' ? '#FFFFFF' : '#64748B', borderRadius: '3px', padding: '1px 5px', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer' }}
                                                        title="Inter-State (IGST 100%)"
                                                    >
                                                        IGST
                                                    </button>
                                                </div>
                                            </div>
                                            {gstType === 'intra' ? (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748B' }}>
                                                        <span>CGST (Central Tax)</span>
                                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{formatCurrency(calculatedTax / 2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748B' }}>
                                                        <span>SGST (State Tax)</span>
                                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{formatCurrency(calculatedTax / 2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#94A3B8' }}>
                                                        <span>IGST (Integrated)</span>
                                                        <span>{formatCurrency(0)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#94A3B8' }}>
                                                        <span>CGST (Central Tax)</span>
                                                        <span>{formatCurrency(0)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#94A3B8' }}>
                                                        <span>SGST (State Tax)</span>
                                                        <span>{formatCurrency(0)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748B' }}>
                                                        <span>IGST (Integrated)</span>
                                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{formatCurrency(calculatedTax)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Loyalty Discount if any */}
                                        {loyaltyEnabled && loyaltyDiscountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#DC2626', fontWeight: '600' }}>
                                                <span>Pts Discount</span>
                                                <span>-{formatCurrency(loyaltyDiscountAmount)}</span>
                                            </div>
                                        )}

                                        {/* Showroom Promo Discount if any */}
                                        {showroomPromoDiscount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#059669', fontWeight: '750' }}>
                                                <span>🏷️ {appliedShowroomPromo?.title || 'Showroom Promo'}</span>
                                                <span>-{formatCurrency(showroomPromoDiscount)}</span>
                                            </div>
                                        )}

                                        {/* Cross-Branch Store Credit if any */}
                                        {effectiveStoreCreditRedeemed > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#2563EB', fontWeight: '750' }}>
                                                <span>💳 Store Credit</span>
                                                <span>-{formatCurrency(effectiveStoreCreditRedeemed)}</span>
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

                            {/* Credit Mode Details Panel (When Credit is selected) */}
                            {isCreditMode ? (
                                <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '10px', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '2px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: '850', color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Wallet size={14} color="#D97706" /> Credit Payment
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreditMode(false)}
                                            style={{ border: 'none', background: 'transparent', color: '#B45309', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                            title="Cancel Credit"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.64rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                Received Amount
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #FDE68A', borderRadius: '6px', padding: '0 4px', background: '#FFF' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400E' }}>{currency.symbol}</span>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    max={finalTotal}
                                                    placeholder="0.00"
                                                    value={creditReceivedAmount}
                                                    onChange={(e) => setCreditReceivedAmount(e.target.value)}
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: '850', color: '#92400E', padding: '3px 0' }}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.64rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                Credit Balance (Due)
                                            </span>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '950', color: '#B91C1C', paddingTop: '3px' }}>
                                                {formatCurrency(Math.max(0, finalTotal - (parseFloat(creditReceivedAmount) || 0)))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Customer Credit Held Summary */}
                                    {selectedCustomerObj ? (() => {
                                        const prevHeld = parseFloat(selectedCustomerObj.credit_held ?? selectedCustomerObj.outstanding_balance ?? selectedCustomerObj.due_balance ?? 0);
                                        const curDue = Math.max(0, finalTotal - (parseFloat(creditReceivedAmount) || 0));
                                        const totalAfter = prevHeld + curDue;
                                        return (
                                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.4rem 0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                                                <span style={{ color: '#991B1B', fontWeight: '750' }}>
                                                    Previous Credit Held: <strong>{formatCurrency(prevHeld)}</strong>
                                                </span>
                                                <span style={{ color: '#7F1D1D', fontWeight: '900' }}>
                                                    Total Credit After: {formatCurrency(totalAfter)}
                                                </span>
                                            </div>
                                        );
                                    })() : (
                                        <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '8px', padding: '0.35rem 0.55rem', fontSize: '0.72rem', color: '#C2410C', fontWeight: '650' }}>
                                            ⚠️ Notice: Select a customer above to track credit debt against their ledger account.
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => setCreditReceivedAmount('0')}
                                            style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #FDE68A', background: '#FEF3C7', color: '#92400E', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Full Credit (₹0)
                                        </button>
                                        <button
                                            disabled={!hasValidCartItems || isCheckingOut}
                                            onClick={() => handleCheckout('Credit')}
                                            style={{
                                                flex: 1,
                                                padding: '0.45rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                                                color: '#FFFFFF',
                                                fontWeight: '850',
                                                fontSize: '0.78rem',
                                                cursor: (!hasValidCartItems || isCheckingOut) ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 3px 8px rgba(234, 88, 12, 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            Confirm Credit Sale
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Checkout Payment Action Matrix: Cash, UPI, Card, Credit (Without F1, F2, F3) */
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginTop: '2px' }}>
                                    <button
                                        disabled={!hasValidCartItems || isCheckingOut}
                                        onClick={() => handleCheckout('Cash')}
                                        style={{
                                            padding: '0.45rem 0.2rem',
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
                                            gap: '3px',
                                            opacity: !hasValidCartItems ? 0.5 : 1,
                                            boxShadow: hasValidCartItems ? '0 3px 8px rgba(16, 185, 129, 0.2)' : 'none',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                        onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <DollarSign size={13} />
                                        Cash
                                    </button>

                                    <button
                                        disabled={!hasValidCartItems || isCheckingOut}
                                        onClick={() => handleCheckout('UPI')}
                                        style={{
                                            padding: '0.45rem 0.2rem',
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
                                            gap: '3px',
                                            opacity: !hasValidCartItems ? 0.5 : 1,
                                            boxShadow: hasValidCartItems ? '0 3px 8px rgba(79, 70, 229, 0.2)' : 'none',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                        onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Smartphone size={13} />
                                        UPI
                                    </button>

                                    <button
                                        disabled={!hasValidCartItems || isCheckingOut}
                                        onClick={() => handleCheckout('Card')}
                                        style={{
                                            padding: '0.45rem 0.2rem',
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
                                            gap: '3px',
                                            opacity: !hasValidCartItems ? 0.5 : 1,
                                            boxShadow: hasValidCartItems ? '0 3px 8px rgba(245, 158, 11, 0.2)' : 'none',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                        onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <CreditCard size={13} />
                                        Card
                                    </button>

                                    <button
                                        disabled={!hasValidCartItems || isCheckingOut}
                                        onClick={() => {
                                            setIsCreditMode(true);
                                            setCreditReceivedAmount('0');
                                        }}
                                        style={{
                                            padding: '0.45rem 0.2rem',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            fontWeight: '800',
                                            fontSize: '0.75rem',
                                            cursor: !hasValidCartItems ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '3px',
                                            opacity: !hasValidCartItems ? 0.5 : 1,
                                            boxShadow: hasValidCartItems ? '0 3px 8px rgba(234, 88, 12, 0.2)' : 'none',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(0.97)')}
                                        onMouseUp={(e) => hasValidCartItems && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Wallet size={13} />
                                        Credit
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile View Floating Cart Bar (When in catalog tab on mobile with items in cart) */}
            {mobileActiveTab === 'catalog' && cart.length > 0 && (
                <div 
                    className="pos-mobile-floating-bar" 
                    onClick={() => setMobileActiveTab('cart')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={17} color="#FFF" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>
                                {cart.reduce((s, it) => s + (it.quantity || 1), 0)} items in cart
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '850', color: '#FFFFFF' }}>
                                {formatCurrency(finalTotal)}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        View Cart & Pay <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* SUCCESS RECEIPT POPUP MODAL */}
            {showReceiptModal && lastOrderData && (
                <div className="pos-receipt-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div
                        className="pos-receipt-modal-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'white',
                            width: activePrinterConfig.modalWidth,
                            maxWidth: '96vw',
                            borderRadius: '20px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'width 0.2s ease'
                        }}
                    >
                        {/* Dynamic Page Print CSS Rule for Target Printer Size */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            @media print {
                                @page { size: ${activePrinterConfig.widthMm} auto; margin: 0; }
                                #printable-pos-receipt { width: ${activePrinterConfig.widthMm} !important; }
                            }
                        ` }} />

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

                        {/* Business Owner Print Preferences Controls (Screen-only, never printed) */}
                        <div className="no-print" style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '8px', 
                            padding: '10px 14px', 
                            background: '#F8FAFC', 
                            borderBottom: '1px solid #E2E8F0', 
                            fontSize: '0.74rem', 
                            color: '#334155'
                        }}>
                            {/* Row 1: Customizable Thermal Printer Size (2 inch, 3 inch, 4 inch) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '750', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🖨️ Printer Size:
                                </span>
                                <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '2px', borderRadius: '8px', gap: '2px' }}>
                                    {Object.entries(PRINTER_CONFIGS).map(([key, cfg]) => {
                                        const isSelected = receiptPrinterSize === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    setLocalReceiptPrinterSize(key);
                                                    updateLoyaltySettingsMutation.mutate({ receipt_printer_size: key });
                                                }}
                                                title={cfg.desc}
                                                style={{
                                                    border: 'none',
                                                    padding: '3px 9px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: isSelected ? '800' : '600',
                                                    background: isSelected ? '#10B981' : 'transparent',
                                                    color: isSelected ? '#FFFFFF' : '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Row 2: Print Toggles for Separate GST, Loyalty, and Credit */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '2px', borderTop: '1px dashed #CBD5E1' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none', fontWeight: '650' }} title="Toggle whether each individual product's GST rate and amount are printed">
                                    <input
                                        type="checkbox"
                                        checked={printShowGst}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setLocalPrintShowGst(checked);
                                            updateLoyaltySettingsMutation.mutate({ print_show_gst: checked });
                                        }}
                                        style={{ cursor: 'pointer', accentColor: '#10B981', width: '14px', height: '14px' }}
                                    />
                                    Product GST
                                </label>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none', fontWeight: '650' }} title="Toggle whether Loyalty Points should be printed on the receipt">
                                    <input
                                        type="checkbox"
                                        checked={printShowLoyalty}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setLocalPrintShowLoyalty(checked);
                                            updateLoyaltySettingsMutation.mutate({ print_show_loyalty: checked });
                                        }}
                                        style={{ cursor: 'pointer', accentColor: '#10B981', width: '14px', height: '14px' }}
                                    />
                                    Loyalty Points
                                </label>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none', fontWeight: '650' }} title="Toggle whether Credit Summary should be printed on the receipt">
                                    <input
                                        type="checkbox"
                                        checked={printShowCredit}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setLocalPrintShowCredit(checked);
                                            updateLoyaltySettingsMutation.mutate({ print_show_credit: checked });
                                        }}
                                        style={{ cursor: 'pointer', accentColor: '#10B981', width: '14px', height: '14px' }}
                                    />
                                    Credit Option
                                </label>
                            </div>
                        </div>

                        {/* Thermal Receipt Workspace (to print) */}
                        <div 
                            id="printable-pos-receipt" 
                            className={`printable-pos-receipt printer-size-${receiptPrinterSize}`} 
                            style={{ 
                                padding: receiptPrinterSize === '2inch' ? '0.75rem 0.5rem' : '1.25rem', 
                                background: '#FFFFFF', 
                                flex: 1, 
                                overflowY: 'auto', 
                                maxHeight: '420px',
                                width: activePrinterConfig.cssWidth,
                                maxWidth: '100%',
                                margin: '0 auto',
                                fontSize: activePrinterConfig.fontSize
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000', textAlign: 'center' }}>
                                {/* 1. Shop / Business Name */}
                                <h4 style={{ margin: '0 0 4px', fontSize: receiptPrinterSize === '2inch' ? '1rem' : '1.15rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '1.25' }}>
                                    {lastOrderData?.shop_name || resolvedShopDetails.shopName || 'CLIKS STORE'}
                                </h4>

                                {/* 2. Address (presented in between business name and phone number) */}
                                <p style={{ margin: '0 0 3px', fontSize: receiptPrinterSize === '2inch' ? '0.68rem' : '0.75rem', lineHeight: '1.35', maxWidth: '270px', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                                    {lastOrderData?.shop_address || resolvedShopDetails.address || 'Commercial Center, Main Road'}
                                </p>

                                {/* 3. Phone number and Email */}
                                {(lastOrderData?.shop_phone || resolvedShopDetails.phone || lastOrderData?.shop_email || resolvedShopDetails.email) && (
                                    <p style={{ margin: '1px 0 3px', fontSize: receiptPrinterSize === '2inch' ? '0.68rem' : '0.75rem', fontWeight: '600' }}>
                                        {(lastOrderData?.shop_phone || resolvedShopDetails.phone) && <span>Ph: {lastOrderData?.shop_phone || resolvedShopDetails.phone}</span>}
                                        {(lastOrderData?.shop_phone || resolvedShopDetails.phone) && (lastOrderData?.shop_email || resolvedShopDetails.email) && <span> | </span>}
                                        {(lastOrderData?.shop_email || resolvedShopDetails.email) && <span>{lastOrderData?.shop_email || resolvedShopDetails.email}</span>}
                                    </p>
                                )}

                                {/* 4. GSTIN (after phone number and mail) */}
                                <p style={{ margin: '1px 0 4px', fontSize: receiptPrinterSize === '2inch' ? '0.70rem' : '0.76rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                                    GST: {lastOrderData?.shop_gstin || resolvedShopDetails.gstin || '33AAAAA0000A1Z5'}
                                </p>

                                <p style={{ margin: '2px 0 8px', fontSize: receiptPrinterSize === '2inch' ? '0.68rem' : '0.75rem' }}>Receipt No: {lastOrderData?.invoice_number || 'N/A'}</p>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '6px 0' }} />

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.68rem' : '0.75rem', marginBottom: '4px' }}>
                                    <span>Date: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    <span>Time: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                {/* Customer and Payment Mode (Mode placed after Customer) */}
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.68rem' : '0.75rem', marginBottom: '6px' }}>
                                    <span>Customer: {lastOrderData?.client_name || 'Walk-in Customer'}</span>
                                    <span style={{ fontWeight: '700' }}>Mode: {(lastOrderData?.payment_mode || paymentMode || 'CASH').toUpperCase()}</span>
                                </div>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '4px 0 6px' }} />

                                {/* Items Table with Left-Aligned Item Names & Separate Product GST */}
                                <table style={{ width: '100%', fontSize: activePrinterConfig.tableFontSize, borderCollapse: 'collapse', fontFamily: 'monospace', tableLayout: 'fixed' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ width: '42%', textAlign: 'left', padding: '3px 0' }}>ITEM</th>
                                            <th style={{ width: '18%', textAlign: 'center', padding: '3px 0' }}>QTY</th>
                                            <th style={{ width: '20%', textAlign: 'right', padding: '3px 0' }}>RATE</th>
                                            <th style={{ width: '20%', textAlign: 'right', padding: '3px 0' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {((lastOrderData?.items && (typeof lastOrderData.items === 'string' ? JSON.parse(lastOrderData.items) : lastOrderData.items)) || []).map((item, i) => {
                                            const itemTaxRate = parseFloat(item?.tax_rate ?? item?.gst_rate ?? item?.tax_percentage ?? item?.gst_percentage ?? 0) || 0;
                                            const itemQty = parseFloat(item?.quantity) || 0;
                                            const itemPrice = parseFloat(item?.price || item?.unit_price || 0);
                                            const itemTotal = parseFloat(item?.total || item?.amount || (itemQty * itemPrice)) || 0;
                                            const itemTaxAmount = parseFloat(item?.tax_amount ?? item?.gst_amount ?? (itemTotal * (itemTaxRate / 100))) || 0;
                                            const itemHsn = item?.hsn || item?.hsn_code || '';

                                            return (
                                                <tr key={i} style={{ borderBottom: '1px dotted #E2E8F0' }}>
                                                    <td colSpan={4} style={{ padding: '3px 0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                            <span style={{ width: '42%', textAlign: 'left', wordBreak: 'break-word', fontWeight: '600' }}>
                                                                {item?.description || item?.name || 'Item'}
                                                            </span>
                                                            <span style={{ width: '18%', textAlign: 'center' }}>
                                                                {itemQty} {item?.unit || 'PCS'}
                                                            </span>
                                                            <span style={{ width: '20%', textAlign: 'right' }}>
                                                                ₹{itemPrice}
                                                            </span>
                                                            <span style={{ width: '20%', textAlign: 'right', fontWeight: '600' }}>
                                                                {formatCurrency(itemTotal)}
                                                            </span>
                                                        </div>
                                                        {printShowGst && (
                                                            <div style={{ 
                                                                fontSize: receiptPrinterSize === '2inch' ? '0.62rem' : '0.67rem', 
                                                                color: '#334155', 
                                                                textAlign: 'left',
                                                                paddingLeft: '2px',
                                                                marginTop: '1px'
                                                            }}>
                                                                {itemHsn ? `HSN:${itemHsn} ` : ''}
                                                                {itemTaxRate > 0 ? (
                                                                    <span>[GST {itemTaxRate}%: {formatCurrency(itemTaxAmount)}]</span>
                                                                ) : (
                                                                    <span style={{ color: '#64748B' }}>[GST: 0% Exempt]</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '6px 0' }} />

                                {/* Computed Tally, Loyalty & Credit Sections */}
                                {(() => {
                                    const rawSubtotal = Number(lastOrderData?.amount ?? lastOrderData?.subtotal ?? 0);
                                    const rawDiscount = Number(lastOrderData?.discount_amount ?? lastOrderData?.discount ?? 0);
                                    const promoDiscount = Number(lastOrderData?.showroom_promo_discount ?? 0);
                                    const loyaltyDisc = Number(lastOrderData?.loyalty_discount_amount ?? 0);

                                    const itemsList = (lastOrderData?.items && (typeof lastOrderData.items === 'string' ? JSON.parse(lastOrderData.items) : lastOrderData.items)) || [];
                                    const itemsGrossSum = itemsList.reduce((acc, it) => {
                                        const qty = parseFloat(it.quantity) || 0;
                                        const rate = parseFloat(it.price || it.unit_price) || 0;
                                        const total = parseFloat(it.total || it.amount) || (qty * rate);
                                        return acc + total;
                                    }, 0);

                                    // Compute GST Breakdown groups by tax rate slab
                                    const gstSlabGroups = itemsList.reduce((acc, it) => {
                                        const rate = parseFloat(it.tax_rate ?? it.gst_rate ?? it.tax_percentage ?? 0) || 0;
                                        const qty = parseFloat(it.quantity) || 0;
                                        const price = parseFloat(it.price || it.unit_price) || 0;
                                        const total = parseFloat(it.total || it.amount) || (qty * price);
                                        const taxAmt = parseFloat(it.tax_amount ?? it.gst_amount ?? (total * (rate / 100))) || 0;
                                        if (rate > 0 || taxAmt > 0) {
                                            if (!acc[rate]) acc[rate] = { rate, taxable: 0, taxAmount: 0 };
                                            acc[rate].taxable += total;
                                            acc[rate].taxAmount += taxAmt;
                                        }
                                        return acc;
                                    }, {});
                                    const gstSlabs = Object.values(gstSlabGroups);

                                    const isWalkIn = !lastOrderData?.client_name || lastOrderData?.client_name === 'Walk-in Customer';
                                    const hasLoyaltyActivity = (
                                        Number(lastOrderData?.loyalty_points_earned || 0) > 0 ||
                                        Number(lastOrderData?.loyalty_points_redeemed || 0) > 0 ||
                                        (Number(lastOrderData?.existing_loyalty_points || 0) > 0 && !isWalkIn)
                                    );
                                    const shouldPrintLoyalty = Boolean(printShowLoyalty && loyaltyEnabled && hasLoyaltyActivity);

                                    const isActualCreditSale = (lastOrderData?.payment_mode?.toUpperCase() === 'CREDIT' || Number(lastOrderData?.due_amount || 0) > 0);
                                    const shouldPrintCredit = Boolean(printShowCredit && isActualCreditSale);

                                    const effectiveDiscount = rawDiscount > 0
                                        ? rawDiscount
                                        : (promoDiscount > 0 ? promoDiscount : (!shouldPrintLoyalty && loyaltyDisc > 0 ? loyaltyDisc : 0));

                                    const subtotalDisplay = itemsGrossSum > 0 ? itemsGrossSum : (rawSubtotal > 0 ? rawSubtotal : (Number(lastOrderData?.total_amount || 0) + effectiveDiscount));

                                    return (
                                        <>
                                            {/* Tally with 3 GST Types (CGST, SGST, IGST) & Slabs */}
                                            <div style={{ width: '100%', fontSize: receiptPrinterSize === '2inch' ? '0.72rem' : '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>SUBTOTAL:</span>
                                                    <span>{formatCurrency(subtotalDisplay)}</span>
                                                </div>
                                                {effectiveDiscount > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                                        <span>DISCOUNT:</span>
                                                        <span>- {formatCurrency(effectiveDiscount)}</span>
                                                    </div>
                                                )}
                                                {shouldPrintLoyalty && loyaltyDisc > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                        <span>LOYALTY DISCOUNT:</span>
                                                        <span>- {formatCurrency(loyaltyDisc)}</span>
                                                    </div>
                                                )}

                                                {/* 3 GST Types Breakdown */}
                                                {Number(lastOrderData?.igst_amount || 0) > 0 ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>CGST (0%):</span>
                                                            <span>{formatCurrency(0)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>SGST (0%):</span>
                                                            <span>{formatCurrency(0)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>IGST:</span>
                                                            <span>{formatCurrency(lastOrderData?.igst_amount || lastOrderData?.tax_amount || 0)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>CGST:</span>
                                                            <span>{formatCurrency(lastOrderData?.cgst_amount !== undefined ? lastOrderData.cgst_amount : (Number(lastOrderData?.tax_amount || 0) / 2))}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>SGST:</span>
                                                            <span>{formatCurrency(lastOrderData?.sgst_amount !== undefined ? lastOrderData.sgst_amount : (Number(lastOrderData?.tax_amount || 0) / 2))}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.67rem' : '0.74rem' }}>
                                                            <span>IGST:</span>
                                                            <span>{formatCurrency(0)}</span>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Separate Product GST Tax Slab Breakdown */}
                                                {printShowGst && gstSlabs.length > 0 && (
                                                    <div style={{ marginTop: '3px', marginBottom: '3px', borderTop: '1px dotted #CBD5E1', paddingTop: '3px' }}>
                                                        <div style={{ fontSize: receiptPrinterSize === '2inch' ? '0.62rem' : '0.66rem', fontWeight: '750', textAlign: 'left', marginBottom: '2px', color: '#334155' }}>
                                                            GST TAX SLAB BREAKDOWN:
                                                        </div>
                                                        {gstSlabs.map((slab) => (
                                                            <div key={slab.rate} style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptPrinterSize === '2inch' ? '0.62rem' : '0.66rem', color: '#475569' }}>
                                                                <span>GST {slab.rate}% on {formatCurrency(slab.taxable)}:</span>
                                                                <span>{formatCurrency(slab.taxAmount)}</span>
                                                            </div>
                                                        ))}
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

                                            {/* Optional Loyalty Points & Credit Balance (ONLY when enabled by business owner) */}
                                            {(shouldPrintLoyalty || shouldPrintCredit) && (
                                                <>
                                                    <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '10px 0' }} />
                                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '0.72rem', textAlign: 'left', marginBottom: '6px' }}>
                                                        {/* Left Side: Loyalty Points (Rendered ONLY if business owner enabled & customer has points) */}
                                                        {shouldPrintLoyalty && (
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ margin: '0 0 3px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.72rem' }}>LOYALTY POINTS:</p>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Existing:</span>
                                                                    <span>{lastOrderData?.existing_loyalty_points ?? 0}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Redeemed:</span>
                                                                    <span>{lastOrderData?.loyalty_points_redeemed ?? 0}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Earned:</span>
                                                                    <span>{lastOrderData?.loyalty_points_earned ?? 0}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px', borderTop: '1px dotted #000', paddingTop: '2px' }}>
                                                                    <span>Balance:</span>
                                                                    <span>{lastOrderData?.remaining_loyalty_points ?? lastOrderData?.final_loyalty_points ?? Math.max(0, (lastOrderData?.existing_loyalty_points || 0) - (lastOrderData?.loyalty_points_redeemed || 0) + (lastOrderData?.loyalty_points_earned || 0))}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Right Side: Credit Option Summary (Rendered ONLY if business owner enabled & is actual credit) */}
                                                        {shouldPrintCredit && (
                                                            <div style={{ flex: 1, ...(shouldPrintLoyalty ? { borderLeft: '1px dashed #000', paddingLeft: '8px' } : {}) }}>
                                                                <p style={{ margin: '0 0 3px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.72rem' }}>CREDIT SUMMARY:</p>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Total:</span>
                                                                    <span>{formatCurrency(lastOrderData?.total_amount || 0)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Received:</span>
                                                                    <span>{formatCurrency(lastOrderData?.paid_amount ?? 0)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px', borderTop: '1px dotted #000', paddingTop: '2px' }}>
                                                                    <span>Credit Bal:</span>
                                                                    <span style={{ color: Number(lastOrderData?.due_amount || 0) > 0 ? '#b91c1c' : '#000' }}>
                                                                        {formatCurrency(lastOrderData?.due_amount ?? 0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '6px 0 8px' }} />

                                            {/* Bottom Thank You message */}
                                            <p style={{ margin: '4px 0 2px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                Thanks for your business. Visit again.
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', fontWeight: '600' }}>
                                                Powered with Cliks Business by Beta
                                            </p>
                                        </>
                                    );
                                })()}
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
                                                            <span style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A' }}>{order.invoice_number}</span>
                                                            {order.payment_mode === 'Credit' || (order.due_amount && order.due_amount > 0) ? (
                                                                (order.paid_amount && order.paid_amount > 0) ? (
                                                                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#EEF2FF', color: '#4338CA', fontSize: '0.65rem', fontWeight: '850' }}>PARTIAL CREDIT</span>
                                                                ) : (
                                                                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', fontSize: '0.65rem', fontWeight: '850' }}>CREDIT</span>
                                                                )
                                                            ) : (
                                                                <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#ECFDF5', color: '#047857', fontSize: '0.65rem', fontWeight: '850' }}>PAID</span>
                                                            )}
                                                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#334155', fontSize: '0.65rem', fontWeight: '750', textTransform: 'uppercase' }}>{order.payment_mode || 'Cash'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748B', flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(order.created_at).toLocaleString()}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {order.client_name || 'Walk-in Customer'}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: '750' }}>Billed by: {order.billed_by || order.cashier_name || user?.name || 'Cashier'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{formatCurrency(order.total_amount || 0)}</span>
                                                            {(order.payment_mode === 'Credit' || (order.due_amount && order.due_amount > 0)) && (
                                                                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#B45309' }}>
                                                                    Rec: {formatCurrency(order.paid_amount || 0)} • Due: <span style={{ color: '#DC2626' }}>{formatCurrency(order.due_amount || 0)}</span>
                                                                </div>
                                                            )}
                                                            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{order.items?.length || 0} items</span>
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

                                                {/* Clean 4-Column Aligned Items Table in History */}
                                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem', border: '1px solid #F1F5F9' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '1.5px solid #CBD5E1', color: '#64748B' }}>
                                                                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: '800', width: '45%' }}>ITEM</th>
                                                                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: '800', width: '15%' }}>QTY</th>
                                                                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: '800', width: '20%' }}>PRICE</th>
                                                                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: '800', width: '20%' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items?.map((item, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', color: '#1E293B' }}>
                                                                    <td style={{ textAlign: 'left', padding: '6px 8px', fontWeight: '650' }}>
                                                                        <div style={{ color: '#0F172A' }}>{item.name || item.description || 'Item'}</div>
                                                                        {item.sku && <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>SKU: {item.sku}</div>}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 8px', fontWeight: '700' }}>{item.quantity} {item.unit || 'PCS'}</td>
                                                                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>{formatCurrency(item.price || item.unit_price || 0)}</td>
                                                                    <td style={{ textAlign: 'right', padding: '6px 8px', fontWeight: '800' }}>{formatCurrency(item.total || item.amount || ((item.price || 0) * (item.quantity || 1)))}</td>
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

            {/* ======================================================== */}
            {/* POS SETTINGS MODAL (PRINT, CREDIT, CUSTOMER VIEW / KIOSK) */}
            {/* ======================================================== */}
            {showPosSettingsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        width: '92%',
                        maxWidth: '680px',
                        maxHeight: '88vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#F8FAFC'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.5rem', borderRadius: '10px' }}>
                                    <Settings size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>
                                        POS System Settings
                                    </h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                                        Configure receipt printing, store credit rules, and in-store self-order kiosk
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPosSettingsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    padding: '0.35rem',
                                    borderRadius: '8px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Settings Tabs Bar */}
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid #E2E8F0',
                            background: '#F1F5F9',
                            padding: '0.35rem 1rem 0',
                            gap: '0.5rem'
                        }}>
                            {[
                                { id: 'print', label: 'Receipt & Print', icon: Printer },
                                { id: 'credit', label: 'Credit & Khata', icon: CreditCard },
                                { id: 'kiosk', label: 'Customer View (Kiosk)', icon: Monitor }
                            ].map(tab => {
                                const IconComp = tab.icon;
                                const isActive = posSettingsTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setPosSettingsTab(tab.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.65rem 1rem',
                                            background: isActive ? '#FFFFFF' : 'transparent',
                                            border: 'none',
                                            borderTopLeftRadius: '10px',
                                            borderTopRightRadius: '10px',
                                            fontWeight: isActive ? '800' : '600',
                                            fontSize: '0.82rem',
                                            color: isActive ? '#2563EB' : '#64748B',
                                            cursor: 'pointer',
                                            boxShadow: isActive ? '0 -2px 6px rgba(0,0,0,0.04)' : 'none',
                                            borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <IconComp size={15} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Modal Body / Tab Contents */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* TAB 1: RECEIPT & PRINT */}
                            {posSettingsTab === 'print' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Printer Paper Width Selector */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>
                                            Thermal Receipt Printer Paper Width:
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                            {[
                                                { id: '2inch', title: '2 Inch (58mm)', sub: 'Compact / Mobile Bluetooth & Mini Thermal' },
                                                { id: '3inch', title: '3 Inch (80mm)', sub: 'Standard Countertop POS (Recommended)' },
                                                { id: '4inch', title: '4 Inch (100mm)', sub: 'Wide Thermal Format' }
                                            ].map(opt => {
                                                const isSel = receiptPrinterSize === opt.id;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => {
                                                            setLocalReceiptPrinterSize(opt.id);
                                                            handleSavePosSettings({ receipt_printer_size: opt.id });
                                                        }}
                                                        style={{
                                                            border: isSel ? '2px solid #2563EB' : '1px solid #CBD5E1',
                                                            background: isSel ? '#EFF6FF' : '#FAFAFA',
                                                            padding: '0.85rem',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.3rem',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: '850', fontSize: '0.85rem', color: isSel ? '#1E40AF' : '#1E293B' }}>{opt.title}</span>
                                                            <div style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                borderRadius: '50%',
                                                                border: isSel ? '5px solid #2563EB' : '2px solid #CBD5E1',
                                                                background: '#FFFFFF'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.3' }}>{opt.sub}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Print Toggles */}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        {/* GST Toggle */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>Show Itemized Product GST Breakdown</div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Print individual item GST rates (CGST/SGST) and tax slab summary on the bill</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={printShowGst}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setLocalPrintShowGst(val);
                                                    handleSavePosSettings({ print_show_gst: val });
                                                }}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                                            />
                                        </div>

                                        <div style={{ borderTop: '1px solid #F1F5F9' }} />

                                        {/* Loyalty Points Toggle */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>Show Customer Loyalty Points</div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Print points earned, redeemed, and closing LTP balance on receipt</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={printShowLoyalty}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setLocalPrintShowLoyalty(val);
                                                    handleSavePosSettings({ print_show_loyalty: val });
                                                }}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                                            />
                                        </div>

                                        <div style={{ borderTop: '1px solid #F1F5F9' }} />

                                        {/* Credit Held Toggle */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>Show Customer Credit / Due Balance</div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Print previous credit held, current due, and total outstanding balance</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={printShowCredit}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setLocalPrintShowCredit(val);
                                                    handleSavePosSettings({ print_show_credit: val });
                                                }}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CREDIT & KHATA */}
                            {posSettingsTab === 'credit' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#9A3412' }}>Allow Credit Sales in POS Checkout</div>
                                            <div style={{ fontSize: '0.75rem', color: '#C2410C' }}>Permit cashiers to complete invoices on credit / khata with custom partial payments</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={posAllowCredit}
                                            onChange={(e) => {
                                                const val = e.target.checked;
                                                setLocalPosAllowCredit(val);
                                                handleSavePosSettings({ pos_allow_credit: val });
                                            }}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#EA580C' }}
                                        />
                                    </div>

                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ShieldCheck size={16} color="#2563EB" /> Customer Credit Ledger Rules
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#475569', lineHeight: '1.6' }}>
                                            <li>When a customer is selected, their live outstanding credit held is automatically computed from unpaid invoices.</li>
                                            <li>Credit limits defined in customer profiles prevent over-extending unauthorized credit during billing.</li>
                                            <li>Every credit sale automatically updates the customer's balance and displays on their statement.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: CUSTOMER VIEW / KIOSK */}
                            {posSettingsTab === 'kiosk' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#3730A3' }}>Customer Self-Order Kiosk Mode</div>
                                            <div style={{ fontSize: '0.75rem', color: '#4F46E5' }}>Turn this device into a shop-front customer display where shoppers browse and place orders</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={posKioskEnabled}
                                            onChange={(e) => {
                                                const val = e.target.checked;
                                                setLocalPosKioskEnabled(val);
                                                handleSavePosSettings({ pos_kiosk_enabled: val });
                                            }}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#4F46E5' }}
                                        />
                                    </div>

                                    {/* Security PIN for exiting kiosk */}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Lock size={15} color="#4F46E5" /> Staff Security PIN (Lock Code)
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                                    4-digit password required to unlock and exit Customer View back to Cashier POS
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <input
                                                type={showKioskPinMask ? 'text' : 'password'}
                                                maxLength={6}
                                                value={localPosKioskPin !== null ? localPosKioskPin : posKioskPin}
                                                onChange={(e) => {
                                                    const clean = e.target.value.replace(/\D/g, '');
                                                    setLocalPosKioskPin(clean);
                                                }}
                                                placeholder="1234"
                                                style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '800',
                                                    letterSpacing: '0.25em',
                                                    padding: '0.55rem 0.85rem',
                                                    borderRadius: '8px',
                                                    border: '1.5px solid #CBD5E1',
                                                    width: '140px',
                                                    textAlign: 'center',
                                                    fontFamily: 'monospace'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKioskPinMask(!showKioskPinMask)}
                                                style={{
                                                    background: '#F1F5F9',
                                                    border: '1px solid #CBD5E1',
                                                    padding: '0.55rem 0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    color: '#475569'
                                                }}
                                            >
                                                {showKioskPinMask ? 'Hide PIN' : 'Show PIN'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSavePosSettings({ pos_kiosk_pin: localPosKioskPin || posKioskPin })}
                                                style={{
                                                    background: '#4F46E5',
                                                    border: 'none',
                                                    color: '#FFFFFF',
                                                    padding: '0.55rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '750',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save PIN
                                            </button>
                                        </div>
                                    </div>

                                    {/* Launch Customer View Action Button */}
                                    <div style={{ paddingTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            disabled={!posKioskEnabled}
                                            onClick={() => {
                                                setShowPosSettingsModal(false);
                                                setIsCustomerViewActive(true);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: posKioskEnabled ? 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)' : '#94A3B8',
                                                color: '#FFFFFF',
                                                fontSize: '0.95rem',
                                                fontWeight: '850',
                                                cursor: posKioskEnabled ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                boxShadow: posKioskEnabled ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Monitor size={18} />
                                            Launch Customer View (Full Screen Kiosk)
                                        </button>
                                        <p style={{ textAlign: 'center', margin: '6px 0 0', fontSize: '0.72rem', color: '#64748B' }}>
                                            The kiosk displays a full-screen customer catalog. Cashier screen can be restored by entering PIN: <strong>{localPosKioskPin || posKioskPin || '1234'}</strong>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '0.78rem' }}>
                                {posSettingsSaveStatus === 'saving' && (
                                    <span style={{ color: '#2563EB', fontWeight: '750' }}>💾 Saving settings to database...</span>
                                )}
                                {posSettingsSaveStatus === 'saved' && (
                                    <span style={{ color: '#16A34A', fontWeight: '750' }}>✓ Saved settings successfully!</span>
                                )}
                                {posSettingsSaveStatus === 'error' && (
                                    <span style={{ color: '#DC2626', fontWeight: '750' }}>⚠️ Failed to save settings.</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.65rem' }}>
                                <button
                                    type="button"
                                    onClick={() => handleSavePosSettings()}
                                    style={{
                                        background: '#2563EB',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '0.55rem 1.25rem',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                                    }}
                                >
                                    Save Settings
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPosSettingsModal(false)}
                                    style={{
                                        background: '#FFFFFF',
                                        color: '#64748B',
                                        border: '1px solid #CBD5E1',
                                        padding: '0.55rem 1rem',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* CUSTOMER VIEW / IN-STORE SELF-ORDER KIOSK OVERLAY        */}
            {/* ======================================================== */}
            {isCustomerViewActive && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 99990,
                    background: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    fontFamily: 'inherit'
                }}>
                    {/* Kiosk Top Header */}
                    <div style={{
                        height: '68px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 1.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ background: '#3B82F6', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', color: '#fff' }}>
                                🛍️
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '850', letterSpacing: '0.02em', color: '#F8FAFC' }}>
                                    {activeConfig?.business_name || 'In-Store Self-Order Kiosk'}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '500' }}>
                                    Welcome! Browse our collection and place your order directly • Pick up at the counter
                                </div>
                            </div>
                        </div>

                        {/* Discreet Staff Exit Button */}
                        <button
                            onClick={() => {
                                setKioskPinInput('');
                                setKioskPinError('');
                                setKioskPinUnlockModalOpen(true);
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#CBD5E1',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '750',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                        >
                            <Lock size={13} />
                            <span>Staff Exit (PIN Locked)</span>
                        </button>
                    </div>

                    {/* Kiosk Main Content: Product Catalog (Left) + Order Cart (Right) */}
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Left Catalog Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
                            {/* Filter Bar: Search + Category Pills */}
                            <div style={{
                                padding: '0.85rem 1.5rem',
                                background: '#FFFFFF',
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem',
                                flexShrink: 0
                            }}>
                                {/* Search Box */}
                                <div style={{ position: 'relative' }}>
                                    <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search products by title, code, brand or category..."
                                        value={kioskSearchQuery}
                                        onChange={(e) => setKioskSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 1rem 0.65rem 2.4rem',
                                            borderRadius: '10px',
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: '0.88rem',
                                            background: '#F8FAFC',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Category Pills Horizontal Scroller */}
                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
                                    {['ALL', ...Array.from(new Set(inventory.map(p => p.category).filter(Boolean)))].map(cat => {
                                        const isSel = kioskCategoryFilter === cat;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setKioskCategoryFilter(cat)}
                                                style={{
                                                    padding: '0.4rem 0.85rem',
                                                    borderRadius: '20px',
                                                    border: isSel ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                                                    background: isSel ? '#2563EB' : '#FFFFFF',
                                                    color: isSel ? '#FFFFFF' : '#475569',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '750',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {cat === 'ALL' ? '🌟 All Products' : cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Product Cards Grid */}
                            <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
                                {(() => {
                                    const filtered = inventory.filter(p => {
                                        const matchesCat = kioskCategoryFilter === 'ALL' || String(p.category || '').toLowerCase() === String(kioskCategoryFilter).toLowerCase();
                                        const q = kioskSearchQuery.toLowerCase().trim();
                                        const matchesQ = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q));
                                        return matchesCat && matchesQ;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
                                                <Package size={48} strokeWidth={1.5} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#475569' }}>No Products Found</div>
                                                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Try searching with different keywords or choosing another category</div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {filtered.map(prod => {
                                                const cartItem = kioskCart.find(it => it.id === prod.id);
                                                const inStock = prod.isUnlimited || prod.is_unlimited || (parseFloat(prod.quantity) >= 999000) || (parseFloat(prod.quantity || prod.stock || 0) > 0);
                                                const price = parseFloat(prod.price || prod.sale_price || 0) || 0;
                                                const gstRate = parseFloat(prod.tax_percentage ?? prod.rawProduct?.tax_percentage ?? prod.rawProduct?.gst_percentage ?? prod.taxRate ?? prod.gst_percentage ?? 0) || 0;

                                                return (
                                                    <div
                                                        key={prod.id}
                                                        style={{
                                                            background: '#FFFFFF',
                                                            borderRadius: '14px',
                                                            border: cartItem ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                                            padding: '1rem',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            boxShadow: cartItem ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div>
                                                            {/* Product Image / Icon placeholder */}
                                                            <div style={{
                                                                height: '110px',
                                                                background: '#F1F5F9',
                                                                borderRadius: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginBottom: '0.75rem',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {prod.image_url ? (
                                                                    <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Package size={36} color="#94A3B8" />
                                                                )}
                                                            </div>

                                                            {/* Category Pill */}
                                                            {prod.category && (
                                                                <span style={{ fontSize: '0.65rem', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: '750', textTransform: 'uppercase' }}>
                                                                    {prod.category}
                                                                </span>
                                                            )}

                                                            {/* Product Name */}
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', marginTop: '4px', minHeight: '2.4rem', lineHeight: '1.25' }}>
                                                                {prod.name}
                                                            </div>

                                                            {/* Price & GST */}
                                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#2563EB' }}>
                                                                    {formatCurrency(price)}
                                                                </span>
                                                                {gstRate > 0 && (
                                                                    <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '700', background: '#ECFDF5', padding: '1px 5px', borderRadius: '4px' }}>
                                                                        {gstRate}% GST
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Bottom CTA / Quantity controls */}
                                                        <div style={{ marginTop: '0.85rem' }}>
                                                            {cartItem ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EFF6FF', borderRadius: '8px', padding: '3px' }}>
                                                                    <button
                                                                        onClick={() => handleKioskUpdateQty(prod.id, -1)}
                                                                        style={{ width: '32px', height: '32px', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '1rem', fontWeight: '800', color: '#2563EB', cursor: 'pointer' }}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#1E40AF' }}>
                                                                        {cartItem.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleKioskUpdateQty(prod.id, 1)}
                                                                        style={{ width: '32px', height: '32px', background: '#2563EB', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '800', color: '#FFFFFF', cursor: 'pointer' }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    disabled={!inStock}
                                                                    onClick={() => handleKioskAddToCart(prod)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '0.55rem',
                                                                        background: inStock ? '#2563EB' : '#E2E8F0',
                                                                        color: inStock ? '#FFFFFF' : '#94A3B8',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        fontSize: '0.82rem',
                                                                        fontWeight: '800',
                                                                        cursor: inStock ? 'pointer' : 'not-allowed',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '5px'
                                                                    }}
                                                                >
                                                                    {inStock ? (
                                                                        <>
                                                                            <Plus size={14} /> Add to Order
                                                                        </>
                                                                    ) : (
                                                                        'Out of Stock'
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Right Order Cart Drawer */}
                        <div style={{
                            width: '390px',
                            background: '#FFFFFF',
                            borderLeft: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            height: 'calc(100vh - 68px)',
                            flexShrink: 0
                        }}>
                            {/* Cart Drawer Header */}
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingCart size={18} color="#2563EB" />
                                    <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>
                                        Your Order ({kioskCart.reduce((sum, it) => sum + (it.quantity || 1), 0)})
                                    </span>
                                </div>
                                {kioskCart.length > 0 && (
                                    <button
                                        onClick={() => setKioskCart([])}
                                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.74rem', fontWeight: '750', cursor: 'pointer' }}
                                    >
                                        Clear Cart
                                    </button>
                                )}
                            </div>

                            {/* Cart Items List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {kioskCart.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                                        <ShoppingCart size={42} strokeWidth={1.5} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                        <div style={{ fontSize: '0.92rem', fontWeight: '750', color: '#475569' }}>Your Cart is Empty</div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '3px' }}>Tap "+ Add to Order" on products to build your order</div>
                                    </div>
                                ) : (
                                    kioskCart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{formatCurrency(item.price)} each</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                                    <button onClick={() => handleKioskUpdateQty(item.id, -1)} style={{ padding: '2px 7px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>-</button>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: '850', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <button onClick={() => handleKioskUpdateQty(item.id, 1)} style={{ padding: '2px 7px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>+</button>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E293B', minWidth: '55px', textAlign: 'right' }}>
                                                    {formatCurrency(item.total || (item.price * item.quantity))}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Customer Contact Details (Optional) */}
                            <div style={{ padding: '0.85rem 1rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                                    Customer Details (Optional)
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={kioskCustomerName}
                                        onChange={(e) => setKioskCustomerName(e.target.value)}
                                        style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={kioskCustomerPhone}
                                        onChange={(e) => setKioskCustomerPhone(e.target.value.replace(/\D/g, ''))}
                                        style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                                    />
                                </div>
                            </div>

                            {/* Cart Summary & Order Submit */}
                            {(() => {
                                const kSubtotal = kioskCart.reduce((acc, it) => acc + (it.total || (it.price * it.quantity)), 0);
                                const kTax = kioskCart.reduce((acc, it) => {
                                    const rate = it.tax_rate || 0;
                                    const itTot = it.total || (it.price * it.quantity);
                                    return acc + (itTot * rate / 100);
                                }, 0);
                                const kGrandTotal = kSubtotal + kTax;

                                return (
                                    <div style={{ padding: '1.25rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(kSubtotal)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                                            <span>GST & Taxes</span>
                                            <span>{formatCurrency(kTax)}</span>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>Grand Total</span>
                                            <span style={{ fontSize: '1.35rem', fontWeight: '950', color: '#2563EB' }}>{formatCurrency(kGrandTotal)}</span>
                                        </div>

                                        <button
                                            disabled={kioskCart.length === 0}
                                            onClick={handleKioskSubmitOrder}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: kioskCart.length > 0 ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#E2E8F0',
                                                color: kioskCart.length > 0 ? '#FFFFFF' : '#94A3B8',
                                                fontSize: '0.95rem',
                                                fontWeight: '900',
                                                cursor: kioskCart.length > 0 ? 'pointer' : 'not-allowed',
                                                boxShadow: kioskCart.length > 0 ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                marginTop: '0.35rem'
                                            }}
                                        >
                                            🛍️ Place Order at Counter
                                        </button>
                                        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748B' }}>
                                            Collect and pay for your items at the checkout counter
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* KIOSK ORDER PLACED SUCCESS CELEBRATION MODAL             */}
            {/* ======================================================== */}
            {kioskOrderSuccessInfo && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        maxWidth: '460px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                            <Check size={36} strokeWidth={3} />
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.45rem', fontWeight: '900', color: '#0F172A' }}>
                            Order Placed Successfully!
                        </h2>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
                            Your in-store order has been forwarded to the billing counter.
                        </p>

                        <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Order Token
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '950', color: '#2563EB', fontFamily: 'monospace', margin: '4px 0' }}>
                                #{kioskOrderSuccessInfo.orderId}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>
                                {kioskOrderSuccessInfo.itemsCount} item(s) • Total: {formatCurrency(kioskOrderSuccessInfo.total)}
                            </div>
                        </div>

                        <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
                            Please share your Order Token <strong>#{kioskOrderSuccessInfo.orderId}</strong> at the billing counter to collect and pay for your items.
                        </p>

                        <button
                            onClick={() => setKioskOrderSuccessInfo(null)}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#2563EB',
                                color: '#FFFFFF',
                                fontSize: '0.92rem',
                                fontWeight: '850',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            Start Next Order
                        </button>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* KIOSK PIN UNLOCK MODAL (STAFF SECURITY EXIT)             */}
            {/* ======================================================== */}
            {kioskPinUnlockModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '2rem',
                        maxWidth: '380px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
                        border: '1px solid #CBD5E1'
                    }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Lock size={28} />
                        </div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
                            Staff Security Unlock
                        </h3>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.78rem', color: '#64748B' }}>
                            Enter staff PIN to exit Customer View and access cashier screen
                        </p>

                        {/* PIN Display Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="password"
                                maxLength={6}
                                readOnly
                                value={kioskPinInput}
                                placeholder="••••"
                                style={{
                                    width: '180px',
                                    fontSize: '2rem',
                                    fontWeight: '900',
                                    letterSpacing: '0.35em',
                                    textAlign: 'center',
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    border: kioskPinError ? '2px solid #EF4444' : '2px solid #CBD5E1',
                                    background: '#F8FAFC',
                                    color: '#0F172A',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>

                        {kioskPinError && (
                            <div style={{ color: '#EF4444', fontSize: '0.76rem', fontWeight: '750', marginBottom: '0.75rem' }}>
                                {kioskPinError}
                            </div>
                        )}

                        {/* Onscreen Touch Keypad */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', maxWidth: '240px', margin: '0 auto 1.25rem' }}>
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(key => {
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setKioskPinError('');
                                            if (key === 'C') {
                                                setKioskPinInput('');
                                            } else if (key === 'OK') {
                                                handleKioskPinUnlockSubmit();
                                            } else {
                                                if (kioskPinInput.length < 6) {
                                                    setKioskPinInput(prev => prev + key);
                                                }
                                            }
                                        }}
                                        style={{
                                            height: '48px',
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            background: key === 'OK' ? '#4F46E5' : key === 'C' ? '#FEE2E2' : '#F8FAFC',
                                            color: key === 'OK' ? '#FFFFFF' : key === 'C' ? '#DC2626' : '#1E293B',
                                            fontSize: '1.1rem',
                                            fontWeight: '850',
                                            cursor: 'pointer',
                                            transition: 'all 0.1s ease'
                                        }}
                                    >
                                        {key}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setKioskPinUnlockModalOpen(false);
                                setKioskPinInput('');
                                setKioskPinError('');
                            }}
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                background: 'none',
                                border: 'none',
                                color: '#64748B',
                                fontSize: '0.82rem',
                                fontWeight: '750',
                                cursor: 'pointer'
                            }}
                        >
                            Return to Customer View
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPOS;
