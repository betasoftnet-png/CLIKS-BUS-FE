import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { supportService } from '../services/supportService';
import { profileService } from '../services/profileService';
import { caService } from '../services/caService';
import { isFeatureAllowed, getPlanDuration, calculateDaysRemaining } from '../utils/subscriptionUtils';
import { AuthContext } from './auth-context';

// Safely decode base64url JWT payload
export const safeDecodeJwt = (tok) => {
    if (!tok || typeof tok !== 'string' || !tok.includes('.')) return null;
    try {
        const parts = tok.split('.');
        if (parts.length < 2) return null;
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) {
            b64 += '=';
        }
        const json = decodeURIComponent(
            atob(b64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(json);
    } catch (e) {
        try {
            let b64 = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) b64 += '=';
            return JSON.parse(atob(b64));
        } catch (err2) {
            return null;
        }
    }
};

// Safely extract email or sub identifier from JWT
const getEmailFromToken = (tok) => {
    const payload = safeDecodeJwt(tok);
    if (!payload) return null;
    const email = payload.email || 
                  payload.user_email || 
                  (typeof payload.sub === 'string' && payload.sub.includes('@') ? payload.sub : null) || 
                  payload.user?.email || 
                  payload.preferred_username;
    return (email || '').toLowerCase().trim();
};

