/**
 * ProtectedRoute Component
 * 
 * Route guard that prevents unauthenticated users from accessing protected routes.
 * Redirects to the landing page (/) when not authenticated.
 * 
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ProtectedRoute wrapper component.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {string} [props.redirectTo='/'] - Where to redirect if not authenticated
 * @returns {React.ReactElement}
 */
export function ProtectedRoute({ children, redirectTo = '/' }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // -------------------------------------------------------------------------
    // Loading State (for future: when checking auth on mount)
    // -------------------------------------------------------------------------

    if (isLoading) {
        // TODO: Replace with proper loading component/skeleton
        // For now, return null to prevent flash of redirect
        return null;
    }

    // -------------------------------------------------------------------------
    // Authentication Check
    // -------------------------------------------------------------------------

    if (!isAuthenticated) {
        // Redirect to login, preserving the intended destination
        // The `state.from` can be used after login to redirect back
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // -------------------------------------------------------------------------
    // Render Protected Content
    // -------------------------------------------------------------------------

    return children;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default ProtectedRoute;
