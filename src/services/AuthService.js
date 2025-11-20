import { API_BASE_URL } from './config';

export const AuthService = {
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error('Login failed');
        // Note: API might return just 200 OK or a token. Adjust based on actual response if needed.
        // If it returns JSON, parse it. If just status, return true.
        // Assuming JSON for now based on typical patterns, but the spec said "200 Login exitoso" without explicit content.
        // Let's return the response object or text if JSON fails.
        try {
            return await response.json();
        } catch (e) {
            return { success: true };
        }
    },

    /**
     * Register a new internal user
     * @param {Object} data - { email, password, nombre, apellido, claveAdmin }
     */
    async register(data) {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Registration failed');
        try {
            return await response.json();
        } catch (e) {
            return { success: true };
        }
    },

    /**
     * Register a new external user
     * @param {Object} data - { bookingUserId, nombre, apellido, correo }
     */
    async registerExternal(data) {
        const response = await fetch(`${API_BASE_URL}/usuarios/externo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('External registration failed');
        return response.json();
    }
};
