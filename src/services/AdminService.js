import { API_BASE_URL } from './config.js';

export const AdminService = {
    // Users
    getUsers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/list`);
            if (!response.ok) throw new Error('Error al obtener usuarios');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getUsers error:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
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
            const response = await fetch(`${API_BASE_URL}/search`);
            if (!response.ok) throw new Error('Error al obtener tours');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getTours error:', error);
            throw error;
        }
    },

    createTour: async (tourData) => {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
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
    },

    updateTour: async (id, tourData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tourData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar tour');
            return data;
        } catch (error) {
            console.error('AdminService.updateTour error:', error);
            throw error;
        }
    },

    deleteTour: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al eliminar tour');
            return data;
        } catch (error) {
            console.error('AdminService.deleteTour error:', error);
            throw error;
        }
    },

    // Reservations
    getReservations: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`);
            if (!response.ok) throw new Error('Error al obtener reservas');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getReservations error:', error);
            throw error;
        }
    },

    updateReservation: async (id, reservationData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar reserva');
            return data;
        } catch (error) {
            console.error('AdminService.updateReservation error:', error);
            throw error;
        }
    },

    cancelReservation: async (id, reason) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas/${id}/cancelar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Motivo: reason })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al cancelar reserva');
            return data;
        } catch (error) {
            console.error('AdminService.cancelReservation error:', error);
            throw error;
        }
    },

    // Payments (Facturas)
    getInvoices: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices/list`);
            if (!response.ok) throw new Error('Error al obtener facturas');
            return await response.json();
        } catch (error) {
            console.error('AdminService.getInvoices error:', error);
            throw error;
        }
    }
};
