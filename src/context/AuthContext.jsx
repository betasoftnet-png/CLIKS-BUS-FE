import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { supportService } from '../services/supportService';
import { profileService } from '../services/profileService';
import { caService } from '../services/caService';
import { isFeatureAllowed, getPlanDuration } from '../utils/subscriptionUtils';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('books_auth_token'));
    const [loading, setLoading] = useState(!!token);
    const [planDaysRemaining, setPlanDaysRemaining] = useState(342);
    const queryClient = useQueryClient();

    const logout = React.useCallback(() => {
        caService.setUserOffline().catch(() => {});
        localStorage.removeItem('books_auth_token');
        localStorage.removeItem('bnx_auth_token');
        
        // Clear all local storage keys to prevent data leakage across accounts
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cliks_') || key.startsWith('books_')) {
                localStorage.removeItem(key);
            }
        });

        setToken(null);
        setUser(null);
        // Clear query cache to prevent User B from seeing User A's cached data
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        const initAuth = async () => {
            if (!token || user) {
                setLoading(false);
                return;
            }
            if (token === 'mock-test-token') {
                setUser({
                    id: 'mock-id',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'business',
                    tier: 'Free Plan',
                    subscription_days_remaining: 0
                });
                setLoading(false);
                return;
            }

            try {
                const userData = await profileService.getProfile();
                setUser(userData);
            } catch (error) {
                console.error('[AuthContext] Failed to fetch profile:', error);
                // Only logout on 401 Unauthorized to prevent loops on other errors
                if (error.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [token, logout, user]);

    useEffect(() => {
        const handleUnauthorized = () => {
            console.warn('[AuthContext] Session expired / 401 Unauthorized received. Clearing session.');
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [logout]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (!e.key || e.key === 'books_auth_token' || e.key === 'bnx_auth_token') {
                console.warn('[AuthContext] Auth session changed or switched in another tab. Logging out this tab.');
                logout();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [logout]);

    useEffect(() => {
        if (user) {
            let totalDays = getPlanDuration(user.tier || 'Elite Suite');
            let remaining = totalDays;
            
            if (user.subscription_days_remaining !== undefined && user.subscription_days_remaining !== null && user.subscription_days_remaining !== 0) {
                remaining = user.subscription_days_remaining;
            } else if (user.created_at) {
                const start = new Date(user.created_at);
                const now = new Date();
                const diffTime = now.getTime() - start.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                remaining = totalDays - diffDays;
                if (remaining < 0) remaining = 0;
            } else {
                remaining = 342;
            }
            
            setPlanDaysRemaining(remaining);
        }
    }, [user]);

    useEffect(() => {
        if (user && token) {
            caService.setUserOnline().catch(() => {});
            const heartbeatTimer = setInterval(() => {
                caService.updatePresenceHeartbeat().catch(() => {});
            }, 30000);
            return () => clearInterval(heartbeatTimer);
        }
    }, [user, token]);

    const changePlan = async (newPlanName) => {
        const duration = getPlanDuration(newPlanName);
        try {
            // Hit backend database to persist updated tier & days remaining
            const res = await profileService.updateProfile({ 
                tier: newPlanName, 
                subscription_days_remaining: duration 
            });
            
            // Extract the user data
            const updatedUser = res.data || res;
            setUser(prev => ({ 
                ...prev, 
                ...updatedUser,
                tier: newPlanName,
                subscription_days_remaining: duration
            }));
            setPlanDaysRemaining(duration);
            return updatedUser;
        } catch (err) {
            console.error("Failed to update active subscription in database:", err);
            // Simulated/Fallback path if API fails
            setUser(prev => ({
                ...prev,
                tier: newPlanName,
                subscription_days_remaining: duration
            }));
            setPlanDaysRemaining(duration);
        }
    };

    const hasFeature = React.useCallback((featureId) => {
        return isFeatureAllowed(user?.tier || 'Free Plan', featureId);
    }, [user?.tier]);

    const ssoLogin = async (bnxToken, appType = null) => {
        let accessToken = bnxToken;
        let newUser = {
            id: 'sso-user',
            name: 'Business User',
            email: 'user@cliks.com',
            role: 'business',
            tier: 'Free Plan'
        };

        try {
            const data = await authService.ssoLogin(bnxToken, appType);
            if (data?.accessToken) accessToken = data.accessToken;
            if (data?.user) newUser = data.user;
        } catch (err) {
            try {
                if (typeof bnxToken === 'string' && bnxToken.includes('.')) {
                    const payloadBase64 = bnxToken.split('.')[1];
                    const decoded = JSON.parse(atob(payloadBase64));
                    if (decoded.email) {
                        newUser.email = decoded.email;
                        newUser.name = decoded.name || decoded.username || decoded.email.split('@')[0];
                    }
                    if (decoded.role) newUser.role = decoded.role;
                }
            } catch (e) {}
        }

        // Clear all previous local storage keys before logging in a new user
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cliks_') || key.startsWith('books_')) {
                localStorage.removeItem(key);
            }
        });

        localStorage.setItem('books_auth_token', accessToken);
        localStorage.setItem('bnx_auth_token', bnxToken);
        setToken(accessToken);
        setUser(newUser);

        // Invalidate and refetch all queries to ensure new user data is loaded
        queryClient.invalidateQueries();

        return { accessToken, user: newUser };
    };

    const adminLogin = async (email, password) => {
        const data = await adminService.adminLogin(email, password);
        const { accessToken, user: newUser } = data;

        localStorage.setItem('books_auth_token', accessToken);
        setToken(accessToken);
        setUser(newUser);

        queryClient.invalidateQueries();

        return data;
    };

    const supportAgentLogin = async (email, password) => {
        const data = await supportService.supportAgentLogin(email, password);
        const { accessToken, user: newUser } = data;

        localStorage.setItem('books_auth_token', accessToken);
        setToken(accessToken);
        setUser(newUser);

        queryClient.invalidateQueries();

        return data;
    };

    const impersonateLogin = async (userId) => {
        // Trigger the high-trust impersonation link
        const data = await adminService.impersonateUser(userId);
        const { accessToken, user: impersonatedUser } = data;

        // Force immediate memory cache dump to prevent support personnel from seeing stale admin queries
        queryClient.clear();

        // Hydrate impersonated tenant parameters
        localStorage.setItem('books_auth_token', accessToken);
        setToken(accessToken);
        setUser(impersonatedUser);

        return data;
    };

    const mockLogin = () => {
        const mockToken = 'mock-test-token';
        const mockUser = {
            id: 'mock-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'business',
            tier: 'Free Plan',
            subscription_days_remaining: 0
        };
        localStorage.setItem('books_auth_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        queryClient.invalidateQueries();
    };

    const value = {
        user,
        token,
        loading,
        ssoLogin,
        adminLogin,
        supportAgentLogin,
        impersonateLogin,
        mockLogin,
        logout,
        isAuthenticated: !!token,
        selectedPlan: user?.tier || 'Elite Suite',
        planDaysRemaining,
        changePlan,
        hasFeature
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
