import { API_BASE_URL, USE_SOAP } from './config.js';
import { SoapClient } from './soap/SoapClient';

const AuthServiceRest = {
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(data) {
        try {
            const payload = {
                Email: data.email,
                Password: data.password,
                Nombre: data.nombre,
                Apellido: data.apellido,
                ClaveAdmin: data.claveAdmin || ''
            };

            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
    }
};

const AuthServiceSoap = {
    async login(credentials) {
        try {
            const soapParams = {
                email: credentials.email,
                password: credentials.password
            };

            const user = await SoapClient.call('Login', soapParams);

            if (!user) throw new Error('Invalid credentials');

            // Normalize user object if needed (SoapClient returns strings)
            // Assuming UsuarioDto structure: Id, Email, Nombre, Apellido, EsAdmin
            // We might need to convert EsAdmin to boolean if the app relies on it strictly
            if (user.EsAdmin === 'true') user.EsAdmin = true;
            if (user.EsAdmin === 'false') user.EsAdmin = false;

            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('SOAP Login error:', error);
            throw error;
        }
    },

    async register(data) {
        try {
            const soapParams = {
                email: data.email,
                password: data.password,
                nombre: data.nombre,
                apellido: data.apellido
                // Note: ClaveAdmin logic might be missing in SOAP backend if I didn't add it explicitly to logic/service
            };

            const user = await SoapClient.call('CrearUsuario', soapParams);
            return user;
        } catch (error) {
            console.error('SOAP Registration error:', error);
            throw error;
        }
    }
};

export const AuthService = {
    login: (credentials) => USE_SOAP.value ? AuthServiceSoap.login(credentials) : AuthServiceRest.login(credentials),
    register: (data) => USE_SOAP.value ? AuthServiceSoap.register(data) : AuthServiceRest.register(data),

    logout() {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    }
};
