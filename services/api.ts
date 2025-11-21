const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001/api';

    const hostname = window.location.hostname;
    // If running locally, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }

    // If running on Vercel or other public domain, DO NOT default to localhost
    // This prevents the "Network Permission" prompt
    // Instead, use relative path (expecting backend on same origin) or a configured env var
    // If VITE_API_URL is not set, this will likely fail to connect if backend is not on same origin,
    // but it won't trigger the security prompt.
    return import.meta.env.VITE_API_URL || '/api';
};

const API_URL = getApiUrl();

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
