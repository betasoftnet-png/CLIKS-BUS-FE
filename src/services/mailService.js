import { apiClient } from '../api/client';

export const mailService = {
    bulkSend: async (payload) => {
        const token = localStorage.getItem('books_auth_token');
        console.log('[Mail Service] Initiating bulk send...');
        console.log('[Mail Service] Token:', token ? 'Exists (starts with ' + token.slice(0, 10) + '...)' : 'MISSING');
        console.log('[Mail Service] Payload:', JSON.stringify(payload, null, 2));

        try {
            // Using apiClient instead of axios to match project standards and resolve build errors
            const res = await apiClient.post('https://api.bnxmail.com/api/mail/bulk-send', payload);
            
            // apiClient returns res.data equivalent or the parsed JSON directly
            // In our apiClient.js, it returns response.json() or response.text()
            console.log('[Mail Service] Success Response:', res);
            return res;
        } catch (error) {
            console.error('[Mail Service] Bulk Send Error:', error.message || error);
            throw error;
        }
    }
};

export default mailService;
