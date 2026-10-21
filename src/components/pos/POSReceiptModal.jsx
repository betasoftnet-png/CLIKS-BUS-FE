import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Printer, Edit2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyService } from '../../services/loyaltyService';

const resolveShopDetails = (shopDetails, lastOrderData) => {
    const branchFullAddress = shopDetails ? (
        [shopDetails.address, shopDetails.city, shopDetails.state, shopDetails.pincode].filter(Boolean).join(', ') || shopDetails.address
    ) : null;

    const shopName = 
        lastOrderData?.shop_name ||
        shopDetails?.shop_name ||
        shopDetails?.name ||
        shopDetails?.business_name ||
        shopDetails?.companyName ||
        'CLIKS STORE';

    const address = 
        lastOrderData?.shop_address ||
        shopDetails?.shop_address ||
        branchFullAddress ||
        shopDetails?.address ||
        (shopDetails?.city ? `${shopDetails.city}${shopDetails.pincode ? ` - ${shopDetails.pincode}` : ''}` : '') ||
        'Commercial Center, Main Road';

    const phone = 
        lastOrderData?.shop_phone ||
        shopDetails?.shop_phone ||
        shopDetails?.phone ||
        shopDetails?.phone_number ||
        '';

    const email = 
        lastOrderData?.shop_email ||
        shopDetails?.shop_email ||
        shopDetails?.email ||
        '';

    const gstin = 
        lastOrderData?.shop_gstin ||
        shopDetails?.shop_gstin ||
        shopDetails?.gstin ||
        'URP (Unregistered)';

    const tagline = 
        lastOrderData?.shop_tagline ||
        shopDetails?.shop_tagline ||
        shopDetails?.tagline ||
        'Thank you for your business. Visit again!';

    return { shopName, address, phone, email, gstin, tagline };
};

