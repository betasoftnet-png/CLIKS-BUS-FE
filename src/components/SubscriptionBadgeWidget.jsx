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
    // 1. Extract active plans directly from props or auth/user state
    const rawPlans = plansProp || user?.active_plans || user?.subscriptions || business?.plans;

    let activePlans = [];

    if (Array.isArray(rawPlans) && rawPlans.length > 0) {
        activePlans = rawPlans.map((p, idx) => normalizePlan(p, idx, planDaysRemaining || 346));
    } else {
        // Fallback safely to user active subscriptions state (strictly scoped to auth profile)
        const subs = user?.active_subscriptions || {};
        const isFinProActive = Boolean(subs.fin_pro?.active === true && subs.fin_pro?.plan);
        const isInvestorActive = Boolean(subs.investor?.active === true && subs.investor?.plan);
        const isPosterActive = Boolean(subs.poster?.active === true && subs.poster?.plan);

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

        // Plan 3: PLD Investor (if active)
        if (isInvestorActive) {
            const rawInvTier = subs.investor?.plan || subs.betaclub_investor?.plan || user?.investor_plan || 'Basic';
            const isPro = String(rawInvTier).toUpperCase().includes('PRO');
            const invSub = subs.investor || subs.betaclub_investor || {};
            const invExp = invSub.expiryDate || invSub.valid_until || invSub.expiry_date;
            const days3 = invExp ? calculateDaysRemaining(invExp) : 346;

            activePlans.push({
                id: 'investor',
                moduleTitle: 'PLD',
                tierTitle: isPro ? 'PRO' : 'BASIC',
                days: days3,
                iconType: 'shield'
            });
        }

        // Plan 4: PLD Innovators / Founders (if active)
        if (isPosterActive) {
            const rawPosterTier = subs.poster?.plan || subs.product?.plan || subs.betaclub_product?.plan || user?.poster_plan || 'innovators';
            const isFounder = String(rawPosterTier).toUpperCase().includes('FOUNDER');
            const postSub = subs.poster || subs.product || subs.betaclub_product || {};
            const postExp = postSub.expiryDate || postSub.valid_until || postSub.expiry_date;
            const days4 = postExp ? calculateDaysRemaining(postExp) : 11;

            activePlans.push({
                id: 'poster',
                moduleTitle: 'PLD',
                tierTitle: isFounder ? 'founders' : 'innovators',
                days: days4,
                iconType: 'shield'
            });
        }
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

            {/* CASE 2: Two Plans (Split into two equal side-by-side cards) */}
            {planCount === 2 && (
                <div
                    style={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '6px',
                        alignItems: 'stretch',
                        boxSizing: 'border-box'
                    }}
                >
                    {displayPlans.map((plan, idx) => (
                        <div
                            key={plan.id}
                            style={{
                                backgroundColor: '#0F172A',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '14px',
                                padding: '8px 6px 10px 6px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 3px 12px rgba(10, 20, 45, 0.35)',
                                minWidth: 0,
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Top row: Icon on top-left, Days circle on top-right */}
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    padding: '0 2px'
                                }}
                            >
                                <IconSquareBadge
                                    type={idx === 1 ? 'award' : (plan.iconType || 'shield')}
                                    size={30}
                                    iconSize={16}
                                />
                                <DaysCircleBadge
                                    days={plan.days}
                                    size={36}
                                    borderWidth={2.2}
                                    numFontSize="0.72rem"
                                    labelFontSize="0.38rem"
                                />
                            </div>

                            {/* Center below: Module title and Tier */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    width: '100%'
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '0.78rem',
                                        fontWeight: '900',
                                        color: '#FFFFFF',
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
                                <div
                                    style={{
                                        fontSize: '0.68rem',
                                        fontWeight: '800',
                                        color: '#FBBF24',
                                        lineHeight: 1.15,
                                        marginTop: '2px',
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
                        </div>
                    ))}
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

export default SubscriptionBadgeWidget;
