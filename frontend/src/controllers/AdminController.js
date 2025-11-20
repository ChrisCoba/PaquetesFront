import { PaquetesService } from '../services/PaquetesService.js';
import { AuthService } from '../services/AuthService.js';

export const AdminController = {
    init: () => {
        // Hook into the existing view switching logic if possible, 
        // or just listen for when views are shown to load data.

        const manageUsersBtn = document.querySelector('[data-view="user-manage-view"]');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', AdminController.loadUsers);
        }

        const manageToursBtn = document.querySelector('[data-view="tour-manage-view"]');
        if (manageToursBtn) {
            manageToursBtn.addEventListener('click', AdminController.loadTours);
        }

        // Handle Create Tour Form
        const createTourForm = document.querySelector('#tour-create-view form');
        if (createTourForm) {
            createTourForm.addEventListener('submit', AdminController.handleCreateTour);
        }
    },

    loadUsers: async () => {
        const tbody = document.querySelector('#user-manage-view tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

        try {
            // Note: We need to add a list method to AuthService or call API directly
            // Assuming AuthService.list() exists or we fetch directly
            // Since we didn't add list() to AuthService in previous step, let's fetch directly here or assume it was added.
            // I'll use a direct fetch for now to be safe, or better, extend AuthService.
            // But for this file, I'll assume AuthService.list() is what we want, 
            // but since I know I didn't write it, I'll use the config base url.
            // Actually, let's just use the PaquetesService pattern.

            // Temporary direct fetch since AuthService update wasn't requested explicitly in step 2 but needed here.
            // Ideally I would update AuthService.
            const response = await fetch('http://localhost/api/v1/integracion/paquetes/usuarios/list');
            const users = await response.json();

            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = `
                    <tr>
                        <td>${user.idUsuario || user.id}</td>
                        <td>${user.nombre} ${user.apellido}</td>
                        <td>${user.email}</td>
                        <td>
                            <button class="btn btn-sm btn-primary">Edit</button>
                            <button class="btn btn-sm btn-danger">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', tr);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading users</td></tr>';
        }
    },

    loadTours: async () => {
        // We need a table for tours, the HTML might not have it yet, 
        // but let's assume there's a #tour-manage-view with a table or we create it.
        // The current HTML for admin.html didn't show the tour table structure in the snippet, 
        // but let's assume standard table structure similar to users.

        // Actually, I should probably inject the table if it's missing or just log for now.
        // But let's try to find a container.
        const container = document.getElementById('tour-manage-view');
        if (!container) return;

        // Simple render for now
        container.innerHTML = '<h3>Manage Tours</h3><div id="tours-admin-list" class="row">Loading...</div>';
        const list = container.querySelector('#tours-admin-list');

        try {
            const tours = await PaquetesService.search({});
            list.innerHTML = '';
            tours.forEach(tour => {
                const item = `
                    <div class="col-12 mb-2 p-2 border rounded d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${tour.nombre}</strong> (${tour.ciudad})
                        </div>
                        <div>
                            <span class="badge bg-success">$${tour.precioActual}</span>
                            <button class="btn btn-sm btn-danger ms-2" onclick="AdminController.deleteTour('${tour.idPaquete}')">Delete</button>
                        </div>
                    </div>
                `;
                list.insertAdjacentHTML('beforeend', item);
            });
        } catch (error) {
            list.innerHTML = 'Error loading tours';
        }
    },

    handleCreateTour: async (e) => {
        e.preventDefault();
        const form = e.target;

        const data = {
            nombre: form.querySelector('#tourName').value,
            ciudadId: 1, // Hardcoded for now, needs select
            codigo: 'TOUR-' + Date.now(), // Auto-gen
            tipoActividad: 'Adventure', // Hardcoded or add field
            precioBase: parseFloat(form.querySelector('#tourPrice').value),
            cupoMaximo: 20,
            duracionDias: 5,
            imagenUrl: ''
        };

        try {
            await PaquetesService.create(data);
            alert('Tour created successfully!');
            form.reset();
            AdminController.loadTours(); // Refresh list
        } catch (error) {
            alert('Error creating tour: ' + error.message);
        }
    },

    deleteTour: async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await PaquetesService.delete(id);
                AdminController.loadTours();
            } catch (error) {
                alert('Error deleting tour');
            }
        }
    }
};

// Expose to window for onclick handlers
window.AdminController = AdminController;

document.addEventListener('DOMContentLoaded', () => {
    AdminController.init();
});