// Retrieve multi-account BNX tokens dictionary from localStorage
export const getMultiBnxTokens = () => {
    try {
        const raw = localStorage.getItem('cliks_bnx_tokens');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
};

// Store a BNX token mapped to all identifiers of an account in multi-account store
export const saveBnxTokenForAccount = (token, identifiers = []) => {
    if (!token || typeof token !== 'string') return;
    try {
        const tokensMap = getMultiBnxTokens();
        identifiers.filter(Boolean).forEach(id => {
            const cleanKey = String(id).toLowerCase().trim();
            if (cleanKey) {
                tokensMap[cleanKey] = token;
                try {
                    localStorage.setItem(`bnx_token_${cleanKey}`, token);
                } catch (e) {}
            }
        });
        localStorage.setItem('cliks_bnx_tokens', JSON.stringify(tokensMap));
    } catch (e) {}
};

// Find the BNX token for a target account from all available multi-account stores
export const findBnxTokenForAccount = (account) => {
    if (!account) return null;
    if (account.bnxToken && typeof account.bnxToken === 'string') return account.bnxToken;
    const tokensMap = getMultiBnxTokens();

    const keys = [
        account.email,
        account.email?.toLowerCase(),
        account.username,
        account.username?.toLowerCase(),
        account.email?.split('@')[0]?.toLowerCase(),
        account.id ? String(account.id) : null
    ].filter(Boolean);

    for (const rawKey of keys) {
        const key = String(rawKey).toLowerCase().trim();
        if (tokensMap[key]) return tokensMap[key];
        try {
            const direct = localStorage.getItem(`bnx_token_${key}`);
            if (direct) return direct;
        } catch (e) {}
    }
    return null;
};

// Sanitize and sync account entries with multi-account BNX tokens store
const sanitizeAccounts = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(acc => {
        if (!acc || !acc.email) return acc;
        const accEmail = acc.email.toLowerCase();
        const emailPrefix = accEmail.split('@')[0];

        // Check if this account's displayName or username was cross-contaminated by another account in the list
        const isCrossContaminated = rawList.some(other => {
            if (!other || !other.email) return false;
            const otherEmail = other.email.toLowerCase();
            if (otherEmail === accEmail) return false;
            const otherPrefix = otherEmail.split('@')[0];
            const accName = String(acc.displayName || acc.username || acc.name || '').toLowerCase().trim();
            const otherUsername = String(other.username || '').toLowerCase().trim();
            return (accName && accName === otherPrefix) || (otherUsername && accName === otherUsername);
        });

        let bnxToken = acc.bnxToken || findBnxTokenForAccount(acc);
        if (bnxToken && bnxToken.includes('.')) {
            try {
                const dec = safeDecodeJwt(bnxToken);
                if (dec && dec.email && dec.email.toLowerCase() !== accEmail) {
                    bnxToken = null;
                }
            } catch (e) {}
        }

        if (bnxToken) {
            saveBnxTokenForAccount(bnxToken, [accEmail, emailPrefix]);
        }

        const resolvedDisplayName = isCrossContaminated ? emailPrefix : (acc.displayName || acc.name || emailPrefix);
        const resolvedUsername = isCrossContaminated ? emailPrefix : (acc.username || emailPrefix);

        return {
            ...acc,
            displayName: resolvedDisplayName,
            username: resolvedUsername,
            name: resolvedDisplayName,
            email: accEmail,
            bnxToken: bnxToken || null
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
                const payload = safeDecodeJwt(raw);
                const uEmail = (payload?.email || (typeof payload?.sub === 'string' && payload.sub.includes('@') ? payload.sub : '') || '').toLowerCase();
                const fallbackName = uEmail ? uEmail.split('@')[0] : 'User';

                let cachedAcc = null;
                let isContaminated = false;
                try {
                    const stored = JSON.parse(localStorage.getItem('cliks_multi_accounts') || '[]');
                    cachedAcc = stored.find(a => a.email && a.email.toLowerCase() === uEmail);
                    if (cachedAcc) {
                        isContaminated = stored.some(other => {
                            if (!other || !other.email) return false;
                            const otherEmail = other.email.toLowerCase();
                            if (otherEmail === uEmail) return false;
                            const otherPrefix = otherEmail.split('@')[0];
                            const checkName = String(cachedAcc.displayName || cachedAcc.username || cachedAcc.name || '').toLowerCase().trim();
                            return checkName === otherPrefix || (other.username && checkName === other.username.toLowerCase());
                        });
                    }
                } catch (e) {}

                let dName = isContaminated ? null : (cachedAcc?.displayName || payload.displayName || payload.display_name || null);
                let fName = isContaminated ? null : (cachedAcc?.fullName || payload.fullName || payload.full_name || null);
                let uName = isContaminated ? fallbackName : (dName || fName || cachedAcc?.name || payload.name || payload.username || fallbackName);

                const cachedPhoto = cachedAcc?.profilePhoto || cachedAcc?.profilePictureUrl || localStorage.getItem('profile_photo') || null;
                return {
                    id: payload.id,
                    username: uName,
                    name: uName,
                    displayName: dName || uName,
                    fullName: fName || uName,
                    email: payload.email,
                    profilePhoto: cachedPhoto,
                    profilePictureUrl: cachedPhoto,
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
    const userRef = React.useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const isLoggingOutRef = React.useRef(false);

    // Helper to persist account entries in multi-account store strictly by email
    const saveOrUpdateAccount = React.useCallback((accData) => {
        if (!accData || !accData.email) return;
        const targetEmail = accData.email.toLowerCase();

        // Check if bnxToken is supplied or stored in multi-account BNX token dictionary
        const incomingBnxToken = accData.bnxToken || findBnxTokenForAccount(accData);
        if (incomingBnxToken) {
            saveBnxTokenForAccount(incomingBnxToken, [targetEmail, accData.username, targetEmail.split('@')[0]]);
        }

        setAccounts(prev => {
            const list = Array.isArray(prev) ? prev : [];
            const index = list.findIndex(a => a.email && a.email.toLowerCase() === targetEmail);

            let updated;
            if (index >= 0) {
                const existing = list[index];
                // Preserve valid bnxToken from any available source
                const finalBnxToken = incomingBnxToken || existing.bnxToken || findBnxTokenForAccount(existing) || null;

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
                    bnxToken: incomingBnxToken || null,
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
    const switchAccount = React.useCallback(async (targetAccount) => {
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
        if (!freshTarget) return;

        // Retrieve BNX token for this account from multi-account store
        const nextBnxToken = freshTarget.bnxToken || findBnxTokenForAccount(freshTarget) || null;
        let nextBooksToken = freshTarget.token;

        // If booksToken is missing or we have a valid BNX token, obtain a fresh backend access token
        if (!nextBooksToken && nextBnxToken) {
            try {
                const ssoRes = await authService.ssoLogin(nextBnxToken, 'BUSINESS');
                const tokenData = ssoRes?.data || ssoRes;
                if (tokenData?.accessToken) {
                    nextBooksToken = tokenData.accessToken;
                }
            } catch (err) {
                console.warn('[switchAccount] Could not refresh session token:', err.message);
                nextBooksToken = nextBnxToken;
            }
        }

        if (!nextBooksToken && !nextBnxToken) return;
        const activeToken = nextBooksToken || nextBnxToken;

        // Clear query cache to prevent showing previous account's cached queries
        try {
            queryClient.clear();
        } catch (e) {}

        // Clear branch headers
        try {
            apiClient.setActiveBranchHeader(null);
        } catch (e) {}

        // Clear tenant keys, preserve shortcuts, cliks_multi_accounts, and multi-account BNX tokens
        const preservedKeys = new Set([
            'cliks_dashboard_shortcuts',
            'cliks_multi_accounts',
            'cliks_bnx_tokens',
            'cliks_dark_mode',
            'cliks_language',
            'cliks_currency',
            'cliks_country'
        ]);

        Object.keys(localStorage).forEach(key => {
            if (!preservedKeys.has(key) && !key.startsWith('bnx_token_') && !key.startsWith('bnx_auth_token_')) {
                if (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_') ||
                    key === 'token' || key === 'authToken' || key === 'user' || key === 'access_token' ||
                    key === 'business' || key === 'business_id' || key === 'active_business') {
                    localStorage.removeItem(key);
                }
            }
        });
        try {
            Object.keys(sessionStorage).forEach(key => {
                sessionStorage.removeItem(key);
            });
        } catch (e) {}

        localStorage.setItem('books_auth_token', activeToken);
        if (nextBnxToken) {
            localStorage.setItem('bnx_auth_token', nextBnxToken);
            saveBnxTokenForAccount(nextBnxToken, [targetEmail, freshTarget.username, targetEmail.split('@')[0]]);
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
                return { 
                    ...a, 
                    token: activeToken,
                    lastActive: Date.now(), 
                    ...(nextBnxToken ? { bnxToken: nextBnxToken } : {}) 
                };
            }
            return a;
        });
        try {
            localStorage.setItem('cliks_multi_accounts', JSON.stringify(updatedAccounts));
        } catch (e) {}

        // Reload page to guarantee clean context, fresh cache, and immediate token sync
        window.location.replace('/dashboard');
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
        localStorage.removeItem('cliks_bnx_tokens');
        localStorage.removeItem('profile_photo');
        localStorage.removeItem('cliks_multi_accounts');

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('bnx_token_') || key.startsWith('bnx_auth_token_')) {
                localStorage.removeItem(key);
            }
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

        try {
            const map = getMultiBnxTokens();
            delete map[key];
            localStorage.setItem('cliks_bnx_tokens', JSON.stringify(map));
            localStorage.removeItem(`bnx_token_${key}`);
            localStorage.removeItem(`bnx_auth_token_${key}`);
        } catch (e) {}

        const isCurrent = (userRef.current?.email && userRef.current.email.toLowerCase() === key) ||
                          (userRef.current?.id && String(userRef.current.id).toLowerCase() === key);

        if (isCurrent) {
            if (remaining.length > 0) {
                switchAccount(remaining[0]);
            } else {
                logoutAll();
            }
        }
    }, [switchAccount, logoutAll]);

    // Sign out: clean full logout to landing page without trapping user in account loops
    const logout = React.useCallback(() => {
        if (isLoggingOutRef.current) return false;
        isLoggingOutRef.current = true;

        try {
            const currentToken = localStorage.getItem('books_auth_token') || localStorage.getItem('bnx_auth_token');
            if (currentToken && currentToken !== 'mock-test-token') {
                caService.setUserOffline().catch(() => {});
            }
        } catch (e) {}

        // Full clean logout: clear all session credentials and multi-accounts
        localStorage.removeItem('books_auth_token');
        localStorage.removeItem('bnx_auth_token');
        localStorage.removeItem('cliks_bnx_tokens');
        localStorage.removeItem('profile_photo');
        localStorage.removeItem('cliks_multi_accounts');

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('bnx_token_') || key.startsWith('bnx_auth_token_')) {
                localStorage.removeItem(key);
            }
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
        }, 500);
        return false;
    }, [queryClient]);

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
                const emailPrefix = uEmail ? uEmail.split('@')[0] : 'User';

                // Look up BNX token from multi-account store or current localStorage only if it matches this account's email
                let validBnxToken = findBnxTokenForAccount(userData);
                if (!validBnxToken) {
                    const localToken = localStorage.getItem('bnx_auth_token');
                    if (localToken && localToken.includes('.')) {
                        try {
                            const dec = safeDecodeJwt(localToken);
                            const decEmail = (dec?.email || (typeof dec?.sub === 'string' && dec.sub.includes('@') ? dec.sub : '')).toLowerCase();
                            if (decEmail && decEmail === uEmail) {
                                validBnxToken = localToken;
                            }
                        } catch (e) {}
                    }
                }
                if (validBnxToken) {
                    saveBnxTokenForAccount(validBnxToken, [uEmail, emailPrefix]);
                    localStorage.setItem('bnx_auth_token', validBnxToken);
                }

                // Also fetch BNX Mail user profile if bnxToken is available to get displayName and fullName
                let bnxData = null;
                if (validBnxToken) {
                    try {
                        const bnxRes = await fetch('https://api.bnxmail.com/api/users/me', {
                            headers: { 'Authorization': `Bearer ${validBnxToken}` }
                        });
                        const bnxJson = await bnxRes.json().catch(() => ({}));
                        if (bnxRes.ok && (bnxJson.success || bnxJson.data)) {
                            const fetched = bnxJson.data || bnxJson;
                            // Only accept bnxData if email matches uEmail
                            if (!fetched.email || fetched.email.toLowerCase() === uEmail) {
                                bnxData = fetched;
                            }
                        }
                    } catch (e) {
                        console.warn('[AuthContext] BNX profile fetch notice:', e.message);
                    }
                }

                // Load stored accounts to verify against cross-account contamination
                let storedAccounts = [];
                try {
                    storedAccounts = JSON.parse(localStorage.getItem('cliks_multi_accounts') || '[]');
                } catch (e) {}

                const isOtherAccountName = (str) => {
                    if (!str) return false;
                    const lower = String(str).toLowerCase().trim();
                    return storedAccounts.some(other => {
                        if (!other || !other.email) return false;
                        const oEmail = other.email.toLowerCase();
                        if (oEmail === uEmail) return false;
                        const oPrefix = oEmail.split('@')[0];
                        const oUser = String(other.username || '').toLowerCase().trim();
                        const oDisp = String(other.displayName || other.name || '').toLowerCase().trim();
                        return lower === oPrefix || (oUser && lower === oUser) || (oDisp && lower === oDisp);
                    });
                };

                let dName = bnxData?.displayName || bnxData?.display_name || userData.displayName || userData.display_name || null;
                if (isOtherAccountName(dName)) dName = emailPrefix;

                let fName = bnxData?.fullName || bnxData?.full_name || userData.fullName || userData.full_name || null;
                if (isOtherAccountName(fName)) fName = null;

                let uName = userData.username || bnxData?.username || null;
                if (isOtherAccountName(uName)) uName = emailPrefix;

                const effectiveName = dName || fName || uName || userData.name || emailPrefix;

                // Resolve profile picture from BNX Mail profile: prepend https://api.bnxmail.com before /api
                const rawPicUrl = bnxData?.profilePictureUrl || bnxData?.profile_picture_url || userData.profilePictureUrl || userData.profile_picture_url || null;
                let bnxProfilePic = null;
                if (rawPicUrl) {
                    bnxProfilePic = rawPicUrl.startsWith('http') ? rawPicUrl : `https://api.bnxmail.com${rawPicUrl.startsWith('/') ? '' : '/'}${rawPicUrl}`;
                } else if (bnxData?.profilePicture || bnxData?.profile_picture) {
                    const picName = bnxData.username || uName || emailPrefix;
                    bnxProfilePic = `https://api.bnxmail.com/api/users/profile-picture/${encodeURIComponent(picName)}`;
                } else if (userData.avatar_url) {
                    bnxProfilePic = userData.avatar_url;
                }

                if (bnxProfilePic) {
                    localStorage.setItem('profile_photo', bnxProfilePic);
                }

                setUser(prev => {
                    const isSameUser = prev && prev.email && prev.email.toLowerCase() === uEmail;
                    const base = isSameUser ? prev : {};
                    const fullUser = {
                        ...base,
                        ...userData,
                        displayName: dName || effectiveName,
                        fullName: fName || effectiveName,
                        username: uName || effectiveName,
                        name: effectiveName,
                        email: uEmail,
                        profilePhoto: bnxProfilePic || (isSameUser ? (prev?.profilePhoto || localStorage.getItem('profile_photo')) : null) || null,
                        profilePictureUrl: bnxProfilePic || null
                    };
                    saveOrUpdateAccount({
                        id: fullUser.id,
                        email: fullUser.email,
                        displayName: fullUser.displayName,
                        fullName: fullUser.fullName,
                        name: fullUser.name,
                        username: fullUser.username,
                        role: fullUser.role || 'business',
                        tier: fullUser.tier || 'Free Plan',
                        token: token,
                        bnxToken: validBnxToken,
                        is_sub_id: fullUser.is_sub_id,
                        branch_id: fullUser.branch_id,
                        branch_name: fullUser.branch_name,
                        profilePhoto: fullUser.profilePhoto,
                        profilePictureUrl: fullUser.profilePictureUrl
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
            } else if (user.subscription_days_remaining !== undefined && user.subscription_days_remaining !== null) {
                remaining = user.subscription_days_remaining;
            } else if (user.created_at) {
                const totalDays = getPlanDuration(user.tier || 'Elite Suite');
                const start = new Date(user.created_at);
                const now = new Date();
                const diffTime = now.getTime() - start.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                remaining = Math.max(0, totalDays - diffDays);
            } else {
                remaining = 15;
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
    }, [user?.id, token]);

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
        let newUser = null;

        try {
            const data = await authService.ssoLogin(bnxToken, appType);
            if (data?.accessToken) accessToken = data.accessToken;
            if (data?.user) newUser = data.user;
        } catch (err) {
            console.warn('[SSO Notice] Backend SSO login error, trying token decode:', err.message);
            // Fallback to local token decoding ONLY if it contains a verified email identity
            const decoded = safeDecodeJwt(bnxToken);
            if (decoded) {
                const tokenEmail = (
                    decoded.email || 
                    decoded.user_email || 
                    (typeof decoded.sub === 'string' && decoded.sub.includes('@') ? decoded.sub : null) || 
                    decoded.user?.email || 
                    decoded.preferred_username
                );
                if (tokenEmail && tokenEmail.includes('@')) {
                    newUser = {
                        id: decoded.id || decoded.sub || 'sso-user',
                        name: decoded.name || decoded.username || tokenEmail.split('@')[0],
                        email: tokenEmail.toLowerCase().trim(),
                        role: decoded.role || (decoded.accountType === 'BUSINESS' ? 'business' : 'business'),
                        tier: 'Free Plan'
                    };
                }
            }
            if (!newUser) {
                throw new Error(err?.response?.data?.message || err?.message || 'Authentication failed: Could not verify user identity.');
            }
        }

        // CRITICAL CHECK: Reject or sanitize if email is invalid or user@cliks.com
        if (!newUser || !newUser.email || newUser.email === 'user@cliks.com') {
            const decoded = safeDecodeJwt(bnxToken);
            const realEmail = decoded?.email || 
                              decoded?.user_email || 
                              (typeof decoded?.sub === 'string' && decoded?.sub.includes('@') ? decoded.sub : null);
            if (realEmail && realEmail !== 'user@cliks.com') {
                newUser = {
                    ...(newUser || {}),
                    email: realEmail.toLowerCase().trim(),
                    name: decoded.name || decoded.username || realEmail.split('@')[0]
                };
            } else {
                throw new Error('Authentication failed: Invalid user session.');
            }
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

        // Resolve profile picture from BNX Mail profile: prepend https://api.bnxmail.com before /api
        const rawPicUrl = bnxData?.profilePictureUrl || bnxData?.profile_picture_url || null;
        let bnxProfilePic = null;
        if (rawPicUrl) {
            bnxProfilePic = rawPicUrl.startsWith('http') ? rawPicUrl : `https://api.bnxmail.com${rawPicUrl.startsWith('/') ? '' : '/'}${rawPicUrl}`;
        } else if (bnxData?.profilePicture || bnxData?.profile_picture) {
            const uName = bnxData.username || newUser.username || (newUser.email ? newUser.email.split('@')[0] : 'user');
            bnxProfilePic = `https://api.bnxmail.com/api/users/profile-picture/${encodeURIComponent(uName)}`;
        }

        newUser.displayName = ssoDisplayName;
        newUser.fullName = ssoFullName;
        newUser.name = ssoEffectiveName;
        if (bnxProfilePic) {
            newUser.profilePhoto = bnxProfilePic;
            newUser.profilePictureUrl = bnxProfilePic;
        }

        // Save BNX token into multi-account token store immediately under all aliases
        const tokenAliases = [
            newUser.email,
            newUser.username,
            bnxData?.email,
            bnxData?.username,
            getEmailFromToken(bnxToken)
        ].filter(Boolean);
        saveBnxTokenForAccount(bnxToken, tokenAliases);

        // Clear previous session storage keys before logging in a new user (preserve UI layout preferences, cliks_multi_accounts & multi-account BNX tokens)
        Object.keys(localStorage).forEach(key => {
            if (key !== 'cliks_dashboard_shortcuts' &&
                key !== 'cliks_multi_accounts' &&
                key !== 'cliks_bnx_tokens' &&
                !key.startsWith('bnx_token_') &&
                !key.startsWith('bnx_auth_token_') &&
                (key.startsWith('cliks_') || key.startsWith('books_') || key.startsWith('pos_'))) {
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
            profilePhoto: bnxProfilePic || null,
            profilePictureUrl: bnxProfilePic || null,
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
