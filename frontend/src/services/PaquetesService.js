import { API_BASE_URL } from './config';

export const PaquetesService = {
    /**
     * Search for packages
     * @param {Object} params - { city, fechainicio, tipoActividad, precioMax, sort }
     */
    async search(params) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/search?${query}`);
        if (!response.ok) throw new Error('Error fetching packages');
        return response.json();
    },

    /**
     * Create a new package
     * @param {Object} data 
     */
    async create(data) {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error creating package');
        return response.json(); // Assuming API returns the created object or success message
    },

    /**
     * Update a package
     * @param {string} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error updating package');
        return response.json();
    },

    /**
     * Delete a package
     * @param {string} id 
     */
    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting package');
        return response.json();
    }
};
