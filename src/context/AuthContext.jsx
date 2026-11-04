import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { supportService } from '../services/supportService';
import { profileService } from '../services/profileService';
import { caService } from '../services/caService';
import { isFeatureAllowed, getPlanDuration, calculateDaysRemaining } from '../utils/subscriptionUtils';
import { AuthContext } from './auth-context';

// Safely extract email or sub identifier from JWT
const getEmailFromToken = (tok) => {
    if (!tok || typeof tok !== 'string' || !tok.includes('.')) return null;
    try {
        const payload = JSON.parse(atob(tok.split('.')[1]));
        return (payload.email || payload.sub || '').toLowerCase();
    } catch (e) {
        return null;
    }
};

// Sanitize account entries from storage to prevent token mismatches across accounts
const sanitizeAccounts = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(acc => {
        if (!acc || !acc.email) return acc;
        const accEmail = acc.email.toLowerCase();
        let bnxToken = acc.bnxToken;
        if (bnxToken) {
            const bnxEmail = getEmailFromToken(bnxToken);
            if (bnxEmail && bnxEmail !== accEmail) {
                console.warn(`[MultiAccount] Discarding mismatched bnxToken for ${accEmail} (belongs to ${bnxEmail})`);
                bnxToken = null;
            }
        }
        return {
            ...acc,
            email: accEmail,
            bnxToken
        };
    });
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('books_auth_token'));
    const [accounts, setAccounts] = useState(() => {
        try {
            const raw = localStorage.getItem('cliks_multi_accounts');
            const parsed = raw ? JSON.parse(raw) : [];
            const sanitized = sanitizeAccounts(parsed);
            if (raw && JSON.stringify(sanitized) !== raw) {
                localStorage.setItem('cliks_multi_accounts', JSON.stringify(sanitized));
            }
            return sanitized;
        } catch (e) {
            return [];
        }
    });
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token');
            if (raw && raw.includes('.')) {
                const payload = JSON.parse(atob(raw.split('.')[1]));
                const uEmail = (payload.email || '').toLowerCase();
                let cachedAcc = null;
                try {
                    const stored = JSON.parse(localStorage.getItem('cliks_multi_accounts') || '[]');
                    cachedAcc = stored.find(a => a.email && a.email.toLowerCase() === uEmail);
                } catch (e) {}

                const dName = cachedAcc?.displayName || payload.displayName || payload.display_name || null;
                const fName = cachedAcc?.fullName || payload.fullName || payload.full_name || null;
                const uName = dName || fName || cachedAcc?.name || payload.name || payload.username || (uEmail ? uEmail.split('@')[0] : 'User');
                return {
                    id: payload.id,
                    username: payload.username || uName,
                    name: uName,
                    displayName: dName,
                    fullName: fName,
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

    // Helper to persist account entries in multi-account store strictly by email
    const saveOrUpdateAccount = React.useCallback((accData) => {
        if (!accData || !accData.email) return;
        const targetEmail = accData.email.toLowerCase();

        // Validate incoming bnxToken: does it belong to targetEmail?
        let incomingBnxToken = accData.bnxToken || null;
        if (incomingBnxToken) {
            const bnxEmail = getEmailFromToken(incomingBnxToken);
            if (bnxEmail && bnxEmail !== targetEmail) {
                console.warn(`[MultiAccount] Refusing to attach bnxToken of ${bnxEmail} to ${targetEmail}`);
                incomingBnxToken = null;
            }
        }

        setAccounts(prev => {
            const list = Array.isArray(prev) ? prev : [];
            const index = list.findIndex(a => a.email && a.email.toLowerCase() === targetEmail);

            let updated;
            if (index >= 0) {
                const existing = list[index];
                // Preserve existing valid bnxToken if incoming token is missing or invalid
                const finalBnxToken = incomingBnxToken || existing.bnxToken || null;

                const merged = {
                    ...existing,
                    ...accData,
                    email: targetEmail,
                    bnxToken: finalBnxToken,
                    lastActive: Date.now()
                };
                updated = [...list];
                updated[index] = merged;
            } else {
                updated = [...list, {
                    ...accData,
                    email: targetEmail,
                    bnxToken: incomingBnxToken,
                    lastActive: Date.now()
                }];
            }

            try {
                localStorage.setItem('cliks_multi_accounts', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
    }, []);

    // Switch active account seamlessly with full context sync
    const switchAccount = React.useCallback((targetAccount) => {
        if (!targetAccount || !targetAccount.email) return;
        const targetEmail = targetAccount.email.toLowerCase();

        try {
            caService.setUserOffline().catch(() => {});
        } catch (e) {}

        // Read directly from freshest localStorage
        let storedAccounts = [];
        try {
            storedAccounts = JSON.parse(localStorage.getItem('cliks_multi_accounts') || '[]');
        } catch (e) {}

        const freshTarget = storedAccounts.find(a => a.email && a.email.toLowerCase() === targetEmail) || targetAccount;
        if (!freshTarget || !freshTarget.token) return;

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

        const nextBooksToken = freshTarget.token;
        let nextBnxToken = freshTarget.bnxToken || null;

        // Ensure bnxToken strictly belongs to targetEmail
        if (nextBnxToken) {
            const bnxEmail = getEmailFromToken(nextBnxToken);
            if (bnxEmail && bnxEmail !== targetEmail) {
                console.warn(`[switchAccount] Stored bnxToken belonged to ${bnxEmail}, not ${targetEmail}`);
                nextBnxToken = null;
            }
        }

        localStorage.setItem('books_auth_token', nextBooksToken);
        if (nextBnxToken) {
            localStorage.setItem('bnx_auth_token', nextBnxToken);
        } else {
            localStorage.removeItem('bnx_auth_token');
        }

        if (freshTarget.profilePhoto) {
            localStorage.setItem('profile_photo', freshTarget.profilePhoto);
        } else {
            localStorage.removeItem('profile_photo');
        }

        // Update timestamps in cliks_multi_accounts
        const updatedAccounts = storedAccounts.map(a => {
            if (a.email && a.email.toLowerCase() === targetEmail) {
                return { ...a, lastActive: Date.now(), ...(nextBnxToken ? { bnxToken: nextBnxToken } : {}) };
            }
            return a;
        });
        try {
            localStorage.setItem('cliks_multi_accounts', JSON.stringify(updatedAccounts));
        } catch (e) {}

        // Reload page to guarantee clean context, fresh cache, and immediate token sync
        window.location.href = '/dashboard';
    }, []);

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

            // If OAuth code is in URL, Landing page is processing incoming callback; do not race
            if (typeof window !== 'undefined' && window.location.search && window.location.search.includes('code=')) {
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
                const uEmail = (userData.email || '').toLowerCase();

                // Only attach bnxToken if the token in localStorage genuinely belongs to this user's email
                const currentBnx = localStorage.getItem('bnx_auth_token');
                const bnxEmail = getEmailFromToken(currentBnx);
                const validBnxToken = (bnxEmail && bnxEmail === uEmail) ? currentBnx : null;

                // Also fetch BNX Mail user profile if bnxToken is available to get displayName and fullName
                let bnxData = null;
                if (validBnxToken) {
                    try {
                        const bnxRes = await fetch('https://api.bnxmail.com/api/users/me', {
                            headers: { 'Authorization': `Bearer ${validBnxToken}` }
                        });
                        const bnxJson = await bnxRes.json().catch(() => ({}));
                        if (bnxRes.ok && (bnxJson.success || bnxJson.data)) {
                            bnxData = bnxJson.data || bnxJson;
                        }
                    } catch (e) {
                        console.warn('[AuthContext] BNX profile fetch notice:', e.message);
                    }
                }

                const dName = bnxData?.displayName || bnxData?.display_name || userData.displayName || userData.display_name || null;
                const fName = bnxData?.fullName || bnxData?.full_name || userData.fullName || userData.full_name || null;
                const effectiveName = dName || fName || userData.name || userData.username || (uEmail ? uEmail.split('@')[0] : 'User');

                setUser(prev => {
                    const fullUser = {
                        ...prev,
                        ...userData,
                        displayName: dName,
                        fullName: fName,
                        username: userData.username || prev?.username || effectiveName,
                        name: effectiveName
                    };
                    saveOrUpdateAccount({
                        id: fullUser.id,
                        email: fullUser.email,
                        displayName: dName,
                        fullName: fName,
                        name: effectiveName,
                        username: fullUser.username || effectiveName,
                        role: fullUser.role || 'business',
                        tier: fullUser.tier || 'Free Plan',
                        token: token,
                        bnxToken: validBnxToken,
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

        // Fetch profile from BNX Mail to resolve displayName and fullName
        let bnxData = null;
        try {
            const bnxRes = await fetch('https://api.bnxmail.com/api/users/me', {
                headers: { 'Authorization': `Bearer ${bnxToken}` }
            });
            const bnxJson = await bnxRes.json().catch(() => ({}));
            if (bnxRes.ok && (bnxJson.success || bnxJson.data)) {
                bnxData = bnxJson.data || bnxJson;
            }
        } catch (e) {}

        const ssoDisplayName = bnxData?.displayName || bnxData?.display_name || newUser.displayName || newUser.display_name || null;
        const ssoFullName = bnxData?.fullName || bnxData?.full_name || newUser.fullName || newUser.full_name || null;
        const ssoEffectiveName = ssoDisplayName || ssoFullName || newUser.name || newUser.username || (newUser.email ? newUser.email.split('@')[0] : 'User');

        newUser.displayName = ssoDisplayName;
        newUser.fullName = ssoFullName;
        newUser.name = ssoEffectiveName;

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
            displayName: ssoDisplayName,
            fullName: ssoFullName,
            name: ssoEffectiveName,
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
