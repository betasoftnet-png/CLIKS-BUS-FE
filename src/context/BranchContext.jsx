import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth-context';
import { branchService } from '../services';
import { setActiveBranchHeader } from '../api/client';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    let queryClient = null;
    try {
        queryClient = useQueryClient();
    } catch (e) {
        // Safe fallback if mounted outside QueryClientProvider
    }

    const isSubId = Boolean(user && (user.is_sub_id === true || user.role === 'sub_id' || user.role === 'SUB_ID'));
    const userBranchId = user?.branch_id ? String(user.branch_id) : null;
    const userBranchName = user?.branch_name || null;

    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pure in-memory React state (no localStorage)
    const [selectedBranchId, setSelectedBranchId] = useState(() => {
        if (isSubId && userBranchId) {
            return userBranchId;
        }
        return 'all';
    });

    // Fetch showroom branches for the company
    const fetchBranches = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setIsLoading(true);
            const res = await branchService.getBranches();
            const list = Array.isArray(res) ? res : (res?.data || []);
            setBranches(list);
        } catch (err) {
            console.warn('[BranchContext] Error fetching branches:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // Keep in-memory request header and branch lock synchronized with auth state
    useEffect(() => {
        if (isSubId && userBranchId) {
            setSelectedBranchId(userBranchId);
            setActiveBranchHeader(userBranchId);
        } else {
            setActiveBranchHeader(selectedBranchId === 'all' ? null : selectedBranchId);
        }
    }, [isSubId, userBranchId, selectedBranchId]);

    // Switch branch function (Owner only, in-memory state)
    const switchBranch = useCallback((branchId) => {
        if (isSubId && userBranchId) {
            console.warn('[BranchContext] Showroom manager account is locked to their assigned branch');
            return;
        }

        const normalized = (!branchId || branchId === 'all') ? 'all' : String(branchId);
        setSelectedBranchId(normalized);
        setActiveBranchHeader(normalized === 'all' ? null : normalized);

        // Invalidate react-query caches so dashboard, reports, products, pos immediately reload
        if (queryClient) {
            queryClient.invalidateQueries();
        }
    }, [isSubId, userBranchId, queryClient]);

    // Resolved selected branch object
    const selectedBranch = useMemo(() => {
        if (selectedBranchId === 'all' || !selectedBranchId) {
            return {
                id: 'all',
                name: 'All Showrooms (Consolidated)',
                code: 'HQ',
                is_all: true
            };
        }
        const found = branches.find(b => String(b.id) === String(selectedBranchId));
        if (found) return found;

        // Fallback for sub-id if branches not loaded yet
        if (isSubId && userBranchName) {
            return {
                id: userBranchId,
                name: userBranchName,
                code: 'BR',
                is_assigned: true
            };
        }

        return {
            id: selectedBranchId,
            name: `Showroom #${selectedBranchId}`,
            code: 'BR'
        };
    }, [selectedBranchId, branches, isSubId, userBranchId, userBranchName]);

    const activeBranchId = useMemo(() => {
        if (selectedBranchId === 'all' || !selectedBranchId) return null;
        const parsed = parseInt(selectedBranchId, 10);
        return isNaN(parsed) ? null : parsed;
    }, [selectedBranchId]);

    const hasShowrooms = Array.isArray(branches) && branches.length > 0;

    const value = useMemo(() => ({
        branches,
        hasShowrooms,
        isLoading,
        isSubId,
        isLocked: isSubId && Boolean(userBranchId),
        selectedBranchId,
        activeBranchId,
        selectedBranch,
        activeBranchName: selectedBranch?.name || 'All Showrooms',
        switchBranch,
        refreshBranches: fetchBranches
    }), [branches, hasShowrooms, isLoading, isSubId, userBranchId, selectedBranchId, activeBranchId, selectedBranch, switchBranch, fetchBranches]);

    return (
        <BranchContext.Provider value={value}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        // Fallback gracefully if used outside provider
        return {
            branches: [],
            hasShowrooms: false,
            isLoading: false,
            isSubId: false,
            isLocked: false,
            selectedBranchId: 'all',
            activeBranchId: null,
            selectedBranch: { id: 'all', name: 'All Showrooms (Consolidated)', is_all: true },
            activeBranchName: 'All Showrooms',
            switchBranch: () => {},
            refreshBranches: () => {}
        };
    }
    return context;
};

export default BranchContext;
