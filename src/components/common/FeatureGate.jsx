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

    // Default premium glassmorphic upgrade block overlay
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '200px',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
        }}>
            {/* Blurred Background Content (to represent what they are missing out on) */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.15,
                filter: 'blur(5px)',
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {children}
            </div>

            {/* Premium Upgrade Overlay Card */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '90%',
                maxWidth: '420px',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.12)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                    border: '1.5px solid #F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37',
                    boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.15)'
                }}>
                    <Crown size={26} strokeWidth={2.2} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>
                        Premium Feature Locked
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: '500', lineHeight: 1.4 }}>
                        Upgrade your workspace to the <strong style={{ color: '#064E3B' }}>{requiredPlanName}</strong> tier or above to unlock this module.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/subscription')}
                    style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '750',
                        fontSize: '0.88rem',
                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(27, 107, 58, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 107, 58, 0.2)';
                    }}
                >
                    <Lock size={15} />
                    <span>Unlock with Upgrade</span>
                </button>
            </div>
        </div>
    );
};

export default FeatureGate;
