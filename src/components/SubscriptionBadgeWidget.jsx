import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { calculateDaysRemaining } from '../utils/subscriptionUtils';

/**
 * Normalizes any plan object or category string into a standardized format.
 */
const normalizePlan = (rawPlan, idx = 0, defaultDays = 346) => {
    if (!rawPlan) return null;

    // Handle string or object input
    const isObject = typeof rawPlan === 'object';
    const rawModule = isObject
        ? (rawPlan.module || rawPlan.title || rawPlan.name || rawPlan.middleLabel || rawPlan.category || rawPlan.id || '')
        : String(rawPlan);

    const rawTier = isObject
        ? (rawPlan.tier || rawPlan.tierText || rawPlan.plan || rawPlan.plan_name || rawPlan.tier_name || '')
        : '';

    // Calculate days remaining
    let days = defaultDays;
    if (isObject) {
        if (rawPlan.days !== undefined && rawPlan.days !== null) {
            days = Number(rawPlan.days);
        } else if (rawPlan.days_remaining !== undefined && rawPlan.days_remaining !== null) {
            days = Number(rawPlan.days_remaining);
        } else if (rawPlan.daysRemaining !== undefined && rawPlan.daysRemaining !== null) {
            days = Number(rawPlan.daysRemaining);
        } else if (rawPlan.remaining_days !== undefined && rawPlan.remaining_days !== null) {
            days = Number(rawPlan.remaining_days);
        } else {
            const expiry = rawPlan.expires_at || rawPlan.end_date || rawPlan.expiryDate || rawPlan.valid_until || rawPlan.expiry_date;
            if (expiry) {
                days = calculateDaysRemaining(expiry);
            }
        }
    }

    // Determine normalized module title
    let moduleTitle = 'BOOK';
    const modUpper = String(rawModule).toUpperCase();
    if (modUpper.includes('FIN') || modUpper.includes('CA') || modUpper.includes('ACCOUNT')) {
        moduleTitle = 'FIN-PRO';
    } else if (modUpper.includes('PLD') || modUpper.includes('INVESTOR') || modUpper.includes('PRODUCT') || modUpper.includes('POSTER') || modUpper.includes('BETACLUB')) {
        moduleTitle = 'PLD';
    } else if (modUpper.includes('BOOK') || modUpper.includes('BUSINESS')) {
        moduleTitle = 'BOOK';
    } else if (rawModule) {
        moduleTitle = modUpper;
    } else if (idx === 1) {
        moduleTitle = 'FIN-PRO';
    } else if (idx >= 2) {
        moduleTitle = 'PLD';
    }

    // Determine normalized tier name
    let tierTitle = 'GROWTH';
    const tierUpper = String(rawTier).toUpperCase();
    if (tierUpper.includes('GROWTH')) {
        tierTitle = 'GROWTH';
    } else if (tierUpper.includes('STARTER')) {
        tierTitle = 'STARTER';
    } else if (tierUpper.includes('ELITE')) {
        tierTitle = 'ELITE';
    } else if (tierUpper.includes('SOLO')) {
        tierTitle = 'SOLO';
    } else if (tierUpper.includes('FIRM')) {
        tierTitle = 'FIRM';
    } else if (tierUpper.includes('BASIC')) {
        tierTitle = 'BASIC';
    } else if (tierUpper.includes('PRO')) {
        tierTitle = 'PRO';
    } else if (tierUpper.includes('FOUNDER')) {
        tierTitle = 'founders';
    } else if (tierUpper.includes('INNOVATOR') || (idx === 3 && moduleTitle === 'PLD')) {
        tierTitle = 'innovators';
    } else if (rawTier) {
        tierTitle = rawTier;
    } else if (idx === 0) {
        tierTitle = 'GROWTH';
    } else if (idx === 1) {
        tierTitle = 'SOLO';
    } else if (idx === 2) {
        tierTitle = 'BASIC';
    } else if (idx === 3) {
        tierTitle = 'innovators';
    }

    // Determine badge icon
    let iconType = 'shield';
    if (rawPlan?.icon) {
        iconType = rawPlan.icon;
    } else if (moduleTitle === 'FIN-PRO') {
        iconType = 'award';
    } else if (moduleTitle === 'PLD' && idx === 3) {
        iconType = 'rocket';
    } else if (moduleTitle === 'PLD') {
        iconType = 'zap';
    }

    return {
        id: rawPlan?.id || `${moduleTitle.toLowerCase()}-${idx}`,
        moduleTitle,
        tierTitle,
        days: isNaN(days) ? defaultDays : days,
        iconType
    };
};

/**
 * Circular Days Badge Component
 */
