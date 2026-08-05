// Dedicated API client for Bit Tool Backend Calculator
// Operates completely independently from the main app api/client.js

const CALC_BASE_URL = import.meta.env.VITE_CALCULATOR_API_BASE_URL;

async function calcRequest(endpoint, options = {}) {
    const { method = 'GET', body = null } = options;
    
    const token = localStorage.getItem('bnx_auth_token');
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = {
        method,
        headers,
    };
    
    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }
    
    const url = `${CALC_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok && response.status !== 304) {
        let errMessage = 'Calculator API Error';
        try {
            const errBody = await response.json();
            errMessage = errBody.message || errMessage;
        } catch(e) {}
        throw new Error(errMessage);
    }
    
    if (response.status === 204) return null;
    return response.json();
}

const calcApi = {
    get: (endpoint) => calcRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => calcRequest(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => calcRequest(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => calcRequest(endpoint, { method: 'DELETE' }),
};

export const calculatorService = {
  getHistory: async () => {
    try {
        const res = await calcApi.get('/history');
        const data = res?.data;
        const rows = Array.isArray(data) ? data : data?.rows || [];
        
        // Map backend session shape to what CalcPopover expects
        return rows.map(r => {
          const tapeItems = r.items || [];
          // Compute the total from the last item in the tape
          const computedTotal = tapeItems.length > 0 
            ? Number(tapeItems[tapeItems.length - 1].runningTotal || tapeItems[tapeItems.length - 1].value) 
            : 0;

          return {
            ...r,
            id: r.id,
            timestamp: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (r.title || 'Saved'),
            total: computedTotal,
            tape: tapeItems.map(item => ({
              id: item.id,
              type: item.operator === '=' ? 'base' : item.operator,
              value: Number(item.value),
              label: item.label,
              runningAfter: Number(item.runningTotal)
            }))
          };
        });
    } catch (err) {
        console.error("Error fetching history:", err);
        return [];
    }
  },

  saveHistory: async (data) => {
    // data contains { tape: [...], total: number, timestamp: string, previousSessionId?: string }
    try {
        if (data.previousSessionId) {
            try {
                await calcApi.delete(`/sessions/${data.previousSessionId}`);
            } catch (err) {
                console.error("Failed to delete previous session snapshot", err);
            }
        }

        // 1. Create the session
        const sessionRes = await calcApi.post('/sessions', {
          title: `Tape - ${data.timestamp}`,
          mode: 'business',
          currency: 'INR'
        });
        
        let session = sessionRes?.data;
        if (!session || !session.id) {
            throw new Error("Failed to create calculator session.");
        }
        
        const sessionId = session.id;

        // 2. Add items sequentially to ensure correct recalculation and order
        const addedItems = [];
        for (let i = 0; i < data.tape.length; i++) {
            const item = data.tape[i];
            let op = item.type;
            if (op === 'base') op = '=';
            
            const payload = {
                sequence: i + 1,
                value: Number(item.value),
                operator: op,
                runningTotal: Number(item.runningAfter || item.value),
                label: item.label || ''
            };
            
            const itemRes = await calcApi.post(`/sessions/${sessionId}/items`, payload);
            addedItems.push(itemRes?.data);
        }

        return { ...session, items: addedItems };
    } catch (err) {
        console.error("Error saving calculator history:", err);
        throw err;
    }
  },

  deleteHistoryItem: async (id) => {
      const res = await calcApi.delete(`/sessions/${id}`);
      return res?.data;
  },

  clearHistory: async () => {
      const res = await calcApi.delete('/sessions');
      return res?.data;
  },
  
  // Expose specific getters for UI enhancements
  getSession: async (id) => {
      const res = await calcApi.get(`/sessions/${id}`);
      return res?.data;
  },
  
  // Compare Mode APIs
  getCompareHistory: async () => {
      try {
          const res = await calcApi.get('/compare/history');
          const data = res?.data;
          return Array.isArray(data) ? data : (data?.rows || []);
      } catch (err) {
          console.error("Error fetching compare history:", err);
          return [];
      }
  },
  getCompareSession: async (id) => {
      const res = await calcApi.get(`/compare/sessions/${id}`);
      return res?.data;
  },
  createCompareSession: async (data) => {
      const res = await calcApi.post('/compare/sessions', data);
      return res?.data;
  },
  addCompareItem: async (sessionId, data) => {
      const res = await calcApi.post(`/compare/sessions/${sessionId}/items`, data);
      return res?.data;
  },
  updateCompareItem: async (sessionId, itemId, data) => {
      const res = await calcApi.put(`/compare/sessions/${sessionId}/items/${itemId}`, data);
      return res?.data;
  },
  deleteCompareItem: async (sessionId, itemId) => {
      const res = await calcApi.delete(`/compare/sessions/${sessionId}/items/${itemId}`);
      return res?.data;
  }
};

export default calculatorService;
