import { AuthService } from '../services/AuthService.js';
import { API_BASE_URL } from '../services/config.js';
import { ReservasService } from '../services/ReservasService.js';
import { FacturasService } from '../services/FacturasService.js';

export const UserController = {
    init: () => {
        const user = AuthService.getCurrentUser();

        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }

        UserController.loadUserProfile();
        UserController.loadUserReservations();
        UserController.loadUserInvoices();
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
    },

    loadUserReservations: async () => {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        try {
            console.log('Loading reservations for user:', user.Email);
            const reservas = await ReservasService.getReservations();
            console.log('All reservations fetched:', reservas.length);

            // Filter reservations by user email
            // Check both ClienteEmail and potentially other fields if needed
            const userReservas = reservas.filter(r =>
                (r.ClienteEmail && r.ClienteEmail.toLowerCase() === user.Email.toLowerCase()) ||
                (r.Email && r.Email.toLowerCase() === user.Email.toLowerCase())
            );
            console.log('Filtered reservations for user:', userReservas.length);

            UserController.renderReservations(userReservas);
        } catch (error) {
            console.error('Error loading reservations:', error);
            UserController.renderReservations([]);
        }
    },

    renderReservations: (reservas) => {
        const container = document.querySelector('#v-pills-reservations .list-group');
        if (!container) return;

        if (!reservas || reservas.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No tienes reservas aún.</div>';
            return;
        }

        container.innerHTML = reservas.map(reserva => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Reserva ${reserva.Codigo || reserva.IdReserva}</h5>
                    <small>${new Date(reserva.FechaCreacion).toLocaleDateString('es-ES')}</small>
                </div>
                <p class="mb-1"><strong>Total:</strong> $${parseFloat(reserva.Total).toFixed(2)}</p>
                <p class="mb-1"><strong>Estado:</strong> ${reserva.Estado || 'Pendiente'}</p>
                <small>ID de Reserva: ${reserva.IdReserva}</small>
            </div>
        `).join('');
    },

    loadUserInvoices: async () => {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        try {
            console.log('Loading invoices for user:', user.Email);
            const facturas = await FacturasService.getInvoices();
            console.log('All invoices fetched:', facturas.length);

            // Filter invoices by user email
            // Assuming facturas have ClienteEmail or similar
            const userFacturas = facturas.filter(f =>
                (f.ClienteEmail && f.ClienteEmail.toLowerCase() === user.Email.toLowerCase()) ||
                (f.Email && f.Email.toLowerCase() === user.Email.toLowerCase())
            );
            console.log('Filtered invoices for user:', userFacturas.length);

            UserController.renderInvoices(userFacturas);
        } catch (error) {
            console.error('Error loading invoices:', error);
            UserController.renderInvoices([]);
        }
    },

    renderInvoices: (facturas) => {
        const tbody = document.querySelector('#v-pills-payments tbody');
        if (!tbody) return;

        if (facturas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No tienes facturas aún.</td></tr>';
            return;
        }

        tbody.innerHTML = facturas.map(factura => `
            <tr>
                <td>${new Date(factura.FechaEmision).toLocaleDateString('es-ES')}</td>
                <td>Factura ${factura.NumeroFactura}</td>
                <td>$${factura.Total.toFixed(2)}</td>
                <td><span class="badge bg-success">Pagado</span></td>
            </tr>
        `).join('');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    UserController.init();
});
