import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { supportService } from '../services/supportService';
import { AuthContext } from './auth-context';


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('books_auth_token'));
    const [loading, setLoading] = useState(!!token);
    const queryClient = useQueryClient();

    const logout = React.useCallback(() => {
        localStorage.removeItem('books_auth_token');
        localStorage.removeItem('bnx_auth_token');
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
                    role: 'business'
                });
                setLoading(false);
                return;
            }

            try {
                const userData = await authService.getProfile();
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

    const ssoLogin = async (bnxToken, appType = null) => {
        const data = await authService.ssoLogin(bnxToken, appType);
        const { accessToken, user: newUser } = data;

        localStorage.setItem('books_auth_token', accessToken);
        localStorage.setItem('bnx_auth_token', bnxToken);
        setToken(accessToken);
        setUser(newUser);

        // Invalidate and refetch all queries to ensure new user data is loaded
        queryClient.invalidateQueries();

        return data;
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
            role: 'business'
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
        isAuthenticated: !!token
    };


    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
