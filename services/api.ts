const API_URL = 'http://localhost:3001/api';

export const api = {
    login: async (username, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    register: async (username, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.text();
    },

    getCredentials: async (token) => {
        const res = await fetch(`${API_URL}/credentials`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch credentials');
        return res.json();
    },

    getAdminCredentials: async (token) => {
        const res = await fetch(`${API_URL}/admin/credentials`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch admin credentials');
        return res.json();
    },

    getCredential: async (token, id) => {
        const res = await fetch(`${API_URL}/credentials/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch credential');
        return res.json();
    },

    addCredential: async (token, credential) => {
        const res = await fetch(`${API_URL}/admin/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(credential)
        });
        if (!res.ok) throw new Error('Failed to add credential');
        return res.text();
    },

    deleteCredential: async (token, id) => {
        const res = await fetch(`${API_URL}/admin/credentials/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete credential');
    },

    saveAnalysis: async (token, type, data) => {
        const res = await fetch(`${API_URL}/analyses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, data })
        });
        if (!res.ok) throw new Error('Failed to save analysis');
    },

    getAnalyses: async (token) => {
        const res = await fetch(`${API_URL}/analyses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analyses');
        return res.json();
    }
};
