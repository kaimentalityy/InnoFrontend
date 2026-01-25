const BASE_URL = 'http://localhost:8080';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {

    login: async (username, password) => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    register: async (credentials) => {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Registration failed');
        }
        return res.json();
    },


    getItems: async () => {
        const res = await fetch(`${BASE_URL}/api/items`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },


    createOrder: async (orderData) => {
        const res = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    getOrders: async (userId) => {
        const res = await fetch(`${BASE_URL}/api/orders?userId=${userId}`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },


    getProfile: async (userId) => {
        const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    }
};
