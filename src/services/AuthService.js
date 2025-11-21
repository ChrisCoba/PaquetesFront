import { API_BASE_URL } from './config.js';

export const AuthService = {
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const user = await response.json();
            // Save user session
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Register a new user
     * @param {Object} data - { email, password, nombre, apellido, claveAdmin }
     */
    async register(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getCurrentUser();
    }
};
