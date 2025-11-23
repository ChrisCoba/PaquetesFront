import { AuthService } from '../services/AuthService.js';
import { API_BASE_URL } from '../services/config.js';

export const UserController = {
    init: () => {
        const user = AuthService.getCurrentUser();

        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }

        UserController.loadUserProfile();
        UserController.setupEventListeners();
    },

    setupEventListeners: () => {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', UserController.handleUpdateProfile);
        }
    },

    loadUserProfile: () => {
        const user = AuthService.getCurrentUser();

        if (!user) return;

        // Populate profile form fields
        const nameInput = document.getElementById('profile-name');
        const surnameInput = document.getElementById('profile-surname');
        const emailInput = document.getElementById('profile-email');
        const userIdDisplay = document.getElementById('user-id-display');

        if (nameInput) nameInput.value = user.Nombre || '';
        if (surnameInput) surnameInput.value = user.Apellido || '';
        if (emailInput) emailInput.value = user.Email || '';
        if (userIdDisplay) userIdDisplay.textContent = user.IdUsuario || 'N/A';

        // Update page title with user name
        const pageTitle = document.querySelector('.page-title h1');
        if (pageTitle) {
            pageTitle.textContent = `Perfil de ${user.Nombre || 'Usuario'}`;
        }
    },

    handleUpdateProfile: async (e) => {
        e.preventDefault();

        const user = AuthService.getCurrentUser();
        if (!user) return;

        const nombre = document.getElementById('profile-name').value;
        const apellido = document.getElementById('profile-surname').value;
        const email = document.getElementById('profile-email').value;
        const password = document.getElementById('profile-password').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Actualizando...';

            // Note: You'll need to implement the update user endpoint in the backend
            const payload = {
                IdUsuario: user.IdUsuario,
                Nombre: nombre,
                Apellido: apellido,
                Email: email
            };

            if (password) {
                payload.Password = password;
            }

            const response = await fetch(`${API_BASE_URL}/usuarios/${user.IdUsuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            // Update local storage with new data
            const updatedUser = { ...user, Nombre: nombre, Apellido: apellido, Email: email };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('¡Perfil actualizado exitosamente!');
            UserController.loadUserProfile();

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar el perfil: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    UserController.init();
});
