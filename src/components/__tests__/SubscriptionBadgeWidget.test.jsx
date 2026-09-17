import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionBadgeWidget } from '../SubscriptionBadgeWidget';

describe('SubscriptionBadgeWidget Component', () => {
    it('CASE 1: renders single plan with shield icon, center titles, and right days badge', () => {
        const plans = [
            { module: 'BOOK', tier: 'GROWTH', days: 346 }
        ];
        const onNavigate = vi.fn();

        const { container } = render(
            <SubscriptionBadgeWidget plans={plans} onNavigate={onNavigate} />
        );

        // Verify module title and tier title
        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();

        // Verify days and label
        expect(screen.getByText('346')).toBeInTheDocument();
        expect(screen.getByText('DAYS')).toBeInTheDocument();

        // Verify click triggers onNavigate
        const widget = container.firstChild;
        fireEvent.click(widget);
        expect(onNavigate).toHaveBeenCalled();
    });

    it('CASE 2: renders two plans side-by-side with icon & days on top and titles centered below', () => {
        const plans = [
            { module: 'BOOK', tier: 'GROWTH', days: 346 },
            { module: 'FIN-PRO', tier: 'SOLO', days: 346 }
        ];

        render(<SubscriptionBadgeWidget plans={plans} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        expect(screen.getByText('FIN-PRO')).toBeInTheDocument();
        expect(screen.getByText('SOLO')).toBeInTheDocument();

        // Both cards should show 346 days
        const daysElements = screen.getAllByText('346');
        expect(daysElements).toHaveLength(2);
        const daysLabels = screen.getAllByText('DAYS');
        expect(daysLabels).toHaveLength(2);
    });

    it('CASE 3: renders three plans in 3 evenly spaced columns with days circle on top', () => {
        const plans = [
            { module: 'BOOK', tier: 'GROWTH', days: 346 },
            { module: 'FIN-PRO', tier: 'SOLO', days: 346 },
            { module: 'PLD', tier: 'BASIC', days: 346 }
        ];

        render(<SubscriptionBadgeWidget plans={plans} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        expect(screen.getByText('FIN-PRO')).toBeInTheDocument();
        expect(screen.getByText('SOLO')).toBeInTheDocument();
        expect(screen.getByText('PLD')).toBeInTheDocument();
        expect(screen.getByText('BASIC')).toBeInTheDocument();

        const daysElements = screen.getAllByText('346');
        expect(daysElements).toHaveLength(3);
    });

    it('CASE 4: renders four plans in 4 compact columns with tight formatting', () => {
        const plans = [
            { module: 'BOOK', tier: 'GROWTH', days: 346 },
            { module: 'FIN-PRO', tier: 'SOLO', days: 346 },
            { module: 'PLD', tier: 'BASIC', days: 346 },
            { module: 'PLD', tier: 'innovators', days: 11 }
        ];

        render(<SubscriptionBadgeWidget plans={plans} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        expect(screen.getByText('FIN-PRO')).toBeInTheDocument();
        expect(screen.getByText('SOLO')).toBeInTheDocument();
        const pldElements = screen.getAllByText('PLD');
        expect(pldElements).toHaveLength(2);
        expect(screen.getByText('BASIC')).toBeInTheDocument();
        expect(screen.getByText('innovators')).toBeInTheDocument();

        expect(screen.getAllByText('346')).toHaveLength(3);
        expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('Data Mapping: dynamically calculates days remaining from expires_at / end_date', () => {
        const futureDate = new Date(Date.now() + 120 * 86400000).toISOString();
        const user = {
            active_plans: [
                { module: 'BOOK', tier: 'GROWTH', expires_at: futureDate }
            ]
        };

        render(<SubscriptionBadgeWidget user={user} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        // Should calculate approximately 120 days
        const daysText = screen.getByText(/120|119/);
        expect(daysText).toBeInTheDocument();
    });

    it('Fallback: handles missing or empty plans safely with defaults', () => {
        render(<SubscriptionBadgeWidget user={{}} planDaysRemaining={346} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        expect(screen.getByText('346')).toBeInTheDocument();
    });

    it('Strict Scoping: renders ONLY 1 badge for a user with only 1 active plan, ignoring any legacy localStorage keys', () => {
        localStorage.setItem('cliks_finpro_active', 'true');
        localStorage.setItem('cliks_investor_active', 'true');
        localStorage.setItem('cliks_poster_active', 'true');

        const singlePlanUser = {
            active_plans: [
                { module: 'BOOK', tier: 'GROWTH', days: 346 }
            ]
        };

        render(<SubscriptionBadgeWidget user={singlePlanUser} />);

        expect(screen.getByText('BOOK')).toBeInTheDocument();
        expect(screen.getByText('GROWTH')).toBeInTheDocument();
        expect(screen.queryByText('FIN-PRO')).not.toBeInTheDocument();
        expect(screen.queryByText('PLD')).not.toBeInTheDocument();

        localStorage.clear();
    });
});
