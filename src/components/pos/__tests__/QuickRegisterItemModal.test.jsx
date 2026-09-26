import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuickRegisterItemModal from '../QuickRegisterItemModal';
import { productsService } from '../../../services';

// Mock productsService
vi.mock('../../../services', () => ({
    productsService: {
        createProduct: vi.fn(),
        updateProduct: vi.fn()
    },
    inventoryService: {
        updateItem: vi.fn()
    },
    hsnService: {
        searchHSN: vi.fn().mockResolvedValue([])
    }
}));

describe('QuickRegisterItemModal', () => {
    let queryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });
        queryClient.setQueryData(['pos-catalog'], [
            { id: 1, name: 'Existing Apple', sku: 'SKU-001', price: 10, quantity: 5 }
        ]);
    });

    const renderModal = (props = {}) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <QuickRegisterItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    currency={{ symbol: '₹' }}
                    dbWarehouses={[{ id: 'WH-1', name: 'Main Godown' }]}
                    {...props}
                />
            </QueryClientProvider>
        );
    };

    it('1. Numeric Parsing for Tax Rate: parses "18% GST" into numeric 18', async () => {
        productsService.createProduct.mockResolvedValueOnce({
            id: 101,
            name: 'Fresh Mango',
            selling_price: 50,
            tax_percentage: 18
        });

        renderModal();

        // Fill Item Name and Selling Price
        fireEvent.change(screen.getByPlaceholderText(/e\.g\. Tomato/i), { target: { value: 'Fresh Mango' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '50' } });
        fireEvent.change(screen.getByPlaceholderText('Qty left'), { target: { value: '10' } });

        // Check tax rate dropdown has default "18% GST"
        const taxSelect = screen.getByDisplayValue('18% GST');
        expect(taxSelect).toBeInTheDocument();

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Add to POS & List/i }));

        await waitFor(() => {
            expect(productsService.createProduct).toHaveBeenCalledTimes(1);
        });

        const sentPayload = productsService.createProduct.mock.calls[0][0];
        expect(sentPayload.tax_percentage).toBe(18);
        expect(sentPayload.taxRate).toBe(18);
        expect(typeof sentPayload.tax_percentage).toBe('number');
    });

    it('2. Sanitize Opening Stock for Unlimited Product: sets openingStock: 999999 and isUnlimited: true without display strings', async () => {
        productsService.createProduct.mockResolvedValueOnce({
            id: 102,
            name: 'Digital Service',
            selling_price: 199,
            quantity: 999999,
            isUnlimited: true
        });

        renderModal();

        fireEvent.change(screen.getByPlaceholderText(/e\.g\. Tomato/i), { target: { value: 'Digital Service' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '199' } });

        // Click Unlimited Product toggle
        const toggleBtn = screen.getByRole('button', { name: 'OFF' });
        fireEvent.click(toggleBtn);

        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        expect(screen.getByText('∞ Unlimited')).toBeInTheDocument();

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /Add to POS & List/i }));

        await waitFor(() => {
            expect(productsService.createProduct).toHaveBeenCalledTimes(1);
        });

        const sentPayload = productsService.createProduct.mock.calls[0][0];
        expect(sentPayload.isUnlimited).toBe(true);
        expect(sentPayload.openingStock).toBe(999999);
        expect(sentPayload.quantity).toBe(999999);
        expect(sentPayload.stock).toBe(999999);
        expect(typeof sentPayload.openingStock).toBe('number');
        expect(String(sentPayload.openingStock)).not.toContain('Unlimited');
    });

    it('3. Fallback Values for Required Attributes: category, unit, sku, barcode, and hsnCode fall back to standard defaults if left empty', async () => {
        productsService.createProduct.mockResolvedValueOnce({
            id: 103,
            name: 'Basic Item'
        });

        renderModal();

        // Only fill name and price, leave category, sku, hsn empty
        fireEvent.change(screen.getByPlaceholderText(/e\.g\. Tomato/i), { target: { value: 'Basic Item' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '25' } });
        fireEvent.change(screen.getByPlaceholderText('Qty left'), { target: { value: '5' } });

        // Clear category and barcode/sku input fields
        const categoryInput = screen.getByPlaceholderText('General');
        fireEvent.change(categoryInput, { target: { value: '   ' } });

        const skuInput = screen.getByDisplayValue(/^SKU-/);
        fireEvent.change(skuInput, { target: { value: '   ' } });

        const hsnInput = screen.getByPlaceholderText('e.g. 1006');
        fireEvent.change(hsnInput, { target: { value: '   ' } });

        fireEvent.click(screen.getByRole('button', { name: /Add to POS & List/i }));

        await waitFor(() => {
            expect(productsService.createProduct).toHaveBeenCalledTimes(1);
        });

        const payload = productsService.createProduct.mock.calls[0][0];
        expect(payload.category).toBe('General');
        expect(payload.unit).toBe('PCS');
        expect(payload.sku).toMatch(/^SKU-/);
        expect(payload.barcode).toBeTruthy();
        expect(payload.hsnCode).toBe('1006');
        expect(payload.hsn_code).toBe('1006');
    });

    it('4. Instant Update: on successful creation (200/201), pushes new product into active POS catalogue state and closes modal', async () => {
        const onCloseMock = vi.fn();
        const onSuccessMock = vi.fn();

        productsService.createProduct.mockResolvedValueOnce({
            id: 104,
            name: 'Instant Product',
            selling_price: 88,
            quantity: 20,
            sku: 'SKU-INSTANT'
        });

        renderModal({ onClose: onCloseMock, onSuccess: onSuccessMock });

        fireEvent.change(screen.getByPlaceholderText(/e\.g\. Tomato/i), { target: { value: 'Instant Product' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '88' } });
        fireEvent.change(screen.getByPlaceholderText('Qty left'), { target: { value: '20' } });

        fireEvent.click(screen.getByRole('button', { name: /Add to POS & List/i }));

        await waitFor(() => {
            expect(onCloseMock).toHaveBeenCalledTimes(1);
            expect(onSuccessMock).toHaveBeenCalledTimes(1);
        });

        // Check pos-catalog query cache
        const updatedCatalog = queryClient.getQueryData(['pos-catalog']);
        expect(updatedCatalog).toHaveLength(2);
        const addedItem = updatedCatalog.find(item => item.name === 'Instant Product');
        expect(addedItem).toBeDefined();
        expect(addedItem.price).toBe(88);
        expect(addedItem.quantity).toBe(20);
    });
});