const DaysCircleBadge = ({ days, size = 44, borderWidth = 2.5, numFontSize = '0.85rem', labelFontSize = '0.42rem' }) => (
    <div
        style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: `${borderWidth}px solid #F59E0B`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            flexShrink: 0
        }}
    >
        <span
            style={{
                fontSize: numFontSize,
                fontWeight: '900',
                color: '#0F172A',
                lineHeight: 1
            }}
        >
            {days}
        </span>
        <span
            style={{
                fontSize: labelFontSize,
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '0.05em',
                lineHeight: 1,
                marginTop: '1.5px'
            }}
        >
            DAYS
        </span>
    </div>
);

/**
 * Icon Badge Component (Shield for Book, Ribbon/Award for Fin-Pro, etc.)
 */
const IconSquareBadge = ({ type = 'shield', size = 42, iconSize = 22 }) => {
    const isShield = type === 'shield';
    const bgColor = isShield ? '#DCFCE7' : '#E0F2FE';
    const borderColor = isShield ? '#059669' : '#0284C7';
    const iconColor = isShield ? '#047857' : '#0369A1';

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: size > 35 ? '11px' : '8px',
                backgroundColor: bgColor,
                border: `1.5px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
            }}
        >
            {isShield ? (
                <ShieldCheck size={iconSize} color={iconColor} strokeWidth={2.4} />
            ) : (
                <Award size={iconSize} color={iconColor} strokeWidth={2.4} />
            )}
        </div>
    );
};

/**
 * Dynamic Subscription Badge Widget Component
 */
export const SubscriptionBadgeWidget = ({
    user,
    business,
    plans: plansProp,
    selectedPlan,
    planDaysRemaining,
    onNavigate
}) => {
    // Ensure any legacy PLD flags in localStorage are removed
    try {
        localStorage.removeItem('cliks_investor_active');
        localStorage.removeItem('cliks_poster_active');
    } catch (e) {}

    // 1. Extract active plans directly from props or auth/user state
    const rawPlans = plansProp || user?.active_plans || user?.subscriptions || business?.plans;

    const isPldPlan = (p) => {
        if (!p) return false;
        const mod = String(p.module || p.moduleTitle || p.name || p.middleLabel || p.category || p.id || '').toUpperCase();
        const tier = String(p.tier || p.tierTitle || p.plan || p.plan_name || '').toUpperCase();
        return mod.includes('PLD') || mod.includes('INVESTOR') || mod.includes('POSTER') || mod.includes('BETACLUB') || mod.includes('PARTNER') ||
               tier.includes('INVESTOR') || tier.includes('INNOVATOR') || tier.includes('FOUNDER');
    };

    let activePlans = [];

    if (Array.isArray(rawPlans) && rawPlans.length > 0) {
        activePlans = rawPlans
            .filter(p => !isPldPlan(p))
            .map((p, idx) => normalizePlan(p, idx, planDaysRemaining || 346));
    } else {
        // Fallback safely to user active subscriptions state (strictly scoped to auth profile)
        const subs = user?.active_subscriptions || {};
        const isFinProActive = Boolean(subs.fin_pro?.active === true && subs.fin_pro?.plan);

        // Plan 1: Books / Business
        const rawTier = subs.business?.plan || selectedPlan || user?.tier || 'Growth Plan';
        let tier1 = 'GROWTH';
        const upTier = String(rawTier).toUpperCase();
        if (upTier.includes('STARTER')) tier1 = 'STARTER';
        else if (upTier.includes('GROWTH')) tier1 = 'GROWTH';
        else if (upTier.includes('ELITE')) tier1 = 'ELITE';
        else if (rawTier && rawTier !== 'Free Plan') tier1 = upTier;

        const businessSub = subs.business || {};
        const businessExp = businessSub.expiryDate || businessSub.valid_until || businessSub.expiry_date;
        const days1 = businessExp 
            ? calculateDaysRemaining(businessExp) 
            : (planDaysRemaining || 346);

        activePlans.push({
            id: 'books',
            moduleTitle: 'BOOK',
            tierTitle: tier1,
            days: days1,
            iconType: 'shield'
        });

        // Plan 2: FIN-PRO (if active)
        if (isFinProActive) {
            const rawFinTier = subs.fin_pro?.plan || subs.ca?.plan || user?.finpro_plan || user?.ca_plan || 'Fin-Pro Solo';
            let tier2 = 'SOLO';
            const upFinTier = String(rawFinTier).toUpperCase();
            if (upFinTier.includes('FIRM')) tier2 = 'FIRM';
            else if (upFinTier.includes('SOLO')) tier2 = 'SOLO';
            else if (rawFinTier) tier2 = upFinTier;

            const finSub = subs.fin_pro || subs.ca || {};
            const finExp = finSub.expiryDate || finSub.valid_until || finSub.expiry_date;
            const days2 = finExp ? calculateDaysRemaining(finExp) : 346;

            activePlans.push({
                id: 'finpro',
                moduleTitle: 'FIN-PRO',
                tierTitle: tier2,
                days: days2,
                iconType: 'award'
            });
        }

        // PLD plans (Investor Club / Products & Ideas) are deactivated and removed
    }

    // Limit to max 4 plans
    const displayPlans = activePlans.slice(0, 4);
    const count = displayPlans.length;

    // Safety fallback: if no plans found, render single default plan
    if (count === 0) {
        displayPlans.push({
            id: 'books-default',
            moduleTitle: 'BOOK',
            tierTitle: 'GROWTH',
            days: planDaysRemaining || 346,
            iconType: 'shield'
        });
    }

    const planCount = displayPlans.length;

    // Wrapper with click event and hover elevation
    return (
        <div
            onClick={onNavigate}
            role="button"
            tabIndex={0}
            title="Click to view subscription details"
            style={{
                width: '100%',
                cursor: 'pointer',
                outline: 'none',
                userSelect: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* CASE 1: Single Plan */}
            {planCount === 1 && (() => {
                const plan = displayPlans[0];
                return (
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 16px rgba(10, 20, 45, 0.4)',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Left: Rounded square badge with shield/verification icon */}
                        <IconSquareBadge type={plan.iconType || 'shield'} size={42} iconSize={23} />

                        {/* Center: Module title in white bold uppercase above tier in amber uppercase */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                padding: '0 8px'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '1.05rem',
                                    fontWeight: '900',
                                    color: '#FFFFFF',
                                    letterSpacing: '0.04em',
                                    lineHeight: 1.1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                {plan.moduleTitle}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.82rem',
                                    fontWeight: '800',
                                    color: '#F59E0B',
                                    letterSpacing: '0.03em',
                                    lineHeight: 1.15,
                                    marginTop: '3px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {plan.tierTitle}
                            </span>
                        </div>

                        {/* Right: White circle with gold border containing bold remaining days and DAYS */}
                        <DaysCircleBadge
                            days={plan.days}
                            size={44}
                            borderWidth={2.5}
                            numFontSize="0.88rem"
                            labelFontSize="0.42rem"
                        />
                    </div>
                );
            })()}

            {/* CASE 2: Two Plans (Matches reference screenshot strictly) */}
            {planCount === 2 && (
                <div
                    className="w-full bg-[#0A101D] border border-[#142038] rounded-2xl p-1.5 flex items-center gap-2 shadow-lg"
                    style={{
                        width: '100%',
                        backgroundColor: '#0A101D',
                        border: '1px solid #142038',
                        borderRadius: '16px',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxSizing: 'border-box',
                        boxShadow: '0 4px 16px rgba(10, 20, 45, 0.4)'
                    }}
                >
                    {displayPlans.map((plan, idx) => {
                        const moduleName = (plan.moduleTitle || plan.module || plan.name || 'BOOK').toUpperCase();
                        const tierName = (plan.tierTitle || plan.tier || plan.plan || 'ELITE').toUpperCase();
                        const days = plan.days ?? plan.daysRemaining ?? plan.days_left ?? 346;
                        const isFinPro = moduleName.includes('FIN') || idx === 1;

                        return (
                            <div
                                key={plan.id || idx}
                                className="flex-1 bg-[#060913] border border-[#1E293B] hover:border-slate-600 transition-all rounded-xl p-2.5 flex flex-col justify-between h-[88px] shadow-sm"
                                style={{
                                    flex: 1,
                                    backgroundColor: '#060913',
                                    border: '1.5px solid #1E293B',
                                    borderRadius: '13px',
                                    padding: '8px 8px 10px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '88px',
                                    minHeight: '88px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                                    boxSizing: 'border-box',
                                    minWidth: 0
                                }}
                            >
                                {/* Top Row: Icon on left, Days circle on right */}
                                <div
                                    className="flex items-center justify-between"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                                >
                                    {/* Icon Container */}
                                    <div
                                        className="w-7 h-7 rounded-md bg-[#111827] border border-slate-700/60 flex items-center justify-center"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '7px',
                                            backgroundColor: '#111827',
                                            border: '1px solid rgba(51, 65, 85, 0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        {isFinPro ? (
                                            // Ribbon / Medal icon for FIN-PRO
                                            <svg
                                                className="w-4 h-4 text-sky-400"
                                                style={{ width: '16px', height: '16px', color: '#38bdf8' }}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="8" r="5" />
                                                <path d="M8.21 13.89L7 21l5-3 5 3-1.21-7.11" />
                                            </svg>
                                        ) : (
                                            // Shield icon with checkmark for BOOK
                                            <svg
                                                className="w-4 h-4 text-sky-400"
                                                style={{ width: '16px', height: '16px', color: '#38bdf8' }}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                <path d="m9 12 2 2 4-4" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Days Counter Circle */}
                                    <div
                                        className="w-9 h-9 rounded-full bg-white border-[2.5px] border-[#F59E0B] flex flex-col items-center justify-center shadow-sm"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '9999px',
                                            backgroundColor: '#FFFFFF',
                                            border: '2.5px solid #F59E0B',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
                                            flexShrink: 0
                                        }}
                                    >
                                        <span
                                            className="text-[#0F172A] font-black text-[11px] leading-none"
                                            style={{
                                                color: '#0F172A',
                                                fontWeight: '900',
                                                fontSize: '11px',
                                                lineHeight: 1
                                            }}
                                        >
                                            {days}
                                        </span>
                                        <span
                                            className="text-[6.5px] font-bold text-[#0F172A] uppercase tracking-tight leading-none mt-0.5"
                                            style={{
                                                fontSize: '6.5px',
                                                fontWeight: '800',
                                                color: '#0F172A',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.02em',
                                                lineHeight: 1,
                                                marginTop: '2px'
                                            }}
                                        >
                                            DAYS
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Row: Text labels */}
                                <div
                                    className="text-center mt-1"
                                    style={{
                                        textAlign: 'center',
                                        marginTop: '4px',
                                        width: '100%'
                                    }}
                                >
                                    <div
                                        className="text-white text-[12px] font-black uppercase tracking-wider leading-none"
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            lineHeight: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {moduleName}
                                    </div>
                                    <div
                                        className="text-[#F59E0B] text-[10px] font-extrabold uppercase tracking-wide leading-none mt-1"
                                        style={{
                                            color: '#F59E0B',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.03em',
                                            lineHeight: 1,
                                            marginTop: '3px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {tierName}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CASE 3: Three Plans (3 evenly spaced columns) */}
            {planCount === 3 && (
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '9px 6px 10px 6px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '6px',
                        alignItems: 'stretch',
                        boxShadow: '0 4px 16px rgba(10, 20, 45, 0.4)',
                        boxSizing: 'border-box'
                    }}
                >
                    {displayPlans.map((plan) => (
                        <div
                            key={plan.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'flex-start',
                                minWidth: 0
                            }}
                        >
                            {/* Days circle on top */}
                            <DaysCircleBadge
                                days={plan.days}
                                size={38}
                                borderWidth={2.4}
                                numFontSize="0.74rem"
                                labelFontSize="0.40rem"
                            />

                            {/* Module name in white text below */}
                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '850',
                                    color: '#FFFFFF',
                                    marginTop: '6px',
                                    lineHeight: 1.15,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                }}
                            >
                                {plan.moduleTitle}
                            </div>

                            {/* Tier name in gold text at the bottom */}
                            <div
                                style={{
                                    fontSize: '0.62rem',
                                    fontWeight: '800',
                                    color: '#FBBF24',
                                    marginTop: '2px',
                                    lineHeight: 1.15,
                                    textTransform: 'uppercase',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                }}
                            >
                                {plan.tierTitle}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CASE 4: Four Plans (4 compact columns) */}
            {planCount >= 4 && (
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '7px 4px 8px 4px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                        gap: '3px',
                        alignItems: 'stretch',
                        boxShadow: '0 4px 16px rgba(10, 20, 45, 0.4)',
                        boxSizing: 'border-box'
                    }}
                >
                    {displayPlans.map((plan, idx) => (
                        <div
                            key={plan.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'flex-start',
                                minWidth: 0
                            }}
                        >
                            {/* Days circle on top */}
                            <DaysCircleBadge
                                days={plan.days}
                                size={34}
                                borderWidth={2.0}
                                numFontSize="0.66rem"
                                labelFontSize="0.36rem"
                            />

                            {/* Module name in white text below */}
                            <div
                                style={{
                                    fontSize: '0.60rem',
                                    fontWeight: '850',
                                    color: '#FFFFFF',
                                    marginTop: '4px',
                                    lineHeight: 1.15,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                }}
                            >
                                {plan.moduleTitle}
                            </div>

                            {/* Tier name in gold text at the bottom */}
                            <div
                                style={{
                                    fontSize: '0.52rem',
                                    fontWeight: '800',
                                    color: '#FBBF24',
                                    marginTop: '2px',
                                    lineHeight: 1.15,
                                    textTransform: (idx === 3 && plan.tierTitle === 'innovators') ? 'none' : 'uppercase',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                }}
                            >
                                {plan.tierTitle}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const DynamicSubscriptionWidget = SubscriptionBadgeWidget;
export default SubscriptionBadgeWidget;
