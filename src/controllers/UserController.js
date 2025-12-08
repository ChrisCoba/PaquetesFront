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
            // Usar ID o IdUsuario dependiendo de qué campo esté disponible
            const userId = user.Id || user.IdUsuario;

            if (!userId) {
                console.error('User ID not found');
                UserController.renderReservations([]);
                return;
            }

            console.log('Loading reservations for user ID:', userId);

            // Usar el nuevo endpoint que filtra por usuario en el backend
            const userReservas = await ReservasService.getReservationsByUser(userId);
            console.log('Reservations fetched for user:', userReservas.length);

            // Sort by date descending (newest first)
            userReservas.sort((a, b) => new Date(b.FechaCreacion) - new Date(a.FechaCreacion));

            UserController.renderReservations(userReservas);
        } catch (error) {
            console.error('Error loading reservations:', error);
            UserController.renderReservations([]);
        }
    },

    renderReservations: (reservas) => {
        console.log('renderReservations called with:', reservas);
        const container = document.querySelector('#v-pills-reservations .list-group');
        console.log('Container found:', container);

        if (!container) {
            console.error('Container #v-pills-reservations .list-group not found!');
            return;
        }

        if (!reservas || reservas.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No tienes reservas aún.</div>';
            return;
        }

        const html = reservas.map(reserva => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Reserva ${reserva.CodigoReserva || reserva.IdReserva}</h5>
                    <small>${new Date(reserva.FechaCreacion).toLocaleDateString('es-ES')}</small>
                </div>
                <p class="mb-1"><strong>Total:</strong> $${parseFloat(reserva.Total).toFixed(2)}</p>
                <p class="mb-1"><strong>Estado:</strong> ${reserva.Estado || 'Pendiente'}</p>
                <small>ID: ${reserva.IdReserva}</small>
            </div>
        `).join('');

        console.log('Generated HTML:', html);
        container.innerHTML = html;
        console.log('HTML set to container');
    },

    loadUserInvoices: async () => {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        try {
            // Usar ID o IdUsuario dependiendo de qué campo esté disponible
            const userId = user.Id || user.IdUsuario;

            if (!userId) {
                console.error('User ID not found');
                UserController.renderInvoices([]);
                return;
            }

            console.log('Loading invoices for user ID:', userId);

            // Usar el nuevo endpoint que filtra por usuario en el backend
            const userFacturas = await FacturasService.getInvoicesByUser(userId);
            console.log('Invoices fetched for user:', userFacturas.length);

            UserController.renderInvoices(userFacturas);
        } catch (error) {
            console.error('Error loading invoices:', error);
            UserController.renderInvoices([]);
        }
    },

    renderInvoices: (facturas) => {
        console.log('renderInvoices called with:', facturas);
        const container = document.querySelector('#v-pills-payments .list-group');
        console.log('Invoices container found:', container);

        if (!container) {
            console.error('Container #v-pills-payments .list-group not found!');
            return;
        }

        if (!facturas || facturas.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No tienes facturas aún.</div>';
            return;
        }

        const html = facturas.map(factura => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Factura ${factura.Numero || factura.NumeroFactura}</h5>
                    <small>${new Date(factura.FechaEmision).toLocaleDateString('es-ES')}</small>
                </div>
                <p class="mb-1"><strong>Total:</strong> $${parseFloat(factura.Total).toFixed(2)}</p>
                <p class="mb-1"><strong>Estado:</strong> <span class="badge bg-success">Pagado</span></p>
                <small>ID: ${factura.IdFactura}</small>
            </div>
        `).join('');

        console.log('Generated invoices HTML:', html);
        container.innerHTML = html;
        console.log('Invoices HTML set to container');
    },

    showDetailsModal: (title, detalles) => {
        // Remove existing modal if any
        const existingModal = document.getElementById('detailsModal');
        if (existingModal) existingModal.remove();

        const modalHtml = `
            <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Servicio ID</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Subtotal</th>
                                            <th>Fechas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${detalles && detalles.length > 0 ? detalles.map(d => `
                                            <tr>
                                                <td>${d.ServicioId}</td>
                                                <td>${d.Cantidad}</td>
                                                <td>$${parseFloat(d.PrecioUnitario).toFixed(2)}</td>
                                                <td>$${parseFloat(d.Subtotal).toFixed(2)}</td>
                                                <td>${new Date(d.FechaInicio).toLocaleDateString()} - ${new Date(d.FechaFin).toLocaleDateString()}</td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="5" class="text-center">No hay detalles disponibles</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    UserController.init();
});
