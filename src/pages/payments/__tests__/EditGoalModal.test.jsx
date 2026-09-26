import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditGoalModal from '../EditGoalModal';

describe('EditGoalModal - Target Amount Validation', () => {
    const mockWallet = {
        id: 'w-1',
        name: 'Office Equipment',
        current_amount: 5000,
        target_amount: 10000,
        description: 'New monitors and chairs'
    };

    it('sets min={savedAllocated} and populates current target', () => {
        render(<EditGoalModal wallet={mockWallet} isOpen={true} />);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('min', '5000');
        expect(input).toHaveValue(10000);
    });

    it('blocks negative and exponential keys (-, +, e, E)', () => {
        render(<EditGoalModal wallet={mockWallet} isOpen={true} />);
        
        const input = screen.getByRole('spinbutton');
        const preventDash = fireEvent.keyDown(input, { key: '-' });
        const preventPlus = fireEvent.keyDown(input, { key: '+' });
        const preventE = fireEvent.keyDown(input, { key: 'e' });
        const preventUpperE = fireEvent.keyDown(input, { key: 'E' });

        expect(preventDash).toBe(false);
        expect(preventPlus).toBe(false);
        expect(preventE).toBe(false);
        expect(preventUpperE).toBe(false);
    });

    it('disables submit button and shows error banner when targetAmount < savedAllocated', () => {
        const onSave = vi.fn();
        render(<EditGoalModal wallet={mockWallet} isOpen={true} onSave={onSave} />);
        
        const input = screen.getByRole('spinbutton');
        const submitBtn = screen.getByRole('button', { name: /save changes/i });

        // Enter amount lower than savedAllocated (5000)
        fireEvent.change(input, { target: { value: '3000' } });

        expect(submitBtn).toBeDisabled();
        expect(screen.getByText('The target amount cannot be less than the amount already saved.')).toBeInTheDocument();

        // Attempting submit should not call onSave
        fireEvent.click(submitBtn);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('enables submit button and allows submit when targetAmount >= savedAllocated', () => {
        const onSave = vi.fn();
        render(<EditGoalModal wallet={mockWallet} isOpen={true} onSave={onSave} />);
        
        const input = screen.getByRole('spinbutton');
        const submitBtn = screen.getByRole('button', { name: /save changes/i });

        fireEvent.change(input, { target: { value: '6000' } });

        expect(submitBtn).toBeEnabled();
        expect(screen.queryByText('The target amount cannot be less than the amount already saved.')).not.toBeInTheDocument();

        fireEvent.click(submitBtn);
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            target_amount: 6000
        }));
    });
});
