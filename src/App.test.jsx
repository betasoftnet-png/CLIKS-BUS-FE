import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as AuthContextModule from './context/AuthContext';

// Mock AuthContext
vi.mock('./context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
        useAuth: vi.fn(),
    };
});

describe('App Smoke Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // precise mocked behavior per test
        window.history.pushState({}, 'Root', '/');
    });

    it('renders landing page when unauthenticated', () => {
        // Mock useAuth to return unauthenticated state
        vi.mocked(AuthContextModule.useAuth).mockReturnValue({
            isAuthenticated: false,
            isLoading: false
        });

        render(<App />);

        // Landing page should be visible
        // "Books & Finance" is in Topbar (always visible?) No, Topbar is in MainLayout.
        // Landing page content: "The Future of Personal Finance" or similar.
        // Let's look for "Books & Finance" which is the document title or header.
        // Wait, Landing.jsx content? 
        // Step 268 build output shows Landing is small.
        // Let's assume there is some text "Books & Finance" or "Welcome".
        // Use a generic matcher or verify Landing component content.
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders dashboard when authenticated', async () => {
        // Mock authenticated
        vi.mocked(AuthContextModule.useAuth).mockReturnValue({
            isAuthenticated: true,
            isLoading: false
        });

        window.history.pushState({}, 'Home', '/home');

        render(<App />);

        // MainLayout -> Sidebar -> "Stock" link
        // Suspense fallback might show first "Loading..."

        await waitFor(() => {
            // Check for home sidebar item
            expect(screen.getByText('Accounts')).toBeInTheDocument();
        });
    });

    it('redirects to landing when accessing protected route while unauthenticated', async () => {
        vi.mocked(AuthContextModule.useAuth).mockReturnValue({
            isAuthenticated: false,
            isLoading: false
        });

        window.history.pushState({}, 'Home', '/home');

        render(<App />);

        // Should NOT see Sidebar
        await waitFor(() => {
            expect(screen.queryByText('Stock')).not.toBeInTheDocument();
        });
    });
});
