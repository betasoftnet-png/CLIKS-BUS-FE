import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { isFeatureAllowed, getRequiredPlanForFeature } from '../../utils/subscriptionUtils';

/**
 * FeatureGate component to restrict UI elements or entire panels based on active subscription tier.
 */
export const FeatureGate = ({ 
    feature, 
    requiredPlanName, 
    fallback, 
    hideCompletely = false, 
    children 
}) => {
    const { selectedPlan, user } = useAuth();
    const navigate = useNavigate();

    const activePlan = selectedPlan || user?.tier || 'Free Plan';
    const isAllowed = isFeatureAllowed(activePlan, feature);
    const targetPlan = requiredPlanName || getRequiredPlanForFeature(feature);

    if (isAllowed) {
        return <>{children}</>;
    }

    if (hideCompletely) {
        return null;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Display features but catch all clicks to redirect to subscription
    return (
        <div 
            onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert(`Your current plan (${activePlan}) does not include access to this feature. Please upgrade to ${targetPlan} or higher to unlock full access.`);
                navigate('/subscription');
            }}
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            {/* The actual content (visible but unclickable) */}
            <div style={{ 
                opacity: 0.85, 
                pointerEvents: 'none',
                width: '100%',
                height: '100%'
            }}>
                {children}
            </div>
            
            {/* Invisible clickable overlay to ensure clicks are caught */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    cursor: 'pointer'
                }}
                title={`Upgrade to ${targetPlan} to unlock`}
            />
        </div>
    );
};

export default FeatureGate;
