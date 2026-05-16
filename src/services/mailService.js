import axios from 'axios';

export const mailService = {
    bulkSend: async (payload) => {
        const token = localStorage.getItem('books_auth_token');
        try {
            const response = await axios.post('https://api.bnxmail.com/api/mail/bulk-send', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('[Mail Service] Bulk Send Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default mailService;
