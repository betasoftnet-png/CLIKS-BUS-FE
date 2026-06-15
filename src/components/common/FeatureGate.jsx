import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { Crown, Lock } from 'lucide-react';

/**
 * FeatureGate component to restrict UI elements or entire panels based on active subscription tier.
 * 
 * @param {Object} props
 * @param {string} props.feature - The feature code to check (e.g. 'multi-warehouse')
 * @param {string} [props.requiredPlanName='Growth Plan'] - Human-readable name of plan required for overlay display
 * @param {React.ReactNode} [props.fallback] - Custom fallback component to render if feature is locked
 * @param {boolean} [props.hideCompletely=false] - If true, renders null instead of the premium upgrade card overlay
 * @param {React.ReactNode} props.children - Locked content to render if active plan contains the feature
 */
export const FeatureGate = ({ 
    feature, 
    requiredPlanName = 'Growth Plan', 
    fallback, 
    hideCompletely = false, 
    children 
}) => {
    const { hasFeature } = useAuth();
    const navigate = useNavigate();
    const isAllowed = hasFeature(feature);

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
                title={`Upgrade to ${requiredPlanName} to unlock`}
            />
        </div>
    );
};

export default FeatureGate;