const POSReceiptModal = ({
    isOpen,
    onClose,
    lastOrderData,
    paymentMode = 'CASH',
    formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    onPrint = () => window.print(),
    shopDetails = null,
    loyaltyEnabled: loyaltyEnabledProp = undefined,
    printShowLoyalty: printShowLoyaltyProp = undefined,
    printShowCredit: printShowCreditProp = undefined,
    onTogglePrintShowLoyalty = undefined,
    onTogglePrintShowCredit = undefined
}) => {
    if (!isOpen || !lastOrderData) return null;

    const queryClient = useQueryClient();
    const { shopName, address, phone, email, gstin, tagline } = resolveShopDetails(shopDetails, lastOrderData);
    
    // Dedicated Loyalty Program Settings (sourced directly from Backend API: business_loyalty_settings)
    const { data: loyaltyProgramSettings } = useQuery({
        queryKey: ['loyalty-program-settings'],
        queryFn: loyaltyService.getProgramSettings,
        enabled: printShowLoyaltyProp === undefined || printShowCreditProp === undefined || loyaltyEnabledProp === undefined,
        refetchOnWindowFocus: false
    });

    const updateLoyaltySettingsMutation = useMutation({
        mutationFn: (payload) => loyaltyService.updateProgramSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-program-settings'] });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });

    const [localPrintShowLoyalty, setLocalPrintShowLoyalty] = React.useState(null);
    const [localPrintShowCredit, setLocalPrintShowCredit] = React.useState(null);

    const printShowLoyalty = printShowLoyaltyProp !== undefined
        ? Boolean(printShowLoyaltyProp)
        : (localPrintShowLoyalty !== null 
            ? localPrintShowLoyalty 
            : Boolean(loyaltyProgramSettings?.print_show_loyalty ?? loyaltyProgramSettings?.printShowLoyalty ?? false));

    const printShowCredit = printShowCreditProp !== undefined
        ? Boolean(printShowCreditProp)
        : (localPrintShowCredit !== null 
            ? localPrintShowCredit 
            : Boolean(loyaltyProgramSettings?.print_show_credit ?? loyaltyProgramSettings?.printShowCredit ?? false));

    const handleToggleLoyalty = (checked) => {
        setLocalPrintShowLoyalty(checked);
        if (onTogglePrintShowLoyalty) {
            onTogglePrintShowLoyalty(checked);
        } else {
            updateLoyaltySettingsMutation.mutate({ print_show_loyalty: checked });
        }
    };

    const handleToggleCredit = (checked) => {
        setLocalPrintShowCredit(checked);
        if (onTogglePrintShowCredit) {
            onTogglePrintShowCredit(checked);
        } else {
            updateLoyaltySettingsMutation.mutate({ print_show_credit: checked });
        }
    };

    // Determine loyalty enabled state from prop or backend settings
    const loyaltyEnabled = loyaltyEnabledProp !== undefined 
        ? Boolean(loyaltyEnabledProp)
        : Boolean(loyaltyProgramSettings?.loyaltyEnabled ?? (lastOrderData?.loyalty_discount_amount > 0 || lastOrderData?.loyalty_points_redeemed > 0 || lastOrderData?.loyalty_points_earned > 0));

    return (
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
                    onClick={onClose}
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
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '16px', 
                    padding: '8px 14px', 
                    background: '#F8FAFC', 
                    borderBottom: '1px solid #E2E8F0', 
                    fontSize: '0.74rem', 
                    color: '#334155',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontWeight: '750', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚙️ Print Controls:
                    </span>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontWeight: '650' }} title="Toggle whether Loyalty Points should be printed on the receipt">
                        <input
                            type="checkbox"
                            checked={printShowLoyalty}
                            onChange={(e) => handleToggleLoyalty(e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: '#10B981', width: '14px', height: '14px' }}
                        />
                        Print Loyalty Points
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontWeight: '650' }} title="Toggle whether Credit Summary should be printed on the receipt">
                        <input
                            type="checkbox"
                            checked={printShowCredit}
                            onChange={(e) => handleToggleCredit(e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: '#10B981', width: '14px', height: '14px' }}
                        />
                        Print Credit Option
                    </label>
                </div>

                {/* Thermal Receipt Workspace (to print) */}
                <div id="printable-pos-receipt" className="printable-pos-receipt" style={{ padding: '1.5rem', background: '#FFFFFF', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000', textAlign: 'center' }}>
                        {/* Shop / Store Name */}
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '1.25' }}>
                            {shopName}
                        </h4>

                        {/* Shop Address */}
                        <p style={{ margin: '0 0 3px', fontSize: '0.75rem', lineHeight: '1.35', maxWidth: '270px', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                            {address}
                        </p>

                        {/* Shop Contact Details (Phone & Email) */}
                        {(phone || email) && (
                            <p style={{ margin: '1px 0 3px', fontSize: '0.75rem', fontWeight: '600' }}>
                                {phone && <span>Ph: {phone}</span>}
                                {phone && email && <span> | </span>}
                                {email && <span>{email}</span>}
                            </p>
                        )}

                        {/* GST / GSTIN */}
                        <p style={{ margin: '1px 0 4px', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                            GST: {gstin}
                        </p>

                        <p style={{ margin: '2px 0 8px', fontSize: '0.75rem' }}>Receipt No: {lastOrderData?.invoice_number || 'N/A'}</p>
                        
                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />
                        
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Date: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                            <span>Time: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                            <span>Customer: {lastOrderData?.client_name || 'Walk-in Customer'}</span>
                            <span style={{ fontWeight: '700' }}>Mode: {(lastOrderData?.payment_mode || paymentMode || 'CASH').toUpperCase()}</span>
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
                                    {/* Tally */}
                                    <div style={{ width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>TAX (GST):</span>
                                            <span>{formatCurrency(lastOrderData?.tax_amount || 0)}</span>
                                        </div>
                                        {shouldPrintLoyalty && loyaltyDisc > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                <span>LOYALTY DISCOUNT:</span>
                                                <span>- {formatCurrency(loyaltyDisc)}</span>
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
                                                {/* Loyalty Points */}
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

                                                {/* Credit Summary */}
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

                                    <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0 4px' }} />

                                    <p style={{ margin: '6px 0 2px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        Thanks for your business. Visit again.
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', fontWeight: '600' }}>
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
                        onClick={onPrint}
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
                        onClick={onClose}
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
    );
};

export default POSReceiptModal;
