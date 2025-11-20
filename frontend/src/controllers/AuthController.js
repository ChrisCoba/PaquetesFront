import { AuthService } from '../services/AuthService.js';

export const AuthController = {
    init: () => {
        const loginForm = document.querySelector('form[action="login"]'); // Adjust selector based on HTML
        const registerForm = document.querySelector('form[action="register"]'); // Adjust selector based on HTML

        // Fallback selectors if action attribute isn't set
        const genericForms = document.querySelectorAll('.booking-form form');

        if (window.location.pathname.includes('login.html')) {
            const form = loginForm || genericForms[0];
            if (form) {
                form.addEventListener('submit', AuthController.handleLogin);
            }
        }

        if (window.location.pathname.includes('register.html')) {
            const form = registerForm || genericForms[0];
            if (form) {
                form.addEventListener('submit', AuthController.handleRegister);
            }
        }
    },

    handleLogin: async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const response = await AuthService.login({ email, password });

            // Store user info/token
            // Assuming response might contain user info or just success
            localStorage.setItem('user', JSON.stringify({ email, ...response }));

            alert('Login successful!');
            window.location.href = '../index.html';
        } catch (error) {
            console.error(error);
            alert('Login failed: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ingresar';
        }
    },

    handleRegister: async (e) => {
        e.preventDefault();
        const form = e.target;
        // Assuming register form has these fields. Adjust based on actual HTML.
        const nombre = form.querySelector('input[name="nombre"]')?.value || 'User';
        const apellido = form.querySelector('input[name="apellido"]')?.value || 'Name';
        const correo = form.querySelector('input[type="email"]').value;
        // External registration usually doesn't take password in this API spec? 
        // Spec says: UsuarioExternoRequest: bookingUserId, nombre, apellido, correo
        // But usually register forms have password. 
        // If this is for "CrearUsuario" (internal), it needs password.
        // Let's assume it's creating an external user for booking for now, or we might need to clarify.
        // However, standard register usually implies creating an account with password.
        // The API has /usuarios (internal) and /usuarios/externo.
        // Let's try to use the internal one if there is a password field, otherwise external.

        const passwordInput = form.querySelector('input[type="password"]');

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';

            if (passwordInput) {
                // Internal user registration
                await AuthService.register({
                    email: correo,
                    password: passwordInput.value,
                    nombre,
                    apellido,
                    claveAdmin: '' // Default empty
                });
            } else {
                // External user (just for booking?)
                await AuthService.registerExternal({
                    bookingUserId: crypto.randomUUID(), // Generate a ID
                    nombre,
                    apellido,
                    correo
                });
            }

            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error(error);
            alert('Registration failed: ' + error.message);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthController.init();
});
