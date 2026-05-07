/**
 * API Module Barrel Export
 * 
 * Central export point for all API-related utilities.
 * Import from '@/api' instead of individual files.
 */

export { ApiError } from './errors';
export { apiClient } from './client';

// Default export for convenience
export { default } from './client';
