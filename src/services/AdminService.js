import { config } from './config.js';

export const AdminService = {
    // Users
    getUsers: async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/usuarios/list`);
            if (!response.ok) throw new Error('Error al obtener usuarios');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getUsers error:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al crear usuario');
            return data;
        } catch (error) {
            console.error('AdminService.createUser error:', error);
            throw error;
        }
    },

    // Tours
    getTours: async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/search`);
            if (!response.ok) throw new Error('Error al obtener tours');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getTours error:', error);
            throw error;
        }
    },

    createTour: async (tourData) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tourData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al crear tour');
            return data;
        } catch (error) {
            console.error('AdminService.createTour error:', error);
            throw error;
        }
    }
};
