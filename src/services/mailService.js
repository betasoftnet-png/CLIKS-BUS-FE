export const mailService = {
    bulkSend: async (payload) => {
        // BNX Mail API requires the original bnx_auth_token
        const token = localStorage.getItem('bnx_auth_token') || localStorage.getItem('books_auth_token');
        
        console.log('[Mail Service] Initiating bulk send...');
        console.log('[Mail Service] Using BNX Token:', token ? 'Exists (starts with ' + token.slice(0, 10) + '...)' : 'MISSING');
        console.log('[Mail Service] Payload:', JSON.stringify(payload, null, 2));

        if (!token) {
            throw new Error('Authentication token missing. Please re-login to synchronize mail services.');
        }

        try {
            // Using direct fetch to have full control over headers for external BNX API
            const response = await fetch('https://api.bnxmail.com/api/mail/bulk-send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Mail API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('[Mail Service] Success Response:', data);
            return data;
        } catch (error) {
            console.error('[Mail Service] Bulk Send Error:', error.message);
            throw error;
        }
    }
};

export default mailService;
