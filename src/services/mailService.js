import axios from 'axios';

export const mailService = {
    bulkSend: async (payload) => {
        const token = localStorage.getItem('books_auth_token');
        console.log('[Mail Service] Initiating bulk send...');
        console.log('[Mail Service] Token:', token ? 'Exists (starts with ' + token.slice(0, 10) + '...)' : 'MISSING');
        console.log('[Mail Service] Payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post('https://api.bnxmail.com/api/mail/bulk-send', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('[Mail Service] Success Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('[Mail Service] Bulk Send Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default mailService;
