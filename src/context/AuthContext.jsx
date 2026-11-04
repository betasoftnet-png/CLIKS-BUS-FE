import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { supportService } from '../services/supportService';
import { profileService } from '../services/profileService';
import { caService } from '../services/caService';
import { isFeatureAllowed, getPlanDuration, calculateDaysRemaining } from '../utils/subscriptionUtils';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('books_auth_token'));
    const [accounts, setAccounts] = useState(() => {
        try {
            const raw = localStorage.getItem('cliks_multi_accounts');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token');
            if (raw && raw.includes('.')) {
                const payload = JSON.parse(atob(raw.split('.')[1]));
                const uName = payload.username || (payload.email ? payload.email.split('@')[0] : 'User');
                return {
                    id: payload.id,
                    username: payload.username || uName,
                    name: uName,
                    fullName: uName,
                    email: payload.email,
                    role: payload.role,
                    account_type: payload.account_type || payload.accountType || 'business',
                    is_sub_id: Boolean(payload.is_sub_id || payload.isSubId),
                    branch_id: payload.branch_id || payload.branchId || null,
                    branch_name: payload.branch_name || payload.branchName || null,
                    branchId: payload.branch_id || payload.branchId || null,
                    branchName: payload.branch_name || payload.branchName || null
                };
            }
        } catch (e) {}
        return null;
    });
    const [loading, setLoading] = useState(!!token && !user);
    const [planDaysRemaining, setPlanDaysRemaining] = useState(342);
    const queryClient = useQueryClient();

    const isLoggingOutRef = React.useRef(false);

    // Helper to persist account entries in multi-account store
    const saveOrUpdateAccount = React.useCallback((accData) => {
        if (!accData || (!accData.id && !accData.email)) return;
        setAccounts(prev => {
            const key = accData.email ? accData.email.toLowerCase() : String(accData.id);
            const index = prev.findIndex(a => 
                (a.email && a.email.toLowerCase() === key) || (a.id && String(a.id) === key)
            );
            let updated;
            if (index >= 0) {
                updated = [...prev];
                updated[index] = { ...updated[index], ...accData, lastActive: Date.now() };
            } else {
                updated = [...prev, { ...accData, lastActive: Date.now() }];
            }
            try {
                localStorage.setItem('cliks_multi_accounts', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
    }, []);

    // Switch active account seamlessly
    const switchAccount = React.useCallback(async (targetAccount) => {
        if (!targetAccount || !targetAccount.token) return;

        try {
            caService.setUserOffline().catch(() => {});
        } catch (e) {}

        // Clear tenant keys, preserve shortcuts and cliks_multi_accounts
        Object.keys(localStorage).forEach(key => {
            if (key !== 'cliks_dashboard_shortcuts' && key !== 'cliks_multi_accounts' && (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_'))) {
                localStorage.removeItem(key);
            }
        });
        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {}

        localStorage.setItem('books_auth_token', targetAccount.token);
        if (targetAccount.bnxToken) {
            localStorage.setItem('bnx_auth_token', targetAccount.bnxToken);
        } else {
            localStorage.removeItem('bnx_auth_token');
        }

        if (targetAccount.profilePhoto) {
            localStorage.setItem('profile_photo', targetAccount.profilePhoto);
        } else {
            localStorage.removeItem('profile_photo');
        }

        setToken(targetAccount.token);
        setUser(targetAccount);

        // Update timestamps in accounts
        setAccounts(prev => {
            const updated = prev.map(a => {
                const matches = (a.email && targetAccount.email && a.email.toLowerCase() === targetAccount.email.toLowerCase()) ||
                                (a.id && targetAccount.id && String(a.id) === String(targetAccount.id));
                return matches ? { ...a, ...targetAccount, lastActive: Date.now() } : a;
            });
            try {
                localStorage.setItem('cliks_multi_accounts', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });

        queryClient.clear();
        queryClient.invalidateQueries();

        // Refresh profile in background for active account
        try {
            const profile = await profileService.getProfile();
            const uName = profile.username || profile.name || (profile.email ? profile.email.split('@')[0] : 'User');
            setUser(prev => {
                const merged = { ...prev, ...profile, name: uName, username: profile.username || uName };
                return merged;
            });
        } catch (e) {
            console.warn('[switchAccount] Profile fetch warning:', e);
        }
    }, [queryClient]);

    // Sign out of all accounts
    const logoutAll = React.useCallback(() => {
        try {
            const currentToken = localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token');
            if (currentToken && currentToken !== 'mock-test-token') {
                caService.setUserOffline().catch(() => {});
            }
        } catch (e) {}

        localStorage.removeItem('books_auth_token');
        localStorage.removeItem('bnx_auth_token');
        localStorage.removeItem('profile_photo');
        localStorage.removeItem('cliks_multi_accounts');

        Object.keys(localStorage).forEach(key => {
            if (key !== 'cliks_dashboard_shortcuts' && (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_'))) {
                localStorage.removeItem(key);
            }
        });
        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {}

        setAccounts([]);
        setToken(null);
        setUser(null);
        queryClient.clear();
    }, [queryClient]);

    // Remove single account from multi-account list
    const removeAccount = React.useCallback((accountIdOrEmail) => {
        const key = String(accountIdOrEmail).toLowerCase();
        let remaining = [];
        setAccounts(prev => {
            remaining = prev.filter(a => 
                (a.id && String(a.id).toLowerCase() !== key) &&
                (a.email && String(a.email).toLowerCase() !== key)
            );
            try {
                localStorage.setItem('cliks_multi_accounts', JSON.stringify(remaining));
            } catch (e) {}
            return remaining;
        });

        const isCurrent = (user?.email && user.email.toLowerCase() === key) ||
                          (user?.id && String(user.id).toLowerCase() === key);

        if (isCurrent) {
            if (remaining.length > 0) {
                switchAccount(remaining[0]);
            } else {
                logoutAll();
            }
        }
    }, [user, switchAccount, logoutAll]);

    // Sign out current account; switches to remaining account if one exists, else full logout
    const logout = React.useCallback(() => {
        if (isLoggingOutRef.current) return false;
        isLoggingOutRef.current = true;

        const currentToken = localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token');
        if (currentToken && currentToken !== 'mock-test-token') {
            caService.setUserOffline().catch(() => {});
        }

        let storedAccounts = [];
        try {
            storedAccounts = JSON.parse(localStorage.getItem('cliks_multi_accounts') || '[]');
        } catch (e) {}

        const currentKey = user?.email?.toLowerCase() || (user?.id ? String(user.id).toLowerCase() : null);
        const remaining = storedAccounts.filter(a => 
            (a.email && a.email.toLowerCase() !== currentKey) &&
            (a.id && String(a.id).toLowerCase() !== currentKey)
        );

        if (remaining.length > 0) {
            localStorage.setItem('cliks_multi_accounts', JSON.stringify(remaining));
            setAccounts(remaining);
            isLoggingOutRef.current = false;
            switchAccount(remaining[0]);
            return true;
        }

        // No accounts left, full logout
        localStorage.removeItem('books_auth_token');
        localStorage.removeItem('bnx_auth_token');
        localStorage.removeItem('cliks_multi_accounts');
        localStorage.removeItem('profile_photo');
        
        Object.keys(localStorage).forEach(key => {
            if (key !== 'cliks_dashboard_shortcuts' && (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_'))) {
                localStorage.removeItem(key);
            }
        });
        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {}

        setAccounts([]);
        setToken(null);
        setUser(null);
        queryClient.clear();

        setTimeout(() => {
            isLoggingOutRef.current = false;
        }, 1500);
        return false;
    }, [queryClient, user, switchAccount]);

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            if (token === 'mock-test-token') {
                const now = new Date();
                const mockExpiry = new Date(now.getTime() + 342 * 24 * 60 * 60 * 1000).toISOString();
                setUser({
                    id: 'mock-id',
                    name: 'Test User',
                    username: 'Test User',
                    email: 'test@example.com',
                    role: 'business',
                    tier: 'Free Plan',
                    subscription_days_remaining: 342,
                    active_subscriptions: {
                        business: { active: true, plan: 'Starter Plan', startDate: now.toISOString(), expiryDate: mockExpiry, valid_until: mockExpiry }
                    }
                });
                setLoading(false);
                return;
            }

            try {
                const userData = await profileService.getProfile();
                const uName = userData.username || userData.name || (userData.email ? userData.email.split('@')[0] : 'User');
                setUser(prev => {
                    const fullUser = {
                        ...prev,
                        ...userData,
                        username: userData.username || prev?.username || uName,
                        name: uName
                    };
                    saveOrUpdateAccount({
                        id: fullUser.id,
                        email: fullUser.email,
                        name: fullUser.name || uName,
                        username: fullUser.username || uName,
                        role: fullUser.role || 'business',
                        tier: fullUser.tier || 'Free Plan',
                        token: token,
                        bnxToken: localStorage.getItem('bnx_auth_token') || token,
                        is_sub_id: fullUser.is_sub_id,
                        branch_id: fullUser.branch_id,
                        branch_name: fullUser.branch_name
                    });
                    return fullUser;
                });
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
    }, [token, logout, saveOrUpdateAccount]);

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
            if (e.key === 'books_auth_token' || e.key === 'bnx_auth_token') {
                const currentToken = localStorage.getItem('books_auth_token');
                if (!currentToken) {
                    logout();
                } else if (currentToken !== token) {
                    setToken(currentToken);
                }
            } else if (e.key === 'cliks_multi_accounts') {
                try {
                    const accs = JSON.parse(e.newValue || '[]');
                    setAccounts(accs);
                } catch (err) {}
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [logout, token]);

    useEffect(() => {
        if (user) {
            let remaining;
            const businessSub = user.active_subscriptions?.business;
            const businessExp = businessSub?.expiryDate || businessSub?.valid_until;
            if (businessExp) {
                remaining = calculateDaysRemaining(businessExp);
            } else if (user.subscription_days_remaining !== undefined && user.subscription_days_remaining !== null && user.subscription_days_remaining !== 0) {
                remaining = user.subscription_days_remaining;
            } else if (user.created_at) {
                const totalDays = getPlanDuration(user.tier || 'Elite Suite');
                const start = new Date(user.created_at);
                const now = new Date();
                const diffTime = now.getTime() - start.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                remaining = Math.max(0, totalDays - diffDays);
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

    const changePlan = async (newPlanName, targetCategory = null) => {
        const duration = getPlanDuration(newPlanName);

        // Detect category if not provided
        let cat = targetCategory;
        if (!cat) {
            if (['Fin-Pro Solo', 'Fin-Pro Firm', 'FIN-PRO'].includes(newPlanName)) {
                cat = 'fin_pro';
            } else if (['Basic Investor', 'Pro Investor', 'Investor Club'].includes(newPlanName)) {
                cat = 'investor';
            } else if (['Monthly Innovator', 'Yearly Founder', 'Poster Plan'].includes(newPlanName)) {
                cat = 'poster';
            } else {
                cat = 'business';
            }
        }

        const now = new Date();
        const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString();

        const existingSubs = user?.active_subscriptions || {
            business: { active: true, plan: user?.tier || 'Starter Plan' },
            fin_pro: { active: Boolean(user?.active_subscriptions?.fin_pro?.active), plan: null },
            investor: { active: false, plan: null },
            poster: { active: false, plan: null }
        };

        const updatedSubs = {
            ...existingSubs,
            [cat]: {
                active: true,
                plan: newPlanName,
                startDate: now.toISOString(),
                expiryDate: expiryDate,
                valid_until: expiryDate,
                updated_at: now.toISOString()
            }
        };
        try {
            localStorage.removeItem('cliks_investor_active');
            localStorage.removeItem('cliks_poster_active');
        } catch (e) {}

        const updatePayload = {
            active_subscriptions: updatedSubs
        };

        if (cat === 'business') {
            updatePayload.tier = newPlanName;
            updatePayload.subscription_days_remaining = duration;
        }

        try {
            const res = await profileService.updateProfile(updatePayload);
            const updatedUser = res.data || res;
            setUser(prev => ({ 
                ...prev, 
                ...updatedUser,
                active_subscriptions: updatedSubs,
                ...(cat === 'business' ? { tier: newPlanName, subscription_days_remaining: duration } : {})
            }));
            if (cat === 'business') setPlanDaysRemaining(duration);
            return updatedUser;
        } catch (err) {
            console.error("Failed to update active subscription in database:", err);
            setUser(prev => ({
                ...prev,
                active_subscriptions: updatedSubs,
                ...(cat === 'business' ? { tier: newPlanName, subscription_days_remaining: duration } : {})
            }));
            if (cat === 'business') setPlanDaysRemaining(duration);
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

        // Clear previous session storage keys before logging in a new user (preserve UI layout preferences & cliks_multi_accounts)
        Object.keys(localStorage).forEach(key => {
            if (key !== 'cliks_dashboard_shortcuts' && key !== 'cliks_multi_accounts' && (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_'))) {
                localStorage.removeItem(key);
            }
        });
        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {}

        localStorage.setItem('books_auth_token', accessToken);
        localStorage.setItem('bnx_auth_token', bnxToken);
        setToken(accessToken);
        setUser(newUser);

        // Record or update this account in the multi-account store
        const accountEntry = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name || newUser.username || (newUser.email ? newUser.email.split('@')[0] : 'User'),
            username: newUser.username || (newUser.email ? newUser.email.split('@')[0] : 'User'),
            role: newUser.role || 'business',
            tier: newUser.tier || 'Free Plan',
            token: accessToken,
            bnxToken: bnxToken,
            is_sub_id: newUser.is_sub_id,
            branch_id: newUser.branch_id,
            branch_name: newUser.branch_name,
            lastActive: Date.now()
        };
        saveOrUpdateAccount(accountEntry);

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
        accounts,
        switchAccount,
        removeAccount,
        logoutAll,
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
