import { AuthService } from '../services/AuthService.js';

export const AuthController = {
    init: () => {
        AuthController.setupEventListeners();
        AuthController.updateUI();
        AuthController.setupRealTimeValidation();
    },

    setupEventListeners: () => {
        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', AuthController.handleLogin);
        }

        // Register Form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', AuthController.handleRegister);
        }

        // Logout Button (delegation or direct if exists)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                e.preventDefault();
                AuthService.logout();
            }
        });
    },

    setupRealTimeValidation: () => {
        const identificacionInput = document.getElementById('identificacion');
        const correoInput = document.getElementById('correo');
        const contrasenaInput = document.getElementById('contrasena');

        if (identificacionInput) {
            // Restrict input to numbers only and max 10 digits
            identificacionInput.addEventListener('input', (e) => {
                // Remove any non-numeric characters
                e.target.value = e.target.value.replace(/\D/g, '');

                // Limit to 10 digits
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                }

                AuthController.validateIdentificacion();
            });

            identificacionInput.addEventListener('blur', AuthController.validateIdentificacion);
        }

        if (correoInput) {
            correoInput.addEventListener('input', AuthController.validateCorreo);
            correoInput.addEventListener('blur', AuthController.validateCorreo);
        }

        if (contrasenaInput) {
            contrasenaInput.addEventListener('input', AuthController.validateContrasena);
            contrasenaInput.addEventListener('blur', AuthController.validateContrasena);
        }
    },

    validateIdentificacion: () => {
        const input = document.getElementById('identificacion');
        const feedback = document.getElementById('identificacion-feedback');

        if (!input || !feedback) return true;

        const value = input.value;

        if (value.length === 0) {
            input.classList.remove('is-invalid', 'is-valid');
            feedback.style.display = 'none';
            return false;
        }

        if (!/^\d+$/.test(value)) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.textContent = 'Solo se permiten números.';
            feedback.style.display = 'block';
            return false;
        }

        if (value.length !== 10) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.textContent = `La identificación debe tener exactamente 10 dígitos (${value.length}/10).`;
            feedback.style.display = 'block';
            return false;
        }

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        feedback.style.display = 'none';
        return true;
    },

    validateCorreo: () => {
        const input = document.getElementById('correo');
        const feedback = document.getElementById('correo-feedback');

        if (!input || !feedback) return true;

        const value = input.value;

        if (value.length === 0) {
            input.classList.remove('is-invalid', 'is-valid');
            feedback.style.display = 'none';
            return false;
        }

        if (!/^[^@]+@[^@]+\.com$/.test(value)) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.textContent = 'El correo debe contener un "@" y terminar en ".com".';
            feedback.style.display = 'block';
            return false;
        }

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        feedback.style.display = 'none';
        return true;
    },

    validateContrasena: () => {
        const input = document.getElementById('contrasena');
        const feedback = document.getElementById('contrasena-feedback');

        if (!input || !feedback) return true;

        const value = input.value;

        if (value.length === 0) {
            input.classList.remove('is-invalid', 'is-valid');
            feedback.style.display = 'none';
            return false;
        }

        if (value.length < 8) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.textContent = `La contraseña debe tener al menos 8 caracteres (${value.length}/8).`;
            feedback.style.display = 'block';
            return false;
        }

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        feedback.style.display = 'none';
        return true;
    },

    handleLogin: async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = document.getElementById('correo').value;
        const password = document.getElementById('contrasena').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';

            await AuthService.login({ email, password });

            alert('¡Bienvenido!');
            window.location.href = '../index.html';
        } catch (error) {
            console.error(error);
            alert('Error al iniciar sesión: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ingresar';
        }
    },

    handleRegister: async (e) => {
        e.preventDefault();
        const form = e.target;

        const nombre = document.getElementById('nombres').value;
        const apellido = document.getElementById('apellidos').value;
        const identificacion = document.getElementById('identificacion').value;
        const email = document.getElementById('correo').value;
        const password = document.getElementById('contrasena').value;

        // Run all validations
        const isIdentificacionValid = AuthController.validateIdentificacion();
        const isCorreoValid = AuthController.validateCorreo();
        const isContrasenaValid = AuthController.validateContrasena();

        if (!isIdentificacionValid || !isCorreoValid || !isContrasenaValid) {
            alert('Por favor corrige los errores en el formulario antes de continuar.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';

            await AuthService.register({
                email,
                password,
                nombre,
                apellido,
                identificacion,
                claveAdmin: ''
            });

            alert('¡Registro exitoso! Por favor inicia sesión.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error(error);
            alert('Error en el registro: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    },

    updateUI: () => {
        const user = AuthService.getCurrentUser();
        const navMenu = document.querySelector('#navmenu ul');

        if (!navMenu) return;

        // Remove existing auth links to prevent duplicates if called multiple times
        const authLinks = navMenu.querySelectorAll('.auth-link');
        authLinks.forEach(link => link.remove());

        if (user) {
            // User is logged in
            const profileHtml = `
                <li class="dropdown auth-link"><a href="#"><span>Hola, ${user.Nombre}</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
                    <ul>
                        <li><a href="user.html">Mi Perfil</a></li>
                        ${user.Email === 'admin@agencia.local' ? '<li><a href="admin.html">Admin</a></li>' : ''}
                        <li><a href="#" id="logout-btn">Cerrar Sesión</a></li>
                    </ul>
                </li>
            `;
            navMenu.insertAdjacentHTML('beforeend', profileHtml);

            // Hide "Iniciar Sesión" link if it exists in the static HTML
            const loginLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.textContent.includes('Iniciar Sesión'));
            if (loginLink) loginLink.parentElement.style.display = 'none';

        } else {
            // User is logged out
            const loginLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.textContent.includes('Iniciar Sesión'));
            if (loginLink) loginLink.parentElement.style.display = 'block';
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AuthController.init();
});
