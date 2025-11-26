import { AdminService } from '../services/AdminService.js';
import { AuthService } from '../services/AuthService.js';

export const AdminController = {
    // Pagination state
    currentPage: 1,
    itemsPerPage: 30,
    // Pagination state
    currentPage: 1,
    itemsPerPage: 30,
    allUsers: [], // Store all users for client-side pagination
    currentTab: 'active', // 'active' or 'inactive'
    searchTerm: '', // Search term
    userToDeleteId: null, // Store ID for deletion confirmation

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

        // User Edit Form
        const userEditForm = document.querySelector('#user-edit-view form');
        if (userEditForm) {
            userEditForm.addEventListener('submit', AdminController.handleUpdateUser);
        }

        // Cancel Edit User
        const cancelEditBtn = document.querySelector('.btn-cancel-edit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                AdminController.switchView('user-manage-view');
            });
        }

        // Delete Confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', AdminController.handleDeleteUserConfirmed);
        }

        // Tab Switching
        const activeTab = document.getElementById('active-users-tab');
        const inactiveTab = document.getElementById('inactive-users-tab');

        if (activeTab) {
            activeTab.addEventListener('click', () => {
                AdminController.currentTab = 'active';
                AdminController.currentPage = 1;
                AdminController.renderUserTable();
            });
        }
        if (inactiveTab) {
            inactiveTab.addEventListener('click', () => {
                AdminController.currentTab = 'inactive';
                AdminController.currentPage = 1;
                AdminController.renderUserTable();
            });
        }

        // Search Input
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                AdminController.searchTerm = e.target.value.toLowerCase();
                AdminController.currentPage = 1;
                AdminController.renderUserTable();
            });
        }
    },

    // --- Users ---
    loadUsers: async () => {
        const tbody = document.querySelector('#user-manage-view tbody');
        tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

        try {
            // Fetch all users if not already fetched or force refresh
            // For simplicity, we fetch every time to get latest data
            const users = await AdminService.getUsers();
            AdminController.allUsers = users;
            AdminController.renderUserTable();
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users: ${error.message}</td></tr>`;
        }
    },

    renderUserTable: () => {
        const tbody = document.querySelector('#user-manage-view tbody');
        tbody.innerHTML = '';

        // Filter users based on current tab and search term
        // Filter users based on current tab and search term
        const filteredUsers = AdminController.allUsers.filter(user => {
            // 1. Filter by Tab (Active/Inactive)
            let isActive = true;
            // Check for various truthy/falsy values
            if (user.hasOwnProperty('Activo')) {
                isActive = user.Activo === true || user.Activo === 1 || user.Activo === 'true';
            } else if (user.hasOwnProperty('activo')) {
                isActive = user.activo === true || user.activo === 1 || user.activo === 'true';
            } else {
                // If neither property exists, assume active (or check deleted_at if available)
                isActive = true;
            }

            const matchesTab = AdminController.currentTab === 'active' ? isActive : !isActive;

            // 2. Filter by Search Term
            const matchesSearch = AdminController.searchTerm === '' ||
                (user.Nombre && user.Nombre.toLowerCase().includes(AdminController.searchTerm)) ||
                (user.Apellido && user.Apellido.toLowerCase().includes(AdminController.searchTerm)) ||
                (user.Email && user.Email.toLowerCase().includes(AdminController.searchTerm));

            return matchesTab && matchesSearch;
        });

        const startIndex = (AdminController.currentPage - 1) * AdminController.itemsPerPage;
        const endIndex = startIndex + AdminController.itemsPerPage;
        const usersToShow = filteredUsers.slice(startIndex, endIndex);

        if (usersToShow.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
            return;
        }

        usersToShow.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.IdUsuario || user.Id}</td>
                <td>${user.Nombre} ${user.Apellido}</td>
                <td>${user.Email || user.Correo}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-edit-user" data-id="${user.IdUsuario || user.Id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete-user" data-id="${user.IdUsuario || user.Id}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const user = AdminController.allUsers.find(u => (u.IdUsuario || u.Id) == id);
                AdminController.handleEditUser(user);
            });
        });

        tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                AdminController.confirmDeleteUser(id);
            });
        });

        AdminController.renderPagination();
    },

    renderPagination: () => {
        const paginationContainer = document.getElementById('user-pagination');
        paginationContainer.innerHTML = '';

        // Recalculate total pages based on filtered list
        // Recalculate total pages based on filtered list
        const filteredUsers = AdminController.allUsers.filter(user => {
            let isActive = true;
            // Check for various truthy/falsy values
            if (user.hasOwnProperty('Activo')) {
                isActive = user.Activo === true || user.Activo === 1 || user.Activo === 'true';
            } else if (user.hasOwnProperty('activo')) {
                isActive = user.activo === true || user.activo === 1 || user.activo === 'true';
            } else {
                isActive = true;
            }

            const matchesTab = AdminController.currentTab === 'active' ? isActive : !isActive;

            const matchesSearch = AdminController.searchTerm === '' ||
                (user.Nombre && user.Nombre.toLowerCase().includes(AdminController.searchTerm)) ||
                (user.Apellido && user.Apellido.toLowerCase().includes(AdminController.searchTerm)) ||
                (user.Email && user.Email.toLowerCase().includes(AdminController.searchTerm));

            return matchesTab && matchesSearch;
        });

        const totalPages = Math.ceil(filteredUsers.length / AdminController.itemsPerPage);

        if (totalPages <= 1) return;

        // Previous
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${AdminController.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.onclick = (e) => {
            e.preventDefault();
            if (AdminController.currentPage > 1) {
                AdminController.currentPage--;
                AdminController.renderUserTable();
            }
        };
        paginationContainer.appendChild(prevLi);

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${AdminController.currentPage === i ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                AdminController.currentPage = i;
                AdminController.renderUserTable();
            };
            paginationContainer.appendChild(li);
        }

        // Next
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${AdminController.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.onclick = (e) => {
            e.preventDefault();
            if (AdminController.currentPage < totalPages) {
                AdminController.currentPage++;
                AdminController.renderUserTable();
            }
        };
        paginationContainer.appendChild(nextLi);
    },

    handleEditUser: (user) => {
        AdminController.switchView('user-edit-view');
        document.getElementById('editUserId').value = user.IdUsuario || user.Id;
        document.getElementById('editUserName').value = user.Nombre;
        document.getElementById('editUserSurname').value = user.Apellido;
        document.getElementById('editUserEmail').value = user.Email || user.Correo;
        document.getElementById('editUserPassword').value = ''; // Reset password field
    },

    handleUpdateUser: async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const id = document.getElementById('editUserId').value;

        const userData = {
            Nombre: document.getElementById('editUserName').value,
            Apellido: document.getElementById('editUserSurname').value,
            Email: document.getElementById('editUserEmail').value
        };

        const password = document.getElementById('editUserPassword').value;
        if (password) {
            userData.Password = password;
        }

        try {
            submitBtn.disabled = true;
            await AdminService.updateUser(id, userData);
            alert('Usuario actualizado exitosamente');
            AdminController.switchView('user-manage-view');
        } catch (error) {
            alert('Error al actualizar usuario: ' + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    },

    confirmDeleteUser: (id) => {
        AdminController.userToDeleteId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
        modal.show();
    },

    handleDeleteUserConfirmed: async () => {
        if (!AdminController.userToDeleteId) return;

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        try {
            confirmBtn.disabled = true;
            await AdminService.deleteUser(AdminController.userToDeleteId);

            // Hide modal
            const modalEl = document.getElementById('deleteConfirmationModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            alert('Usuario eliminado (Estado cambiado a INACTIVO)');
            AdminController.loadUsers(); // Reload list
        } catch (error) {
            alert('Error al eliminar usuario: ' + error.message);
        } finally {
            confirmBtn.disabled = false;
            AdminController.userToDeleteId = null;
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
