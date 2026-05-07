/**
 * React Query Client Configuration
 * 
 * Centralized QueryClient setup with production-ready defaults.
 * Import this client to use with QueryClientProvider.
 */

import { QueryClient } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Default Options
// ---------------------------------------------------------------------------

/**
 * Default query options for all queries.
 * Can be overridden per-query.
 */
const defaultQueryOptions = {
    queries: {
        // Data is considered fresh for 5 minutes
        // Prevents unnecessary refetches when switching between pages
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Keep unused data in cache for 30 minutes
        // Allows instant display when revisiting pages
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)

        // Retry failed requests up to 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on window focus in development (less noise)
        // Enable in production for fresher data
        refetchOnWindowFocus: import.meta.env.PROD,

        // Don't refetch when network reconnects (can be enabled per-query if needed)
        refetchOnReconnect: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
    },
    mutations: {
        // Retry mutations once (mutations are often not idempotent, so be cautious)
        retry: 1,
    },
};

// ---------------------------------------------------------------------------
// Query Client Instance
// ---------------------------------------------------------------------------

/**
 * The QueryClient instance.
 * Use this with QueryClientProvider at the app root.
 * 
 * @example
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClient } from '@/lib/queryClient';
 * 
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 */
export const queryClient = new QueryClient({
    defaultOptions: defaultQueryOptions,
});

// ---------------------------------------------------------------------------
// Query Keys Factory
// ---------------------------------------------------------------------------

/**
 * Centralized query key factory.
 * Ensures consistent cache keys across the application.
 * 
 * Pattern: [domain, entity, ...params]
 * 
 * @example
 * queryKeys.stock.all        // ['stock']
 * queryKeys.stock.list()     // ['stock', 'list']
 * queryKeys.stock.detail(1)  // ['stock', 'detail', 1]
 */
export const queryKeys = {
    // Stock/Assets domain
    stock: {
        all: ['stock'],
        list: (filters) => ['stock', 'list', filters].filter(Boolean),
        detail: (id) => ['stock', 'detail', id],
        stats: () => ['stock', 'stats'],
    },

    // Transactions domain
    transactions: {
        all: ['transactions'],
        list: (filters) => ['transactions', 'list', filters].filter(Boolean),
        detail: (id) => ['transactions', 'detail', id],
    },

    // Accounts domain
    accounts: {
        all: ['accounts'],
        list: () => ['accounts', 'list'],
        detail: (id) => ['accounts', 'detail', id],
        balance: (id) => ['accounts', 'balance', id],
    },

    // Budgets domain
    budgets: {
        all: ['budgets'],
        list: (filters) => ['budgets', 'list', filters].filter(Boolean),
        detail: (id) => ['budgets', 'detail', id],
    },

    // People domain
    people: {
        all: ['people'],
        list: (filters) => ['people', 'list', filters].filter(Boolean),
        detail: (id) => ['people', 'detail', id],
        transactions: (personId) => ['people', 'transactions', personId],
    },

    // User domain
    user: {
        profile: () => ['user', 'profile'],
        settings: () => ['user', 'settings'],
    },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default queryClient;
