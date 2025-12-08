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
        const container = document.querySelector('#v-pills-reservations .list-group');
        if (!container) return;

        if (!reservas || reservas.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No tienes reservas aún.</div>';
            return;
        }

        container.innerHTML = reservas.map(reserva => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Reserva ${reserva.CodigoReserva || reserva.IdReserva}</h5>
                    <small>${new Date(reserva.FechaCreacion).toLocaleDateString('es-ES')}</small>
                </div>
                <p class="mb-1"><strong>Total:</strong> $${parseFloat(reserva.Total).toFixed(2)}</p>
                <p class="mb-1"><strong>Estado:</strong> ${reserva.Estado || 'Pendiente'}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small>ID: ${reserva.IdReserva}</small>
                    <button class="btn btn-sm btn-outline-primary btn-details" data-type="reserva" data-id="${reserva.IdReserva}">Ver Detalles</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const btnElem = btn;

                try {
                    btnElem.disabled = true;
                    btnElem.textContent = 'Cargando...';

                    const detalles = await ReservasService.getReservationDetails(id);
                    UserController.showDetailsModal('Detalles de Reserva', detalles);
                } catch (error) {
                    console.error('Error loading details:', error);
                    alert('Error al cargar los detalles de la reserva');
                } finally {
                    btnElem.disabled = false;
                    btnElem.textContent = 'Ver Detalles';
                }
            });
        });
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
        const tbody = document.querySelector('#v-pills-payments tbody');
        if (!tbody) return;

        if (facturas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tienes facturas aún.</td></tr>';
            return;
        }

        tbody.innerHTML = facturas.map(factura => `
            <tr>
                <td>${new Date(factura.FechaEmision).toLocaleDateString('es-ES')}</td>
                <td>Factura ${factura.NumeroFactura}</td>
                <td>$${parseFloat(factura.Total).toFixed(2)}</td>
                <td><span class="badge bg-success">Pagado</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-info btn-details-invoice" data-id="${factura.IdFactura}">Ver Detalles</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        tbody.querySelectorAll('.btn-details-invoice').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const factura = facturas.find(f => f.IdFactura == id);
                if (factura) UserController.showDetailsModal('Detalles de Factura', factura.Detalles);
            });
        });
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
