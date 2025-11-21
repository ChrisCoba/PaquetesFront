import { AuthService } from '../services/AuthService.js';

export const AuthController = {
    init: () => {
        AuthController.setupEventListeners();
        AuthController.updateUI();
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
        const email = document.getElementById('correo').value;
        const password = document.getElementById('contrasena').value;

        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';

            await AuthService.register({
                email,
                password,
                nombre,
                apellido,
                claveAdmin: '' // Optional
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
                        <li><a href="#">Mi Perfil</a></li>
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
