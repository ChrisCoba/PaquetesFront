import { AdminService } from '../services/AdminService.js';

export const AdminController = {
    init: () => {
        AdminController.setupNavigation();
        AdminController.setupForms();
        // Load default view (e.g., Users) or just wait for user interaction
    },

    setupNavigation: () => {
        const navLinks = document.querySelectorAll('[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('data-view');
                AdminController.switchView(viewId);
            });
        });

        const backButton = document.querySelector('.btn-back-to-dashboard');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('management-views-container').style.display = 'none';
                document.getElementById('dashboard-view').style.display = 'block';
            });
        }
    },

    switchView: (viewId) => {
        // Hide dashboard
        document.getElementById('dashboard-view').style.display = 'none';

        // Show management container
        document.getElementById('management-views-container').style.display = 'block';

        // Hide all specific views
        document.querySelectorAll('.management-view').forEach(view => {
            view.style.display = 'none';
        });

        // Show selected view
        const selectedView = document.getElementById(viewId);
        if (selectedView) {
            selectedView.style.display = 'block';

            // Load data based on view
            if (viewId === 'user-manage-view') {
                AdminController.loadUsers();
            } else if (viewId === 'tour-manage-view') {
                AdminController.loadTours();
            } else if (viewId === 'destination-manage-view') {
                AdminController.loadDestinations();
            } else if (viewId === 'reservation-manage-view') {
                AdminController.loadReservations();
            } else if (viewId === 'payment-view-view') {
                AdminController.loadInvoices();
            }
        }
    },

    setupForms: () => {
        // User Create Form
        const userForm = document.querySelector('#user-create-view form');
        if (userForm) {
            userForm.addEventListener('submit', AdminController.handleCreateUser);
        }

        // Tour Create Form
        const tourForm = document.querySelector('#tour-create-view form');
        if (tourForm) {
            tourForm.addEventListener('submit', AdminController.handleCreateTour);
        }
    },

    // --- Users ---
    loadUsers: async () => {
        const tbody = document.querySelector('#user-manage-view tbody');
        tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

        try {
            const users = await AdminService.getUsers();
            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.IdUsuario || user.Id}</td>
                    <td>${user.Nombre} ${user.Apellido}</td>
                    <td>${user.Email || user.Correo}</td>
                    <td>
                        <button class="btn btn-sm btn-info">Editar</button>
                        <button class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users: ${error.message}</td></tr>`;
        }
    },

    handleCreateUser: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const userData = {
            Nombre: document.getElementById('userName').value,
            Apellido: document.getElementById('userSurname').value,
            Email: document.getElementById('userEmail').value,
            Password: document.getElementById('userPassword').value,
            ClaveAdmin: document.getElementById('userAdminKey')?.value || ''
        };

        try {
            submitBtn.disabled = true;
            await AdminService.createUser(userData);
            alert('Usuario creado exitosamente');
            form.reset();
            AdminController.switchView('user-manage-view');
        } catch (error) {
            alert('Error al crear usuario: ' + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    },

    // --- Tours ---
    loadTours: async () => {
        const tbody = document.querySelector('#tour-manage-view tbody');
        tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

        try {
            const tours = await AdminService.getTours();
            tbody.innerHTML = '';
            tours.forEach(tour => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tour.IdPaquete}</td>
                    <td>${tour.Nombre}</td>
                    <td>${tour.Ciudad}</td>
                    <td>$${tour.PrecioActual}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="alert('Editar tour en desarrollo')">Editar</button>
                        <button class="btn btn-sm btn-danger btn-delete-tour" data-id="${tour.IdPaquete}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.btn-delete-tour').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('¿Está seguro de eliminar este tour?')) {
                        const id = e.target.getAttribute('data-id');
                        try {
                            await AdminService.deleteTour(id);
                            alert('Tour eliminado');
                            AdminController.loadTours();
                        } catch (error) {
                            alert('Error al eliminar tour: ' + error.message);
                        }
                    }
                });
            });

        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading tours: ${error.message}</td></tr>`;
        }
    },

    handleCreateTour: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const tourData = {
            Nombre: document.getElementById('tourName').value,
            Codigo: 'TOUR-' + Math.floor(Math.random() * 10000), // Auto-generate or ask user
            CiudadId: document.getElementById('tourDestination').value, // Assuming input is City Name for now, backend might need ID
            TipoActividad: 'General',
            PrecioBase: parseFloat(document.getElementById('tourPrice').value),
            CupoMaximo: 20,
            DuracionDias: 3,
            ImagenUrl: 'https://via.placeholder.com/300'
        };

        try {
            submitBtn.disabled = true;
            await AdminService.createTour(tourData);
            alert('Tour creado exitosamente');
            form.reset();
            AdminController.switchView('tour-manage-view');
        } catch (error) {
            alert('Error al crear tour: ' + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    },

    // --- Destinations (Derived) ---
    loadDestinations: async () => {
        const tbody = document.querySelector('#destination-manage-view tbody');
        tbody.innerHTML = '<tr><td colspan="2">Cargando...</td></tr>';

        try {
            const tours = await AdminService.getTours();
            const cities = [...new Set(tours.map(t => t.Ciudad))];

            tbody.innerHTML = '';
            cities.forEach((city, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${city}</td>
                    <td>
                         <span class="badge bg-secondary">Read Only</span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-danger">Error loading destinations: ${error.message}</td></tr>`;
        }
    },

    // --- Reservations ---
    loadReservations: async () => {
        const tbody = document.querySelector('#reservation-manage-view tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

        try {
            const reservations = await AdminService.getReservations();
            tbody.innerHTML = '';
            reservations.forEach(res => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${res.IdReserva}</td>
                    <td>${res.NombreContacto}</td>
                    <td>${new Date(res.FechaViaje).toLocaleDateString()}</td>
                    <td>${res.Estado}</td>
                    <td>$${res.MontoTotal}</td>
                    <td>
                        ${res.Estado !== 'Cancelada' ? `<button class="btn btn-sm btn-danger btn-cancel-res" data-id="${res.IdReserva}">Cancelar</button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners for cancel buttons
            document.querySelectorAll('.btn-cancel-res').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const reason = prompt('Ingrese el motivo de la cancelación:');
                    if (reason) {
                        const id = e.target.getAttribute('data-id');
                        try {
                            await AdminService.cancelReservation(id, reason);
                            alert('Reserva cancelada');
                            AdminController.loadReservations();
                        } catch (error) {
                            alert('Error al cancelar reserva: ' + error.message);
                        }
                    }
                });
            });

        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Error loading reservations: ${error.message}</td></tr>`;
        }
    },

    // --- Payments (Invoices) ---
    loadInvoices: async () => {
        const tbody = document.querySelector('#payment-view-view tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

        try {
            const invoices = await AdminService.getInvoices();
            tbody.innerHTML = '';
            invoices.forEach(inv => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${inv.IdFactura}</td>
                    <td>${inv.ReservaId}</td>
                    <td>${new Date(inv.FechaEmision).toLocaleDateString()}</td>
                    <td>$${inv.Total}</td>
                    <td><span class="badge bg-success">Pagado</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading invoices: ${error.message}</td></tr>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminController.init();
});
