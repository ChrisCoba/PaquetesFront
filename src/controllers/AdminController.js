import { AdminService } from '../services/AdminService.js';
import { AuthService } from '../services/AuthService.js';

export const AdminController = {
    init: () => {
        // Check if user is authenticated
        const user = AuthService.getCurrentUser();

        if (!user) {
            // Not logged in, redirect to login page
            alert('Debes iniciar sesión para acceder al panel de administración.');
            window.location.href = 'login.html';
            return;
        }

        // Check if user is admin
        if (user.Email !== 'admin@agencia.local') {
            // Not an admin, redirect to home page
            alert('No tienes permisos para acceder a esta página.');
            window.location.href = '../index.html';
            return;
        }

        // User is authenticated and is admin, proceed
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
            tourForm.addEventListener('submit', AdminController.handleSaveTour);
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

            // Add event listeners for user actions
            tbody.querySelectorAll('.btn-info').forEach(btn => {
                btn.addEventListener('click', () => alert('Funcionalidad de editar usuario en desarrollo'));
            });
            tbody.querySelectorAll('.btn-danger').forEach(btn => {
                btn.addEventListener('click', () => alert('Funcionalidad de eliminar usuario en desarrollo'));
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
        tbody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';

        try {
            const tours = await AdminService.getTours();
            tbody.innerHTML = '';
            tours.forEach(tour => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tour.IdPaquete}</td>
                    <td>${tour.Nombre}</td>
                    <td>${tour.Ciudad}</td>
                    <td>${tour.Pais || '-'}</td>
                    <td>${tour.TipoActividad}</td>
                    <td>${tour.Capacidad}</td>
                    <td>${tour.Duracion}</td>
                    <td>$${tour.PrecioActual}</td>
                    <td>
                        <button class="btn btn-sm btn-info btn-edit-tour" data-id="${tour.IdPaquete}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-delete-tour" data-id="${tour.IdPaquete}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners
            document.querySelectorAll('.btn-delete-tour').forEach(btn => {
                btn.addEventListener('click', AdminController.handleDeleteTour);
            });
            document.querySelectorAll('.btn-edit-tour').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const tour = tours.find(t => t.IdPaquete == id);
                    AdminController.handleEditTour(tour);
                });
            });

        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading tours: ${error.message}</td></tr>`;
        }
    },

    handleEditTour: (tour) => {
        // Switch to create view
        AdminController.switchView('tour-create-view');

        // Populate form
        document.getElementById('tourId').value = tour.IdPaquete;
        document.getElementById('tourName').value = tour.Nombre;
        document.getElementById('tourCode').value = ''; // Not available in GET response, user must re-enter or we assume
        document.getElementById('tourCityId').value = ''; // Not available in GET response
        document.getElementById('tourActivityType').value = tour.TipoActividad;
        document.getElementById('tourPrice').value = tour.PrecioActual;
        document.getElementById('tourCapacity').value = tour.Capacidad;
        document.getElementById('tourDuration').value = tour.Duracion;
        document.getElementById('tourImageUrl').value = tour.ImagenUrl;

        // Update UI for Edit mode
        document.querySelector('#tour-create-view h3').textContent = 'Editar Tour';
        document.getElementById('btn-save-tour').textContent = 'Actualizar Tour';
        document.getElementById('btn-cancel-tour').style.display = 'inline-block';

        // Add cancel listener
        document.getElementById('btn-cancel-tour').onclick = () => {
            AdminController.resetTourForm();
            AdminController.switchView('tour-manage-view');
        };
    },

    resetTourForm: () => {
        document.getElementById('tour-form').reset();
        document.getElementById('tourId').value = '';
        document.querySelector('#tour-create-view h3').textContent = 'Crear Nuevo Tour';
        document.getElementById('btn-save-tour').textContent = 'Crear Tour';
        document.getElementById('btn-cancel-tour').style.display = 'none';
    },

    handleSaveTour: async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-save-tour');
        const id = document.getElementById('tourId').value;

        const tourData = {
            Nombre: document.getElementById('tourName').value,
            Codigo: document.getElementById('tourCode').value,
            CiudadId: parseInt(document.getElementById('tourCityId').value),
            TipoActividad: document.getElementById('tourActivityType').value,
            PrecioBase: parseFloat(document.getElementById('tourPrice').value),
            CupoMaximo: parseInt(document.getElementById('tourCapacity').value),
            DuracionDias: parseInt(document.getElementById('tourDuration').value),
            ImagenUrl: document.getElementById('tourImageUrl').value
        };

        // Validation
        if (![1, 2].includes(tourData.CiudadId)) {
            alert('ID de Ciudad inválido. Debe ser 1 (San Juan) o 2 (Guayaquil).');
            return;
        }
        if (tourData.CupoMaximo < 1 || tourData.CupoMaximo > 30) {
            alert('El Cupo Máximo debe estar entre 1 y 30.');
            return;
        }
        if (tourData.DuracionDias < 1 || tourData.DuracionDias > 3) {
            alert('La Duración debe estar entre 1 y 3 días.');
            return;
        }
        if (isNaN(tourData.PrecioBase) || tourData.PrecioBase < 0) {
            alert('El Precio Base debe ser un número positivo.');
            return;
        }

        try {
            submitBtn.disabled = true;
            if (id) {
                // Update
                await AdminService.updateTour(id, tourData);
                alert('Tour actualizado exitosamente');
            } else {
                // Create
                await AdminService.createTour(tourData);
                alert('Tour creado exitosamente');
            }
            AdminController.resetTourForm();
            AdminController.switchView('tour-manage-view');
        } catch (error) {
            alert('Error al guardar tour: ' + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    },

    handleDeleteTour: async (e) => {
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
                    <td>${res.ClienteNombre}</td>
                    <td>${new Date(res.FechaCreacion).toLocaleDateString()}</td>
                    <td>${res.Estado || 'Pendiente'}</td>
                    <td>$${res.Total}</td>
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
