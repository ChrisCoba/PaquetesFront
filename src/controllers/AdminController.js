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
                    <td>$${tour.Precio}</td>
                    <td>
                        <button class="btn btn-sm btn-info">Editar</button>
                        <button class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminController.init();
});
